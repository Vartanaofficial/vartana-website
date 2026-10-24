import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("vartana_admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const authenticated = Boolean(token && secret && verifyAdminSessionToken(token, secret));
  return NextResponse.json({ authenticated });
}
