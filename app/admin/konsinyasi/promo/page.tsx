"use client";
import {adminFetch as fetch} from '@/lib/admin-fetch';
import Link from "next/link";
import {useCallback,useEffect,useState,type FormEvent} from "react";
type Target={kodeMitra?:string;sku?:string};
type Promo={kodePromo:string;namaPromo:string;jenisPromo:string;nilaiPromo:number;tanggalMulai:string;tanggalSelesai:string;status:string;syarat:string;detail?:Target[]};
type Partner={kodeMitra:string;namaToko:string};
type Product={sku:string;namaProduk:string;varian:string};
const empty={kodePromo:"",namaPromo:"",jenisPromo:"PERSEN",nilaiPromo:0,tanggalMulai:"",tanggalSelesai:"",status:"AKTIF",syarat:""};
const input="w-full rounded-xl border border-[#dce5db] bg-white px-3 py-3 text-sm";
async function read(action:string){const r=await fetch(`/api/konsinyasi/promo?action=${action}`,{cache:"no-store"}),d=await r.json();if(!r.ok||d.success!==true)throw Error(d.message||"Data belum dimuat.");return d;}
export default function PromoPage(){
 const [promos,setPromos]=useState<Promo[]>([]),[partners,setPartners]=useState<Partner[]>([]),[products,setProducts]=useState<Product[]>([]);
 const [targetsChanged,setTargetsChanged]=useState(false);
 const [form,setForm]=useState(empty),[partnerIds,setPartnerIds]=useState<string[]>([]),[skus,setSkus]=useState<string[]>([]);
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState(""),[ready,setReady]=useState(false);
 const load=useCallback(async()=>{setLoading(true);try{const [p,m,s]=await Promise.all([read("getKonsinyasiPromo"),read("getKonsinyasiMitra"),read("getKonsinyasiProduk")]);setPromos(p.promo||[]);setPartners(m.mitra||[]);setProducts(s.produk||[]);setReady(p.targetingVersion===2);if(p.targetingVersion!==2)setMessage("Pasang Apps Script terbaru lalu Deploy New version untuk mengaktifkan sasaran promo.");}catch(e){setMessage(e instanceof Error?e.message:"Data belum dimuat.");}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 function reset(){setTargetsChanged(false);setForm(empty);setPartnerIds([]);setSkus([]);}
 function toggle(v:string,a:string[],set:(a:string[])=>void){setTargetsChanged(true);set(a.includes(v)?a.filter(x=>x!==v):[...a,v]);}
 async function save(e:FormEvent){e.preventDefault();setSaving(true);setMessage("");try{let detail:Target[]=[];for(const kodeMitra of partnerIds.length?partnerIds:[""])for(const sku of skus.length?skus:[""])if(kodeMitra||sku)detail.push({kodeMitra,sku});if(form.kodePromo&&!targetsChanged)detail=promos.find(p=>p.kodePromo===form.kodePromo)?.detail||[];const r=await fetch("/api/konsinyasi/promo",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,detail})}),d=await r.json();if(!r.ok||d.success!==true)throw Error(d.message||"Promo belum tersimpan.");reset();await load();setMessage("Promo berhasil disimpan ke spreadsheet.");}catch(e){setMessage(e instanceof Error?e.message:"Promo belum tersimpan.");}finally{setSaving(false);}}
 return <main className="min-h-screen bg-[#f5f5ef] p-5 text-[#193d2b] sm:p-9"><div className="mx-auto max-w-5xl space-y-6">
 <Link href="/admin/konsinyasi">← Dashboard Konsinyasi</Link>
 <header className="rounded-3xl bg-[#173d2b] p-8 text-white"><p className="text-xs tracking-widest text-[#e6d4a5]">VARTANA · KONSINYASI</p><h1 className="mt-3 text-3xl font-semibold">Promo Mitra & Produk</h1><p className="mt-3 text-sm">Atur potongan dan harga khusus untuk mitra serta SKU pilihanmu.</p></header>
 {message&&<p role="status" className="rounded-xl border bg-white p-4">{message}</p>}
 <form onSubmit={save} className="space-y-5 rounded-2xl border bg-white p-6"><h2 className="text-xl font-semibold">{form.kodePromo?`Edit ${form.kodePromo}`:"Buat promo"}</h2>
 <div className="grid gap-4 sm:grid-cols-2">
 <label>Nama promo<input required maxLength={100} className={input} value={form.namaPromo} onChange={e=>setForm({...form,namaPromo:e.target.value})}/></label>
 <label>Jenis promo<select className={input} value={form.jenisPromo} onChange={e=>setForm({...form,jenisPromo:e.target.value})}><option value="PERSEN">Diskon persen</option><option value="NOMINAL">Potongan nominal produk sasaran</option><option value="HARGA_KHUSUS">Harga khusus per unit</option></select></label>
 <label>{form.jenisPromo==="PERSEN"?"Diskon (%)":form.jenisPromo==="HARGA_KHUSUS"?"Harga per unit (Rp)":"Potongan (Rp)"}<input required type="number" min="0.01" step="0.01" max={form.jenisPromo==="PERSEN"?100:1e12} className={input} value={form.nilaiPromo||""} onChange={e=>setForm({...form,nilaiPromo:Number(e.target.value)})}/></label>
 <label>Status<select className={input} value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>AKTIF</option><option>NONAKTIF</option></select></label>
 <label>Tanggal mulai<input required type="date" className={input} value={form.tanggalMulai} onChange={e=>setForm({...form,tanggalMulai:e.target.value})}/></label>
 <label>Tanggal selesai<input required type="date" min={form.tanggalMulai} className={input} value={form.tanggalSelesai} onChange={e=>setForm({...form,tanggalSelesai:e.target.value})}/></label></div>
 <div className="grid gap-5 sm:grid-cols-2">
 <fieldset><legend className="font-semibold">Mitra sasaran · {partnerIds.length||"Semua"}</legend><p className="my-2 text-xs">Kosongkan pilihan untuk semua mitra.</p><div className="max-h-60 space-y-2 overflow-auto rounded-xl border p-3">{partners.map(m=><label key={m.kodeMitra} className="flex gap-2 text-sm"><input type="checkbox" checked={partnerIds.includes(m.kodeMitra)} onChange={()=>toggle(m.kodeMitra,partnerIds,setPartnerIds)}/>{m.namaToko} · {m.kodeMitra}</label>)}</div><button type="button" className="mt-2 text-xs underline" onClick={()=>{setTargetsChanged(true);setPartnerIds([]);}}>Semua mitra</button></fieldset>
 <fieldset><legend className="font-semibold">Produk sasaran · {skus.length||"Semua"}</legend><p className="my-2 text-xs">Diskon hanya untuk SKU sasaran.</p><div className="max-h-60 space-y-2 overflow-auto rounded-xl border p-3">{products.map(p=><label key={p.sku} className="flex gap-2 text-sm"><input type="checkbox" checked={skus.includes(p.sku)} onChange={()=>toggle(p.sku,skus,setSkus)}/>{p.namaProduk} {p.varian} · {p.sku}</label>)}</div><button type="button" className="mt-2 text-xs underline" onClick={()=>{setTargetsChanged(true);setSkus([]);}}>Semua produk</button></fieldset></div>
 <p className="text-sm">Jika mitra dan produk dipilih, keduanya wajib cocok. Satu promo dipilih untuk setiap Sales Order.</p>
 <label className="block">Catatan syarat<textarea maxLength={1000} className={input} value={form.syarat} onChange={e=>setForm({...form,syarat:e.target.value})}/></label>
 <div className="flex gap-4"><button disabled={loading||saving||!ready} className="rounded-xl bg-[#173d2b] px-5 py-3 text-white disabled:opacity-40">{saving?"Menyimpan…":"Simpan promo"}</button><button type="button" onClick={reset}>Batal / reset</button></div></form>
 <section className="space-y-3"><h2 className="text-xl font-semibold">Daftar promo</h2>{loading?<p>Memuat…</p>:!promos.length?<p>Belum ada promo.</p>:promos.map(p=><article key={p.kodePromo} className="rounded-2xl border bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{p.namaPromo} · {p.kodePromo}</h3><p className="mt-1 text-sm">{p.jenisPromo} · {Number(p.nilaiPromo).toLocaleString("id-ID")} · {p.status}</p><p className="mt-1 text-sm">{p.tanggalMulai} — {p.tanggalSelesai}</p><p className="mt-2 text-xs">{p.detail?.length?p.detail.map(d=>`${d.kodeMitra||"Semua mitra"} / ${d.sku||"Semua produk"}`).join("; "):"Semua mitra / semua produk"}</p><p className="mt-2 text-sm">{p.syarat}</p></div><button type="button" disabled={!ready||p.jenisPromo==="BONUS"} className="underline disabled:opacity-40" onClick={()=>{setTargetsChanged(false);setForm(p);setPartnerIds([...new Set((p.detail||[]).map(d=>d.kodeMitra||"").filter(Boolean))]);setSkus([...new Set((p.detail||[]).map(d=>d.sku||"").filter(Boolean))]);window.scrollTo({top:0,behavior:"smooth"});}}>Edit promo</button></div></article>)}</section>
 </div></main>;
}
