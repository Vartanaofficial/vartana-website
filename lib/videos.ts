import {articleVideoEmbed} from './article-video';

export type VartanaVideo = {id: string; title: string; url: string; caption: string; details: string; visible: boolean; tiktokUrl?: string};

export const TIKTOK_PROFILE = 'https://www.tiktok.com/@vartanabotanical';

// Optional link to the same video on TikTok (tiktok.com, vm./vt. short links).
export function tiktokLink(raw = ''): string {
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:' && /^((www|vm|vt|m)\.)?tiktok\.com$/i.test(url.hostname) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
export type VideoLibrary = {videos: VartanaVideo[]};

export const MAX_VIDEOS = 50;

// Mirrors the Apps Script checks so the admin sees a clear message before anything is sent.
export function validateVideoLibrary(raw: unknown): VideoLibrary {
  const list = raw && typeof raw === 'object' ? (raw as VideoLibrary).videos : undefined;
  if (!Array.isArray(list) || list.length > MAX_VIDEOS) throw Error(`Daftar video tidak valid (maksimal ${MAX_VIDEOS} video).`);
  const seen = new Set<string>();
  const text = (v: unknown, max: number) => typeof v === 'string' && v.length <= max;
  const videos = list.map((v, index) => {
    const label = `Video ${index + 1}`;
    if (!v || typeof v !== 'object' || !/^VID-[a-zA-Z0-9-]{3,80}$/.test(v.id) || seen.has(v.id)) throw Error(`${label}: data tidak valid. Muat ulang halaman.`);
    seen.add(v.id);
    if (!text(v.title, 120) || !v.title.trim()) throw Error(`${label}: isi judul video (maksimal 120 karakter).`);
    if (!text(v.url, 2000) || !articleVideoEmbed(v.url)) throw Error(`${label}: link belum dikenali. Tempel link berbagi Google Drive atau link YouTube.`);
    if (!text(v.caption ?? '', 300)) throw Error(`${label}: caption maksimal 300 karakter.`);
    if (!text(v.details ?? '', 2000)) throw Error(`${label}: detail maksimal 2000 karakter.`);
    if (typeof v.visible !== 'boolean') throw Error(`${label}: status tampil tidak valid.`);
    if (!text(v.tiktokUrl ?? '', 500) || (v.tiktokUrl?.trim() && !tiktokLink(v.tiktokUrl))) throw Error(`${label}: link TikTok belum dikenali (contoh: https://www.tiktok.com/@vartanabotanical/video/...).`);
    return {id: v.id, title: v.title.trim(), url: v.url.trim(), caption: (v.caption || '').trim(), details: (v.details || '').trim(), visible: v.visible, tiktokUrl: (v.tiktokUrl || '').trim()};
  });
  return {videos};
}
