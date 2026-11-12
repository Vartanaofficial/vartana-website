import type {Metadata} from 'next';
import Link from 'next/link';
import EditorialHeader from '../../components/EditorialHeader';
import GameArena from '../GameArena';
import '../../editorial.css';
import '../../puzzle/puzzle.css';
import '../games.css';
export const metadata:Metadata={title:'Teka-teki Silang | VARTANA Games',description:'Isi TTS bertema rempah, pahlawan, atau pengetahuan umum dan kejar rekor terbaikmu.'};
export default function CrosswordPage(){return <main className="editorial puzzle-page"><EditorialHeader/><nav className="games-breadcrumb" aria-label="Navigasi game"><Link href="/games">Kembali ke semua games</Link></nav><GameArena game="crossword"/></main>;}
