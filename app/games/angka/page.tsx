import type {Metadata} from 'next';
import Link from 'next/link';
import EditorialHeader from '../../components/EditorialHeader';
import GameArena from '../GameArena';
import '../../editorial.css';
import '../../puzzle/puzzle.css';
import '../games.css';
export const metadata:Metadata={title:'Hitungan Angka | VARTANA Games',description:'Jawab 10 soal angka dalam 2 menit dan kejar rekor tercepat di VARTANA Games.'};
export default function NumbersPage(){return <main className="editorial puzzle-page"><EditorialHeader/><nav className="games-breadcrumb" aria-label="Navigasi game"><Link href="/games">← Semua games</Link></nav><GameArena game="numbers"/></main>;}
