'use client';
import {useEffect,useRef,useState} from 'react';
import {gameSeconds,gameName,type GameKind,type GameRanking} from '@/lib/games';
import {readClientJson} from '@/lib/client-reads';

export default function GameLeaderboard({game,revision=0,initialData,waitingForInitial=false}:{game:GameKind;revision?:number;initialData?:GameRanking;waitingForInitial?:boolean}) {
 const [data,setData]=useState<GameRanking|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0);
 const lastInitial=useRef<GameRanking|undefined>(undefined);
 useEffect(()=>{
  if(initialData&&lastInitial.current!==initialData){lastInitial.current=initialData;setData(initialData);setLoading(false);setError('');return;}
  if(waitingForInitial&&!initialData){setLoading(false);return;}
  let active=true;setLoading(true);setError('');
  readClientJson<{leaderboard:GameRanking}>(`/api/games?game=${game}`,5000,refresh>0).then(result=>{if(active)setData(result.leaderboard);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[game,revision,refresh,initialData,waitingForInitial]);
 return <section className="games-ranking" aria-label={`Ranking ${gameName(game)}`}><div className="games-ranking-head"><div><span className="editorial-eyebrow">PAPAN REKOR</span><h2>{game==='puzzle'?'Tercepat menyusun rempah':game==='numbers'?'Rekor hitungan angka':'Rekor teka-teki silang'}</h2></div><button type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading}>Segarkan ranking</button></div><p className="puzzle-note">{game==='puzzle'?'Hanya susunan 20/20 keping yang benar. Waktu tercepat di atas.':'Jumlah jawaban benar tertinggi di atas, lalu waktu tercepat. TTS dihitung per kata lengkap.'} Jika sama, yang selesai lebih awal di atas. Kontak sudah disamarkan sebelum dikirim ke browser.</p>{loading&&<p className="puzzle-note" role="status">Memuat rekor…</p>}{error?<p className="puzzle-error" role="alert">{error}</p>:data&&<>{data.entries.length?<div className="games-ranking-scroll"><table className="games-ranking-table"><caption>Ranking {gameName(game)}</caption><thead><tr><th scope="col">Rank</th><th scope="col">Nama</th><th scope="col">WhatsApp</th><th scope="col">Email</th><th scope="col">Benar</th><th scope="col">Waktu</th></tr></thead><tbody>{data.entries.map(row=><tr key={row.rank}><td data-label="Peringkat"><strong>#{row.rank}</strong></td><td data-label="Nama">{row.name}</td><td data-label="WhatsApp">{row.phone}</td><td data-label="Email">{row.email}</td><td data-label="Jawaban benar"><strong>{row.correctAnswers??(game==='puzzle'?20:'—')}/{row.totalAnswers??(game==='puzzle'?20:'—')}</strong> {game==='crossword'?'kata':game==='puzzle'?'keping':'soal'}</td><td data-label="Waktu">{gameSeconds(row.durationMs)}</td></tr>)}</tbody></table></div>:<p className="puzzle-note">Belum ada rekor. Jadilah yang pertama menyelesaikan tantangan!</p>}<p className="puzzle-note">{data.totalPlayers} pemain di papan rekor · {data.attempts} percobaan tercatat · maksimal 50 peringkat. Waktu dihitung server sampai hasil diterima.</p></>}</section>;
}
