'use client';
import {adminFetch as fetch} from '@/lib/admin-fetch';
import {clientId} from '@/lib/client-id';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {defaultGameSettings,gameSeconds,gameName,type GameKind,type GameSettings} from '@/lib/games';
import {productImageUrl} from '@/lib/product-image';
import GameSimulation from './GameSimulation';
import GameOptions from './GameOptions';
import GameEmailDelivery,{type EmailDeliveryOverview} from './GameEmailDelivery';
import '../../editorial.css';
import '../../puzzle/puzzle.css';
import '../../games/games.css';

type AttemptRow={id:string;game:GameKind;name:string;phone:string;email:string;status:string;score:number;correctAnswers?:number;totalAnswers?:number;startedAt:string;durationMs?:number;revision:number};
export default function GamesAdmin(){
 const [settings,setSettings]=useState<Record<GameKind,GameSettings>>({puzzle:defaultGameSettings('puzzle'),numbers:defaultGameSettings('numbers'),crossword:defaultGameSettings('crossword')}),[game,setGame]=useState<GameKind>('puzzle');
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[connected,setConnected]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[attempts,setAttempts]=useState<AttemptRow[]>([]),[players,setPlayers]=useState(0),[total,setTotal]=useState(0),[sheet,setSheet]=useState('');
 const [emailDelivery,setEmailDelivery]=useState<EmailDeliveryOverview|null>(null);
 const [products,setProducts]=useState<{sku:string;name:string}[]>([]);
 const pending=useRef<{fingerprint:string;requestId:string}|null>(null),draft=settings[game];
 async function load(){setLoading(true);setError('');try{const response=await fetch('/api/admin/games',{cache:'no-store'}),data=await response.json();if(!response.ok)throw new Error(data.message);setSettings(data.settings);setProducts(data.products||[]);setEmailDelivery(data.emailDelivery||null);setAttempts(data.attempts);setPlayers(data.players);setTotal(data.totalAttempts);setSheet(data.spreadsheetUrl);setConnected(true);}catch(e){setConnected(false);setError(e instanceof Error?e.message:'Pengaturan belum dimuat.');}finally{setLoading(false);}}
 useEffect(()=>{void load();},[]);
 function edit<K extends keyof GameSettings>(key:K,value:GameSettings[K]){setSettings(previous=>({...previous,[game]:{...previous[game],[key]:value}}));setMessage('');}
 async function save(){
  if(saving)return;
  if(!Number.isInteger(draft.durationSeconds)||draft.durationSeconds<30||draft.durationSeconds>1800||!productImageUrl(draft.imageUrl)||!draft.imageAlt.trim()||!Number.isInteger(draft.questionCount)||draft.questionCount<5||draft.questionCount>30){setError('Periksa waktu 30–1800 detik, link foto, deskripsi foto, dan jumlah soal 5–30.');return;}
  setSaving(true);setError('');setMessage('');const fingerprint=JSON.stringify(draft);if(!pending.current||pending.current.fingerprint!==fingerprint)pending.current={fingerprint,requestId:clientId()};
  try{const response=await fetch('/api/admin/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({game,settings:draft,expectedRevision:draft.revision,requestId:pending.current.requestId})}),data=await response.json();if(!response.ok)throw new Error(data.message);setSettings(previous=>({...previous,[game]:data.settings}));pending.current=null;setMessage('Pengaturan tersimpan di GameSettings. Pemain baru memakai versi ini; riwayat percobaan lama tetap tersimpan.');}
  catch(e){setError(e instanceof Error?e.message:'Pengaturan belum tersimpan.');}finally{setSaving(false);}
 }
 return <main className="editorial games-admin"><header className="games-admin-heading"><span className="editorial-eyebrow">GAMES / PENGATURAN & SIMULASI</span><h1>Ruang bermain VARTANA</h1><p>Atur tantangan, coba simulasi, dan lihat peserta yang masuk ke spreadsheet.</p><div className="games-admin-actions"><Link href="/games" target="_blank">Lihat halaman Games ↗</Link><button type="button" onClick={()=>void load()} disabled={loading||saving}>Muat ulang data</button>{sheet&&<a href={sheet} target="_blank" rel="noopener noreferrer">Buka spreadsheet ↗</a>}</div></header>
 {error&&<p className="puzzle-error" role="alert">{error}</p>}{message&&<p className="games-admin-success" role="status">{message}</p>}{loading&&<p role="status">Memuat backend Games…</p>}
 <nav className="games-admin-tabs" aria-label="Pilih pengaturan game">{(['puzzle','numbers','crossword'] as GameKind[]).map(value=><button type="button" key={value} disabled={saving} aria-pressed={game===value} onClick={()=>{setGame(value);setMessage('');}}>{value==='puzzle'?'Puzzle · 20 keping':gameName(value)}</button>)}</nav>
 <div className="games-admin-grid"><form className="games-settings-form" onSubmit={e=>{e.preventDefault();void save();}}><h2>{'Pengaturan '+gameName(game)}</h2><label className="games-toggle"><input disabled={saving} type="checkbox" checked={draft.enabled} onChange={e=>edit('enabled',e.target.checked)}/> Game aktif untuk pemain baru</label><label>Batas waktu (detik)<input disabled={saving} type="number" min={30} max={1800} step={1} required value={draft.durationSeconds} onChange={e=>edit('durationSeconds',Number(e.target.value))}/></label>
 <label>{game==='puzzle'?'Gambar kartu & puzzle':'Gambar kartu & sampul kuis'}<input disabled={saving} type="text" maxLength={2000} required value={draft.imageUrl} onChange={e=>edit('imageUrl',e.target.value)}/></label><p className="puzzle-note">Tempel URL gambar atau link file Google Drive. Untuk Drive, atur akses Siapa saja yang memiliki link / Pelihat. Gambar digunakan di menu Games dan halaman kuis. Khusus puzzle, gambar ini juga menjadi 20 keping permainan.</p><label>Deskripsi gambar<input disabled={saving} required maxLength={160} value={draft.imageAlt} onChange={e=>edit('imageAlt',e.target.value)}/></label>{game==='puzzle'&&<p className="puzzle-note">20 keping, 5 kolom dan 4 baris. Gambar acuan selalu terlihat.</p>}{game==='numbers'&&<label>Jumlah soal<input disabled={saving} type="number" min={5} max={30} step={1} required value={draft.questionCount} onChange={e=>edit('questionCount',Number(e.target.value))}/></label>}
 <GameOptions settings={draft} products={products} disabled={saving} onChange={value=>{setSettings(previous=>({...previous,[game]:value}));setMessage('');}}/>
 <p className="puzzle-note">Versi tantangan {draft.revision}. Setiap penyimpanan membuat versi ranking baru agar rekor dari foto atau aturan berbeda tidak tercampur. Percobaan yang sedang berjalan tetap memakai pengaturan saat mulai.</p><button className="puzzle-primary" disabled={saving||loading||!connected}>{saving?'Menyimpan…':'Simpan pengaturan ke spreadsheet'}</button>{!connected&&<p className="puzzle-note">Simulasi tetap bisa dicoba. Penyimpanan membutuhkan backend Games terbaru yang sudah dideploy.</p>}</form><GameSimulation key={JSON.stringify(draft)} settings={draft}/></div>
 <GameEmailDelivery data={emailDelivery}/>
 <section className="games-admin-records"><h2>Peserta & riwayat permainan</h2><p>{players} peserta · {total} percobaan. Daftar berikut menampilkan 100 percobaan terakhir; seluruh data ada di GamePlayers dan GameAttempts.</p><p className="puzzle-note">Kontak lengkap di bawah hanya untuk admin. Halaman publik menerima WhatsApp dan email yang sudah disamarkan.</p><div className="games-ranking-scroll"><table className="games-ranking-table"><thead><tr><th>Nama</th><th>Game</th><th>WhatsApp</th><th>Email</th><th>Status</th><th>Jawaban benar</th><th>Waktu</th><th>Mulai</th><th>Versi</th></tr></thead><tbody>{attempts.map(row=><tr key={row.id}><td>{row.name}</td><td>{gameName(row.game)}</td><td>{row.phone}</td><td>{row.email}</td><td>{row.status}</td><td>{row.correctAnswers??row.score}/{row.totalAnswers??"—"} {row.game==='crossword'?'kata':row.game==='puzzle'?'keping':'soal'}</td><td>{row.durationMs===undefined?'—':gameSeconds(row.durationMs)}</td><td>{new Date(row.startedAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}</td><td>{row.revision}</td></tr>)}</tbody></table></div>{!attempts.length&&<p className="puzzle-note">Belum ada percobaan yang dimuat.</p>}</section>
 </main>;
}
