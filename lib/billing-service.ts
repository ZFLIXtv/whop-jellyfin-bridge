import { db } from "@/lib/db";
import {
  createInvite30Days,
  enableUser,
  extendUser30Days,
  findUserByName,
} from "@/lib/jfa/service";

type ProcessPaymentInput = {
  customerName: string;
  sourceEventId?: string;
};

export async function processPayment(input: ProcessPaymentInput) {
  const customerName = input.customerName.trim();

  if (!customerName) {
    throw new Error("customerName is required");
  }

  const existingUser = await findUserByName(customerName);

  if (!existingUser) {
    const inviteResult = await createInvite30Days(customerName);

    await db.query(
      `
      INSERT INTO action_logs (email, action, source_event_id, status, details)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        customerName,
        "invite_created",
        input.sourceEventId || null,
        "success",
        "Created 30-day invite for new customer",
      ]
    );

    return {
      ok: true,
      action: "invite_created",
      customerName,
      inviteResult,
    };
  }

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

  await db.query(
    `
    INSERT INTO action_logs (email, action, source_event_id, status, details)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      customerName,
      "user_extended_30_days",
      input.sourceEventId || null,
      "success",
      `Extended user ${existingUser.id} by 30 days`,
    ]
  );

  return {
    ok: true,
    action: existingUser.disabled ? "enabled_and_extended" : "extended",
    customerName,
    userId: existingUser.id,
    extendResult,
  };
}