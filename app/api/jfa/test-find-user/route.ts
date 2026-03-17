import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/jfa/service";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Missing email query param" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    return NextResponse.json({
      ok: true,
      found: !!user,
      user,
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