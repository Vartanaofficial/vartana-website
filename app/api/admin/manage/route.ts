import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {puzzleRequest} from '@/lib/puzzle-server';

export async function POST(request:NextRequest){
  const secret=process.env.ADMIN_SESSION_SECRET,token=request.cookies.get('vartana_admin_session')?.value;
  if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});
  if(request.headers.get('origin')&&request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403});
  try{
    const body=await request.json();
    if(!['menuRead','menuSave','campaignCreate','campaignRead','campaignSend','campaignList'].includes(body.operation))throw Error('Tindakan tidak valid.');
    return NextResponse.json(await puzzleRequest('adminManagement',body),{headers:{'Cache-Control':'no-store, private'}});
  }catch(error){return NextResponse.json({success:false,message:error instanceof Error?error.message:'Permintaan belum diproses.'},{status:502});}
}
