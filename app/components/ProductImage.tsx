'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  errorMessage?: string;
  loading?: "lazy" | "eager";
};

function ImageContent({ src, alt, className, errorMessage, loading }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => { const image=imageRef.current; if(image?.complete&&image.naturalWidth>0)setLoaded(true); }, []);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const retrySrc = attempt && src.startsWith("/api/product-image?") ? `${src}&retry=${attempt}` : src;
  if (!src || failed) {
    return <LocaleScope><div className={`${className || ""} flex flex-col items-center justify-center gap-1 overflow-hidden text-center text-[10px] text-[#657365]`}>
      <span role="img" aria-label={alt}>{errorMessage || "Gambar belum tersedia"}</span>
      {src && <button type="button" aria-label={`Muat ulang gambar ${alt}`} onClick={() => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); }} className="underline">Coba lagi</button>}
    </div></LocaleScope>;
  }
  return <LocaleScope><div aria-busy={!loaded} className={`${className || ""} relative overflow-hidden`}>
    {!loaded && <span role="status" aria-label={`Memuat gambar ${alt}`} className="absolute inset-0 flex items-center justify-center bg-[#FBF9F4] text-[10px] text-[#657365]">Memuat…</span>}
    <img ref={imageRef} key={retrySrc} src={retrySrc} alt={alt} className={`h-full w-full object-contain ${loaded ? "opacity-100" : "opacity-0"}`} loading={loading} referrerPolicy="no-referrer" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
  </div></LocaleScope>;
}

export default function ProductImage(props: Props) {
  return <LocaleScope><ImageContent key={props.src} {...props} /></LocaleScope>;
}
