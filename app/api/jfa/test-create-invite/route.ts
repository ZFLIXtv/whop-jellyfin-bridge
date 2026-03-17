import { NextRequest, NextResponse } from "next/server";
import { createInvite30Days } from "@/lib/jfa/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Missing email" },
        { status: 400 }
      );
    }

    const data = await createInvite30Days(email);

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