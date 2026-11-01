# Mengatur promo checkout

Buka Admin > Promo checkout. Kamu yang menentukan aturan dan status aktifnya. Tombol Otomatis hanya mengatur cara pelanggan menerima promo; status Aktif/Nonaktif tetap menentukan apakah promo berlaku.

## Gratis ongkir Jabodetabek

1. Klik aturan cepat Gratis ongkir Jabodetabek. Aturan awal NONAKTIF dan belum tersimpan.
2. Atur minimal belanja, maksimal subsidi dan periode. Batas subsidi 0/kosong berarti seluruh tarif; bila tarif melebihi batas, pelanggan membayar sisanya.
3. Biarkan Otomatis tercentang agar pelanggan tidak perlu memasukkan kode. Kode tetap menjadi identitas aturan di laporan.
4. Centang Aktifkan promo ini di checkout lalu Simpan. Kamu bisa mematikannya kapan saja lewat tombol status pada kartu promo.

Ongkir hanya disubsidi setelah kecamatan pelanggan berhasil diverifikasi berada di Jakarta Selatan/Timur/Pusat/Barat/Utara, Kabupaten/Kota Bogor, Depok, Kabupaten/Kota Tangerang, Tangerang Selatan, atau Kabupaten/Kota Bekasi. Kepulauan Seribu tidak termasuk cakupan ini. Alamat yang belum lengkap, gagal diverifikasi, atau di luar cakupan tidak menerima subsidi. Mengganti alamat menghitung ulang promo; server memeriksa ulang sebelum menyimpan pesanan.

Minimal belanja memakai subtotal produk setelah diskon harga produk, sebelum promo checkout dan ongkir. Promo mengikuti prioritas dan pengaturan boleh digabung.

## Beli 2 Box, gratis 1 Jar

Klik aturan cepat, pilih SKU box dari Master Product, lalu pilih SKU jar hadiah. Boleh pilih beberapa varian box: 1 box A + 1 box B memenuhi syarat 2 box jika keduanya dicentang. Produk yang tidak dipilih tidak dihitung. Atur jumlah pembelian, hadiah dan maksimal kelipatan per pesanan. Hadiah ikut berat pengiriman dan pengeluaran stok; hadiah tidak memicu hadiah berikutnya.

Aturan cepat tidak menebak SKU atau langsung mengaktifkan promo. Periksa produk, harga, batas dan status sebelum menyimpan.

## Memasang Apps Script terbaru

Ganti seluruh kode dengan TXT lengkap dalam paket VARTANA-AppsScript-v2, Save, lalu Deploy > Manage deployments > Edit > New version pada deployment yang sama. Tidak perlu Setup Master. Backend terbaru melaporkan promoVersion 3 dan menambahkan Shipping Mode, Promo Area, Buy SKUs tanpa menimpa kolom lama. Editor memblokir penyimpanan jika backend masih lama agar aturan tidak hilang diam-diam.

Artikel memerlukan Script property tambahan; ikuti PANDUAN-ARTIKEL.md. Perubahan website melalui Git tidak otomatis memperbarui deployment Google Apps Script.
