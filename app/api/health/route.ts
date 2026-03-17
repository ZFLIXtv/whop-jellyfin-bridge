import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const result = await db.query("SELECT NOW() as now");
    return NextResponse.json({
      ok: true,
      service: "whop-jellyfin-bridge",
      db: true,
      now: result.rows[0]?.now ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "whop-jellyfin-bridge",
        db: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}