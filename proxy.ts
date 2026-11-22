import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";
import {sameOriginRequest} from './lib/request-origin';
import {checkRateLimit, rateBucket, requestBodyWithinLimit, requestClient} from './lib/security-rate-limit';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApi = pathname.startsWith('/api/');
  const internal = pathname.startsWith('/api/admin/') || pathname.startsWith('/api/konsinyasi');
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  function forward() {
    const response = NextResponse.next();
    if (internal) response.headers.set('Cache-Control', 'no-store, private');
    return response;
  }
  if(['/api/payments/doku/notification','/api/payments/midtrans/notification'].includes(pathname)&&request.method==='POST'){
    if(!await requestBodyWithinLimit(request))return NextResponse.json({message:'Payload too large'},{status:413});
    return forward(); // Each notification route verifies its provider signature before any private RPC.
  }
  if (isApi && mutation) {
    if (!sameOriginRequest(request)) return NextResponse.json({message: 'Asal permintaan tidak valid.'}, {status: 403});
    if (!await requestBodyWithinLimit(request)) return NextResponse.json({message: 'Data permintaan terlalu besar.'}, {status: 413});
  }

  // Persistent quotas also apply to requests handled by different server instances.
  if (isApi && !internal) {
    try {
      const quota = await checkRateLimit([
        rateBucket('public-api-client', requestClient(request), 300, 60000),
        rateBucket('public-api-path', requestClient(request) + ':' + pathname, mutation ? 60 : 200, 60000),
      ]);
      if (!quota.allowed) return NextResponse.json({message: 'Terlalu banyak permintaan. Coba lagi sebentar.'}, {
        status: 429, headers: {'Retry-After': String(quota.retryAfter), 'Cache-Control': 'no-store'},
      });
    } catch {
      return NextResponse.json({message: 'Pemeriksaan keamanan belum tersedia. Coba lagi sebentar.'}, {status: 503});
    }
    return forward();
  }

  // Login/session/logout endpoints must remain reachable without an existing session.
  if (pathname.startsWith("/api/admin/auth/")) return forward();

  const token = request.cookies.get("vartana_admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  const authenticated = Boolean(token && secret && verifyAdminSessionToken(token, secret));

  if (authenticated) return forward();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const loginUrl = new URL("/admin-access", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
