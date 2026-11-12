import type {GameKind,GameResponse} from './games';
const statuses=new Map<GameKind,Promise<GameResponse>>();
export function requestGame(game:GameKind,operation:string,extra:object={}):Promise<GameResponse>{
 const execute=async()=>{const response=await fetch('/api/games',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,game,...extra})});const data=await response.json();if(!response.ok||data.gamesVersion!==3)throw new Error(data.message||'Game belum tersedia. Coba muat ulang.');return data as GameResponse;};
 if(operation!=='status')return execute();
 const pending=statuses.get(game);if(pending)return pending;
 const task=execute().finally(()=>{if(statuses.get(game)===task)statuses.delete(game);});statuses.set(game,task);return task;
}
