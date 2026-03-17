import { NextRequest, NextResponse } from "next/server";
import { findUserByName } from "@/lib/jfa/service";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const name = request.nextUrl.searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        { ok: false, message: "Missing name query param" },
        { status: 400 }
      );
    }

    const user = await findUserByName(name);

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