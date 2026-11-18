import {integrationProviders} from './integrations';

const knownKeys = new Set<string>(integrationProviders.flatMap(provider=>[...provider.variables]));
export function allowedCredentialKey(key:unknown):key is string {
 return typeof key==='string'&&(knownKeys.has(key)||/^VARTANA_EXT_[A-Z][A-Z0-9_]{1,80}$/.test(key));
}
export function validateCredentialInput(input:unknown):{key:string;value:string} {
  const data=input as {key?:unknown;value?:unknown};
  if(!data||!allowedCredentialKey(data.key)||
     typeof data.value!=='string'||!data.value.trim()||data.value.length>5000||/[\r\n\0]/.test(data.value))throw new Error('Pilih nama API yang diizinkan dan isi nilainya.');
  return {key:data.key,value:data.value.trim()};
}

export function netlifyCredentialConnection() {
  return {configured:!!(process.env.NETLIFY_INTEGRATION_TOKEN&&process.env.NETLIFY_INTEGRATION_ACCOUNT_ID&&process.env.NETLIFY_INTEGRATION_SITE_ID)};
}

// Write-only gateway. Neither provider secrets nor the Netlify token are returned.
// PATCH changes only the production value, preserving other contexts and scopes.
export async function saveNetlifyCredential(input:unknown,send:typeof fetch=fetch) {
  const {key,value}=validateCredentialInput(input);
  if(!netlifyCredentialConnection().configured)throw new Error('Koneksi Netlify belum disiapkan. Atur token, Account ID, dan Site ID sekali pada environment server.');
  const account=encodeURIComponent(process.env.NETLIFY_INTEGRATION_ACCOUNT_ID!),site=encodeURIComponent(process.env.NETLIFY_INTEGRATION_SITE_ID!);
  const base=`https://api.netlify.com/api/v1/accounts/${account}/env`;
  const headers={Authorization:`Bearer ${process.env.NETLIFY_INTEGRATION_TOKEN}`,'Content-Type':'application/json'};
  const options={headers,signal:AbortSignal.timeout(15000),cache:'no-store' as const};
  const existing=await send(`${base}/${encodeURIComponent(key)}?site_id=${site}`,{...options,method:'GET'});
  await existing.body?.cancel();
  if(!existing.ok&&existing.status!==404)throw new Error('Netlify belum dapat memeriksa API. Periksa izin token dan tujuan project.');
  const response=existing.ok
    ?await send(`${base}/${encodeURIComponent(key)}?site_id=${site}`,{...options,method:'PATCH',body:JSON.stringify({context:'production',value})})
    :await send(`${base}?site_id=${site}`,{...options,method:'POST',body:JSON.stringify([{key,is_secret:true,scopes:['builds','functions','runtime'],values:[{context:'production',value}]}])});
  await response.body?.cancel();
  if(!response.ok)throw new Error('API belum tersimpan di Netlify. Periksa izin token atau konfigurasi project, lalu coba lagi.');
  return {key,saved:true,requiresDeploy:true,message:'API tersimpan di environment production Netlify. Nilai dirahasiakan. Terapkan rilis server agar perubahan digunakan; belum ada deployment otomatis.'};
}

function connection(){
 if(!netlifyCredentialConnection().configured)throw new Error('Koneksi Netlify belum disiapkan.');
 const account=encodeURIComponent(process.env.NETLIFY_INTEGRATION_ACCOUNT_ID!),site=encodeURIComponent(process.env.NETLIFY_INTEGRATION_SITE_ID!);
 return {base:'https://api.netlify.com/api/v1/accounts/'+account+'/env',site,options:{headers:{Authorization:'Bearer '+process.env.NETLIFY_INTEGRATION_TOKEN},signal:AbortSignal.timeout(15000),cache:'no-store' as const}};
}
export async function listNetlifyCredentials(send:typeof fetch=fetch){
 if(!netlifyCredentialConnection().configured)return [];
 const {base,site,options}=connection(),response=await send(base+'?site_id='+site,options);
 if(!response.ok){await response.body?.cancel();throw new Error('Daftar API Netlify belum dapat dimuat. Periksa koneksi dan izin akun.');}
 const data=await response.json();
 if(!Array.isArray(data))throw new Error('Respons daftar API tidak valid.');
 return data.filter(item=>allowedCredentialKey(item.key)&&(item.values||[]).some((value:{context:string})=>value.context==='production')).map(item=>({key:String(item.key),updatedAt:String(item.updated_at||''),secret:!!item.is_secret})).sort((a,b)=>a.key.localeCompare(b.key));
}
// Delete only the explicit production value; other environments stay intact.
export async function deleteNetlifyCredential(input:unknown,send:typeof fetch=fetch){
 const data=input as {key?:unknown;confirmKey?:unknown;expectedUpdatedAt?:unknown};
 if(!data||!allowedCredentialKey(data.key)||data.confirmKey!==data.key||typeof data.expectedUpdatedAt!=='string')throw new Error('Konfirmasi nama API sebelum menghapus.');
 const {base,site,options}=connection(),url=base+'/'+encodeURIComponent(data.key)+'?site_id='+site,response=await send(url,options);
 if(!response.ok){await response.body?.cancel();throw new Error('API tidak ditemukan atau izin Netlify tidak tersedia. Muat ulang daftar.');}
 const current=await response.json();
 if(String(current.updated_at||'')!==data.expectedUpdatedAt)throw new Error('API berubah sejak daftar dimuat. Muat ulang sebelum menghapus.');
 const production=(current.values||[]).filter((value:{context:string;id?:string})=>value.context==='production');
 if(production.length!==1||typeof production[0].id!=='string'||!production[0].id)throw new Error('Nilai production API tidak ditemukan. Muat ulang daftar.');
 const removed=await send(base+'/'+encodeURIComponent(data.key)+'/value/'+encodeURIComponent(production[0].id)+'?site_id='+site,{...options,method:'DELETE'});
 await removed.body?.cancel();if(!removed.ok)throw new Error('API belum dapat dihapus dari Netlify.');
 return {key:data.key,deleted:true,requiresDeploy:true,message:'Nilai API production dihapus dari Netlify. Perubahan digunakan setelah rilis server berikutnya.'};
}
