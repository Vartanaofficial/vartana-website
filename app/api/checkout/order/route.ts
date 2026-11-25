import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/checkout";
import { requestMasterScript } from "@/lib/master-products";
import { signPuzzle } from '@/lib/puzzle-server';
import {checkoutContext} from '@/lib/checkout-context';

import { normalizeWhatsApp } from "@/lib/checkout-contact";

import type {CheckoutReceipt} from "@/lib/order-confirmation";

import {readIntegrationSettings} from '@/lib/integrations-server';
import {paymentChoices} from '@/lib/integrations';

import {ensureMidtransBackend, midtransPayment} from '@/lib/midtrans';
import {productionDokuPayment,ensureDokuBackend} from '@/lib/doku-production';
import {localDokuAdmin,localDokuCredentials,localDokuPayment} from '@/lib/local-doku';

const pending = new Map<string, Promise<CheckoutReceipt>>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = body.customer || {};
    const phone = normalizeWhatsApp(customer.phone);
    const paymentMethod = body.paymentMethod || "bank_transfer";
    const dokuLocal=paymentMethod==='doku'&&localDokuAdmin(req)&&!!localDokuCredentials();
    if (!["bank_transfer", "qris", "doku", "midtrans"].includes(paymentMethod)) return NextResponse.json({message: "Pilih metode pembayaran yang tersedia."}, {status: 400});
    const fields = ["name", "email", "phone", "address", "provinceName", "cityName", "districtName", "districtId"];
    if (!fields.every(key => typeof customer[key] === "string" && customer[key].trim() && customer[key].length <= 1000)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || !phone
      || !/^[a-f0-9-]{36}$/.test(body.orderKey || "")) return NextResponse.json({ message: "Lengkapi nama, kontak, dan alamat pengiriman." }, { status: 400 });
    const orderKey = String(body.orderKey);
    const serial = `VRT-${orderKey.replaceAll("-", "").toUpperCase()}`;
    const execute = async () => {
      const data = await checkoutContext(phone,orderKey);
      const existing = (data.orders || []).find((order: { orderSerial: string; orderKey?: string }) => order.orderKey === orderKey || order.orderSerial === serial);
      if(existing){
        if(normalizeWhatsApp(existing.phone)!==phone)throw new Error('Pesanan ini tercatat untuk nomor lain.');
        const doku=existing.paymentMethod==='doku'?(dokuLocal?await localDokuPayment(orderKey,Number(existing.grandTotal)):await productionDokuPayment(orderKey,existing.orderSerial,Number(existing.grandTotal))):null;
        const midtransPaymentUrl = existing.paymentMethod === 'midtrans' ? await midtransPayment(orderKey, existing.orderSerial, Number(existing.grandTotal), req.url) : undefined;
        return {midtransPaymentUrl,...(doku?{dokuPaymentUrl:doku.paymentUrl,dokuInvoice:doku.invoice}:{}),serial:existing.orderSerial,total:Number(existing.grandTotal),paymentMethod:existing.paymentMethod||paymentMethod,reservationUntil:existing.reservationUntil,details:existing};
      }
      const settings=(await readIntegrationSettings()).settings;
      if(!dokuLocal&&!paymentChoices(settings).some(method=>method.id===paymentMethod))throw new Error('Metode pembayaran ini sedang nonaktif. Pilih metode lain.');
      if(data.retailStockVersion!==1)throw new Error("Perbarui backend stok sebelum melanjutkan pembayaran.");
      const midtrans = paymentMethod === 'midtrans' ? settings.find(setting => setting.id === 'midtrans' && setting.enabled) : undefined;
      if (paymentMethod === 'midtrans' && !midtrans) throw new Error('Midtrans sedang nonaktif.');
      const [quote] = await Promise.all([
        checkoutQuote({ ...body, phone, districtId: customer.districtId, provinceName: customer.provinceName,cityName:customer.cityName,districtName:customer.districtName },{integrationSettings:settings,stock:data.retailStock?.retailStockVersion===1?data.retailStock:undefined,masterData:Array.isArray(data.products)&&Array.isArray(data.promotions)?{master:data.products,promoData:{promotions:data.promotions}}:undefined}),
        midtrans ? ensureMidtransBackend(midtrans.environment) : paymentMethod === 'doku' && !dokuLocal ? ensureDokuBackend() : undefined,
      ]);
      if(quote.destination?.verified){customer.cityName=quote.destination.cityName;customer.provinceName=quote.destination.provinceName;customer.districtName=quote.destination.districtName;}
      if (!quote.shipping || quote.promoError) throw new Error(quote.promoError || "Pilih layanan pengiriman.");
      if (body.expectedTotal !== quote.total || body.shippingService !== quote.shipping.id) throw new Error("Harga atau ongkir berubah. Periksa ringkasan terbaru sebelum melanjutkan.");
      if (paymentMethod === 'midtrans' && (!Number.isSafeInteger(quote.total) || quote.total < 1000)) throw new Error('Total pembayaran Midtrans minimal Rp1.000.');
      if(dokuLocal&&(quote.total<1000||quote.total>100000))throw new Error('Uji lokal DOKU dibatasi total Rp1.000?Rp100.000.');
      if (data.retailOrderVersion !== 2) throw new Error("Sistem nomor order sedang diperbarui. Admin perlu deploy Apps Script versi terbaru sebelum checkout dilanjutkan.");
      const knownMember = (data.members || []).find((m: {phone: string}) => normalizeWhatsApp(String(m.phone)) === phone);
      let memberId = knownMember?.memberId || `VRT-${phone}`;
      const profileChanged=!knownMember||knownMember.name!==customer.name||knownMember.email!==customer.email||knownMember.addressDetail!==customer.address||knownMember.districtName!==customer.districtName||knownMember.cityName!==customer.cityName;
      const memberProfile={createOnly:true,memberId,name:customer.name,email:customer.email,phone:customer.phone,addressDetail:customer.address,districtName:customer.districtName,cityName:customer.cityName};
      if(profileChanged&&data.checkoutWorkflowVersion!==3){
        const member = await requestMasterScript("saveMember", { createOnly:true,memberId, name: customer.name, email: customer.email, phone: customer.phone, addressDetail: customer.address, districtName: customer.districtName, cityName: customer.cityName });
        if (member.status !== "success" && member.success !== true) throw new Error("Data pelanggan belum tersimpan.");
        memberId=member.memberId||memberId;
      }
      const summary = quote.lines.map(line => `${line.name} [${line.variant}] (${line.quantity}x)`).join(", ");
      const rewardSummary = quote.rewardLines.map(line=>`${line.kind==='redeem'?'TEBUS MURAH':'GRATIS'} ${line.name} [${line.variant}] (${line.quantity}x @Rp${line.price}) [${line.promoCode}]`).join(", ");
      const orderDetails = {
        retailStockVersion:1,
        ...(profileChanged&&data.checkoutWorkflowVersion===3?{memberProfile}:{}),
        inventoryItems: [...quote.lines,...quote.rewardLines].map(line=>({sku:line.sku,quantity:line.quantity})),
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
      const proof = signPuzzle('saveOrder', orderDetails);
      const result = await requestMasterScript("saveRetailOrderV3", { ...orderDetails, ...proof });
      if (result.status !== "success" && result.success !== true) throw new Error("Pesanan belum tersimpan.");
      const savedSerial = String(result.orderSerial || serial);
      const doku=paymentMethod==='doku'?(dokuLocal?await localDokuPayment(orderKey,quote.total):await productionDokuPayment(orderKey,savedSerial,quote.total)):null;
      const midtransPaymentUrl = paymentMethod === 'midtrans' ? await midtransPayment(orderKey, savedSerial, quote.total, req.url) : undefined;
      return { midtransPaymentUrl, ...(doku?{dokuPaymentUrl:doku.paymentUrl,dokuInvoice:doku.invoice}:{}),paymentMethods:quote.paymentMethods, serial: savedSerial, total: quote.total, paymentMethod, reservationUntil:result.reservationUntil, details: { ...orderDetails, orderSerial: savedSerial } };
    };
    const pendingKey=serial+':'+phone;
    let task = pending.get(pendingKey);
    if (!task) { task = execute(); pending.set(pendingKey, task); }
    try { return NextResponse.json(await task); }
    finally { pending.delete(pendingKey); }
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Pesanan belum berhasil disimpan." }, { status: 400 });
  }
}
