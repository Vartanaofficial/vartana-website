"use client";
import {useEffect,useState} from 'react';
import Link from 'next/link';
import type {Article} from '@/lib/articles';
export default function ArticlePreview({english=false}:{english?:boolean}){const [articles,setArticles]=useState<Article[]>([]),[error,setError]=useState(false);useEffect(()=>{let cancelled=false;fetch('/api/articles',{cache:'no-store'}).then(r=>r.json()).then(d=>{if(!cancelled){setError(!d.success);setArticles(d.articles||[]);}}).catch(()=>{if(!cancelled)setError(true);});return()=>{cancelled=true;};},[]);return <div className="storefront-journal-preview">{articles.slice(0,3).map((a,i)=><Link href={'/artikel/'+a.slug} key={a.id}><span className="storefront-journal-number">0{i+1}</span><div><small>{a.category}</small><h3>{a.title}</h3><p>{a.excerpt}</p></div><span aria-hidden="true">↗</span></Link>)}{error&&<p className="text-sm text-[#617163]">{english?'Articles are temporarily unavailable.':'Artikel belum bisa dimuat. Coba lagi sebentar.'}</p>}</div>;}
