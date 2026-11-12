import {NextResponse} from 'next/server';
import {requestMasterScript} from '@/lib/master-products';
export async function POST(req:Request){
 try{const body=await req.json();if(body.action!=='saveMember')return NextResponse.json({success:false,error:'Gunakan halaman checkout untuk membuat pesanan.'},{status:400});const result=await requestMasterScript('saveMember',body);if(result.success!==true&&result.status!=='success')throw new Error('Data pelanggan belum tersimpan.');return NextResponse.json({success:true});}
 catch(e){return NextResponse.json({success:false,error:e instanceof Error?e.message:'Data pelanggan belum tersimpan.'},{status:502});}
}
