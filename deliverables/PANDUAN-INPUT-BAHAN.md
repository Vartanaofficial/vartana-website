# Cara mengatur stok bahan

## Salah input atau ingin menyamakan stok fisik
1. Cari nama bahan di Semua bahan.
2. Klik **Ubah stok aktual** (atau **Isi stok aktual** jika belum pernah diisi).
3. Pilih satuan lalu isi **jumlah total yang benar-benar ada**, bukan selisihnya. Contoh: Adas sebenarnya 800 gram, pilih gram dan isi 800; jika memilih kg, isi 0.8.
4. Periksa total setelah disimpan, isi alasan, lalu klik **Simpan stok aktual**.

Sistem menghitung koreksi otomatis, termasuk jika bahan punya beberapa batch. Pengurangan total dibebankan ke saldo tanpa batch terlebih dahulu, kemudian batch menurut urutan kedaluwarsa / tanggal masuk. Jika hasil hitung masing-masing batch diketahui, gunakan Detail batch untuk koreksi per batch. Penambahan hasil koreksi ditahan untuk pemeriksaan kondisi sebelum dipakai produksi. Riwayat sebelumnya tetap tersimpan.

## Ada pembelian baru
Gunakan **Terima bahan / detail batch**, lalu isi jumlah tambahan yang datang dan kondisi bahannya. Ini menambah saldo.

## Bahan ingin dihapus dari daftar
Pilih **Arsipkan bahan** lalu konfirmasi. Bahan dengan saldo tetap dapat diarsipkan dan hilang dari daftar serta total persediaan aktif; saldo dan riwayat disimpan. Jika masih digunakan resep atau rencana produksi, lepaskan hubungan tersebut dahulu sesuai pesan yang tampil.

## Aktivasi
Salin seluruh VARTANA-AppsScript-v2.txt ke Apps Script lalu perbarui deployment. Website masih lokal sampai diminta dipublikasikan.

## Ranking dan rencana produksi
Ranking persediaan menampilkan 5 nilai stok terbesar, item di atas maksimum, dan item mencapai minimum. Atur batas di Edit bahan. Urutan jumlah tersedia jika satuannya sama. Nilai terbesar bukan otomatis overstock.

Di Produksi, pilih SKU dan target kemasan. Kebutuhan dihitung dari master resep tersimpan: per kemasan, total, siap pakai, kekurangan. Jika belum tersimpan, contoh komposisi ditandai sebagai draf dan belum bisa dipakai produksi. Buka Master resep untuk SKU itu, pilih contoh yang cocok, hubungkan bahan supplier dan lengkapi kemasan, lalu simpan. Komposisi cukup disimpan sekali per SKU; rencana berikutnya otomatis mengalikan jumlahnya. Jar memakai jumlah tea bag dan gram per tea bag dari Master Product. Tidak perlu input ulang bahan setiap produksi.

## Edit dan pembagian bulan
Buka Terima bahan / detail batch. Setiap kartu punya Edit jumlah & bulan, Bagi per bulan, dan Hapus. Edit jumlah mengoreksi total persediaan. Bagi per bulan memindahkan saldo ke kartu baru tanpa menambah total; contoh 800 gram dibagi Juli 200 dan Oktober 500 menyisakan 100 gram pada kartu asal. Hapus mengurangi sisa batch dari stok dan menyembunyikan kartu; riwayat tetap ada. Kondisi batch hasil pembagian mengikuti asal dan tanggal kedaluwarsa perlu diperiksa kembali. Perbarui deployment Apps Script dengan TXT lengkap terbaru untuk fitur ini.

## Label pack untuk printer resi
Pada detail bahan, pilih Tambah pack bahan masuk untuk pack fisik baru. Untuk membagi stok yang sudah ada, gunakan Bagi per bulan. Pilih Cetak label pada kartu pack atau Cetak beberapa label untuk memilih beberapa pack sekaligus.

Unduhan berupa PDF hitam putih dengan empat posisi label (2 kolom x 2 baris) per lembar. Pilih lembar 100 x 150 mm atau 100 x 100 mm sesuai kertas printer. Sisa posisi kosong tidak diisi otomatis. Salinan per pack hanya menggandakan label, bukan stok. Setiap pack memiliki kode lengkap yang berbeda. Berat mengikuti saldo pack saat PDF dibuat; setelah bahan digunakan, sisa aktual dibaca di sistem.

Buka PDF lewat Grozzie, pilih ukuran yang sama dan skala 100% / ukuran asli. Cetak uji satu lembar dahulu untuk memeriksa margin driver. Potong menjadi empat bagian. Kertas yang digunakan harus cocok dengan printer; hasil cetak fisik perlu diperiksa di perangkat pengguna.
