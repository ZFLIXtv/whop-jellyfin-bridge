import { NextRequest, NextResponse } from "next/server";
import { jfaRequest } from "@/lib/jfa/client";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const response = await jfaRequest({
      method: "GET",
      url: "/users",
    });

    return NextResponse.json({
      ok: true,
      status: response.status,
      dataType: Array.isArray(response.data?.users) ? "users-array" : typeof response.data,
      sample:
        Array.isArray(response.data?.users) && response.data.users.length > 0
          ? response.data.users[0]
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