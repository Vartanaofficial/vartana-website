# Uji DOKU production dari checkout localhost

## Batas pengujian

Ini uji admin pada development localhost, bukan aktivasi DOKU untuk seluruh customer. BCA/QRIS manual tetap berfungsi. Flag supported DOKU production storefront tetap false sampai integrasi notifikasi dan rekonsiliasi siap dirilis.

1. Login admin lokal, buka `/admin/integrations`, pilih DOKU.
2. Pada panel **Uji DOKU production di localhost**, isi Client ID dan Active Secret Key. Credential hanya disimpan sementara dalam memori server development. Secret Netlify tidak diambil kembali ke laptop.
3. Klik **Siapkan sesi uji lokal**; kembali ke `/checkout` dan refresh. Pilihan **DOKU production (uji lokal)** muncul hanya untuk admin lokal yang sesi DOKU-nya siap.
4. User menambahkan produk uji melalui admin dan memastikan stok tercatat. Harga produk yang diminta Rp1.000; total DOKU mengikuti quote server termasuk ongkir dan promo, bukan hardcode Rp1.000.
5. Pilih DOKU dan lanjut. Dialog menyebut total uang asli dan bahwa order akan tercatat di spreadsheet. Tagihan hanya dibuat setelah user mengonfirmasi dan men-submit checkout.
6. Buka halaman pembayaran DOKU dari receipt. Pembayaran dilakukan pengguna sendiri. Setelah pembayaran tunggu minimal 60 detik sebelum memeriksa status.
7. Pemeriksaan server memastikan invoice dan nominal cocok. Hanya SUCCESS dianggap lunas oleh tampilan hasil DOKU. Status order Sheets belum diperbarui otomatis oleh polling ini; admin memeriksa transaksi dan mengonfirmasi melalui operasional existing. Webhook publik belum dipasang/deploy.

## Implementasi dan keamanan

- Signed request HMAC SHA256 dari server ke endpoint production DOKU, digest SHA256 body untuk POST, tanpa digest untuk GET.
- Domain halaman pembayaran dibatasi HTTPS DOKU.
- Pembayaran baru dibatasi total Rp1.000–Rp100.000 untuk uji lokal ini.
- DOKU request dibuat setelah order existing berhasil tersimpan. Jika pembuatan link gagal, cart/orderKey tetap dapat dicoba kembali untuk order yang sama; backend tidak mengulang pembuatan tagihan secara buta saat hasil sebelumnya belum pasti.
- Riwayat invoice/link/nominal ditulis pada `.qa-doku-checkout.json` yang diabaikan Git; tidak menyimpan credential.
- Satu request ID stabil diturunkan dari checkout key. Retry mengembalikan link yang tercatat tanpa POST pembayaran baru. Permintaan berstatus tidak pasti harus diperiksa di dashboard DOKU.
- Route konfigurasi dan cek status memerlukan session admin, Origin yang benar, NODE_ENV development dan hostname localhost. Pada deployment production fitur uji tidak diizinkan.
- Tidak menambahkan callback URL localhost palsu. Mengandalkan API cek status untuk trial; webhook publik wajib disiapkan untuk integrasi otomatis penuh.

## Validasi lokal

343 regression/security test lulus. TypeScript checking, lint file DOKU baru, dan production build lokal lulus. HTTP lokal readiness menghasilkan 200 dan localAdmin:true; credential lokal belum diisi (ready:false). Tidak ada API create-payment production dipanggil oleh agent, tidak ada pembayaran, dan tidak ada penulisan test order ke spreadsheet pada validasi ini. Pengujian DOKU menggunakan mock transport. Validitas credential dan channel merchant baru terbukti setelah user melakukan trial.

Tidak ada commit, push, atau deployment; menunggu instruksi pengguna yang sebelumnya menetapkan penundaan sampai kembali tanggal 24 November.

## Referensi resmi

- [DOKU Checkout backend](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration)
- [Signature POST](https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-component-from-request-header)
- [Signature GET](https://developers.doku.com/get-started-with-doku-api/signature-component/non-snap/signature-from-api-get-method)
- [Check status dan jeda 60 detik](https://developers.doku.com/get-started-with-doku-api/check-status-api/non-snap)

## Perbaikan kompatibilitas otorisasi checkout lokal

Backend production existing terkonfirmasi read-only belum memiliki getSecurityCapabilities (HTTP 200, found:false). Metadata rpcAuth dari transport Phase 01 ikut dibandingkan sebagai rincian order pada backend lama. Untuk development saja, setelah penolakan persis pada pemeriksaan proof V3 sebelum penulisan, caller memverifikasi ulang HMAC inner saveOrder beserta kesamaan payload dan jendela waktu, memastikan backend legacy melalui capability GET, lalu mengirim ulang payload dengan tanda tangan inner tanpa metadata outer baru. Jalur ini hanya berlaku saveRetailOrderV3; tidak berlaku produksi Next.js, mutasi master, atau payload tanpa otorisasi. Backend hardened tetap memakai nonce-protected RPC. Tujuh tes relevan, TypeScript dan lint perubahan lulus. Tidak ada order, stok, atau tagihan production dibuat selama verifikasi. Credential DOKU lokal masih belum tersedia; user perlu memasukkan credential untuk sesi lokal sebelum pilihan DOKU aktif.

## Konflik server lokal ditemukan

Port 3000 ditempati dua listener: VARTANA pada IPv6 wildcard dan ai-content-factory pada IPv4 loopback. Permintaan localhost dapat mencapai project berbeda. Proses VARTANA yang sudah diverifikasi dipindahkan ke http://127.0.0.1:3001; project ai-content-factory tidak dihentikan. Gunakan host dan port VARTANA ini untuk admin serta checkout agar payload memakai source yang benar. Server restart mengosongkan credential DOKU yang disimpan sementara di memori; isi ulang sesi lokal bila diperlukan.
