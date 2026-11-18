# Integrasi API — implementasi lokal

Menu: `/admin/integrations`, tersedia dari pilihan menu admin dan sidebar.

## Yang berfungsi

- Transfer BCA dan QRIS manual: aktif/nonaktif, nama metode yang ditampilkan, simpan dan muat ulang.
- Pengiriman existing: aktif/nonaktif dan ID wilayah asal untuk tarif Biteship. Estimasi wilayah tetap tersedia saat konfigurasi tarif existing belum lengkap.
- Pilihan pembayaran pada quote mengikuti pengaturan server. Metode nonaktif ditolak pada pembuatan pesanan sebelum perubahan member/order.
- Menonaktifkan pengiriman mengosongkan pilihan kurir sehingga pesanan baru tidak dapat dilanjutkan.
- Receipt baru menyimpan pilihan pembayaran saat dibuat. Retry pesanan yang sudah tersimpan tetap bisa dibuka setelah metode dinonaktifkan.
- Pengaturan memakai revision check untuk mencegah perubahan tertimpa perangkat lain.
- Development menyimpan preferensi nonrahasia pada `.qa-integrations-settings.json` yang diabaikan Git; production menggunakan satu entri `integrations` pada sheet `AdminPreferences` melalui RPC bertanda tangan.

## API Key dan layanan mendatang

API Key disimpan pada environment server Netlify. Form tambah/edit di dashboard menerima nilai baru secara write-only; nilai lama tidak dibaca kembali ke browser dan tidak disimpan di Sheets. Server membutuhkan koneksi awal NETLIFY_INTEGRATION_TOKEN, NETLIFY_INTEGRATION_ACCOUNT_ID, NETLIFY_INTEGRATION_SITE_ID. Form hanya mengizinkan nama API provider terdaftar atau awalan VARTANA_EXT_; tidak dapat menimpa secret autentikasi, URL Apps Script, token Netlify, atau environment sistem. Penyimpanan memperbarui hanya konteks production pada satu project, tanpa deployment otomatis.

DOKU, iPaymu, dan KiriminAja disediakan sebagai kartu konfigurasi nonaktif. Adapter transaksi, webhook dan pengujian provider belum dibuat karena akun/API belum tersedia. Tombol aktivasi diblokir pada UI, validasi Next.js, dan Apps Script; mengisi API Key saja belum mengaktifkan provider tersebut.

Nomor rekening dan gambar QRIS existing tetap memakai konfigurasi existing. Fitur ini belum menyediakan editor rekening atau unggah QRIS.

## Validasi

- Seluruh 334 regression/security test lulus, termasuk pengujian tambah/edit credential Netlify dengan transport mock tanpa menulis environment production.
- TypeScript checking dan production build lokal lulus.
- Lint pada source integrasi dan pengujian baru bersih. Full lint: 78 error dan 55 warning legacy, sama seperti baseline sebelum fitur integrasi; tidak ada tambahan temuan.
- Pemeriksaan HTTP lokal: login 200, API pengaturan 200, halaman admin 200, enam layanan terdaftar, mode lokal aktif.
- Pengujian Apps Script memakai spreadsheet fixture dalam memori. Tidak ada perubahan database production atau email percobaan.

## Urutan rilis setelah disetujui

1. Ikuti migration dan rollback Phase 01 pada `PHASE-01-SECURITY-HARDENING-2026-11-14.md` untuk seluruh hardening yang masih lokal.
2. Pasang canonical Apps Script yang mencakup handler privat `integrationSettings` pada target yang telah disiapkan; cocokkan secret RPC.
3. Verifikasi read/save pada spreadsheet sandbox, termasuk revision conflict dan penolakan tanpa tanda tangan.
4. Rilis Next.js yang menunjuk target kompatibel. Jangan rilis caller integrasi terhadap Apps Script lama yang belum memiliki handler ini.
5. Siapkan tiga variabel koneksi server Netlify sekali. Sesudahnya API Key layanan dapat ditambah/diganti melalui dashboard. BCA dan QRIS manual tidak memerlukan API Key.
6. Setelah rilis, atur aktivasi melalui dashboard dan lakukan checkout sandbox. Jangan aktifkan semua metode bila belum diuji; menonaktifkan semua metode memang memblokir pesanan baru.

Rollback harus mempertahankan strict RPC hardening. Pulihkan preferensi integrasi melalui dashboard dengan revision terbaru; jangan membuka kembali endpoint legacy tanpa otorisasi. Perubahan lokal belum di-commit, di-push, atau di-deploy.

## Pemulihan monitoring

Error EACCES pada server development berasal dari pembatasan koneksi jaringan proses lokal. Server development dijalankan ulang dengan akses jaringan normal, lalu endpoint admin terautentikasi berhasil membaca 11 pesanan dan 19 member dari backend existing (HTTP 200). Tidak ada penghapusan atau migrasi isi spreadsheet. Monitoring kini menampilkan status belum dimuat, bukan angka nol semu, sebelum pembacaan pertama berhasil; data hasil pembacaan sebelumnya dipertahankan bila refresh gagal.

Adapter environment mengacu pada https://open-api.netlify.com/ (createEnvVars/getEnvVar/setEnvVarValue). Perubahan environment membutuhkan build/deploy agar digunakan oleh server; belum ada deployment atau perubahan environment production dalam pekerjaan ini.

## Koneksi Netlify dikonfigurasi ? 14 November 2026

Setelah persetujuan eksplisit pengguna, token login existing disimpan pada .env.local (diabaikan Git) dan environment production project vartanaid. NETLIFY_INTEGRATION_TOKEN ditandai secret dengan scope Builds, Functions, Runtime; dua ID koneksi nonrahasia memakai scope bawaan paket. Netlify menolak Functions-only pada paket Personal, sehingga adapter pembuatan secret disesuaikan dengan tiga scope yang disetujui. Metadata ketiga variabel diverifikasi lewat API; tidak ada nilai token dicetak. Endpoint admin lokal mengembalikan HTTP 200 dan configured:true. Lima tes adapter credential serta TypeScript checking lulus setelah penyesuaian.

Konfigurasi environment production berubah hanya untuk tiga variabel koneksi tersebut. Belum ada deployment, commit, push, atau perubahan spreadsheet. Website live belum memuat kode dashboard lokal ini sampai rilis yang kelak disetujui. Commit/push tetap ditunda sampai pengguna kembali tanggal 24 November; tidak ada pekerjaan terjadwal otomatis.
