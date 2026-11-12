import type { Metadata } from 'next';
import Link from 'next/link';
import EditorialHeader from '../components/EditorialHeader';
import PuzzleGame from './PuzzleGame';
import '../editorial.css';
import './puzzle.css';
import '../games/games.css';

export const metadata: Metadata = { title: 'Puzzle Rempah | VARTANA', description: 'Susun puzzle rempah 20 keping dan raih voucher belanja Rp20.000 untuk member VARTANA.' };
export default function PuzzlePage() {
  return <main className="editorial puzzle-page"><EditorialHeader/><nav aria-label="Navigasi game" style={{maxWidth:1180,margin:'24px auto 0',padding:'0 28px',fontSize:13}}><Link href="/games">← Semua games</Link></nav><PuzzleGame/></main>;
}
