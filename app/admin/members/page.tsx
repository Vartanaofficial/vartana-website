'use client';

import {useEffect,useState,type FormEvent} from 'react';
import MemberBroadcast from './MemberBroadcast';
import {adminFetch} from '@/lib/admin-fetch';

type Member={row:number;revision:string;memberId:string;name:string;email:string;phone:string;birthDate:string;address:string;city:string};
const field='w-full rounded-xl border border-[#cdd9cb] bg-white p-3 text-sm';

export default function MembersPage(){
  const [members,setMembers]=useState<Member[]>([]);
  const [composeVersion,setComposeVersion]=useState(0);
  const [selected,setSelected]=useState<number[]>([]);
  const [search,setSearch]=useState('');
  const [edit,setEdit]=useState<Member|null>(null);
  const [message,setMessage]=useState('Memuat daftar member…');
  const [busy,setBusy]=useState(false);
  async function load(){
    try{
      const response=await adminFetch('/api/admin/members',{cache:'no-store'});
      const data=await response.json();
      if(!response.ok||!data.success)throw Error(data.message||'Member belum dimuat.');
      setMembers(data.members);setMessage('');
    }catch(error){setMessage(error instanceof Error?error.message:'Member belum dimuat.');}
  }
  useEffect(()=>{void load();},[]);
  useEffect(()=>{if(edit)document.getElementById('member-edit')?.scrollIntoView({behavior:'smooth',block:'start'});},[edit?.row]);
  async function save(event:FormEvent){
    event.preventDefault();if(busy||!edit)return;setBusy(true);
    try{
      const response=await adminFetch('/api/admin/members',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({member:edit})});
      const data=await response.json();
      if(!response.ok||!data.success)throw Error(data.message||'Member belum tersimpan.');
      setMembers(old=>old.map(member=>member.row===data.member.row?data.member:member));
      setEdit(null);setMessage('Data member berhasil disimpan.');
    }catch(error){setMessage(error instanceof Error?error.message:'Member belum tersimpan.');}
    finally{setBusy(false);}
  }
  const visible=members.filter(member=>[member.name,member.email,member.phone,member.memberId].some(value=>value.toLowerCase().includes(search.toLowerCase())));
  return <main className="mx-auto max-w-6xl p-5 text-[#173d2b] sm:p-8">
    <p className="text-xs uppercase tracking-widest text-[#9b782c]">VARTANA / Pelanggan</p>
    <h1 className="my-3 font-serif text-4xl">Member VARTANA</h1>
    <p className="mb-6 text-sm">Periksa dan rapikan kontak pada daftar member. Data akun login dan riwayat pesanan dikelola terpisah.</p>
    <div className="flex gap-3"><input className={field} aria-label="Cari member" placeholder="Cari nama, email, WhatsApp, atau ID member" value={search} onChange={event=>setSearch(event.target.value)}/><button onClick={()=>void load()} className="shrink-0 rounded-xl border px-4">Muat ulang</button></div>
    {message&&<p role="status" className="my-4 rounded-xl bg-[#edf1e6] p-4">{message}</p>}
    <MemberBroadcast composeVersion={composeVersion} recipients={members.filter(member=>selected.includes(member.row))}/>
    <div className="my-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#e8efdf] p-4 text-sm"><label><input type="checkbox" checked={visible.filter(m=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)).length>0&&visible.filter(m=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)).every(m=>selected.includes(m.row))} onChange={event=>{const ids=visible.filter(m=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)).map(m=>m.row);setSelected(previous=>event.target.checked?[...new Set([...previous,...ids])]:previous.filter(id=>!ids.includes(id)));}}/> Tandai hasil pencarian</label><strong>{selected.length} member dipilih</strong><button onClick={()=>setSelected([])} className="underline">Batalkan pilihan</button><button onClick={()=>{setComposeVersion(version=>version+1);document.getElementById('member-broadcast')?.scrollIntoView({behavior:'smooth'});}} className="ml-auto rounded-xl bg-[#214b36] px-4 py-2 text-white">Susun email</button></div>
    <p className="my-4 text-sm">{visible.length} dari {members.length} member</p>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-[#edf1e6]"><tr>{['Pilih','Member','Email','WhatsApp','Alamat',''].map((title,index)=><th key={index} className="p-4">{title}</th>)}</tr></thead><tbody>{visible.map(member=><tr key={member.row} className="border-t"><td className="p-4"><input type="checkbox" aria-label={'Pilih '+member.name} checked={selected.includes(member.row)} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)} onChange={event=>setSelected(previous=>event.target.checked?[...previous,member.row]:previous.filter(row=>row!==member.row))}/></td><td className="p-4"><strong>{member.name}</strong><small className="block">{member.memberId}</small></td><td className="p-4">{member.email}</td><td className="p-4">{member.phone}</td><td className="p-4">{member.address}<small className="block">{member.city}</small></td><td className="p-4"><button disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)} className="mb-2 block rounded-lg border px-4 py-2 disabled:opacity-40" onClick={()=>{setSelected([member.row]);setComposeVersion(version=>version+1);document.getElementById('member-broadcast')?.scrollIntoView({behavior:'smooth'});}}>Email</button><button className="rounded-lg border px-4 py-2" onClick={()=>{setEdit({...member,birthDate:/^\d{4}-\d{2}-\d{2}$/.test(member.birthDate)?member.birthDate:''});setMessage('');}}>Edit</button></td></tr>)}</tbody></table></div>
    {edit&&<section id="member-edit" className="mt-6 scroll-mt-28 rounded-2xl border bg-white p-6" aria-label="Edit member"><h2 className="mb-4 font-serif text-2xl">Edit {edit.name}</h2><form onSubmit={save} className="grid gap-4 sm:grid-cols-2"><label>Email<input className={field} value={edit.email} readOnly/><small>Email dan ID member tetap dipertahankan.</small></label>{([['name','Nama'],['phone','WhatsApp'],['birthDate','Tanggal lahir'],['address','Alamat'],['city','Kecamatan / kota']] as const).map(([key,label])=><label key={key}>{label}<input className={field} required={key==='name'||key==='phone'} type={key==='birthDate'?'date':'text'} maxLength={key==='address'?1000:150} value={edit[key]} onChange={event=>setEdit({...edit,[key]:event.target.value})}/></label>)}<div className="flex gap-3 sm:col-span-2"><button disabled={busy} className="rounded-xl bg-[#173d2b] px-6 py-3 text-white disabled:opacity-50">{busy?'Menyimpan…':'Simpan perubahan'}</button><button type="button" disabled={busy} onClick={()=>setEdit(null)}>Batal</button></div></form></section>}
  </main>;
}
