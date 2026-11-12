import type { Product, ProductVariant } from "./products";
export type StoredCartItem = { product: Product; selectedVariant: ProductVariant; quantity: number };
export const CART_KEY = "vartana_cart_v1";
export const CART_UPDATED_EVENT = "vartana-cart-updated";
export function cartSnapshot():string {try{return localStorage.getItem(CART_KEY)||"[]";}catch{return "[]";}}
export function parseCart(value:string):StoredCartItem[]{try{const items=JSON.parse(value);return Array.isArray(items)?items.filter(item=>item?.selectedVariant?.sku&&item?.product?.id&&Number.isInteger(item.quantity)&&item.quantity>0):[];}catch{return [];}}
export function readCart(): StoredCartItem[] {
  return parseCart(cartSnapshot());
}
export function writeCart(items: StoredCartItem[]) { localStorage.setItem(CART_KEY, JSON.stringify(items));if(typeof window!=='undefined')window.dispatchEvent(new Event(CART_UPDATED_EVENT)); }
export function subscribeCart(listener:()=>void){
 const storage=(event:StorageEvent)=>{if(event.key===CART_KEY||event.key===null)listener();};
 window.addEventListener(CART_UPDATED_EVENT,listener);window.addEventListener('storage',storage);
 return()=>{window.removeEventListener(CART_UPDATED_EVENT,listener);window.removeEventListener('storage',storage);};
}
