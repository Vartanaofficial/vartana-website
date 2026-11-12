export function isPaymentRoute(path:string){return ['/checkout','/payment','/pembayaran'].some(prefix=>path===prefix||path.startsWith(prefix+'/'));}
