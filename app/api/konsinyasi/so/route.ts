import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCRIPT_URL = process.env.KONSINYASI_GOOGLE_SCRIPT_URL;

async function postToScript(action: string, payload: Record<string, unknown>) {
  if (!SCRIPT_URL) {
    return NextResponse.json({ success: false, message: "KONSINYASI_GOOGLE_SCRIPT_URL belum dikonfigurasi." }, { status: 500 });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, action }),
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    const raw = await res.text();
    try {
      return NextResponse.json(JSON.parse(raw), { status: res.ok ? 200 : res.status });
    } catch {
      return NextResponse.json({ success: false, message: "Respons Apps Script bukan JSON. Pastikan deployment terbaru aktif.", details: raw.slice(0, 400) }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? (e.name === "AbortError" ? "Apps Script timeout 25 detik." : e.message) : "Gagal menghubungi Apps Script.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") || "";
  const allowed = new Set(["getKonsinyasiSO", "getKonsinyasiMitra", "getKonsinyasiProduk", "getKonsinyasiPromo"]);
  if (!allowed.has(action)) {
    return NextResponse.json({ success: false, message: "Action GET Sales Order tidak diizinkan.", receivedAction: action || "(kosong)" }, { status: 400 });
  }
  if (!SCRIPT_URL) {
    return NextResponse.json({ success: false, message: "KONSINYASI_GOOGLE_SCRIPT_URL belum dikonfigurasi." }, { status: 500 });
  }
  const url = new URL(SCRIPT_URL);
  url.searchParams.set("action", action);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url.toString(), { method: "GET", cache: "no-store", redirect: "follow", signal: controller.signal });
    const raw = await res.text();
    try {
      return NextResponse.json(JSON.parse(raw), { status: res.ok ? 200 : res.status });
    } catch {
      return NextResponse.json({ success: false, message: "Respons Apps Script bukan JSON.", details: raw.slice(0, 400) }, { status: 502 });
    }
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        message: e instanceof Error ? (e.name === "AbortError" ? "Apps Script timeout 25 detik." : e.message) : "Gagal mengambil data.",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, message: "Payload JSON tidak valid." }, { status: 400 });
  }
  const action = String(body.action || "");
  // Action names aligned with the uploaded Apps Script handlers.
  const allowed = new Set(["saveKonsinyasiSO", "reviseKonsinyasiSO", "updateKonsinyasiSO", "deleteKonsinyasiSO", "completeKonsinyasiSO", "reactivateKonsinyasiSO", "registerKonsinyasiSOPrint"]);
  if (!allowed.has(action)) {
    return NextResponse.json({ success: false, message: "Action Sales Order tidak diizinkan.", receivedAction: action || "(kosong)" }, { status: 400 });
  }
  return postToScript(action, body);
}
