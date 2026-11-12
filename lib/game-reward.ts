import type {CheckoutPromo} from './checkout-promos';
import {defaultReward,rewardDescription,type GameVoucher} from './games';

export function gameRewardPromo(voucher:GameVoucher,code:string):CheckoutPromo{
 const r=voucher.reward||{...defaultReward(),value:voucher.value};
 if(voucher.code!==code||!['nominal','percent','shipping','gift'].includes(r.type)||!Number.isFinite(r.value)||r.value<0)throw new Error('Hadiah Games belum dapat diverifikasi.');
 return {id:code,code,name:rewardDescription(r),type:r.type as CheckoutPromo['type'],value:r.value,minSpend:r.minSpend,maxDiscount:r.maxDiscount,startDate:'',endDate:'',active:true,stackable:false,priority:1,
  ...(r.type==='gift'?{rewardSku:r.sku,rewardQty:r.quantity,buyQty:1,maxApplications:1}:{})};
}
