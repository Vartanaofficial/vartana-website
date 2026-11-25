'use client';
import {useCallback, useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {PAYMENT_DETAILS} from '@/lib/payment-details';
import {orderConfirmationMessage, type CheckoutReceipt} from '@/lib/order-confirmation';

export default function MidtransReceipt({receipt, orderKey}: {receipt: CheckoutReceipt; orderKey: string}) {
  const [state, setState] = useState({paid: false, review: false, expired: false, message: ''});
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [busy, setBusy] = useState(true);
  const [reservationExpired, setReservationExpired] = useState(false);
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

  useEffect(() => {
    const controller = new AbortController();
    let retries = 2;
    let timer: number;
    const refresh = async () => {
      const complete = await checkStatus(controller.signal);
      if (!complete && !controller.signal.aborted && retries-- > 0) timer = window.setTimeout(refresh, 6000);
    };
    timer = window.setTimeout(refresh, 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [checkStatus]);

  useEffect(() => {
    const remaining = Date.parse(receipt.reservationUntil || '') - Date.now();
    const timer = window.setTimeout(() => setReservationExpired(true), Math.max(0, remaining || 0));
    return () => window.clearTimeout(timer);
  }, [receipt.reservationUntil]);

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

  return <section className={`mx-auto overflow-hidden rounded-3xl border border-[#c8d5c3] bg-[#fffdf8] shadow-sm ${state.paid ? "max-w-5xl md:grid md:grid-cols-[1.5fr_1fr]" : "max-w-2xl"}`}>
    <div className="p-7 sm:p-10">
    {state.paid && <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#173b2b] px-3 py-2 text-xs font-semibold text-white"><span aria-hidden="true">&#10003;</span> Pembayaran diterima</p>}
    <h1 className="font-serif text-3xl sm:text-4xl">{state.paid ? (state.review ? "Pembayaran diterima" : "Pesanan sedang disiapkan") : "Pembayaran Midtrans"}</h1>
    <p role="status" className="mt-3 text-sm leading-6 text-[#5b6b59]">{busy ? 'Memeriksa pembayaran…' : state.message}</p>
    <dl className="mt-6 grid gap-4 rounded-2xl bg-[#f2f4ea] p-5 sm:grid-cols-2">
      <div><dt className="text-xs text-[#5b6b59]">Nomor pesanan</dt><dd className="mt-1 break-all font-mono text-sm">{receipt.serial}</dd></div>
      <div><dt className="text-xs text-[#5b6b59]">{state.paid ? 'Jumlah dibayar' : 'Total pembayaran'}</dt><dd className="mt-1 font-semibold">{receipt.total.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0})}</dd></div>
    </dl>
    <div className="mt-6 flex flex-wrap gap-4">
      {canPay && <a className="rounded-full bg-[#173b2b] px-4 py-2 text-sm text-white" href={receipt.midtransPaymentUrl}>Buka Midtrans</a>}
      {state.paid ? <>
        <button type="button" onClick={() => void downloadReceipt()} disabled={downloading} className="rounded-full bg-[#173b2b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{downloading ? 'Menyiapkan struk…' : 'Unduh struk PDF'}</button>
        <a href={whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-[#446451] px-5 py-3 text-sm font-semibold text-[#173b2b]">Konfirmasi via WhatsApp</a>
        <Link className="self-center text-sm underline" href="/?track=1">Lacak pesanan</Link>
      </> : <button type="button" disabled={busy} className="text-sm underline" onClick={() => { setBusy(true); void checkStatus(); }}>Cek status</button>}
    </div>
    {downloadError && <p role="alert" className="mt-4 text-sm text-red-800">{downloadError}</p>}
    </div>
    {state.paid && <div className="relative min-h-48 overflow-hidden bg-[#e6ead9] md:min-h-full">
      <Image src="/Vartana Botanical Wellness Tea Collection.png" alt="Koleksi teh herbal VARTANA" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
    </div>}
  </section>;
}
