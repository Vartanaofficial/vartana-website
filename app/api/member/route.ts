import { NextResponse } from "next/server";
import { readMasterProducts, requestMasterScript } from "@/lib/master-products";
import { buildStoreCatalog } from "@/lib/store-catalog";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action && body.action !== "saveMember") {
      return NextResponse.json({ success: false, error: "Action tidak diizinkan." }, { status: 400 });
    }
    if (body.action !== "saveMember") {
      if (!Array.isArray(body.items) || !body.items.length || !body.orderSerial) {
        return NextResponse.json({ success: false, error: "Detail pesanan tidak lengkap." }, { status: 400 });
      }
      const variants = buildStoreCatalog(await readMasterProducts()).flatMap(product => product.variants || []);
      let subtotal = 0;
      for (const item of body.items) {
        const variant = variants.find(v => v.sku === item.sku);
        if (!variant || !Number.isInteger(item.quantity) || item.quantity <= 0 || variant.priceValue !== item.price) {
          return NextResponse.json({ success: false, error: "Produk atau harga sudah berubah. Refresh halaman dan cek keranjang dulu." }, { status: 409 });
        }
        subtotal += variant.priceValue * item.quantity;
      }
      const shipping = Number(body.customerShippingFee);
      if (!Number.isFinite(shipping) || shipping < 0 || body.subtotalProducts !== subtotal || body.grandTotal !== subtotal + shipping) {
        return NextResponse.json({ success: false, error: "Total pesanan tidak valid. Cek ulang keranjang." }, { status: 400 });
      }
      body.subtotalProducts = subtotal;
      body.grandTotal = subtotal + shipping;
      body.sku = body.items.map((item: { sku: string }) => item.sku).join(", ");
    }
    const result = await requestMasterScript(body.action || "saveOrder", body);
    if (result.success !== true && result.status !== "success") throw new Error("Apps Script tidak mengonfirmasi penyimpanan.");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save member/order failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, error: "Data belum berhasil disimpan. Coba lagi sebentar." }, { status: 502 });
  }
}
