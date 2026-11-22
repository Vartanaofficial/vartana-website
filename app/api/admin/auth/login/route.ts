import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, verifyAdminCredentials } from "@/lib/admin-auth";
import {checkRateLimit, rateBucket, requestClient} from '@/lib/security-rate-limit';

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ok: false, message: 'Data login belum terbaca. Muat ulang halaman lalu coba lagi.'}, {status: 400});
  }
  try {
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (username.length > 254 || password.length > 256) {
      return NextResponse.json({ok: false, message: 'Data login tidak valid.'}, {status: 400});
    }
    const limit = await checkRateLimit([
      rateBucket('admin-login-account', username.toLowerCase(), 10, 900000),
      rateBucket('admin-login-client', requestClient(request), 40, 900000),
      rateBucket('admin-login-global', 'all', 200, 3600000),
    ]);
    if (!limit.allowed) return NextResponse.json({ok: false, message: 'Terlalu banyak percobaan masuk. Coba kembali nanti.'}, {
      status: 429, headers: {'Retry-After': String(limit.retryAfter), 'Cache-Control': 'no-store'},
    });

    if (!username || !password) {
      return NextResponse.json({ ok: false, message: "Masukkan username dan password." }, { status: 400 });
    }

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json({ ok: false, message: "Username atau password salah." }, { status: 401 });
    }

    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret || secret.length < 32) {
      console.error("ADMIN_SESSION_SECRET belum dikonfigurasi dengan benar.");
      return NextResponse.json({ ok: false, message: "Konfigurasi keamanan server belum lengkap." }, { status: 500 });
    }

    const token = createAdminSessionToken(username, secret);
    const response = NextResponse.json({ ok: true, message: "Login berhasil." });
    response.cookies.set("vartana_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch {
    return NextResponse.json({ok: false, message: 'Pemeriksaan keamanan login belum tersedia. Coba lagi sebentar.'}, {status: 503});
  }
}
