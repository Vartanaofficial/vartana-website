import {NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';
import {normalizeWhatsApp} from '@/lib/checkout-contact';
import {sameOriginRequest} from '@/lib/request-origin';
const headers={'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer'};
const cookieName='vartana_order_access';
let verifiedUntil=0,verification:Promise<void>|null=null;
async function verifyBackend(){if(Date.now()<verifiedUntil)return;if(!verification)verification=(async()=>{const d=await requestMasterScript('getCustomerOrdersCapabilities',undefined,{legacyGet:true});if(d.customerOrdersVersion!==2||d.customerAccessVersion!==1)throw new Error('Verifikasi riwayat sedang diperbarui. Coba lagi sebentar.');verifiedUntil=Date.now()+300000;})().finally(()=>{verification=null;});await verification;}
function sessionCookie(req:Request){const raw=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1)||'';return /^[a-f0-9-]{36}$/i.test(raw)?raw:'';}
function publicResult(data:Record<string,unknown>){
 if(data.customerOrdersVersion!==2||data.success!==true)throw new Error(String(data.message||'Riwayat belum dapat dimuat.'));
 if(Array.isArray(data.history)){const history=data.history.map((o:Record<string,unknown>)=>({orderSerial:o.orderSerial,createdAt:o.createdAt,itemsSummary:o.itemsSummary,status:o.status,grandTotal:o.grandTotal,resiJNT:o.resiJNT}));return {success:true,customerOrdersVersion:2,verified:true,found:history.length>0,history,total:data.total,hasMore:!!data.hasMore,message:data.message};}
 return {success:true,customerOrdersVersion:2,challengeId:data.challengeId,maskedEmail:data.maskedEmail,expiresAt:data.expiresAt,retryAt:data.retryAt,deliveryStatus:data.deliveryStatus};
}
export async function POST(req:Request){
 try{
  if(!sameOriginRequest(req))throw new Error('Buka pencarian melalui website VARTANA.');const body=await req.json(),operation=String(body.operation||''),type=body.type==='serial'?'serial':'phone';if(!['requestCode','verifyCode','history'].includes(operation))throw new Error('Verifikasi email diperlukan sebelum melihat riwayat.');
  const raw=typeof body.query==='string'?body.query.trim():'',phone=normalizeWhatsApp(/^8[\d\s()-]+$/.test(raw)?'0'+raw:raw),serial=typeof body.serial==='string'?body.serial.trim().toUpperCase():'';
  if(raw.length>25||!phone)throw new Error('Masukkan nomor WhatsApp Indonesia yang valid.');if(type==='serial'&&!/^[A-Z0-9][A-Z0-9/-]{2,149}$/.test(serial))throw new Error('Masukkan nomor pesanan yang benar.');
  const existing=sessionCookie(req);if(operation!=='requestCode'&&!existing)throw new Error('Sesi kedaluwarsa. Minta kode verifikasi lagi.');const session=existing||randomUUID();await verifyBackend();
  const query=type==='phone'?phone:serial;let data;
  if(operation==='history')data=await requestMasterScript('customerOrderLookup',signPuzzle('customerOrderLookup',{session,type,query}));
  else{if(operation==='verifyCode'&&(!/^HIST-[a-f0-9-]{36}$/i.test(String(body.challengeId||''))||!/^\d{6}$/.test(String(body.code||''))))throw new Error('Masukkan 6 digit kode dari email.');const payload={operation:operation==='requestCode'?'request':'verify',session,phone,type,query,...(operation==='verifyCode'?{challengeId:body.challengeId,code:String(body.code)}:{})};data=await requestMasterScript('customerOrderAccess',signPuzzle('customerOrderAccess',payload));}
  const response=NextResponse.json(publicResult(data),{headers});response.headers.append('Set-Cookie',`${cookieName}=${session}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900${new URL(req.url).protocol==='https:'?'; Secure':''}`);return response;
 }catch(e){return NextResponse.json({found:false,message:e instanceof Error?e.message:'Riwayat belum dapat dimuat.'},{status:400,headers});}
}
export async function GET(req:Request){
 try{const session=sessionCookie(req),serial=(new URL(req.url).searchParams.get('serial')||'').trim().toUpperCase();if(!session||!/^[A-Z0-9][A-Z0-9/-]{2,149}$/.test(serial))return NextResponse.json({found:false,message:'Buka Lacak pesanan lalu verifikasi email untuk melihat riwayat.'},{status:403,headers});await verifyBackend();const data=await requestMasterScript('customerOrderLookup',signPuzzle('customerOrderLookup',{session,type:'serial',query:serial}));return NextResponse.json(publicResult(data),{headers});}catch(e){return NextResponse.json({found:false,message:e instanceof Error?e.message:'Verifikasi email diperlukan.'},{status:403,headers});}
}
