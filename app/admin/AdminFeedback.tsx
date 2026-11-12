'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {ADMIN_NOTICE_EVENT,type AdminNotice} from '@/lib/admin-fetch';
export default function AdminFeedback(){
 const [notices,setNotices]=useState<AdminNotice[]>([]),[mounted,setMounted]=useState(false);
 useEffect(()=>{setMounted(true);const onNotice=(event:Event)=>{const notice=(event as CustomEvent<AdminNotice>).detail;setNotices(old=>[...old.filter(n=>n.id!==notice.id),notice].slice(-3));};window.addEventListener(ADMIN_NOTICE_EVENT,onNotice);return()=>window.removeEventListener(ADMIN_NOTICE_EVENT,onNotice);},[]);
 useEffect(()=>{const timers=notices.filter(n=>n.phase!=='pending').map(n=>setTimeout(()=>setNotices(old=>old.filter(v=>v.id!==n.id)),n.phase==='success'?7000:14000));return()=>timers.forEach(clearTimeout);},[notices]);
 if(!mounted)return null;
 return createPortal(<aside className="admin-feedback" aria-label="Notifikasi perubahan">{notices.map(n=><section key={n.id} role={n.phase==='error'?'alert':'status'} className={`admin-toast ${n.phase}`}><span className="admin-toast-symbol" aria-hidden="true">{n.phase==='pending'?<i/>:n.phase==='success'?'✓':n.phase==='warning'?'!':'×'}</span><div><strong>{n.title}</strong><p>{n.message}</p></div><button type="button" aria-label="Tutup notifikasi" onClick={()=>setNotices(old=>old.filter(v=>v.id!==n.id))}>×</button></section>)}</aside>,document.body);
}
