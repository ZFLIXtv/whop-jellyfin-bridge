import { NextRequest, NextResponse } from "next/server";
import { extendUser30Days } from "@/lib/jfa/service";
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
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Missing userId" },
        { status: 400 }
      );
    }

    const data = await extendUser30Days(userId);

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