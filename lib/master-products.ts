import type { MasterProduct } from "./store-catalog";
import {fetchGoogle} from './google-fetch';
import {createHmac} from 'node:crypto';
import {RPC_AUTH_ENCODING,serializeSignedPayload} from './rpc-payload';

export function masterScriptUrl() {
  const raw = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!raw) throw new Error("Konfigurasi Apps Script belum tersedia.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== "script.google.com") throw new Error("URL Apps Script tidak valid.");
  return url;
}

export async function requestMasterScript(action: string, payload?: Record<string, unknown>,options:{legacyGet?:boolean}={}) {
  if(['saveInventory','saveRawMaterials','saveProductCosting'].includes(action)&&!payload?.authSignature){
    const key=process.env.ADMIN_SESSION_SECRET;if(!key||key.length<32)throw new Error('Otorisasi persediaan belum dikonfigurasi.');const puzzlePayload=payload||{},authTime=String(Date.now()),authSignature=createHmac('sha256',key).update('VARTANA-PUZZLE\n'+action+'\n'+authTime+'\n'+serializeSignedPayload(puzzlePayload)).digest('hex');payload={...puzzlePayload,puzzlePayload,authTime,authSignature,authEncoding:RPC_AUTH_ENCODING};
  }
  const url = masterScriptUrl();
  // Master reads use the explicit read RPC dispatcher. Capability discovery
  // stays a safe legacy GET before invoking a newly deployed feature.
  const post=!!payload||(!options.legacyGet&&action!=='getGameCapabilities');
  if (!post) url.searchParams.set("action", action);
  const response = await fetchGoogle(url, {
    method: post ? "POST" : "GET", signal: AbortSignal.timeout(30000),
    // Request an uncompressed response; the transport also handles compression.
    headers:{"Accept-Encoding":"identity",...(post?{"Content-Type":"text/plain;charset=utf-8"}:{})},
    ...(post ? { body: serializeSignedPayload({ ...payload, action }) } : {}),
  });
  if (!response.ok) {await response.body?.cancel();throw new Error(`Apps Script HTTP ${response.status}`);}
  const data = await response.json();
  if (data.success === false || data.status === "error" || data.error) throw new Error(data.message || "Apps Script menolak permintaan.");
  return data;
}

export async function readMasterProducts(): Promise<MasterProduct[]> {
  const data = await requestMasterScript("getProducts");
  if (!Array.isArray(data.products)) throw new Error("Respons master produk tidak valid.");
  return data.products;
}
