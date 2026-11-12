import type {GameKind,GameResponse} from './games';
const statuses=new Map<GameKind,Promise<GameResponse>>();
export function requestGame(game:GameKind,operation:string,extra:object={}):Promise<GameResponse>{
 const execute=async()=>{try{const response=await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,game,...extra}),signal:AbortSignal.timeout(25000)});const data=await response.json();if(!response.ok||data.gamesVersion!==3)throw new Error(data.message||'Game belum tersedia. Coba muat ulang.');return data as GameResponse;}catch(e){if(e instanceof Error&&['AbortError','TimeoutError'].includes(e.name))throw new Error('Koneksi game terlalu lama. Coba lagi; percobaan yang sudah dimulai tetap tersimpan.');throw e;}};
 if(operation!=='status')return execute();
 const pending=statuses.get(game);if(pending)return pending;
 const task=execute().finally(()=>{if(statuses.get(game)===task)statuses.delete(game);});statuses.set(game,task);return task;
}
