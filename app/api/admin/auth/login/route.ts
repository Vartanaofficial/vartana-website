import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";

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
    return NextResponse.json({ ok: false, message: "Permintaan login tidak valid." }, { status: 400 });
  }
}
