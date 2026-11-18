# Phase 01 — Security Hardening VARTANA

Implementasi lokal, 14 November 2026. Baseline source adalah commit `0f9504f`. Perubahan belum di-commit, belum di-push, dan belum di-deploy. Backend serta database production belum diperbarui oleh pekerjaan ini.

## Hasil implementasi

### Otorisasi backend dan pemisahan akses

`doPost` sekarang memeriksa signature seluruh operasi data sebelum menjalankan dispatcher. Pemeriksaan mencakup action, seluruh payload, timestamp dan nonce. `doGet` menolak pembacaan data internal tanpa jalur internal yang berasal dari permintaan terverifikasi. Parameter publik bernama `internalSecurity` atau `internalAdmin` tidak memberikan hak akses internal.

Endpoint publik langsung Apps Script dibatasi pada daftar capability yang hanya mengembalikan informasi versi fitur. Produk lengkap beserta HPP, costing/resep, inventory, data customer, konsinyasi, games admin, broadcast, serta operasi mutasi seluruhnya melewati otorisasi server.

Situs tetap menyajikan katalog, artikel, games dan fitur publik melalui API Next.js yang sesuai. Server tersebut membaca data backend menggunakan transport terotorisasi, kemudian mengembalikan kontrak publik existing. Cookie admin, autentikasi customer, dan verifikasi OTP tetap menjadi syarat pada jalur masing-masing. Mekanisme login/session Apps Script lama ditolak oleh dispatcher baru.

### Signature dan replay protection

Transport pada `lib/script-fetch.ts` menambahkan `rpcAuth` dengan HMAC-SHA256, timestamp lima menit, nonce acak dan versi protokol. JSON diubah ke ASCII escaped agar Unicode mempunyai representasi yang sama pada Node dan Apps Script. Signature melindungi nama action maupun isi permintaan. URL tujuan harus memakai HTTPS dengan hostname tepat `script.google.com`.

Nonce disimpan pada tab baru `SecurityNonces` di bawah ScriptLock. Validasi signature dilakukan sebelum tab disentuh. Nonce yang sudah digunakan ditolak, termasuk jika permintaan diproses instance berbeda yang memakai workbook sama. Entri kedaluwarsa dibersihkan dalam kelompok baris, dengan batas kapasitas untuk menghindari pertumbuhan tanpa batas.

Metadata transport dihapus sebelum bisnis dijalankan. Karena itu fingerprint transaksi existing tidak berubah akibat nonce baru pada retry. Permintaan ulang harus memakai signature/nonce baru dan business idempotency key yang sama. Jangan otomatis mengulang mutation yang hasilnya belum diketahui tanpa memeriksa hasil yang sudah tersimpan.

Signature internal existing untuk order, persediaan, akun dan games tetap dipertahankan di balik pemeriksaan transport baru. Nonce mencegah replay HTTP, sementara idempotency order dan event InventoryLedger tetap mencegah pencatatan transaksi ganda.

### Rate limiting dan proteksi request

- Login admin memakai batas 10 percobaan per akun per 15 menit, 40 per client per 15 menit, dan 200 secara global per jam. Batas ini menghitung percobaan berhasil dan gagal. Perlu ditinjau setelah pola penggunaan aktual tersedia.
- API publik memakai batas umum 300 request per client per menit dan batas per path 60 mutation atau 200 read per menit. Proteksi dilakukan pada proxy sebelum handler publik berjalan.
- Pada production, counter disimpan di tab baru `SecurityRateLimits` dengan ScriptLock. Backend yang tidak dapat memeriksa quota menghasilkan kegagalan tertutup, bukan bypass.
- Pada development, counter hanya berada di memori server lokal. Restart development mereset counter lokal. Ini menghindari penulisan quota ke workbook production selama pengembangan. Mode ini tidak dipakai jika `NODE_ENV=production`.
- Semua mutation API wajib berasal dari origin website yang sesuai. Proxy membatasi body 300.000 byte, termasuk body chunked tanpa Content-Length. Apps Script memeriksa batas terpisah 4 MiB sebelum parsing untuk menampung legacy inner proof dan Unicode escaping dari input yang sudah dibatasi Next.js.
- Respons API internal diteruskan dengan Cache-Control `no-store, private`.
- Login membedakan password salah, quota tercapai, JSON tidak valid dan layanan pemeriksaan keamanan tidak tersedia. Kegagalan backend tidak lagi ditampilkan sebagai kesalahan format login biasa.

