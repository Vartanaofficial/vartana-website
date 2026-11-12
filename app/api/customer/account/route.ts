import {NextResponse} from 'next/server';
import {sameOriginRequest} from '@/lib/request-origin';
import {CUSTOMER_COOKIE,CUSTOMER_FLOW_COOKIE,customerAccountRequest,customerClientHash,customerToken,customerTokenHash,hashCustomerPassword,normalizeCustomerEmail,readCustomerCookie,validateCustomerPassword,verifyCustomerPassword,type CustomerAccount} from '@/lib/customer-account';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer','Vary':'Cookie'};
function cookie(response:NextResponse,req:Request,name:string,value:string,maxAge?:number){response.cookies.set(name,value,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'lax',path:'/',...(maxAge===undefined?{}:{maxAge})});}
function publicAccount(raw:CustomerAccount){const profile=raw.profile;return {accountId:raw.accountId,email:raw.email,expiresAt:raw.expiresAt,profile:{email:raw.email,name:profile.name,phone:profile.phone,address:profile.address,provinceId:profile.provinceId,provinceName:profile.provinceName,cityId:profile.cityId,cityName:profile.cityName,districtId:profile.districtId,districtName:profile.districtName,postalCode:profile.postalCode}};}
export async function GET(req:Request){
 const token=readCustomerCookie(req);if(!token)return NextResponse.json({success:true,authenticated:false},{headers});
 try{const d=await customerAccountRequest('read',{sessionHash:customerTokenHash(token)});const r=NextResponse.json(d.authenticated?{success:true,authenticated:true,account:publicAccount(d.account)}:{success:true,authenticated:false},{headers});if(!d.authenticated)cookie(r,req,CUSTOMER_COOKIE,'',0);return r;}catch{return NextResponse.json({success:false,message:'Akun belum dapat dimuat. Coba kembali sebentar.'},{status:503,headers});}
}
export async function POST(req:Request){
 let flow='';
 try{
  if(!sameOriginRequest(req))return NextResponse.json({success:false,message:'Buka akun melalui website VARTANA.'},{status:403,headers});
  if(Number(req.headers.get('content-length')||0)>16000)throw Error('Data akun terlalu besar.');
  const d=await req.json();if(!d||typeof d!=='object'||Array.isArray(d)||JSON.stringify(d).length>16000)throw Error('Data akun tidak valid.');const op=String(d.operation||'');flow=readCustomerCookie(req,CUSTOMER_FLOW_COOKIE)||customerToken();const binding={browserHash:customerTokenHash(flow),clientHash:customerClientHash(req)};
  function result(data:Record<string,unknown>,status=200){const r=NextResponse.json(data,{status,headers});cookie(r,req,CUSTOMER_FLOW_COOKIE,flow,1800);return r;}
  if(op==='requestCode'){const email=normalizeCustomerEmail(d.email),r=await customerAccountRequest('requestCode',{email,...binding});return result({success:true,challengeId:r.challengeId,expiresAt:r.expiresAt,retryAt:r.retryAt,deliveryStatus:r.deliveryStatus,message:'Periksa email untuk kode membuat atau mengatur ulang password.'});}
  if(op==='setPassword'){validateCustomerPassword(d.password);if(!/^ACC-[a-f0-9-]{36}$/i.test(String(d.challengeId||''))||!/^\d{6}$/.test(String(d.code||'')))throw Error('Masukkan 6 digit kode dari email.');
   const verified=await customerAccountRequest('verifyCode',{challengeId:d.challengeId,code:d.code,...binding});
   const passwordHash=await hashCustomerPassword(d.password),r=await customerAccountRequest('setPassword',{challengeId:d.challengeId,grant:verified.grant,passwordHash,...binding});const response=result({success:true,message:r.message});cookie(response,req,CUSTOMER_COOKIE,'',0);return response;
  }
  if(op==='login'){
   const email=normalizeCustomerEmail(d.email);if(typeof d.password!=='string'||!d.password||d.password.length>128||Buffer.byteLength(d.password)>512)throw Error('Email atau password belum sesuai. Buat/reset password jika belum pernah masuk.');
   const attempt=await customerAccountRequest('loginBegin',{email,...binding}),passwordValid=await verifyCustomerPassword(d.password,String(attempt.passwordHash||'')),token=customerToken();
   const r=await customerAccountRequest('loginFinish',{attemptId:attempt.attemptId,passwordValid,sessionHash:customerTokenHash(token),remember:d.remember===true,...binding});
   if(!r.authenticated)return result({success:false,message:'Email atau password belum sesuai. Buat/reset password jika belum pernah masuk.'},401);
   const response=result({success:true,authenticated:true,account:publicAccount(r.account)});cookie(response,req,CUSTOMER_COOKIE,token,d.remember===true?2592000:undefined);return response;
  }
  if(op==='logout'){const token=readCustomerCookie(req);if(token)await customerAccountRequest('logout',{sessionHash:customerTokenHash(token)});const r=result({success:true});cookie(r,req,CUSTOMER_COOKIE,'',0);return r;}
  if(op==='saveProfile'){const token=readCustomerCookie(req);if(!token)return result({success:false,message:'Masuk terlebih dahulu untuk menyimpan profil.'},401);const r=await customerAccountRequest('saveProfile',{sessionHash:customerTokenHash(token),profile:d.profile});return result({success:true,profile:r.profile,message:'Data diri dan alamat berhasil disimpan.'});}
  throw Error('Operasi akun tidak dikenal.');
 }catch(e){const r=NextResponse.json({success:false,message:e instanceof Error?e.message:'Permintaan akun belum berhasil. Coba kembali.'},{status:400,headers});if(flow)cookie(r,req,CUSTOMER_FLOW_COOKIE,flow,1800);return r;}
}
