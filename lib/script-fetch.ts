import {createHmac, randomUUID} from 'node:crypto';
import {fetchGoogle} from './google-fetch';
import {serializeSignedPayload} from './rpc-payload';

export function signScriptRequest(payload: Record<string, unknown>) {
  const secret = process.env.ADMIN_RPC_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Konfigurasi keamanan backend belum lengkap.');
  const clean = {...payload};
  delete clean.rpcAuth;
  const timestamp = String(Date.now());
  const nonce = randomUUID();
  const message = ['VARTANA-RPC-V1', timestamp, nonce, serializeSignedPayload(clean)].join('\n');
  const signature = createHmac('sha256', secret).update(message).digest('hex');
  return {...clean, rpcAuth: {version: 1, timestamp, nonce, signature}};
}

// Every Google data request uses the same authenticated, single-use transport.
export function fetchScript(input: string | URL, init: RequestInit = {}) {
  const url = new URL(input.toString());
  if (url.protocol !== 'https:' || url.hostname !== 'script.google.com' || url.username || url.password) {
    throw new Error('URL Apps Script tidak valid.');
  }
  const publicCapabilities = new Set(['getSecurityCapabilities', 'getGameCapabilities', 'getCustomerAccountCapabilities',
    'getRetailStockCapabilities', 'getCustomerOrdersCapabilities', 'getOrderEmailCapabilities', 'getInventoryCapabilities']);
  if (!init.body && publicCapabilities.has(url.searchParams.get('action') || '')) {
    return fetchGoogle(url, {...init, headers:{'Accept-Encoding':'identity'}, signal:init.signal || AbortSignal.timeout(30000)});
  }
  const payload = init.body ? JSON.parse(String(init.body)) : {action: url.searchParams.get('action')};
  if (!payload || Array.isArray(payload) || typeof payload.action !== 'string') throw new Error('Permintaan backend tidak valid.');
  url.search = '';
  return fetchGoogle(url, {
    ...init,
    method: 'POST',
    headers: {'Content-Type': 'text/plain;charset=utf-8', 'Accept-Encoding': 'identity'},
    body: serializeSignedPayload(signScriptRequest(payload)),
    signal: init.signal || AbortSignal.timeout(30000),
  });
}
