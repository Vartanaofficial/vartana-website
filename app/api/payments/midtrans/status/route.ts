import {after, NextResponse} from 'next/server';
import {checkoutContext} from '@/lib/checkout-context';
import {normalizeWhatsApp} from '@/lib/checkout-contact';
import {midtransInvoice, reconcileMidtrans} from '@/lib/midtrans';
import {signPuzzle} from '@/lib/puzzle-server';
import {requestMasterScript} from '@/lib/master-products';

export async function POST(request: Request) {
  const headers = {'Cache-Control': 'no-store, private'};
  try {
    const body = await request.json();
    const phone = normalizeWhatsApp(body.phone || '');
    const orderKey = String(body.orderKey || '');
    if (!phone || !/^[a-f0-9-]{36}$/i.test(orderKey)) throw new Error('Pesanan tidak valid.');
    const context = await checkoutContext(phone, orderKey, false);
    const order = (context.orders || []).find((item: {orderKey?: string; phone?: string; paymentMethod?: string}) =>
      item.orderKey === orderKey && normalizeWhatsApp(item.phone || '') === phone && item.paymentMethod === 'midtrans');
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    const paymentStatus = () => requestMasterScript('midtransPayments', {operation: 'status', orderKey});
    let result = await paymentStatus();
    if (!result.paid) {
      const verified = await reconcileMidtrans(midtransInvoice(orderKey), true).catch(() => null);
      if (verified?.email?.eventId && verified.email.status === 'PENDING') {
        const eventId = verified.email.eventId;
        after(async () => {
          try { await requestMasterScript('sendOrderCustomerEmail', signPuzzle('sendOrderCustomerEmail', {eventId})); }
          catch { console.warn('Email pesanan Midtrans masih menunggu pengiriman.'); }
        });
      }
      if (verified?.success) result = await paymentStatus();
    }
    return NextResponse.json({paid: result.paid === true, review: result.review === true, status: result.state}, {headers});
  } catch {
    return NextResponse.json({message: 'Status pembayaran belum bisa dimuat.'}, {status: 400, headers});
  }
}
