import {NextRequest,NextResponse} from 'next/server';
import {recoverLegacyOrder} from '@/lib/admin-order-analysis';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
export async function GET(req:NextRequest){
 const secret=process.env.ADMIN_SESSION_SECRET,token=req.cookies.get('vartana_admin_session')?.value;if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({message:'Silakan login admin.'},{status:401});
 try{const data=await requestMasterScript('adminRead',signPuzzle('adminRead',{operation:'orders'}));if(!Array.isArray(data.orders)||!Array.isArray(data.members))throw new Error('Respons pesanan belum lengkap.');return NextResponse.json({...data,orders:data.orders.map(recoverLegacyOrder)},{headers:{'Cache-Control':'no-store, private'}});}catch(e){return NextResponse.json({message:e instanceof Error?e.message:'Data pesanan belum dimuat.'},{status:502});}
}
