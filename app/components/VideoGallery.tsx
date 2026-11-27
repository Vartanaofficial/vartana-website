'use client';
import {useCallback, useEffect, useRef, useState, type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import type {PublicVideo} from '@/lib/video-server';
import VideoShield from './VideoShield';
import {TIKTOK_PROFILE} from '@/lib/videos';

const Icon = ({d, size = 22}: {d: string; size?: number}) => <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d}/></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M16.6 3c.4 2.2 1.8 3.6 4 3.9v3.2a7.6 7.6 0 0 1-4-1.2v6.3A6.2 6.2 0 1 1 10.4 9v3.3a3 3 0 1 0 2.1 2.9V3z"/></svg>;

const INITIAL = 14;

// A compact list of small vertical reels above the article, in the order set in admin.
// Only thumbnails load with the page; the Drive/YouTube player is created when a reel is opened.
export default function VideoGallery({videos}: {videos: PublicVideo[]}) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  if (!videos.length) return null;
  const shown = all ? videos : videos.slice(0, INITIAL);
  return <section className="vt-reels" aria-labelledby="vt-reels-title">
    <header className="vt-reels-head">
      <div>
        <p className="vt-reels-eyebrow">Ruang tonton</p>
        <h2 id="vt-reels-title">Video VARTANA</h2>
      </div>
    </header>
    <ol className="vt-reels-row">
      {shown.map((video, i) => <li key={video.id}>
        <button type="button" className="vt-reel-card" onClick={() => setOpen(i)} aria-label={`Putar video ${i + 1}: ${video.title}`}>
          <img src={video.poster} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = 'hidden'; }}/>
          <span className="vt-reel-play" aria-hidden="true"/>
        </button>
        <p className="vt-reel-title">{video.title}</p>
      </li>)}
    </ol>
    {videos.length > INITIAL && <button type="button" className="vt-reels-more" onClick={() => setAll(v => !v)}>{all ? 'Tampilkan lebih sedikit' : `Lihat semua (${videos.length} video)`}</button>}
    {/* Rendered at the top of <body> so nothing on the article page can cover it. */}
    {open !== null && createPortal(<ReelViewer videos={videos} index={open} onIndex={setOpen} onClose={() => setOpen(null)}/>, document.body)}
  </section>;
}

function ReelViewer({videos, index, onIndex, onClose}: {videos: PublicVideo[]; index: number; onIndex: (i: number) => void; onClose: () => void}) {
  const video = videos[index];
  const [info, setInfo] = useState(false);
  const [loadedId, setLoadedId] = useState('');
  // The Drive thumbnail has the video's exact proportions, so the frame can match the video
  // and Google's player never has to pad it with black bars. YouTube posters are always 4:3.
  const [ratio, setRatio] = useState<{id: string; value: number} | null>(null);
  useEffect(() => {
    if (video.provider !== 'drive') return;
    let active = true;
    const probe = new Image();
    probe.onload = () => {
      const value = probe.naturalWidth / probe.naturalHeight;
      if (active && Number.isFinite(value) && value > 0.4 && value < 2) setRatio({id: video.id, value});
    };
    probe.src = video.poster;
    return () => { active = false; };
  }, [video.id, video.poster, video.provider]);
  const aspect = ratio?.id === video.id ? ratio.value : 9 / 16;
  const closeButton = useRef<HTMLButtonElement>(null);
  const touch = useRef(0);
  const go = useCallback((step: number) => {
    const next = index + step;
    if (next >= 0 && next < videos.length) onIndex(next);
  }, [index, videos.length, onIndex]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (info) setInfo(false); else onClose(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [go, onClose, info]);

  return <div className="vt-reel-viewer" role="dialog" aria-modal="true" aria-label={video.title}>
    <div className="vt-reel-ambient" style={{backgroundImage: `url("${video.poster}")`}} aria-hidden="true"/>
    <button type="button" className="vt-reel-backdrop" aria-label="Tutup video" onClick={onClose}/>
    <button ref={closeButton} type="button" className="vt-reel-close" aria-label="Tutup video" onClick={onClose}><Icon d="M6 6l12 12M18 6 6 18" size={24}/></button>
    <div className="vt-reel-stage">
      <div className={'vt-reel-frame' + (video.provider === 'drive' ? ' is-drive' : '')} key={video.id} style={{'--reel-ratio': String(aspect)} as CSSProperties}
        onTouchStart={e => { touch.current = e.touches[0].clientY; }}
        onTouchEnd={e => { const dy = e.changedTouches[0].clientY - touch.current; if (Math.abs(dy) > 70) go(dy < 0 ? 1 : -1); }}>
        {/* The thumbnail shows instantly; the player fades in once it has loaded. */}
        <img className="vt-reel-poster" src={video.poster} alt="" aria-hidden="true"/>
        <iframe className={loadedId === video.id ? 'is-ready' : ''} onLoad={() => setLoadedId(video.id)} src={video.embed + (video.provider === 'youtube' ? '&autoplay=1' : '')} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
        {video.provider === 'drive' && <VideoShield/>}
        <div className={'vt-reel-sheet' + (info ? ' is-open' : '')} aria-hidden={!info}>
          <div className="vt-reel-sheet-head">
            <img src="/Logo%20Vartana%20Bulat.png" alt="" width="30" height="30"/>
            <b>vartana</b>
            <button type="button" aria-label="Sembunyikan keterangan" tabIndex={info ? 0 : -1} onClick={() => setInfo(false)}><Icon d="m6 9 6 6 6-6" size={20}/></button>
          </div>
          <h3>{video.title}</h3>
          {video.caption && <p className="vt-reel-caption">{video.caption}</p>}
          {video.details && <p className="vt-reel-details">{video.details}</p>}
        </div>
      </div>
      <div className="vt-reel-rail">
        <button type="button" aria-label="Video sebelumnya" disabled={index === 0} onClick={() => go(-1)}><Icon d="m6 15 6-6 6 6"/></button>
        <button type="button" aria-label="Video berikutnya" disabled={index === videos.length - 1} onClick={() => go(1)}><Icon d="m6 9 6 6 6-6"/></button>
        <button type="button" aria-label={info ? 'Sembunyikan keterangan' : 'Lihat keterangan'} aria-pressed={info} className={info ? 'is-on' : ''} onClick={() => setInfo(v => !v)}><Icon d="M12 11v6M12 7.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><small>Info</small></button>
        <a href={video.tiktok || TIKTOK_PROFILE} target="_blank" rel="noopener noreferrer" aria-label={video.tiktok ? 'Tonton di TikTok' : 'TikTok @vartanabotanical'}><TikTokIcon/><small>TikTok</small></a>
      </div>
    </div>
  </div>;
}