Identitas client pada hosting memakai header Netlify `x-nf-client-connection-ip`. Sebelum rilis, pastikan deployment berada pada proxy Netlify yang menetapkan header tersebut. Host alternatif perlu menetapkan cara memperoleh IP terpercaya, bukan mempercayai header arbitrer dari internet.

### Perlindungan member dan riwayat belanja

Guest checkout mengirim penanda create-only untuk sinkronisasi master member. Order guest tetap menyimpan nama, email dan alamat pengiriman yang diberikan pada order, tetapi tidak menimpa master member yang sudah ada hanya karena nomor WhatsApp sama. Race antara dua checkout juga memakai perilaku create-only ini di dalam lock existing.

Endpoint `/api/member` memerlukan sesi akun customer yang valid. Email dan nomor WhatsApp harus sesuai profil terverifikasi, dan Apps Script memeriksa email pemilik sebelum memperbarui member yang sudah ada. Pengeditan member oleh admin tetap melalui jalur admin terotorisasi.

Riwayat belanja sekarang dibatasi pada pasangan WhatsApp dan email yang diverifikasi. Menambahkan order baru dengan nomor customer lain dan email berbeda tidak memindahkan penerima OTP riwayat lama atau memberikan akses ke pesanan email lain. Pencarian berdasarkan nomor pesanan dapat meminta OTP ke email pada pesanan tersebut, lalu akses tetap dibatasi pada identitas email yang diverifikasi.

Untuk pencarian WhatsApp, penerima default diambil dari email valid pada urutan order pertama yang cocok, sehingga order yang baru dimasukkan tidak dapat mengganti tujuan OTP lama. Riwayat dengan email berbeda dapat dibuka melalui pencarian nomor pesanan dan verifikasi email pada pesanan itu. Pemilihan email kanonik atau penggabungan akun lintas email memerlukan proses admin terverifikasi tersendiri.

### Caller existing dan berkas kerja

- `lib/master-products.ts` memakai transport baru, termasuk request yang sebelumnya menggunakan legacy GET privat.
- API admin produk, ingredients dan seluruh route konsinyasi yang melakukan HTTP langsung kini memakai transport yang sama.
- Dispatcher POST mencakup pembacaan terjemahan publik yang sebelumnya hanya menggunakan GET.
- Generator Apps Script menyertakan `apps-script/security-functions.txt` dan mempertahankan fragment sebagai sumber yang dapat disinkronkan ke Code.gs serta TXT distribusi.
- `.env.example` memuat nama konfigurasi tanpa credentials. Secret RPC khusus bersifat opsional. Jika `ADMIN_RPC_SECRET` diisi, nilainya harus sama dengan `VARTANA_RPC_SECRET` pada setiap target Apps Script. Jika keduanya tidak diisi, transport memakai pasangan secret existing `ADMIN_SESSION_SECRET` dan `VARTANA_ARTICLE_ADMIN_KEY`.
- Direktori backup lokal yang diabaikan Git, `app/api copy/`, dipindahkan ke `.qa-legacy-api-copy/` agar file route backup tidak ikut menjadi endpoint saat build lokal. Salinannya tetap tersedia di workspace. Restore untuk referensi sebaiknya tetap di luar direktori `app`.
- ESLint mengabaikan artefak browser/QA, output build dan backup. Aturan import disesuaikan untuk file `.cjs`, yang memang memakai CommonJS. Aturan lint TypeScript dan React tetap aktif.

UI, branding, struktur InventoryLedger, event stok dan penyimpanan Google Sheets existing tidak direstrukturisasi. Tab security baru dibuat hanya pada database fixture selama tes. Dua tab tersebut akan dibuat di target integrasi ketika request terotorisasi pertama dijalankan setelah persetujuan pemasangan.

## Bukti pengujian

| Pemeriksaan | Hasil |
| --- | --- |
| Seluruh regresi `node --test tests/*.test.cjs` | 322 lulus, 0 gagal |
| Kelompok security-hardening dan customer-order-access | 21 lulus, 0 gagal, termasuk dalam regresi penuh |
| TypeScript `npx.cmd tsc --noEmit` | Lulus |
| Build `npm.cmd run build` | Lulus setelah akses jaringan untuk Google Fonts tersedia |
| Lint seluruh workspace | 78 error dan 55 warning existing |
| Perbandingan lint dengan isi file pada HEAD | Baseline 78 error, hasil implementasi 78 error pada pemeriksaan yang sama, tanpa penambahan error |
| Login HTTP development dengan password salah | 401 |
| Login HTTP development dengan credentials akun lokal yang benar | 200, session authenticated |
| Pengiriman email atau mutation production oleh pengujian | Tidak dilakukan |

