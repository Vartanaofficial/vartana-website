import { translateCatalog } from "@/lib/catalog-translation";
import { NextResponse } from "next/server";
import { readMasterProducts } from "@/lib/master-products";
import { buildStoreCatalog } from "@/lib/store-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    let products = buildStoreCatalog(await readMasterProducts());
    let translationAvailable = true;
    if (new URL(request.url).searchParams.get("lang") === "en") {
      try { const translated = await translateCatalog(products); products = translated.products; translationAvailable = translated.pending === 0; } catch { translationAvailable = false; }
    }
    return NextResponse.json({ success: true, products, translationAvailable }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Catalog read failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Katalog belum bisa dimuat. Coba lagi sebentar." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
