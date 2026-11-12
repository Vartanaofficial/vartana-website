import {adminFetch} from './admin-fetch';

export async function adminManagement(payload:Record<string,unknown>){
  // Campaign progress is displayed in its own panel; avoid a toast per recipient.
  const fetcher=payload.operation==='menuSave'?adminFetch:globalThis.fetch;
  const response=await fetcher('/api/admin/manage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(45000)});
  const data=await response.json();
  if(!response.ok||!data.success)throw Error(data.message||'Permintaan belum diproses.');
  return data;
}
