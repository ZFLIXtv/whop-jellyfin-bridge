import { NextResponse } from "next/server";
import axios from "axios";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const basicAuth = Buffer.from(
      `${env.JFA_USERNAME}:${env.JFA_PASSWORD}`
    ).toString("base64");

    const response = await axios.get(`${env.JFA_BASE_URL}/token/login`, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
      },
      timeout: 15000,
    });

    return NextResponse.json({
      ok: true,
      status: response.status,
      hasToken: !!response.data?.token,
      tokenPreview:
        typeof response.data?.token === "string"
          ? response.data.token.slice(0, 20)
          : null,
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