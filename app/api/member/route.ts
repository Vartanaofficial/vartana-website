import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Webhook URL dari Apps Script deployment terbaru
    const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbx9S1vIXHsWGg5XIPs3r0YQG6S47YcdRelQcWwZfM_VXOjDrVJZll5hE-aSUn6S0FZa/exec";

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
