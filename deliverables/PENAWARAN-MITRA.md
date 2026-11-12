# Simulasi harga dan penawaran mitra

Buka **Admin > Konsinyasi > Mitra > Simulasi harga & PDF**, atau pilih **Simulasi harga** pada baris mitra untuk mengisi penerima secara otomatis. Tersedia juga pintasan pada menu navigasi admin.

1. Pilih mitra terdaftar atau isi calon mitra secara manual, lalu tentukan masa berlaku dan referensi penawaran.
2. Pilih produk dari Master Produk Konsinyasi. Isi jumlah kemasan, harga dasar mitra, diskon, dan alokasi biaya tambahan per kemasan.
3. Tentukan rekomendasi harga jual dari target margin atau isi harga jual sendiri. Rekomendasi dapat dibulatkan ke atas per Rp100, Rp500, atau Rp1.000.
4. Atur ketentuan kerja sama dan unduh penawaran PDF A4 dengan logo VARTANA. Contoh ilustratif tersedia di `output/pdf/Contoh-Penawaran-Mitra-VARTANA.pdf`.

Harga mitra setelah diskon dibulatkan ke rupiah. Modal per kemasan adalah harga mitra setelah diskon ditambah biaya lainnya. Margin dihitung sebagai laba kotor dibagi harga jual, bukan sebagai markup terhadap modal. Harga jual di bawah modal tetap ditampilkan dengan peringatan kerugian. Potensi omzet dan laba mengasumsikan seluruh kemasan terjual; biaya operasional dan pajak di luar input belum diperhitungkan.

Simulasi tidak mengubah harga master, membuat Sales Order, menyimpan penawaran ke spreadsheet, atau mengurangi stok. HPP internal VARTANA tidak dimuat atau ditampilkan dalam PDF mitra. Simpan hasil unduhan sebelum meninggalkan halaman.

Template menggunakan warna hijau botanical dan aksen emas, tabel per produk, ringkasan modal, serta ketentuan penawaran. Daftar panjang berganti halaman dengan judul tabel diulang dan baris produk dijaga agar tidak terbelah. PDF dikompresi untuk memudahkan pengiriman.

Validasi: 249 tes dan build produksi lolos. Hasil PDF satu halaman dan lima halaman telah dirender dan diperiksa. Tata letak halaman diberi selector khusus agar latar judul tidak tertimpa header terang workspace. Pemeriksaan browser interaktif dibatasi karena jendela sedang dipakai pengguna; tidak mengklaim pengujian visual pada HP.

## Riwayat belanja

Apps Script versi 69 menormalkan email pesanan sebelum validasi (termasuk spasi dan huruf besar). Nomor WhatsApp numerik di spreadsheet yang kehilangan nol depan tetap cocok dengan format 08, 8, 62, dan +62. Pemeriksaan admin bertanda tangan dapat memverifikasi kecocokan pesanan dan ketersediaan email tanpa mengirim kode. OTP tetap wajib; pencocokan digit nomor tidak dilonggarkan ke nomor yang berbeda.
