import type {CheckoutInput,CheckoutQuote} from './checkout';

export async function requestCheckoutQuote(input:CheckoutInput,signal:AbortSignal,timeoutMs=25000):Promise<CheckoutQuote>{
 const controller=new AbortController();
 const cancel=()=>controller.abort();
 signal.addEventListener('abort',cancel,{once:true});
 if(signal.aborted)controller.abort();
 let timedOut=false;
 const timer=setTimeout(()=>{timedOut=true;controller.abort();},timeoutMs);
 try{
  const response=await fetch('/api/checkout/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:controller.signal});
  const data=await response.json();
  if(!response.ok)throw new Error(data.message||'Ringkasan belum bisa dimuat.');
  return data;
 }catch(error){
  if(timedOut)throw new Error('Koneksi ringkasan terlalu lama. Tekan Coba lagi; isi keranjang dan alamat tetap tersimpan.');
  throw error;
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);}
}
