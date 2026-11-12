'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {defaultGameSettings,gameSeconds,type GameSettings,type GameRanking,type GameAttempt,type GameKind,type GameResponse,type GameVoucher} from '@/lib/games';
import GameLeaderboard from './GameLeaderboard';
import JigsawBoard from './JigsawBoard';
import {emptyPlacements,type Placements} from '@/lib/jigsaw';
import {productImageUrl} from '@/lib/product-image';
import {requestGame} from '@/lib/game-client';


type Progress={id:string;placements:Placements;answers:string[]};
function store(key:string,value:unknown){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{/* Play can continue without browser storage. */}}
function read(key:string){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
export default function GameArena({game}:{game:GameKind}) {
 const puzzle=game==='puzzle',title=puzzle?'Puzzle Rempah':'Hitungan Angka';
 const [profile,setProfile]=useState({name:'',phone:'',email:''}),[attempt,setAttempt]=useState<GameAttempt|null>(null),[voucher,setVoucher]=useState<GameVoucher|null>(null);
 const [placements,setPlacements]=useState<Placements>(emptyPlacements),[answers,setAnswers]=useState<string[]>(Array(10).fill(''));
 const [settings,setSettings]=useState<GameSettings>(defaultGameSettings(game)),[imageReady,setImageReady]=useState(!puzzle),[feedback,setFeedback]=useState('');
 const [remaining,setRemaining]=useState(120),[busy,setBusy]=useState(true),[error,setError]=useState(''),[ready,setReady]=useState(false),[copied,setCopied]=useState(false),[revision,setRevision]=useState(0);
 const [ranking,setRanking]=useState<GameRanking|null>(null);
 const offset=useRef(0),sending=useRef(false),startKey=useRef(''),timeoutSent=useRef('');
 const progressKey=`vartana_game_${game}`;
 async function request(operation:string,extra:object={}) {
  const data=await requestGame(game,operation,extra);
  offset.current=data.serverNow-Date.now();return data as GameResponse;
 }
 function apply(data:GameResponse){
  setRanking(data.leaderboard);setAttempt(data.attempt);setVoucher(data.voucher);setReady(true);setSettings(data.settings);setFeedback(data.attempt?.feedback||'');
  setRemaining(data.attempt?Math.max(0,Math.ceil((data.attempt.deadline-data.serverNow)/1000)):data.settings.durationSeconds);
  if(data.attempt){
   const saved=read(progressKey) as Progress|null,local=saved?.id===data.attempt.id?saved:null;
   setPlacements(data.attempt.status==='WON'&&puzzle?Array.from({length:20},(_,i)=>i):Array.isArray(local?.placements)&&local.placements.length===20?local.placements:emptyPlacements());
   setAnswers(Array.isArray(local?.answers)&&local.answers.length===data.attempt.questions.length?local.answers:Array(data.attempt.questions.length||data.settings.questionCount).fill(''));
  }
 }
 useEffect(()=>{
  if(!puzzle)return;
  setImageReady(false);const photo=new Image();let active=true;
  photo.onload=()=>{if(active)setImageReady(true);};photo.onerror=()=>{if(active)setError('Foto puzzle belum bisa dimuat. Admin perlu memeriksa link Drive dan akses Pelihat untuk siapa saja yang memiliki link.');};photo.src=productImageUrl(settings.imageUrl);
  return ()=>{active=false;};
 },[puzzle,settings.imageUrl]);
 useEffect(()=>{
  let active=true;const saved=read('vartana_game_profile');if(saved&&typeof saved.name==='string'&&typeof saved.phone==='string'&&typeof saved.email==='string')setProfile(saved);
  request('status').then(data=>{if(active)apply(data);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});
  return ()=>{active=false;};
  // Each game has its own mounted arena and session progress.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[game]);
 useEffect(()=>{
  if(!attempt)return;const tick=()=>setRemaining(Math.max(0,Math.ceil((attempt.deadline-Date.now()-offset.current)/1000)));tick();const timer=window.setInterval(tick,200);return ()=>window.clearInterval(timer);
 },[attempt]);
 async function start(){
  if(sending.current)return;sending.current=true;setBusy(true);setError('');setCopied(false);
  if(!startKey.current){const pending=read(`${progressKey}_pending`);startKey.current=typeof pending==='string'&&/^[a-f0-9-]{36}$/i.test(pending)?pending:crypto.randomUUID();store(`${progressKey}_pending`,startKey.current);}
  try{const data=await request('start',{...profile,requestId:startKey.current});store('vartana_game_profile',profile);apply(data);startKey.current='';store(`${progressKey}_pending`,null);timeoutSent.current='';setRevision(n=>n+1);}
  catch(e){setError(e instanceof Error?e.message:'Game belum dimulai.');}finally{sending.current=false;setBusy(false);}
 }
 async function finish(history=placements,operation='finish'){
  if(!attempt||sending.current)return;sending.current=true;setBusy(true);setError('');
  try{
   const data=await request(operation,{attemptId:attempt.id,placements:history,answers:answers.map(value=>value.trim()===''?null:Number(value))});
   setAttempt(data.attempt);setVoucher(data.voucher);setFeedback(data.attempt?.feedback||'');setRevision(n=>n+1);
  }catch(e){setError(e instanceof Error?e.message:'Hasil belum tersimpan. Coba kirim kembali.');}finally{sending.current=false;setBusy(false);}
 }
 useEffect(()=>{
  if(attempt?.status==='STARTED'&&remaining===0&&!busy&&timeoutSent.current!==attempt.id){timeoutSent.current=attempt.id;void finish(placements,'timeout');}
  // Record a timeout once; the server also expires sessions if the browser closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[attempt,remaining,busy]);
 function place(next:Placements){setPlacements(next);setFeedback('');if(attempt)store(progressKey,{id:attempt.id,placements:next,answers});}
 function answer(index:number,value:string){const next=[...answers];next[index]=value;setAnswers(next);if(attempt)store(progressKey,{id:attempt.id,placements,answers:next});}
 const playing=attempt?.status==='STARTED',terminal=attempt&&!playing,complete=puzzle&&playing&&placements.every(piece=>piece!==null);
 const activeSettings=attempt?.settings||settings,photo=productImageUrl(activeSettings.imageUrl);
 return <>
 <section className="puzzle-layout">
  <div className="puzzle-story"><span className="editorial-eyebrow">{puzzle?'01 / SUSUN PUZZLE':'02 / HITUNGAN ANGKA'}</span><h1>{puzzle?<>Sepotong rempah.<br/><em>Satukan ceritanya.</em></>:<>Asah pikiran.<br/><em>Kejar rekor barumu.</em></>}</h1><p>{puzzle?'Pilih keping dari baki, lalu tempatkan pada papan 20 keping. Cocokkan dengan gambar acuan yang selalu terlihat.':'Selesaikan '+settings.questionCount+' soal penjumlahan, pengurangan, dan perkalian. Jawab semuanya dengan benar untuk masuk papan rekor.'} Waktu bermain: {settings.durationSeconds} detik.</p>
   <div className="puzzle-prize"><span>HADIAH PERTAMA KALI BERHASIL</span><strong>Rp20.000</strong><p>Tanpa minimum belanja · berlaku 7 hari.</p></div>
   <details className="puzzle-rules"><summary>Aturan permainan, ranking & hadiah</summary><p>Waktu dihitung oleh server sejak tantangan dibuat sampai hasil diterima. Refresh tidak mengulang waktu. Ranking menampilkan rekor terbaik per nomor WhatsApp untuk masing-masing game; jika waktu sama, yang selesai lebih dulu berada di atas.</p><p>Kamu boleh bermain lagi untuk memperbaiki rekor. Hadiah satu kali per member/nomor WhatsApp untuk seluruh game, bukan setiap percobaan atau setiap jenis game. Voucher memotong harga produk maksimal Rp20.000, tidak termasuk ongkir, tidak digabung promo lain, dan sisa nilai tidak dikembalikan.</p><p>Nama, WhatsApp, email, waktu mulai, status, dan hasil permainan disimpan pada spreadsheet VARTANA. Nama tampil di ranking; WhatsApp dan email disamarkan. Gunakan data milikmu sendiri.</p></details>
   <Link href="/games">← Pilih game lain</Link>
  </div>
  <div className="puzzle-card"><div className="puzzle-card-head"><span>{title.toUpperCase()}</span><strong className={remaining<=20&&playing?'puzzle-urgent':''} role="timer" aria-label={`Sisa waktu ${remaining} detik`}>{Math.floor((playing?remaining:settings.durationSeconds)/60)}:{String((playing?remaining:settings.durationSeconds)%60).padStart(2,'0')}</strong></div>
   {puzzle?(!attempt?<div className="puzzle-preview"><img src={photo} alt={activeSettings.imageAlt}/><span>20 keping. Satu gambar utuh.</span></div>:<JigsawBoard key={attempt.id} image={photo} alt={activeSettings.imageAlt} pieces={attempt.pieces||[]} placements={placements} onChange={place} disabled={!playing||remaining<=0||busy}/>):!attempt?<div className="games-math-preview" aria-label="Tantangan hitungan angka"><span>12 + 8</span><strong>7 × 6</strong><span>45 − 17</span><p>{settings.questionCount} soal. {settings.durationSeconds} detik. Seberapa cepat kamu?</p></div>:<form className="games-questions" onSubmit={e=>{e.preventDefault();void finish();}}><p className="puzzle-note">Isi semua jawaban, lalu kirim hasil. Jawaban diperiksa server.</p>{attempt.questions.map((q,index)=><label key={index}><span>{index+1}. {q.text} =</span><input aria-label={`Jawaban soal ${index+1}: ${q.text}`} type="number" inputMode="numeric" min={0} max={10000} step={1} required value={answers[index]} disabled={!playing||remaining<=0||busy} onChange={e=>answer(index,e.target.value)}/></label>)}{playing&&<button className="puzzle-primary" disabled={busy||remaining<=0}>Kirim jawaban & catat rekor</button>}</form>}
   <div aria-live="polite">{busy&&<p className="puzzle-note" role="status">{playing?'Menyimpan hasil permainan…':'Menghubungkan ke spreadsheet…'}</p>}{error&&<p className="puzzle-error" role="alert">{error}</p>}</div>
   {ready&&!settings.enabled&&<p className="puzzle-error">Game sedang dinonaktifkan admin. Silakan pilih game lain.</p>}
   {!ready&&!busy&&<button className="puzzle-primary" onClick={async()=>{setBusy(true);setError('');try{apply(await request('status'));}catch(e){setError(e instanceof Error?e.message:'Belum terhubung.');}finally{setBusy(false);}}}>Periksa koneksi game lagi</button>}
   {playing&&puzzle&&<><p className="puzzle-note">Susun semua 20 keping. Keping yang sudah dipasang bisa dilepas atau diganti sebelum mengirim hasil.</p><button className="puzzle-primary" disabled={busy||!complete||remaining<=0} onClick={()=>void finish()}>Periksa susunan & catat rekor</button>{feedback&&<p className="puzzle-note" role="status">{feedback}</p>}</>}
   {playing&&remaining===0&&!busy&&<button className="puzzle-primary" onClick={()=>void finish(placements,'timeout')}>Catat waktu habis & coba lagi</button>}
   {terminal&&<div className="games-result" role="status"><h2>{attempt.status==='WON'?'Berhasil! Rekormu tercatat.':attempt.status==='EXPIRED'?'Waktu habis. Yuk, coba lagi!':'Belum semua jawaban benar.'}</h2><p>{attempt.status==='WON'?`Waktu: ${gameSeconds(attempt.durationMs||0)}`:puzzle?'Percobaanmu tetap tersimpan. Mulai lagi untuk mengejar rekor.':`Jawaban benar: ${attempt.score}/${attempt.questions.length}. Percobaan ini tetap tersimpan.`}</p></div>}
   {attempt?.status==='WON'&&voucher&&<div className="puzzle-winner"><span>VOUCHER MILIKMU</span><strong className="puzzle-code">{voucher.code}</strong><p>Satu hadiah untuk seluruh game. Berlaku sampai {new Date(voucher.expiresAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})} WIB; kode yang sudah dipakai atau kedaluwarsa tidak diterbitkan ulang.</p><button className="puzzle-primary" onClick={async()=>{try{await navigator.clipboard.writeText(voucher.code);setCopied(true);}catch{setError('Pilih dan salin kode voucher di atas.');}}}>{copied?'Kode tersalin':'Salin kode voucher'}</button><Link href={`/checkout?promo=${encodeURIComponent(voucher.code)}`}>Pakai di checkout →</Link></div>}
   {!playing&&<form className="puzzle-member" onSubmit={e=>{e.preventDefault();void start();}}><label>Nama untuk ranking<input autoComplete="name" required maxLength={80} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Nomor WhatsApp<input type="tel" autoComplete="tel" required maxLength={25} value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="0812…"/></label><label>Email<input type="email" autoComplete="email" required maxLength={200} value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><p className="puzzle-note">Tidak perlu pernah belanja. Namamu tampil di ranking; WhatsApp dan email disamarkan. Data lengkap disimpan oleh VARTANA.</p><button className="puzzle-primary" disabled={busy||!ready||!settings.enabled||(puzzle&&!imageReady)}>{attempt?'Main lagi & perbaiki rekor':'Mulai tantangan ('+settings.durationSeconds+' detik)'}</button></form>}
  </div>
 </section>
 <GameLeaderboard game={game} revision={revision} initialData={ranking||undefined} waitingForInitial/>
 </>;
}
