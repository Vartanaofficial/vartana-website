import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyM_NgzLK36B8Of3UBdBmVBgptjATbuHcMK9RDq4WtGK4SCOIvnfj4OS12ehSTLNwiU/exec";

    await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      message: "Data berhasil dicatat di Google Sheets!",
    });
  } catch (error) {
    console.error("Gagal simpan ke Google Sheet:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
