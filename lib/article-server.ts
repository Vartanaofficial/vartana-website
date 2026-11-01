import {cache} from 'react';
import {requestMasterScript} from './master-products';
import {mergeArticles,starterArticles,validateArticle,type Article} from './articles';
export const readPublishedArticles=cache(async()=>{
 try{const data=await requestMasterScript('getArticles');if(data.articleVersion!==1)return {articles:starterArticles,backendReady:false,unavailable:false};const stored=(Array.isArray(data.articles)?data.articles:[]).map((a:unknown)=>validateArticle(a)).filter((a:Article)=>a.status==='PUBLISHED'),hidden=new Set<string>(data.hiddenSlugs||[]);return {articles:mergeArticles(stored,starterArticles).filter(a=>!hidden.has(a.slug)),backendReady:true,unavailable:false};}
 catch{return {articles:[] as Article[],backendReady:false,unavailable:true};}
});
