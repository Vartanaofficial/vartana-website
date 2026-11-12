import {request} from 'node:https';
import {Readable} from 'node:stream';
import {createGunzip,createInflate,createBrotliDecompress} from 'node:zlib';

// Apps Script is an RPC service, so keep its streaming transport independent
// of Next's page-fetch/HMR caches. TLS verification remains Node's default.
export function fetchGoogle(input:string|URL,init:RequestInit={}):Promise<Response>{
 const signal=init.signal||AbortSignal.timeout(30000),headers=new Headers(init.headers);
 headers.set('Accept-Encoding','identity');
 if(!headers.has('User-Agent'))headers.set('User-Agent','VARTANA-Website/1.0 (+https://www.vartana.id)');
 if(!headers.has('Accept'))headers.set('Accept','*/*');
 if(init.body!==undefined&&init.body!==null&&typeof init.body!=='string')return Promise.reject(new Error('Google RPC body harus berupa JSON text.'));
 const body=typeof init.body==='string'?init.body:undefined;
 function send(url:URL,method:string,payload:string|undefined,hops:number):Promise<Response>{
  if(url.protocol!=='https:'||url.username||url.password||!(['google.com','googleusercontent.com'].some(domain=>url.hostname===domain||url.hostname.endsWith('.'+domain))))return Promise.reject(new Error('Tujuan koneksi Google tidak valid.'));
  return new Promise((resolve,reject)=>{
   let phase='connect';
   const outgoing=new Headers(headers);
   if(payload!==undefined)outgoing.set('Content-Length',String(Buffer.byteLength(payload)));else{outgoing.delete('Content-Length');if(method==='GET')outgoing.delete('Content-Type');}
   // Google redirects span hosts. Keep connections independent across RPCs.
   const req=request(url,{method,headers:Object.fromEntries(outgoing.entries()),signal,family:4,agent:false},res=>{
    phase='body';res.once('end',()=>{phase='complete';});
    const status=res.statusCode||502,location=res.headers.location;
    if([301,302,303,307,308].includes(status)&&location){
     res.resume();if(hops>=5){reject(new Error('Redirect layanan Google terlalu banyak.'));return;}
     const useGet=status===303||((status===301||status===302)&&method==='POST');
     try{const target=new URL(location,url);if(target.origin!==url.origin){headers.delete('Authorization');headers.delete('Cookie');}send(target,useGet?'GET':method,useGet?undefined:payload,hops+1).then(resolve,reject);}catch(error){reject(error);}return;
    }
    const responseHeaders=new Headers();for(const [key,value] of Object.entries(res.headers)){if(value!==undefined&&!['content-length','content-encoding','transfer-encoding','connection'].includes(key))responseHeaders.set(key,Array.isArray(value)?value.join(', '):value);}
    let stream:Readable=res;
    const encoding=String(res.headers['content-encoding']||'').toLowerCase();
    if(encoding==='gzip')stream=res.pipe(createGunzip());else if(encoding==='deflate')stream=res.pipe(createInflate());else if(encoding==='br')stream=res.pipe(createBrotliDecompress());
    if(stream!==res)res.on('error',error=>stream.destroy(error));
    const webStream=Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
    resolve(new Response([204,205,304].includes(status)?null:webStream,{status,headers:responseHeaders}));
   });
   req.once('socket',socket=>{socket.once('lookup',()=>{phase='tcp';});socket.once('connect',()=>{phase='tls';});socket.once('secureConnect',()=>{phase='headers';});});
   req.on('error',error=>{if(signal.aborted)console.warn('Google RPC timeout',url.hostname,phase);reject(error);});if(payload!==undefined)req.write(payload);req.end();
  });
 }
 return send(new URL(input.toString()),(init.method||'GET').toUpperCase(),body,0);
}
