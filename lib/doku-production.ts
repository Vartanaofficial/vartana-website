import {createHash,timingSafeEqual} from 'node:crypto';
import {requestMasterScript} from './master-products';
import {createDokuPayment,dokuHeaders,validateDokuCredentials} from './doku-checkout';
export const DOKU_NOTIFICATION_PATH='/api/payments/doku/notification';
export function productionDokuCredentials(){return validateDokuCredentials({clientId:process.env.DOKU_CLIENT_ID||'',secretKey:process.env.DOKU_SECRET_KEY||''});}
export async function ensureDokuBackend(){productionDokuCredentials();const data=await requestMasterScript('dokuPayments',{operation:'capabilities'});if(data.dokuVersion!==1)throw new Error('Backend pembayaran DOKU belum siap. Perbarui Apps Script sebelum aktivasi.');}
export async function productionDokuPayment(orderKey:string,orderSerial:string,amount:number){
 const credentials=productionDokuCredentials(),invoice='VRTD'+createHash('sha256').update(orderKey).digest('hex').slice(0,26).toUpperCase();
 const claim=await requestMasterScript('dokuPayments',{operation:'reserve',orderKey,orderSerial,invoice,amount});
 if(claim.paymentUrl)return {paymentUrl:String(claim.paymentUrl),invoice};
 if(!claim.claimed)throw new Error('Tagihan sedang diproses atau hasilnya belum pasti. Hubungi VARTANA dengan nomor pesanan; jangan membuat pembayaran baru.');
 const result=await createDokuPayment(credentials,invoice,amount,String(claim.requestId),fetch,{notificationUrl:'https://www.vartana.id'+DOKU_NOTIFICATION_PATH,callbackUrl:'https://www.vartana.id/?track=1'});
 await requestMasterScript('dokuPayments',{operation:'link',invoice,paymentUrl:result.paymentUrl});
 return {paymentUrl:result.paymentUrl,invoice};
}
export function verifyDokuNotification(headers:Headers,raw:string,now=Date.now()){
 const credentials=productionDokuCredentials(),id=headers.get('request-id')||'',time=headers.get('request-timestamp')||'',signature=headers.get('signature')||'',client=headers.get('client-id')||'',timestamp=Date.parse(time);
 if(client!==credentials.clientId||!/^[A-Za-z0-9_-]{1,128}$/.test(id)||!Number.isFinite(timestamp)||timestamp>now+300000||timestamp<now-86400000||!/^HMACSHA256=[A-Za-z0-9+/]{43}=$/.test(signature))throw new Error('Notifikasi tidak valid.');
 const expected=dokuHeaders(credentials,DOKU_NOTIFICATION_PATH,raw,id,time).Signature;
 if(!timingSafeEqual(Buffer.from(signature),Buffer.from(expected)))throw new Error('Notifikasi tidak valid.');
 const data=JSON.parse(raw),invoice=data.order?.invoice_number,amount=Number(data.order?.amount),status=data.transaction?.status;
 if(typeof invoice!=='string'||!/^VRTD[A-F0-9]{26}$/.test(invoice)||!Number.isSafeInteger(amount)||amount<1000||!['SUCCESS','PENDING','FAILED','EXPIRED','TIMEOUT','REDIRECT','REFUNDED'].includes(status))throw new Error('Rincian notifikasi tidak valid.');
 return {invoice,amount,status,eventId:id,eventHash:createHash('sha256').update(raw).digest('hex')};
}
