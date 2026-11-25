import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/checkout";

import {readPreviewIntegrationSettings} from '@/lib/integrations-server';

import {readCheckoutMaster} from '@/lib/checkout-master';
import {readPreviewStock} from '@/lib/retail-stock';
import {warmMidtransBackend} from '@/lib/midtrans';

export async function POST(req: Request) {
  try {
    const input = await req.json();
    if (!Array.isArray(input?.items) || !input.items.length || input.items.length > 100)
      return NextResponse.json({message:'Keranjang masih kosong atau tidak valid.'}, {status:400});
    const [config, masterData, stock] = await Promise.all([
      readPreviewIntegrationSettings(), readCheckoutMaster(false), readPreviewStock(typeof input.orderKey === "string" && /^[a-f0-9-]{36}$/i.test(input.orderKey) ? input.orderKey : ""),
    ]);
    // While the customer reviews the summary, prepare the Midtrans readiness check for the order step.
    if (config.settings.some(setting => setting.id === 'midtrans' && setting.enabled)) warmMidtransBackend().catch(() => { /* re-checked when the order is placed */ });
    const quote = await checkoutQuote(input, {integrationSettings:config.settings, masterData, stock});
    return NextResponse.json(quote, {headers:{'Cache-Control':'no-store'}});
  }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Checkout belum bisa dimuat." }, { status: 400 }); }
}
