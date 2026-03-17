import { NextResponse } from "next/server";
import { jfaClient } from "@/lib/jfa/client";

export async function GET() {
  try {
    const response = await jfaClient.get("/users");

    return NextResponse.json({
      ok: true,
      status: response.status,
      dataType: Array.isArray(response.data) ? "array" : typeof response.data,
      sample:
        Array.isArray(response.data) && response.data.length > 0
          ? response.data[0]
          : response.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        status: error?.response?.status ?? 500,
        message: error?.message ?? "Unknown error",
        data: error?.response?.data ?? null,
      },
      { status: 500 }
    );
  }
}