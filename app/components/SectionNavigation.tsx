'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import {useSiteLanguage} from './SiteLanguage';
import {samePageSection,sectionScrollTop} from '@/lib/section-navigation';

export default function SectionNavigation(){
  const pathname=usePathname();
  const {ready,language}=useSiteLanguage();
  useEffect(()=>{
    if(!ready)return;
    let frame=0,timer:ReturnType<typeof setTimeout>|undefined;
    function scroll(smooth:boolean,attempt=0){
      cancelAnimationFrame(frame);if(timer)clearTimeout(timer);
      frame=requestAnimationFrame(()=>{
        const target=samePageSection(location.href,location.href);
        if(!target)return;
        const section=document.getElementById(target.id);
        if(!section){if(attempt<10)timer=setTimeout(()=>scroll(smooth,attempt+1),80);return;}
        const header=document.querySelector('.public-header');
        const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({top:sectionScrollTop(section.getBoundingClientRect().top,window.scrollY,header?.getBoundingClientRect().height||0),behavior:smooth&&!reduced?'smooth':'instant'});
      });
    }
    function click(event:MouseEvent){
      if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
      const anchor=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
      if(!anchor||anchor.target==='_blank'||anchor.hasAttribute('download'))return;
      const target=samePageSection(anchor.href,location.href);
      if(!target)return;
      event.preventDefault();history.pushState(null,'',target.url);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
    const onHash=()=>scroll(true);
    document.addEventListener('click',click,true);window.addEventListener('hashchange',onHash);
    scroll(false);
    return()=>{cancelAnimationFrame(frame);if(timer)clearTimeout(timer);document.removeEventListener('click',click,true);window.removeEventListener('hashchange',onHash);};
  },[pathname,ready,language]);
  return null;
}
