export type AdminNotice={id:number;phase:'pending'|'success'|'error'|'warning';title:string;message:string};
export const ADMIN_NOTICE_EVENT='vartana-admin-notice';
let nextId=0;
function notify(notice:AdminNotice){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(ADMIN_NOTICE_EVENT,{detail:notice}));}
function title(path:string){return path.includes('promos')||path.includes('/promo')?'Promo':path.includes('inventory')?'Persediaan':path.includes('games')?'Pengaturan game':path.includes('articles')?'Artikel':path.includes('products')?'Produk':path.includes('update-order')?'Pesanan':'Perubahan';}
export async function adminFetch(input:RequestInfo|URL,init?:RequestInit):Promise<Response>{
 const method=(init?.method||(typeof Request!=='undefined'&&input instanceof Request?input.method:'GET')).toUpperCase();
 const raw=typeof input==='string'?input:input instanceof URL?input.href:input.url;
 const path=new URL(raw,typeof location!=='undefined'?location.origin:'http://localhost').pathname;
 if(['GET','HEAD','OPTIONS'].includes(method)||!/^\/api\/(admin|konsinyasi)(\/|$)/.test(path)||path.includes('/auth/'))return globalThis.fetch(input,init);
 const id=++nextId,label=title(path);notify({id,phase:'pending',title:`Menyimpan ${label.toLowerCase()}`,message:'Sedang diproses. Jangan tutup form dulu.'});
 try{
  const timeout=AbortSignal.timeout(45000),response=await globalThis.fetch(input,{...init,signal:init?.signal?AbortSignal.any([init.signal,timeout]):timeout});
  const data=await response.clone().json().catch(()=>({success:false,message:'Respons backend tidak lengkap. Muat ulang daftar untuk memeriksa hasil.'}));
  const failed=!response.ok||data.success===false||data.status==='error'||data.found===false;
  notify({id,phase:failed?'error':data.failed?.length?'warning':'success',title:failed?`${label} belum tersimpan`:data.failed?.length?'Sebagian perubahan perlu diperiksa':`${label} berhasil diperbarui`,message:failed?(data.message||data.error||'Periksa pesan di form dan coba lagi.'):(data.failed?.length?`${data.failed.length} item belum berhasil. Periksa rincian pada halaman.`:data.message||'Perubahan berhasil diproses.')});
  return response;
 }catch(error){notify({id,phase:'error',title:`Respons ${label.toLowerCase()} terputus`,message:'Periksa kembali daftar sebelum mencoba ulang agar perubahan tidak tercatat dua kali.'});throw error;}
}
