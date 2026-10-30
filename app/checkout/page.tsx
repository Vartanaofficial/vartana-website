"use client";

import Link from "next/link";
import { BotanicalSprig, CheckoutProgress } from "./CheckoutVisuals";
import "./checkout.css";
import { FormEvent, useEffect, useState } from "react";
import ProductImage from "@/app/components/ProductImage";
import { readCart, writeCart, type StoredCartItem } from "@/lib/cart-storage";
import type { CheckoutQuote } from "@/lib/checkout";
import { PAYMENT_DETAILS } from "@/lib/payment-details";
import type { PostalOption } from "@/lib/postal-codes";

type Region = { id: string; name: string };
const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const field = "checkout-input mt-2 w-full rounded-xl border border-[#dce1d6] bg-white px-4 py-3.5 text-sm text-[#173b2b] outline-none transition focus:border-[#a88b43] focus:ring-2 focus:ring-[#a88b43]/10 disabled:bg-[#f1f1eb]";
const initialCustomer = { name: "", phone: "", email: "", address: "", provinceId: "", provinceName: "", cityId: "", cityName: "", districtId: "", districtName: "", postalCode: "", notes: "" };

export default function CheckoutPage() {
  const [cart, setCart] = useState<StoredCartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [customer, setCustomer] = useState(initialCustomer);
  const [provinces, setProvinces] = useState<Region[]>([]), [cities, setCities] = useState<Region[]>([]), [districts, setDistricts] = useState<Region[]>([]);
  const [regionError, setRegionError] = useState("");
  const [regionRetry, setRegionRetry] = useState(0);
  const [postalOptions, setPostalOptions] = useState<PostalOption[]>([]);
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalError, setPostalError] = useState("");
  const [manualPostal, setManualPostal] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [loading, setLoading] = useState(false), [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [codeInput, setCodeInput] = useState(""), [promoCode, setPromoCode] = useState("");
  const [shippingService, setShippingService] = useState("");
  const [retry, setRetry] = useState(0);
  const [orderKey, setOrderKey] = useState("");
  const [receipt, setReceipt] = useState<{ serial: string; total: number } | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const savedCart = readCart();
    setCart(savedCart);
    try { const saved = JSON.parse(sessionStorage.getItem("vartana_checkout_draft") || "null"); if (saved) setCustomer({ ...initialCustomer, ...saved }); } catch { /* Use empty form. */ }
    let key = sessionStorage.getItem("vartana_checkout_key");
    if (key && savedCart.length && sessionStorage.getItem(`vartana_receipt_${key}`)) {
      key = null;
    }
    if (!key) { key = crypto.randomUUID(); sessionStorage.setItem("vartana_checkout_key", key); }
    setOrderKey(key);
    try { const saved = JSON.parse(sessionStorage.getItem(`vartana_receipt_${key}`) || "null"); if (saved) setReceipt(saved); } catch { /* No completed order. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) { writeCart(cart); sessionStorage.setItem("vartana_checkout_draft", JSON.stringify(customer)); }
  }, [cart, customer, ready]);

  useEffect(() => {
    const controller = new AbortController();
    setRegionError("");
    async function load() {
      try {
        const get = async (path: string) => { const r = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/${path}.json`, { signal: controller.signal }); if (!r.ok) throw new Error(); return r.json(); };
        setProvinces(await get("provinces"));
        if (customer.provinceId) setCities(await get(`regencies/${customer.provinceId}`));
        if (customer.cityId) setDistricts(await get(`districts/${customer.cityId}`));
      } catch { if (!controller.signal.aborted) setRegionError("Daftar wilayah belum bisa dimuat. Coba lagi."); }
    }
    void load();
    return () => controller.abort();
  }, [customer.provinceId, customer.cityId, regionRetry]);

  const itemsKey = JSON.stringify(cart.map(item => ({ sku: item.selectedVariant.sku!, quantity: item.quantity })));
  useEffect(() => {
    const controller = new AbortController();
    setPostalOptions([]); setPostalError(""); setManualPostal(false);
    if (!customer.districtId) { setPostalLoading(false); return; }
    setPostalLoading(true);
    const params = new URLSearchParams({ province: customer.provinceName, city: customer.cityName, district: customer.districtName });
    fetch(`/api/postal-codes?${params}`, { signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      const options: PostalOption[] = data.options || [];
      setPostalOptions(options);
      if (!options.length) { setManualPostal(true); setPostalError("Pilihan kode pos belum tersedia. Isi manual ya."); }
      else setCustomer(previous => ({ ...previous, postalCode: options.some(option => option.code === previous.postalCode) ? previous.postalCode : options.length === 1 ? options[0].code : "" }));
    }).catch(error => {
      if (!controller.signal.aborted) { setManualPostal(true); setPostalError(error instanceof Error ? error.message : "Isi kode pos manual."); }
    }).finally(() => { if (!controller.signal.aborted) setPostalLoading(false); });
    return () => controller.abort();
  }, [customer.districtId, customer.provinceName, customer.cityName, customer.districtName]);
  useEffect(() => {
    if (!ready || !cart.length || receipt) return;
    const controller = new AbortController();
    setLoading(true); setError("");
    const timer = window.setTimeout(async () => {
      try {
        const r = await fetch("/api/checkout/quote", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
          body: JSON.stringify({ items: JSON.parse(itemsKey), promoCode, districtId: customer.districtId, provinceName: customer.provinceName, shippingService }) });
        const data = await r.json(); if (!r.ok) throw new Error(data.message);
        setQuote(data);
      } catch (error) { if (!controller.signal.aborted) { setQuote(null); setError(error instanceof Error ? error.message : "Ringkasan belum bisa dimuat."); } }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [ready, itemsKey, promoCode, customer.districtId, customer.provinceName, shippingService, retry, receipt, cart.length]);

  function quantity(sku: string, delta: number) {
    setCart(previous => previous.map(item => item.selectedVariant.sku === sku ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
  }

  function choosePromo(code: string) {
    const cleaned=code.trim().toUpperCase();
    if(!cleaned)return;
    setPromoCode(previous=>[...new Set([...previous.split(/[\s,]+/),cleaned])].filter(Boolean).join(','));
    setCodeInput('');
  }
  function removePromo(code: string) { setPromoCode(previous=>previous.split(/[\s,]+/).filter(value=>value!==code).join(',')); }
  function offerDescription(p: NonNullable<CheckoutQuote['promos']>[number]) {
    if(p.type==='bogo'||p.type==='gift')return 'Beli '+p.buyQty+' '+p.buyName+', gratis '+p.rewardQty+' '+p.rewardName;
    if(p.type==='redeem')return 'Beli '+p.buyQty+' '+p.buyName+', tebus '+p.rewardName+' '+money(p.redeemPrice);
    return p.type==='percent'?'Diskon '+p.value+'%':p.type==='shipping'?'Potongan ongkir '+money(p.value):'Potongan belanja '+money(p.value);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!quote?.shipping || loading || saving || quote.promoError) return;
    setSaving(true); setOrderError("");
    try {
      const r = await fetch("/api/checkout/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        items: JSON.parse(itemsKey), customer, promoCode, shippingService: quote.shipping.id, expectedTotal: quote.total, orderKey,
      }) });
      const data = await r.json(); if (!r.ok) throw new Error(data.message);
      sessionStorage.setItem(`vartana_receipt_${orderKey}`, JSON.stringify(data));
      writeCart([]); setReceipt(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { setOrderError(error instanceof Error ? error.message : "Pesanan belum tersimpan."); setRetry(value => value + 1); }
    finally { setSaving(false); }
  }

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(label); } catch { setCopied("Pilih dan salin teks secara manual."); }
  }

  const wa = receipt ? `https://wa.me/${PAYMENT_DETAILS.whatsapp}?text=${encodeURIComponent(`Halo VARTANA, saya ingin konfirmasi pembayaran pesanan ${receipt.serial} atas nama ${customer.name}, total ${money(receipt.total)}. Saya akan melampirkan bukti transfer.`)}` : "";

  return <main className="premium-checkout min-h-screen text-[#183d2c]">
    <header className="checkout-topbar border-b border-[#dce0d4] bg-[#FCFAF5] px-5 py-5 sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><Link href="/" className="checkout-brand"><img src="/Logo%20Vartana%20Bulat.png" alt="Logo VARTANA" width="54" height="54"/><span className="font-serif text-2xl tracking-[0.12em]">VARTANA<span className="mt-1 block text-[8px] tracking-[0.3em] text-[#8a7446]">BOTANICAL WELLNESS</span></span></Link><Link href="/#collection" className="text-xs text-[#657565]">← Kembali ke katalog</Link></div>
    </header>
    <div className="checkout-shell mx-auto max-w-6xl px-5 py-10 sm:px-10 md:py-14">
      <BotanicalSprig className="checkout-side-sprig" />
      <div className="checkout-hero"><div className="checkout-hero-copy">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#987a39]">A little ritual, delivered.</p>
      <div className="checkout-ornament" aria-hidden="true" />
      <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{receipt ? "Satu langkah lagi." : "Lengkapi pilihan baikmu."}</h1>
      <p className="mt-4 max-w-lg text-sm leading-7 text-[#6a7668]">{receipt ? "Pesanan sudah tercatat. Selesaikan transfer dan kirim bukti pembayaran untuk dikonfirmasi tim VARTANA." : "Racikan pilihanmu, dikemas dengan penuh perhatian. Lengkapi pengiriman dan nikmati promo yang tersedia."}</p>
      </div><div className="checkout-hero-art" aria-hidden="true"><BotanicalSprig className="checkout-hero-sprig"/><div className="checkout-hero-photo"><img src="/vartana-spices-hero.jpg" alt="" loading="eager" /></div><span className="checkout-art-caption">NATURE, IN EVERY LITTLE RITUAL.</span></div></div>
      <CheckoutProgress step={receipt ? 2 : customer.name || customer.provinceId || customer.email ? 1 : 0} />

      {!ready ? <p className="py-16">Menyiapkan checkout…</p> : receipt ? <section className="checkout-payment-stage mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-[#dedfd2] bg-white p-7 sm:p-9"><p className="text-xs text-[#7d886f]">NOMOR PESANAN</p><p className="mt-3 break-all font-mono text-sm">{receipt.serial}</p><h2 className="mt-8 font-serif text-2xl">Transfer ke {PAYMENT_DETAILS.bank}</h2><p className="mt-5 text-sm text-[#68745f]">Nomor rekening</p><p className="mt-1 font-mono text-2xl">{PAYMENT_DETAILS.account}</p><button type="button" onClick={() => copy(PAYMENT_DETAILS.account, "Rekening tersalin")} className="mt-2 text-xs underline">Salin rekening</button><p className="mt-4 text-sm">a.n. {PAYMENT_DETAILS.holder}</p><div className="mt-7 rounded-2xl bg-[#f6f3ec] p-5"><p className="text-xs text-[#6c7865]">Total transfer</p><p className="mt-2 font-serif text-3xl">{money(receipt.total)}</p><button type="button" onClick={() => copy(String(receipt.total), "Nominal tersalin")} className="mt-2 text-xs underline">Salin nominal</button></div>{copied && <p role="status" className="mt-3 text-xs">{copied}</p>}</div>
        <div className="flex flex-col justify-center rounded-3xl bg-[#143b2b] p-8 text-[#faf7ee]"><span className="text-xs uppercase tracking-[0.2em] text-[#d8c28b]">Menunggu pembayaran</span><h2 className="mt-4 font-serif text-3xl">Terima kasih sudah memilih VARTANA.</h2><p className="mt-4 text-sm leading-7 text-white/70">Simpan nomor pesananmu. Setelah transfer, kirim bukti pembayaran melalui WhatsApp agar tim kami bisa memproses pesanan.</p><a href={wa} target="_blank" rel="noreferrer" className="mt-8 rounded-full bg-[#dcc58c] px-6 py-4 text-center text-sm font-semibold text-[#173b2b]">Konfirmasi pembayaran →</a><Link href="/#collection" onClick={() => { sessionStorage.removeItem("vartana_checkout_key"); sessionStorage.removeItem("vartana_checkout_draft"); }} className="mt-5 text-center text-xs underline">Kembali berbelanja</Link></div>
      </section> : !cart.length ? <section className="checkout-empty rounded-3xl border border-[#dce0d4] bg-white py-16 text-center"><h2 className="font-serif text-2xl">Keranjangmu masih kosong.</h2><Link href="/#collection" className="mt-6 inline-block rounded-full bg-[#173b2b] px-8 py-3 text-sm text-white">Jelajahi koleksi</Link></section> : <form onSubmit={submit} className="checkout-form grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="checkout-main-column space-y-6">
          <section className="rounded-3xl border border-[#dedfd2] bg-white p-6 sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="font-serif text-2xl">Pilihanmu</h2><span className="text-xs text-[#7b866f]">{cart.reduce((sum,item) => sum + item.quantity,0)} produk</span></div><div className="divide-y divide-[#ecece2]">{(quote?.lines || cart.map(item => ({ sku: item.selectedVariant.sku!, quantity: item.quantity, name: item.product.name, variant: item.selectedVariant.size, image: item.selectedVariant.image || item.product.image || "", price: item.selectedVariant.priceValue }))).map(item => <div key={item.sku} className="checkout-product-row flex gap-4 py-5 first:pt-0"><ProductImage src={item.image} alt={item.name} className="checkout-product-photo h-24 w-24 shrink-0 rounded-2xl bg-[#f6f3ec] p-2 sm:h-28 sm:w-28" /><div className="min-w-0 flex-1"><h3 className="font-serif text-lg">{item.name}</h3><p className="mt-1 text-xs text-[#7b866f]">{item.variant}</p><p className="mt-2 text-sm font-semibold">{money(item.price)}</p><div className="checkout-quantity mt-3 inline-flex items-center gap-4 rounded-full border border-[#dce0d4] px-3 py-1"><button type="button" aria-label={`Kurangi ${item.name}`} onClick={() => quantity(item.sku,-1)}>−</button><span key={item.quantity} className="checkout-quantity-value text-xs">{item.quantity}</span><button type="button" aria-label={`Tambah ${item.name}`} disabled={item.quantity >= 999} onClick={() => quantity(item.sku,1)}>+</button></div></div></div>)}</div>{!!quote?.rewardLines.length && <div className="checkout-rewards"><p className="checkout-section-eyebrow">Keuntungan pilihanmu</p>{quote.rewardLines.map((item,index)=><div key={item.promoCode+'-'+index} className="checkout-reward"><ProductImage src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl bg-[#fffdf7] p-2"/><div className="min-w-0 flex-1"><span className="checkout-reward-tag">{item.kind==='redeem'?'TEBUS MURAH':'HADIAH GRATIS'} / {item.promoCode}</span><p className="mt-1 text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-[#6d795e]">{item.quantity} &times; {item.variant}</p></div><span className="text-sm font-semibold">{item.price?money(item.price*item.quantity):'Gratis'}</span></div>)}</div>}</section>
          <section className="rounded-3xl border border-[#dedfd2] bg-white p-6 sm:p-8"><span className="checkout-section-eyebrow">01 / The destination</span><h2 className="font-serif text-2xl">Tujuan pengiriman</h2><p className="mt-2 text-xs leading-6 text-[#7b866f]">Pastikan alamat dan nomor WhatsApp bisa dihubungi.</p><div className="mt-6 grid gap-5 sm:grid-cols-2">{([['name','Nama lengkap','text'],['phone','Nomor WhatsApp','tel'],['email','Email','email']] as const).map(([key,label,type]) => <label key={key} className={`text-xs font-medium ${key === 'email' ? 'sm:col-span-2' : ''}`}>{label}<input required type={type} autoComplete={key === 'name' ? 'name' : key === 'phone' ? 'tel' : 'email'} value={customer[key]} onChange={e => setCustomer(prev => ({...prev,[key]:e.target.value}))} className={field} /></label>)}
            <label className="text-xs font-medium">Provinsi<select required value={customer.provinceId} onChange={e => { const region=provinces.find(r=>r.id===e.target.value); setCustomer(prev=>({...prev,provinceId:region?.id||"",provinceName:region?.name||"",cityId:"",cityName:"",districtId:"",districtName:"",postalCode:""}));setCities([]);setDistricts([]);setShippingService(""); }} className={field}><option value="">Pilih provinsi</option>{provinces.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label className="text-xs font-medium">Kota / Kabupaten<select required disabled={!customer.provinceId} value={customer.cityId} onChange={e => {const region=cities.find(r=>r.id===e.target.value);setCustomer(prev=>({...prev,cityId:region?.id||"",cityName:region?.name||"",districtId:"",districtName:"",postalCode:""}));setDistricts([]);setShippingService("");}} className={field}><option value="">Pilih kota</option>{cities.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label className="text-xs font-medium">Kecamatan<select required disabled={!customer.cityId} value={customer.districtId} onChange={e=>{const region=districts.find(r=>r.id===e.target.value);setCustomer(prev=>({...prev,districtId:region?.id||"",districtName:region?.name||"",postalCode:""}));setShippingService("");}} className={field}><option value="">Pilih kecamatan</option>{districts.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label className="text-xs font-medium">Kode pos
              {manualPostal ? <input required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} value={customer.postalCode} onChange={e=>setCustomer(prev=>({...prev,postalCode:e.target.value.replace(/\D/g,'')}))} className={field} placeholder="5 digit kode pos" />
                : <select required disabled={!customer.districtId||postalLoading} value={customer.postalCode} onChange={e=>{if(e.target.value==='manual'){setManualPostal(true);setCustomer(prev=>({...prev,postalCode:''}));}else setCustomer(prev=>({...prev,postalCode:e.target.value}));}} className={field}><option value="">{postalLoading?'Memuat kode pos...':!customer.districtId?'Pilih kecamatan dulu':'Pilih kode pos / kelurahan'}</option>{postalOptions.map(option=><option key={option.code} value={option.code}>{option.code} - {option.villages.join(', ')}</option>)}<option value="manual">Kode pos lain / isi manual</option></select>}
              {postalError&&<span role="status" className="mt-2 block text-[10px] font-normal text-[#8c7446]">{postalError}</span>}
              {manualPostal&&postalOptions.length>0&&<button type="button" onClick={()=>setManualPostal(false)} className="mt-2 text-[10px] underline">Kembali ke pilihan kode pos</button>}
            </label>
            <label className="text-xs font-medium sm:col-span-2">Alamat lengkap<textarea required rows={3} autoComplete="street-address" value={customer.address} onChange={e=>setCustomer(prev=>({...prev,address:e.target.value}))} placeholder="Jalan, nomor rumah, RT/RW, dan patokan" className={field} /></label>
            <label className="text-xs font-medium sm:col-span-2">Catatan pesanan <span className="font-normal text-[#899282]">(opsional)</span><textarea rows={2} maxLength={500} value={customer.notes} onChange={e=>setCustomer(prev=>({...prev,notes:e.target.value}))} className={field}/></label></div>{regionError && <p role="alert" className="mt-4 text-xs text-red-700">{regionError} <button type="button" className="underline" onClick={()=>setRegionRetry(v=>v+1)}>Muat ulang</button></p>}</section>
          <section className="rounded-3xl border border-[#dedfd2] bg-white p-6 sm:p-8"><span className="checkout-section-eyebrow">02 / Delivered with care</span><h2 className="font-serif text-2xl">Layanan pengiriman</h2>{loading && customer.districtId && <p role="status" className="checkout-shipping-loading">Memperbarui pilihan pengiriman?</p>}{!customer.districtId ? <p className="mt-4 text-sm text-[#7b866f]">Pilih kecamatan untuk melihat ongkir.</p> : <div className="mt-5 space-y-3">{quote?.rates.map(rate=><label key={rate.id} className={`checkout-rate flex cursor-pointer items-center gap-3 rounded-2xl border p-4 ${quote.shipping?.id===rate.id?'border-[#8a9e7c] bg-[#f7f8f1]':'border-[#e5e7dc]'}`}><input type="radio" name="courier" checked={quote.shipping?.id===rate.id} onChange={()=>setShippingService(rate.id)} className="accent-[#173b2b]"/><span className="flex-1 text-sm">{rate.name}<span className="mt-1 block text-xs text-[#7b866f]">{rate.duration}{rate.estimated?' · Tarif estimasi':''}</span></span><span className="text-sm font-semibold">{money(rate.price)}</span></label>)}</div>}</section>
        </div>
        <aside className="checkout-aside space-y-5">
          <section className="checkout-promo rounded-3xl border border-[#dedfd2] bg-white p-6 sm:p-8"><span className="checkout-section-eyebrow">A little extra, just for you</span><h2 className="font-serif text-2xl">Ada yang lebih istimewa.</h2><p className="mt-2 text-xs leading-6 text-[#7b866f]">Gabungkan keuntungan pilihanmu. Bonus otomatis muncul saat syarat terpenuhi.</p><div className="mt-5 flex gap-2"><input aria-label="Kode promo" onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();choosePromo(codeInput);}}} value={codeInput} onChange={e=>setCodeInput(e.target.value.toUpperCase())} placeholder="Kode promo" className={`${field} mt-0 min-w-0 uppercase`} /><button type="button" onClick={()=>choosePromo(codeInput)} className="checkout-promo-apply rounded-xl bg-[#e9e3d4] px-4 text-xs font-semibold">Pakai</button></div>{promoCode && <div className="checkout-promo-chips">{promoCode.split(/[\s,]+/).filter(Boolean).map(code=><button key={code} type="button" aria-label={'Hapus promo '+code} onClick={()=>removePromo(code)}>{code}<span aria-hidden="true"> &times;</span></button>)}</div>}{quote?.promoError && <p role="alert" className="mt-3 text-xs text-red-700">{quote.promoError}</p>}{quote?.promoCode && !quote.promoError && !loading && <p role="status" className="checkout-success">&#10003; Promo {quote.promoCode} berhasil diterapkan.</p>}<div className="mt-5 space-y-2">{quote?.promos.map(p=><button key={p.code} type="button" disabled={p.automatic} onClick={()=>choosePromo(p.code)} className={`checkout-coupon w-full rounded-xl border border-dashed p-4 text-left ${quote.appliedPromos.some(applied=>applied.code===p.code)?'border-[#70885f] bg-[#f4f7ee]':'border-[#d9d5c5]'}`}><span className="block text-xs font-semibold tracking-wider">{p.code}</span><span className="mt-1 block text-sm">{p.name}</span><span className="mt-1 block text-xs text-[#6c755d]">{offerDescription(p)}</span><span className="mt-2 inline-block text-[10px] font-medium text-[#702b3c]">{p.automatic?"Otomatis saat memenuhi syarat":p.type==="redeem"?"Pilih tebus murah":"Tambahkan promo"}{p.stackable?" / Bisa digabung":" / Tidak bisa digabung"}</span><span className="mt-1 block text-[11px] text-[#7b866f]">Min. belanja {money(p.minSpend)}{p.maxDiscount?` · Maks. ${money(p.maxDiscount)}`:''}</span></button>)}{quote && !quote.promos.length && <p className="text-xs text-[#7b866f]">Belum ada promo checkout yang aktif.</p>}</div></section>
          <section className="checkout-summary rounded-3xl bg-[#143b2b] p-6 text-[#fbf8ef] sm:p-8"><h2 className="font-serif text-2xl">Ringkasan pesanan</h2><div aria-live="polite" className={`mt-7 space-y-4 text-sm ${loading?'opacity-50':''}`}><div className="flex justify-between"><span className="text-white/65">Subtotal produk</span><span>{money(quote?.subtotal||0)}</span></div><div className="flex justify-between"><span className="text-white/65">Pengiriman</span><span>{quote?.shipping?money(quote.shipping.price):'Pilih alamat'}</span></div>{!!quote?.redeemTotal && <div className="flex justify-between gap-3"><span className="text-white/65">Tambahan tebus murah</span><span>{money(quote.redeemTotal)}</span></div>}{quote?.appliedPromos.map(p=>(p.productDiscount>0||p.shippingDiscount>0)&&<div key={p.code} className="flex justify-between gap-3 text-[#d8c28b]"><span>{p.name}<small className="block text-[9px] opacity-70">{p.code}</small></span><span>&minus;{money(p.productDiscount+p.shippingDiscount)}</span></div>)}<div className="flex items-end justify-between border-t border-white/15 pt-5"><span>Total pembayaran</span><strong key={quote?.total} className="font-serif text-3xl font-normal">{money(quote?.total||0)}</strong></div></div>{(error||orderError)&&<div role="alert" className="mt-5 rounded-xl bg-white/10 p-4 text-xs leading-6 text-[#ffdbcf]">{error||orderError} <button type="button" onClick={()=>setRetry(v=>v+1)} className="underline">Coba lagi</button></div>}<button type="submit" disabled={!quote?.shipping||loading||saving||!!quote?.promoError||!!error} data-busy={saving || loading} className="checkout-pay-button mt-7 w-full rounded-full bg-[#dcc58c] px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#173b2b] transition hover:bg-[#e8d4a4] disabled:cursor-not-allowed disabled:opacity-45">{saving?'Menyimpan pesanan…':loading?'Memperbarui ringkasan…':'Lanjut ke pembayaran →'}</button><p className="mt-4 text-center text-[10px] leading-5 text-white/50">Pembayaran melalui transfer BCA.<br/>Bukti transfer dikonfirmasi oleh tim VARTANA.</p></section>
        </aside>
      </form>}
      <footer className="mt-14 border-t border-[#dce0d4] pt-6 text-center text-[10px] uppercase tracking-[0.2em] text-[#8c947f]">Rooted in earth · Made with care · VARTANA</footer>
    </div>
  </main>;
}
