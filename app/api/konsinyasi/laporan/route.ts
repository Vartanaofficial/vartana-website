import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SCRIPT_URL = (process.env.KONSINYASI_GOOGLE_SCRIPT_URL || "").trim();
const TIMEOUT_MS = 25_000;
const ALLOWED = new Set(["getKonsinyasiLaporan"]);
function fail(message: string, status = 500, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}
export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action") || "getKonsinyasiLaporan";
  if (!ALLOWED.has(action)) return fail("Action laporan konsinyasi tidak diizinkan.", 400, { receivedAction: action, allowedActions: [...ALLOWED] });
  if (!SCRIPT_URL) return fail("KONSINYASI_GOOGLE_SCRIPT_URL belum dikonfigurasi.");
  let target: URL;
  try {
    target = new URL(SCRIPT_URL);
  } catch {
    return fail("KONSINYASI_GOOGLE_SCRIPT_URL bukan URL valid.");
  }
  if (target.protocol !== "https:" || !target.hostname.endsWith("google.com")) return fail("URL Apps Script tidak valid.");
  target.searchParams.set("action", action);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await fetch(target.toString(), { method: "GET", cache: "no-store", redirect: "follow", signal: controller.signal });
    const raw = await upstream.text();
    if (!raw.trim()) return fail("Apps Script mengembalikan respons kosong. Pastikan doGet menangani getKonsinyasiLaporan dan deployment Web App sudah diperbarui.", 502, { upstreamStatus: upstream.status });
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return fail("Respons Apps Script bukan JSON valid.", 502, { upstreamStatus: upstream.status, responsePreview: raw.slice(0, 300) });
    }
    if (!upstream.ok) return fail(`Apps Script merespons HTTP ${upstream.status}.`, 502, { data: payload });
    if (typeof payload === "object" && payload !== null && "success" in payload && (payload as { success?: unknown }).success === false) return NextResponse.json(payload, { status: 502 });
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError" ? "Apps Script timeout setelah 25 detik." : error instanceof Error ? `Gagal menghubungi Apps Script: ${error.message}` : "Gagal menghubungi Apps Script.";
    return fail(message, 502);
  } finally {
    clearTimeout(timeout);
  }
}
