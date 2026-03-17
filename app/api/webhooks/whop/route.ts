import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/billing-service";
import {
  createWebhookEvent,
  findWebhookEventByWhopId,
  updateWebhookEventStatus,
} from "@/lib/webhook-events";
import { parseWhopPayload } from "@/lib/whop";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  let payload: any = null;

  try {
    const webhookId = request.headers.get("webhook-id");
    const webhookSignature = request.headers.get("webhook-signature");
    const webhookTimestamp = request.headers.get("webhook-timestamp");

if (!webhookId || !webhookSignature || !webhookTimestamp) {
  return NextResponse.json(
    { ok: false, message: "Missing Whop webhook headers" },
    { status: 401 }
  );
}

    payload = await request.json();

    const parsed = parseWhopPayload(payload);
    const allowedEventTypes = ["payment.succeeded"];

if (!allowedEventTypes.includes(parsed.eventType)) {
  return NextResponse.json({
    ok: true,
    ignored: true,
    message: `Webhook ignored: unsupported event type ${parsed.eventType}`,
  });
}

    if (!parsed.eventId) {
      return NextResponse.json(
        { ok: false, message: "Missing event id" },
        { status: 400 }
      );
    }

const allowedProductIds = [
  env.WHOP_PRODUCT_ID_PAID,
  env.WHOP_PRODUCT_ID_TRIAL,
];



if (!parsed.productId || !allowedProductIds.includes(parsed.productId)) {
  return NextResponse.json({
    ok: true,
    ignored: true,
    message: "Webhook ignored: product mismatch",
    debug: {
      parsedProductId: parsed.productId,
      paidProductId: env.WHOP_PRODUCT_ID_PAID,
      trialProductId: env.WHOP_PRODUCT_ID_TRIAL,
      eventType: parsed.eventType,
      payloadKeys: Object.keys(payload || {}),
      dataKeys: Object.keys(payload?.data || {}),
      data: payload?.data || null,
    },
  });
}

    const existing = await findWebhookEventByWhopId(parsed.eventId);

    if (existing) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        message: "Webhook already processed",
      });
    }

    await createWebhookEvent({
      whopEventId: parsed.eventId,
      eventType: parsed.eventType,
      status: "processing",
      rawPayload: payload,
    });

    if (!parsed.customerName) {
      await updateWebhookEventStatus({
        whopEventId: parsed.eventId,
        status: "failed",
        errorMessage: "Missing customerName in payload",
      });

      return NextResponse.json(
        { ok: false, message: "Missing customerName in payload" },
        { status: 400 }
      );
    }
    if (parsed.paymentId) {
  const existingPayment = await db.query(
    `
    SELECT id
    FROM payments
    WHERE whop_payment_id = $1
    LIMIT 1
    `,
    [parsed.paymentId]
  );

  if (existingPayment.rows.length > 0) {
    return NextResponse.json({
      ok: true,
      duplicate: true,
      message: "Payment already processed",
    });
  }
}

    const result = await processPayment({
      customerName: parsed.customerName,
      productId: parsed.productId,
      sourceEventId: parsed.eventId,
    });

    await db.query(
      `
      INSERT INTO payments (
        whop_payment_id,
        whop_event_id,
        email,
        product_id,
        amount,
        currency,
        payment_status,
        processed_action
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        parsed.paymentId,
        parsed.eventId,
        parsed.customerName,
        parsed.productId,
        parsed.amount,
        parsed.currency,
        "processed",
        result.action,
      ]
    );

    await updateWebhookEventStatus({
      whopEventId: parsed.eventId,
      status: "processed",
      errorMessage: null,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error: any) {
    const parsed = payload ? parseWhopPayload(payload) : null;
    console.log("WHOP RAW PAYLOAD:", JSON.stringify(payload, null, 2));
console.log("WHOP PARSED:", parsed);
console.log("WHOP_PRODUCT_ID_PAID:", env.WHOP_PRODUCT_ID_PAID);
console.log("WHOP_PRODUCT_ID_TRIAL:", env.WHOP_PRODUCT_ID_TRIAL);

    if (parsed?.eventId) {
      await updateWebhookEventStatus({
        whopEventId: parsed.eventId,
        status: "failed",
        errorMessage: error?.message ?? "Unknown error",
      });
    }

    return NextResponse.json(
      {
        ok: false,
        message: error?.message ?? "Unknown error",
        data: error?.response?.data ?? null,
      },
      { status: 500 }
    );
  }
}