import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { puzzleRequest } from '@/lib/puzzle-server';
import {requestMasterScript} from '@/lib/master-products';

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('origin') !== new URL(req.url).origin) throw new Error('Buka permainan dari website VARTANA.');
    const body = await req.json();
    if (!['start', 'finish', 'status'].includes(body.operation)) throw new Error('Permintaan permainan tidak valid.');
    const session = req.cookies.get('vartana_puzzle')?.value || randomUUID();
    const capabilities = await requestMasterScript('getGameCapabilities');
    if(capabilities.gamesVersion!==3)throw new Error('Backend Games belum diperbarui. Deploy VARTANA-AppsScript-v2.txt terbaru sebagai New version pada Web app yang digunakan website, lalu buka menu Games.');
    const result = await puzzleRequest('puzzleGame', { operation: body.operation, session, phone: body.phone, email: body.email, moves: body.moves });
    const response = NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set('vartana_puzzle', session, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 86400 * 8 });
    return response;
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Permainan belum tersedia.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }
}
