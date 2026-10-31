import { calculatePromoPrice } from './product-pricing';

export type AnalysisProduct = { sku: string; productName: string; variantName?: string; sellingPrice?: number; hpp?: number; discountType?: string; discountValue?: number };
export type AnalysisOrder = { sku?: string; itemsSummary?: string; grandTotal?: unknown; subtotalProducts?: unknown; customerShippingFee?: unknown; originalShipping?: unknown; shippingSubsidy?: unknown; recoveredLegacy?: boolean; totalCogs?: number | null };
export function moneyValue(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  let text = String(value).trim().replace(/^Rp\.?\s*/i, '').replace(/\s/g, '');
  if (!text) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)) text = text.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(text)) text = text.replace(/,/g, '');
  else if (/^\d+(,\d{1,2})?$/.test(text)) text = text.replace(',', '.');
  else if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) && number >= 0 && number <= Number.MAX_SAFE_INTEGER ? number : null;
}

// Compatibility with the old API whose legacy rows were read one column off.
export function recoverLegacyOrder<T extends AnalysisOrder>(order: T): T {
  const total = moneyValue(order.itemsSummary);
  if (total === null || !/\(\d+\s*x\)/i.test(order.sku || '') || moneyValue(order.grandTotal) !== 0) return order;
  const fee = moneyValue(order.customerShippingFee);
  return { ...order, sku: '', itemsSummary: order.sku, grandTotal: total,
    subtotalProducts: fee !== null && fee <= total ? total - fee : null,
    originalShipping: null, shippingSubsidy: null, recoveredLegacy: true };
}

const norm = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function analyzeOrderItems(order: AnalysisOrder, products: AnalysisProduct[]) {
  const summary = order.itemsSummary || '';
  const parts = summary.split(/\s*(?:\n|;|\|)\s*|,\s*(?=[^,]+\[)/).filter(part => Boolean(part) && !/^(Promo\s|Kurir\s|Catatan:|Pembayaran\s)/i.test(part));
  const items: { product: AnalysisProduct; qty: number; regular: number; net: number; cost: number | null }[] = [];
  let unmatched = 0;
  for (const part of parts.length ? parts : ['']) {
    const match = part.match(/\((\d+)\s*x(?:\s*@Rp[\d.,]+)?\)/i) || part.match(/(?:^|\s)(\d+)\s*x\s/i);
    const qty = match ? Number(match[1]) : 1;
    const exactSku = products.find(p => p.sku === order.sku && parts.length <= 1);
    const label = norm(part.split(/\(\d+\s*x/i)[0].replace(/^(GRATIS|TEBUS MURAH)\s+/i, ''));
    const candidates = products.filter(p => label === norm(`${p.productName} ${p.variantName || ''}`));
    const product = exactSku || (candidates.length === 1 ? candidates[0] : undefined);
    if (!product || !Number.isSafeInteger(qty) || qty <= 0) { unmatched++; continue; }
    const regular = moneyValue(product.sellingPrice) || 0;
    const net = calculatePromoPrice(regular, product.discountType === 'nominal' ? 'nominal' : 'percent', product.discountValue || 0);
    const hpp = moneyValue(product.hpp);
    items.push({ product, qty, regular: regular * qty, net: net * qty, cost: hpp !== null && hpp > 0 ? hpp * qty : null });
  }
  const recordedNet = moneyValue(order.subtotalProducts);
  const estimatedNet = items.reduce((sum, item) => sum + item.net, 0);
  return { items, unmatched, units: items.reduce((sum, item) => sum + item.qty, 0),
    regular: unmatched ? null : items.reduce((sum, item) => sum + item.regular, 0),
    net: recordedNet ?? (unmatched ? null : estimatedNet), estimated: recordedNet === null,
    cogs: unmatched || items.some(item => item.cost === null) ? null : items.reduce((sum, item) => sum + (item.cost || 0), 0) };
}
