'use client';
import {useCallback, useEffect, useState} from 'react';
import type {CheckoutReceipt} from '@/lib/order-confirmation';

export default function MidtransReceipt({receipt, orderKey}: {receipt: CheckoutReceipt; orderKey: string}) {
  const [state, setState] = useState({paid: false, expired: false, message: ''});
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
        paid: data.paid, expired: data.status === 'EXPIRED',
        message: data.paid ? (data.review ? 'Pembayaran diterima. Tim VARTANA sedang memeriksa pesananmu.' : 'Pembayaran diterima. Pesananmu akan disiapkan.')
          : data.status === 'EXPIRED' ? 'Waktu pembayaran sudah habis.' : 'Pembayaran belum dikonfirmasi.',
      });
    } catch {
      if (!signal?.aborted) setState(previous => ({...previous, message: 'Status belum bisa dimuat. Coba lagi.'}));
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, [orderKey, phone]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void checkStatus(controller.signal), 0);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [checkStatus]);

  useEffect(() => {
    const remaining = Date.parse(receipt.reservationUntil || '') - Date.now();
    const timer = window.setTimeout(() => setReservationExpired(true), Math.max(0, remaining || 0));
    return () => window.clearTimeout(timer);
  }, [receipt.reservationUntil]);

  const canPay = !busy && !state.paid && !state.expired && !reservationExpired && receipt.midtransPaymentUrl;
  return <section className="mx-auto max-w-xl rounded-3xl border border-[#dedfd2] bg-white p-7 sm:p-9">
    <h2 className="font-serif text-2xl">Pembayaran Midtrans</h2>
    <p className="mt-3 text-sm">Pesanan <span className="break-all font-mono">{receipt.serial}</span></p>
    <p className="mt-3 font-serif text-2xl">{receipt.total.toLocaleString('id-ID', {style: 'currency', currency: 'IDR', maximumFractionDigits: 0})}</p>
    <p role="status" className="mt-4 text-sm">{busy ? 'Memeriksa pembayaran…' : state.message}</p>
    <div className="mt-6 flex flex-wrap gap-4">
      {canPay && <a className="rounded-full bg-[#173b2b] px-4 py-2 text-sm text-white" href={receipt.midtransPaymentUrl}>Buka Midtrans</a>}
      <button type="button" disabled={busy} className="text-sm underline" onClick={() => { setBusy(true); void checkStatus(); }}>Cek status</button>
    </div>
  </section>;
}
