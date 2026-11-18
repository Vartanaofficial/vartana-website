import {createHmac,timingSafeEqual} from 'node:crypto';
import {fetchGoogle} from './google-fetch';
import {serializeSignedPayload} from './rpc-payload';

// Temporary development migration bridge for explicitly allowlisted HMAC-authenticated writes. Production callers always retain the new nonce-protected RPC.
export function validLegacySignedWriteProof(payload:Record<string,unknown>){
 const action=String(payload.action||''),scope=action==='saveRetailOrderV3'?'saveOrder':action;
 if(!['saveRetailOrderV3','saveInventory','saveRawMaterials','saveProductCosting'].includes(action)||(action==='saveRetailOrderV3'&&payload.retailStockVersion!==1)||payload.authEncoding!=='json-ascii-v1')return false;
 const key=process.env.ADMIN_SESSION_SECRET,time=String(payload.authTime||''),provided=String(payload.authSignature||'');
 if(!key||key.length<32||!/^\d{13}$/.test(time)||Math.abs(Date.now()-Number(time))>300000||!/^[a-f0-9]{64}$/i.test(provided))return false;
 const proof:Record<string,unknown>={};for(const name of Object.keys(payload))if(!['action','authTime','authSignature','authEncoding','puzzlePayload','rpcAuth'].includes(name))proof[name]=payload[name];
 if(JSON.stringify(proof)!==JSON.stringify(payload.puzzlePayload))return false;
 const expected=createHmac('sha256',key).update('VARTANA-PUZZLE\n'+scope+'\n'+time+'\n'+serializeSignedPayload(proof)).digest();
 return timingSafeEqual(expected,Buffer.from(provided,'hex'));
}
export async function retryLegacyOrder(url:URL,payload:Record<string,unknown>){
 if(process.env.NODE_ENV!=='development'||!validLegacySignedWriteProof(payload))return null;
 const capability=new URL(url);capability.search='';capability.searchParams.set('action','getSecurityCapabilities');
 const response=await fetchGoogle(capability,{method:'GET',signal:AbortSignal.timeout(15000)});
 if(!response.ok){await response.body?.cancel();return null;}
 const result=await response.json();
 // Only the known legacy "unknown GET action" response enables this bridge.
 if(result.found!==false||result.securityVersion!==undefined||result.error)return null;
 const clean={...payload};delete clean.rpcAuth;
 return fetchGoogle(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8','Accept-Encoding':'identity'},body:serializeSignedPayload(clean),signal:AbortSignal.timeout(30000)});
}

export function validLegacyOrderProof(payload:Record<string,unknown>){return payload.action==='saveRetailOrderV3'&&validLegacySignedWriteProof(payload);}
