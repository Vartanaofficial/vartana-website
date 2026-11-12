# VARTANA Games v3

## Menu

- Publik: /games. Pilih Puzzle Rempah (/puzzle) atau Hitungan Angka (/games/angka).
- Admin: /admin/games, melalui menu Games > Pengaturan & simulasi.
- Pemain cukup mengisi nama, WhatsApp aktif dan email. Tidak perlu pernah berbelanja. Identitas tersimpan sebelum tantangan ditampilkan.

## Puzzle dan pengaturan

Puzzle berbentuk 20 keping, 5 kolom x 4 baris. Pilih keping dari baki acak, lalu klik tempatnya pada papan. Klik keping terpasang untuk melepas atau menggantinya. Gambar acuan selalu terlihat. Susunan diperiksa server; jika keliru pemain dapat memperbaiki selama waktu belum habis.

Admin dapat mengaktifkan game, mengatur durasi 30-1800 detik, menempel link foto Drive/HTTPS, dan memberi deskripsi foto. Untuk Drive, unggah foto dan gunakan akses Siapa saja yang memiliki link / Pelihat. Link gambar menggunakan proxy gambar Drive yang sudah ada pada website.

Hitungan Angka memiliki penjumlahan, pengurangan, dan perkalian. Admin dapat mengatur 5-30 soal dan durasi. Pengaturan awal kedua game: 120 detik; angka 10 soal.

Simulasi admin memakai komponen puzzle yang sama dan aturan angka yang setara, mengikuti form yang sedang diedit. Simulasi tidak menulis peserta, ranking, atau voucher.

Setiap penyimpanan pengaturan membuat revisi tantangan baru. Ranking hanya membandingkan revisi aktif; percobaan lama tetap tersimpan. Permainan yang sudah dimulai memakai salinan pengaturan saat mulai sehingga perubahan admin tidak memotong waktu pemain.

## Spreadsheet

- GameSettings: pengaturan dan revisi tiap game.
- GamePlayers: peserta per WhatsApp, nama, email, waktu daftar/perubahan.
- GameAttempts: satu baris per percobaan, identitas lengkap, game, waktu mulai/tenggat/selesai, durasi, status, skor dan rincian jawaban/susunan dalam Result JSON. Memulai ulang menambah percobaan baru, bukan menimpa riwayat sebelumnya.
- PuzzleVouchers: voucher hadiah yang diterbitkan sekali per member atau WhatsApp untuk seluruh game.
- Orders: pemakaian voucher tercatat bersama order di kolom Puzzle Voucher Code dan Order Key.

Status percobaan: STARTED, WON, FAILED (jawaban angka keliru), atau EXPIRED. Percobaan yang ditinggal tetap tersimpan; tenggat direkonsiliasi pada permintaan berikutnya. Rincian yang dikirim saat pemeriksaan/selesai/waktu habis dicatat. Tidak mengirim setiap klik ke Google agar interaksi puzzle tetap cepat.

Admin menampilkan 100 percobaan terakhir beserta kontak lengkap; seluruh riwayat tersedia di spreadsheet. Ranking publik hanya menerima nama, WhatsApp dan email yang sudah disamarkan pada server, serta durasi. Satu rekor terbaik per WhatsApp per game/revisi; urutan waktu tercepat lalu waktu selesai paling awal. Maksimal 50 peringkat ditampilkan.

## Voucher

Rp20.000 tanpa minimum belanja, tepat 7 x 24 jam sejak kemenangan pertama, sekali per member/WhatsApp untuk seluruh game. Bermain lagi boleh untuk memperbaiki ranking tetapi tidak menambah hadiah. Potongan maksimal harga produk, tidak termasuk ongkir, tidak dapat digabung promo lain, dan sisa nilai tidak disimpan. Voucher terpakai saat order dibuat. Retry order tidak memakai voucher lagi; pembatalan tidak otomatis mengembalikannya.

Waktu dan hasil diperiksa server. Identitas berupa data yang diisi pemain, belum OTP; ranking tidak mengklaim sebagai sistem anti-bot atau bukti kepemilikan nomor/email.

## Status pemasangan

Backend website sudah diperbarui ke versi 58 pada 11 November 2026. Endpoint live mengembalikan gamesVersion: 3 dan permintaan status bertanda tangan berhasil. Tidak membuat peserta, order, atau voucher uji pada spreadsheet produksi. Langkah berikut untuk pemasangan ulang di masa depan.

## Pemasangan backend

Gunakan file LENGKAP VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt. Ganti seluruh kode lama, Save, kemudian Deploy > Manage deployments > pilih Web app website > Edit > New version > Deploy. Save kode saja tidak mengubah deployment. Jangan tempel sebagai duplikat kode lama.

Script property VARTANA_ARTICLE_ADMIN_KEY harus sama dengan ADMIN_SESSION_SECRET server website, minimal 32 karakter. Ini juga digunakan CMS artikel. Jangan masukkan rahasia ke variabel NEXT_PUBLIC.

setupGames dapat dijalankan dari editor untuk menyiapkan tab; tab juga dibuat otomatis oleh permintaan Games yang sah. getGameCapabilities harus mengembalikan gamesVersion: 3. Website memeriksanya sebelum mengirim permintaan game agar deployment lama tidak salah memproses game sebagai pesanan.

## Pemeriksaan

node --test tests/*.test.cjs
npx tsc --noEmit
npm run build

Uji permainan berhadiah pada spreadsheet pengujian. Simulasi admin tersedia untuk memeriksa foto dan mekanik tanpa menerbitkan voucher produksi.
