// A phone on the local network may reach the dev server by its LAN Host while
// Next constructs an internal localhost URL. Keep the real Host in the check.
export function sameOriginRequest(req:Request){
 const origin=req.headers.get('origin');if(!origin)return false;
 try{const parsed=new URL(origin);if(!['http:','https:'].includes(parsed.protocol))return false;
  const url=new URL(req.url),host=(req.headers.get('x-forwarded-host')||req.headers.get('host')||url.host).split(',')[0].trim();
  if(!/^[a-z0-9.:[\]-]+$/i.test(host))return false;
  const proto=(req.headers.get('x-forwarded-proto')||url.protocol.replace(':','')).split(',')[0].trim();
  return ['http','https'].includes(proto)&&parsed.origin===new URL(`${proto}://${host}`).origin;
 }catch{return false;}
}
