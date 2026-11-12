import {createHash,createHmac,randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {requestMasterScript} from './master-products';
import {signPuzzle} from './puzzle-server';
export type CustomerProfile={email:string;name:string;phone:string;address:string;provinceId:string;provinceName:string;cityId:string;cityName:string;districtId:string;districtName:string;postalCode:string};
export type CustomerAccount={accountId:string;email:string;expiresAt:string;profile:CustomerProfile};
export const CUSTOMER_COOKIE='vartana_customer_session',CUSTOMER_FLOW_COOKIE='vartana_customer_flow';
export function normalizeCustomerEmail(value:unknown){if(typeof value!=='string')throw Error('Masukkan alamat email yang valid.');const email=value.trim().toLowerCase();if(email.length>254||!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email))throw Error('Masukkan alamat email yang valid.');return email;}
export function validateCustomerPassword(value:unknown):asserts value is string{if(typeof value!=='string'||value.length<12||value.length>128||Buffer.byteLength(value)>512)throw Error('Gunakan password 12–128 karakter. Kalimat yang mudah kamu ingat juga boleh.');}
function derive(password:string,salt:string){return new Promise<Buffer>((resolve,reject)=>scrypt(password,salt,64,{N:65536,r:8,p:2,maxmem:128*1024*1024},(e,key)=>e?reject(e):resolve(key)));}
export async function hashCustomerPassword(password:string){validateCustomerPassword(password);const salt=randomBytes(16).toString('hex'),hash=await derive(password,salt);return 'scrypt-v1$'+salt+'$'+hash.toString('hex');}
export async function verifyCustomerPassword(password:string,record:string){const matched=/^scrypt-v1\$([a-f0-9]{32})\$([a-f0-9]{128})$/.exec(record),salt=matched?.[1]||'0'.repeat(32),expected=Buffer.from(matched?.[2]||'0'.repeat(128),'hex'),actual=await derive(password,salt);return timingSafeEqual(actual,expected)&&!!matched;}
export function customerToken(){return randomBytes(32).toString('base64url');}
export function customerTokenHash(value:string){return createHash('sha256').update('VARTANA-CUSTOMER:'+value).digest('hex');}
export function readCustomerCookie(req:Request,name=CUSTOMER_COOKIE){const raw=(req.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';return /^[A-Za-z0-9_-]{43}$/.test(raw)?raw:'';}
export function customerClientHash(req:Request){const key=process.env.ADMIN_SESSION_SECRET;if(!key||key.length<32)throw Error('Akun customer belum dikonfigurasi.');return createHmac('sha256',key).update('CUSTOMER-CLIENT:'+(req.headers.get('x-nf-client-connection-ip')||'local-or-unknown')).digest('hex');}
let checkedUntil=0,check:Promise<void>|null=null;
export async function customerAccountRequest(operation:string,payload:Record<string,unknown>={}){
 if(Date.now()>=checkedUntil){if(!check)check=(async()=>{const d=await requestMasterScript('getCustomerAccountCapabilities',undefined,{legacyGet:true});if(d.customerAccountVersion!==1)throw Error('Akun customer sedang disiapkan. Belanja tetap bisa dilanjutkan tanpa login.');checkedUntil=Date.now()+300000;})().finally(()=>{check=null;});await check;}
 return requestMasterScript('customerAccount',signPuzzle('customerAccount',{operation,...payload}));
}
