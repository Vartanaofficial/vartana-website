import {promoAreaError,type PromoDestination} from './promo-area';
import { type CheckoutPromo, promoInPeriod } from "./checkout-promos";

export type PromoLine = { sku: string; name: string; variant: string; image: string; price: number; weight: number; quantity: number };
export type RewardLine = PromoLine & { promoCode: string; kind: "gift" | "redeem"; regularPrice: number };

export function evaluatePromoStack(promos: CheckoutPromo[], codes: string[], items: PromoLine[], products: Omit<PromoLine, "quantity">[], shipping: number, destination?:PromoDestination) {
  const subtotal = items.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const requested = [...new Set(codes.map(code=>code.trim().toUpperCase()).filter(Boolean))];
  const errors: string[] = [];
  for(const code of requested) if(!promos.some(p=>p.code===code)) errors.push(`Kode ${code} tidak ditemukan.`);
  const eligible = promos.filter(p=>p.automatic || requested.includes(p.code)).filter(p=>{
    let error = !promoInPeriod(p) ? "Promo tidak aktif atau sudah berakhir." : subtotal<p.minSpend ? `Minimal belanja Rp${p.minSpend.toLocaleString('id-ID')}.` : "";
    if(!error)error=promoAreaError(p.area,destination);
    if(!error && ['bogo','gift','redeem'].includes(p.type)) {
      const qty=items.filter(item=>p.buySkus?.length?p.buySkus.includes(item.sku):!p.buySku||item.sku===p.buySku).reduce((sum,item)=>sum+item.quantity,0);
      if(qty<(p.buyQty||1)) error=`Beli minimal ${p.buyQty||1} produk yang memenuhi syarat.`;
      if(!products.some(item=>item.sku===(p.type==='bogo'?p.buySku:p.rewardSku)))error='Produk bonus sedang tidak tersedia.';
    }
    if(error && requested.includes(p.code))errors.push(`${p.code}: ${error}`);
    return !error;
  }).sort((a,b)=>(requested.includes(b.code)?1:0)-(requested.includes(a.code)?1:0)||(a.priority||100)-(b.priority||100)||a.code.localeCompare(b.code));
  const selected: CheckoutPromo[]=[];
  for(const promo of eligible){
    if(selected.length && (promo.stackable===false || selected.some(p=>p.stackable===false))){
      if(requested.includes(promo.code))errors.push(`${promo.code} tidak bisa digabung dengan promo yang dipilih.`);
      continue;
    }
    selected.push(promo);
  }
  let remaining=subtotal,shippingRemaining=shipping;
  const rewards:RewardLine[]=[];
  const applied:{code:string;name:string;type:CheckoutPromo['type'];productDiscount:number;shippingDiscount:number;rewardQuantity:number;redeemTotal:number;automatic:boolean}[]=[];
  for(const p of selected){
    let productDiscount=0,shippingDiscount=0,rewardQuantity=0,redeemTotal=0;
    if(['bogo','gift','redeem'].includes(p.type)){
      const product=products.find(item=>item.sku===(p.type==='bogo'?p.buySku:p.rewardSku))!;
      const qualifying=items.filter(item=>p.buySkus?.length?p.buySkus.includes(item.sku):!p.buySku||item.sku===p.buySku).reduce((sum,item)=>sum+item.quantity,0);
      const repeats=Math.min(Math.floor(qualifying/(p.buyQty||1)),p.maxApplications||1);
      rewardQuantity=repeats*(p.rewardQty||1);
      const price=p.type==='redeem'?p.redeemPrice||0:0;
      // A configured redemption must never cost more than the current catalog price.
      if(price>product.price){if(requested.includes(p.code))errors.push(`${p.code}: harga tebus perlu diperbarui admin.`);continue;}
      redeemTotal=price*rewardQuantity;
      rewards.push({...product,quantity:rewardQuantity,price,regularPrice:product.price,promoCode:p.code,kind:p.type==='redeem'?'redeem':'gift'});
    }else{
      let amount=p.type==='shipping'&&p.shippingMode==='free'?shippingRemaining:p.type==='percent'?Math.floor(remaining*Math.min(p.value,100)/100):p.value;
      if(p.maxDiscount>0)amount=Math.min(amount,p.maxDiscount);
      amount=Math.max(0,Math.floor(amount));
      if(p.type==='shipping'){shippingDiscount=Math.min(shippingRemaining,amount);shippingRemaining-=shippingDiscount;}
      else{productDiscount=Math.min(remaining,amount);remaining-=productDiscount;}
    }
    applied.push({code:p.code,name:p.name,type:p.type,productDiscount,shippingDiscount,rewardQuantity,redeemTotal,automatic:!!p.automatic});
  }
  const productDiscount=subtotal-remaining,shippingDiscount=shipping-shippingRemaining,redeemTotal=rewards.reduce((sum,item)=>sum+item.price*item.quantity,0);
  return {applied,rewards,productDiscount,shippingDiscount,redeemTotal,total:remaining+shippingRemaining+redeemTotal,errors};
}
