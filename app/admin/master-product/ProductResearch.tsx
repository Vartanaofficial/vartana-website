"use client";
import {useState} from "react";
import type {IngredientResearch, ResearchPaper} from "@/lib/product-research";

export default function ProductResearch({ingredients, onApply}: {ingredients:string[]; onApply:(benefits:string, references:string)=>void}) {
  const [topic,setTopic] = useState(""), [loading,setLoading] = useState(false), [error,setError] = useState("");
  const [results,setResults] = useState<IngredientResearch[] | null>(null);
  const [selected,setSelected] = useState<string[]>([]), [draft,setDraft] = useState("");
  async function search() {
    setLoading(true);setError("");setResults(null);setSelected([]);setDraft("");
    try {
      const response = await fetch("/api/admin/product-research",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ingredients,topic})});
      const data = await response.json();if(!response.ok)throw new Error(data.message);
      setResults(data.results);
      setSelected([...new Set<string>(data.results.flatMap((r:IngredientResearch)=>r.papers.map(p=>p.id)))]);
      setDraft(data.results.filter((r:IngredientResearch)=>r.papers.length).map((r:IngredientResearch)=>r.draft).join("\n\n"));
    } catch(e) {setError(e instanceof Error ? e.message : "Pencarian gagal.");}finally{setLoading(false);}
  }
  const papers = results?.flatMap(r=>r.papers).filter((p,i,all)=>all.findIndex(x=>x.id===p.id)===i) || [];
  function citation(p:ResearchPaper) {return `${p.title}\n${p.authors} (${p.year}). ${p.journal}${p.doi ? `. DOI: ${p.doi}` : ""}\n${p.url}`;}
  return <section className="rounded-2xl border border-[#d7ddcf] bg-[#f5f5ed] p-5 sm:col-span-2">
    <h3 className="font-serif text-xl">Asisten referensi bahan</h3>
    <p className="mt-2 text-xs leading-6 text-[#62715b]">Cari jurnal berdasarkan bahan yang dipilih. Tinjau sumber dan susun manfaat sebelum memasukkan ke form. Penelitian bahan belum tentu berlaku untuk produk akhir.</p>
    <label className="mt-4 block text-sm">Fokus pencarian (opsional, gunakan istilah Inggris)<input value={topic} maxLength={100} onChange={e=>setTopic(e.target.value)} placeholder="Contoh: digestion, antioxidant" className="mt-2 w-full rounded-xl border bg-white p-3 text-sm"/></label>
    <button type="button" disabled={loading || !ingredients.length} onClick={search} className="mt-3 rounded-xl bg-[#173b2b] px-4 py-3 text-sm text-white disabled:opacity-50">{loading ? "Mencari jurnal…" : "Cari rekomendasi & jurnal"}</button>
    {!ingredients.length && <p className="mt-2 text-xs">Pilih bahan terlebih dahulu, atau langsung isi manual di bawah.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {results && <div className="mt-5 space-y-4">
      {results.map(r=><div key={r.ingredient}><h4 className="font-semibold">{r.ingredient} <span className="text-xs font-normal">({r.term})</span></h4>{!r.papers.length && <p className="mt-1 text-xs">{r.error || "Belum ada hasil yang sesuai. Coba fokus pencarian lain atau isi manual."}</p>}{r.papers.map(p=><label key={p.id} className="mt-2 flex gap-3 rounded-xl bg-white p-3 text-sm"><input type="checkbox" checked={selected.includes(p.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,p.id]:old.filter(id=>id!==p.id))}/><span><a href={p.url} target="_blank" rel="noopener noreferrer" className="underline">{p.title}</a><span className="mt-1 block text-xs text-[#62715b]">{p.year} · {p.journal} · {p.studyType}</span></span></label>)}</div>)}
      {papers.length>0 && <><label className="block text-sm">Draf manfaat / catatan bukti (bisa diedit)<textarea rows={5} value={draft} onChange={e=>setDraft(e.target.value)} className="mt-2 w-full rounded-xl border bg-white p-3"/></label><p className="text-xs">Draf awal berupa catatan bukti, belum menyimpulkan manfaat klinis. Baca jurnal yang dipilih dan tulis manfaat yang didukung hasilnya.</p><button type="button" disabled={!selected.length} onClick={()=>onApply(draft,papers.filter(p=>selected.includes(p.id)).map(citation).join("\n\n"))} className="rounded-xl bg-[#173b2b] px-4 py-3 text-sm text-white disabled:opacity-50">Tambahkan draf & {selected.length} referensi ke form</button><p className="text-xs">Teks ditambahkan tanpa menghapus isian lama. Simpan Produk untuk menyimpan perubahan.</p></>}
      <a href="https://europepmc.org/RestfulWebService" target="_blank" rel="noopener noreferrer" className="block text-xs underline">Sumber pencarian: Europe PMC</a>
    </div>}
  </section>;
}