Lint belum bersih. Sebagian besar error existing terkait aturan React Hooks, memoization, explicit-any serta beberapa aturan kode lama. Perbandingan baseline menggunakan isi file `git show HEAD:<path>` dengan konfigurasi lint yang sama. Mengubah komponen UI terkait lint di luar Phase 01 belum dilakukan agar scope keamanan dan perilaku existing tetap terkontrol.

Log diagnostik lokal berada di `.qa-security-regression.log`, `.qa-security-evidence.log`, `.qa-security-tsc.log`, `.qa-security-build.log`, `.qa-security-lint.json`, dan `.qa-security-lint-baseline.json`. Berkas QA tersebut diabaikan Git. Tidak ada password atau secret asli yang dicetak pada hasil tes.

### Bukti perbaikan dua simulasi awal

| Simulasi pada handler Apps Script asli dengan fixture di memori | Sebelum Phase 01 | Setelah Phase 01 |
| --- | --- | --- |
| `deleteProduct` tanpa signature | Handler menghapus baris fixture | Ditolak dengan error otorisasi, deleteRow tidak dipanggil dan nonce sheet belum dibuat |
| `saveMember` tanpa signature | Email/nama fixture berubah | Ditolak, seluruh snapshot data sebelum dan sesudah identik |
| Penghapusan produk dengan signature valid | Jalur lama dapat berjalan | Tetap berhasil melalui jalur terotorisasi |
| Signature diubah atau payload ditamper | Belum dilindungi merata | Ditolak sebelum perubahan data |
| Nonce valid dipakai ulang | Belum tersedia guard transport umum | Ditolak, snapshot data tetap identik |
| OTP serial dari email berbeda pada nomor yang sama | Verifikasi berbasis nomor berpotensi memperluas akses | Hanya order dari email terverifikasi yang terlihat |

Bukti executable berada pada `tests/security-hardening.test.cjs` dan `tests/customer-order-access.test.cjs`. Test juga memeriksa interoperabilitas transport Node dengan dispatcher Apps Script asli, pemrosesan Unicode, cleanup nonce, quota persistent, retry bisnis, login valid serta brute-force throttling.

## Batas hasil dan hal yang masih perlu diuji

Pengamanan ini baru ada pada source lokal. Kerentanan pada deployment lama belum dianggap tertutup sampai seluruh target Apps Script dan website diperbarui serta deployment lama yang terbuka dinonaktifkan.

Pengujian integrasi penuh terhadap Apps Script sandbox, latency/rate-limit pada beberapa instance Netlify, trusted IP header hosting, dan pemeriksaan browser mobile/desktop masih menjadi syarat sebelum rilis. Tes fixture belum menggantikan pemeriksaan izin Google, deployment target serta konfigurasi secret sebenarnya.

Counter production menambah satu RPC pemeriksaan pada request API publik. Nonce dan quota menggunakan operasi Sheets di bawah lock. Dampak latency, contention, biaya compute dan volume tab perlu diukur pada sandbox sebelum menetapkan batas production final. Tinjau limit global login agar akses admin tetap sesuai kebutuhan operasional.

Google Authenticator/2FA admin belum ditambahkan pada Phase 01 ini. Implementasinya memerlukan enrollment TOTP, penyimpanan secret yang terlindungi, recovery code serta alur kehilangan perangkat. Sesi admin existing tetap menggunakan masa berlaku yang ada. Rotasi secret sesi dapat dipakai untuk mencabut seluruh sesi saat diperlukan.

## Migration plan sebelum pemasangan

1. Setelah izin pemasangan diberikan, inventarisasi seluruh URL Web app aktif dari GOOGLE_SCRIPT_URL, NEXT_PUBLIC_GOOGLE_SCRIPT_URL dan KONSINYASI_GOOGLE_SCRIPT_URL. Bedakan deployment yang mengarah ke project/workbook berbeda. Semua project data yang dapat diakses publik harus masuk cakupan pemasangan.
2. Simpan snapshot kode, manifest, konfigurasi nama variabel dan daftar deployment aktif. Backup workbook dengan akses terbatas. Simpan credentials di secret manager atau pengaturan server, bukan berkas laporan atau Git.
3. Siapkan spreadsheet dan project Apps Script sandbox dengan data sintetis. Gunakan secret sandbox yang berbeda. Jangan menjalankan tes mutation lokal ke workbook production.
4. Pasang source baru ke sandbox setelah izin yang sesuai. Set property secret, lalu pastikan capability `getSecurityCapabilities` mengembalikan securityVersion 1.
5. Arahkan environment lokal integrasi ke sandbox. Uji signed read/write produk, promo, member, inventory, konsinyasi, artikel, akun, checkout, games dan broadcast menggunakan alamat email pengujian yang disetujui.
6. Periksa tab SecurityNonces dan SecurityRateLimits, retensi entri, cleanup, concurrency, serta penolakan request tanpa otorisasi. Verifikasi ledger dan idempotency order tidak berubah akibat retry.
7. Tetapkan satu secret RPC untuk setiap pasangan Next.js/Apps Script yang berkomunikasi. Jika memisahkan secret baru, siapkan property dan env pasangannya sebelum traffic dialihkan.
8. Selesaikan peninjauan lint existing atau terima batasannya secara eksplisit untuk rilis keamanan, lalu minta persetujuan rilis dengan bukti tes sandbox dan rencana maintenance.

