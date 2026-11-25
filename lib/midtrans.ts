import {createHash, timingSafeEqual} from 'node:crypto';
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
  if (capability?.source === source && capability.until > Date.now()) return capability.check;
  const check = requestMasterScript('midtransPayments', {operation: 'capabilities'}).then(result => {
    if (result.midtransVersion !== 1) throw new Error('Backend Midtrans belum siap. Perbarui deployment Apps Script.');
  });
  const entry = {source, until: Date.now() + 60_000, check};
  capability = entry;
  try { await check; }
  catch (error) { if (capability === entry) capability = undefined; throw error; }
}

export function midtransInvoice(orderKey: string) {
  return 'VRTM' + createHash('sha256').update(orderKey).digest('hex').slice(0, 26).toUpperCase();
}

export async function midtransPayment(orderKey: string, orderSerial: string, amount: number, requestUrl: string) {
  const config = credentials();
  const invoice = midtransInvoice(orderKey);
  const claim = await requestMasterScript('midtransPayments', {operation: 'reserve', orderKey, orderSerial, invoice, amount});
  if (["PAID", "PAID_REVIEW"].includes(claim.state)) return undefined;
  if (claim.paymentUrl) return String(claim.paymentUrl);
  if (!claim.claimed) throw new Error('Tagihan Midtrans sedang disiapkan. Coba lagi untuk pesanan yang sama.');
  const until = Date.parse(claim.reservationUntil);
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
  await requestMasterScript('midtransPayments', {operation: 'link', invoice, paymentUrl: data.redirect_url});
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
