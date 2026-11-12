# Audit alur publik VARTANA

## Temuan yang diperbaiki

1. Permintaan game pada deployment lama jatuh ke handler Orders. Ditambah pemeriksaan versi baca-saja sebelum POST dan pesan aktivasi yang spesifik.
2. Pemain dibatasi member yang pernah belanja. Form sekarang mendaftarkan peserta Games melalui nama, WhatsApp dan email, terpisah dari data transaksi.
3. Puzzle sebelumnya 3 x 3 geser. Diubah menjadi 20 keping berbentuk puzzle, gambar acuan tetap terlihat, konfigurasi disalin pada setiap percobaan, dan simulator admin memakai komponen yang sama.
4. Membuka halaman ulang bisa mengulang permintaan status/katalog. Baca browser yang bersamaan digabung; harga katalog disegarkan dengan cache pendek dan saat halaman aktif. Kegagalan tidak disimpan sebagai cache sukses.
5. Kartu katalog membawa pembeli kembali ke beranda untuk memilih kemasan. Kini pilih kemasan, tambah ke keranjang, dan lanjut ke checkout langsung dari katalog. Detail racikan tetap dapat dibaca jika diinginkan.
6. Daftar provinsi ikut dimuat ulang setiap kota berubah. Pembacaan provinsi/kota/kecamatan dipisah dan data wilayah disimpan sementara per URL. Respons dari pilihan lama tidak menimpa pilihan baru.
7. Nomor WhatsApp yang diketik selalu memicu quote checkout. Nomor sekarang hanya memicu quote jika ada voucher pribadi PUZ; quote lain tetap mengikuti keranjang, alamat, promo dan kurir.
8. Penyimpanan keranjang ikut berjalan setiap isian pelanggan berubah. Efek keranjang dan draft dipisah; draft isian dibatasi jeda pendek.
9. saveMember selalu menambah baris. Backend sekarang memperbarui member berdasarkan WhatsApp normalisasi, mempertahankan Member ID, tanggal daftar dan data lama yang tidak dikirim. Baris historis yang sudah terlanjur duplikat tidak dihapus otomatis.
10. Pembuatan order membaca ulang seluruh produk/promo lewat getAdminData dan selalu menulis member. Checkout kini membaca konteks customer/order yang diperlukan, melewati penulisan profil yang tidak berubah, serta masih mendukung deployment lama dengan fallback baca.
11. Retry order memeriksa harga/voucher ulang sebelum memulihkan order lama. Order Key kini dicari dahulu sehingga retry mengembalikan receipt asli; submit bersamaan digabung per Order Key dan WhatsApp. UI juga mengunci submit selama proses.
12. Radio dipasang pada beranda, sehingga mati saat komponen beranda dilepas. Radio dipindah ke root layout yang persisten. Navigasi publik internal memakai Next Link agar halaman tidak reload penuh. Radio dijeda/disembunyikan pada checkout/pembayaran.

13. Smoke test menemukan koneksi Google sesekali menggantung di runtime lokal. Transport Apps Script kini terpisah dari cache fetch halaman, mengikuti redirect Google dengan TLS terverifikasi, meminta identity encoding dan memiliki tenggat. Penyebab tunggal belum dapat dipastikan. Master Products juga dibaca hanya pada baris SKU dan 26 kolom terdefinisi; baris berjauhan tetap ikut dibaca.
14. Setiap perubahan alamat/kurir membaca ulang produk dan promo. Pratinjau menggabungkan pembacaan bersamaan dan memakai data master publik selama 60 detik. Submit pesanan tetap membaca harga/promo terbaru; validasi voucher pribadi tidak masuk cache publik. Permintaan gagal dapat dicoba ulang.
15. Ringkasan menampilkan Rp0 dan menunggu tanpa batas waktu di browser. Kini menampilkan status memuat, membatasi permintaan 25 detik, menyediakan Coba lagi, dan membatalkan hasil lama ketika input berubah. Pembayaran tetap terkunci selama ringkasan belum valid.

## Validasi dan batas

171 tes lulus, termasuk pencatatan percobaan, tenggat server, masking kontak publik, ranking, revisi pengaturan, klaim hadiah tunggal, pemakaian voucher, upsert member, cache baca, pembatalan/timeout ringkasan, dan submit order bersamaan/retry. TypeScript dan build produksi lulus pada 12 November 2026.

