'use client';
import {useEffect,useState} from 'react';
import {readClientJson} from '@/lib/client-reads';
import {rewardDescription,type GameKind,type GameSettings} from '@/lib/games';
export default function GameRewardPreview({game}:{game:GameKind}){
 const [settings,setSettings]=useState<GameSettings|null>(null);
 useEffect(()=>{let active=true;readClientJson<{settings:GameSettings}>(`/api/games?game=${game}`,5000).then(d=>{if(active)setSettings(d.settings);}).catch(()=>{});return()=>{active=false;};},[game]);
 return <div className="games-reward"><span>HADIAH SESUAI TANTANGAN</span><strong>{settings?rewardDescription(settings.reward):'Lihat hadiah di halaman permainan'}</strong>{settings&&<p>{settings.reward.type==='none'?'Main dan kejar rekor terbaikmu.':`${settings.reward.minSpend?'Minimum belanja Rp'+settings.reward.minSpend.toLocaleString('id-ID'):'Tanpa minimum belanja'} · berlaku ${settings.reward.days} hari · sekali per member untuk seluruh game.`}</p>}</div>;
}
