import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { destinationDistrictId, weightGram } = await req.json();

    if (!destinationDistrictId) {
      return NextResponse.json({ error: "District ID destination required" }, { status: 400 });
    }

    const API_KEY = process.env.BITESHIP_API_KEY || process.env.BINDERBYTE_API_KEY;
    const ORIGIN_DISTRICT_ID = process.env.ORIGIN_DISTRICT_ID || "3171"; // Tangerang

    if (API_KEY) {
      try {
        // PERMINTAAN TARIF KE API BITESHIP / BINDERBYTE
        const res = await fetch("https://api.biteship.com/v1/rates/couriers", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin_area_id: ORIGIN_DISTRICT_ID,
            destination_area_id: destinationDistrictId,
            couriers: "jnt,jne",
            items: [
              {
                name: "VARTANA Tea Pouch",
                description: "Botanical Tea Blend",
                value: 72800,
                weight: weightGram || 100,
                quantity: 1,
              },
            ],
          }),
        });

        const data = await res.json();

        if (data && data.pricing && Array.isArray(data.pricing)) {
          const formattedPricing = data.pricing.map((item: any) => ({
            courier_name: item.courier_name.toUpperCase(),
            courier_service_name: item.courier_service_name,
            courier_service_code: item.courier_service_code,
            price: item.price,
            duration: item.duration || "2-3 Hari",
          }));

          return NextResponse.json({ pricing: formattedPricing });
        }
      } catch (apiErr) {
        console.error("Gagal panggil API Shipping Provider:", apiErr);
      }
    }

    // Jika API Key belum diset, kembalikan status kosong agar fallback dinamis di frontend aktif
    return NextResponse.json({ pricing: [] });
  } catch (err) {
    console.error("Shipping Route Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
