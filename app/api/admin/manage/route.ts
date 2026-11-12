import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {puzzleRequest} from '@/lib/puzzle-server';
import {sameOriginRequest} from '@/lib/request-origin';
import {broadcastImageUrl} from '@/lib/broadcast-image';

export async function POST(request:NextRequest){
  const secret=process.env.ADMIN_SESSION_SECRET,token=request.cookies.get('vartana_admin_session')?.value;
  if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});
  if(!sameOriginRequest(request))return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403});
  try{
    const body=await request.json();
    if(!['menuRead','menuSave','campaignCreate','campaignRead','campaignSend','campaignList'].includes(body.operation))throw Error('Tindakan tidak valid.');
    if(body.operation==='campaignCreate'&&body.imageUrl){
      body.imageUrl=broadcastImageUrl(body.imageUrl);
      let ready=false;
      try{ready=(await puzzleRequest('adminManagement',{operation:'campaignCapabilities'})).broadcastImageVersion===1;}catch{}
      if(!ready)throw Error('Backend foto broadcast belum dipasang. Pasang Apps Script terbaru sebelum membuat email dengan foto.');
    }
    return NextResponse.json(await puzzleRequest('adminManagement',body),{headers:{'Cache-Control':'no-store, private'}});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:'Permintaan belum diproses.'},{status:502});}
}
