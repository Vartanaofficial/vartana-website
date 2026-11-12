// Share concurrent browser reads across mounts and pages; failures remain retryable.
const reads=new Map<string,{promise:Promise<unknown>;expires:number;pending:boolean}>();
export function readClientJson<T>(url:string,ttl=15000,force=false):Promise<T>{
 const existing=reads.get(url);
 if(existing&&(existing.pending||(!force&&existing.expires>Date.now())))return existing.promise as Promise<T>;
 const entry={promise:Promise.resolve(null) as Promise<unknown>,expires:0,pending:true};
 entry.promise=fetch(url,{cache:'no-store'}).then(async response=>{const data=await response.json();if(!response.ok||data?.success===false)throw new Error(data?.message||'Data belum bisa dimuat. Coba lagi.');entry.pending=false;entry.expires=Date.now()+ttl;return data;}).catch(error=>{if(reads.get(url)===entry)reads.delete(url);throw error;});
 reads.set(url,entry);return entry.promise as Promise<T>;
}
