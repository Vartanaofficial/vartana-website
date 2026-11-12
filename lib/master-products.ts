import type { MasterProduct } from "./store-catalog";
import {fetchGoogle} from './google-fetch';

export function masterScriptUrl() {
  const raw = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!raw) throw new Error("Konfigurasi Apps Script belum tersedia.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== "script.google.com") throw new Error("URL Apps Script tidak valid.");
  return url;
}

export async function requestMasterScript(action: string, payload?: Record<string, unknown>,options:{legacyGet?:boolean}={}) {
  const url = masterScriptUrl();
  // Master reads use the explicit read RPC dispatcher. Capability discovery
  // stays a safe legacy GET before invoking a newly deployed feature.
  const post=!!payload||(!options.legacyGet&&action!=='getGameCapabilities');
  if (!post) url.searchParams.set("action", action);
  const response = await fetchGoogle(url, {
    method: post ? "POST" : "GET", signal: AbortSignal.timeout(30000),
    // Request an uncompressed response; the transport also handles compression.
    headers:{"Accept-Encoding":"identity",...(post?{"Content-Type":"text/plain;charset=utf-8"}:{})},
    ...(post ? { body: JSON.stringify({ ...payload, action }) } : {}),
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
