'use client';
import {Children,Fragment,cloneElement,createContext,isValidElement,useContext,useEffect,useMemo,useState,type ReactNode,type ReactElement} from 'react';
import {LANGUAGE_STORAGE_KEY,validSiteLanguage,translateSiteText,type SiteLanguage} from '@/lib/site-language';

const LanguageContext=createContext<{language:SiteLanguage;ready:boolean;translations:Record<string,string>;setLanguage:(language:SiteLanguage)=>void}>({language:'id',ready:false,translations:{},setLanguage:()=>{}});
export function SiteLanguageProvider({children,initialLanguage='id'}:{children:ReactNode;initialLanguage?:SiteLanguage}){
  const [language,setCurrent]=useState<SiteLanguage>(initialLanguage);
  const [ready,setReady]=useState(false);
  const [translations,setTranslations]=useState<Record<string,string>>({});
  useEffect(()=>{
    try{setCurrent(validSiteLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)));}catch{}
    setReady(true);
    const sync=(event:StorageEvent)=>{if(event.key===LANGUAGE_STORAGE_KEY)setCurrent(validSiteLanguage(event.newValue));};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  useEffect(()=>{document.documentElement.lang=language;},[language]);
  useEffect(()=>{
    if(!ready||language!=='en')return;
    const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
    async function load(attempt=0){
      try{
        const response=await fetch('/api/public-translations',{signal:controller.signal});
        const data=await response.json();
        if(!controller.signal.aborted&&data.success&&data.translations){setTranslations(data.translations);if(data.pending&&attempt<4)timer=setTimeout(()=>void load(attempt+1),5000);}
      }catch{/* Core UI translations remain available even if editorial translation is pending. */}
    }
    void load();return()=>{controller.abort();if(timer)clearTimeout(timer);};
  },[ready,language]);
  const value=useMemo(()=>({language,ready,translations,setLanguage:(next:SiteLanguage)=>{
    setCurrent(next);try{localStorage.setItem(LANGUAGE_STORAGE_KEY,next);}catch{}
    document.cookie='vartana_lang='+next+'; Path=/; Max-Age=31536000; SameSite=Lax';
  }}),[language,ready,translations]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useSiteLanguage(){return useContext(LanguageContext);}

// Render-time localization preserves links, form values, event handlers, IDs,
// and React keys. It never edits DOM nodes or sends customer data to a service.
function localize(node:ReactNode,language:SiteLanguage,translations:Record<string,string>):ReactNode{
  if(typeof node==='string')return translateSiteText(node,language,translations);
  if(!isValidElement(node))return node;
  const element=node as ReactElement<Record<string,unknown>>;
  if(element.type===LocaleScope||element.props['data-no-translate']!==undefined||element.props.translate==='no')return element;
  if(typeof element.type==='string'&&['script','style','textarea','code','pre'].includes(element.type))return element;
  const props:Record<string,unknown>={};
  for(const name of ['placeholder','title','aria-label','alt']){
    if(typeof element.props[name]==='string')props[name]=translateSiteText(element.props[name] as string,language,translations);
  }
  if(element.props.children!==undefined)props.children=Children.map(element.props.children as ReactNode,child=>localize(child,language,translations));
  return cloneElement(element,props);
}
export function LocaleScope({children}:{children:ReactNode}){
  const {language,translations}=useSiteLanguage();
  return <Fragment>{Children.map(children,child=>localize(child,language,translations))}</Fragment>;
}
export function LanguageToggle(){
  const {language,setLanguage}=useSiteLanguage();
  return <div className="site-language-toggle" role="group" aria-label="Language / Bahasa" data-no-translate>
    <button type="button" aria-pressed={language==='id'} onClick={()=>setLanguage('id')} lang="id">ID</button>
    <button type="button" aria-pressed={language==='en'} onClick={()=>setLanguage('en')} lang="en">EN</button>
  </div>;
}
