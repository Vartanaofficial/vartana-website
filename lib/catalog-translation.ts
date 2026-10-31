import type { Product } from "./products";
import {requestMasterScript} from "./master-products";
// Public product copy only; customer/order data never enters the translation service.
export async function translateCatalog(products:Product[]):Promise<{products:Product[];pending:number}>{

 const fields=new Set(['name','subtitle','size','brewingInstructions','quantityInfo','description','difference','benefit','taste','aroma','ingredients']);
 const texts=new Set<string>();
 function collect(value:unknown,field=''):void{
  if(typeof value==='string'){if(fields.has(field)&&value.trim())texts.add(value);return;}
  if(Array.isArray(value)){value.forEach(v=>collect(v,field));return;}
  if(value&&typeof value==='object'){const o=value as Record<string,unknown>;if(typeof o.id==='string'&&typeof o.en==='string'){if(o.id.trim())texts.add(o.id);return;}Object.entries(o).forEach(([k,v])=>collect(v,k));}
 }
 products.forEach(p=>collect(p));
 const data=await requestMasterScript('getCatalogTranslations');
 if(data.translationVersion!==1||!data.translations)throw Error('Perbarui Apps Script untuk terjemahan otomatis.');
 const dictionary=new Map<string,string>(Object.entries(data.translations).filter((entry):entry is [string,string]=>typeof entry[1]==='string'));
 const pending=[...texts].filter(text=>!dictionary.has(text)).length;
 function apply(value:unknown,field=''):unknown{
  if(typeof value==='string')return fields.has(field)?dictionary.get(value)||value:value;
  if(Array.isArray(value))return value.map(v=>apply(v,field));
  if(value&&typeof value==='object'){const o=value as Record<string,unknown>;if(typeof o.id==='string'&&typeof o.en==='string')return {...o,en:dictionary.get(o.id)||o.en};return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,apply(v,k)]));}
  return value;
 }
 return {products:products.map(p=>apply(p) as Product),pending};
}
