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
14. Setiap perubahan alamat/kurir membaca ulang produk dan promo. Pratinjau kini menggabungkan pembacaan bersamaan dan memakai data master publik selama 15 detik. Submit pesanan tetap membaca harga/promo terbaru; validasi voucher pribadi tidak masuk cache publik. Permintaan gagal dapat dicoba ulang.
15. Ringkasan menampilkan Rp0 dan menunggu tanpa batas waktu di browser. Kini menampilkan status memuat, membatasi permintaan 25 detik, menyediakan Coba lagi, dan membatalkan hasil lama ketika input berubah. Pembayaran tetap terkunci selama ringkasan belum valid.

## Validasi dan batas

171 tes lulus, termasuk pencatatan percobaan, tenggat server, masking kontak publik, ranking, revisi pengaturan, klaim hadiah tunggal, pemakaian voucher, upsert member, cache baca, pembatalan/timeout ringkasan, dan submit order bersamaan/retry. TypeScript dan build produksi lulus pada 12 November 2026.

Pembacaan Apps Script produk/promo langsung sekitar 4 detik. Lima quote lokal dengan alamat Tangerang dan pergantian J&T/JNE berhasil berturut-turut: permintaan pertama 4,8 detik, berikutnya 28–47 ms selama cache pratinjau masih berlaku. Ini menguji API ringkasan; tidak mengirim pesanan produksi.

Pemeriksaan browser otomatis dihentikan oleh alat karena URL Chrome tidak dapat diverifikasi dengan cukup aman. Tidak ada kontrol browser lanjutan setelah penghentian. Pengujian yang menulis order atau hadiah dilakukan pada fixture lokal; tidak membuat order/voucher uji pada spreadsheet produksi.

Audit berfokus pada alur publik Games, katalog, keranjang, checkout dan radio beserta handler backend terkait. Sistem pembayaran tetap menggunakan konfirmasi pembayaran yang sudah ada; tidak menambahkan gateway atau mengganti proses konsinyasi/produksi.
