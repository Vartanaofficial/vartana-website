import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Login/session/logout endpoints must remain reachable without an existing session.
  if (pathname.startsWith("/api/admin/auth/")) return NextResponse.next();

  const token = request.cookies.get("vartana_admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const authenticated = Boolean(token && secret && verifyAdminSessionToken(token, secret));

  if (authenticated) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL("/admin-access", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/konsinyasi/:path*"],
};
