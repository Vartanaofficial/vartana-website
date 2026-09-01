import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { orderSerial, status, resiJNT } = body;

    // Validasi dasar
    if (!orderSerial) {
      return NextResponse.json(
        {
          success: false,
          message: "Order Serial wajib diisi.",
        },
        { status: 400 },
      );
    }

    // Google Apps Script URL
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "";

    if (!GOOGLE_SCRIPT_URL) {
      console.error("NEXT_PUBLIC_GOOGLE_SCRIPT_URL tidak ditemukan.");

      return NextResponse.json(
        {
          success: false,
          message: "Google Script URL tidak ditemukan.",
        },
        { status: 500 },
      );
    }

    // Kirim request update ke Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateOrder",
        orderSerial,
        status,
        resiJNT,
      }),
      cache: "no-store",
    });

    // Ambil response dari Apps Script
    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      console.error("Response Google Apps Script bukan JSON:", text);

      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script memberikan response yang tidak valid.",
        },
        { status: 500 },
      );
    }

    // Jika Apps Script mengembalikan error
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Gagal memperbarui data pesanan.",
        },
        { status: 500 },
      );
    }

    // Berhasil
    return NextResponse.json({
      success: true,
      message: "Status & Resi berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("Error API Update Order:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan sistem saat memperbarui.",
      },
      { status: 500 },
    );
  }
}
