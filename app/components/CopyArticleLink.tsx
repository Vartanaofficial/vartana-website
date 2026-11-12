'use client';
import {LocaleScope} from '@/app/components/SiteLanguage';
import {useState} from 'react';
export default function CopyArticleLink({slug}:{slug:string}){const [message,setMessage]=useState('');async function copy(){const url=new URL('/artikel/'+slug,location.origin).href;try{await navigator.clipboard.writeText(url);setMessage('Link disalin');}catch{setMessage(url);}}return <LocaleScope><div><button type="button" className="editorial-button secondary" onClick={()=>void copy()}>Salin link artikel</button>{message&&<p role="status" className="mt-2 break-all text-xs">{message}</p>}</div></LocaleScope>;}
