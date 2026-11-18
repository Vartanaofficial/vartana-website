import {NextResponse} from 'next/server';
import {requestMasterScript} from '@/lib/master-products';
import {customerAccountRequest, customerTokenHash, readCustomerCookie} from '@/lib/customer-account';
import {normalizeWhatsApp} from '@/lib/checkout-contact';
import {sameOriginRequest} from '@/lib/request-origin';
export async function POST(req:Request){
 try{
  if(!sameOriginRequest(req))return NextResponse.json({success:false,error:'Asal permintaan tidak valid.'},{status:403});
  const token=readCustomerCookie(req);
  if(!token)return NextResponse.json({success:false,error:'Masuk ke akun untuk mengubah profil member.'},{status:401});
  const body=await req.json();
  if(body.action!=='saveMember')return NextResponse.json({success:false,error:'Gunakan halaman checkout untuk membuat pesanan.'},{status:400});
  const data=await customerAccountRequest('read',{sessionHash:customerTokenHash(token)});
  if(!data.authenticated||!data.account)return NextResponse.json({success:false,error:'Sesi akun berakhir.'},{status:401});
  const account=data.account,profile=account.profile;
  if(String(body.email||'').trim().toLowerCase()!==account.email||!normalizeWhatsApp(profile.phone)||normalizeWhatsApp(body.phone)!==normalizeWhatsApp(profile.phone))return NextResponse.json({success:false,error:'Data member tidak sesuai akun terverifikasi.'},{status:403});
  const result=await requestMasterScript('saveMember',{
   memberId:body.memberId,name:body.name,email:account.email,memberVerifiedEmail:account.email,
   phone:profile.phone,birthDate:body.birthDate,addressDetail:body.addressDetail,
   districtName:body.districtName,cityName:body.cityName,
  });
  if(result.success!==true&&result.status!=='success')throw new Error('Data pelanggan belum tersimpan.');
  return NextResponse.json({success:true},{headers:{'Cache-Control':'no-store, private'}});
 }
 catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:'Data pelanggan belum tersimpan.'},{status:502});}
}
