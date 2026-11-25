import {createHash, timingSafeEqual} from 'node:crypto';
import {after} from 'next/server';
import {requestMasterScript} from './master-products';

export type MidtransEnvironment = 'sandbox' | 'production';
const invoicePattern = /^VRTM[A-F0-9]{26}$/;

function credentials(environment?: MidtransEnvironment) {
  const key = process.env.MIDTRANS_SERVER_KEY?.trim();
  const sandbox = key?.startsWith('SB-Mid-server-');
  if (!key || (!sandbox && !key.startsWith('Mid-server-')) || (environment && sandbox !== (environment === 'sandbox'))) {
    throw new Error('Server Key Midtrans belum sesuai dengan lingkungan yang dipilih.');
  }
  const domain = sandbox ? 'sandbox.midtrans.com' : 'midtrans.com';
  return {app: 'https://app.' + domain, api: 'https://api.' + domain, headers: {
    Authorization: 'Basic ' + Buffer.from(key + ':').toString('base64'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }};
}

export type MidtransSnapConfig = {clientKey: string; scriptUrl: string};

// Public Snap settings for embedding payment inside the VARTANA checkout. Returns undefined
// (and checkout falls back to the Midtrans redirect) unless the client key matches the server key environment.
export function midtransSnapConfig(): MidtransSnapConfig | undefined {
  const clientKey = process.env.MIDTRANS_CLIENT_KEY?.trim();
  const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim();
  if (!clientKey || !serverKey) return undefined;
  const sandbox = serverKey.startsWith('SB-Mid-server-');
  if (!/^[A-Za-z0-9_-]+$/.test(clientKey) || !clientKey.startsWith(sandbox ? 'SB-Mid-client-' : 'Mid-client-')) return undefined;
  return {clientKey, scriptUrl: sandbox ? 'https://app.sandbox.midtrans.com/snap/snap.js' : 'https://app.midtrans.com/snap/snap.js'};
}

function signatureSecret() {
  const secret = process.env.MIDTRANS_SIGNATURE_SECRET_KEY?.trim();
  if (!secret) throw new Error('Signature Secret Key Midtrans belum dipasang.');
  return secret;
}

let capability: {source: string; until: number; check: Promise<void>} | undefined;
export async function ensureMidtransBackend(environment: MidtransEnvironment) {
  credentials(environment);
  signatureSecret();
  const source = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';
  await warmMidtransBackend(source);
}

// Starts (or reuses) the Apps Script capability check so it can overlap other checkout reads.
// The result is cached for 10 minutes; a failed check is forgotten so the next order retries it.
export function warmMidtransBackend(source = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '') {
  if (capability?.source === source && capability.until > Date.now()) return capability.check;
  const check = requestMasterScript('midtransPayments', {operation: 'capabilities'}).then(result => {
    if (result.midtransVersion !== 1) throw new Error('Backend Midtrans belum siap. Perbarui deployment Apps Script.');
  });
  const entry = {source, until: Date.now() + 10 * 60_000, check};
  capability = entry;
  check.catch(() => { if (capability === entry) capability = undefined; });
  return check;
}

// Payment links created by this server instance, so a retry never waits on the background save below.
const recentLinks = new Map<string, {url: string; until: number}>();

export function midtransInvoice(orderKey: string) {
  return 'VRTM' + createHash('sha256').update(orderKey).digest('hex').slice(0, 26).toUpperCase();
}

type MidtransClaim = {state?: string; paymentUrl?: string; claimed?: boolean; reservationUntil?: string};

export async function midtransPayment(orderKey: string, orderSerial: string, amount: number, requestUrl: string, savedClaim?: MidtransClaim) {
  const config = credentials();
  const invoice = midtransInvoice(orderKey);
  const claim = savedClaim ?? await requestMasterScript('midtransPayments', {operation: 'reserve', orderKey, orderSerial, invoice, amount});
  if (["PAID", "PAID_REVIEW"].includes(claim.state)) return undefined;
  if (claim.paymentUrl) return String(claim.paymentUrl);
  const recent = recentLinks.get(invoice);
  if (recent && recent.until > Date.now()) return recent.url;
  if (!claim.claimed) throw new Error('Tagihan Midtrans sedang disiapkan. Coba lagi untuk pesanan yang sama.');
  const until = Date.parse(claim.reservationUntil || "");
  const duration = Math.floor((until - Date.now()) / 60_000);
  if (!Number.isFinite(duration) || duration < 5) throw new Error('Waktu reservasi stok hampir habis.');
  const start = new Date(until - duration * 60_000 + 7 * 3_600_000).toISOString().slice(0, 19).replace('T', ' ');
  const url = new URL(requestUrl);
  const local = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(url.hostname);
  const finish = (local || ['https://vartana.id', 'https://www.vartana.id'].includes(url.origin) ? url.origin : 'https://www.vartana.id') + '/checkout';
  const response = await fetch(config.app + '/snap/v1/transactions', {
    method: 'POST', headers: config.headers, signal: AbortSignal.timeout(12_000),
    body: JSON.stringify({
      transaction_details: {order_id: invoice, gross_amount: amount},
      expiry: {start_time: start + ' +0700', unit: 'minutes', duration},
      callbacks: {finish, error: finish},
    }),
  });
  const data = await response.json();
  if (!response.ok || typeof data.redirect_url !== 'string' || new URL(data.redirect_url).origin !== config.app) {
    throw new Error('Midtrans belum bisa membuat tagihan. Coba lagi untuk pesanan yang sama.');
  }
  // The customer is sent to Midtrans immediately; recording the link for "continue payment"
  // happens after the response so it no longer adds a Google round trip to checkout.
  if (recentLinks.size >= 200) recentLinks.delete(recentLinks.keys().next().value!);
  recentLinks.set(invoice, {url: data.redirect_url, until: Date.now() + duration * 60_000});
  after(() => requestMasterScript('midtransPayments', {operation: 'link', invoice, paymentUrl: data.redirect_url})
    .catch(error => console.error('Midtrans link save failed:', invoice, error instanceof Error ? error.message : 'Unknown error')));
  return data.redirect_url;
}

export function verifyMidtransNotification(data: Record<string, unknown>) {
  const {order_id: invoice, status_code: code, gross_amount: amount, signature_key: signature} = data;
  if (typeof invoice !== 'string' || !invoicePattern.test(invoice) || typeof code !== 'string' || !/^\d{3}$/.test(code) ||
      typeof amount !== 'string' || !/^\d+(\.00)?$/.test(amount) || typeof signature !== 'string' || !/^[a-f0-9]{128}$/i.test(signature)) {
    throw new Error('Notifikasi Midtrans tidak valid.');
  }
  const expected = createHash('sha512').update(invoice + code + amount + signatureSecret()).digest();
  if (!timingSafeEqual(Buffer.from(signature, 'hex'), expected)) throw new Error('Notifikasi Midtrans tidak valid.');
  return invoice;
}

export async function reconcileMidtrans(invoice: string, onlySettled = false) {
  if (!invoicePattern.test(invoice)) throw new Error('Tagihan Midtrans tidak valid.');
  const config = credentials();
  const response = await fetch(config.api + '/v2/' + invoice + '/status', {
    headers: config.headers, cache: 'no-store', signal: AbortSignal.timeout(8_000),
  });
  const data = await response.json();
  if (!response.ok || data.order_id !== invoice || data.currency !== 'IDR') throw new Error('Status Midtrans belum bisa diverifikasi.');
  const status = ({settlement:'SUCCESS', capture:data.fraud_status === 'accept' ? 'SUCCESS' : 'PENDING',
    pending:'PENDING', deny:'FAILED', cancel:'FAILED', expire:'EXPIRED', refund:'REFUNDED', partial_refund:'REFUNDED',
    authorize:'PENDING', failure:'FAILED'} as Record<string, string>)[data.transaction_status];
  const amount = Number(data.gross_amount);
  if (!status || (status === 'SUCCESS' && (String(data.status_code) !== '200' || (data.fraud_status && data.fraud_status !== 'accept'))) ||
      !Number.isSafeInteger(amount) || amount < 1000 || typeof data.transaction_id !== 'string' || !data.transaction_id) {
    throw new Error('Status Midtrans tidak valid.');
  }
  if (onlySettled && status !== 'SUCCESS') return null;
  const eventHash = createHash('sha256').update(JSON.stringify([invoice, data.transaction_id, amount, status])).digest('hex');
  return requestMasterScript('midtransPayments', {operation: 'notification', invoice, amount, status, eventHash, eventId: eventHash});
}
