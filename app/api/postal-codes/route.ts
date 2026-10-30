import { NextResponse } from "next/server";
import { lookupPostalCodes } from "@/lib/postal-codes";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const fields = ["province", "city", "district"].map(key => params.get(key) || "");
  if (fields.some(value => !value.trim() || value.length > 100)) return NextResponse.json({ options: [], message: "Pilih provinsi, kota, dan kecamatan." }, { status: 400 });
  try {
    const options = await lookupPostalCodes(fields[0], fields[1], fields[2]);
    return NextResponse.json({ options }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    console.error("Postal lookup failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ options: [], message: "Pilihan kode pos belum tersedia. Kamu bisa isi manual." }, { status: 502 });
  }
}
