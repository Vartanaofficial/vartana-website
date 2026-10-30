import { NextResponse } from "next/server";
import { readMasterProducts } from "@/lib/master-products";
import { buildStoreCatalog } from "@/lib/store-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ success: true, products: buildStoreCatalog(await readMasterProducts()) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Catalog read failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Katalog belum bisa dimuat. Coba lagi sebentar." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
