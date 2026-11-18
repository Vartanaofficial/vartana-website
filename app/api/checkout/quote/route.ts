import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/checkout";

import {readIntegrationSettings} from '@/lib/integrations-server';

export async function POST(req: Request) {
  try { return NextResponse.json(await checkoutQuote(await req.json(),{freshMaster:false,integrationSettings:(await readIntegrationSettings()).settings}), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Checkout belum bisa dimuat." }, { status: 400 }); }
}
