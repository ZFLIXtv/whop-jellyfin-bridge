import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasBaseUrl: !!env.JFA_BASE_URL,
    hasUsername: !!env.JFA_USERNAME,
    hasPassword: !!env.JFA_PASSWORD,
    baseUrlPreview: env.JFA_BASE_URL ? env.JFA_BASE_URL.slice(0, 30) : "",
  });
}