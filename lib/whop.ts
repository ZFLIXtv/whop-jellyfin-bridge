export type ParsedWhopPayment = {
  eventId: string;
  eventType: string;
  productId: string | null;
  customerName: string | null;
  paymentId: string | null;
  amount: number | null;
  currency: string | null;
};

export function parseWhopPayload(payload: any): ParsedWhopPayment {
  return {
    eventId:
      payload?.id ||
      payload?.event_id ||
      payload?.data?.id ||
      crypto.randomUUID(),
    eventType: payload?.type || payload?.event || "unknown",
    productId:
      payload?.data?.product_id ||
      payload?.data?.product?.id ||
      payload?.product_id ||
      null,
    customerName:
      payload?.data?.customer_name ||
      payload?.data?.name ||
      payload?.data?.username ||
      payload?.data?.email ||
      null,
    paymentId:
      payload?.data?.payment_id ||
      payload?.data?.id ||
      payload?.payment_id ||
      null,
    amount:
      typeof payload?.data?.amount === "number" ? payload.data.amount : null,
    currency:
      typeof payload?.data?.currency === "string" ? payload.data.currency : null,
  };
}