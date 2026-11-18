'use client';

import Link from 'next/link';
import DokuLocalSetup from './DokuLocalSetup';
import CredentialEditor from './CredentialEditor';
import ApiTemplateEditor from './ApiTemplateEditor';
import ProviderCredentials from './ProviderCredentials';
import {useEffect,useState} from 'react';
import {LocaleScope} from '@/app/components/SiteLanguage';
import {adminFetch} from '@/lib/admin-fetch';
import {defaultIntegrations,integrationProviders,type IntegrationDocument,type IntegrationId} from '@/lib/integrations';

type Credentials = {id:IntegrationId;variables:{name:string;configured:boolean}[]}[];
type Result = {success:boolean;document:IntegrationDocument;credentials:Credentials;local:boolean;message?:string};
const field='mt-2 w-full rounded-xl border border-[#d7dece] bg-white px-3 py-3 text-sm text-[#204532] outline-none focus:border-[#a4894b]';

export default function IntegrationsPage() {
  const [document,setDocument]=useState(defaultIntegrations);
  const [selected,setSelected]=useState<IntegrationId>('doku');
  const [extra,setExtra]=useState(false);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [local,setLocal]=useState(false);
  const [message,setMessage]=useState('Memuat pengaturan…');
  const [failed,setFailed]=useState(false);
  const [dirty,setDirty]=useState(false);

  function apply(result:Result) {
    setDocument(result.document);setLocal(result.local);
    setReady(true);setDirty(false);setFailed(false);setMessage(result.message||'');
  }
  async function read() {
    const response=await fetch('/api/admin/integrations',{cache:'no-store'});
    const result=await response.json();
    if(!response.ok||!result.success)throw new Error(result.message||'Pengaturan belum dapat dimuat.');
    return result as Result;
  }
  useEffect(()=>{
    let active=true;
    read().then(result=>{if(active)apply(result);}).catch(error=>{if(active){setFailed(true);setMessage(error.message);}});
    return()=>{active=false;};
  },[]);

  async function reload() {
    if(dirty&&!window.confirm('Muat ulang dan batalkan perubahan yang belum disimpan?'))return;
    setBusy(true);
    try{apply(await read());}catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'Pengaturan belum dimuat.');}
    finally{setBusy(false);}
  }
  async function save() {
    setBusy(true);setFailed(false);setMessage('Menyimpan pengaturan…');
    try {
      const response=await adminFetch('/api/admin/integrations',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({settings:document.settings,expectedRevision:document.revision})});
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.message||'Pengaturan belum tersimpan.');
      apply(result);
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'Pengaturan belum tersimpan.');}
    finally{setBusy(false);}
  }
  function change(id:IntegrationId,values:Partial<IntegrationDocument['settings'][number]>) {
    setDocument(current=>({...current,settings:current.settings.map(setting=>setting.id===id?{...setting,...values}:setting)}));
    setDirty(true);setMessage('');
  }


  return <LocaleScope><main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-7 sm:py-10">
    <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
      <div><Link href="/admin-access" className="text-xs text-[#7b806d]">Kembali ke menu admin</Link><h1 className="mt-3 font-serif text-3xl text-[#214632] sm:text-4xl">Koneksi layanan</h1><p className="mt-2 text-sm leading-6 text-[#69735f]">Pilih layanan, isi akses API, lalu simpan dari sini.</p></div>
      <button type="button" onClick={()=>setExtra(!extra)} aria-expanded={extra} className="rounded-full border border-[#b8c7ab] bg-[#214b36] px-5 py-3 text-sm text-white">{extra?'Tutup pengelola API':'+ Tambah / kelola API'}</button>
    </header>
    {extra&&<div className="mb-7"><ApiTemplateEditor/><details className="rounded-2xl border border-[#d6dece] bg-[#f5f5ec] p-5"><summary className="cursor-pointer text-sm font-semibold text-[#36543b]">Daftar API tersimpan ? edit & hapus</summary><CredentialEditor/></details></div>}
    {local&&<p className="mb-5 text-xs leading-5 text-[#857449]">Website lokal ? Pengaturan layanan disimpan lokal. Tombol Simpan API mengirim credential ke Netlify production.</p>}
    <div className="grid items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-[#d6dece] bg-[#f5f5ec] p-4">
        <label className="block text-sm text-[#36543b] lg:hidden">Layanan<select value={selected} onChange={event=>setSelected(event.target.value as IntegrationId)} className={field}>{integrationProviders.map(provider=><option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label>
        <nav aria-label="Pilih layanan integrasi" className="hidden space-y-6 lg:block">{(['payment','shipping'] as const).map(category=><div key={category}><h2 className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[.18em] text-[#93815a]">{category==='payment'?'Pembayaran':'Pengiriman'}</h2><div className="space-y-2">{integrationProviders.filter(provider=>provider.category===category).map(provider=><button key={provider.id} type="button" onClick={()=>setSelected(provider.id)} aria-pressed={selected===provider.id} className={'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3.5 text-left text-sm transition '+(selected===provider.id?'bg-[#214b36] text-white shadow-sm':'text-[#526449] hover:bg-[#e8eddf]')}><span>{provider.name}</span><span aria-hidden="true">{selected===provider.id?'?':'?'}</span></button>)}</div></div>)}</nav>
        <div className="mt-5 rounded-xl border border-[#e0dccb] bg-[#fffdf7] p-4"><p className="text-xs font-semibold text-[#36543b]">Satu cara mengelola API</p><p className="mt-2 text-xs leading-6 text-[#748069]">Kolom menyesuaikan provider. Nilai rahasia disimpan di Netlify dan tidak ditampilkan kembali.</p></div>
      </aside>
      <div className="min-w-0">{integrationProviders.map(provider=>{
        const setting=document.settings.find(item=>item.id===provider.id)!;
        return <section key={provider.id} hidden={selected!==provider.id} aria-label={'Pengaturan '+provider.name} className="overflow-hidden rounded-2xl border border-[#d6dece] bg-[#fffef9] shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e8dc] bg-gradient-to-r from-[#edf2e7] to-[#f8f2e2] px-6 py-6 sm:px-8"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a8048]">{provider.category==='payment'?'Pembayaran':'Pengiriman'}</p><h2 className="mt-2 font-serif text-2xl text-[#214632]">{provider.name}</h2></div><span className="rounded-full border border-[#d4d9c8] bg-white/80 px-3 py-2 text-xs text-[#68745c]">{provider.supported?(setting.enabled?'Layanan aktif':'Layanan nonaktif'):'Integrasi transaksi belum tersedia'}</span></header>
          <div className="p-6 sm:p-8"><p className="mb-5 text-sm leading-6 text-[#64735c]">{provider.description}</p>
            {local&&provider.id==='doku'&&<DokuLocalSetup/>}
            {!!provider.variables.length&&<ProviderCredentials name={provider.name} keys={provider.variables}/>}
            <details open={provider.variables.length===0} className="mt-7 border-t border-[#e0e5d8] pt-5"><summary className="cursor-pointer text-sm font-semibold text-[#36543b]">Pengaturan layanan & aktivasi</summary>
              <div className="mt-5 space-y-5"><label className="block text-sm text-[#36543b]">Nama di website<input className={field} value={setting.label} maxLength={60} disabled={!ready||busy} onChange={event=>change(provider.id,{label:event.target.value})}/></label>
              {!provider.supported&&<p className="rounded-xl bg-[#f8f0dd] p-4 text-xs leading-6 text-[#816b35]">API dapat disimpan sekarang. Pembayaran atau pengiriman otomatis menunggu implementasi dan pengujian integrasi provider ini.</p>}
              {!provider.supported&&<label className="block text-sm text-[#36543b]">Lingkungan layanan<select className={field} value={setting.environment} disabled={!ready||busy} onChange={event=>change(provider.id,{environment:event.target.value as 'sandbox'|'production'})}><option value="sandbox">Sandbox / pengujian</option><option value="production">Production</option></select><small className="mt-2 block text-xs leading-5 text-[#748069]">Untuk konfigurasi adapter mendatang. Penyimpanan credential saat ini menggunakan environment production Netlify.</small></label>}
              {provider.category==='shipping'&&<details className="rounded-xl border border-[#e0e5d8] p-4"><summary className="cursor-pointer text-xs text-[#69775f]">Asal pengiriman lanjutan</summary><label className="mt-4 block text-sm text-[#36543b]">ID wilayah asal<input className={field} value={setting.originId} maxLength={100} disabled={!ready||busy} onChange={event=>change(provider.id,{originId:event.target.value})}/><small className="mt-2 block text-xs leading-5 text-[#748069]">Khusus override asal layanan existing. Jika kosong, gunakan ID asal yang disimpan pada API.</small></label></details>}
              <button type="button" role="switch" aria-checked={setting.enabled} disabled={!ready||busy||!provider.supported} onClick={()=>change(provider.id,{enabled:!setting.enabled})} className="flex w-full items-center justify-between rounded-xl border border-[#d5deca] bg-[#f3f6ed] p-4 text-sm text-[#36543b]"><span>Tampilkan di checkout</span><strong>{setting.enabled?'Aktif':'Nonaktif'}</strong></button>
              <div className="flex flex-wrap gap-3"><button type="button" disabled={!ready||busy||!dirty} onClick={()=>void save()} className="rounded-xl bg-[#214b36] px-5 py-3 text-sm text-white disabled:opacity-40">{busy?'Menyimpan...':'Simpan pengaturan layanan'}</button><button type="button" disabled={busy} onClick={()=>void reload()} className="rounded-xl border border-[#c5cfb9] px-4 py-3 text-sm text-[#36543b]">Muat ulang pengaturan</button></div>
              </div>
            </details>
          </div>
        </section>;
      })}
      <p role={failed?'alert':'status'} className={'mt-4 px-1 text-sm leading-6 '+(failed?'text-[#9b4031]':'text-[#69775f]')}>{message||(dirty?'Pengaturan layanan belum disimpan.':'')}</p>
      </div>
    </div>
  </main></LocaleScope>;
}
