import { NextRequest, NextResponse } from "next/server";
import { processPayment } from "@/lib/billing-service";
import { isAdminRequest } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

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