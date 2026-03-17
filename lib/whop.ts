export type ParsedWhopPayment = {
  eventId: string;
  eventType: string;
  productId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  paymentId: string | null;
  amount: number | null;
  currency: string | null;
};

export function parseWhopPayload(payload: any): ParsedWhopPayment {
  return {
    eventId: payload?.id || payload?.event_id || crypto.randomUUID(),
    eventType: payload?.type || payload?.event || "unknown",

    productId:
      payload?.data?.product?.id ||
      payload?.data?.product_id ||
      payload?.product_id ||
      null,

    customerName:
      payload?.data?.user?.email ||
      payload?.data?.user?.username ||
      payload?.data?.user?.name ||
      payload?.data?.customer_name ||
      payload?.data?.name ||
      payload?.data?.email ||
      null,

    customerEmail:
      payload?.data?.user?.email ||
      payload?.data?.email ||
      null,

    paymentId:
      payload?.data?.id ||
      payload?.data?.payment_id ||
      payload?.payment_id ||
      null,

    amount:
      typeof payload?.data?.total === "number"
        ? payload.data.total
        : typeof payload?.data?.amount === "number"
        ? payload.data.amount
        : null,

    currency:
      typeof payload?.data?.currency === "string"
        ? payload.data.currency
        : null,
  };
}