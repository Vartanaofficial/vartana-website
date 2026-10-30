export type CheckoutPromo = {
  id: string; code: string; name: string; type: "percent" | "nominal" | "shipping" | "bogo" | "gift" | "redeem";
  value: number; minSpend: number; maxDiscount: number; startDate: string; endDate: string; active: boolean;
  automatic?: boolean; stackable?: boolean; priority?: number;
  buySku?: string; buyQty?: number; rewardSku?: string; rewardQty?: number; redeemPrice?: number; maxApplications?: number;
};

export function jakartaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(p => p.type === type)!.value).join("-");
}

export function decodeCheckoutPromos(rows: Record<string, unknown>[]): CheckoutPromo[] {
  return rows.flatMap(row => {
    try {
      let config;
      try { config = JSON.parse(String(row.bannerText || "")); } catch { /* Explicit readable columns below. */ }
      if (!config || !["checkout-v1", "checkout-v2"].includes(config.scope)) config = row.scope === "checkout-v1" ? {
        scope: row.scope, code: row.checkoutCode, type: row.checkoutType, value: row.checkoutValue,
        minSpend: row.minSpend, maxDiscount: row.maxDiscount,
      } : null;
      if (!config || !["percent", "nominal", "shipping", "bogo", "gift", "redeem"].includes(config.type)) return [];
      const rewardRule=["bogo","gift","redeem"].includes(config.type);
      if(!/^[A-Z0-9_-]{3,30}$/.test(String(config.code||""))
        || ![Number(config.value||0),Number(config.minSpend||0),Number(config.maxDiscount||0),Number(config.redeemPrice||0)].every(n=>Number.isFinite(n)&&n>=0)
        || (!rewardRule&&Number(config.value)<=0) || (config.type==='percent'&&Number(config.value)>100)
        || ![Number(config.buyQty||1),Number(config.rewardQty||1),Number(config.maxApplications||1),Number(config.priority||100)].every(n=>Number.isInteger(n)&&n>=1&&n<=999)
        || (rewardRule&&(!config.buySku||(!config.rewardSku&&config.type!=='bogo')||Number(config.rewardQty||1)*Number(config.maxApplications||1)>999)))return [];
      return [{ id: String(row.promotionId), code: config.code, name: String(row.promotionName), type: config.type,
        value: Number(config.value), minSpend: Number(config.minSpend) || 0, maxDiscount: Number(config.maxDiscount) || 0,
        automatic: config.automatic === true && config.type !== "redeem", stackable: config.stackable !== false, priority: Number(config.priority) || 100,
        buySku: String(config.buySku || ""), buyQty: Number(config.buyQty) || 1, rewardSku: String(config.rewardSku || ""),
        rewardQty: Number(config.rewardQty) || 1, redeemPrice: Number(config.redeemPrice) || 0, maxApplications: Number(config.maxApplications) || 1,
        startDate: String(row.startDate || ""), endDate: String(row.endDate || ""), active: row.active === true }];
    } catch { return []; }
  });
}

export function promoInPeriod(promo: CheckoutPromo, today = jakartaDate()) {
  return promo.active && (!promo.startDate || promo.startDate <= today) && (!promo.endDate || promo.endDate >= today);
}

export function applyCheckoutPromo(promo: CheckoutPromo | undefined, subtotal: number, shipping: number) {
  if (!promo) return { productDiscount: 0, shippingDiscount: 0, error: "Kode promo tidak ditemukan." };
  if (!promoInPeriod(promo)) return { productDiscount: 0, shippingDiscount: 0, error: "Promo sedang tidak aktif atau sudah berakhir." };
  if (subtotal < promo.minSpend) return { productDiscount: 0, shippingDiscount: 0, error: `Minimal belanja Rp${promo.minSpend.toLocaleString("id-ID")} untuk promo ini.` };
  let amount = promo.type === "percent" ? Math.floor(subtotal * Math.min(100, promo.value) / 100) : promo.value;
  if (promo.maxDiscount > 0) amount = Math.min(amount, promo.maxDiscount);
  amount = Math.max(0, Math.floor(amount));
  return { productDiscount: promo.type === "shipping" ? 0 : Math.min(subtotal, amount), shippingDiscount: promo.type === "shipping" ? Math.min(shipping, amount) : 0, error: "" };
}
