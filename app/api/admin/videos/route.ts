import {NextRequest, NextResponse} from 'next/server';
import {verifyAdminSessionToken} from '@/lib/admin-auth';
import {requestMasterScript} from '@/lib/master-products';
import {requestArticleAdmin} from '@/lib/article-admin-backend';
import {validateVideoLibrary} from '@/lib/videos';

const OUTDATED = 'Pasang Apps Script terbaru (fitur Video), lalu Deploy > New version sebelum mengelola video.';

function authorized(r: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET, token = r.cookies.get('vartana_admin_session')?.value;
  return !!(secret && token && verifyAdminSessionToken(token, secret));
}

// Old deployments reject unknown actions safely; the public read doubles as the version check.
async function backendReady() {
  const check = await requestMasterScript('getVideos').catch(() => null);
  return check?.videoVersion === 1;
}

export async function GET(r: NextRequest) {
  if (!authorized(r)) return NextResponse.json({success: false, message: 'Silakan login admin.'}, {status: 401});
  try {
    if (!(await backendReady())) return NextResponse.json({success: true, videoVersion: 0, videos: [], updatedAt: ''}, {headers: {'Cache-Control': 'no-store'}});
    const data = await requestArticleAdmin('getAdminVideos');
    return NextResponse.json({success: true, videoVersion: 1, videos: Array.isArray(data.videos) ? data.videos : [], updatedAt: String(data.updatedAt || '')}, {headers: {'Cache-Control': 'no-store'}});
  } catch (e) {
    return NextResponse.json({success: false, message: e instanceof Error ? e.message : 'Video belum dimuat.'}, {status: 502});
  }
}

export async function POST(r: NextRequest) {
  if (!authorized(r)) return NextResponse.json({success: false, message: 'Silakan login admin.'}, {status: 401});
  try {
    const body = await r.json(), library = validateVideoLibrary(body.library);
    if (!(await backendReady())) throw Error(OUTDATED);
    const result = await requestArticleAdmin('saveVideos', {article: library, expectedUpdatedAt: String(body.expectedUpdatedAt || '')});
    if (result.success !== true) throw Error(result.message || 'Video belum tersimpan.');
    return NextResponse.json({success: true, videos: result.videos, updatedAt: result.updatedAt});
  } catch (e) {
    return NextResponse.json({success: false, message: e instanceof Error ? e.message : 'Video belum tersimpan.'}, {status: 400});
  }
}
