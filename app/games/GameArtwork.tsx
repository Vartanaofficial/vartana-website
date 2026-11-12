'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {readClientJson} from '@/lib/client-reads';
import {defaultGameSettings,gameName,type GameKind,type GameSettings} from '@/lib/games';
import {productImageUrl} from '@/lib/product-image';

export default function GameArtwork({game,href}:{game:GameKind;href:string}){
 const [settings,setSettings]=useState<GameSettings>(defaultGameSettings(game));
 const [failed,setFailed]=useState(false);
 useEffect(()=>{let active=true;readClientJson<{settings:GameSettings}>(`/api/games?game=${game}`,5000).then(data=>{if(active){setSettings(data.settings);setFailed(false);}}).catch(()=>{});return()=>{active=false;};},[game]);
 const fallback=game==='puzzle'?'/vartana-spices-hero.jpg':`/games-${game}.svg`;
 const image=failed?fallback:game!=='puzzle'&&settings.imageUrl==='/vartana-spices-hero.jpg'?fallback:productImageUrl(settings.imageUrl)||fallback;
 return <Link className={`games-image games-artwork games-artwork-${game}`} href={href} aria-label={`Main ${gameName(game)}`}><img src={image} alt={settings.imageAlt} onError={()=>setFailed(true)}/><span className="games-artwork-badge">{game==='puzzle'?'01 / SUSUN GAMBAR':game==='numbers'?'02 / HITUNG ANGKA':'03 / TEKA-TEKI SILANG'}</span><span className="games-artwork-label">{gameName(game)}<small>{game==='puzzle'?'20 keping · Cocokkan setiap bentuk':game==='numbers'?'Jawab tepat · Kejar waktu terbaik':'Mendatar & menurun · Temukan jawabannya'}</small></span></Link>;
}
