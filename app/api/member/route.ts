import { NextResponse } from "next/server";

// Cache memori sementara untuk menahan request duplikat (Spam Protection)
const recentRequests = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderSerial, phone, action } = body;

    // Kunci unik berdasarkan Order Serial atau No HP
    const requestKey = orderSerial ? orderSerial : `${phone}-${action || "order"}`;

    // Jika request yang sama persis masuk lagi dalam 5 detik, abaikan
    if (recentRequests.has(requestKey)) {
      return NextResponse.json({
        success: true,
        message: "Duplicate request ignored.",
      });
    }

    recentRequests.add(requestKey);

    setTimeout(() => {
      recentRequests.delete(requestKey);
    }, 5000);

    // URL Google Apps Script
    // Disamakan dengan nama variable yang ada di .env.local
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

    // Kirim data ke Google Apps Script
    if (GOOGLE_SCRIPT_URL) {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      // Cek apakah Google Apps Script merespons dengan error HTTP
      if (!response.ok) {
        console.error("Google Apps Script Error:", response.status, response.statusText);

        return NextResponse.json(
          {
            success: false,
            error: "Gagal mengirim data ke Google Spreadsheet",
          },
          { status: 500 },
        );
      }
    } else {
      console.error("NEXT_PUBLIC_GOOGLE_SCRIPT_URL tidak ditemukan di environment variable.");

      return NextResponse.json(
        {
          success: false,
          error: "Google Script URL tidak ditemukan",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: body,
    });
  } catch (error) {
    console.error("Error API Member:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
