import {NextResponse} from 'next/server';
import {checkoutContext} from '@/lib/checkout-context';
import {normalizeWhatsApp} from '@/lib/checkout-contact';
import {requestMasterScript} from '@/lib/master-products';

export async function POST(request: Request) {
  const headers = {'Cache-Control': 'no-store, private'};
  try {
    const body = await request.json();
    const phone = normalizeWhatsApp(body.phone || '');
    const orderKey = String(body.orderKey || '');
    if (!phone || !/^[a-f0-9-]{36}$/i.test(orderKey)) throw new Error('Pesanan tidak valid.');
    const context = await checkoutContext(phone, orderKey);
    const order = (context.orders || []).find((item: {orderKey?: string; phone?: string; paymentMethod?: string}) =>
      item.orderKey === orderKey && normalizeWhatsApp(item.phone || '') === phone && item.paymentMethod === 'midtrans');
    if (!order) throw new Error('Pesanan tidak ditemukan.');
    const result = await requestMasterScript('midtransPayments', {operation: 'status', orderKey});
    return NextResponse.json({paid: result.paid === true, review: result.review === true, status: result.state}, {headers});
  } catch {
    return NextResponse.json({message: 'Status pembayaran belum bisa dimuat.'}, {status: 400, headers});
  }
}
