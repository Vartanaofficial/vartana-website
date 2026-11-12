'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {adminManagement} from '@/lib/admin-management-client';
import AdminMenuVisual from './AdminMenuVisual';

type Menu={href:string;title:string;description:string};
export default function AdminMenuGrid({menus}:{menus:Menu[]}){
  const [order,setOrder]=useState<string[]>(menus.map(menu=>menu.href));
  const [saved,setSaved]=useState<string[]>([]);
  const [revision,setRevision]=useState('');
  const [editing,setEditing]=useState(false);
  const [ready,setReady]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('Memuat urutan menu…');
  const [dragged,setDragged]=useState('');
  function normalize(input:string[]){return [...new Set([...input,...menus.map(menu=>menu.href)])].filter(href=>menus.some(menu=>menu.href===href));}
  async function load(){
    try{const data=await adminManagement({operation:'menuRead'});const current=normalize(data.order);setOrder(current);setSaved(current);setRevision(data.revision);setReady(true);setMessage('');}
    catch(error){setMessage(error instanceof Error?error.message:'Urutan belum dimuat.');}
  }
  useEffect(()=>{void load();},[]);
  function move(from:number,to:number){if(to<0||to>=order.length||busy)return;setOrder(previous=>{const next=[...previous];const [item]=next.splice(from,1);next.splice(to,0,item);return next;});}
  async function save(){
    if(busy)return;setBusy(true);
    try{const data=await adminManagement({operation:'menuSave',order,expectedRevision:revision});setSaved([...order]);setRevision(data.revision);setEditing(false);setMessage('Urutan menu tersimpan. Susunan ini digunakan saat Anda membuka admin lagi, termasuk di perangkat lain.');}
    catch(error){setMessage(error instanceof Error?error.message:'Urutan belum tersimpan.');}
    finally{setBusy(false);}
  }
  return <LocaleScope><>
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d0dbc4] bg-[#e8efdf] p-4 text-xs text-[#36543b]">
      <p>{editing?'Geser kartu atau gunakan tombol naik/turun, lalu simpan urutannya.':'Susun menu sesuai alur kerja Anda. Urutan disimpan untuk admin VARTANA.'}</p>
      <div className="flex flex-wrap gap-2">{editing?<><button disabled={busy} onClick={()=>void save()} className="rounded-lg bg-[#214b36] px-4 py-2 text-white">{busy?'Menyimpan…':'Simpan urutan'}</button><button disabled={busy} onClick={()=>{setOrder(saved);setEditing(false);}} className="rounded-lg border border-[#aabb98] px-3 py-2">Batal</button></>:<button disabled={!ready} onClick={()=>{setEditing(true);setMessage('');}} className="rounded-lg border border-[#aabb98] bg-[#fffdf5] px-4 py-2 disabled:opacity-50">Atur urutan menu</button>}<button disabled={busy||editing} onClick={()=>void load()} className="px-2 py-2 disabled:opacity-40">Muat ulang</button></div>
    </div>
    {message&&<p role="status" className="mb-4 text-sm leading-6 text-[#36543b]">{message}</p>}
    <div className="grid grid-cols-1 gap-4 min-[440px]:grid-cols-2 lg:grid-cols-3">{order.map((href,index)=>{
      const menu=menus.find(item=>item.href===href);if(!menu)return null;
      return <div key={href} className="admin-menu-card group relative" draggable={editing&&!busy} onDragStart={()=>setDragged(href)} onDragEnd={()=>setDragged('')} onDragOver={event=>{if(editing)event.preventDefault();}} onDrop={event=>{event.preventDefault();if(editing&&dragged)move(order.indexOf(dragged),index);setDragged('');}}>
        <Link href={href} onClick={event=>{if(editing)event.preventDefault();}} className="flex flex-1 flex-col" aria-label={menu.title}>
          <AdminMenuVisual href={href}/><span className="admin-menu-copy min-w-0 flex-1"><span className="admin-menu-title block">{menu.title}</span><span className="admin-menu-description">{menu.description}</span></span><span aria-hidden="true" className="admin-menu-arrow">{editing?index+1:'→'}</span>
        </Link>
        {editing&&<div className="flex items-center justify-between gap-2 border-t border-[#dae2d0] bg-[#edf2e6] p-3 text-xs"><span>No. {index+1}</span><div className="flex gap-2"><button disabled={busy||index===0} aria-label={'Naikkan '+menu.title} onClick={()=>move(index,index-1)} className="rounded-lg border border-[#bcccad] bg-white px-3 py-2 disabled:opacity-30">↑ Naik</button><button disabled={busy||index===order.length-1} aria-label={'Turunkan '+menu.title} onClick={()=>move(index,index+1)} className="rounded-lg border border-[#bcccad] bg-white px-3 py-2 disabled:opacity-30">↓ Turun</button></div></div>}
      </div>;
    })}</div>
  </></LocaleScope>;
}
