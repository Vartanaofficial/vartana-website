import {createHmac} from 'node:crypto';
import {requestMasterScript} from './master-products';

export type RateBucket = {key: string; limit: number; windowMs: number};
const developmentBuckets = new Map<string, {count: number; until: number}>();

export function rateBucket(scope: string, identity: string, limit: number, windowMs: number): RateBucket {
  const secret = process.env.ADMIN_RPC_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Konfigurasi keamanan server belum lengkap.');
  return {key: createHmac('sha256', secret).update(scope + '\n' + identity).digest('hex'), limit, windowMs};
}

export function requestClient(request: Request) {
  return request.headers.get('x-nf-client-connection-ip') || 'local-or-unknown';
}

export async function checkRateLimit(buckets: RateBucket[]): Promise<{allowed: boolean; retryAfter: number}> {
  // Local development must not write rate-limit data to the production workbook.
  if (process.env.NODE_ENV === 'development') {
    const now = Date.now();
    for (const [key, entry] of developmentBuckets) if (entry.until <= now) developmentBuckets.delete(key);
    const retryAfter = buckets.reduce((retry, bucket) => {
      const entry = developmentBuckets.get(bucket.key);
      return entry && entry.count >= bucket.limit ? Math.max(retry, Math.ceil((entry.until - now) / 1000)) : retry;
    }, 0);
    if (retryAfter) return {allowed: false, retryAfter};
    if (developmentBuckets.size > 5000) return {allowed: false, retryAfter: 60};
    for (const bucket of buckets) {
      const entry = developmentBuckets.get(bucket.key) || {count: 0, until: now + bucket.windowMs};
      entry.count++;
      developmentBuckets.set(bucket.key, entry);
    }
    return {allowed: true, retryAfter: 0};
  }
  const result = await requestMasterScript('securityRateLimit', {buckets});
  if (result.success !== true || typeof result.allowed !== 'boolean') throw new Error('Pemeriksaan keamanan belum tersedia.');
  return {allowed: result.allowed, retryAfter: Number(result.retryAfter) || 1};
}

export async function requestBodyWithinLimit(request: Request, maxBytes = 300000) {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) return false;
  const reader = request.clone().body?.getReader();
  if (!reader) return true;
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return true;
      size += chunk.value.byteLength;
      if (size > maxBytes) { void reader.cancel(); return false; }
    }
  } finally { reader.releaseLock(); }
}
