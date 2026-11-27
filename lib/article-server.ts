import {cache} from 'react';
import {requestMasterScript} from './master-products';
import {staleWhileRevalidate} from './swr-cache';
import {mergeArticles,starterArticles,validateArticle,type Article} from './articles';

async function loadPublishedArticles(){
 const data=await requestMasterScript('getArticles');
 if(data.articleVersion!==1)return {articles:starterArticles,backendReady:false,unavailable:false};
 const stored=(Array.isArray(data.articles)?data.articles:[]).map((a:unknown)=>validateArticle(a)).filter((a:Article)=>a.status==='PUBLISHED'),hidden=new Set<string>(data.hiddenSlugs||[]);
 return {articles:mergeArticles(stored,starterArticles).filter(a=>!hidden.has(a.slug)),backendReady:true,unavailable:false};
}

// Article pages no longer wait on Google for every visit: a recent copy is served immediately
// while one background refresh runs. Admin edits appear within about a minute.
export const readPublishedArticles=cache(async()=>{
 try{return await staleWhileRevalidate('articles:published',loadPublishedArticles,{fresh:60_000,maxStale:10*60_000});}
 catch{return {articles:[] as Article[],backendReady:false,unavailable:true};}
});
