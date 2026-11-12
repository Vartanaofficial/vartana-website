import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {gamesAdminRequest} from '@/lib/games-server';

const headers={'Cache-Control':'no-store'};
function authorized(req:NextRequest){const secret=process.env.ADMIN_SESSION_SECRET,token=req.cookies.get('vartana_admin_session')?.value;return !!(secret&&token&&verifyAdminSessionToken(token,secret));}
export async function GET(req:NextRequest){
 if(!authorized(req))return NextResponse.json({message:'Silakan login admin.'},{status:401,headers});
 try{return NextResponse.json(await gamesAdminRequest({operation:'settings'}),{headers});}
 catch(e){return NextResponse.json({message:e instanceof Error?e.message:'Data Games belum dimuat.'},{status:502,headers});}
}
export async function POST(req:NextRequest){
 if(!authorized(req))return NextResponse.json({message:'Silakan login admin.'},{status:401,headers});
 try{
  if(req.headers.get('origin')!==new URL(req.url).origin)throw new Error('Buka pengaturan dari dashboard VARTANA.');
  const body=await req.json();
  if(!['puzzle','numbers','crossword'].includes(body.game))throw new Error('Pilih game yang tersedia.');
  return NextResponse.json(await gamesAdminRequest({operation:'saveSettings',game:body.game,settings:body.settings,expectedRevision:body.expectedRevision,requestId:body.requestId}),{headers});
 }catch(e){return NextResponse.json({message:e instanceof Error?e.message:'Pengaturan belum tersimpan.'},{status:400,headers});}
}
