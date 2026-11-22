import {createHash,createHmac,randomUUID} from 'node:crypto';
export type DokuCredentials={clientId:string;secretKey:string};
export function validateDokuCredentials(input:DokuCredentials){
 if(!input||typeof input.clientId!=='string'||!/^[A-Za-z0-9-]{3,100}$/.test(input.clientId)||typeof input.secretKey!=='string'||!input.secretKey.trim()||input.secretKey.length>2000||/[\r\n\0]/.test(input.secretKey))throw new Error('Isi Client ID dan Active Secret Key DOKU yang valid.');
 return input;
}
export function dokuHeaders(credentials:DokuCredentials,target:string,body?:string,requestId:string=randomUUID(),timestamp=new Date().toISOString().replace(/\.\d{3}Z$/,'Z')){
 validateDokuCredentials(credentials);
 const parts=['Client-Id:'+credentials.clientId,'Request-Id:'+requestId,'Request-Timestamp:'+timestamp,'Request-Target:'+target];
 if(body!==undefined)parts.push('Digest:'+createHash('sha256').update(body).digest('base64'));
 return {'Client-Id':credentials.clientId,'Request-Id':requestId,'Request-Timestamp':timestamp,Signature:'HMACSHA256='+createHmac('sha256',credentials.secretKey).update(parts.join('\n')).digest('base64'),'Content-Type':'application/json',Accept:'application/json'};
}
export function dokuPaymentUrl(input:unknown){
 if(typeof input!=='string')throw new Error('DOKU belum mengembalikan halaman pembayaran.');
 const url=new URL(input);
 if(url.protocol!=='https:'||url.username||url.password||!(url.hostname==='doku.com'||url.hostname.endsWith('.doku.com')))throw new Error('Alamat pembayaran DOKU tidak valid.');
 return url.toString();
}
export class DokuAuthenticationError extends Error {}

export async function createDokuPayment(credentials:DokuCredentials,invoice:string,amount:number,requestId:string,send:typeof fetch=fetch,options:{notificationUrl?:string;callbackUrl?:string}={}){
 if(!/^VRT[TD][A-F0-9]{26}$/.test(invoice)||!Number.isSafeInteger(amount)||amount<1000||amount>999999999999||!/^[a-f0-9-]{36}$/i.test(requestId))throw new Error('Nominal atau identitas transaksi uji tidak valid.');
 const target='/checkout/v1/payment',body=JSON.stringify({order:{amount,invoice_number:invoice,currency:'IDR',...(options.callbackUrl?{callback_url:options.callbackUrl}:{})},payment:{payment_due_date:30},...(options.notificationUrl?{additional_info:{override_notification_url:options.notificationUrl}}:{})});
 const response=await send('https://api.doku.com'+target,{method:'POST',headers:dokuHeaders(credentials,target,body,requestId),body,signal:AbortSignal.timeout(20000),redirect:'error',cache:'no-store'});
 if(response.status===401||response.status===403){
   await response.body?.cancel();
   throw new DokuAuthenticationError('DOKU menolak akses (HTTP '+response.status+'). Periksa Client ID dan Active Secret Key pada pengaturan sesi yang sedang digunakan.');
 }
 if(!response.ok){await response.body?.cancel();throw new Error('DOKU production menolak permintaan (HTTP '+response.status+'). Periksa credential dan aktivasi DOKU Checkout.');}
 const data=await response.json(),result=data.response;
 if(result?.order?.invoice_number!==invoice||Number(result?.order?.amount)!==amount)throw new Error('Identitas atau nominal respons DOKU tidak cocok. Periksa dashboard sebelum mencoba lagi.');
 return {invoice,amount,paymentUrl:dokuPaymentUrl(result?.payment?.url)};
}
export async function checkDokuPayment(credentials:DokuCredentials,invoice:string,amount:number,send:typeof fetch=fetch){
 if(!/^VRT[TD][A-F0-9]{26}$/.test(invoice))throw new Error('Identitas transaksi uji tidak valid.');
 const target='/orders/v1/status/'+invoice,response=await send('https://api.doku.com'+target,{method:'GET',headers:dokuHeaders(credentials,target),signal:AbortSignal.timeout(15000),redirect:'error',cache:'no-store'});
 if(!response.ok){await response.body?.cancel();throw new Error('Status DOKU belum tersedia (HTTP '+response.status+'). Coba lagi setelah 60 detik atau periksa dashboard DOKU.');}
 const data=await response.json();
 if(data.order?.invoice_number!==invoice||Number(data.order?.amount)!==amount)throw new Error('Identitas atau nominal status DOKU tidak cocok.');
 const status=String(data.transaction?.status||'UNKNOWN');
 return {invoice,amount,status,paid:status==='SUCCESS'};
}
