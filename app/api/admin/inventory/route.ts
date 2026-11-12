import {NextRequest, NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {requestMasterScript} from '@/lib/master-products';

function authorized(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get('vartana_admin_session')?.value;
  return Boolean(secret && token && verifyAdminSessionToken(token, secret));
}

async function run(request: NextRequest, write: boolean) {
  if (!authorized(request)) return NextResponse.json({success: false, message: 'Silakan login admin.'}, {status: 401});
  try {
    const current = await requestMasterScript(write ? 'getInventoryCapabilities' : 'getInventory');
    if (![1, 2, 3, 4].includes(current.inventoryVersion)) throw Error('Deploy Apps Script versi stok terbaru terlebih dahulu. Stok disimpan di spreadsheet existing.');
    if (write && current.inventoryVersion !== 4) throw Error('Perbarui Apps Script stok dan produksi v4 sebelum mengedit stok.');
    if (!write) return NextResponse.json(current, {headers: {'Cache-Control': 'no-store, private'}});

    const body = await request.json();
    if (body.operation === 'bulkFinishedOpname' && current.bulkFinishedVersion !== 1) throw Error('Perbarui Apps Script untuk mengaktifkan simpan beberapa SKU sekaligus.');
    if (['batchRevise', 'batchDelete', 'batchSplit'].includes(body.operation) && current.batchRevisionVersion !== 1) throw Error('Perbarui deployment Apps Script dengan TXT terbaru untuk edit, hapus, dan pembagian batch.');
    if ((body.operation === 'materialActual' || ['archiveMaterial', 'archiveMaterials'].includes(body.operation)) && current.materialActualVersion !== 1) throw Error('Perbarui deployment Apps Script dengan TXT terbaru untuk koreksi stok dan arsip bahan.');
    if (body.operation === 'batchOpeningEdit' && current.openingEditVersion !== 1) throw Error('Perbarui deployment Apps Script dari TXT terbaru untuk edit stok awal.');
    if ((String(body.operation || '').startsWith('batch') || body.usageMode === 'bom') && current.materialWorkflowVersion !== 2) throw Error('Perbarui deployment Apps Script dari TXT terbaru sebelum input bahan.');
    return NextResponse.json(await requestMasterScript('saveInventory', body));
  } catch (failure) {
    return NextResponse.json({success: false, message: failure instanceof Error ? failure.message : 'Stok belum dimuat.'}, {status: 502});
  }
}

export const GET = (request: NextRequest) => run(request, false);
export const POST = (request: NextRequest) => run(request, true);
