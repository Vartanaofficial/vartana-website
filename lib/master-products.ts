import type { MasterProduct } from "./store-catalog";

export function masterScriptUrl() {
  const raw = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!raw) throw new Error("Konfigurasi Apps Script belum tersedia.");
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.hostname !== "script.google.com") throw new Error("URL Apps Script tidak valid.");
  return url;
}

export async function requestMasterScript(action: string, payload?: Record<string, unknown>) {
  const url = masterScriptUrl();
  if (!payload) url.searchParams.set("action", action);
  const response = await fetch(url, {
    method: payload ? "POST" : "GET", cache: "no-store", signal: AbortSignal.timeout(30000),
    ...(payload ? { headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ ...payload, action }) } : {}),
  });
  if (!response.ok) throw new Error(`Apps Script HTTP ${response.status}`);
  const data = await response.json();
  if (data.success === false || data.status === "error" || data.error) throw new Error(data.message || "Apps Script menolak permintaan.");
  return data;
}

export async function readMasterProducts(): Promise<MasterProduct[]> {
  const data = await requestMasterScript("getProducts");
  if (!Array.isArray(data.products)) throw new Error("Respons master produk tidak valid.");
  return data.products;
}
