import { db } from "@/lib/db";

export async function findWebhookEventByWhopId(whopEventId: string) {
  const result = await db.query(
    `
    SELECT *
    FROM webhook_events
    WHERE whop_event_id = $1
    LIMIT 1
    `,
    [whopEventId]
  );

  return result.rows[0] ?? null;
}

export async function createWebhookEvent(params: {
  whopEventId: string;
  eventType: string;
  status: string;
  rawPayload: unknown;
}) {
  const result = await db.query(
    `
    INSERT INTO webhook_events (
      whop_event_id,
      event_type,
      status,
      raw_payload
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [
      params.whopEventId,
      params.eventType,
      params.status,
      JSON.stringify(params.rawPayload),
    ]
  );

  return result.rows[0];
}

export async function updateWebhookEventStatus(params: {
  whopEventId: string;
  status: string;
  errorMessage?: string | null;
}) {
  const result = await db.query(
    `
    UPDATE webhook_events
    SET
      status = $2,
      error_message = $3,
      processed_at = NOW()
    WHERE whop_event_id = $1
    RETURNING *
    `,
    [params.whopEventId, params.status, params.errorMessage ?? null]
  );

  return result.rows[0] ?? null;
}