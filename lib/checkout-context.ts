import {requestMasterScript} from './master-products';
export async function checkoutContext(phone:string,orderKey:string){
 try{return await requestMasterScript('getCheckoutContext',{phone,orderKey,includeMaster:true});}
 catch(e){
  // Old deployments reject this read action before any order can be written.
  if(e instanceof Error&&/Order serial dan nomor WhatsApp wajib diisi|Parameter tidak valid/i.test(e.message))return requestMasterScript('getAdminData',undefined,{legacyGet:true});
  throw e;
 }
}
