import {verifyAdminSessionToken} from './admin-auth';
import {validateDokuCredentials,type DokuCredentials} from './doku-checkout';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {createDokuPayment,checkDokuPayment,DokuAuthenticationError} from './doku-checkout';
const runtime=globalThis as typeof globalThis&{vartanaLocalDoku?:DokuCredentials};
export function localDokuAdmin(request:Request){
 if(process.env.NODE_ENV!=='development'||!['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname))return false;
 const secret=process.env.ADMIN_SESSION_SECRET,cookie=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('vartana_admin_session='))?.slice('vartana_admin_session='.length);
 return !!(secret&&cookie&&verifyAdminSessionToken(cookie,secret));
}
export function localDokuCredentials(){if(process.env.NODE_ENV!=='development')return null;return runtime.vartanaLocalDoku||(process.env.DOKU_CLIENT_ID&&process.env.DOKU_SECRET_KEY?{clientId:process.env.DOKU_CLIENT_ID,secretKey:process.env.DOKU_SECRET_KEY}:null);}
export function configureLocalDoku(credentials:DokuCredentials){runtime.vartanaLocalDoku=validateDokuCredentials(credentials);}
type Trial={id:string;invoice:string;amount:number;createdAt:number;lastChecked?:number;state:string;paymentUrl?:string};
const file=join(process.cwd(),'.qa-doku-checkout.json');let queue:Promise<unknown>=Promise.resolve();
async function read():Promise<Trial[]>{try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return [];throw new Error('Riwayat pembayaran lokal tidak dapat dibaca.');}}
async function save(rows:Trial[]){await writeFile(file+'.tmp',JSON.stringify(rows),{mode:0o600});await rename(file+'.tmp',file);}
export async function localDokuPayment(id:string,amount:number){
 const credentials=localDokuCredentials();if(!credentials)throw new Error('Siapkan credential DOKU untuk sesi lokal terlebih dahulu.');
 const task=queue.catch(()=>{}).then(async()=>{const rows=await read(),old=rows.find(row=>row.id===id);
 if(old){if(old.amount!==amount)throw new Error('Nominal transaksi berubah.');if(old.paymentUrl)return {paymentUrl:old.paymentUrl,invoice:old.invoice};if(old.state!=='AUTH_REJECTED')throw new Error('Hasil tagihan sebelumnya belum pasti. Periksa invoice '+old.invoice+' di dashboard DOKU; jangan membuat tagihan ulang.');}
 if(!old&&rows.some(row=>Date.now()-row.createdAt<60000))throw new Error('Tunggu satu menit sebelum transaksi uji berikutnya.');
 const row:Trial=old||{id,amount,invoice:'VRTT'+createHash('sha256').update(id).digest('hex').slice(0,26).toUpperCase(),createdAt:Date.now(),state:'REQUESTED'};if(!old)rows.push(row);row.state='REQUESTED';await save(rows);
 try{const result=await createDokuPayment(credentials,row.invoice,amount,id);row.paymentUrl=result.paymentUrl;row.state='CREATED';await save(rows);return {paymentUrl:result.paymentUrl,invoice:row.invoice};}catch(error){if(error instanceof DokuAuthenticationError){row.state='AUTH_REJECTED';await save(rows);throw error;}row.state='UNCERTAIN';await save(rows);throw new Error('Permintaan DOKU belum terkonfirmasi. Periksa invoice '+row.invoice+' pada dashboard DOKU sebelum mengulangi.');}
 });queue=task;return task;
}
export async function localDokuStatus(id:string){
 const credentials=localDokuCredentials();if(!credentials)throw new Error('Credential lokal belum tersedia.');
 const task=queue.catch(()=>{}).then(async()=>{const rows=await read(),row=rows.find(item=>item.id===id);if(!row)throw new Error('Riwayat DOKU pesanan ini tidak ditemukan.');if(Date.now()-Math.max(row.createdAt,row.lastChecked||0)<60000)throw new Error('Tunggu 60 detik sebelum pemeriksaan berikutnya; setelah membayar tunggu setidaknya 60 detik.');row.lastChecked=Date.now();await save(rows);return checkDokuPayment(credentials,row.invoice,row.amount);});queue=task;return task;
}
