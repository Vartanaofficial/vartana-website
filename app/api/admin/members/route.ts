import {NextRequest, NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {puzzleRequest} from '@/lib/puzzle-server';

async function run(request: NextRequest, write: boolean) {
  if(write && request.headers.get('origin') && request.headers.get('origin')!==request.nextUrl.origin) return NextResponse.json({success:false,message:'Asal permintaan tidak valid.'},{status:403});
  const secret=process.env.ADMIN_SESSION_SECRET;
  const token=request.cookies.get('vartana_admin_session')?.value;
  if(!secret||!token||!verifyAdminSessionToken(token,secret)) return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});
  try {
    const payload=write?{operation:'save',member:(await request.json()).member}:{operation:'list'};
    return NextResponse.json(await puzzleRequest('adminMembers',payload),{headers:{'Cache-Control':'no-store, private'}});
  } catch(error) {
    return NextResponse.json({success:false,message:error instanceof Error?error.message:'Data member belum tersedia.'},{status:502});
  }
}
export const GET=(request:NextRequest)=>run(request,false);
export const POST=(request:NextRequest)=>run(request,true);
