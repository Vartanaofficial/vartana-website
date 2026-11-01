# Artikel dan jurnal VARTANA

## Lokasi menu

- Admin: `/admin/articles` (menu **Artikel & Jurnal** pada halaman admin).
- Daftar artikel: `/artikel`.
- Halaman artikel: `/artikel/alamat-artikel`.
- Katalog: `/katalog`. Kartu membuka pilihan produk yang sesuai pada halaman pemesanan.

## Pasang backend

1. Ganti seluruh kode Apps Script dengan `VARTANA-AppsScript-v2/VARTANA-AppsScript-v2.txt`, lalu Save. Jangan menambahkan kode di bawah versi lama.
2. Buka **Project Settings > Script properties**. Tambahkan `VARTANA_ARTICLE_ADMIN_KEY` dengan nilai yang sama seperti **ADMIN_SESSION_SECRET** pada konfigurasi server website di Netlify. Jangan memasukkan nilai rahasia ini ke spreadsheet, artikel, atau repository. Konfigurasi ini membuat akses draf dan penulisan artikel hanya menerima permintaan bertanda tangan dari server website.
3. Deploy > Manage deployments > Edit > **New version** > Deploy pada deployment yang sama. Tidak perlu Setup Master.
4. Buka admin > Artikel & Jurnal > Muat ulang daftar. Tab **Articles** dibuat otomatis. Tab produk, pesanan dan stok tidak diubah.

Penulisan diblokir jika backend belum mendukung artikel atau kunci belum dipasang. Kode disiapkan untuk pemasangan manual; belum dipasang langsung ke project Google.

## Buat dan terbitkan

Klik **Tambah artikel**. Isi judul, alamat (slug), kategori dan ringkasan. Tambahkan paragraf, subjudul dan foto dari link sesuai urutan yang kamu inginkan. Tombol Naik/Turun mengatur urutan bagian. Foto sampul bersifat opsional.

- **Simpan draf**: tersimpan untuk admin; tidak tampil di publik.
- **Pratinjau**: lihat isi saat mengedit, tanpa menerbitkan.
- **Terbitkan artikel**: tampil di jurnal dan memiliki link sendiri.
- **Salin link**: salin URL untuk dibagikan lewat chat atau media sosial.
- **Hapus artikel**: tarik dari publik dan pindahkan ke arsip. Pilih filter Arsip lalu Simpan draf atau Terbitkan untuk memulihkannya. Histori baris tidak dihapus permanen.

Alamat artikel tidak berubah setelah disimpan agar link yang sudah dibagikan tetap konsisten. Jika ada perubahan dari perangkat lain, editor meminta kamu memuat ulang untuk mencegah tertimpanya tulisan.

## Foto dari link

Gunakan URL gambar HTTPS atau tautan Google Drive dengan akses **Anyone with the link / Viewer**. Halaman login, link dokumen biasa, dan file Drive privat tidak dapat tampil sebagai foto. Isi deskripsi foto (alt) dan keterangan/kredit jika diperlukan. Tidak ada unggah file ke server baru.

Teks disimpan sebagai paragraf biasa, bukan HTML yang dieksekusi. Link gambar tidak mengubah isi produk atau harga.

## Artikel awal dan naskah beranda

Tiga artikel awal tersedia di kode: cerita VARTANA, memilih racikan/kemasan dan memeriksa informasi pesanan. Artikel ini dapat diedit dari admin setelah backend siap. Saat disimpan, perubahan pindah ke tab Articles dan mengesampingkan versi awal; draf atau arsip tidak memunculkan kembali versi awal di publik.

Beranda menampilkan ringkasan cerita dan tiga artikel terbit. Halaman cerita panjang lama diganti pengantar singkat menuju halaman artikel. Bahasa pengantar beranda dirapikan dalam Indonesia dan Inggris. Objek naskah produk, manfaat, bahan, harga, dan petunjuk seduh produk dipertahankan. Artikel awal berbahasa Indonesia; judul/isi artikel tidak diterjemahkan otomatis.

Jika spreadsheet tidak dapat dibaca, halaman memberi tahu bahwa artikel belum tersedia; sistem tidak mengarang isi atau menampilkan kembali artikel yang sudah ditarik.
