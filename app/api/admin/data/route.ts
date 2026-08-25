import { NextResponse } from "next/server";

export async function GET() {
  try {
    const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbwlkCGZevJQeGSgU714QpIICydQnsDBBQ_l_VSZHKis4FF9ocjeWU9sLat2wiJcLBdh/exec";

    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAdminData`, {
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    return NextResponse.json({ message: "Gagal mengambil data dari Google Sheets" }, { status: 500 });
  }
}
