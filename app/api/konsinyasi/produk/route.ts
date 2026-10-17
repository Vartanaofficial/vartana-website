import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const allowed = new Set([
  "getKonsinyasiProduk",
  "saveKonsinyasiProduk",
  "updateKonsinyasiProduk",
]);

function getScriptUrl() {
  return (process.env.KONSINYASI_GOOGLE_SCRIPT_URL || "").trim();
}

async function forward(action: string, data?: Record<string, unknown>) {
  const scriptUrl = getScriptUrl();

  if (!scriptUrl) {
    return NextResponse.json(
      { success: false, message: "URL Apps Script belum dikonfigurasi." },
      { status: 500 }
    );
  }

  const url = new URL(scriptUrl);
  const isGet = !data;

  if (isGet) url.searchParams.set("action", action);

  try {
    const response = await fetch(url.toString(), {
      method: isGet ? "GET" : "POST",
      headers: isGet ? undefined : { "Content-Type": "text/plain;charset=utf-8" },
      body: isGet ? undefined : JSON.stringify({ ...data, action }),
      cache: "no-store",
      redirect: "follow",
      signal: AbortSignal.timeout(20000),
    });

    const raw = await response.text();

    let result: unknown;
    try {
      result = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { success: false, message: "Apps Script belum mengembalikan JSON yang valid." },
        { status: 502 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Apps Script gagal memproses permintaan." },
        { status: 502 }
      );
    }

    const parsed = result as Record<string, unknown>;
    return NextResponse.json(parsed, {
      status: parsed.success === false ? 400 : 200,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Gagal menghubungi Apps Script." },
      { status: 502 }
    );
  }
}

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action");

  if (action !== "getKonsinyasiProduk" || !allowed.has(action)) {
    return NextResponse.json(
      { success: false, message: "Action produk tidak dikenal." },
      { status: 400 }
    );
  }

  return forward(action);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body JSON tidak valid." },
      { status: 400 }
    );
  }

  const action = typeof body.action === "string" ? body.action : "";
  if (!["saveKonsinyasiProduk", "updateKonsinyasiProduk"].includes(action)) {
    return NextResponse.json(
      { success: false, message: "Action produk tidak diizinkan." },
      { status: 400 }
    );
  }

  const nested = body.data;
  if (!nested || typeof nested !== "object" || Array.isArray(nested)) {
    return NextResponse.json(
      { success: false, message: "Data produk tidak valid." },
      { status: 400 }
    );
  }

  return forward(action, { ...(nested as Record<string, unknown>), action });
}