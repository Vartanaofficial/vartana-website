'use client';
import {useEffect, useRef, useState} from 'react';

// Tries thumbnails in order. YouTube answers a thumbnail it has not made yet with a grey 120x90
// placeholder (not an error), so that size is treated as "missing" and the next source is used.
export default function VideoPoster({sources, className, eager}: {sources: string[]; className?: string; eager?: boolean}) {
  const [index, setIndex] = useState(0);
  const img = useRef<HTMLImageElement>(null);
  const src = sources[index];
  const last = index >= sources.length - 1;

  // An image can finish loading before React attaches its handlers (server-rendered page),
  // so the result is checked again once the component is live.
  useEffect(() => {
    const el = img.current;
    if (!el || !el.complete || last) return;
    if (el.naturalWidth === 0 || (el.naturalWidth <= 120 && el.naturalHeight <= 90)) {
      const timer = window.setTimeout(() => setIndex(i => i + 1), 0);
      return () => window.clearTimeout(timer);
    }
  }, [src, last]);

  if (!src) return null;
  return <img ref={img} key={src} src={src} alt="" aria-hidden="true" className={className} loading={eager ? 'eager' : 'lazy'} decoding="async"
    onLoad={e => { const el = e.currentTarget; if (!last && el.naturalWidth <= 120 && el.naturalHeight <= 90) setIndex(i => Math.min(i + 1, sources.length - 1)); }}
    onError={() => setIndex(i => Math.min(i + 1, sources.length))}/>;
}
