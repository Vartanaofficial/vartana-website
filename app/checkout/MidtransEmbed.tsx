'use client';
import {useEffect, useRef, useState} from 'react';

type SnapResult = {order_id?: string; transaction_status?: string; status_code?: string};
type SnapOptions = {embedId: string; onSuccess?: (r: SnapResult) => void; onPending?: (r: SnapResult) => void; onError?: (r: SnapResult) => void; onClose?: () => void};
declare global { interface Window { snap?: {embed: (token: string, options: SnapOptions) => void; hide?: () => void} } }

const SNAP_ORIGINS = new Set(['https://app.midtrans.com', 'https://app.sandbox.midtrans.com']);
let snapScript: {src: string; ready: Promise<void>} | undefined;
const debug = (reason: string) => { if (process.env.NODE_ENV === 'development') console.warn('[midtrans-embed] fallback ke redirect:', reason); };

function loadSnap(src: string, clientKey: string) {
  if (snapScript?.src === src) return snapScript.ready;
  const ready = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.clientKey = clientKey;
    const timer = window.setTimeout(() => reject(new Error('timeout')), 15000);
    script.onload = () => { window.clearTimeout(timer); if (window.snap?.embed) resolve(); else reject(new Error('snap')); };
    script.onerror = () => { window.clearTimeout(timer); reject(new Error('load')); };
    document.head.appendChild(script);
  });
  snapScript = {src, ready};
  ready.catch(() => { if (snapScript?.ready === ready) snapScript = undefined; });
  return ready;
}

export function snapToken(paymentUrl?: string) {
  try {
    const url = new URL(paymentUrl || '');
    const token = url.pathname.split('/').filter(Boolean).pop() || '';
    return SNAP_ORIGINS.has(url.origin) && /^[a-f0-9-]{36}$/i.test(token) ? token : '';
  } catch { return ''; }
}

export default function MidtransEmbed({paymentUrl, config, onResult, onUnavailable}: {
  paymentUrl: string; config: {clientKey: string; scriptUrl: string};
  onResult: (kind: 'success' | 'pending' | 'error') => void; onUnavailable: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const callbacks = useRef({onResult, onUnavailable});
  useEffect(() => { callbacks.current = {onResult, onUnavailable}; });

  useEffect(() => {
    const token = snapToken(paymentUrl);
    let src: URL | undefined;
    try { src = new URL(config.scriptUrl); } catch { /* handled below */ }
    if (!token || !src || !SNAP_ORIGINS.has(src.origin) || src.pathname !== '/snap/snap.js') { debug(!token ? 'token tidak terbaca dari URL pembayaran' : 'URL snap.js tidak valid'); callbacks.current.onUnavailable(); return; }
    let active = true;
    loadSnap(src.href, config.clientKey).then(() => {
      if (!active || !window.snap) return;
      window.snap.embed(token, {
        embedId: 'vartana-snap',
        onSuccess: () => callbacks.current.onResult('success'),
        onPending: () => callbacks.current.onResult('pending'),
        onError: () => callbacks.current.onResult('error'),
      });
      setLoaded(true);
    }).catch(error => { debug('snap.js gagal dimuat (' + (error instanceof Error ? error.message : 'unknown') + ')'); if (active) callbacks.current.onUnavailable(); });
    return () => { active = false; try { window.snap?.hide?.(); } catch { /* already closed */ } };
  }, [paymentUrl, config.clientKey, config.scriptUrl]);

  return <div className="vt-snap-frame">
    {!loaded && <div className="vt-snap-skeleton" aria-hidden="true"><i/><i/><i/><i/></div>}
    <div id="vartana-snap" className="vt-snap-host" aria-label="Pilihan metode pembayaran Midtrans"/>
  </div>;
}
