export function samePageSection(href:string,currentHref:string){
  try{
    const current=new URL(currentHref),target=new URL(href,current);
    if(target.origin!==current.origin||target.pathname!==current.pathname||target.search!==current.search||!target.hash)return null;
    const id=decodeURIComponent(target.hash.slice(1));
    return id?{id,hash:target.hash,url:target.pathname+target.search+target.hash}:null;
  }catch{return null;}
}
export function sectionScrollTop(sectionTop:number,scrollY:number,headerHeight:number){
  const top=sectionTop+scrollY-headerHeight-20;
  return Number.isFinite(top)?Math.max(0,Math.round(top)):0;
}
