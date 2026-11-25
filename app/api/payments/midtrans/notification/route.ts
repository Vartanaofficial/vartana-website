import {after, NextResponse} from 'next/server';
import {reconcileMidtrans, verifyMidtransNotification} from '@/lib/midtrans';
import {requestMasterScript} from '@/lib/master-products';
import {signPuzzle} from '@/lib/puzzle-server';

export const maxDuration = 60;
export async function POST(request: Request) {
  let invoice: string;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw) > 100_000) return NextResponse.json({success: false}, {status: 413});
    const payload = JSON.parse(raw);
    // The dashboard sends a synthetic order that cannot affect a VARTANA payment.
    if (typeof payload?.order_id === 'string' &&
        /^payment_notif_test_M\d+_[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(payload.order_id)) {
      return NextResponse.json({success: true, test: true});
    }
    invoice = verifyMidtransNotification(payload);
  } catch {
    return NextResponse.json({success: false}, {status: 401});
  }
  try {
    const result = await reconcileMidtrans(invoice);
    if (!result.success) throw new Error('Notifikasi belum tercatat.');
    if (result.email?.eventId && result.email.status === 'PENDING') {
      const eventId = result.email.eventId;
      after(async () => {
        try { await requestMasterScript('sendOrderCustomerEmail', signPuzzle('sendOrderCustomerEmail', {eventId})); }
        catch { console.warn('Email pesanan Midtrans masih menunggu pengiriman.'); }
      });
    }
    return NextResponse.json({success: true});
  } catch {
    return NextResponse.json({success: false}, {status: 503});
  }
}
