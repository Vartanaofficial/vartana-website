import { NextResponse } from "next/server";

// Cache memori sementara untuk menahan request duplikat (Spam Protection)
const recentRequests = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderSerial, phone, action } = body;

    // Kunci unik berdasarkan Order Serial atau No HP
    const requestKey = orderSerial ? orderSerial : `${phone}-${action || "order"}`;

    // Jika request yang sama persis masuk lagi dalam 5 detik, abaikan!
    if (recentRequests.has(requestKey)) {
      return NextResponse.json({ success: true, message: "Duplicate request ignored." });
    }

    recentRequests.add(requestKey);
    setTimeout(() => {
      recentRequests.delete(requestKey);
    }, 5000); // Reset kunci setelah 5 detik

    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";

    if (GOOGLE_SCRIPT_URL) {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), // Mengirim seluruh payload (termasuk SKU, omset tanpa ongkir, promo ongkir, dll)
      });
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error("Error API Member:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
