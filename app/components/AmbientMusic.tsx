"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {soundscape,type Theme} from "@/lib/ambient-soundscape";
import {createPortal} from "react-dom";
import {clampRadioPosition,isRadioDrag,type RadioPosition} from "@/lib/radio-position";
const stations=[
 {id:'prambors',name:'Prambors / hits (pemutar resmi)',stream:'',website:'https://prambors.live/'},
 {id:'power',name:'181.FM / Power 181 - Top 40',stream:'https://listen.181fm.com/181-power_128k.mp3',website:'https://www.181.fm/'},
 {id:'uk',name:'181.FM / UK Top 40',stream:'https://listen.181fm.com/181-uktop40_128k.mp3',website:'https://www.181.fm/'},
 {id:'breeze',name:'181.FM / The Breeze - smooth jazz',stream:'https://listen.181fm.com/181-breeze_128k.mp3',website:'https://www.181.fm/'}
];
export default function AmbientMusic({suspended=false}:{suspended?:boolean}){
 const [mounted,setMounted]=useState(false),[open,setOpen]=useState(false),[position,setPosition]=useState<{x:number;y:number}|null>(null);
 const [mode,setMode]=useState<"music"|"radio">("music"),[theme,setTheme]=useState<Theme>("calm"),[station,setStation]=useState("power"),[playing,setPlaying]=useState(false),[error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const generation=useRef(0);
 const selectedStation=stations.find(s=>s.id===station)||stations[0];
 const audio=useRef<HTMLAudioElement|null>(null),context=useRef<AudioContext|null>(null),stop=useRef<(()=>void)|null>(null);
 const halt=useCallback(()=>{generation.current++;setLoading(false);stop.current?.();stop.current=null;if(audio.current){audio.current.pause();audio.current.removeAttribute('src');audio.current.load();}void context.current?.suspend();setPlaying(false);},[]);
 useEffect(()=>{if(suspended){halt();setOpen(false);}},[suspended,halt]);
 async function play(){halt();setError('');const run=generation.current;setLoading(true);try{
 if(mode==='radio'){
 if(!selectedStation.stream){window.open(selectedStation.website,'_blank','noopener,noreferrer');return;}
 const player=new Audio();audio.current=player;player.preload='none';player.volume=.5;player.src=selectedStation.stream;
 player.onerror=()=>{if(generation.current!==run)return;setError('Siaran terputus atau tidak tersedia. Coba lagi, pilih saluran lain, atau buka situs stasiun.');setPlaying(false);setLoading(false);};
 const timeout=window.setTimeout(()=>{if(generation.current===run){halt();setError('Siaran terlalu lama merespons. Coba saluran lain atau buka situs stasiun.');}},15000);
 try{await player.play();}finally{window.clearTimeout(timeout);}
 }else{if(!context.current)context.current=new AudioContext();await context.current.resume();if(generation.current!==run)return;const gain=context.current.createGain();gain.gain.value=.15;gain.connect(context.current.destination);const cleanup=soundscape(context.current,gain,theme);stop.current=()=>{cleanup();gain.disconnect();};}
 if(generation.current===run)setPlaying(true);
 }catch{if(generation.current===run)setError('Belum bisa diputar. Coba lagi atau pilih saluran lain.');}finally{if(generation.current===run)setLoading(false);}}
 useEffect(()=>()=>{generation.current++;stop.current?.();audio.current?.pause();void context.current?.close();},[]);

 const root=useRef<HTMLDivElement>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number;moved:boolean}|null>(null),suppressClick=useRef(false),latest=useRef<RadioPosition|null>(null);
 function bound(x:number,y:number){const r=root.current?.getBoundingClientRect(),v=window.visualViewport;return clampRadioPosition({x,y},{width:r?.width||152,height:r?.height||44},{width:v?.width||window.innerWidth,height:v?.height||window.innerHeight,left:v?.offsetLeft||0,top:v?.offsetTop||0,bottomInset:window.innerWidth<768?72:0});}
 function move(p:RadioPosition,persist=false){latest.current=p;setPosition(p);if(persist)try{localStorage.setItem('vartana-radio-position',JSON.stringify(p));}catch{}}
 useEffect(()=>{setMounted(true);const frame=requestAnimationFrame(()=>{try{const p=JSON.parse(localStorage.getItem('vartana-radio-position')||'null');if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))move(bound(p.x,p.y));}catch{}});const resize=()=>{const p=latest.current;if(p)move(bound(p.x,p.y),true);};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setOpen(false);};window.addEventListener('resize',resize);window.visualViewport?.addEventListener('resize',resize);window.visualViewport?.addEventListener('scroll',resize);document.addEventListener('keydown',key);return()=>{cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('resize',resize);window.visualViewport?.removeEventListener('scroll',resize);document.removeEventListener('keydown',key);};},[]);
 function finishDrag(){const d=drag.current;if(d?.moved&&latest.current)move(latest.current,true);drag.current=null;}
 if(!mounted||suspended)return null;
 return createPortal(<><div ref={root} className="vartana-radio-dock" style={position?{left:position.x,top:position.y,right:'auto',bottom:'auto'}:undefined}
 onPointerDown={e=>{if(!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;const r=root.current!.getBoundingClientRect();suppressClick.current=false;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}}
 onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(!d.moved&&!isRadioDrag(dx,dy))return;if(!d.moved){d.moved=true;suppressClick.current=true;}e.preventDefault();move(bound(d.left+dx,d.top+dy));}}
 onPointerUp={finishDrag} onPointerCancel={finishDrag} onLostPointerCapture={e=>{if(e.target===e.currentTarget)finishDrag();}}
 onClickCapture={e=>{if(suppressClick.current&&e.detail!==0){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>
 <button type="button" className="vartana-radio-open" aria-label="Buka musik dan radio; tahan lalu geser untuk memindahkan" aria-expanded={open} aria-controls="vartana-health-radio" onClick={()=>setOpen(v=>!v)}><svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="18" height="14" rx="4"/><path d="m6 7 13-4M7 12h10"/><circle cx="8" cy="16" r="1.5"/><path d="M13 16h4"/></svg><span>Ruang Tenang<small>MUSIK / RADIO</small></span></button>
 <button type="button" className="vartana-radio-drag" aria-label="Geser posisi radio; gunakan tombol panah pada keyboard" title="Tahan dan geser bagian mana saja" onKeyDown={e=>{const directions:Record<string,number[]>={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};if(!directions[e.key])return;e.preventDefault();const r=root.current!.getBoundingClientRect();move(bound(r.left+directions[e.key][0],r.top+directions[e.key][1]),true);}}><svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="20" fill="currentColor">{[8,16].flatMap(x=>[6,12,18].map(y=><circle key={`${x}-${y}`} cx={x} cy={y} r="1.5"/>))}</svg></button>
 </div>{open&&<div className="vartana-radio-backdrop" onClick={()=>setOpen(false)}><section id="vartana-health-radio" className="vartana-radio-panel" aria-label="Musik dan radio" onClick={e=>e.stopPropagation()}><header><div><small>VARTANA · LISTEN & LEARN</small><h2>Ruang Tenang</h2></div><button type="button" aria-label="Tutup panel musik" onClick={()=>setOpen(false)}>×</button></header><p>Temani ritual teh dengan instrumental atau radio internasional.</p><div className="ambient-controls"><button type="button" aria-pressed={mode==='music'} onClick={()=>{halt();setMode('music');}}>Musik instrumental</button><button type="button" aria-pressed={mode==='radio'} onClick={()=>{halt();setMode('radio');}}>Radio live</button></div>{mode==='music'?<label>Pilih suasana<select className="w-full rounded-xl border p-3 my-3" value={theme} onChange={e=>{halt();setTheme(e.target.value as Theme);}}><option value="calm">Calm Spa</option><option value="nature">Alam · air & hutan</option><option value="jazz">Slow Jazz</option><option value="sax">Saxo Lounge</option></select></label>:<label>Pilih radio<select className="w-full rounded-xl border p-3 my-3" value={station} onChange={e=>{halt();setStation(e.target.value);}}>{stations.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}<button className="w-full rounded-full bg-[#173d2b] p-3 text-white" type="button" onClick={()=>playing||loading?halt():void play()}>{mode==='radio'&&!selectedStation.stream?'Buka pemutar Prambors':loading?'Menghubungkan... / Batal':playing?'Jeda':'Putar'}</button>{error&&<p role="status">{error}</p>}{mode==='radio'&&<a href={selectedStation.website} target="_blank" rel="noopener noreferrer">Situs resmi stasiun · dukung stasiun ↗</a>}<p className="radio-note">Audio tetap berjalan saat panel ditutup. Tekan Jeda untuk berhenti. Siaran dan iklan mengikuti stasiun.</p>
</section></div>}</>,document.body);
}
