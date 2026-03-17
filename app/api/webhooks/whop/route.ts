import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/billing-service";
import {
  createWebhookEvent,
  findWebhookEventByWhopId,
  updateWebhookEventStatus,
} from "@/lib/webhook-events";
import { parseWhopPayload } from "@/lib/whop";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  let payload: any = null;

  try {
    payload = await request.json();

    const parsed = parseWhopPayload(payload);

    if (!parsed.eventId) {
      return NextResponse.json(
        { ok: false, message: "Missing event id" },
        { status: 400 }
      );
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

    const result = await processPayment({
      customerName: parsed.customerName,
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