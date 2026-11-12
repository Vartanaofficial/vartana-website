import {NextRequest,NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {requestMasterScript} from '@/lib/master-products';
export async function GET(req:NextRequest){
 const secret=process.env.ADMIN_SESSION_SECRET,token=req.cookies.get('vartana_admin_session')?.value;
 if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});
 try{const data=await requestMasterScript('getProductStock');if(data.productStockVersion!==1)throw new Error('Perbarui Apps Script stok katalog terlebih dahulu.');return NextResponse.json(data,{headers:{'Cache-Control':'no-store'}});}catch(e){return NextResponse.json({success:false,message:e instanceof Error?e.message:'Stok belum dimuat.'},{status:502});}
}
