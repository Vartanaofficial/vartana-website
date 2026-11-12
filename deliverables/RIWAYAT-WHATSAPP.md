# Riwayat belanja dari nomor WhatsApp

> Pembaruan lokal terbaru: riwayat sekarang memerlukan OTP email, bukan hanya nomor WhatsApp. Lihat [aturan stok dan verifikasi](BASIC-STOK-DAN-VERIFIKASI.md). Catatan versi 67 di bawah menjelaskan backend yang masih aktif; revisi OTP belum dipublikasikan. Validasi terbaru: 243 tes dan build produksi lolos.

Halaman Lacak & Riwayat Belanja sekarang langsung menampilkan pesanan dari nomor WhatsApp, tanpa pop-up Member ID. Tab kedua tetap mendukung pencarian nomor pesanan. Hasil berbentuk kartu dengan isi pesanan, total, tanggal, status, tahap proses, dan nomor resi yang dapat disalin. Menunggu pembayaran memiliki tahap sendiri dan tidak lagi ditampilkan seolah pembayaran sudah diterima.

Apps Script versi 67 sudah aktif pada Web app yang sama. Pemeriksaan baca-saja dengan nomor pada screenshot menemukan pesanan dan rincian produk, tanpa mengembalikan field pribadi. Perubahan antarmuka website masih lokal, belum dipublikasikan, di-commit, atau dipush sesuai instruksi terbaru.

Pencarian membaca Orders pada project Apps Script yang sama dengan dashboard melalui action customerOrderLookup bertanda tangan server. Endpoint lama yang dikodekan langsung di /api/track tidak lagi dipakai. Website memeriksa customerOrdersVersion sebelum mengirim action baru agar deployment lama tidak meneruskannya ke handler pembuatan order.

Nomor dinormalisasi dari 08, +62/62, dan nomor lama yang kehilangan nol depan akibat format angka spreadsheet. Pencocokan berdasarkan nomor pada masing-masing order, bukan seluruh order dengan Member ID yang sama. Pesanan terbaru berada di atas; serial duplikat ditampilkan satu kali. Maksimal 100 pesanan terbaru dikirim dengan jumlah total dan penanda bila hasil lebih banyak. Pesanan lama dengan kolom bergeser memakai pemulihan pembacaan header yang sudah ada.

Respons publik hanya memuat serial, tanggal, ringkasan produk, total, status, dan resi. Tidak memuat nama lengkap, email, nomor WhatsApp, alamat, Member ID, Order Key, atau catatan checkout. Pencarian WhatsApp dari UI memakai POST, bukan nomor pada URL. Respons tidak disimpan di cache. Belum ada verifikasi OTP pada fitur pencarian ini.

Pencarian bersifat baca-saja: tidak membuat order/member baru, mengubah saldo stok, status order, atau mengirim email. Modal dapat ditutup dengan Escape, mengunci fokus keyboard, dan membatalkan permintaan ketika ditutup atau query diganti. Kesalahan, hasil kosong, dan pemuatan ditampilkan langsung di modal.

## Status pekerjaan sebelumnya

Email status order dan ringkasan stok/terjual telah terpasang melalui commit 3f58866 dan Apps Script versi 66. Nomor stok yang belum dicatat harus diisi sesuai kondisi fisik melalui Persediaan. Order lama tanpa rincian SKU tetap ditandai perlu rekonsiliasi; jumlahnya tidak ditebak dari teks atau dianggap stok nol. Fitur riwayat ini tetap menampilkan ringkasan pesanan lama tersebut bila nomor WhatsApp-nya cocok.

## Pengujian

231 tes dan build produksi lolos. Pengujian tambahan mencakup variasi nomor WhatsApp, nomor numerik tanpa nol, isolasi nomor meski Member ID sama, pesanan lama dengan kolom bergeser, hasil kosong, batas dan duplikasi hasil, kerahasiaan respons, penolakan tanda tangan tidak sah, serta kompatibilitas pencarian serial. Tidak membuat order atau mengirim email uji ke customer produksi.

## Umpan balik keranjang katalog

Ikon keranjang atas dan bawah memakai sumber jumlah kemasan yang sama. Perubahan keranjang menyiarkan event pada tab aktif dan mendengarkan perubahan penyimpanan antar-tab. Setelah tambah produk, kartu dan tombol disorot sementara, toast langsung terlihat di bawah navigasi, dan jumlah varian yang sudah di keranjang ditampilkan di kartu. Ringkasan checkout tetap terlihat di bawah layar, di atas navigasi HP, sehingga customer tidak perlu menggulir ke atas. Pengurangan jumlah dan pengosongan keranjang juga menyegarkan badge. Revisi ini masih lokal dan tidak mengubah harga atau proses checkout.
