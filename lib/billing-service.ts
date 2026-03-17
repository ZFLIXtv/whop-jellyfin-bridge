import { db } from "@/lib/db";
import { env } from "@/lib/env";
import {
  createInvite30Days,
  createInvite5Days,
  enableUser,
  extendUser30Days,
  findActiveInviteByEmail,
  findUserByIdentity,
} from "@/lib/jfa/service";

type ProcessPaymentInput = {
  customerName: string;
  productId: string;
  sourceEventId?: string;
};

export async function processPayment(input: ProcessPaymentInput) {
  const customerName = input.customerName.trim();

  if (!customerName) {
    throw new Error("customerName is required");
  }

  if (!input.productId) {
    throw new Error("productId is required");
  }

  const isPaid = input.productId === env.WHOP_PRODUCT_ID_PAID;
  const isTrial = input.productId === env.WHOP_PRODUCT_ID_TRIAL;

  if (!isPaid && !isTrial) {
    throw new Error("Unknown productId");
  }

  const existingUser = await findUserByIdentity(customerName);

  // TRIAL
  if (isTrial) {
    if (existingUser) {
      await db.query(
        `
        INSERT INTO action_logs (email, action, source_event_id, status, details)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          customerName,
          "trial_ignored_existing_user",
          input.sourceEventId || null,
          "success",
          `Trial ignored because user already exists (${existingUser.id})`,
        ]
      );

      return {
        ok: true,
        action: "trial_ignored_existing_user",
        customerName,
        userId: existingUser.id,
      };
    }

    const existingInvite = await findActiveInviteByEmail(customerName);

    if (existingInvite) {
      await db.query(
        `
        INSERT INTO action_logs (email, action, source_event_id, status, details)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          customerName,
          "trial_ignored_existing_invite",
          input.sourceEventId || null,
          "success",
          `Trial ignored because active invite already exists (${existingInvite.code || "no-code"})`,
        ]
      );

      return {
        ok: true,
        action: "trial_ignored_existing_invite",
        customerName,
        inviteCode: existingInvite.code || null,
      };
    }

    const inviteResult = await createInvite5Days(customerName);

    await db.query(
      `
      INSERT INTO action_logs (email, action, source_event_id, status, details)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        customerName,
        "invite_created_5_days",
        input.sourceEventId || null,
        "success",
        "Created 5-day invite for trial customer",
      ]
    );

    return {
      ok: true,
      action: "invite_created_5_days",
      customerName,
      inviteResult,
    };
  }

  // PAID
  if (existingUser) {
    if (existingUser.disabled) {
      await enableUser(existingUser.id);

      await db.query(
        `
        INSERT INTO action_logs (email, action, source_event_id, status, details)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          customerName,
          "user_enabled",
          input.sourceEventId || null,
          "success",
          `Re-enabled disabled user ${existingUser.id}`,
        ]
      );
    }

    const extendResult = await extendUser30Days(existingUser.id);

    const action = existingUser.disabled
      ? "enabled_and_extended_30_days"
      : "extended_30_days";

    await db.query(
      `
      INSERT INTO action_logs (email, action, source_event_id, status, details)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        customerName,
        action,
        input.sourceEventId || null,
        "success",
        `Extended user ${existingUser.id} by 30 days`,
      ]
    );

    return {
      ok: true,
      action,
      customerName,
      userId: existingUser.id,
      extendResult,
    };
  }

  const existingInvite = await findActiveInviteByEmail(customerName);

  if (existingInvite) {
    await db.query(
      `
      INSERT INTO action_logs (email, action, source_event_id, status, details)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        customerName,
        "paid_ignored_existing_invite",
        input.sourceEventId || null,
        "success",
        `Paid purchase ignored because active invite already exists (${existingInvite.code || "no-code"})`,
      ]
    );

    return {
      ok: true,
      action: "paid_ignored_existing_invite",
      customerName,
      inviteCode: existingInvite.code || null,
    };
  }

  const inviteResult = await createInvite30Days(customerName);

  await db.query(
    `
    INSERT INTO action_logs (email, action, source_event_id, status, details)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      customerName,
      "invite_created_30_days",
      input.sourceEventId || null,
      "success",
      "Created 30-day invite for paid customer",
    ]
  );

  return {
    ok: true,
    action: "invite_created_30_days",
    customerName,
    inviteResult,
  };
}