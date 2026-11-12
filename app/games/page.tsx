import type { Metadata } from 'next';
import Link from 'next/link';
import EditorialHeader from '../components/EditorialHeader';
import GameLeaderboard from './GameLeaderboard';
import '../editorial.css';
import '../puzzle/puzzle.css';
import './games.css';

export const metadata: Metadata = {
  title: 'Games | VARTANA',
  description: 'Ambil jeda, mainkan game rempah VARTANA, dan raih hadiah untuk belanja berikutnya.',
};

export default function GamesPage() {
  return <main className="editorial games-page">
    <EditorialHeader/>
    <section className="games-intro">
      <span className="editorial-eyebrow">RUANG BERMAIN VARTANA</span>
      <h1>Ambil jeda.<br/><em>Yuk, main sebentar.</em></h1>
      <p>Permainan kecil dengan cerita rempah di dalamnya. Pilih tantanganmu, nikmati prosesnya, dan bawa pulang hadiah untuk seduhan berikutnya.</p>
    </section>
    <section className="games-list" aria-label="Pilihan game">
      <article className="games-feature">
        <Link className="games-image" href="/puzzle" aria-label="Buka game Puzzle Rempah"><img src="/vartana-spices-hero.jpg" alt="Jahe, kunyit, serai, dan aneka rempah untuk puzzle VARTANA"/></Link>
        <div className="games-copy">
          <span className="editorial-eyebrow">01 / PUZZLE GESER</span>
          <h2>Puzzle Rempah</h2>
          <p>Susun gambar dari 20 keping berbentuk puzzle. Pilih satu keping lalu tempatkan pada papan, sambil mencocokkan gambar acuan.</p>
          <ul className="games-tags" aria-label="Detail permainan"><li>20 keping</li><li>Waktu diatur admin</li><li>Ranking tercepat</li></ul>
          <div className="games-reward"><span>HADIAH JIKA BERHASIL</span><strong>Voucher Rp20.000</strong><p>Tanpa minimum belanja · berlaku 7 hari · sekali per member.</p></div>
          <Link className="editorial-button" href="/puzzle">Main Puzzle Rempah <span aria-hidden="true">→</span></Link>
          <p className="games-note">Lihat cara main dan ketentuan lengkap di halaman permainan.</p>
        </div>
      </article>
      <article className="games-feature">
        <Link className="games-image games-math-preview" href="/games/angka" aria-label="Buka game Hitungan Angka"><span>12 + 8</span><strong>7 × 6</strong><span>45 − 17</span><p>Asah pikiran, kejar rekor.</p></Link>
        <div className="games-copy"><span className="editorial-eyebrow">02 / TANTANGAN BERHITUNG</span><h2>Hitungan Angka</h2><p>Sepuluh soal penjumlahan, pengurangan, dan perkalian. Jawab semuanya dengan benar dan lihat posisimu di papan rekor.</p><ul className="games-tags" aria-label="Detail permainan"><li>10 soal</li><li>Waktu diatur admin</li><li>Ranking tercepat</li></ul><div className="games-reward"><span>HADIAH PERTAMA KALI BERHASIL</span><strong>Voucher Rp20.000</strong><p>Satu hadiah per member untuk seluruh game · berlaku 7 hari.</p></div><Link className="editorial-button" href="/games/angka">Main Hitungan Angka <span aria-hidden="true">→</span></Link><p className="games-note">Boleh bermain lagi untuk memperbaiki rekor. Nama tampil, kontak disamarkan.</p></div>
      </article>
    </section>
    <GameLeaderboard game="puzzle"/>
    <GameLeaderboard game="numbers"/>
    <footer className="editorial-footer">Selesai bermain? <Link href="/katalog">Temukan racikan favoritmu di katalog.</Link></footer>
  </main>;
}
