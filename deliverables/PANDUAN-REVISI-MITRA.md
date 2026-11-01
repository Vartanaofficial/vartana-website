# Revisi mitra dan persediaan

File lengkap yang dipakai: VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt.
File ini sama dengan apps-script/Code.gs. Jangan menambahkan potongan fungsi di bawah script lama karena dapat membuat fungsi ganda.

## Memasang Apps Script

1. Buka proyek Apps Script yang dipakai URL deployment konsinyasi.
2. Ganti isi kode dengan seluruh isi TXT lengkap, simpan.
3. Pilih Deploy > Manage deployments > Edit > New version > Deploy. Pertahankan URL deployment yang sudah dipakai website.
4. Jika proyek master inventory terpisah, gunakan TXT lengkap yang sama pada proyek tersebut juga dan perbarui versi deploymentnya.
5. Refresh halaman Mitra dan Stok mitra.

Penjualan menggunakan tab KON_SALES_LEDGER yang dibuat otomatis. SO dan penerimaan BAST menjadi dasar jumlah dan harga kesepakatan. Barang yang belum terjual ditampilkan sebagai nilai stok mitra. Barang terjual menjadi tagihan; setoran mengurangi sisa piutang. Edit penjualan menyimpan revisi dan mempertahankan setoran yang sudah diterima.

## Bahan baku

1. Master bahan menyimpan identitas, satuan, dan harga acuan. Jumlah beli untuk perhitungan harga bukan saldo persediaan otomatis.
2. Input stok awal melalui batch. Pilih kondisi Siap pakai hanya setelah bahan diperiksa. Stok tahan atau kedaluwarsa tidak dialokasikan untuk produksi.
3. Jika saldo lama sudah tercatat tanpa batch, gunakan Bagi stok lama. Ini tidak menambah total saldo.
4. Penerimaan berikutnya menambah saldo melalui batch baru.
5. Menyimpan rencana produksi belum mengurangi bahan. Menyelesaikan produksi mencatat pemakaian bahan dan hasil barang jadi. Pemakaian awal dihitung dari BOM dan jumlah hasil; pemakaian aktual masih bisa disesuaikan sebelum disimpan.
6. Opname dilakukan dengan memilih batch dan mengisi jumlah fisik yang tersisa. Saldo sistem ditampilkan sebagai pembanding dan hanya selisih dicatat ke riwayat.

Opname barang jadi tetap menggunakan alur sebelumnya.

Perubahan website ini masih lokal. Belum di-commit, push, atau deploy.

## Edit bahan / persediaan

Gunakan tombol Edit bahan di setiap baris untuk mengubah nama, kelompok, supplier, harga acuan, serta batas minimum dan maksimum. Pilihan kg/gram hanya mengubah tampilan angka; satuan dasar material tetap. Perubahan ini tidak menulis mutasi ke InventoryLedger. Koreksi jumlah fisik tetap dilakukan melalui opname batch. Gunakan TXT lengkap terbaru untuk mendukung penyimpanan batas stok bersama data bahan.

## Pemisahan input stok awal dan opname

Pada Bahan baku & inventory, pilih tab 1. Input stok awal. Daftar ini hanya berisi item tanpa saldo. Klik Input stok awal, isi jumlah dan satuan, tanggal masuk serta kondisi bahan, lalu Simpan stok awal. Setelah tersimpan item berpindah ke tab 2. Stok opname. Di tab opname pilih bahan dan batch, isi jumlah fisik, periksa selisih terhadap saldo sistem, lalu simpan hasil opname. Penerimaan tambahan ada di tab Penerimaan & pengaturan. Stok awal yang sudah tercatat tidak boleh dimasukkan ulang.
