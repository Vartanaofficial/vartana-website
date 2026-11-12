import type { Metadata } from 'next';
import Link from 'next/link';
import EditorialHeader from '../components/EditorialHeader';
import GameLeaderboard from './GameLeaderboard';
import GameRewardPreview from './GameRewardPreview';
import GameArtwork from './GameArtwork';
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
        <GameArtwork game="puzzle" href="/puzzle"/>
        <div className="games-copy">
          <span className="editorial-eyebrow">01 / PUZZLE GAMBAR</span>
          <h2>Puzzle Rempah</h2>
          <p>Susun gambar dari 20 keping berbentuk puzzle. Pilih satu keping lalu tempatkan pada papan, sambil mencocokkan gambar acuan.</p>
          <ul className="games-tags" aria-label="Detail permainan"><li>20 keping</li><li>Susunan benar</li><li>Ranking tercepat</li></ul>
          <GameRewardPreview game="puzzle"/>
          <Link className="editorial-button" href="/puzzle">Main Puzzle Rempah <span aria-hidden="true">→</span></Link>
          <p className="games-note">Lihat cara main dan ketentuan lengkap di halaman permainan.</p>
        </div>
      </article>
      <article className="games-feature">
        <GameArtwork game="numbers" href="/games/angka"/>
        <div className="games-copy"><span className="editorial-eyebrow">02 / TANTANGAN BERHITUNG</span><h2>Hitungan Angka</h2><p>Soal penjumlahan, pengurangan, dan perkalian. Jawab semuanya dengan benar dan lihat posisimu di papan rekor.</p><ul className="games-tags" aria-label="Detail permainan"><li>Jumlah soal diatur admin</li><li>Waktu diatur admin</li><li>Jawaban benar & waktu</li></ul><GameRewardPreview game="numbers"/><Link className="editorial-button" href="/games/angka">Main Hitungan Angka <span aria-hidden="true">→</span></Link><p className="games-note">Boleh bermain lagi untuk memperbaiki rekor. Nama tampil, kontak disamarkan.</p></div>
      </article>
      <article className="games-feature"><GameArtwork game="crossword" href="/games/tts"/><div className="games-copy"><span className="editorial-eyebrow">03 / TEKA-TEKI SILANG</span><h2>Teka-teki Silang</h2><p>Isi kotak dengan petunjuk seputar rempah, pahlawan, atau pengetahuan umum. Tema, bank soal, waktu, dan hadiah diatur admin.</p><ul className="games-tags"><li>3 pilihan tema admin</li><li>Petunjuk mendatar & menurun</li><li>Jawaban benar & waktu</li></ul><GameRewardPreview game="crossword"/><Link className="editorial-button" href="/games/tts">Main TTS <span aria-hidden="true">&rarr;</span></Link></div></article>
    </section>
    <GameLeaderboard game="crossword"/>
    <GameLeaderboard game="puzzle"/>
    <GameLeaderboard game="numbers"/>
    <footer className="editorial-footer">Selesai bermain? <Link href="/katalog">Temukan racikan favoritmu di katalog.</Link></footer>
  </main>;
}
