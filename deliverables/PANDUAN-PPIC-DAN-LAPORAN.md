# Panduan persediaan, produksi dan laporan VARTANA

## Pasang backend terlebih dahulu

Ganti seluruh kode Apps Script lama dengan `VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt`. Save, lalu Deploy > Manage deployments > Edit > **New version** > Deploy pada deployment yang sama. Jangan tempel kode di bawah kode lama. Tidak perlu menjalankan Setup Master atau mengosongkan spreadsheet.

Website menunggu `inventoryVersion: 4` sebelum mengizinkan penulisan fitur baru. Tab InventoryLedger, InventoryConfig, InventoryBatches, ProductionOrders dan OperatingExpenses dibuat otomatis ketika modul digunakan. Data lama tetap disimpan. Kode belum dipasang langsung ke akun Google; langkah deployment ini perlu dilakukan pemilik.

## Yang perlu disiapkan

- Master Product: SKU aktif, kemasan jual, jumlah tea bag per kemasan dan gram per tea bag. Pastikan contoh 9 gram memang per tea bag sesuai produk kamu.
- Daftar bahan baku, packaging dan perlengkapan: harga supplier, satuan serta saldo fisik. Contoh pouch, lakban, plastik dan dus adalah item berbeda.
- Per batch: bulan/tanggal masuk, jumlah tersisa, kedaluwarsa jika diketahui dan hasil pemeriksaan kualitas. Usia adalah lama sejak masuk gudang, bukan umur sejak panen atau jaminan kualitas.
- BOM tiap SKU: bahan dan kemasan yang dipakai satu kali produksi, biaya produksi dan jumlah kemasan jual yang dihasilkan batch tersebut.
- Penyelesaian produksi: hasil kemasan layak jual, pemakaian aktual tiap bahan serta catatan susut/selisih.
- Penjualan yang benar-benar dibayar, HPP yang lengkap dan biaya operasional yang belum masuk HPP. Jangan memasukkan biaya yang sama dua kali.

## Penggunaan

1. **Persediaan**: pilih Bahan baku atau Packaging & perlengkapan. Tambah item langsung ke RawMaterials; bahan baku baru juga disinkronkan ke daftar Ingredients. Pilih gram/kg untuk berat; pcs, roll, meter dan ml mengikuti satuan master. Kg dikonversi ke gram di penyimpanan. Harga satuan bukan saldo fisik.
2. **Batch / FEFO**: catat stok baru per batch. Untuk stok lama yang sudah tercatat, pilih pembagian stok lama ke batch supaya total tidak bertambah dua kali. Kunyit Juli 2 kg dan Oktober 4 kg ditulis menjadi dua batch, bukan dua nama master bahan.
3. Isi status READY hanya setelah diperiksa. Batch HOLD, REJECTED dan kedaluwarsa tidak dipakai produksi. FEFO mendahulukan kedaluwarsa paling awal; batch tanpa kedaluwarsa mengikuti FIFO setelah seluruh batch bertanggal kedaluwarsa. Tanggal belum diketahui tidak ditebak.
4. **Produksi / PPIC** (`/admin/production`): simpan BOM/HPP, pilih SKU dari Master Product dan target kemasan jual. Rencana menyimpan salinan resep dan belum mereservasi stok. Klik Isi aktual saat produksi selesai, periksa pemakaian bahan serta jumlah pack layak jual. Semua pengurangan bahan dan penambahan barang jadi dicatat bersama; retry tidak menggandakan stok. HPP master tidak otomatis ditimpa oleh hasil aktual.
5. **Stok Opname Tim** (`/admin/stocktake`): tim menghitung barang jual berdasarkan SKU Master Product. Simpan jumlah aktual; sistem mencatat selisih tanpa menghapus histori. Halaman memakai akses admin yang sudah ada, belum akun/otorisasi khusus tiap petugas.
6. **Hapus / arsipkan** item: saldo harus nol, tidak dipakai BOM atau draft produksi. Data fisik dan histori tetap tersimpan. Ini mengarsipkan master persediaan, bukan menghapus komposisi produk historis.
7. **Laporan Direksi** (`/admin/reports`): tentukan periode, catat biaya operasional, periksa kelengkapan, lalu pilih PDF atau PowerPoint. File berisi penjualan, P&L tercatat, stok bahan/packaging/barang jadi, batch/usia/kualitas, produksi, pemakaian aktual dan biaya operasional. PowerPoint dapat diedit. Lampiran memuat seluruh baris data yang dimuat, dengan pembagian halaman/slide.

## Dasar angka laporan

Hanya status pembayaran diterima/disiapkan/dikirim/selesai yang masuk pendapatan. HPP memakai master saat unduh, belum HPP historis per order. Hasil operasional sebelum pajak baru ditampilkan jika data penjualan/HPP/subsidi lengkap dan pemilik mengonfirmasi biaya operasional. Ini bukan laba bersih setelah pajak, laporan audit atau rekonsiliasi bank. Saldo stok adalah snapshot saat data dimuat, bukan stok historis akhir periode. Rasio perputaran stok belum dihitung karena saldo rata-rata historis belum tersedia.

`CONTOH-Laporan-Direksi.pdf` dan `.pptx` adalah contoh desain dengan angka fiktif, bukan data bisnis aktual. Tidak ada data contoh yang dimasukkan ke spreadsheet.

Tampilan menggunakan susunan responsif, formulir yang dapat digulir dan tabel dengan gulir mendatar di HP. Pengujian interaksi browser/HP nyata tetap perlu dilakukan setelah Apps Script terpasang.
