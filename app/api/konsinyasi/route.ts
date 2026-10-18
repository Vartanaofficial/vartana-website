import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCRIPT_URL = (process.env.KONSINYASI_GOOGLE_SCRIPT_URL || "").trim();
const TIMEOUT_MS = 25_000;

// Hanya izinkan action yang diperlukan modul Stok Mitra.
const GET_ACTIONS = new Set(["getKonsinyasiStok", "getKonsinyasiMitra", "getKonsinyasiProduk", "getKonsinyasiSO", "getKonsinyasiPengiriman"]);

const POST_ACTIONS = new Set(["saveKonsinyasiMutasiStok"]);

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, message }, { status });
}

function getScriptUrl() {
  if (!SCRIPT_URL) {
    throw new Error("KONSINYASI_GOOGLE_SCRIPT_URL belum dikonfigurasi.");
  }

  const url = new URL(SCRIPT_URL);

  if (url.protocol !== "https:" || !url.hostname.endsWith("google.com")) {
    throw new Error("URL Apps Script tidak valid. Periksa KONSINYASI_GOOGLE_SCRIPT_URL.");
  }

  return url;
}

async function callAppsScript(action: string, method: "GET" | "POST", body?: Record<string, unknown>) {
  const url = getScriptUrl();

  if (method === "GET") {
    url.searchParams.set("action", action);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method,
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
      ...(method === "POST"
        ? {
            headers: {
              "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({
              ...(body || {}),
              action,
            }),
          }
        : {}),
    });

    const raw = await response.text();

    if (!raw.trim()) {
      return errorResponse("Apps Script mengembalikan respons kosong. Periksa dispatcher dan deployment Web App.", 502);
    }

    let payload: unknown;

    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Respons Apps Script bukan JSON valid. Periksa dispatcher dan deployment Web App.",
          upstreamStatus: response.status,
          responsePreview: raw.slice(0, 300),
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Apps Script merespons HTTP ${response.status}.`,
          data: payload,
        },
        { status: 502 },
      );
    }

    const failed = typeof payload === "object" && payload !== null && "success" in payload && (payload as { success?: unknown }).success === false;

    return NextResponse.json(payload, {
      status: failed ? 502 : 200,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action") || "getKonsinyasiStok";

  if (!GET_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        success: false,
        message: "Action GET Stok Mitra tidak diizinkan.",
        receivedAction: action,
        allowedActions: [...GET_ACTIONS],
      },
      { status: 400 },
    );
  }

  try {
    return await callAppsScript(action, "GET");
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError" ? "Apps Script timeout setelah 25 detik." : error instanceof Error ? error.message : "Gagal menghubungi Apps Script.";

    return errorResponse(message, 502);
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    const parsed: unknown = await request.json();

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return errorResponse("Payload harus berupa object JSON.", 400);
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return errorResponse("Payload JSON tidak valid.", 400);
  }

  const action = String(body.action || "");

  if (!POST_ACTIONS.has(action)) {
    return NextResponse.json(
      {
        success: false,
        message: "Action POST Stok Mitra tidak diizinkan.",
        receivedAction: action || "(kosong)",
        allowedActions: [...POST_ACTIONS],
      },
      { status: 400 },
    );
  }

  try {
    return await callAppsScript(action, "POST", body);
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError" ? "Apps Script timeout setelah 25 detik." : error instanceof Error ? error.message : "Gagal menghubungi Apps Script.";

    return errorResponse(message, 502);
  }
}
