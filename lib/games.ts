export type GameKind = 'puzzle' | 'numbers';
export type GameSettings = {game:GameKind;enabled:boolean;durationSeconds:number;imageUrl:string;imageAlt:string;questionCount:number;revision:number;updatedAt:string};
export type GameAttempt = {
  id: string; game: GameKind; board: number[] | null; questions: {text: string}[];
  startedAt: number; deadline: number; status: 'STARTED' | 'WON' | 'FAILED' | 'EXPIRED';
  durationMs?: number; score: number; answerCount: number;
  settings:GameSettings; pieces?:number[];
  feedback?:string;
};
export type GameVoucher = {code: string; value: number; expiresAt: string};
export type GameRanking = {entries: {rank: number; name: string; phone: string; email: string; durationMs: number; completedAt: string}[]; totalPlayers: number; attempts: number};
export type GameResponse = {success: true; gamesVersion: number; serverNow: number; attempt: GameAttempt | null; voucher: GameVoucher | null; leaderboard: GameRanking; settings:GameSettings};
export const defaultGameSettings=(game:GameKind):GameSettings=>({game,enabled:true,durationSeconds:120,imageUrl:'/vartana-spices-hero.jpg',imageAlt:'Jahe, kunyit, serai, dan aneka rempah VARTANA',questionCount:10,revision:1,updatedAt:''});
export const gameSeconds = (ms: number) => (ms / 1000).toLocaleString('id-ID', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' dtk';
