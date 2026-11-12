export type PartnerQuoteItemInput={sku:string;name:string;variant:string;quantity:number;basePrice:number;discountPercent:number;extraCost:number;mode:'margin'|'manual';targetMargin:number;manualPrice:number};
export type PartnerQuoteInput={partnerName:string;pic:string;address:string;phone:string;reference:string;issuedOn:string;validUntil:string;terms:string;rounding:number;items:PartnerQuoteItemInput[]};
export type PartnerQuoteItem=PartnerQuoteItemInput&{partnerPrice:number;unitCost:number;sellingPrice:number;unitProfit:number;margin:number;purchaseTotal:number;costTotal:number;revenueTotal:number;profitTotal:number};
export type PartnerQuote=Omit<PartnerQuoteInput,'items'>&{items:PartnerQuoteItem[];quantity:number;purchaseTotal:number;extraTotal:number;capitalTotal:number;revenueTotal:number;profitTotal:number;margin:number};
export const quoteMoney=(n:number)=>'Rp '+n.toLocaleString('id-ID',{maximumFractionDigits:0});
export function quoteDate(value:string){return new Date(value+'T12:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});}
export function quoteToday(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function calculatePartnerQuote(input:PartnerQuoteInput):PartnerQuote{
 function text(v:string,max:number,required=false){return typeof v==='string'&&v.length<=max&&(!required||!!v.trim());}
 function amount(n:number,positive=false){return Number.isSafeInteger(n)&&n>=(positive?1:0)&&n<=1e9;}
 function date(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;}
 if(!text(input.partnerName,150,true)||!text(input.pic,150)||!text(input.address,500)||!text(input.phone,40)||!text(input.reference,80)||!text(input.terms,2000))throw Error('Lengkapi nama mitra dan batasi panjang informasi penawaran.');
 if(!date(input.issuedOn)||!date(input.validUntil)||input.validUntil<input.issuedOn)throw Error('Tanggal berlaku harus sama atau setelah tanggal penawaran.');
 if(![100,500,1000].includes(input.rounding))throw Error('Pilih pembulatan Rp100, Rp500, atau Rp1.000.');
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>30)throw Error('Pilih 1 sampai 30 produk untuk penawaran.');
 const seen=new Set<string>();
 const items=input.items.map((item):PartnerQuoteItem=>{
  if(!text(item.sku,100,true)||!text(item.name,200,true)||!text(item.variant,200)||seen.has(item.sku))throw Error('Pilih produk berbeda pada setiap baris.');seen.add(item.sku);
  if(!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>1000000||!amount(item.basePrice,true)||!amount(item.extraCost))throw Error('Isi jumlah kemasan, harga mitra, dan biaya tambahan dengan angka yang valid.');
  if(!Number.isFinite(item.discountPercent)||item.discountPercent<0||item.discountPercent>100)throw Error('Diskon mitra harus antara 0 dan 100%.');
  if(!['margin','manual'].includes(item.mode)||!Number.isFinite(item.targetMargin)||item.targetMargin<0||item.targetMargin>99)throw Error('Target margin harus antara 0 dan 99%.');
  const partnerPrice=Math.round(item.basePrice*(1-item.discountPercent/100)),unitCost=partnerPrice+item.extraCost;
  if(partnerPrice<1)throw Error('Harga mitra setelah diskon harus lebih dari Rp0.');
  const sellingPrice=item.mode==='margin'?Math.ceil(unitCost*100/(100-item.targetMargin)/input.rounding-1e-9)*input.rounding:item.manualPrice;
  if(!amount(sellingPrice,true))throw Error('Harga jual harus lebih dari Rp0 dan maksimal Rp1 miliar.');
  const unitProfit=sellingPrice-unitCost;
  return {...item,partnerPrice,unitCost,sellingPrice,unitProfit,margin:unitProfit/sellingPrice*100,purchaseTotal:partnerPrice*item.quantity,costTotal:unitCost*item.quantity,revenueTotal:sellingPrice*item.quantity,profitTotal:unitProfit*item.quantity};
 });
 const sum=(key:'quantity'|'purchaseTotal'|'costTotal'|'revenueTotal'|'profitTotal')=>items.reduce((n,i)=>n+i[key],0);
 const purchaseTotal=sum('purchaseTotal'),capitalTotal=sum('costTotal'),revenueTotal=sum('revenueTotal'),profitTotal=sum('profitTotal');
 if([purchaseTotal,capitalTotal,revenueTotal,Math.abs(profitTotal)].some(n=>!Number.isSafeInteger(n)||n>1e12))throw Error('Total penawaran terlalu besar, batasi sampai Rp1 triliun.');
 return {...input,partnerName:input.partnerName.trim(),items,quantity:sum('quantity'),purchaseTotal,extraTotal:capitalTotal-purchaseTotal,capitalTotal,revenueTotal,profitTotal,margin:profitTotal/revenueTotal*100};
}
