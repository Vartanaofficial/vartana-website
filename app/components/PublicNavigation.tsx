'use client';
import Link from 'next/link';
import {useEffect,useState,useRef} from 'react';
import {usePathname} from 'next/navigation';
import './public-navigation.css';
import {useCart} from '@/lib/use-cart';
type Icon='home'|'catalog'|'games'|'leaf'|'about'|'journal'|'search'|'cart';
const links:{href:string;label:string;detail:string;icon:Icon}[]=[
 {href:'/#philosophy',label:'Filosofi',detail:'Berakar dari alam',icon:'leaf'},
 {href:'/katalog',label:'Katalog',detail:'Temukan racikanmu',icon:'catalog'},
 {href:'/#science',label:'Kenali Rempah',detail:'Cerita di balik bahan',icon:'leaf'},
 {href:'/artikel/cerita-vartana',label:'Tentang VARTANA',detail:'Dibuat dengan perhatian',icon:'about'},
 {href:'/#purpose',label:'Tujuan',detail:'Kebaikan sehari-hari',icon:'leaf'},
 {href:'/artikel',label:'Jurnal',detail:'Baca, kenali, nikmati',icon:'journal'},
 {href:'/games',label:'Games',detail:'Main sebentar, raih hadiah',icon:'games'}
];
export function PublicIcon({name}:{name:Icon}){
 const paths:Record<Icon,string>={home:'m3 10 9-7 9 7M5 9v11h14V9M9 20v-6h6v6',catalog:'M4 4h16v16H4zM8 4v16M4 10h16',games:'M7 7h10a4 4 0 0 1 4 4l1 6a2 2 0 0 1-3 2l-3-3H8l-3 3a2 2 0 0 1-3-2l1-6a4 4 0 0 1 4-4M6 10v5M3.5 12.5h5M16 11h.1M19 14h.1',leaf:'M5 20C3 7 10 3 21 3c0 12-5 17-13 14M4 21 16 9',about:'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',journal:'M3 4h6l3 2 3-2h6v16h-6l-3 1-3-1H3zM12 6v15',search:'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0m-2 5 6 6',cart:'M3 3h2l2.5 12h10L21 6H6M9 20h.1M17 20h.1'};
 return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}
export default function PublicNavigation(){
 const cart=useCart(),count=cart.reduce((total,item)=>total+item.quantity,0);
 const path=usePathname(),[open,setOpen]=useState(false),panel=useRef<HTMLElement|null>(null);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const focusable=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('button,a[href]')||[]);focusable()[0]?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);if(e.key==='Tab'){const list=focusable(),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',key);document.querySelector<HTMLButtonElement>('.public-menu-button')?.focus({preventScroll:true});};},[open]);
 const active=(href:string)=>href==='/games'?path==='/games'||path==='/puzzle'||path.startsWith('/games/'):path===href;
 return <><header className="public-header"><div className="public-header-row"><Link className="public-brand" href="/" aria-label="Beranda VARTANA"><img src="/Logo Vartana.png" alt="VARTANA Botanical Wellness" width="156" height="45"/></Link><nav className="public-desktop-nav" aria-label="Menu utama">{links.map(l=><Link key={l.href} href={l.href} aria-current={active(l.href)?'page':undefined}>{l.label}</Link>)}</nav><div className="public-header-actions"><Link href="/checkout" className="public-cart" aria-label={`Keranjang belanja, ${count} kemasan`}><PublicIcon name="cart"/><span>Keranjang Belanja</span>{count>0&&<b key={count} className="public-cart-badge" aria-hidden="true">{count>99?'99+':count}</b>}</Link><button className="public-menu-button" type="button" aria-expanded={open} aria-controls="public-menu" aria-label={open?'Tutup menu':'Buka menu'} onClick={()=>setOpen(v=>!v)}><span className={open?'menu-lines open':'menu-lines'} aria-hidden="true"><i/><i/></span><span>Menu</span></button></div></div><nav className="public-shortcuts" aria-label="Akses cepat"><Link href="/?track=1"><PublicIcon name="search"/>Lacak pesanan</Link>{links.filter(l=>['Katalog','Games','Kenali Rempah','Tentang VARTANA'].includes(l.label)).map(l=><Link key={l.href} href={l.href} aria-current={active(l.href)?'page':undefined}><PublicIcon name={l.icon}/>{l.label}</Link>)}</nav></header>
 {open&&<div className="public-menu-overlay" onClick={()=>setOpen(false)}><section ref={panel} id="public-menu" role="dialog" aria-modal="true" aria-label="Jelajahi VARTANA" className="public-menu-panel" onClick={e=>e.stopPropagation()}><div className="public-menu-heading"><div><small>ROOTED IN EARTH</small><h2>Jeda kecil, banyak cerita.</h2></div><button type="button" aria-label="Tutup menu" onClick={()=>setOpen(false)}>×</button></div><nav>{links.map((l,i)=><Link key={l.href} href={l.href} aria-current={active(l.href)?'page':undefined} onClick={()=>setOpen(false)} style={{animationDelay:`${i*25}ms`}}><span className="public-menu-icon"><PublicIcon name={l.icon}/></span><span><strong>{l.label}</strong><small>{l.detail}</small></span><span aria-hidden="true">↗</span></Link>)}</nav><p>Botanical wellness, made for your everyday rituals.</p></section></div>}
 <nav className="public-bottom-nav" aria-label="Navigasi bawah">{([{href:'/',label:'Home',icon:'home'},{href:'/katalog',label:'Katalog',icon:'catalog'},{href:'/games',label:'Games',icon:'games'},{href:'/?track=1',label:'Lacak',icon:'search'},{href:'/checkout',label:'Cart',icon:'cart'}] as {href:string;label:string;icon:Icon}[]).map(l=><Link key={l.href} href={l.href} aria-current={active(l.href)?'page':undefined}><span className="public-nav-icon"><PublicIcon name={l.icon}/>{l.icon==='cart'&&count>0&&<b key={count} className="public-cart-badge" aria-label={`${count} kemasan di keranjang`}>{count>99?'99+':count}</b>}</span><span>{l.label}</span></Link>)}</nav></>;
}
