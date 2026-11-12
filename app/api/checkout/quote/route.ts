import { NextResponse } from "next/server";
import { checkoutQuote } from "@/lib/checkout";

export async function POST(req: Request) {
  try { return NextResponse.json(await checkoutQuote(await req.json(),{freshMaster:false}), { headers: { "Cache-Control": "no-store" } }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : "Checkout belum bisa dimuat." }, { status: 400 }); }
}
