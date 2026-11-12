import {PAYMENT_DETAILS} from "./payment-details";
export type ConfirmationDetails = {
  memberId?:string;customerName?:string;email?:string;phone?:string;addressDetail?:string;
  itemsSummary?:string;subtotalProducts?:number|null;originalShipping?:number|null;
  customerShippingFee?:number|null;shippingSubsidy?:number|null;productDiscount?:number|null;
  grossSubtotalProducts?:number|null;paymentMethod?:string;grandTotal?:number;orderSerial?:string;
};
export type CheckoutReceipt = {serial:string;total:number;paymentMethod?:string;waOpened?:boolean;reservationUntil?:string|null;details?:ConfirmationDetails};
const text=(s:unknown)=>String(s||"-").replace(/[\r\n]+/g," ").trim();
const money=(v:number)=>"Rp"+v.toLocaleString("id-ID",{maximumFractionDigits:0});
const known=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
export function orderConfirmationMessage(receipt:CheckoutReceipt,fallback:{name:string;phone:string;email:string;address:string},paymentMethod:string){
  const d=receipt.details||{}, sections=(d.itemsSummary||"").split(/\s*\|\s*/);
  const items=sections.filter(s=>s&&!/^(Promo\s|Kurir\s|Catatan:)/i.test(s)).flatMap(s=>s.split(/,\s*(?=[^,]+\[)/));
  const courier=sections.find(s=>/^Kurir\s/i.test(s))?.replace(/^Kurir\s/i,"");
  const note=sections.find(s=>/^Catatan:/i.test(s));
  const rows=[`Halo VARTANA, saya${d.memberId?` (Member ${text(d.memberId)})`:""} ingin konfirmasi pesanan:`,"",
    `*No. Seri Pesanan:* ${text(receipt.serial)}`,`*Nama:* ${text(d.customerName||fallback.name)}`,`*Email:* ${text(d.email||fallback.email)}`,`*HP/WA:* ${text(d.phone||fallback.phone)}`,`*Alamat:* ${text(d.addressDetail||fallback.address)}`,"",
    "*Detail Rincian Pesanan:*",...items.map(item=>"- "+text(item))];
  if(!items.length)rows.push("- Rincian tersedia pada pesanan yang tercatat di VARTANA.");
  if(known(d.grossSubtotalProducts)&&known(d.productDiscount)&&d.productDiscount>0){rows.push("",`*Subtotal sebelum promo:* ${money(d.grossSubtotalProducts)}`,`*Diskon produk:* ${money(d.productDiscount)}`);}
  if(known(d.subtotalProducts))rows.push(`*Subtotal produk:* ${money(d.subtotalProducts)}`);
  if(courier)rows.push(`*Layanan Kurir:* ${text(courier)}`);
  if(known(d.originalShipping))rows.push(`*Ongkir asli:* ${money(d.originalShipping)}`);
  if(known(d.customerShippingFee))rows.push(`*Biaya Pengiriman:* ${money(d.customerShippingFee)}${known(d.shippingSubsidy)?` (Subsidi Pengiriman ${money(d.shippingSubsidy)})`:""}`);
  rows.push(`*Total Pembayaran:* ${money(receipt.total)}`,`*Metode pembayaran:* ${paymentMethod==="qris"?"QRIS":`Transfer ${PAYMENT_DETAILS.bank}`}`);
  if(note)rows.push(`*Catatan:* ${text(note.replace(/^Catatan:\s*/i,""))}`);
  rows.push("",paymentMethod==="qris"?"Saya akan melampirkan bukti pembayaran QRIS. Terima kasih.":`Saya akan melampirkan bukti transfer ke ${PAYMENT_DETAILS.bank} ${PAYMENT_DETAILS.account} a.n. ${PAYMENT_DETAILS.holder}. Terima kasih.`);
  return rows.join("\n");
}
