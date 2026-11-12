import {NextRequest, NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {gamesRequest} from '@/lib/games-server';

const headers = {'Cache-Control': 'no-store'};
export async function GET(req: NextRequest) {
  try {
    const game = req.nextUrl.searchParams.get('game') || 'puzzle';
    if (!['puzzle', 'numbers','crossword'].includes(game)) throw new Error('Pilih game yang tersedia.');
    const result = await gamesRequest({operation: 'leaderboard', game});
    return NextResponse.json(result, {headers});
  } catch (error) {
    return NextResponse.json({message: error instanceof Error ? error.message : 'Ranking belum tersedia.'}, {status: 503, headers});
  }
}
export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('origin') !== new URL(req.url).origin) throw new Error('Buka game dari website VARTANA.');
    const body = await req.json();
    if (!['puzzle','numbers','crossword'].includes(body.game) || !['start','status','finish','timeout'].includes(body.operation)) throw new Error('Permintaan game tidak valid.');
    const existingSession = req.cookies.get('vartana_games')?.value;
    // A retried first start keeps the same session even if its response was lost.
    const session = existingSession || (body.operation==='start'&&/^[a-f0-9-]{36}$/i.test(String(body.requestId))?body.requestId:randomUUID());
    const result = await gamesRequest({operation:body.operation,game:body.game,session,requestId:body.requestId,attemptId:body.attemptId,name:body.name,phone:body.phone,email:body.email,placements:body.placements,answers:body.answers});
    const response = NextResponse.json(result, {headers});
    // Read-only status requests must not race to replace a new player's session cookie.
    if(existingSession||body.operation==='start')response.cookies.set('vartana_games',session,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:86400*8});
    return response;
  } catch (error) {
    return NextResponse.json({message:error instanceof Error?error.message:'Game belum tersedia.'}, {status:400,headers});
  }
}
