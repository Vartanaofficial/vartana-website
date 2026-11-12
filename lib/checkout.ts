import {resolvePromoDestination,promoAreaError} from './promo-area';
import {readCheckoutMaster} from './checkout-master';
import { buildStoreCatalog } from "./store-catalog";
import { decodeCheckoutPromos, promoInPeriod } from "./checkout-promos";
import { evaluatePromoStack } from "./promo-stack";
import { puzzleRequest } from './puzzle-server';
import {gameRewardPromo} from './game-reward';
import type {MasterProduct} from './store-catalog';

export type CheckoutItem = { sku: string; quantity: number };
export type CheckoutInput = { items: CheckoutItem[]; promoCode?: string; phone?: string; orderKey?: string; districtId?: string; provinceName?: string; cityName?:string; districtName?:string; shippingService?: string };
export type ShippingRate = { id: string; name: string; price: number; duration: string; estimated: boolean };

async function shippingRates(districtId: string, provinceName: string, weight: number): Promise<ShippingRate[]> {
  const key = process.env.BITESHIP_API_KEY;
  if (key && process.env.ORIGIN_DISTRICT_ID) {
    const response = await fetch("https://api.biteship.com/v1/rates/couriers", {
      method: "POST", headers: { Authorization: key, "Content-Type": "application/json" }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ origin_area_id: process.env.ORIGIN_DISTRICT_ID, destination_area_id: districtId, couriers: "jnt,jne", items: [{ name: "VARTANA", value: 1, weight, quantity: 1 }] }),
    });
    const data = await response.json();
    if (!response.ok || !Array.isArray(data.pricing) || !data.pricing.length) throw new Error("Tarif kurir belum tersedia untuk alamat ini.");
    return data.pricing.map((r: Record<string, string | number>) => ({ id: `${r.courier_code}-${r.courier_service_code}`, name: `${r.courier_name} ${r.courier_service_name}`, price: Number(r.price), duration: String(r.duration || ""), estimated: false }));
  }
  const name = provinceName.toLowerCase();
  const price = /banten|jakarta|jawa barat/.test(name) ? 13000 : /jawa|yogyakarta/.test(name) ? 18000 : /maluku|papua/.test(name) ? 65000 : /kalimantan|sulawesi/.test(name) ? 42000 : 28000;
  // Preserve the existing estimated-rate mode and label it clearly in checkout.
  return [{ id: "jnt-ez", name: "J&T EZ", price: price * Math.max(1, Math.ceil(weight / 1000)), duration: "2–5 hari", estimated: true }, { id: "jne-reg", name: "JNE REG", price: (price - 1000) * Math.max(1, Math.ceil(weight / 1000)), duration: "2–5 hari", estimated: true }];
}

export async function checkoutQuote(input: CheckoutInput,options:{freshMaster?:boolean;masterData?:{master:MasterProduct[];promoData:{promotions:Record<string,unknown>[]}}}={}) {
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 100) throw new Error("Keranjang masih kosong atau tidak valid.");
  const {master,promoData} = options.masterData||await readCheckoutMaster(options.freshMaster!==false);
  const catalog = buildStoreCatalog(master);
  const seen = new Set<string>();
  const lines = input.items.map(item => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999 || seen.has(item.sku)) throw new Error("Jumlah produk tidak valid.");
    seen.add(item.sku);
    const product = catalog.find(p => p.variants?.some(v => v.sku === item.sku));
    const variant = product?.variants?.find(v => v.sku === item.sku);
    if (!product || !variant) throw new Error("Ada produk yang sudah tidak tersedia. Kembali ke katalog dan periksa keranjang.");
    return { sku: item.sku, quantity: item.quantity, name: product.name, variant: variant.size, image: variant.image || product.image || "", price: variant.priceValue, weight: variant.weightGram || 100 };
  });
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const promos = decodeCheckoutPromos(promoData.promotions || []);
  const codes = String(input.promoCode || "").split(/[\s,]+/).filter(Boolean);
  const puzzleCodes = codes.filter(code => code.toUpperCase().startsWith('PUZ-'));
  if (puzzleCodes.length) {
    if (codes.length !== 1) throw new Error('Gunakan voucher puzzle sendiri tanpa kode promo lain.');
    const code = puzzleCodes[0].toUpperCase();
    const validated = await puzzleRequest('puzzleVoucher', { code, phone: input.phone || '', orderKey: input.orderKey || '' });
    if (!validated.voucher) throw new Error('Hadiah Games belum dapat diverifikasi.');
    // A personal reward is only included after private validation for this customer.
    promos.push(gameRewardPromo(validated.voucher,code));
    codes[0] = code;
  }
  if(codes.length>20)throw new Error("Maksimal 20 kode promo per pesanan.");
  const availableProducts = catalog.flatMap(product=>(product.variants||[]).map(variant=>({sku:variant.sku!,name:product.name,variant:variant.size,image:variant.image||product.image||"",price:variant.priceValue,weight:variant.weightGram||100})));
  const regional=promos.some(p=>p.area==='jabodetabek'&&promoInPeriod(p)&&(p.automatic||codes.includes(p.code))),destination=regional&&input.districtId?await resolvePromoDestination(input.districtId):undefined;
  const preliminary = evaluatePromoStack(promos,codes,lines,availableProducts,0,destination);
  const weight = [...lines,...preliminary.rewards].reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const rates = input.districtId && input.provinceName ? await shippingRates(input.districtId, destination?.provinceName||input.provinceName, weight) : [];
  const shipping = rates.find(r => r.id === input.shippingService) || rates[0] || null;
  const discount = evaluatePromoStack(promos,codes,lines,availableProducts,shipping?.price||0,destination);
  return { destination, lines, subtotal, shipping, rates, productDiscount: discount.productDiscount, shippingDiscount: discount.shippingDiscount,
    total: discount.total, rewardLines: discount.rewards, redeemTotal: discount.redeemTotal, appliedPromos: discount.applied,
    promoCode: discount.applied.map(p=>p.code).join(", "), promoError: discount.errors.join(" "),
    promos: promos.filter(p => promoInPeriod(p)).map(p => ({ shippingMode:p.shippingMode||'amount',area:p.area||'all',eligibleArea:!promoAreaError(p.area,destination),code: p.code, name: p.name, minSpend: p.minSpend, type: p.type, value: p.value, maxDiscount: p.maxDiscount,
      automatic:!!p.automatic,stackable:p.stackable!==false,buyQty:p.buyQty||1,buyName:p.buySkus&&p.buySkus.length>1?"produk pilihan (boleh campur varian)":availableProducts.find(item=>item.sku===p.buySku)?.name||"produk pilihan",rewardQty:p.rewardQty||1,rewardName:availableProducts.find(item=>item.sku===(p.type==='bogo'?p.buySku:p.rewardSku))?.name||"",redeemPrice:p.redeemPrice||0 })),
  };
}

export type CheckoutQuote = Awaited<ReturnType<typeof checkoutQuote>>;
