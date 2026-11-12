'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';
import {clientId} from '@/lib/client-id';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {defaultGameSettings,gameSeconds,gameName,rewardDescription,type GameSettings,type GameRanking,type GameAttempt,type GameKind,type GameResponse,type GameVoucher} from '@/lib/games';
import GameLeaderboard from './GameLeaderboard';
import JigsawBoard from './JigsawBoard';
import CrosswordBoard from './CrosswordBoard';
import RewardEmailStatus from './RewardEmailStatus';
import {emptyPlacements,type Placements} from '@/lib/jigsaw';
import {productImageUrl} from '@/lib/product-image';
import {requestGame} from '@/lib/game-client';


type Progress={id:string;placements:Placements;answers:string[]};
function store(key:string,value:unknown){try{sessionStorage.setItem(key,JSON.stringify(value));}catch{/* Play can continue without browser storage. */}}
function read(key:string){try{return JSON.parse(sessionStorage.getItem(key)||'null');}catch{return null;}}
export default function GameArena({game}:{game:GameKind}) {
 const puzzle=game==='puzzle',crossword=game==='crossword',title=gameName(game);
 const [profile,setProfile]=useState({name:'',phone:'',email:''}),[attempt,setAttempt]=useState<GameAttempt|null>(null),[voucher,setVoucher]=useState<GameVoucher|null>(null);
 const [placements,setPlacements]=useState<Placements>(emptyPlacements),[answers,setAnswers]=useState<string[]>(Array(10).fill(''));
 const [settings,setSettings]=useState<GameSettings>(defaultGameSettings(game)),[imageReady,setImageReady]=useState(!puzzle),[feedback,setFeedback]=useState('');
 const [remaining,setRemaining]=useState(120),[busy,setBusy]=useState(true),[error,setError]=useState(''),[ready,setReady]=useState(false),[copied,setCopied]=useState(false),[revision,setRevision]=useState(0);
 const [ranking,setRanking]=useState<GameRanking|null>(null);
 const [rewardLimit,setRewardLimit]=useState<GameResponse['rewardLimit']>(null);
 const [focus,setFocus]=useState(false);
 const offset=useRef(0),sending=useRef(false),startKey=useRef(''),timeoutSent=useRef(''),arena=useRef<HTMLElement|null>(null);
 const progressKey=`vartana_game_${game}`;
 const emailPolls=useRef({attemptId:'',count:0});
 async function request(operation:string,extra:object={}) {
  const data=await requestGame(game,operation,extra);
  offset.current=data.serverNow-Date.now();return data as GameResponse;
 }
 function apply(data:GameResponse){
  setRanking(data.leaderboard);setAttempt(data.attempt);setVoucher(data.voucher);setRewardLimit(data.rewardLimit);setReady(true);setSettings(data.settings);setFeedback(data.attempt?.feedback||'');
  setRemaining(data.attempt?Math.max(0,Math.ceil((data.attempt.deadline-data.serverNow)/1000)):data.settings.durationSeconds);
  if(data.attempt){
   const saved=read(progressKey) as Progress|null,local=saved?.id===data.attempt.id?saved:null;
   setPlacements(data.attempt.status==='WON'&&puzzle?Array.from({length:20},(_,i)=>i):Array.isArray(local?.placements)&&local.placements.length===20?local.placements:emptyPlacements());
   setAnswers(Array.isArray(local?.answers)&&local.answers.length===(data.attempt.crossword?.cells.length||data.attempt.questions.length)?local.answers:Array(data.attempt.crossword?.cells.length||data.attempt.questions.length||data.settings.questionCount).fill(''));
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
  try{if(!startKey.current){const pending=read(`${progressKey}_pending`);startKey.current=typeof pending==='string'&&/^[a-f0-9-]{36}$/i.test(pending)?pending:clientId();store(`${progressKey}_pending`,startKey.current);}const data=await request('start',{...profile,requestId:startKey.current});store('vartana_game_profile',profile);apply(data);setFocus(window.innerWidth<=760);startKey.current='';store(`${progressKey}_pending`,null);timeoutSent.current='';setRevision(n=>n+1);requestAnimationFrame(()=>arena.current?.scrollIntoView({block:'start'}));}
  catch(e){setError(e instanceof Error?e.message:'Game belum dimulai.');}finally{sending.current=false;setBusy(false);}
 }
 async function finish(history=placements,operation='finish'){
  if(!attempt||sending.current)return;sending.current=true;setBusy(true);setError('');
  try{
   const data=await request(operation,{attemptId:attempt.id,placements:history,answers:crossword?answers:answers.map(value=>value.trim()===''?null:Number(value))});
   setAttempt(data.attempt);setVoucher(data.voucher);setRewardLimit(data.rewardLimit);setFeedback(data.attempt?.feedback||'');setRevision(n=>n+1);
  }catch(e){setError(e instanceof Error?e.message:'Hasil belum tersimpan. Coba kirim kembali.');}finally{sending.current=false;setBusy(false);}
 }
 async function emailAction(){
  if(!attempt||sending.current)return;sending.current=true;setBusy(true);setError('');
  try{const data=await request('status');setVoucher(data.voucher);setRewardLimit(data.rewardLimit);setRanking(data.leaderboard);}
  catch(e){setError(e instanceof Error?e.message:'Status email belum dimuat.');}finally{sending.current=false;setBusy(false);}
 }
 useEffect(()=>{
  if(attempt?.status!=='WON'||!['PENDING','SENDING'].includes(voucher?.email?.status||''))return;
  if(emailPolls.current.attemptId!==attempt.id)emailPolls.current={attemptId:attempt.id,count:0};
  if(emailPolls.current.count>=3)return;
  const timer=setTimeout(()=>{emailPolls.current.count++;void emailAction();},4000);
  return()=>clearTimeout(timer);
  // Bounded status polling never asks the backend to resend an existing email.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[attempt?.id,attempt?.status,voucher]);
 useEffect(()=>{
  if(attempt?.status==='STARTED'&&remaining===0&&!busy&&timeoutSent.current!==attempt.id){timeoutSent.current=attempt.id;void finish(placements,'timeout');}
  // Record a timeout once; the server also expires sessions if the browser closes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[attempt,remaining,busy]);
 function place(next:Placements){setPlacements(next);setFeedback('');if(attempt)store(progressKey,{id:attempt.id,placements:next,answers});}
 function answer(index:number,value:string){const next=[...answers];next[index]=value;setAnswers(next);if(attempt)store(progressKey,{id:attempt.id,placements,answers:next});}
 const playing=attempt?.status==='STARTED',terminal=attempt&&!playing,complete=puzzle&&playing&&placements.every(piece=>piece!==null);
 useEffect(()=>{if(!focus||!playing)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const exit=(e:KeyboardEvent)=>{if(e.key==='Escape')setFocus(false);};document.addEventListener('keydown',exit);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',exit);};},[focus,playing]);
 const activeSettings=attempt?.settings||settings,photo=productImageUrl(activeSettings.imageUrl),reward=activeSettings.reward;
 return <LocaleScope><>
 <section ref={arena} className={`puzzle-layout ${playing?'is-playing':''} ${playing&&focus?'is-focused':''}`}>
  <div className="puzzle-story"><span className="editorial-eyebrow">{puzzle?'01 / SUSUN PUZZLE':crossword?'03 / TEKA-TEKI SILANG':'02 / HITUNGAN ANGKA'}</span><h1>{crossword?<>Isi kotaknya.<br/><em>Temukan jawabannya.</em></>:puzzle?<>Susun kepingnya.<br/><em>Temukan gambar utuhnya.</em></>:<>Asah pikiran.<br/><em>Kejar rekor barumu.</em></>}</h1><p>{crossword?'Isi kotak mendatar dan menurun sesuai petunjuk. Tema tantangan: '+settings.theme+'.':puzzle?'Pilih keping dari baki, lalu tempatkan pada papan 20 keping. Cocokkan dengan gambar acuan yang selalu terlihat.':'Selesaikan '+settings.questionCount+' soal penjumlahan, pengurangan, dan perkalian. Jawab semuanya dengan benar untuk masuk papan rekor.'} Waktu bermain: {settings.durationSeconds} detik.</p>
   <div className="puzzle-prize"><span>HADIAH PERTAMA KALI BERHASIL</span><strong>{rewardDescription(reward)}</strong><p>{reward.minSpend?'Minimum belanja Rp'+reward.minSpend.toLocaleString('id-ID'):'Tanpa minimum belanja'} · berlaku {reward.days} hari.</p></div>
   <details className="puzzle-rules"><summary>Aturan permainan, ranking & hadiah</summary><p>Waktu dihitung oleh server sejak tantangan dibuat sampai hasil diterima. Refresh tidak mengulang waktu. Ranking puzzle hanya untuk susunan 20 keping yang benar, diurutkan dari waktu tercepat. Ranking TTS dan hitungan angka mengutamakan jumlah jawaban benar, lalu waktu tercepat. TTS dihitung per kata lengkap, bukan huruf. Jika tetap sama, yang selesai lebih dulu berada di atas.</p><p>Kamu boleh bermain lagi untuk memperbaiki rekor. Tiga kemenangan pertama dengan hadiah mendapat tiga kode berbeda, maksimal 3 voucher per email/nomor WhatsApp untuk seluruh game. Setelah itu kamu tetap bisa bermain dan masuk ranking tanpa hadiah atau email tambahan. Ketentuan hadiah mengikuti pengaturan saat mulai bermain: {rewardDescription(reward)}. Berlaku {reward.days} hari dan dipakai sekali saat belanja, tanpa digabung promo lain. Sisa nilai potongan tidak dikembalikan.</p><p>Nama, WhatsApp, email, waktu mulai, status, dan hasil permainan disimpan pada spreadsheet VARTANA. Nama tampil di ranking; WhatsApp dan email disamarkan. Gunakan data milikmu sendiri.</p></details>
   <Link href="/games" className="game-switcher"><span className="game-switcher-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M15 18h6m-3-3 3 3-3 3"/></svg></span><span><strong>Jelajahi game lain</strong><small>Puzzle, Angka &amp; TTS</small></span><span aria-hidden="true">&rarr;</span></Link>
  </div>
  <div className="puzzle-card"><div className="puzzle-card-head"><span>{title.toUpperCase()}</span>{playing&&<button type="button" className="game-focus-toggle" aria-pressed={focus} onClick={()=>setFocus(v=>!v)}>{focus?"Keluar mode fokus":"Mode fokus"}</button>}<strong className={remaining<=20&&playing?'puzzle-urgent':''} role="timer" aria-label={`Sisa waktu ${remaining} detik`}>{Math.floor((playing?remaining:settings.durationSeconds)/60)}:{String((playing?remaining:settings.durationSeconds)%60).padStart(2,'0')}</strong></div>
   {!puzzle&&!playing&&<img className="games-quiz-cover" src={photo} alt={activeSettings.imageAlt}/>}
   {crossword?(attempt?.crossword?<><CrosswordBoard challenge={attempt.crossword} answers={answers} onChange={answer} disabled={!playing||remaining<=0||busy}/>{playing&&<button type="button" className="puzzle-primary" disabled={busy||remaining<=0||answers.some(v=>!v)} onClick={()=>void finish()}>Periksa TTS & catat rekor</button>}{feedback&&<p className="puzzle-note" role="status">{feedback}</p>}</>:<div className="games-math-preview"><strong>TTS</strong><p>Rempah, pahlawan, dan pengetahuan umum. Tema saat ini: {settings.theme}.</p></div>):puzzle?(!attempt?<div className="puzzle-preview"><img src={photo} alt={activeSettings.imageAlt}/><span>20 keping. Satu gambar utuh.</span></div>:<JigsawBoard key={attempt.id} image={photo} alt={activeSettings.imageAlt} pieces={attempt.pieces||[]} placements={placements} onChange={place} disabled={!playing||remaining<=0||busy}/>):!attempt?<div className="games-math-preview" aria-label="Tantangan hitungan angka"><span>12 + 8</span><strong>7 × 6</strong><span>45 − 17</span><p>{settings.questionCount} soal. {settings.durationSeconds} detik. Seberapa cepat kamu?</p></div>:<form className="games-questions" onSubmit={e=>{e.preventDefault();void finish();}}><p className="puzzle-note">Isi semua jawaban, lalu kirim hasil. Jawaban diperiksa server.</p>{attempt.questions.map((q,index)=><label key={index}><span>{index+1}. {q.text} =</span><input aria-label={`Jawaban soal ${index+1}: ${q.text}`} type="number" inputMode="numeric" min={0} max={10000} step={1} required value={answers[index]} disabled={!playing||remaining<=0||busy} onChange={e=>answer(index,e.target.value)}/></label>)}{playing&&<button className="puzzle-primary" disabled={busy||remaining<=0}>Kirim jawaban & catat rekor</button>}</form>}
   <div aria-live="polite">{busy&&<p className="puzzle-note" role="status">{playing?'Menyimpan hasil permainan…':'Menghubungkan ke spreadsheet…'}</p>}{error&&<p className="puzzle-error" role="alert">{error}</p>}</div>
   {ready&&!settings.enabled&&<p className="puzzle-error">Game sedang dinonaktifkan admin. Silakan pilih game lain.</p>}
   {!ready&&!busy&&<button className="puzzle-primary" onClick={async()=>{setBusy(true);setError('');try{apply(await request('status'));}catch(e){setError(e instanceof Error?e.message:'Belum terhubung.');}finally{setBusy(false);}}}>Periksa koneksi game lagi</button>}
   {playing&&puzzle&&<><p className="puzzle-note">Susun semua 20 keping. Keping yang sudah dipasang bisa dilepas atau diganti sebelum mengirim hasil.</p><button className="puzzle-primary" disabled={busy||!complete||remaining<=0} onClick={()=>void finish()}>Periksa susunan & catat rekor</button>{feedback&&<p className="puzzle-note" role="status">{feedback}</p>}</>}
   {playing&&remaining===0&&!busy&&<button className="puzzle-primary" onClick={()=>void finish(placements,'timeout')}>Catat waktu habis & coba lagi</button>}
   {terminal&&<div className="games-result" role="status"><h2>{attempt.status==='WON'?'Berhasil! Rekormu tercatat.':attempt.status==='EXPIRED'?'Waktu habis. Yuk, coba lagi!':'Belum semua jawaban benar.'}</h2><p>{!puzzle&&attempt.totalAnswers!==undefined&&<strong>Jawaban benar: {attempt.correctAnswers}/{attempt.totalAnswers} {crossword?'kata':'soal'}. </strong>}{attempt.status==='WON'?`Waktu: ${gameSeconds(attempt.durationMs||0)}`:(puzzle||crossword)?'Percobaanmu tetap tersimpan. Mulai lagi untuk mengejar rekor.':`Jawaban benar: ${attempt.score}/${attempt.questions.length}. Percobaan ini tetap tersimpan.`}</p></div>}
   {attempt?.status==='WON'&&voucher&&<div className="puzzle-winner"><span>HADIAH MILIKMU</span><strong>{rewardDescription(voucher.reward||reward)}</strong><strong className="puzzle-code">{voucher.code}</strong><p>Maksimal 3 voucher berbeda untuk seluruh game. Berlaku sampai {new Date(voucher.expiresAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})} WIB; kode yang sudah dipakai atau kedaluwarsa tidak diterbitkan ulang.</p><button className="puzzle-primary" onClick={async()=>{try{await navigator.clipboard.writeText(voucher.code);setCopied(true);}catch{setError('Pilih dan salin kode voucher di atas.');}}}>{copied?'Kode tersalin':'Salin kode voucher'}</button><RewardEmailStatus voucher={voucher} busy={busy} onRefresh={()=>void emailAction()}/><Link href={`/checkout?promo=${encodeURIComponent(voucher.code)}`}>Pakai di checkout →</Link></div>}
   {attempt?.status==='WON'&&!voucher&&rewardLimit?.remaining===0&&<p className="puzzle-note" role="status">Rekormu tetap tercatat. Batas 3 voucher sudah tercapai. Kamu tetap bisa bermain tanpa hadiah atau email tambahan.</p>}
   {!playing&&<form className="puzzle-member" onSubmit={e=>{e.preventDefault();void start();}}><label>Nama untuk ranking<input autoComplete="name" required maxLength={80} value={profile.name} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Nomor WhatsApp<input type="tel" autoComplete="tel" required maxLength={25} value={profile.phone} onChange={e=>setProfile({...profile,phone:e.target.value})} placeholder="0812…"/></label><label>Email<input type="email" autoComplete="email" required maxLength={200} value={profile.email} onChange={e=>setProfile({...profile,email:e.target.value})}/></label><p className="puzzle-note">Tidak perlu pernah belanja. Namamu tampil di ranking; WhatsApp dan email disamarkan. Data lengkap disimpan oleh VARTANA. Tiga kemenangan pertama mendapat kode hadiah berbeda, masing-masing berlaku 7 hari dan dikirim ke email ini satu kali. Setelah itu kamu tetap bisa bermain dan masuk ranking tanpa hadiah atau email tambahan.</p><button className="puzzle-primary" disabled={busy||!ready||!settings.enabled||(puzzle&&!imageReady)}>{attempt?'Main lagi & perbaiki rekor':'Mulai tantangan ('+settings.durationSeconds+' detik)'}</button></form>}
  </div>
 </section>
 <GameLeaderboard game={game} revision={revision} initialData={ranking||undefined} waitingForInitial/>
 </></LocaleScope>;
}
