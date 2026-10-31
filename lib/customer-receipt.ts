export type ReceiptOrder = {
 orderSerial:string;customerName:string;phone:string;addressDetail:string;itemsSummary:string;
 subtotalProducts?:number|null;customerShippingFee?:number|null;shippingSubsidy?:number|null;
 grossSubtotalProducts?:number|null;productDiscount?:number|null;reconciliationStatus?:string;
 grandTotal:number;status:string;createdAt?:string;paymentMethod?:string;
};
export const RECEIPT_CONTACTS={whatsapp:"+62 857-7799-9960",instagram:"@vartanabotanical",email:"vartana@vartanaglobal.com",website:"www.vartana.id"};
export function invoiceAvailable(order:ReceiptOrder){return ["PEMBAYARAN DITERIMA","PESANAN DISIAPKAN","DIKIRIM","SELESAI"].includes(order.status.toUpperCase());}
const xml=(s:unknown)=>String(s??"").replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const known=(v:unknown):v is number=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
const money=(v:number)=>"Rp "+v.toLocaleString("id-ID",{maximumFractionDigits:0});
export function receiptSvg(order:ReceiptOrder,logo:string){
 if(!invoiceAvailable(order))throw Error("Verifikasi pembayaran terlebih dahulu.");
 if(!known(order.grandTotal))throw Error("Total pesanan belum valid.");
 if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(logo))throw Error("Logo struk belum tersedia.");
 const width=384,left=24,right=360,content:string[]=[];let y=25;
 function line(text:string,size=12,bold=false,align:"start"|"middle"|"end"="start",color="#26352d"){
  const x=align==="middle"?width/2:align==="end"?right:left;
  content.push(`<text x="${x}" y="${y}" font-family="monospace" font-size="${size}" font-weight="${bold?700:400}" text-anchor="${align}" fill="${color}">${xml(text)}</text>`);y+=size+7;
 }
 function wrap(text:string,size=12,bold=false){
  const limit=Math.floor((right-left)/(size*.62));
  for(const paragraph of String(text||"-").split(/[\r\n]+/)){let current="";for(const word of paragraph.split(/\s+/)){for(let i=0;i<word.length;i+=limit){const part=word.slice(i,i+limit);if(current.length+part.length+1>limit){line(current,size,bold);current="";}current+=(current?" ":"")+part;}}if(current)line(current,size,bold);}
 }
 function rule(){y+=5;content.push(`<path d="M${left} ${y}H${right}" stroke="#c5c9bc" stroke-dasharray="4 4"/>`);y+=21;}
 function pair(label:string,value:string,bold=false,size=12){
  content.push(`<text x="${left}" y="${y}" font-family="monospace" font-size="${size}" font-weight="${bold?700:400}" fill="#26352d">${xml(label)}</text><text x="${right}" y="${y}" text-anchor="end" font-family="monospace" font-size="${size}" font-weight="${bold?700:400}" fill="#26352d">${xml(value)}</text>`);y+=size+9;
 }
 content.push(`<image x="153" y="${y-8}" width="78" height="78" href="${logo}"/>`);y+=92;
 line("VARTANA",27,true,"middle","#173b2b");line("BOTANICAL WELLNESS",10,false,"middle");y+=7;
 line("NOTA PEMBELIAN",13,true,"middle");line("PEMBAYARAN DITERIMA",10,true,"middle","#476246");rule();
 wrap(order.orderSerial,12,true);if(order.createdAt)wrap("Tanggal: "+order.createdAt,11);
 rule();wrap(order.customerName,13,true);wrap("WA: "+order.phone,11);wrap(order.addressDetail,11);
 const sections=order.itemsSummary.split(/\s*\|\s*/);
 const items=sections.filter(s=>s&&!/^(Promo\s|Kurir\s|Catatan:|Pembayaran\s)/i.test(s)).flatMap(s=>s.split(/,\s*(?=[^,]+\[)/));
 rule();line("RINCIAN BELANJA",11,true);
 for(const item of items){wrap(item,12);y+=5;}
 if(!items.length)wrap("Rincian barang belum tercatat.",11);
 const courier=sections.find(s=>/^Kurir\s/i.test(s));if(courier){y+=4;wrap(courier,10);}
 rule();
 if(known(order.grossSubtotalProducts)&&known(order.productDiscount)&&order.productDiscount>0){pair("Sebelum diskon",money(order.grossSubtotalProducts));pair("Diskon produk","-"+money(order.productDiscount));}
 pair("Subtotal produk",known(order.subtotalProducts)?money(order.subtotalProducts):"Belum tersedia");
 pair("Ongkir customer",known(order.customerShippingFee)?money(order.customerShippingFee):"Belum tersedia");
 if(known(order.shippingSubsidy)&&order.shippingSubsidy>0)pair("Subsidi ongkir*",money(order.shippingSubsidy),false,11);
 y+=5;content.push(`<rect x="18" y="${y-16}" width="348" height="42" rx="5" fill="#eff3e9"/>`);pair("TOTAL BAYAR",money(order.grandTotal),true,17);y+=14;
 if(order.shippingSubsidy&&order.shippingSubsidy>0)wrap("*Subsidi sudah mengurangi ongkir customer.",9);
 if(order.reconciliationStatus==="ESTIMASI_ONGKIR")wrap("Rincian ongkir memakai estimasi historis.",9);
 const method=order.paymentMethod==="qris"?"QRIS":order.paymentMethod==="bank_transfer"?"Transfer BCA":"Tidak tercatat";
 wrap("Metode saat checkout: "+method,10);wrap("Status pesanan: "+order.status,10);
 const note=sections.find(s=>/^Catatan:/i.test(s));if(note){y+=4;wrap(note,10);}
 rule();line("Terima kasih telah memilih",11,false,"middle");line("VARTANA Botanical Wellness.",11,true,"middle");y+=8;
 line("LAYANAN PELANGGAN",10,true,"middle","#476246");
 line("WA "+RECEIPT_CONTACTS.whatsapp,11,false,"middle");line("IG "+RECEIPT_CONTACTS.instagram,11,false,"middle");line(RECEIPT_CONTACTS.email,10,false,"middle");line(RECEIPT_CONTACTS.website,10,false,"middle");y+=8;
 line("Sertakan nomor pesanan untuk keluhan.",9,false,"middle");y+=10;
 if(y>16000)throw Error("Rincian pesanan terlalu panjang untuk satu struk.");
 return {width,height:Math.ceil(y+15),svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.ceil(y+15)}" viewBox="0 0 ${width} ${Math.ceil(y+15)}"><rect width="100%" height="100%" fill="white"/>${content.join("")}</svg>`};
}
