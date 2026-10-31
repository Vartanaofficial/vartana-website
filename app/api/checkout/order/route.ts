import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/checkout";
import { requestMasterScript } from "@/lib/master-products";

import { normalizeWhatsApp } from "@/lib/checkout-contact";

import type {CheckoutReceipt} from "@/lib/order-confirmation";

const pending = new Map<string, Promise<CheckoutReceipt>>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = body.customer || {};
    const phone = normalizeWhatsApp(customer.phone);
    const paymentMethod = body.paymentMethod || "bank_transfer";
    if (!["bank_transfer", "qris"].includes(paymentMethod)) return NextResponse.json({message: "Pilih metode pembayaran yang tersedia."}, {status: 400});
    const fields = ["name", "email", "phone", "address", "provinceName", "cityName", "districtName", "districtId"];
    if (!fields.every(key => typeof customer[key] === "string" && customer[key].trim() && customer[key].length <= 1000)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !phone
      || !/^[a-f0-9-]{36}$/.test(body.orderKey || "")) return NextResponse.json({ message: "Lengkapi nama, kontak, dan alamat pengiriman." }, { status: 400 });
    const orderKey = String(body.orderKey);
    const serial = `VRT-${orderKey.replaceAll("-", "").toUpperCase()}`;
    const execute = async () => {
      const quote = await checkoutQuote({ ...body, districtId: customer.districtId, provinceName: customer.provinceName });
      if (!quote.shipping || quote.promoError) throw new Error(quote.promoError || "Pilih layanan pengiriman.");
      if (body.expectedTotal !== quote.total || body.shippingService !== quote.shipping.id) throw new Error("Harga atau ongkir berubah. Periksa ringkasan terbaru sebelum melanjutkan.");
      const data = await requestMasterScript("getAdminData");
      const existing = (data.orders || []).find((order: { orderSerial: string; orderKey?: string }) => order.orderKey === orderKey || order.orderSerial === serial);
      if (existing) {
        if (normalizeWhatsApp(existing.phone) !== phone || Number(existing.grandTotal) !== quote.total) throw new Error("Pesanan ini sudah tercatat dengan rincian berbeda. Muat ulang checkout.");
        return { serial: existing.orderSerial, total: quote.total, paymentMethod: existing.paymentMethod || paymentMethod, details: existing };
      }
      if (data.retailOrderVersion !== 2) throw new Error("Sistem nomor order sedang diperbarui. Admin perlu deploy Apps Script versi terbaru sebelum checkout dilanjutkan.");
      const knownMember = (data.members || []).find((m: {phone: string}) => normalizeWhatsApp(String(m.phone)) === phone);
      const memberId = knownMember?.memberId || `VRT-${phone}`;
      const member = await requestMasterScript("saveMember", { memberId, name: customer.name, email: customer.email, phone: customer.phone, addressDetail: customer.address, districtName: customer.districtName, cityName: customer.cityName });
      if (member.status !== "success" && member.success !== true) throw new Error("Data pelanggan belum tersimpan.");
      const summary = quote.lines.map(line => `${line.name} [${line.variant}] (${line.quantity}x)`).join(", ");
      const rewardSummary = quote.rewardLines.map(line=>`${line.kind==='redeem'?'TEBUS MURAH':'GRATIS'} ${line.name} [${line.variant}] (${line.quantity}x @Rp${line.price}) [${line.promoCode}]`).join(", ");
      const orderDetails = {
        paymentMethod, orderKey, orderSerial: serial, memberId, customerName: customer.name, phone: customer.phone, email: customer.email,
        addressDetail: `${customer.address}, ${customer.districtName}, ${customer.cityName}, ${customer.provinceName}${customer.postalCode ? ` ${customer.postalCode}` : ""}`,
        sku: [...quote.lines,...quote.rewardLines].map(line => line.sku).join(", "),
        itemsSummary: `${summary}${rewardSummary?` | ${rewardSummary}`:''}${quote.promoCode ? ` | Promo ${quote.promoCode}: diskon produk Rp${quote.productDiscount}, diskon ongkir Rp${quote.shippingDiscount}` : ""} | Kurir ${quote.shipping.name}${customer.notes ? ` | Catatan: ${String(customer.notes).slice(0,500)}` : ""}`,
        subtotalProducts: quote.subtotal - quote.productDiscount + quote.redeemTotal, originalShipping: quote.shipping.price,
        grossSubtotalProducts: quote.subtotal, promoCode: quote.promoCode,
        promoName: quote.appliedPromos.map(p=>p.name).join(", "),
        promoBreakdown: quote.appliedPromos, rewardItems: quote.rewardLines, redeemTotal: quote.redeemTotal,
        productDiscount: quote.productDiscount, promoShippingDiscount: quote.shippingDiscount,
        shippingSubsidy: quote.shippingDiscount, customerShippingFee: quote.shipping.price - quote.shippingDiscount, grandTotal: quote.total,
      };
      const result = await requestMasterScript("saveOrder", orderDetails);
      if (result.status !== "success" && result.success !== true) throw new Error("Pesanan belum tersimpan.");
      const savedSerial = String(result.orderSerial || serial);
      return { serial: savedSerial, total: quote.total, paymentMethod, details: { ...orderDetails, orderSerial: savedSerial } };
    };
    let task = pending.get(serial);
    if (!task) { task = execute(); pending.set(serial, task); }
    try { return NextResponse.json(await task); }
    finally { pending.delete(serial); }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Pesanan belum berhasil disimpan." }, { status: 400 });
  }
}
