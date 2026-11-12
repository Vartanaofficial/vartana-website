import type {CrosswordEntry,CrosswordChallenge} from './crossword';
export type GameKind = 'puzzle' | 'numbers' | 'crossword';
export type GameReward={type:'nominal'|'percent'|'shipping'|'gift'|'none';value:number;sku:string;quantity:number;days:number;minSpend:number;maxDiscount:number;productName?:string};
export const defaultReward=():GameReward=>({type:'nominal',value:20000,sku:'',quantity:1,days:7,minSpend:0,maxDiscount:0});
export type GameSettings = {game:GameKind;enabled:boolean;durationSeconds:number;imageUrl:string;imageAlt:string;questionCount:number;revision:number;updatedAt:string;reward:GameReward;theme:string;entries:CrosswordEntry[]};
export type GameAttempt = {
  id: string; game: GameKind; board: number[] | null; questions: {text: string}[];
  startedAt: number; deadline: number; status: 'STARTED' | 'WON' | 'FAILED' | 'EXPIRED';
  durationMs?: number; correctAnswers?:number;totalAnswers?:number; score: number; answerCount: number;
  settings:GameSettings; pieces?:number[];
  feedback?:string;crossword?:CrosswordChallenge;
};
export type GameEmail={status:string;sendCount:number;maxSends:number;recipient?:string;nextAllowedAt?:string;canResend:boolean};
export type GameVoucher = {code: string; value: number; expiresAt: string;reward?:GameReward;email?:GameEmail|null};
export type GameRanking = {entries: {rank: number; name: string; phone: string; email: string; durationMs: number; correctAnswers?:number;totalAnswers?:number;completedAt: string}[]; totalPlayers: number; attempts: number};
export type GameResponse = {success: true; gamesVersion: number; serverNow: number; attempt: GameAttempt | null; voucher: GameVoucher | null; leaderboard: GameRanking; settings:GameSettings;rewardLimit?:{earned:number;max:number;remaining:number}|null};
export const defaultGameSettings=(game:GameKind):GameSettings=>({game,enabled:true,durationSeconds:120,imageUrl:game==='puzzle'?'/vartana-spices-hero.jpg':`/games-${game}.svg`,imageAlt:game==='puzzle'?'Jahe, kunyit, serai, dan aneka rempah VARTANA':game==='numbers'?'Kartu hitungan angka VARTANA':'Papan teka-teki silang VARTANA',questionCount:10,revision:1,updatedAt:'',reward:defaultReward(),theme:'rempah',entries:[]});
export const gameName=(game:GameKind)=>game==='puzzle'?'Puzzle Rempah':game==='numbers'?'Hitungan Angka':'Teka-teki Silang';
export function rewardDescription(reward:GameReward){const rupiah=(n:number)=>'Rp'+n.toLocaleString('id-ID');return reward.type==='none'?'Bermain untuk rekor':reward.type==='gift'?`Bonus ${reward.quantity} ${reward.productName||reward.sku||'produk pilihan'}`:reward.type==='percent'?`Diskon ${reward.value}%`:reward.type==='shipping'?`Potongan ongkir ${rupiah(reward.value)}`:`Voucher ${rupiah(reward.value)}`;}
export const gameSeconds = (ms: number) => (ms / 1000).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' dtk';
