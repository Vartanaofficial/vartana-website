import { NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 30000;

export async function GET() {
  const GOOGLE_SCRIPT_URL =
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    "https://script.google.com/macros/s/AKfycbwlkCGZevJQeGSgU714QpIICydQnsDBBQ_l_VSZHKis4FF9ocjeWU9sLat2wiJcLBdh/exec";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${GOOGLE_SCRIPT_URL}?action=getAdminData`;

    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });

    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      console.error(
        `Google Apps Script error: HTTP ${res.status} ${res.statusText}`
      );

      return NextResponse.json(
        { message: "Google Apps Script sedang tidak dapat diakses." },
        { status: 502 }
      );
    }

    if (!contentType.toLowerCase().includes("application/json")) {
      const text = await res.text();

      console.error(
        "Response Google Apps Script bukan JSON:",
        text.slice(0, 500)
      );

      return NextResponse.json(
        {
          message:
            "Google Apps Script mengembalikan response yang tidak valid.",
        },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!data || typeof data !== "object") {
      console.error("Data Google Apps Script tidak valid:", data);

      return NextResponse.json(
        { message: "Data dari Google Sheets tidak valid." },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Google Apps Script request timeout.");

      return NextResponse.json(
        { message: "Google Apps Script terlalu lama merespons." },
        { status: 504 }
      );
    }

    console.error("Error fetching admin data:", error);

    return NextResponse.json(
      { message: "Gagal mengambil data dari Google Sheets." },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
