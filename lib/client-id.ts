// getRandomValues is also exposed in local HTTP browsers where randomUUID is
// unavailable. Keep UUID v4 entropy; never substitute predictable Math.random.
export function clientId():string{
 const source=globalThis.crypto;
 if(typeof source?.randomUUID==='function')return source.randomUUID();
 if(typeof source?.getRandomValues!=='function')throw new Error('Browser belum mendukung ID aman. Buka website melalui HTTPS atau perbarui browser.');
 const bytes=source.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
