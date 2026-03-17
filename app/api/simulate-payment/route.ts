import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/billing-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const customerName = body?.customerName;

    if (!customerName) {
      return NextResponse.json(
        { ok: false, message: "Missing customerName" },
        { status: 400 }
      );
    }

    const result = await processPayment({
      customerName,
      sourceEventId: "manual-test",
    });

    return NextResponse.json(result);
  } catch (error: any) {
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