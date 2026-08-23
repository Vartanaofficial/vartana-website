import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serial = searchParams.get("serial") || "";
    const memberId = searchParams.get("memberId") || "";

    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyM_NgzLK36B8Of3UBdBmVBgptjATbuHcMK9RDq4WtGK4SCOIvnfj4OS12ehSTLNwiU/exec";

    let targetUrl = GOOGLE_SHEET_WEBHOOK_URL;
    if (serial) {
      targetUrl += `?serial=${encodeURIComponent(serial)}`;
    } else if (memberId) {
      targetUrl += `?memberId=${encodeURIComponent(memberId)}`;
    }

    const res = await fetch(targetUrl);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gagal lacak pesanan:", error);
    return NextResponse.json({ found: false, message: "Terjadi kesalahan sistem." }, { status: 500 });
  }
}
