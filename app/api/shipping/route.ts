import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { destinationDistrictId, weightGram } = await request.json();

    if (!destinationDistrictId) {
      return NextResponse.json({ error: "Kecamatan tujuan wajib diisi." }, { status: 400 });
    }

    const apiKey = process.env.BITESHIP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key Biteship belum dikonfigurasi." }, { status: 500 });
    }

    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origin_area_id: "ID_AREA_GUDANG_VARTANA",
        destination_area_id: destinationDistrictId,
        couriers: "jne,jnt",
        items: [
          {
            name: "VARTANA Botanical Tea",
            value: 71000,
            quantity: 1,
            weight: weightGram || 100,
          },
        ],
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data ongkir." }, { status: 500 });
  }
}
