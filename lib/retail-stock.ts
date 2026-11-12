import {requestMasterScript} from './master-products';
import type {Product} from './products';
export type RetailStock={sku:string;qty:number|null;reservedQty:number;availableQty:number};
export type RetailStockReport={success:true;retailStockVersion:1;reservationHours:number;items:RetailStock[]};
export async function readRetailStock(orderKey=''):Promise<RetailStockReport>{
 try{const data=await requestMasterScript('getRetailStock',{orderKey});if(data.retailStockVersion===1&&Array.isArray(data.items))return data as RetailStockReport;}catch{/* Older backend still offers read-only physical balances. Order writes remain capability-gated. */}
 const old=await requestMasterScript('getProductStock');if(old.productStockVersion!==1||!Array.isArray(old.items))throw new Error('Status stok belum dapat diverifikasi. Coba lagi setelah stok diperbarui.');
 return {success:true,retailStockVersion:1,reservationHours:0.5,items:old.items.map((x:RetailStock)=>({...x,reservedQty:x.reservedQty||0,availableQty:Math.max(0,x.availableQty??x.qty??0)}))};
}
export function withRetailStock(products:Product[],stock:RetailStockReport):Product[]{const map=new Map(stock.items.map(s=>[s.sku,s]));return products.map(p=>({...p,variants:p.variants?.map(v=>{const s=map.get(v.sku||'');return {...v,stockKnown:s?.qty!==null&&s?.qty!==undefined,stockAvailable:s?Math.max(0,Math.floor(s.availableQty)):0};})}));}
export function assertRetailStock(items:{sku:string;quantity:number}[],stock:RetailStockReport){const demand=new Map<string,number>(),map=new Map(stock.items.map(s=>[s.sku,s]));for(const x of items)demand.set(x.sku,(demand.get(x.sku)||0)+x.quantity);for(const [sku,qty] of demand){const s=map.get(sku),available=s&&s.qty!==null?Math.max(0,Math.floor(s.availableQty)):0;if(qty>available)throw new Error(`Stok ${sku} tidak cukup. Tersedia ${available} kemasan. Perbarui keranjang.`);}}
