'use client';
import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {PAYMENT_DETAILS} from '@/lib/payment-details';
import {orderConfirmationMessage, type CheckoutReceipt} from '@/lib/order-confirmation';
import MidtransEmbed, {snapToken} from './MidtransEmbed';

const rupiah = (value: number) => value.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0});

function Countdown({until, onExpire}: {until?: string | null; onExpire: () => void}) {
  const end = Date.parse(until || '');
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!Number.isFinite(end)) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [end]);
  const expired = Number.isFinite(end) && now >= end;
  useEffect(() => { if (expired) onExpire(); }, [expired, onExpire]);
  if (!Number.isFinite(end)) return null;
  const left = Math.max(0, Math.floor((end - now) / 1000));
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  return <p className={'vt-pay-timer' + (left < 300 ? ' is-urgent' : '')}><span>Selesaikan dalam</span><b aria-live="off">{mm}:{ss}</b></p>;
}

export default function MidtransReceipt({receipt, orderKey}: {receipt: CheckoutReceipt; orderKey: string}) {
  const [state, setState] = useState({paid: false, review: false, expired: false, message: ''});
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [busy, setBusy] = useState(true);
  const [reservationExpired, setReservationExpired] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const expireReservation = useCallback(() => setReservationExpired(true), []);
  const phone = receipt.details?.phone;
  const checkStatus = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/payments/midtrans/status', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({orderKey, phone}), signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error();
      setState({
        paid: data.paid, review: data.review, expired: data.status === 'EXPIRED',
        message: data.paid ? (data.review ? 'Tim VARTANA sedang memeriksa pesananmu.' : 'Terima kasih sudah berbelanja di VARTANA.')
          : data.status === 'EXPIRED' ? 'Waktu pembayaran sudah habis.' : 'Pembayaran belum dikonfirmasi.',
      });
      return data.paid || data.status === 'EXPIRED';
    } catch {
      if (!signal?.aborted) setState(previous => ({...previous, message: 'Status belum bisa dimuat. Coba lagi.'}));
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, [orderKey, phone]);

  // QRIS and bank payments can settle minutes after the customer returns, so keep checking
  // (4s, slowly backing off to 15s) for up to 10 minutes, and check again when the tab regains focus.
  useEffect(() => {
    const controller = new AbortController();
    const started = Date.now();
    let delay = 4000, timer = 0, running = false, done = false;
    const schedule = (wait: number) => { window.clearTimeout(timer); if (!done && !controller.signal.aborted) timer = window.setTimeout(refresh, wait); };
    async function refresh() {
      if (running || done) return;
      if (document.visibilityState === 'hidden') { schedule(3000); return; }
      running = true;
      const complete = await checkStatus(controller.signal);
      running = false;
      if (complete) { done = true; return; }
      if (Date.now() - started < 10 * 60_000) { schedule(delay); delay = Math.min(15000, delay + 2000); }
    }
    const wake = () => { if (document.visibilityState === 'visible') schedule(0); };
    schedule(0);
    window.addEventListener('focus', wake);
    document.addEventListener('visibilitychange', wake);
    return () => { done = true; window.clearTimeout(timer); controller.abort(); window.removeEventListener('focus', wake); document.removeEventListener('visibilitychange', wake); };
  }, [checkStatus]);

  useEffect(() => {
    const remaining = Date.parse(receipt.reservationUntil || '') - Date.now();
    const timer = window.setTimeout(() => setReservationExpired(true), Math.max(0, remaining || 0));
    return () => window.clearTimeout(timer);
  }, [receipt.reservationUntil]);

  // After Snap reports a result, keep checking until the payment notification is recorded.
  const confirmAfterSnap = useCallback((kind: 'success' | 'pending' | 'error') => {
    if (kind === 'error') { setState(previous => ({...previous, message: 'Pembayaran belum berhasil. Pilih metode lain atau coba lagi.'})); return; }
    setConfirming(true);
    let attempts = 10;
    const poll = async () => {
      const complete = await checkStatus();
      if (complete || --attempts <= 0) { setConfirming(false); return; }
      window.setTimeout(() => void poll(), 4000);
    };
    void poll();
  }, [checkStatus]);

  const canPay = !busy && !state.paid && !state.expired && !reservationExpired && receipt.midtransPaymentUrl;
  const details = receipt.details;
  const whatsapp = state.paid ? 'https://wa.me/' + PAYMENT_DETAILS.whatsapp + '?text=' + encodeURIComponent(orderConfirmationMessage(receipt, {
    name: '', email: '', phone: '', address: '',
  }, 'midtrans')) : undefined;

  async function downloadReceipt() {
    if (!state.paid || downloading) return;
    setDownloading(true);
    setDownloadError('');
    try {
      const {downloadCustomerInvoice} = await import('@/app/admin/dashboard/customer-invoice');
      await downloadCustomerInvoice({
        ...details, orderSerial: receipt.serial, customerName: details?.customerName || '',
        phone: details?.phone || '', addressDetail: details?.addressDetail || '',
        itemsSummary: details?.itemsSummary || '', grandTotal: receipt.total, paymentMethod: 'midtrans',
        status: 'PEMBAYARAN DITERIMA',
      });
    } catch {
      setDownloadError('Struk belum bisa diunduh. Coba lagi.');
    } finally {
      setDownloading(false);
    }
  }

  const showEmbed = !state.paid && !state.expired && !reservationExpired && !embedFailed && !!receipt.midtransSnap && !!snapToken(receipt.midtransPaymentUrl);
  if (showEmbed && receipt.midtransSnap && receipt.midtransPaymentUrl) return <section className="vt-pay" aria-labelledby="vt-pay-title">
    <aside className="vt-pay-summary">
      <p className="vt-pay-eyebrow">Langkah terakhir</p>
      <h1 id="vt-pay-title">Selesaikan pembayaran</h1>
      <p className="vt-pay-lead">Pilih metode di samping. Halaman ini akan berubah otomatis begitu pembayaranmu diterima.</p>
      <p className="vt-pay-note">Pilih dengan teliti: setelah kode QR atau nomor Virtual Account dibuat, Midtrans mengunci metode tersebut untuk pesanan ini.</p>
      <div className="vt-pay-total"><span>Total pembayaran</span><strong>{rupiah(receipt.total)}</strong></div>
      <Countdown until={receipt.reservationUntil} onExpire={expireReservation}/>
      <dl className="vt-pay-meta">
        <div><dt>Nomor pesanan</dt><dd>{receipt.serial}</dd></div>
        {details?.customerName && <div><dt>Atas nama</dt><dd>{details.customerName}</dd></div>}
      </dl>
      <p role="status" className="vt-pay-status">{confirming ? 'Mengonfirmasi pembayaran…' : state.message && !busy ? state.message : 'Menunggu pembayaran'}</p>
      <p className="vt-pay-secure"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></svg>Pembayaran diproses aman oleh Midtrans</p>
    </aside>
    <div className="vt-pay-stage">
      <MidtransEmbed paymentUrl={receipt.midtransPaymentUrl} config={receipt.midtransSnap} onResult={confirmAfterSnap} onUnavailable={() => setEmbedFailed(true)}/>
      <div className="vt-pay-actions">
        <button type="button" disabled={busy || confirming} onClick={() => { setBusy(true); void checkStatus(); }}>{busy || confirming ? 'Memeriksa…' : 'Saya sudah bayar, cek status'}</button>
        <a href={receipt.midtransPaymentUrl}>Buka di halaman Midtrans ↗</a>
      </div>
    </div>
  </section>;

  const paid = state.paid;
  return <section className={'vt-done' + (paid ? ' is-paid' : ' is-waiting')} aria-labelledby="vt-done-title">
    <div className="vt-done-main">
      <header className="vt-done-hero">
        <span className="vt-done-seal" aria-hidden="true">
          {paid ? <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="m15 27 7 7 15-16"/></svg>
            : <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M26 14v13l8 5"/></svg>}
        </span>
        <p className="vt-done-eyebrow">{paid ? 'Pembayaran diterima' : 'Menunggu pembayaran'}</p>
        <h1 id="vt-done-title">{paid ? (state.review ? 'Pembayaran diterima' : 'Pesanan sedang disiapkan') : 'Pembayaran Midtrans'}</h1>
        <p role="status" className="vt-done-message">{busy ? 'Memeriksa pembayaran…' : state.message}</p>
      </header>
      <div className="vt-done-body">
        <dl className="vt-done-facts">
          <div><dt>Nomor pesanan</dt><dd className="is-mono">{receipt.serial}</dd></div>
          <div><dt>{paid ? 'Jumlah dibayar' : 'Total pembayaran'}</dt><dd className="is-amount">{rupiah(receipt.total)}</dd></div>
        </dl>
        {paid && <ol className="vt-done-steps" aria-label="Status pesanan">
          <li className="is-done"><i aria-hidden="true"/>Dibayar</li>
          <li className="is-active"><i aria-hidden="true"/>Disiapkan</li>
          <li><i aria-hidden="true"/>Dikirim</li>
        </ol>}
        <div className="vt-done-actions">
          {canPay && <a className="vt-done-primary" href={receipt.midtransPaymentUrl}>Buka Midtrans</a>}
          {paid ? <>
            <button type="button" className="vt-done-primary" onClick={() => void downloadReceipt()} disabled={downloading}>{downloading ? 'Menyiapkan struk…' : 'Unduh struk PDF'}</button>
            <a className="vt-done-secondary" href={whatsapp} target="_blank" rel="noreferrer">Konfirmasi via WhatsApp</a>
            <Link className="vt-done-link" href="/?track=1">Lacak pesanan →</Link>
          </> : <button type="button" className="vt-done-secondary" disabled={busy} onClick={() => { setBusy(true); void checkStatus(); }}>{busy ? 'Memeriksa…' : 'Cek status'}</button>}
        </div>
        {downloadError && <p role="alert" className="vt-done-error">{downloadError}</p>}
      </div>
    </div>
    {paid && <figure className="vt-done-figure">
      <Image src="/Vartana Botanical Wellness Tea Collection.png" alt="Koleksi teh herbal VARTANA" fill sizes="(min-width: 900px) 40vw, 100vw" className="object-cover" />
      <figcaption>Terima kasih sudah memilih VARTANA.</figcaption>
    </figure>}
  </section>;
}
