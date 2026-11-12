import {readMasterProducts,requestMasterScript} from './master-products';

async function read(){
 const [master,promoData]=await Promise.all([readMasterProducts(),requestMasterScript('getPromotions')]);
 return {master,promoData};
}
let cached:{source:string;expires:number;promise:ReturnType<typeof read>}|undefined;

// Only quote previews reuse public master data briefly. Order submission always
// reads current prices and promotions; personal vouchers are never cached here.
export function readCheckoutMaster(fresh=true){
 if(fresh)return read();
 const source=process.env.GOOGLE_SCRIPT_URL||process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL||'';
 if(cached&&cached.source===source&&cached.expires>Date.now())return cached.promise;
 const entry={source,expires:Infinity,promise:read()};
 cached=entry;
 entry.promise.then(()=>{entry.expires=Date.now()+15000;},()=>{if(cached===entry)cached=undefined;});
 return entry.promise;
}
