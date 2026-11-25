import { translateCatalog } from "@/lib/catalog-translation";
import { NextResponse } from "next/server";
import { readPreviewProducts } from "@/lib/master-products";
import { buildStoreCatalog } from "@/lib/store-catalog";
import {readPreviewStock,withRetailStock} from '@/lib/retail-stock';
import {staleWhileRevalidate} from "@/lib/swr-cache";

async function buildCatalog(lang: "id" | "en") {
  const [master,stock]=await Promise.all([readPreviewProducts(),readPreviewStock()]);
  let products = withRetailStock(buildStoreCatalog(master),stock);
  let translationAvailable = true;
  if (lang === "en") {
    try { const translated = await translateCatalog(products); products = translated.products; translationAvailable = translated.pending === 0; } catch { translationAvailable = false; }
  }
  return {products, translationAvailable};
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "id";
    // Visitors never wait on Google for a warm catalog: stale data (max 15 minutes) is served
    // while one background refresh runs. Checkout still verifies live stock separately.
    const {products, translationAvailable} = await staleWhileRevalidate("catalog:" + lang, () => buildCatalog(lang), {fresh: 30_000, maxStale: 15 * 60_000});
    return NextResponse.json({ success: true, products, translationAvailable }, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=30, stale-while-revalidate=900",
        "Netlify-Vary": "query=lang",
      },
    });
  } catch (error) {
    console.error("Catalog read failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Katalog belum bisa dimuat. Coba lagi sebentar." }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
