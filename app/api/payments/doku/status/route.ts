import {NextResponse} from 'next/server';
import {checkoutContext} from '@/lib/checkout-context';
import {normalizeWhatsApp} from '@/lib/checkout-contact';
import {requestMasterScript} from '@/lib/master-products';
const headers={'Cache-Control':'no-store, private'};
export async function POST(request:Request){
 try{const data=await request.json(),phone=normalizeWhatsApp(data.phone||''),orderKey=String(data.orderKey||'');if(!phone||!/^[a-f0-9-]{36}$/i.test(orderKey))throw new Error('Pesanan tidak valid.');
 const context=await checkoutContext(phone,orderKey),order=(context.orders||[]).find((item:{orderKey?:string;phone?:string;paymentMethod?:string})=>item.orderKey===orderKey&&normalizeWhatsApp(item.phone||'')===phone&&item.paymentMethod==='doku');
 if(!order)throw new Error('Pesanan tidak ditemukan.');
 const result=await requestMasterScript('dokuPayments',{operation:'status',orderKey});return NextResponse.json({success:true,paid:result.paid===true,review:result.review===true,status:result.state},{headers});
 }catch{return NextResponse.json({success:false,message:'Status pembayaran belum dapat dimuat. Periksa nomor pesanan atau hubungi VARTANA.'},{status:400,headers});}
}
