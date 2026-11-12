"use client";
import { useEffect, useState } from "react";

export default function StorefrontMotion() {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("home");
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sections = [...document.querySelectorAll<HTMLElement>(".storefront section[id]")];
    const targets = [...document.querySelectorAll<HTMLElement>(".storefront section:not(#home) > div")];
    let observer: IntersectionObserver | undefined;
    if (!reduced.matches && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { (entry.target as HTMLElement).dataset.reveal = "visible"; observer?.unobserve(entry.target); }
      }), { threshold: 0.06 });
      targets.forEach(target => { target.dataset.reveal = "pending"; observer!.observe(target); });
    }
    let frame = 0;
    function update() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const height = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(height > 0 ? Math.min(1, window.scrollY / height) : 0);
        const current = sections.filter(section => section.getBoundingClientRect().top <= 180).at(-1);
        if (current) setActive(current.id);
      });
    }
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); cancelAnimationFrame(frame); observer?.disconnect(); targets.forEach(target => delete target.dataset.reveal); };
  }, []);
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>(".storefront nav a[href^='#'], .storefront .public-header a[href^='/#']");
    links.forEach(link => { if (link.hash === `#${active}`) link.setAttribute("aria-current", "location"); else link.removeAttribute("aria-current"); });
  }, [active]);
  return <><div aria-hidden="true" className="storefront-scroll-progress" style={{ transform: `scaleX(${progress})` }} />{progress > .12 && <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} className="storefront-back-top" aria-label="Kembali ke atas"><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m6 11 6-6 6 6M12 5v14"/></svg></button>}</>;
}
