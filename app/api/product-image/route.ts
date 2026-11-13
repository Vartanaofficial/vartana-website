import { NextResponse } from "next/server";
import {fetchGoogle} from '@/lib/google-fetch';

export const runtime = "nodejs";
export const dynamic = 'force-dynamic';
const MAX_BYTES = 12 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const fileId = params.get("fileId") || "";
  const resourceKey = params.get("resourceKey") || "";
  if (!/^[a-zA-Z0-9_-]{5,200}$/.test(fileId) || (resourceKey && !/^[a-zA-Z0-9_-]{1,200}$/.test(resourceKey))) {
    return NextResponse.json({ message: "Link gambar Drive tidak valid." }, { status: 400 });
  }
  // Fixed Google endpoint: callers cannot turn this into an arbitrary URL proxy.
  const url = new URL("https://drive.google.com/thumbnail");
  url.searchParams.set("id", fileId);
  url.searchParams.set("sz", "w1600");
  if (resourceKey) url.searchParams.set("resourcekey", resourceKey);
  try {
    const upstream = await fetchGoogle(url, { signal: AbortSignal.timeout(20000) });
    const contentType = upstream.headers.get("content-type")?.split(";")[0].trim() || "";
    if (!upstream.ok || !IMAGE_TYPES.has(contentType) || !upstream.body) {
      await upstream.body?.cancel();
      return NextResponse.json({ message: "Gambar tidak bisa dibuka. Atur akses Drive ke Siapa saja yang memiliki link (Pelihat)." }, { status: 422 });
    }
    const reader = upstream.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) {
        await reader.cancel();
        return NextResponse.json({ message: "Ukuran gambar terlalu besar." }, { status: 413 });
      }
      chunks.push(value);
    }
    return new Response(Buffer.concat(chunks), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Netlify-CDN-Cache-Control": "no-store",
        "CDN-Cache-Control": "no-store",
        "Netlify-Vary": "query=fileId|resourceKey|retry",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ message: "Gambar Drive belum bisa dimuat. Coba lagi sebentar." }, { status: 502 });
  }
}