Pembacaan Apps Script produk/promo langsung sekitar 4 detik. Lima quote lokal dengan alamat Tangerang dan pergantian J&T/JNE berhasil berturut-turut: permintaan pertama 4,8 detik, berikutnya 28–47 ms selama cache pratinjau masih berlaku. Ini menguji API ringkasan; tidak mengirim pesanan produksi.

Pemeriksaan browser otomatis dihentikan oleh alat karena URL Chrome tidak dapat diverifikasi dengan cukup aman. Tidak ada kontrol browser lanjutan setelah penghentian. Pengujian yang menulis order atau hadiah dilakukan pada fixture lokal; tidak membuat order/voucher uji pada spreadsheet produksi.

Audit berfokus pada alur publik Games, katalog, keranjang, checkout dan radio beserta handler backend terkait. Sistem pembayaran tetap menggunakan konfirmasi pembayaran yang sudah ada; tidak menambahkan gateway atau mengganti proses konsinyasi/produksi.

## Revisi Games 12 November

- Hadiah per game dapat diatur: rupiah, persen, ongkir, produk gratis, atau tanpa hadiah. Ketentuan disalin ke percobaan dan kode hadiah; voucher lima kolom lama tetap Rp20.000. Berat produk gratis ikut ongkir dan barang hadiah ikut alokasi stok order.
- Arena puzzle saat bermain memakai lebar halaman, menyembunyikan cerita pembuka, serta meletakkan papan/baki berdampingan pada laptop/tablet. HP memakai baki dua baris yang digeser horizontal.
- TTS ditambahkan dengan tiga tema admin, editor 3–15 jawaban/petunjuk, simulator bersama, tenggat server, ranking, dan pencatatan ke GameAttempts. Respons publik tidak menyertakan jawaban atau bank soal privat.
- 179 tes lulus dan build produksi lulus. Backend Apps Script versi 59 terverifikasi menyediakan tiga game, 15 produk aktif untuk pilihan bonus admin, dan respons TTS publik tanpa jawaban. Tidak membuat pemain, hadiah, atau pesanan uji di produksi.
- Pemeriksaan visual pada revisi ini juga terhenti karena alat tidak dapat memverifikasi URL Chrome. Layout responsif sudah diimplementasikan, tetapi interaksi visual desktop/HP belum dapat dikonfirmasi lewat browser.

## Checkout dan radio, revisi lanjutan 12 November

- Radio memindahkan pointer capture dari tombol ke dock saat melewati ambang drag. Peristiwa lostPointerCapture dari tombol memutus drag. Capture kini dipasang pada dock sejak pointer down dan tidak dipindah. Peristiwa milik elemen anak tidak mengakhiri drag. Area tombol juga menonaktifkan gesture scroll/seleksi teks saat drag; tap tetap membuka panel dan panah keyboard tetap bekerja.
- Pembacaan sebelum submit digabung ke getCheckoutContext(includeMaster): order lama dipulihkan dahulu; order baru menerima master produk/promo segar dalam respons yang sama. Profil yang berubah disimpan bersama order di RPC berikutnya, menggunakan script lock yang sama tanpa nested lock. Submit normal menjadi dua panggilan Apps Script; voucher pribadi masih membutuhkan validasi tambahan.
- Mengisi provinsi/kota belum memicu quote pengiriman sebelum kecamatan lengkap. Pilihan wilayah memberi indikator memuat. Lookup kode pos memiliki satu tenggat total 6 detik, bukan empat tenggat berurutan; bila gagal, input manual tersedia. Kode pos tidak menghalangi quote ekspedisi.
- Penyimpanan order di browser memiliki tenggat 45 detik. Jika respons hilang, retry tetap menggunakan Order Key yang sama untuk memulihkan pesanan, bukan membuat order baru.
- 186 tes lulus. Uji baca backend versi 60 memuat konteks, 15 produk, dan 4 promo dalam 4,2 detik; perhitungan ongkir setelahnya sekitar 0,2 detik. Pengujian simpan order dilakukan pada fixture lokal, tanpa membuat pesanan produksi.