## Urutan deployment yang kompatibel

Source baru menggunakan backend dengan guard transport. Caller lama yang tidak menandatangani request akan ditolak backend strict. Backend lama juga belum mendukung semua metadata proof baru. Karena itu deploy terpisah tanpa koordinasi dapat memutus operasi, sehingga diperlukan perpindahan target yang terencana.

1. Siapkan kandidat deployment Apps Script strict pada URL baru, dengan binding ke workbook yang disetujui. Jangan menimpa URL yang sedang dipakai website sebelum bundle Next.js kandidat dan konfigurasi target siap.
2. Verifikasi kandidat menggunakan signed smoke tests. Panggilan unsigned privat harus gagal. Seluruh URL backend konsinyasi yang berbeda memerlukan kandidat dan pemeriksaan serupa.
3. Siapkan bundle Next.js kandidat dengan env server-only mengarah ke URL strict dan secret yang sesuai. Perbarui seluruh URL legacy yang masih dibutuhkan caller. Produksi memerlukan counter persistent, bukan mode development.
4. Jadwalkan maintenance singkat untuk operasi mutation admin/checkout saat perpindahan. Hindari dua versi website melakukan mutation yang saling berbeda aturan pada saat yang sama.
5. Dengan persetujuan rilis, aktifkan bundle website dan konfigurasi kandidat secara terkoordinasi. Verifikasi login, pembacaan internal, storefront publik, checkout, stok dan riwayat. Email tes hanya dikirim ke penerima yang disetujui.
6. Setelah perpindahan berhasil, arsipkan/nonaktifkan semua deployment lama yang masih memberikan akses privat tanpa otorisasi. Mengubah env website saja tidak menutup URL backend lama yang sudah diketahui pihak lain.
7. Pantau penolakan signature/replay, quota, timeout, tab security, order retry dan respons login 429/503. Pertahankan daftar versi aman untuk rollback.

Tahapan ini merupakan panduan untuk pelaksanaan setelah persetujuan. Tidak ada langkah deployment atau perubahan database production yang dieksekusi selama Phase 01 lokal.

## Rollback plan

- Sebelum rilis, siapkan pasangan Apps Script dan Next.js yang keduanya mendukung transport terotorisasi. Rollback harus memakai pasangan yang kompatibel tersebut.
- Bila bundle UI bermasalah, pertahankan guard Apps Script dan transport security saat mengembalikan perubahan aplikasi lainnya. Jangan membuka kembali aksi unsigned sebagai cara memperbaiki akses.
- Bila secret atau URL tidak cocok, koreksi pasangan env/property atau alihkan kembali ke pasangan versi aman yang telah diuji. Endpoint mengembalikan kegagalan tertutup selama konfigurasi tidak cocok.
- Bila traffic menyebabkan contention, kurangi beban dengan maintenance mutation sementara dan sesuaikan limit setelah observasi. Jangan melepas nonce validation atau otorisasi.
- SecurityNonces dan SecurityRateLimits tidak mengubah ledger bisnis. Simpan keduanya saat rollback supaya nonce yang pernah dipakai belum dapat diputar ulang. Jangan menghapus tab bisnis atau mengembalikan backup workbook secara menyeluruh tanpa rekonsiliasi transaksi setelah snapshot.
- Bila terjadi order parsial atau respons timeout saat perpindahan, cari berdasarkan Order Key/serial dan baca ledger sebelum retry. Pengiriman email berstatus tidak pasti diperiksa melalui riwayat existing.
- Setelah mitigasi, jalankan ulang smoke tests signed/unsigned dan cek jumlah order, member serta ledger. Catat versi, waktu perpindahan dan operator dalam log rilis yang disetujui.
