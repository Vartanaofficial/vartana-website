import {NextResponse,after} from 'next/server';
import {verifyDokuNotification} from '@/lib/doku-production';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
export async function POST(request:Request){
 let notification;
 try{const raw=await request.text();if(Buffer.byteLength(raw)>100000)return NextResponse.json({message:'Payload too large'},{status:413,headers});notification=verifyDokuNotification(request.headers,raw);}
 catch{return NextResponse.json({message:'Invalid notification'},{status:401,headers});}
 try{
  const result=await requestMasterScript('dokuPayments',{operation:'notification',...notification});
  if(!result.success)throw new Error('Notification not applied');
  if(result.email?.eventId&&result.email.status==='PENDING'){const eventId=result.email.eventId;after(async()=>{try{await requestMasterScript('sendOrderCustomerEmail',signPuzzle('sendOrderCustomerEmail',{eventId}));}catch{console.warn('DOKU customer email pending; inspect OrderEmailNotifications.');}});}
  return NextResponse.json({success:true},{headers});
 }catch{return NextResponse.json({message:'Notification pending, retry required'},{status:503,headers});}
}
