# Stok checkout dan verifikasi riwayat

Backend versi 68 tersedia melalui deployment terpisah, sehingga website lama dapat tetap memakai versi 67 selama build website baru. Konfigurasi Netlify GOOGLE_SCRIPT_URL untuk deployment berikutnya menunjuk versi 68. Protokol checkout dan admin kini bertanda tangan.

## Aturan stok

- Keranjang tidak menahan stok.
- Order yang berhasil dibuat menahan stok selama 30 menit sejak masuk tahap pembayaran.
- Bila admin belum menerima pembayaran dalam 30 menit, stok tersedia kembali secara otomatis dalam perhitungan ketersediaan. Riwayat order tetap tersimpan.
- Pembayaran terlambat diperiksa kembali terhadap stok tersedia sebelum admin dapat menerimanya.
- Pembayaran diterima mempertahankan alokasi. Stok fisik dipotong sekali ketika pesanan mulai disiapkan.
- SKU yang belum dicatat stok barang jadinya atau bersaldo nol tidak dapat dibeli. Stok bahan baku tidak dianggap stok kemasan siap jual.
- Pemeriksaan stok dilakukan di server dalam lock, termasuk barang bonus dan permintaan bersamaan.

Audit baca-saja menemukan VRT-02-01 tersisa 2 kemasan: stok masuk 3 dikurangi 1 pesanan yang sudah dialokasikan. VRT-01-10S bersaldo 0; SKU lainnya belum memiliki saldo barang jadi. Sebanyak 24 item bahan memiliki stok, tetapi saldo tersebut terpisah dari barang jadi. Sepuluh pesanan berbayar lama belum memiliki rincian SKU terstruktur.

Admin kini memiliki rekonsiliasi rincian penjualan lama secara manual. Pengisian SKU/jumlah terjual atau bonus memperbaiki laporan tanpa mengurangi lagi stok fisik. Jumlah fisik yang belum diketahui tetap harus diisi berdasarkan hitungan gudang.

## Riwayat customer

Customer meminta kode melalui nomor WhatsApp. Kode dikirim hanya ke email yang sudah tercatat pada pesanan nomor tersebut. Kode berlaku 5 menit dengan maksimal 5 kesalahan; sesi terverifikasi berlaku 15 menit. Permintaan ulang memiliki jeda 60 detik dan batas 5 permintaan per jam. Browser tidak menerima email lengkap, alamat, atau data pelanggan lain.

## Notifikasi

Email order baru untuk admin dan email perubahan tahap untuk customer tetap tersedia. Membuka tautan WhatsApp tidak membuktikan chat telah dikirim atau pembayaran diterima. Notifikasi WhatsApp otomatis belum dipasang; integrasi tersebut membutuhkan akun dan akses WhatsApp Business API.

## Validasi

244 tes lolos, termasuk alur voucher–ongkir–order–alokasi stok–OTP riwayat–pembayaran–pengiriman, persaingan pembelian stok terakhir, kedaluwarsa 30 menit, idempotensi, dan rekonsiliasi tanpa perubahan stok. Struk memakai label Biaya pengiriman, tanpa catatan teknis estimasi historis atau metode pembayaran yang tidak tercatat. Status asli tetap tampil. Pengujian memakai fixture; tidak mengirim email percobaan atau membuat order produksi. Hasil gambar struk telah diperiksa; verifikasi visual pada perangkat HP belum dilakukan pada revisi ini.
