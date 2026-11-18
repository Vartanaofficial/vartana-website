'use client';
import {useState} from 'react';
import {credentialFields} from '@/lib/credential-fields';
import {adminFetch} from '@/lib/admin-fetch';

export default function ProviderCredentials({name,keys,labels={}}:{name:string;keys:readonly string[];labels?:Record<string,string>}){
 const [values,setValues]=useState<Record<string,string>>({}),[busy,setBusy]=useState(false),[review,setReview]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 const filled=keys.filter(key=>values[key]?.trim());
 async function save(){
  if(busy||!filled.length)return;setBusy(true);setFailed(false);let saved=0;
  try{for(const key of filled){const response=await adminFetch('/api/admin/integrations/credentials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value:values[key]})}),data=await response.json();if(!response.ok)throw Error(data.message||'API belum tersimpan.');saved++;setValues(current=>({...current,[key]:''}));}
   setReview(false);setMessage(saved+' kolom API '+name+' tersimpan di Netlify. Perubahan dipakai setelah rilis server; belum ada deployment otomatis.');
  }catch(error){setFailed(true);setReview(false);setMessage((saved?saved+' kolom sudah tersimpan. ':'')+(error instanceof Error?error.message:'API belum tersimpan.')+' Kolom yang gagal tetap diisi untuk dicoba kembali.');}
  finally{setBusy(false);}
 }
 return <div className="mt-4 space-y-4 border-t border-[#dbe3d1] pt-4"><h3 className="text-sm font-semibold text-[#36543b]">Masukkan API {name}</h3>
 {keys.map(key=>{const info=credentialFields[key]||(labels[key]?{label:labels[key],secret:true,help:"Isi sesuai akses yang diberikan provider."}:undefined);return <label key={key} className="block text-sm text-[#36543b]">{info?.label||key}<input type={info?.secret===false?'text':'password'} autoComplete="new-password" value={values[key]||''} maxLength={5000} disabled={busy||review} placeholder={'Masukkan '+(info?.label||key)} onChange={event=>{setValues(current=>({...current,[key]:event.target.value}));setMessage('');}} className="mt-2 w-full rounded-xl border border-[#d7dece] bg-white px-4 py-3 text-sm outline-none focus:border-[#a4894b]"/><small className="mt-2 block text-xs leading-5 text-[#69775f]">{info?.help} <code className="break-all">{key}</code></small></label>;})}
 <p className="text-xs leading-5 text-[#69775f]">Isi kolom yang ingin ditambah atau diganti. Kolom kosong mempertahankan nilai lama. Nilai tersimpan tidak ditampilkan kembali.</p>
 {review?<div className="rounded-xl border border-[#d9c590] bg-[#fff8e9] p-4"><p className="text-sm leading-6">Simpan {filled.length} kolom untuk {name} ke environment production Netlify? Pengaturan ini tidak mengaktifkan layanan atau merilis website.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={()=>void save()} className="rounded-xl bg-[#214b36] px-4 py-3 text-sm text-white disabled:opacity-40">{busy?'Menyimpan...':'Konfirmasi simpan API'}</button><button type="button" disabled={busy} onClick={()=>setReview(false)} className="rounded-xl border border-[#c5cfb9] px-4 py-3 text-sm">Batal</button></div></div>:<button type="button" disabled={!filled.length||busy} onClick={()=>setReview(true)} className="w-full rounded-xl bg-[#214b36] px-4 py-3 text-sm text-white disabled:opacity-40">Simpan API {name}</button>}
 {message&&<p role={failed?'alert':'status'} className={'rounded-xl p-3 text-xs leading-6 '+(failed?'bg-[#fff0e9] text-[#934536]':'bg-[#edf2e6] text-[#36543b]')}>{message}</p>}
 </div>;
}
