import type { Product, ProductVariant } from "./products";
import { calculatePromoPrice } from "./product-pricing";
import { productImageUrl } from "./product-image";

export type MasterProduct = {
  sku: string;
  productNumber?: string;
  productName: string;
  variantName?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
  status?: string;
  sellingPrice?: number;
  discountType?: string;
  discountValue?: number;
  ingredients?: string | string[];
  benefits?: string;
  brewingInstructions?: string;
  weightGram?: number;
  teaBagCount?: number;
  teaBagWeightGram?: number;
  packageType?: string;
};

const localized = (value = "") => ({ id: value, en: value });
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export const emptyCatalogProduct: Product = {
  id: "", number: "", name: "", subtitle: "", status: "COMING SOON", priceValue: 0,
  ingredients: [], description: localized(), taste: localized(), aroma: localized(), difference: localized(), benefit: localized(),
};

export function catalogImage(raw = "") {
  return productImageUrl(raw);
}

export function buildStoreCatalog(rows: MasterProduct[]): Product[] {
  const groups = new Map<string, Product>();
  for (const row of rows) {
    const price = Number(row.sellingPrice);
    if (row.active !== true || !row.sku || !row.productName || !Number.isFinite(price) || price <= 0) continue;
    const key = row.productNumber?.trim() || row.sku;
    const discountType = row.discountType === "nominal" ? "nominal" : "percent";
    const discountValue = row.discountType === "percent" || row.discountType === "nominal" ? Number(row.discountValue) || 0 : 0;
    const finalPrice = calculatePromoPrice(price, discountType, discountValue);
    const ingredients = Array.isArray(row.ingredients) ? row.ingredients : String(row.ingredients || "").split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    const variant: ProductVariant = {
      sku: row.sku, size: row.variantName || row.packageType || "1 pcs", priceValue: finalPrice,
      regularPrice: money(price), promoPrice: money(finalPrice),
      discountPercentage: finalPrice < price ? `${Math.round((1 - finalPrice / price) * 100)}% OFF` : "",
      image: catalogImage(row.imageUrl), bagCount: Number(row.teaBagCount) || undefined,
      weightGram: Number(row.weightGram) || Number(row.teaBagCount) * Number(row.teaBagWeightGram) || 100,
      ingredients: ingredients.map(localized), description: localized(row.description), benefit: localized(row.benefits),
      brewingInstructions: row.brewingInstructions,
    };
    const existing = groups.get(key);
    if (existing) {
      existing.variants!.push(variant);
      continue;
    }
    groups.set(key, {
      id: key, number: key, name: row.productName, subtitle: row.subtitle || row.packageType || "",
      status: "READY STOCK", image: variant.image, priceValue: finalPrice,
      regularPrice: variant.regularPrice, promoPrice: variant.promoPrice, discountPercentage: variant.discountPercentage,
      variants: [variant], ingredients: ingredients.map(localized), description: localized(row.description),
      taste: localized(), aroma: localized(), difference: localized(row.description), benefit: localized(row.benefits),
      brewingInstructions: row.brewingInstructions,
    });
  }
  return [...groups.values()];
}
