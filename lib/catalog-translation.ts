import { unstable_cache } from "next/cache";
﻿import type { Product } from "./products";
// Public product copy only; customer/order data never enters the translation service.
export async function translateCatalog(products:Product[]):Promise<Product[]>{

 const fields=new Set(['name','subtitle','size','brewingInstructions','quantityInfo','description','difference','benefit','taste','aroma','ingredients']);
 const texts=new Set<string>();
 function collect(value:unknown,field=''):void{
  if(typeof value==='string'){if(fields.has(field)&&value.trim())texts.add(value);return;}
  if(Array.isArray(value)){value.forEach(v=>collect(v,field));return;}
  if(value&&typeof value==='object'){const o=value as Record<string,unknown>;if(typeof o.id==='string'&&typeof o.en==='string'){if(o.id.trim())texts.add(o.id);return;}Object.entries(o).forEach(([k,v])=>collect(v,k));}
 }
 products.forEach(p=>collect(p));const all=[...texts],dictionary=new Map<string,string>();
 for(let start=0;start<all.length;start+=6){
  await Promise.all(all.slice(start,start+6).map(async text=>dictionary.set(text,await translateText(text))));
 }
 function apply(value:unknown,field=''):unknown{
  if(typeof value==='string')return fields.has(field)?dictionary.get(value)||value:value;
  if(Array.isArray(value))return value.map(v=>apply(v,field));
  if(value&&typeof value==='object'){const o=value as Record<string,unknown>;if(typeof o.id==='string'&&typeof o.en==='string')return {...o,en:dictionary.get(o.id)||o.en};return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,apply(v,k)]));}
  return value;
 }
 return products.map(p=>apply(p) as Product);
}

export function translationChunks(text:string):string[]{
 const parts:string[]=[];let current='';const encoder=new TextEncoder();
 for(const char of text){if(encoder.encode(current+char).length>450){const space=current.lastIndexOf(' ');if(space>0){parts.push(current.slice(0,space));current=current.slice(space+1);}else{parts.push(current);current='';}}current+=char;}
 if(current)parts.push(current);return parts;
}
const translateText=unstable_cache(async(text:string)=>{
 const result:string[]=[];
 for(const part of translationChunks(text)){
  const url=new URL('https://api.mymemory.translated.net/get');url.searchParams.set('q',part);url.searchParams.set('langpair','id|en');url.searchParams.set('de','vartana@vartanaglobal.com');
  const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Translation service unavailable');
  const data=await response.json();
  if(Number(data.responseStatus)!==200||data.quotaFinished||typeof data.responseData?.translatedText!=='string')throw Error('Free translation limit reached');
  result.push(data.responseData.translatedText.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
 }
 return result.join(' ');
},['vartana-free-id-en-v1'],{revalidate:2592000});
