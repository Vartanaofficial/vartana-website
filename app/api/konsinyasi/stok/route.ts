import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const SCRIPT_URL = (process.env.KONSINYASI_GOOGLE_SCRIPT_URL || "").trim();
const GET_ACTIONS = new Set(["getKonsinyasiPenjualanMitra", "getKonsinyasiSO", "getKonsinyasiMitra"]);
const POST_ACTIONS = new Set(["saveKonsinyasiPenjualanMitra"]);
function fail(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}
async function forward(method: "GET" | "POST", action: string, body?: Record<string, unknown>) {
  if (!SCRIPT_URL) return fail("KONSINYASI_GOOGLE_SCRIPT_URL belum dikonfigurasi.");
  let target: URL;
  try {
    target = new URL(SCRIPT_URL);
  } catch {
    return fail("KONSINYASI_GOOGLE_SCRIPT_URL tidak valid.");
  }
  target.searchParams.set("action", action);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(target.toString(), {
      method,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      ...(method === "POST" ? { headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...(body || {}), action }) } : {}),
    });
    const raw = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, message: "Respons Apps Script bukan JSON valid.", upstreamStatus: response.status, preview: raw.slice(0, 250) }, { status: 502 });
    }
    return NextResponse.json(payload, { status: response.ok ? 200 : 502 });
  } catch (error) {
    return fail(error instanceof Error && error.name === "AbortError" ? "Apps Script timeout setelah 25 detik." : error instanceof Error ? error.message : "Gagal menghubungi Apps Script.", 502);
  } finally {
    clearTimeout(timer);
  }
}
export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action") || "getKonsinyasiPenjualanMitra";
  if (!GET_ACTIONS.has(action)) return fail("Action GET tidak diizinkan.", 400);
  return forward("GET", action);
}
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Payload JSON tidak valid.", 400);
  }
  const action = String(body.action || "");
  if (!POST_ACTIONS.has(action)) return fail("Action POST tidak diizinkan.", 400);
  return forward("POST", action, body);
}
