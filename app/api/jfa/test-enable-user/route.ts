import { NextRequest, NextResponse } from "next/server";
import { enableUser } from "@/lib/jfa/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const data = await enableUser(userId);

    return NextResponse.json({
      ok: true,
      data,
    });
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