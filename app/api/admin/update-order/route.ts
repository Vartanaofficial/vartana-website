import {NextRequest,NextResponse,after} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {sameOriginRequest} from '@/lib/request-origin';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';

export const maxDuration=60;
let capabilitiesUntil=0;
let checking:Promise<void>|null=null;
async function verifyBackend(){
 if(Date.now()<capabilitiesUntil)return;
 if(!checking)checking=(async()=>{const data=await requestMasterScript('getOrderEmailCapabilities',undefined,{legacyGet:true});if(data.orderEmailVersion!==1)throw new Error('Perbarui Apps Script notifikasi pesanan sebelum menyimpan status.');capabilitiesUntil=Date.now()+300000;})().finally(()=>{checking=null;});
 await checking;
}
export async function POST(req:NextRequest){
 const secret=process.env.ADMIN_SESSION_SECRET,token=req.cookies.get('vartana_admin_session')?.value;
 if(!secret||!token||!verifyAdminSessionToken(token,secret))return NextResponse.json({success:false,message:'Silakan login admin.'},{status:401});
 try{
  if(!sameOriginRequest(req))throw new Error('Buka pembaruan pesanan dari dashboard VARTANA.');
  const body=await req.json(),payload={orderSerial:String(body.orderSerial||'').trim(),status:String(body.status||''),resiJNT:String(body.resiJNT||'').trim()};
  if(!payload.orderSerial||!['MENUNGGU PEMBAYARAN','PEMBAYARAN DITERIMA','PESANAN DISIAPKAN','DIKIRIM','SELESAI'].includes(payload.status))throw new Error('Nomor pesanan atau status tidak valid.');
  if(payload.status==='DIKIRIM'&&(!payload.resiJNT||payload.resiJNT==='-'))throw new Error('Isi nomor resi J&T sebelum memilih DIKIRIM.');
  await verifyBackend();
  const result=await requestMasterScript('updateOrderWithEmail',signPuzzle('updateOrderWithEmail',payload));
  if(!result.success)throw new Error(result.message||'Pesanan belum tersimpan.');
  const eventId=result.email?.eventId;
  if(eventId&&result.email.status==='PENDING')after(async()=>{try{await requestMasterScript('sendOrderCustomerEmail',signPuzzle('sendOrderCustomerEmail',{eventId}));}catch{console.warn('Order customer email pending; inspect OrderEmailNotifications.');}});
  const emailStatus=result.email?.status,message='Status dan resi tersimpan.'+(emailStatus==='PENDING'?' Email customer sedang dikirim.':emailStatus==='SENT'?' Email tahap ini sudah terkirim.':emailStatus==='SKIPPED'?' Email customer belum tersedia atau tidak valid.':emailStatus?' Status email: '+emailStatus+'.':'');
  return NextResponse.json({success:true,message,data:result},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return NextResponse.json({success:false,message:e instanceof Error?e.message:'Pesanan belum tersimpan.'},{status:400});}
}
