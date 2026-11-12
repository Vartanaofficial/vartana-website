import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/admin-auth";
import { requestMasterScript } from "@/lib/master-products";
import { decodeCheckoutPromos } from "@/lib/checkout-promos";


function authorized(req: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = req.cookies.get("vartana_admin_session")?.value;
  return Boolean(secret && token && verifyAdminSessionToken(token, secret));
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ message: "Sesi admin berakhir." }, { status: 401 });
  try {
    const data = await requestMasterScript("getPromotions");
    return NextResponse.json({ promoVersion:data.promoVersion||0,promos: decodeCheckoutPromos(data.promotions || []) }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Promo belum bisa dimuat." }, { status: 502 }); }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ message: "Sesi admin berakhir." }, { status: 401 });
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const name = String(body.name || "").trim();
    const { type, active } = body;
    const shippingMode=body.shippingMode||'amount',area=body.area||'all';
    if(!['amount','free'].includes(shippingMode)||!['all','jabodetabek'].includes(area))return NextResponse.json({message:'Area atau jenis ongkir tidak valid.'},{status:400});
    const buySkus:string[]=Array.isArray(body.buySkus)?[...new Set<string>(body.buySkus)]:[];if(buySkus.length>100||buySkus.some(v=>typeof v!=='string'||!v||v.length>100))return NextResponse.json({message:'Daftar SKU pemicu tidak valid.'},{status:400});
    const value = Number(body.value), minSpend = Number(body.minSpend || 0), maxDiscount = Number(body.maxDiscount || 0);
    const startDate = String(body.startDate || ""), endDate = String(body.endDate || "");
    const rewardRule = ["bogo","gift","redeem"].includes(type);
    const buySku=String(buySkus[0]||body.buySku||""),rewardSku=type==='bogo'?buySku:String(body.rewardSku||"");
    const buyQty=Number(body.buyQty||1),rewardQty=Number(body.rewardQty||1),maxApplications=Number(body.maxApplications||1),redeemPrice=Number(body.redeemPrice||0),priority=Number(body.priority||100);
    if (!/^[A-Z0-9_-]{3,30}$/.test(code) || !name || name.length > 150 || !["percent", "nominal", "shipping", "bogo", "gift", "redeem"].includes(type)
      || ![value, minSpend, maxDiscount].every(n => Number.isFinite(n) && n >= 0) || (!rewardRule && !(type==='shipping'&&shippingMode==='free') && value <= 0) || (type === "percent" && value > 100)
      || ![buyQty,rewardQty,maxApplications,priority].every(n=>Number.isInteger(n)&&n>=1&&n<=999) || !Number.isFinite(redeemPrice) || redeemPrice<0
      || (rewardRule && (!buySku || !rewardSku || rewardQty*maxApplications>999))
      || [startDate, endDate].some(d => d && (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d)))) || (startDate && endDate && startDate > endDate)) {
      return NextResponse.json({ message: "Periksa kode, nilai diskon, dan tanggal promo." }, { status: 400 });
    }
    if(type==='bogo'&&buySkus.length>1)return NextResponse.json({message:'Promo produk sama hanya untuk satu SKU.'},{status:400});
    const requestId=String(body.requestId||crypto.randomUUID());
    if(!/^[a-f0-9-]{36}$/i.test(requestId))return NextResponse.json({message:'Kunci simpan tidak valid.'},{status:400});
    const id=body.id?String(body.id):'CHECKOUT-'+requestId;
    const result = await requestMasterScript(body.id ? "updatePromotion" : "createPromotion", {
      requireExisting:!!body.id,requireWriteVersion:4,promotionId: id, sku: "CHECKOUT", promotionName: name, active: active === true, startDate, endDate,
      promoPrice: type === "percent" ? 0 : value, discountPercentage: type === "percent" ? value / 100 : 0,
      scope: "checkout-v2", checkoutCode: code, checkoutType: type, checkoutValue: value, minSpend, maxDiscount,
      bannerText: JSON.stringify({ scope: "checkout-v2", code, type, value, minSpend, maxDiscount,
        automatic:body.automatic===true&&type!=='redeem',stackable:body.stackable!==false,priority,
        buySku,buySkus,buyQty,rewardSku,rewardQty,redeemPrice,maxApplications,shippingMode,area }),
    });
    if (result.success !== true) throw new Error("Save failed");
    const saved=result.verified===true&&result.promoVersion===4?decodeCheckoutPromos([result.promotion||{}])[0]:null;
    const expected = { code, name, type, value, minSpend, maxDiscount, startDate, endDate, active: active === true,
      automatic: body.automatic === true && type !== "redeem", stackable: body.stackable !== false, priority,
      buySku, buyQty, rewardSku, rewardQty, redeemPrice, maxApplications,shippingMode,area };
    if (!saved || JSON.stringify(saved.buySkus||[])!==JSON.stringify(buySkus)|| Object.entries(expected).some(([key, value]) => saved[key as keyof typeof saved] !== value)) {
      return NextResponse.json({ success: false, saved: true, message: "Penyimpanan sudah dikirim, tetapi rincian promo belum cocok saat dibaca ulang. Muat ulang daftar dan pastikan Apps Script v2 sudah dideploy." }, { status: 502 });
    }
    return NextResponse.json({ success: true, spreadsheet: "Promotions", verified: true, promo:saved, message:body.id?"Promo berhasil diperbarui.":"Promo berhasil ditambahkan." });
  } catch(error) { const message=error instanceof Error?error.message:'Promo belum berhasil disimpan.';return NextResponse.json({ message }, { status:/sudah digunakan|tidak ditemukan/i.test(message)?409:502 }); }
}
