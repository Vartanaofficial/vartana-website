# Form API admin — tambah, edit, hapus

Lokasi: `/admin/integrations`.

- Nama field mengikuti kebutuhan provider: DOKU Client ID/Secret Key, iPaymu VA/API Key, Biteship API Key/area_id, dan KiriminAja API Token. Field identitas memakai input teks; secret memakai input password.
- API lain dapat ditambah memakai nama berawalan `VARTANA_EXT_`. Ini menyiapkan credential; fitur provider baru tetap memerlukan adapter yang sesuai dokumentasinya.
- Daftar tersimpan dibaca dari Netlify, hanya menampilkan nama dan metadata nilai production. Nilai credential tidak pernah dikirim kembali ke browser.
- Edit meminta nilai baru; nilai lama tidak dibaca untuk mengisi form.
- Hapus meminta pengguna mengetik nama API. Server memeriksa session admin, Origin, allowlist, dan revision metadata. Penghapusan hanya pada value production yang dipilih melalui endpoint deleteEnvVarValue; environment lain tetap dipertahankan. Nilai `all` bila ada tetap dapat berlaku sebagai fallback Netlify.
- Secret autentikasi VARTANA, URL Apps Script, token koneksi Netlify, serta environment sistem tidak masuk allowlist edit/hapus.
- Perubahan credential di Netlify memerlukan rilis server berikutnya agar dipakai oleh website. Tidak memicu deployment otomatis.

Validasi: 337 regression/security test lulus; TypeScript checking dan lint file baru/diubah bersih. Baca metadata Netlify melalui endpoint admin lokal terautentikasi menghasilkan HTTP 200, configured:true, tanpa field value/values. Tes tulis/hapus menggunakan mock transport, tanpa mengubah atau menghapus credential production.

Tidak ada commit, push, deployment, ataupun perubahan spreadsheet pada revisi ini. Jadwal commit/push tetap menunggu pengguna kembali tanggal 24 November.

## Perapian layout

Daftar layanan di kiri pada desktop, dropdown layanan pada mobile, dan satu panel layanan terlihat pada satu waktu. Form provider lain tetap terpasang namun disembunyikan agar input yang belum disimpan tidak hilang saat berpindah layanan. CRUD API tambahan dibuka melalui tombol khusus. Bar simpan mengambang dihapus; tombol simpan berada di bagian yang sesuai. Pengaturan asal pengiriman existing tetap tersedia pada bagian lanjutan. TypeScript, lint halaman, delapan tes keamanan credential, serta build lokal lulus. Pemeriksaan visual browser belum tersedia karena browser access host tidak tersedia; tidak ada klaim QA visual.

Form API tambahan kini satu langkah: tiap baris memiliki dropdown jenis credential dan input nilai di sebelahnya. Tambah kolom menambah baris di bawah, jenis bisa dicampur, nama khusus dapat diisi, dan kolom sejenis memakai suffix unik. Baris kosong dilewati; hasil simpan sebagian mengosongkan hanya nilai yang sudah berhasil. Konfirmasi menyebut jumlah credential terisi dan tujuan production. Tidak ada penulisan credential production selama verifikasi revisi UI ini.
