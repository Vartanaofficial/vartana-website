import type { Product, ProductVariant } from "./products";
export type StoredCartItem = { product: Product; selectedVariant: ProductVariant; quantity: number };
export const CART_KEY = "vartana_cart_v1";
export function readCart(): StoredCartItem[] {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(value) ? value.filter(item => item?.selectedVariant?.sku && item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
}
export function writeCart(items: StoredCartItem[]) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }
