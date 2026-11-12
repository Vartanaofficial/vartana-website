# VARTANA Games v3

## Menu

- Publik: /games. Pilih Puzzle Rempah (/puzzle), Hitungan Angka (/games/angka), atau TTS (/games/tts).
- Admin: /admin/games, melalui menu Games > Pengaturan & simulasi.
- Pemain cukup mengisi nama, WhatsApp aktif dan email. Tidak perlu pernah berbelanja. Identitas tersimpan sebelum tantangan ditampilkan.

## Puzzle dan pengaturan

Puzzle berbentuk 20 keping, 5 kolom x 4 baris. Pilih keping dari baki acak, lalu klik tempatnya pada papan. Klik keping terpasang untuk melepas atau menggantinya. Gambar acuan selalu terlihat. Susunan diperiksa server; jika keliru pemain dapat memperbaiki selama waktu belum habis.

Saat bermain, cerita pembuka disembunyikan dan halaman diarahkan ke arena. Laptop/tablet memakai papan dan baki berdampingan. HP memakai papan ringkas dan baki dua baris yang dapat digeser ke samping; pilihan keping tetap tersimpan saat baki digeser. Timer tetap terlihat di arena.

Admin dapat mengaktifkan game, mengatur durasi 30-1800 detik, menempel link foto Drive/HTTPS, dan memberi deskripsi foto. Untuk Drive, unggah foto dan gunakan akses Siapa saja yang memiliki link / Pelihat. Link gambar menggunakan proxy gambar Drive yang sudah ada pada website.

Hitungan Angka memiliki penjumlahan, pengurangan, dan perkalian. Admin dapat mengatur 5-30 soal dan durasi. Pengaturan awal kedua game: 120 detik; angka 10 soal.

TTS memiliki tema Rempah, Pahlawan, dan Pengetahuan Umum. Admin memilih tema, memuat soal contoh, lalu dapat mengedit 3–15 jawaban unik (2–15 huruf) dan petunjuk. Papan beserta nomor mendatar/menurun dibuat otomatis dengan mesin yang sama pada simulator dan Apps Script. Tema aktif ditentukan admin. Pemain memilih petunjuk atau kotak; huruf otomatis maju, panah dan Backspace dapat digunakan. Jawaban salah dapat diperbaiki sampai waktu habis. Respons publik tidak memuat jawaban; jawaban tersimpan pada percobaan privat di spreadsheet.

Simulasi admin memakai komponen puzzle yang sama dan aturan angka yang setara, mengikuti form yang sedang diedit. Simulasi tidak menulis peserta, ranking, atau voucher.

Setiap penyimpanan pengaturan membuat revisi tantangan baru. Ranking hanya membandingkan revisi aktif; percobaan lama tetap tersimpan. Permainan yang sudah dimulai memakai salinan pengaturan saat mulai sehingga perubahan admin tidak memotong waktu pemain.

## Spreadsheet

- GameSettings: pengaturan dan revisi tiap game.
- GamePlayers: peserta per WhatsApp, nama, email, waktu daftar/perubahan.
- GameAttempts: satu baris per percobaan, identitas lengkap, game, waktu mulai/tenggat/selesai, durasi, status, skor dan rincian jawaban/susunan dalam Result JSON. Memulai ulang menambah percobaan baru, bukan menimpa riwayat sebelumnya.
- PuzzleVouchers: kode hadiah yang diterbitkan sekali per member atau WhatsApp untuk seluruh game. Kolom tambahan Reward JSON menyimpan ketentuan saat kode diterbitkan; lima kolom lama dipertahankan.
- Orders: pemakaian voucher tercatat bersama order di kolom Puzzle Voucher Code dan Order Key.

Status percobaan: STARTED, WON, FAILED (jawaban angka keliru), atau EXPIRED. Percobaan yang ditinggal tetap tersimpan; tenggat direkonsiliasi pada permintaan berikutnya. Rincian yang dikirim saat pemeriksaan/selesai/waktu habis dicatat. Tidak mengirim setiap klik ke Google agar interaksi puzzle tetap cepat.

