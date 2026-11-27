'use client';
import {adminFetch as fetch} from '@/lib/admin-fetch';
import {clientId} from '@/lib/client-id';
import {useCallback, useEffect, useState} from 'react';
import {articleVideoEmbed} from '@/lib/article-video';
import VideoShield from '@/app/components/VideoShield';
import VideoPoster from '@/app/components/VideoPoster';
import {MAX_VIDEOS, tiktokLink, validateVideoLibrary, type VartanaVideo} from '@/lib/videos';

const field = 'mt-1 w-full rounded-xl border border-[#cfd9c7] bg-white p-3 text-sm text-[#173d2b]';
const button = 'min-h-10 rounded-xl border border-[#cfd9c7] px-4 py-2 text-sm disabled:opacity-40';

async function requestVideos(): Promise<{videoVersion: number; videos: VartanaVideo[]; updatedAt: string}> {
  const r = await fetch('/api/admin/videos', {cache: 'no-store'}), d = await r.json();
  if (!r.ok || !d.success) throw Error(d.message || 'Video belum dimuat.');
  return d;
}

export default function VideosAdmin() {
  const [videos, setVideos] = useState<VartanaVideo[]>([]);
  const [saved, setSaved] = useState('[]');
  const [updatedAt, setUpdatedAt] = useState('');
  const [version, setVersion] = useState(-1);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [editing, setEditing] = useState<string[]>([]);
  const dirty = JSON.stringify(videos) !== saved;

  const apply = useCallback((d: {videoVersion: number; videos: VartanaVideo[]; updatedAt: string}) => {
    setVersion(d.videoVersion);
    setVideos(d.videos);
    setSaved(JSON.stringify(d.videos));
    setUpdatedAt(d.updatedAt);
    setEditing([]);
    setPreviewId('');
  }, []);
  const fail = useCallback((e: unknown) => setMessage(e instanceof Error ? e.message : 'Video belum dimuat.'), []);
  function load() {
    setBusy(true);
    requestVideos().then(apply, fail).finally(() => setBusy(false));
  }
  useEffect(() => {
    let active = true;
    requestVideos().then(d => { if (active) apply(d); }, e => { if (active) fail(e); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [apply, fail]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const change = (id: string, values: Partial<VartanaVideo>) => setVideos(list => list.map(v => v.id === id ? {...v, ...values} : v));
  const move = (index: number, by: number) => setVideos(list => {
    if (index + by < 0 || index + by >= list.length) return list;
    const next = [...list];
    [next[index], next[index + by]] = [next[index + by], next[index]];
    return next;
  });
  // Put a video at an exact position (1, 2, 3, ...); the website shows videos in this order.
  const moveTo = (from: number, to: number) => setVideos(list => {
    if (to === from || to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  });
  function add() {
    const video: VartanaVideo = {id: 'VID-' + clientId(), title: '', url: '', caption: '', details: '', visible: true, tiktokUrl: ''};
    setVideos(list => [video, ...list]);
    setEditing(ids => [...ids, video.id]);
  }
  function remove(video: VartanaVideo) {
    if (confirm(`Hapus video "${video.title || 'tanpa judul'}" dari daftar?`)) setVideos(list => list.filter(v => v.id !== video.id));
  }
  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const library = validateVideoLibrary({videos});
      const r = await fetch('/api/admin/videos', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({library, expectedUpdatedAt: updatedAt})}), d = await r.json();
      if (!r.ok || !d.success) throw Error(d.message);
      setVideos(d.videos);
      setSaved(JSON.stringify(d.videos));
      setUpdatedAt(d.updatedAt);
      setEditing([]);
      setPreviewId('');
      setMessage('Video tersimpan. Perubahan tampil di halaman Tentang VARTANA dalam sekitar 1 menit.');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Video belum tersimpan.');
    } finally {
      setBusy(false);
    }
  }

  const shown = videos.filter(v => v.visible).length;
  return <main className="mx-auto max-w-5xl bg-[#f7f5ee] p-4 text-[#173d2b] sm:p-8">
    <a href="/admin-access" className="text-sm underline">Menu admin</a>
    <header className="mt-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-xs tracking-widest text-[#8f733e]">KONTEN WEBSITE</p>
        <h1 className="mt-2 font-serif text-3xl">Video VARTANA</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">Tempel link video dari Google Drive atau YouTube, isi judul, caption dan detailnya. Video yang ditampilkan muncul sebagai galeri di halaman <a className="underline" href="/artikel/cerita-vartana" target="_blank" rel="noopener noreferrer">Tentang VARTANA</a>, urut dari atas.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => { if (!dirty || confirm('Buang perubahan yang belum disimpan?')) load(); }} className={button}>Muat ulang</button>
        <button disabled={busy || version < 1 || videos.length >= MAX_VIDEOS} onClick={add} className={button + ' bg-[#173d2b] text-white'}>+ Tambah video</button>
      </div>
    </header>

    {version === 0 && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm">Apps Script belum mendukung video. Ganti isi Apps Script dengan versi terbaru, klik Save, lalu Deploy &gt; Manage deployments &gt; Edit &gt; New version.</p>}
    {message && <p role="status" className="mt-4 rounded-xl border bg-white p-4 text-sm">{message}</p>}

    <details className="mt-5 rounded-xl border bg-white p-4 text-sm">
      <summary className="cursor-pointer font-semibold">Cara menyiapkan link video</summary>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-slate-600">
        <li><b>Google Drive:</b> klik kanan video → Bagikan → Akses umum: “Siapa saja yang memiliki link” (Pelihat) → Salin link.</li>
        <li><b>YouTube:</b> buka video → Bagikan → Salin. Video <i>unlisted</i> juga bisa.</li>
        <li>Video yang baru diunggah ke Drive butuh beberapa menit diproses sebelum bisa diputar.</li>
      </ol>
    </details>

    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
      <span>{videos.length} video · {shown} tampil di website{dirty && <b className="ml-2 text-amber-800">Belum disimpan</b>}</span>
      <button disabled={busy || version < 1 || !dirty} onClick={() => void save()} className={button + ' bg-[#173d2b] text-white'}>{busy ? 'Menyimpan…' : 'Simpan semua perubahan'}</button>
    </div>

    <div className="mt-4 space-y-3">
      {!videos.length && version >= 1 && <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">Belum ada video. Klik “+ Tambah video” lalu tempel link dari Google Drive atau YouTube.</div>}
      {videos.map((video, index) => {
        const embed = articleVideoEmbed(video.url);
        const isEditing = editing.includes(video.id);
        const tools = <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 font-semibold">No. urut
            <select value={index} onChange={e => moveTo(index, Number(e.target.value))} className="min-h-8 rounded-lg border border-[#cfd9c7] bg-white px-2 text-xs" aria-label={'Nomor urut ' + (video.title || 'video')}>
              {videos.map((_, n) => <option key={n} value={n}>{n + 1}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={video.visible} onChange={e => change(video.id, {visible: e.target.checked})}/>Tampilkan</label>
          <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="min-h-8 underline disabled:opacity-30">Naik</button>
          <button type="button" disabled={index === videos.length - 1} onClick={() => move(index, 1)} className="min-h-8 underline disabled:opacity-30">Turun</button>
          <button type="button" onClick={() => remove(video)} className="min-h-8 text-red-700 underline">Hapus</button>
        </div>;
        if (!isEditing) return <article key={video.id} className={'flex items-center gap-4 rounded-2xl border bg-white p-3 sm:p-4 ' + (video.visible ? 'border-[#cfd9c7]' : 'border-dashed border-[#d8d2c2]')}>
          <div className="relative aspect-[9/16] w-16 shrink-0 overflow-hidden rounded-lg bg-[#0f2e22] sm:w-20">
            {embed && <VideoPoster key={embed.poster} sources={embed.posters} className="absolute inset-0 h-full w-full object-cover"/>}
            <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 text-[10px] text-white">{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="truncate text-sm">{video.title || 'Video tanpa judul'}</strong>
              <span className={'rounded-full px-2 py-0.5 text-[10px] font-semibold ' + (video.visible ? 'bg-[#e6ecdc] text-[#33573f]' : 'bg-[#f1ece0] text-[#8a7a5a]')}>{video.visible ? 'Tampil' : 'Disembunyikan'}</span>
              <span className="rounded-full bg-[#f6e7c2] px-2 py-0.5 text-[10px] text-[#8a6a2c]">{embed?.provider === 'youtube' ? 'YouTube' : 'Google Drive'}</span>
              {tiktokLink(video.tiktokUrl || '') && <span className="rounded-full bg-[#111] px-2 py-0.5 text-[10px] text-white">TikTok</span>}
            </div>
            {video.caption && <p className="mt-1 line-clamp-2 text-xs text-slate-600">{video.caption}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setEditing(ids => [...ids, video.id])} className="min-h-8 rounded-lg bg-[#173d2b] px-3 text-xs text-white">Edit</button>
              {tools}
            </div>
          </div>
        </article>;
        return <article key={video.id} className="rounded-2xl border-2 border-[#b69245] bg-white p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm">{index + 1}. {video.title || 'Video baru'} <span className="ml-1 font-normal text-[#8a6a2c]">· sedang diedit</span></strong>
            {tools}
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="grid gap-3">
              <label className="text-xs">Link Google Drive / YouTube<input maxLength={2000} value={video.url} onChange={e => change(video.id, {url: e.target.value})} className={field} placeholder="https://drive.google.com/file/d/.../view"/></label>
              {video.url && !embed && <small className="text-xs text-red-700">Link belum dikenali. Tempel link berbagi Google Drive atau link YouTube.</small>}
              <label className="text-xs">Judul video<input maxLength={120} value={video.title} onChange={e => change(video.id, {title: e.target.value})} className={field} placeholder="Contoh: Mengenal VARTANA"/></label>
              <label className="text-xs">Caption singkat (opsional)<input maxLength={300} value={video.caption} onChange={e => change(video.id, {caption: e.target.value})} className={field} placeholder="Satu kalimat di bawah judul"/></label>
              <label className="text-xs">Link TikTok video ini (opsional)<input maxLength={500} value={video.tiktokUrl || ''} onChange={e => change(video.id, {tiktokUrl: e.target.value})} className={field} placeholder="https://www.tiktok.com/@vartanabotanical/video/..."/></label>
              {video.tiktokUrl?.trim() && !tiktokLink(video.tiktokUrl) && <small className="text-xs text-red-700">Link TikTok belum dikenali. Salin dari tombol Bagikan di TikTok.</small>}
              <small className="-mt-2 text-xs text-slate-500">Kalau kosong, tombol TikTok di website mengarah ke profil @vartanabotanical.</small>
              <label className="text-xs">Detail (opsional)<textarea maxLength={2000} rows={4} value={video.details} onChange={e => change(video.id, {details: e.target.value})} className={field} placeholder="Penjelasan lengkap yang tampil saat video diputar"/></label>
              <div><button type="button" onClick={() => { setEditing(ids => ids.filter(id => id !== video.id)); if (previewId === video.id) setPreviewId(''); }} className={button}>Selesai mengedit</button><span className="ml-3 text-xs text-slate-500">Jangan lupa klik “Simpan semua perubahan”.</span></div>
            </div>
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[240px] overflow-hidden rounded-xl bg-[#0f2e22]">
              {embed && previewId === video.id
                ? <><iframe src={embed.src} title={'Pratinjau ' + video.title} className="absolute inset-0 h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>{embed.provider === 'drive' && <VideoShield/>}</>
                : <button type="button" disabled={!embed} onClick={() => setPreviewId(video.id)} className="absolute inset-0 grid place-items-center text-xs text-[#d8c28b] disabled:opacity-50">
                    {embed && <VideoPoster key={embed.poster} sources={embed.posters} className="absolute inset-0 h-full w-full object-cover opacity-70"/>}
                    <span className="relative rounded-full bg-[#0f2e22cc] px-3 py-2">{embed ? '▶ Putar pratinjau' : 'Pratinjau muncul setelah link valid'}</span>
                  </button>}
            </div>
          </div>
        </article>;
      })}
    </div>
  </main>;
}
