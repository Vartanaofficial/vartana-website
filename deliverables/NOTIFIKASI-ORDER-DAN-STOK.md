# Email status pesanan dan stok katalog

Admin menyimpan status dari Operations atau dashboard lama melalui API admin yang sama. Empat tahap mengantrekan email ke alamat customer pada Orders: PEMBAYARAN DITERIMA, PESANAN DISIAPKAN, DIKIRIM, dan SELESAI. Status MENUNGGU PEMBAYARAN tidak mengirim email tahap baru. Email order baru ke admin yang sudah ada tetap berjalan.

Pembayaran harus diverifikasi admin sebelum memilih PEMBAYARAN DITERIMA. DIKIRIM mewajibkan nomor resi J&T. SELESAI berarti penerimaan/penyelesaian telah dikonfirmasi admin; tidak ada webhook pelacakan J&T otomatis pada revisi ini.

Pengirim adalah vartana@vartanaglobal.com melalui akun deployment yang sama. Email berisi nomor order, rincian produk, total, status, tautan lacak, serta resi untuk tahap DIKIRIM. Konten customer di-escape untuk HTML.

## Antrean dan pencegahan duplikasi

Tab OrderEmailNotifications menyimpan satu event per nomor pesanan dan tahap. Menyimpan ulang atau mengulang permintaan pengiriman tidak mengirim ulang tahap yang sama. Status disimpan lebih dulu, pengiriman dijalankan setelah respons website agar tidak memperlambat form. Panggilan MailApp berada di luar lock stok.

- PENDING: tersimpan, menunggu diproses.
- SENDING / SENT: sedang diproses / diterima layanan kirim.
- SKIPPED: email customer kosong atau tidak valid; perubahan status tetap tersimpan.
- BLOCKED: pengirim atau kuota perlu diperiksa.
- UNKNOWN: hasil layanan kirim belum pasti; jangan mengulang otomatis karena bisa menggandakan email.

Kolom Customer Email Status dan Customer Email Event pada Orders menunjukkan event terbaru. Hasil event lama tidak menimpa status email tahap yang lebih baru. Dashboard menampilkan status email dan pesan penyimpanan. Perubahan status dan pengiriman email memakai permintaan admin bertanda tangan server; penerima selalu dibaca dari Orders, bukan isian browser.

Pemasangan tidak mengirim email massal untuk status historis. Email dipicu ketika admin menyimpan tahap melalui website yang sudah diperbarui. Perubahan langsung pada sel spreadsheet belum menjadi pemicu email.

## Stok dan terjual

Master Produk menampilkan ringkasan stok per SKU, dengan tombol Isi / koreksi stok menuju Persediaan. Saldo memakai InventoryLedger yang sudah ada, bukan kolom stok baru di Products. Produksi/penerimaan/opname mengubah saldo; status PESANAN DISIAPKAN, DIKIRIM atau SELESAI mengalokasikan barang keluar satu kali per order. Stok belum dicatat ditampilkan sebagai Belum diisi, bukan nol.

Terjual menjumlahkan rincian SKU dari Inventory Items pada pesanan dengan pembayaran diterima atau tahap berikutnya. Bonus harga nol dihitung terpisah; tebus murah berbayar termasuk terjual. Pesanan belum bayar tidak dihitung. Pesanan historis tanpa rincian SKU terstruktur dilaporkan belum terpetakan dan tidak ditebak dari teks ringkasan.

Ringkasan ini khusus admin; tidak menambahkan pembatas stok atau angka stok publik di katalog. Pengguna dapat menyegarkan ringkasan setelah input stok. Data konsinyasi tidak dicampur dengan penjualan retail.

## Validasi

220 tes serta build produksi lolos. Tes email dan status memakai spreadsheet/pengirim tiruan; tidak mengubah status order customer atau mengirim email percobaan ke customer produksi. TXT Apps Script lengkap tersinkron dengan Code.gs.
