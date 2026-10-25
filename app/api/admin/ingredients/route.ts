import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ApiRecord = Record<string, unknown>;
const TIMEOUT_MS = 30000;

function isAdmin(request: NextRequest): boolean {
  const token = request.cookies.get("vartana_admin_session")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(token && secret && secret.length >= 32 && verifyAdminSessionToken(token, secret));
}

function getScriptUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "script.google.com") return null;
    return url;
  } catch {
    return null;
  }
}

async function requestScript(url: URL, init?: RequestInit): Promise<ApiRecord> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url.toString(), {
      ...init,
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Apps Script HTTP ${response.status}`);
    try {
      return JSON.parse(text) as ApiRecord;
    } catch {
      throw new Error("Respons Apps Script bukan JSON.");
    }
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Sesi admin tidak valid." }, { status: 401 });
  }

  const url = getScriptUrl();
  if (!url) {
    return NextResponse.json({ success: false, message: "Konfigurasi Apps Script tidak tersedia." }, { status: 500 });
  }

  url.searchParams.set("action", "getIngredients");

  try {
    const data = await requestScript(url);
    if (data.success === false) {
      return NextResponse.json({ success: false, message: String(data.message || "Gagal membaca bahan.") }, { status: 502 });
    }
    return NextResponse.json({
      success: true,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    });
  } catch (error) {
    console.error("Admin ingredients GET failed:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil daftar bahan dari Spreadsheet." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: "Sesi admin tidak valid." }, { status: 401 });
  }

  const url = getScriptUrl();
  if (!url) {
    return NextResponse.json({ success: false, message: "Konfigurasi Apps Script tidak tersedia." }, { status: 500 });
  }

  let body: ApiRecord;
  try {
    body = await request.json() as ApiRecord;
  } catch {
    return NextResponse.json({ success: false, message: "Format data tidak valid." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name || name.length > 100) {
    return NextResponse.json({ success: false, message: "Nama bahan wajib diisi, maksimal 100 karakter." }, { status: 400 });
  }

  try {
    const result = await requestScript(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "saveIngredient", name }),
    });

    if (result.success !== true) {
      return NextResponse.json(
        { success: false, message: String(result.message || "Apps Script menolak penyimpanan bahan.") },
        { status: 502 },
      );
    }

    // Ambil daftar terbaru supaya UI menggunakan daftar yang benar-benar tersimpan.
    const readUrl = new URL(url);
    readUrl.searchParams.set("action", "getIngredients");
    const latest = await requestScript(readUrl);

    return NextResponse.json({
      success: true,
      message: String(result.message || "Bahan berhasil disimpan."),
      name: String(result.name || name),
      ingredients: Array.isArray(latest.ingredients) ? latest.ingredients : [],
    });
  } catch (error) {
    console.error("Admin ingredients POST failed:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan bahan ke Spreadsheet." }, { status: 502 });
  }
}
