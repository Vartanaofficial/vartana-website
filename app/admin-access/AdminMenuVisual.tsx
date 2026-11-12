type Visual = {image:string; paths:string; category:string; tone:string};

function visualFor(href:string):Visual {
  if(href.includes('members'))return {image:'/vartana-spices-hero.jpg',paths:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',category:'CUSTOMER RELATIONS',tone:'sage'};
  if(href.includes('games'))return {image:'/vartana-spices-hero.jpg',paths:'M7 7h10a4 4 0 0 1 4 4l1 6a2 2 0 0 1-3 2l-3-3H8l-3 3a2 2 0 0 1-3-2l1-6a4 4 0 0 1 4-4M6 10v5M3.5 12.5h5M16 11h.1M19 14h.1',category:'PLAY & CONNECT',tone:'gold'};
  if(href.includes('articles'))return {image:'/vartana-spices-hero.jpg',paths:'M4 3h7l2 2 2-2h5v17h-5l-2 1-2-1H4zM13 5v16M7 8h3M7 12h3M16 9h1M16 13h1',category:'STORIES & EDITORIAL',tone:'oat'};
  if(href.includes('production'))return {image:'/Kemasan Vartana Signature Blend Herbal.png',paths:'M3 21V9l6 3V6l6 6V3h6v18H3M7 16h1M12 16h1M17 16h1',category:'CRAFT & PRODUCTION',tone:'sage'};
  if(href.includes('stock')||href.includes('view=stock'))return {image:'/Stoples Teh Herbal Vartana.png',paths:'m3 7 9-5 9 5v10l-9 5-9-5V7m0 0 9 5 9-5M12 12v10M7 4l10 5',category:'INVENTORY & SUPPLY',tone:'oat'};
  if(href.includes('reports'))return {image:'/Vartana Botanical Wellness Tea Collection.png',paths:'M4 3h16v18H4zM8 16v-3M12 16V7M16 16v-6M8 19h8',category:'INSIGHTS & GROWTH',tone:'gold'};
  if(href.includes('promos'))return {image:'/golden-turmeric.png',paths:'M20 13 13 20a2 2 0 0 1-3 0l-7-7V4h9l8 6a2 2 0 0 1 0 3ZM7 8h.1M11 15l5-5M11 10h.1M16 15h.1',category:'CAMPAIGNS & REWARDS',tone:'gold'};
  if(href.includes('operations'))return {image:'/morning-energy.png',paths:'M3 4h12v13H3zM15 9h4l3 4v4h-7M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4',category:'ORDERS & DELIVERY',tone:'sage'};
  if(href.includes('konsinyasi'))return {image:'/Vartana Botanical Wellness Tea Collection.png',paths:'M3 10V6l4-3h10l4 3v4H3M5 10v11h14V10M9 21v-7h6v7M3 6h18',category:'PARTNERS & OPPORTUNITY',tone:'oat'};
  if(href.includes('master-product'))return {image:'/signature-blend-vartana.png',paths:'m3 7 9-5 9 5v10l-9 5-9-5V7m0 0 9 5 9-5M12 12v10M7 4l10 5',category:'PRODUCT COLLECTION',tone:'sage'};
  return {image:'/Vartana Botanical Wellness Tea Collection.png',paths:'M3 3h7v8H3zM14 3h7v5h-7zM3 15h7v6H3zM14 12h7v9h-7z',category:'BUSINESS OVERVIEW',tone:'gold'};
}

export default function AdminMenuVisual({href}:{href:string}) {
  const visual=visualFor(href);
  return <div className={'admin-menu-visual tone-'+visual.tone} aria-hidden="true">
    <img src={visual.image} alt="" loading="lazy"/>
    <span className="admin-menu-orbit"/>
    <span className="admin-menu-symbol"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"><path d={visual.paths}/></svg></span>
    <span className="admin-menu-category">{visual.category}</span>
  </div>;
}