Admin menampilkan 100 percobaan terakhir beserta kontak lengkap; seluruh riwayat tersedia di spreadsheet. Ranking publik hanya menerima nama, WhatsApp dan email yang sudah disamarkan pada server, serta durasi. Satu rekor terbaik per WhatsApp per game/revisi; urutan waktu tercepat lalu waktu selesai paling awal. Maksimal 50 peringkat ditampilkan.

## Voucher

Admin dapat memilih potongan rupiah, diskon persen, potongan ongkir, bonus produk aktif, atau tanpa hadiah. Nominal/persen, jumlah bonus, masa berlaku 1–365 hari, minimum belanja dan batas potongan dapat diatur per game. Nilai awal tetap Rp20.000, tanpa minimum, 7 hari sampai admin menggantinya.

Ketentuan disalin saat percobaan dimulai dan disimpan pada kode saat menang. Perubahan admin tidak mengubah kode atau percobaan lama. Kode lama yang belum memiliki Reward JSON tetap bernilai Rp20.000. Bonus produk masuk sebagai barang gratis saat checkout, ikut perhitungan berat dan pengurangan stok saat pesanan diproses. Produk harus tetap tersedia di katalog saat kode dipakai.

Sekali per member/WhatsApp untuk seluruh game. Bermain lagi boleh untuk memperbaiki ranking tetapi tidak menambah hadiah. Kode tidak dapat digabung promo lain; sisa nilai tidak disimpan. Hadiah terpakai saat order dibuat. Retry order tidak memakai hadiah lagi; pembatalan tidak otomatis mengembalikannya. Mode tanpa hadiah hanya mencatat rekor.

Waktu dan hasil diperiksa server. Identitas berupa data yang diisi pemain, belum OTP; ranking tidak mengklaim sebagai sistem anti-bot atau bukti kepemilikan nomor/email.

## Status pemasangan

Backend website sudah diperbarui ke versi 60 pada 12 November 2026. Endpoint live mengembalikan gamesVersion: 3 dan permintaan status bertanda tangan berhasil. Tidak membuat peserta, order, atau voucher uji pada spreadsheet produksi. Langkah berikut untuk pemasangan ulang di masa depan.

Revisi 12 November menambahkan hadiah yang dapat diatur, TTS, dan arena puzzle responsif. Untuk pengembangan backend: setelah mengedit lib/crossword.ts atau fragmen Games, jalankan `node scripts/sync-games-backend.cjs`. Mesin TTS di Apps Script dan file TXT lengkap diperbarui dari sumber yang sama.

## Pemasangan backend

Gunakan file LENGKAP VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt. Ganti seluruh kode lama, Save, kemudian Deploy > Manage deployments > pilih Web app website > Edit > New version > Deploy. Save kode saja tidak mengubah deployment. Jangan tempel sebagai duplikat kode lama.

Script property VARTANA_ARTICLE_ADMIN_KEY harus sama dengan ADMIN_SESSION_SECRET server website, minimal 32 karakter. Ini juga digunakan CMS artikel. Jangan masukkan rahasia ke variabel NEXT_PUBLIC.

setupGames dapat dijalankan dari editor untuk menyiapkan tab; tab juga dibuat otomatis oleh permintaan Games yang sah. getGameCapabilities harus mengembalikan gamesVersion: 3. Website memeriksanya sebelum mengirim permintaan game agar deployment lama tidak salah memproses game sebagai pesanan.

## Pemeriksaan

node --test tests/*.test.cjs
npx tsc --noEmit
npm run build

Uji permainan berhadiah pada spreadsheet pengujian. Simulasi admin tersedia untuk memeriksa foto dan mekanik tanpa menerbitkan voucher produksi.
