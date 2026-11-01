import Link from 'next/link';
import Inventory from '../dashboard/Inventory';
export default function StocktakePage(){return <main className="mx-auto max-w-7xl p-4 sm:p-8"><nav aria-label="Navigasi stok opname" className="admin-back-links"><Link href="/admin/dashboard?view=stock"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h14"/></svg>Kembali ke persediaan</Link><Link href="/admin/dashboard">Dashboard</Link></nav><Inventory team/></main>;}
