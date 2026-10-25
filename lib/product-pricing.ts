export type DiscountType = "percent" | "nominal";

/**
 * Menghitung harga promo dan membulatkan ke atas
 * ke kelipatan Rp100.
 */
export function calculatePromoPrice(sellingPrice: number, discountType: DiscountType, discountValue: number): number {
  const price = Math.max(0, Math.floor(Number(sellingPrice) || 0));
  const discount = Math.max(0, Number(discountValue) || 0);

  if (price === 0 || discount === 0) {
    return price;
  }

  let deduction: number;

  if (discountType === "percent") {
    deduction = price * (Math.min(discount, 100) / 100);
  } else {
    deduction = Math.min(discount, price);
  }

  const rawPromoPrice = Math.max(0, price - deduction);

  // Pembulatan ke atas ke kelipatan Rp100.
  return Math.ceil(rawPromoPrice / 100) * 100;
}
