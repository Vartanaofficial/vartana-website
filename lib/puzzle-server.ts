import { createHmac } from 'node:crypto';
import { requestMasterScript } from './master-products';

export function signPuzzle(action: string, puzzlePayload: unknown) {
  const key = process.env.ADMIN_SESSION_SECRET;
  if (!key || key.length < 32) throw new Error('Konfigurasi hadiah puzzle belum siap.');
  const authTime = String(Date.now());
  const authSignature = createHmac('sha256', key).update('VARTANA-PUZZLE\n' + action + '\n' + authTime + '\n' + JSON.stringify(puzzlePayload)).digest('hex');
  return { puzzlePayload, authTime, authSignature };
}

export async function puzzleRequest(action: string, payload: unknown) {
  const result = await requestMasterScript(action, signPuzzle(action, payload));
  if (result.success !== true) throw new Error('Admin perlu deploy Apps Script puzzle terbaru.');
  return result;
}
