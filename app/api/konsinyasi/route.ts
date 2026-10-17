import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ACTIONS = new Set([
  "getKonsinyasiMitra",
  "saveKonsinyasiMitra",
  "updateKonsinyasiMitra",
]);

function getScriptUrl() {
  return (
    process.env.KONSINYASI_GOOGLE_SCRIPT_URL ||
    ""
  ).trim();
}

async function callAppsScript(
  action: string,
  payload?: Record<string, unknown>
) {
  const scriptUrl = getScriptUrl();

  if (!scriptUrl) {
    return {
      ok: false,
      status: 500,
      body: {
        success: false,
        message:
          "KONSINYASI_GOOGLE_SCRIPT_URL belum diatur di .env.local.",
      },
    };
  }

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(scriptUrl)) {
    return {
      ok: false,
      status: 500,
      body: {
        success: false,
        message: "URL Google Apps Script konsinyasi tidak valid.",
      },
    };
  }

  const url = new URL(scriptUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const isGet = !payload;
    if (isGet) {
      url.searchParams.set("action", action);
    }

    const response = await fetch(url.toString(), {
      method: isGet ? "GET" : "POST",
      headers: isGet
        ? undefined
        : { "Content-Type": "text/plain;charset=utf-8" },
      body: isGet
        ? undefined
        : JSON.stringify({ ...payload, action }),
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await response.text();

    let result: unknown;
    try {
      result = JSON.parse(text);
    } catch {
      return {
        ok: false,
        status: 502,
        body: {
          success: false,
          message:
            "Respons Apps Script bukan JSON. Periksa deployment dan fungsi doGet/doPost.",
        },
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        body: {
          success: false,
          message: "Google Apps Script gagal memproses permintaan.",
        },
      };
    }

    const data =
      result && typeof result === "object"
        ? (result as Record<string, unknown>)
        : null;

    if (!data) {
      return {
        ok: false,
        status: 502,
        body: {
          success: false,
          message: "Format respons Apps Script tidak valid.",
        },
      };
    }

    if (data.success === false || data.status === "error") {
      return {
        ok: false,
        status: 400,
        body: {
          success: false,
          message:
            typeof data.message === "string"
              ? data.message
              : "Apps Script menolak permintaan.",
        },
      };
    }

    return {
      ok: true,
      status: 200,
      body: data,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Koneksi Apps Script timeout."
        : "Tidak dapat terhubung ke Google Apps Script.";

    return {
      ok: false,
      status: 502,
      body: { success: false, message },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const action = new URL(request.url).searchParams.get("action");

  if (!action || !ACTIONS.has(action)) {
    return NextResponse.json(
      {
        success: false,
        message: "Action konsinyasi tidak dikenal.",
      },
      { status: 400 }
    );
  }

  if (action !== "getKonsinyasiMitra") {
    return NextResponse.json(
      {
        success: false,
        message: "Action ini harus menggunakan POST.",
      },
      { status: 405 }
    );
  }

  const result = await callAppsScript(action);

  return NextResponse.json(result.body, {
    status: result.status,
  });
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    const parsed: unknown = await request.json();

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json(
        { success: false, message: "Body permintaan tidak valid." },
        { status: 400 }
      );
    }

    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Format JSON tidak valid." },
      { status: 400 }
    );
  }

  const action =
    typeof body.action === "string" ? body.action : "";

  if (
    action !== "saveKonsinyasiMitra" &&
    action !== "updateKonsinyasiMitra"
  ) {
    return NextResponse.json(
      { success: false, message: "Action POST tidak dikenal." },
      { status: 400 }
    );
  }

  const nestedData =
    body.data &&
    typeof body.data === "object" &&
    !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : {};

  const payload = { ...nestedData, action };

  const result = await callAppsScript(action, payload);

  return NextResponse.json(result.body, {
    status: result.status,
  });
}