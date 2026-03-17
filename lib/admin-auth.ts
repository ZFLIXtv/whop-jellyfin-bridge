import { NextRequest } from "next/server";
import { env } from "@/lib/env";

export function isAdminRequest(request: NextRequest) {
  const header = request.headers.get("x-admin-key");
  return !!header && header === env.ADMIN_API_KEY;
}