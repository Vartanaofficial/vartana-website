'use client';
import {useCallback, useEffect, useRef, useState, type CSSProperties, type TouchEvent as ReactTouchEvent, type WheelEvent as ReactWheelEvent} from 'react';
import {createPortal} from 'react-dom';
import type {PublicVideo} from '@/lib/video-server';
import VideoShield from './VideoShield';
import VideoPoster from './VideoPoster';
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
          <VideoPoster key={video.id} sources={video.posters ?? [video.poster]}/>
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
  const youtube = video.provider === 'youtube';
  const [info, setInfo] = useState(false);
  const [loadedId, setLoadedId] = useState('');
  const [dir, setDir] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [idle, setIdle] = useState(false);
  // Swipe hint: shown once per visit, only when there is more than one video.
  const [hint, setHint] = useState(() => { try { return videos.length > 1 && !sessionStorage.getItem('vt-reel-hint'); } catch { return false; } });
  const player = useRef<HTMLIFrameElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const touch = useRef({y: 0, swiped: false});
  const lastWheel = useRef(0);
  const idleTimer = useRef(0);

  // Drive thumbnails keep the video's real proportions; YouTube Shorts are known to be vertical.
  const [ratio, setRatio] = useState<{id: string; value: number} | null>(null);
  useEffect(() => {
    if (video.ratio) return;
    let active = true;
    const probe = new Image();
    probe.onload = () => {
      const value = probe.naturalWidth / probe.naturalHeight;
      if (active && Number.isFinite(value) && value > 0.4 && value < 2) setRatio({id: video.id, value});
    };
    probe.src = video.poster;
    return () => { active = false; };
  }, [video.id, video.poster, video.ratio]);
  const aspect = video.ratio ?? (ratio?.id === video.id ? ratio.value : 9 / 16);

  const go = useCallback((step: number) => {
    const next = index + step;
    if (next < 0 || next >= videos.length) return;
    setDir(step);
    setPaused(false);
    setInfo(false);
    setHint(false);
    onIndex(next);
  }, [index, videos.length, onIndex]);

  // YouTube's official iframe messages: play/pause from our own tap layer, and its state back.
  const command = (func: string) => player.current?.contentWindow?.postMessage(JSON.stringify({event: 'command', func, args: []}), '*');
  const togglePlay = () => { if (!youtube) return; command(paused ? 'playVideo' : 'pauseVideo'); setPaused(p => !p); };
  useEffect(() => {
    const listen = (e: MessageEvent) => {
      if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        const state = data?.event === 'onStateChange' ? data.info : data?.info?.playerState;
        if (state === 1) setPaused(false);
        if (state === 2) setPaused(true);
        if (typeof data?.info?.muted === 'boolean') setMuted(data.info.muted);
      } catch { /* not a player message */ }
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, []);
  const onPlayerLoad = () => {
    setLoadedId(video.id);
    if (youtube) player.current?.contentWindow?.postMessage(JSON.stringify({event: 'listening', id: video.id, channel: 'widget'}), '*');
  };

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    try { sessionStorage.setItem('vt-reel-hint', '1'); } catch { /* optional */ }
    return () => { document.body.style.overflow = previous; };
  }, []);
  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(false), 3200);
    return () => window.clearTimeout(timer);
  }, [hint]);
  // Desktop: the up/down buttons appear when the mouse moves and hide again when it rests.
  const wake = () => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
  };
  useEffect(() => {
    idleTimer.current = window.setTimeout(() => setIdle(true), 2200);
    return () => window.clearTimeout(idleTimer.current);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (info) setInfo(false); else onClose(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === ' ' && youtube) { e.preventDefault(); togglePlay(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  });

  const onWheel = (e: ReactWheelEvent) => {
    if (Math.abs(e.deltaY) < 25 || Date.now() - lastWheel.current < 700) return;
    lastWheel.current = Date.now();
    go(e.deltaY > 0 ? 1 : -1);
  };
  const swipeStart = (e: ReactTouchEvent) => { touch.current = {y: e.touches[0].clientY, swiped: false}; };
  const swipeEnd = (e: ReactTouchEvent) => {
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dy) > 60) { touch.current.swiped = true; go(dy < 0 ? 1 : -1); }
  };

  return <div className={'vt-reel-viewer' + (idle ? ' is-idle' : '')} role="dialog" aria-modal="true" aria-label={video.title} onMouseMove={wake} onWheel={onWheel}>
    {/* The last thumbnail (YouTube hqdefault / Drive) always exists, so it is safe for the blurred backdrop. */}
    <div className="vt-reel-ambient" style={{backgroundImage: `url("${(video.posters ?? [video.poster]).at(-1)}")`}} aria-hidden="true"/>
    <button type="button" className="vt-reel-backdrop" aria-label="Tutup video" onClick={onClose}/>
    <button ref={closeButton} type="button" className="vt-reel-close" aria-label="Tutup video" onClick={onClose}><Icon d="M6 6l12 12M18 6 6 18" size={24}/></button>
    <div className="vt-reel-stage">
      <div className={'vt-reel-frame' + (video.provider === 'drive' ? ' is-drive' : '') + (dir > 0 ? ' from-below' : dir < 0 ? ' from-above' : '')} key={video.id} style={{'--reel-ratio': String(aspect)} as CSSProperties}
        onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
        {/* The thumbnail shows instantly; the player fades in once it has loaded. */}
        <VideoPoster key={'p-' + video.id} sources={video.posters ?? [video.poster]} className="vt-reel-poster" eager/>
        <iframe ref={player} className={loadedId === video.id ? 'is-ready' : ''} onLoad={onPlayerLoad} src={video.embed + (youtube ? '&autoplay=1&enablejsapi=1' : '')} title={video.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
        {video.provider === 'drive' && <VideoShield/>}
        {/* Tap = play/pause, swipe up/down = next/previous (YouTube's iframe would otherwise swallow touches). */}
        {youtube && <button type="button" className={'vt-reel-touch' + (paused ? ' is-paused' : '')} aria-label={paused ? 'Putar video' : 'Jeda video'}
          onClick={() => { if (touch.current.swiped) { touch.current.swiped = false; return; } togglePlay(); }}/>}
        {hint && <p className="vt-reel-hint" aria-hidden="true"><span className="is-touch">Geser ke atas untuk video berikutnya</span><span className="is-mouse">Scroll untuk video berikutnya</span></p>}
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
        <button type="button" className="vt-reel-step" aria-label="Video sebelumnya" disabled={index === 0} onClick={() => go(-1)}><Icon d="m6 15 6-6 6 6"/></button>
        <button type="button" className="vt-reel-step" aria-label="Video berikutnya" disabled={index === videos.length - 1} onClick={() => go(1)}><Icon d="m6 9 6 6 6-6"/></button>
        {youtube && <button type="button" aria-label={muted ? 'Nyalakan suara' : 'Matikan suara'} aria-pressed={!muted} className={muted ? 'is-on' : ''} onClick={() => { command(muted ? 'unMute' : 'mute'); setMuted(m => !m); }}><Icon d={muted ? 'M11 5 6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6' : 'M11 5 6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13'}/><small>{muted ? 'Suara' : 'Bisu'}</small></button>}
        <button type="button" aria-label={info ? 'Sembunyikan keterangan' : 'Lihat keterangan'} aria-pressed={info} className={info ? 'is-on' : ''} onClick={() => setInfo(v => !v)}><Icon d="M12 11v6M12 7.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><small>Info</small></button>
        <a href={video.tiktok || TIKTOK_PROFILE} target="_blank" rel="noopener noreferrer" aria-label={video.tiktok ? 'Tonton di TikTok' : 'TikTok @vartanabotanical'}><TikTokIcon/><small>TikTok</small></a>
      </div>
    </div>
  </div>;
}
