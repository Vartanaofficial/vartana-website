import { NextResponse } from "next/server";
import { recoverLegacyOrder } from "@/lib/admin-order-analysis";
import { masterScriptUrl } from "@/lib/master-products";

const REQUEST_TIMEOUT_MS = 30000;

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = masterScriptUrl();
    url.searchParams.set("action", "getAdminData");

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

    if (!data || !Array.isArray(data.orders) || !Array.isArray(data.members)) {
      console.error("Data Google Apps Script tidak valid:", data);

      return NextResponse.json(
        { message: "Data dari Google Sheets tidak valid." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ...data, orders: data.orders.map(recoverLegacyOrder) });
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
