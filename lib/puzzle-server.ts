import { createHmac } from 'node:crypto';
import { requestMasterScript } from './master-products';
import {RPC_AUTH_ENCODING,serializeSignedPayload} from './rpc-payload';

export function signPuzzle(action: string, puzzlePayload: unknown) {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key || key.length < 32) throw new Error('Konfigurasi hadiah puzzle belum siap.');
  const authTime = String(Date.now());
  const authSignature = createHmac('sha256', key).update('VARTANA-PUZZLE\n' + action + '\n' + authTime + '\n' + serializeSignedPayload(puzzlePayload)).digest('hex');
  return { puzzlePayload, authTime, authSignature,authEncoding:RPC_AUTH_ENCODING };
}

export async function puzzleRequest(action: string, payload: unknown) {
  const result = await requestMasterScript(action, signPuzzle(action, payload));
  if (result.success !== true) throw new Error('Admin perlu deploy Apps Script puzzle terbaru.');
  return result;
}
