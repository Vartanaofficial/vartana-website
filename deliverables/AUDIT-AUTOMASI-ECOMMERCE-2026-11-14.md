# Audit dan rencana automasi e-commerce VARTANA

Tanggal pemeriksaan 14 November 2026. Basis audit adalah repository lokal pada commit `0f9504f`, instruksi proyek, dokumentasi provider resmi, dan regresi lokal.

## Ringkasan keputusan

Checkout yang tersedia layak dijadikan dasar pengembangan. Harga produk, promo, voucher, dan stok sudah diperiksa pada server. Pembayaran yang digunakan adalah transfer BCA serta QRIS statis, kemudian dikonfirmasi admin. Pengiriman menggunakan tarif Biteship jika dikonfigurasi atau estimasi per wilayah. Adapter DOKU, iPaymu, dan KiriminAja belum ditemukan dalam alur aktif.

Prioritas sebelum automasi pembayaran adalah menutup akses Apps Script lama yang belum terotorisasi, memisahkan status pembayaran dan pemenuhan, menetapkan satu pencatat stok, serta menambahkan penyimpanan transaksi dan event yang tahan pengulangan. Integrasi baru sebaiknya mengikuti kontrak service di belakang UI checkout yang tersedia.

Laporan ini merupakan hasil audit dan usulan implementasi untuk persetujuan. Satu-satunya berkas baru yang dibuat adalah laporan ini. Source aplikasi, konfigurasi, Apps Script, project ERP, dan deployment tetap pada kondisi sebelum audit.

## 1. Ruang lingkup dan bukti pemeriksaan

- Membaca `AGENTS.md`, README, manifest, konfigurasi hosting, struktur app/lib/apps-script/tests, serta alur checkout, produk, promo, akun, pelacakan, admin, transport RPC, dan ledger stok.
- Memeriksa source Apps Script yang tersimpan di repository. Temuan akses langsung bersifat analisis kode dan manifest, bukan pengujian serangan ke deployment publik.
- Menjalankan `node --test tests/*.test.cjs` secara lokal. Hasilnya 305 tes lolos, 0 gagal. Tes menggunakan fixture/mocking pada layanan eksternal.
- Pemeriksaan keamanan lanjutan melalui `doPost` asli dengan spreadsheet fixture di memori membuktikan bahwa pembaruan member dan penghapusan produk diterima tanpa signature atau sesi. Kedua simulasi tidak memakai jaringan atau data produksi. Ini mengonfirmasi perilaku source lokal, sedangkan kesesuaian deployment publik masih perlu diperiksa.
- Membandingkan rancangan gateway dengan dokumentasi resmi DOKU, iPaymu, KiriminAja, Netlify, dan Google.
- Audit ini belum mencakup pemeriksaan visual browser desktop/mobile, uji beban, audit dependency/CVE menyeluruh, build production baru, panggilan gateway sandbox, atau pencocokan source dengan deployment live. Keberhasilan tes lokal tidak membuktikan keberhasilan transaksi provider.
- Credentials production belum tersedia sesuai konteks pengguna. Status aktivasi channel, biaya merchant, paket Netlify, konfigurasi runtime live, dan kontrak API ERP belum diverifikasi.

## 2. Struktur project saat ini

| Area | Lokasi | Fungsi |
| --- | --- | --- |
| Framework | `package.json` | Next.js 16.3.1, React 19.2.8, TypeScript, Tailwind CSS 4 |
| Storefront | `app/page.tsx`, `app/katalog/`, `app/components/` | Home, belanja, navigasi, gambar, bahasa, radio |
| Checkout | `app/checkout/page.tsx`, `lib/checkout*.ts` | Keranjang, alamat, quote, promo, penyimpanan order, halaman bayar |
| API checkout | `app/api/checkout/quote/route.ts`, `app/api/checkout/order/route.ts` | Kalkulasi dan validasi server |
| Admin | `app/admin/`, `app/admin-access/`, `proxy.ts` | Order, stok, produk, member, promo, konsinyasi, produksi, laporan |
| Akun dan riwayat | `app/akun/`, `app/api/customer/account/`, `app/api/track/` | Login email/password, reset via OTP, profil, riwayat terverifikasi |
| Backend data | `apps-script/Code.gs`, fragment `apps-script/*-functions.txt` | Google Sheets, ledger, akun, notifikasi, games |
| Transport | `lib/master-products.ts`, `lib/google-fetch.ts`, `lib/puzzle-server.ts` | RPC, timeout, redirect Google, signature HMAC |
| Generator backend | `scripts/sync-games-backend.cjs` | Menggabungkan fragment dan menyelaraskan TXT distribusi |
| Hosting | `netlify.toml` | Build `npm run build`, publish `.next`, Node 22 |
| Pengujian | `tests/*.test.cjs` | Unit, fixture Apps Script, route, regresi alur |

`midtrans-client` tercantum sebagai dependency, tetapi pemakaiannya pada alur payment aktif tidak ditemukan. Keberadaan package tersebut belum menunjukkan integrasi gateway yang berjalan.

README root masih berupa template Next.js. README Apps Script menyebut deployment versi lama sehingga belum cukup menjadi runbook operasional terkini. Berkas `.env.example` belum tersedia. Banyak backup berada dalam workspace dan sebagian berkas backup lama masih dilacak Git. Direktori `app/api copy/` ada secara lokal dan diabaikan Git, tetapi tetap perlu dipastikan tidak menjadi route saat build dari workspace tersebut. Inventaris dan pembersihannya perlu terkontrol setelah persetujuan, dengan riwayat Git sebagai rujukan.

## 3. Audit checkout

| Kebutuhan | Kondisi sekarang | Pekerjaan lanjutan |
| --- | --- | --- |
| Identitas customer | Nama, email, WhatsApp, profil akun, guest checkout | Hubungkan order dengan identitas akun tervalidasi tanpa menghilangkan guest checkout |
| Alamat | Provinsi, kota, kecamatan dari Emsifa, alamat bebas, kode pos otomatis/manual | Tambahkan ID kelurahan tersendiri dan pemetaan ID provider |
| Kelurahan | Nama beberapa kelurahan ditampilkan dalam opsi kelompok kode pos | Pilihan sekarang menyimpan kode pos, belum satu kelurahan terstruktur |
| Produk dan jumlah | SKU/qty diposting, server membaca master dan memeriksa harga serta stok | Simpan snapshot item, harga, diskon, dan berat per baris secara permanen |
| Berat | Berat varian/master dikalikan qty, termasuk barang hadiah | Tetapkan apakah `Weight Gram` adalah berat kirim atau berat isi, lalu tambah berat packaging yang belum tercakup |
| Tarif dan kurir | Quote server tersedia, pilihan layanan dan estimasi tampil | Gunakan service ongkir tunggal dengan quote ID dan masa berlaku |
| Voucher | Persen, nominal, ongkir, bonus, tebus murah, stacking, voucher games | Pertahankan aturan dan tambahkan aturan pelepasan voucher pada pembatalan/expiry |
| Gratis ongkir | Validasi syarat dan Jabodetabek tersedia di server | Validasi wilayah menggunakan mapping provider yang disetujui |
| Total | Server menghitung subtotal, reward, diskon dan ongkir | Simpan versi kalkulasi serta snapshot quote pada order |
| Nomor order | Order Key UUID, serial unik server dan retry order yang sama | Tetapkan serial tersebut sebagai merchant invoice reference dengan mapping attempt provider |
| Halaman bayar | Transfer BCA, QRIS statis, konfirmasi WhatsApp | Tambahkan hosted checkout provider sebagai pilihan bertahap |

Browser menggunakan debounce quote 250 ms, pembatalan request lama, timeout quote 25 detik, timeout submit 45 detik, dan perlindungan klik submit berulang. Master quote dibagi pada cache proses selama 60 detik, sedangkan submit membaca master terkini. Ini merupakan fondasi optimasi yang perlu dipertahankan.

Reservasi stok dimulai ketika order disimpan dan halaman pembayaran muncul. Membuka WhatsApp belum menjadi syarat terjadinya reservasi pada kode sekarang. Setelah 30 menit tanpa konfirmasi pembayaran admin, reservasi tidak lagi mengurangi stok tersedia. Baris ordernya tetap ada dengan status menunggu pembayaran. Belum ada status pembayaran EXPIRED tersendiri maupun job expiry yang menuliskan peristiwa tersebut.

Sumber utama pemeriksaan adalah `lib/checkout.ts`, `app/api/checkout/order/route.ts`, `lib/checkout-master.ts`, `lib/postal-codes.ts`, dan `apps-script/retail-stock-functions.txt`.

## 4. Audit pembayaran existing dan rancangan provider

Pembayaran sekarang terdiri dari transfer BCA dan gambar QRIS merchant di `/vartana-qris.jpeg`. Customer mengisi nominal sesuai total dan mengirim bukti lewat WhatsApp. Admin menyimpan status pembayaran diterima. Belum ditemukan payment request provider, QRIS dinamis, VA otomatis, webhook payment, inquiry, settlement, refund API, atau ledger payment attempt.

### Kontrak payment yang direkomendasikan

Gunakan satu `PaymentService` dengan adapter `DokuProvider`, `IpaymuProvider`, `ManualProvider`, dan `MockProvider`. Kontrak memuat `createPayment`, `getPaymentStatus`, `verifyWebhook`, dan `requestRefund` jika provider/channel mendukung. Return type internal membawa provider, payment attempt ID, external transaction ID, merchant reference, amount, currency, status, expiry, URL bayar, serta kemampuan channel. Refund yang tidak didukung harus menghasilkan status kemampuan yang jelas.

Semua adapter memanggil service order yang sama. Provider tersimpan pada setiap payment attempt sehingga perubahan konfigurasi default tidak mengubah pemrosesan transaksi lama. Fallback ke provider alternatif harus merupakan pilihan yang terkontrol setelah memastikan attempt sebelumnya belum berhasil dibuat. Timeout provider dapat terjadi setelah provider menerima permintaan, sehingga membuat payment kedua secara otomatis berisiko menagih dua kali.

DOKU Checkout mengembalikan URL pembayaran melalui API backend dan memakai header Client-Id, Request-Id, Request-Timestamp, serta Signature. Verifikasi notifikasi memerlukan signature dengan komponen path dan digest body sesuai dokumentasi. Simpan raw body sebelum parsing. [DOKU Checkout](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration), [notifikasi DOKU](https://developers.doku.com/get-started-with-doku-api/notification/best-practice)

iPaymu memisahkan credentials sandbox dan production. Signature permintaan API memakai API Key, sementara dokumentasi callback saat ini menetapkan X-Signature dan Merchant VA untuk verifikasinya. Implementasikan algoritma callback khusus sesuai content-type dan normalisasi yang didokumentasikan, lalu cocokkan reference, transaksi, nominal dan status dengan record lokal. Jika bukti callback tidak memadai, lakukan inquiry server sebelum menetapkan PAID. [iPaymu API](https://docs.ipaymu.com/en/docs), [callback iPaymu](https://docs.ipaymu.com/en/docs/callback)

Channel QRIS dinamis, VA, dan e-wallet baru dapat dinyatakan siap setelah sandbox serta aktivasi merchant/channel diverifikasi. Redirect browser hanya membuka halaman status dan memicu pembacaan status server. Redirect tidak melakukan transisi PAID.

## 5. Audit ongkos kirim dan rancangan KiriminAja

Ada dua implementasi ongkir. Jalur checkout utama berada di `lib/checkout.ts`, sedangkan `/api/shipping` merupakan jalur lain yang juga memanggil Biteship. Keduanya berbeda dalam cara memasang Authorization, timeout, dan fallback. Route lama menggunakan `BINDERBYTE_API_KEY` sebagai alternatif key untuk endpoint Biteship, yang perlu diperbaiki pada tahap implementasi karena credentials tersebut tidak dapat diasumsikan saling menggantikan.

ID kecamatan yang dikirim checkout berasal dari Emsifa. Belum ada mapping yang membuktikan ID tersebut cocok dengan `destination_area_id` Biteship atau ID wilayah KiriminAja. Ini berpotensi menyebabkan tarif gagal atau salah tujuan ketika API asli diaktifkan. Fallback ongkir saat ini dihitung berdasarkan nama provinsi dan pembulatan berat per kilogram, dengan label estimasi. Nama provinsi belum selalu diverifikasi server kecuali diperlukan untuk promo wilayah.

Rancangan memakai `ShippingService` dengan `KiriminAjaProvider`, adapter jalur existing, dan `MockShippingProvider`. Kontrak mencakup pencarian wilayah, quote, pembuatan shipment, pickup, label, tracking, dan cancel berdasarkan kemampuan provider. KiriminAja menyediakan coverage, pricing, shipment/AWB, pickup, dan tracking/callback. Provider memakai ID wilayah sendiri serta berat dalam gram. [Dokumentasi resmi KiriminAja](https://developer.kiriminaja.com/)

Pisahkan Emsifa ID, provider district ID, provider subdistrict ID, dan kode pos. Tarif terpilih membawa provider, service code, chargeable weight, amount, masa berlaku dan fingerprint alamat. Saat submit, server memeriksa quote tersebut lagi. Kunci cache quote harus mencakup origin, tujuan, berat, nilai barang, layanan serta opsi asuransi/COD yang relevan.

Pickup merupakan tindakan admin setelah PACKING selesai dan status READY_TO_SHIP. Konfirmasi admin dicatat beserta waktu dan ID permintaan. Bila endpoint provider menggabungkan create shipment dengan pickup, adapter harus menyesuaikan agar panggilan yang menjadwalkan pickup tetap menunggu konfirmasi admin. Mekanisme autentikasi webhook KiriminAja perlu dikunci berdasarkan kontrak/dokumentasi endpoint yang dipilih. Callback tanpa autentikasi yang dapat dibuktikan harus dikonfirmasi lewat inquiry API sebelum perubahan penting.

## 6. Database, stok, dan struktur order

Google Sheets yang diakses Apps Script merupakan penyimpanan utama yang ditemukan. Belum ada database SQL atau schema ORM pada aplikasi ini. Keranjang disimpan di localStorage, sedangkan draft/receipt checkout disimpan di browser. Data browser menjadi input, lalu server melakukan validasi.

| Tab/kelompok | Data existing |
| --- | --- |
| Products, Pricing, Promotions, Ingredients | Master SKU, harga, promo, bahan |
| Orders | Serial, member/customer, kontak, alamat, SKU, ringkasan, nominal produk/ongkir/diskon, total, status, resi |
| Kolom tambahan Orders | Order Key, Payment Method, Inventory Items JSON, Stock Reservation Until, promo/reward, status email |
| Members | Identitas member serta alamat lama |
| CustomerAccounts/Sessions/Codes/Logins | Password hash, profil, token hash, OTP, percobaan login |
| InventoryLedger, InventoryConfig, InventoryBatches | Mutasi stok, batas stok, batch, expiry, kualitas |
| ProductCosting, RawMaterials, ProductionOrders, OperatingExpenses | HPP, bahan, resep, produksi, biaya |
| OrderEmailNotifications | Antrean email tahap order dan status kirim |
| KON_* dan KON_SALES_LEDGER | Konsinyasi, SO, BAST, stok mitra, penjualan, setoran |
| Game*, Puzzle*, MemberCampaigns | Games, voucher, email hadiah, broadcast |

`Inventory Items` memuat SKU dan qty, sedangkan ringkasan barang masih berupa teks. Belum tersedia snapshot terstruktur item yang lengkap dengan unit price, discount, tax jika relevan, gross weight, dan total line. Data alamat dan kurir pada Orders juga belum seluruhnya menjadi field terpisah.

Reservasi dihitung dari Orders aktif. Pemakaian stok fisik dicatat di InventoryLedger menggunakan event `ORDER:<serial>` ketika admin memilih pesanan disiapkan, dikirim atau selesai. Event yang sama tidak diterapkan dua kali. Pada tahap pembayaran diterima, stok tetap tertahan melalui reservasi. Stok yang belum dicatat diperlakukan tidak tersedia untuk pembelian.

ScriptLock dan idempotency yang ada mengurangi race condition. Namun lock bukan transaksi database dengan rollback. Penyimpanan order, promo, profil dan email melibatkan beberapa write. Kegagalan setelah append order tetapi sebelum write berikutnya dapat meninggalkan record parsial yang harus dapat diperbaiki pada retry. Mengirim email notifikasi order baru masih terjadi di dalam lock penyimpanan order dan dapat memperpanjang waktu checkout serta menahan operasi stok lain.

### Tambahan data yang diusulkan

Pertahankan master yang ada. Tambahkan record transaksi yang belum tersedia, melalui repository abstraction pada penyimpanan yang disetujui.

- Orders diperluas dengan `paymentStatus`, `fulfillmentStatus`, `version`, snapshot customer/address/item/shipping quote, currency, dan payment expiry.
- PaymentAttempts menyimpan setiap percobaan provider beserta idempotency key, referensi eksternal dan status.
- PaymentEvents/WebhookInbox menyimpan event terverifikasi, fingerprint payload, hasil proses dan retry.
- Shipments menyimpan provider order ID, AWB, layanan, label, status dan waktu pickup.
- OrderStatusHistory menyimpan aktor, status lama/baru, alasan, request ID dan timestamp.
- IntegrationOutbox/ERP mappings menyimpan pekerjaan sinkronisasi, external ID dan status pengiriman.
- Refunds/Settlements menyimpan nominal, biaya, status dan referensi untuk rekonsiliasi.

Tabel/tab tersebut menampung jenis transaksi baru, bukan salinan master produk atau member. Tahap mock dapat menggunakan repository in-memory khusus tes. Uji integrasi lokal memakai fixture atau spreadsheet sandbox terpisah. Sebelum memilih database produksi baru, periksa fasilitas penyimpanan yang sudah disediakan ERP. Google Sheets dapat dipertahankan sementara melalui adapter, dengan batas concurrency dan recovery yang diuji. Penyimpanan webhook wajib persisten sebelum respons sukses diberikan.

## 7. Autentikasi dan keamanan

### Kontrol yang sudah tersedia

- Admin memiliki cookie HTTP-only dengan signature HMAC, masa berlaku delapan jam, Secure pada production, dan pemeriksaan session pada proxy serta sejumlah route.
- Akun customer memakai email/password, scrypt dengan salt, token sesi acak yang disimpan sebagai hash, dan reset password melalui OTP email. Password minimum saat ini enam karakter sesuai permintaan sebelumnya.
- OTP memiliki expiry, pembatasan percobaan, binding browser dan batas frekuensi. Login customer juga mempunyai limit pada Apps Script.
- Pencarian riwayat order memerlukan verifikasi email dan sesi singkat, lalu hasil publik membatasi field customer.
- Banyak RPC sensitif telah ditandatangani HMAC dengan jendela waktu lima menit. Order baru memakai `saveRetailOrderV3`, memvalidasi payload dan stok pada backend.
- Banyak route akun/admin sudah memeriksa Origin. Harga pada checkout resmi dihitung server, disertai pemeriksaan expected total.

### Temuan prioritas

| Prioritas | Temuan kode | Dampak dan tindakan yang diusulkan |
| --- | --- | --- |
| P0 / kritis | Manifest Apps Script mengizinkan ANYONE_ANONYMOUS dengan executeAs USER_DEPLOYING. Cabang `createProduct`, `updateProduct`, `deleteProduct`, pricing, promotion, saveIngredient, saveMember dan sejumlah operasi konsinyasi belum melewati guard HMAC global | Seseorang yang mengetahui URL dapat berpotensi menjalankan operasi tersebut langsung, melewati proxy Next. Tetapkan allowlist publik dan wajibkan otorisasi setiap aksi privat di Apps Script serta seluruh caller terkait |
| P1 / tinggi | `getInventory`, `getRawMaterials`, `getProductCosting`, dan sejumlah `getKonsinyasi*` dapat dijangkau dari dispatcher publik | Berpotensi membuka HPP, resep, biaya, data mitra dan informasi operasional. Pisahkan response publik dan internal serta otorisasi setiap read privat |
| P1 / tinggi | `saveMember` publik melakukan upsert berdasarkan WhatsApp, tanpa verifikasi kepemilikan | Berpotensi mengubah data member. Batasi lewat service terotorisasi dan sesi/konteks yang sesuai |
| P1 / tinggi | `/api/admin/auth/login` belum memiliki rate limiter eksplisit pada source | Tambahkan limit berbasis akun dan IP yang persisten, delay bertahap serta audit percobaan |
| P1 / tinggi | HMAC RPC menerima timestamp dalam jendela lima menit, tanpa nonce persisten umum | Tambahkan dedup event/request ID pada setiap operasi non-idempotent. Signature saja tidak menjamin satu kali proses |
| P1 / tinggi | Payment state dan fulfillment state masih satu status dengan pilihan yang dapat diubah admin | Tambahkan transition rules, audit trail dan kontrol pembayaran terlambat supaya status tidak mundur karena callback lama |
| P1 / tinggi | Operasi multi-write Sheets dan email dalam lock | Rancang recovery untuk partial write, inbox/outbox persisten, idempotency di tingkat record |
| P2 / sedang | Checkout dan quote publik belum mempunyai rate limiting/body limit yang seragam | Proteksi penyalahgunaan API provider, quota email dan beban Apps Script |
| P2 / sedang | Beberapa jalur menulis input ke Sheets belum memakai escape formula yang seragam | Audit spreadsheet formula injection untuk seluruh string customer/admin/provider |
| P2 / sedang | Secret sesi admin dipakai juga sebagai secret RPC umum | Pisahkan secret berdasarkan tujuan, dukung rotasi dan periksa caller saat migrasi |
| P2 / sedang | Minimum password enam karakter termasuk angka saja | Pertahankan preferensi yang ada pada tahap audit, lalu andalkan throttling/OTP dan ajukan penguatan tambahan bila risiko akun meningkat |

Jalur `getAdminData`/`fetchOrders` telah menolak akses tanpa internal admin marker yang berasal dari RPC bertanda tangan. Fallback pembuatan order tanpa action resmi juga telah ditutup. Temuan P0 di atas berlaku pada cabang lain yang masih terbuka. Ini bukan klaim bahwa seluruh endpoint tidak memiliki perlindungan.

URL Apps Script yang muncul di frontend bukan secret pengganti otorisasi. Restriksi CORS juga tidak mencegah pemanggilan langsung dari server lain. Pemeriksaan wajib dilakukan pada backend data itu sendiri.

Untuk webhook gateway, validasi signature sesuai provider, jumlah uang IDR sebagai integer, currency, merchant/invoice reference, provider transaction ID dan status yang sah. Simpan provider event ID atau dedup key berdasarkan field stabil. Timestamp/replay rules harus menghormati retry provider yang valid, bukan menolak semua event berusia lama dengan aturan generik. Batasi payload, sanitasi log dan jangan menaruh secret, OTP, token atau PII lengkap pada log.

## 8. Status order dan alur transaksi yang direkomendasikan

Simpan payment status terpisah dengan nilai `UNPAID`, `PENDING`, `PAID`, `FAILED`, `EXPIRED`, dan `REFUNDED`. Simpan fulfillment status `AWAITING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `PACKING`, `READY_TO_SHIP`, `SHIPPED`, `DELIVERED`, `COMPLETED`, dan `CANCELLED`.

Untuk pembayaran sebagian/refund sebagian, simpan nominal paid/refunded dan status refund pada record terpisah. Gunakan REFUNDED pada payment utama setelah refund penuh selesai, tanpa menghilangkan bukti pembayaran terdahulu.

1. Server membangun quote dari master dan stok terkini, lalu menyimpan order, snapshot serta reservasi 30 menit secara idempotent.
2. Payment attempt dibuat dengan key stabil. Respons yang ambigu masuk proses inquiry/reconciliation sebelum attempt baru diizinkan.
3. Webhook diverifikasi dan disimpan pada inbox persisten. Balas sukses setelah event tersimpan, lalu proses secara idempotent dengan compare-and-set/version atau lock yang sesuai.
4. Pembayaran valid mengubah payment ke PAID dan fulfillment ke CONFIRMED. Pertahankan reservasi/komit stok sesuai satu kebijakan yang disetujui.
5. Untuk kompatibilitas awal, debit InventoryLedger tetap pada PROCESSING dengan event `ORDER:<serial>`, mengikuti perilaku existing. Webhook pembayaran tidak menambah debit stok kedua.
6. Admin mengemas pesanan dan mengonfirmasi pickup setelah READY_TO_SHIP. Shipment dan pickup mempunyai idempotency key masing-masing.
7. Update tracking yang valid memajukan SHIPPED ke DELIVERED. COMPLETED tetap mempunyai aturan penutupan yang ditetapkan bisnis.
8. Expiry membebaskan reservasi secara konsisten dan menuliskan history. Pembayaran yang datang setelah reservasi lepas memicu pemeriksaan stok ulang dan penanganan admin bila stok tidak cukup.
9. Refund tidak otomatis menambah stok fisik. Retur yang benar-benar diterima dicatat sebagai event stok tersendiri.

Status lama dipertahankan sebagai tampilan kompatibilitas saat migrasi. Mapping untuk record baru dapat menggunakan menunggu pembayaran ke UNPAID/AWAITING_PAYMENT, pembayaran diterima ke PAID/CONFIRMED, pesanan disiapkan ke PAID/PROCESSING, dikirim ke PAID/SHIPPED, dan selesai ke PAID/COMPLETED. Data historis perlu rekonsiliasi, terutama bila status lama dipilih tanpa bukti keuangan yang lengkap.

## 9. Kesiapan integrasi VARTANA Global ERP

Website memiliki banyak data operasional, namun belum ditemukan client/kontrak koneksi ERP eksternal pada repository. Source project ERP tidak diperiksa. Dukungan endpoint, ownership data, authentication, idempotency, warehouse dan settlement ERP masih perlu disepakati sebelum implementasi sinkronisasi.

| Entitas | Rekomendasi sementara | Hal yang perlu diputuskan setelah audit ERP |
| --- | --- | --- |
| Product/Customer Master | Gunakan master existing dan mapping external ID | Sistem yang boleh mengubah tiap field dan cara menangani konflik |
| Inventory/reservation | Satu service menjadi penulis stok | Pilih apakah Apps Script atau ERP menjadi sumber saldo dan pemegang reservasi |
| Sales Order/Invoice | Serial website dipetakan ke external ID ERP | Buat sekali per order, unique key dan format invoice ERP |
| Payment/fee/settlement | Event terverifikasi dikirim melalui outbox | Gross, fee, net, settlement date dan akun pembukuan |
| Shipment/shipping cost | Rekam nominal quote dan biaya aktual terpisah | Selisih biaya, subsidi dan pihak yang menanggung |
| Refund/return | Referensi payment dan order asal | Rekonsiliasi uang serta penerimaan barang merupakan dua kejadian berbeda |

Gunakan event seperti `order.created`, `payment.paid`, `shipment.shipped` dan `refund.completed` dengan version, correlation ID serta idempotency key. Outbox menyimpan retry dan hasil pengiriman. ERP wajib mengembalikan external ID atau menyediakan lookup untuk memastikan retry tidak menciptakan SO, invoice atau jurnal ganda. Tetapkan retensi PII dan minimalkan payload sinkronisasi.

## 10. File dan konfigurasi yang diusulkan

Daftar ini merupakan rancangan, belum dibuat atau diubah.

| Tindakan | Lokasi yang diusulkan | Tujuan |
| --- | --- | --- |
| Buat | `.env.example` | Daftar variabel tanpa credentials asli dan panduan environment |
| Buat | `lib/payments/{types,service,config,providers/*}.ts` | Payment contract dan adapter DOKU/iPaymu/manual/mock |
| Buat | `lib/shipping/{types,service,config,providers/*}.ts` | Shipping contract, mapping wilayah, quote dan operasi fulfillment |
| Buat | `lib/orders/{status,repository,events}.ts` | Transition rules dan repository yang membungkus backend existing |
| Buat | `lib/integrations/{webhook-inbox,outbox,erp}.ts` | Dedup, antrean sinkronisasi dan kontrak ERP |
| Buat | `app/api/payments/{create,status}/route.ts` | Membuat attempt dan membaca status yang terotorisasi |
| Buat | `app/api/webhooks/{doku,ipaymu,kiriminaja}/route.ts` | Callback publik dengan autentikasi provider, raw body dan dedup |
| Buat | `app/api/admin/shipments/{create,pickup,cancel}/route.ts` | Operasi admin terotorisasi dan konfirmasi pickup |
| Ubah | `lib/checkout.ts`, route quote/order, checkout page | Memanggil service bersama, snapshot alamat/berat/quote, pilihan provider |
| Ubah | `app/api/shipping/route.ts` | Delegasi ke shipping service agar aturan tidak terduplikasi |
| Ubah | `app/admin/operations/`, route update-order, invoice helper | Status terpisah, history, label, refund dan pickup |
| Ubah | `apps-script/Code.gs` dan fragment sumber terkait | Guard lengkap, transaksi/event, compatibility dan recovery |
| Sinkronkan | TXT deliverable melalui generator existing | Mencegah perbedaan source deploy dan source fragment |
| Tambah tes | `tests/payment-*.test.cjs`, `shipping-*.test.cjs`, `webhook-*.test.cjs`, `erp-*.test.cjs` | Regression dan failure/concurrency scenarios |

Variabel existing yang perlu diinventarisasi berdasarkan nama adalah `GOOGLE_SCRIPT_URL`, `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`, `KONSINYASI_GOOGLE_SCRIPT_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `BITESHIP_API_KEY`, `BINDERBYTE_API_KEY`, dan `ORIGIN_DISTRICT_ID`. Audit ini tidak menyalin nilainya.

Variabel baru yang direncanakan meliputi `PAYMENT_PROVIDER`, `SHIPPING_PROVIDER`, `PAYMENT_ENV`, `SHIPPING_ENV`, `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY`, `DOKU_BASE_URL`, `IPAYMU_VA`, `IPAYMU_API_KEY`, `IPAYMU_BASE_URL`, `KIRIMINAJA_API_KEY`, `KIRIMINAJA_BASE_URL`, origin provider IDs dan konfigurasi packaging. Secret webhook tambahan hanya ditambah bila kontrak provider memang memerlukannya.

Mock hanya diizinkan ketika server berjalan sebagai development/test. Production yang memilih mock harus gagal memuat konfigurasi. Pada Netlify, context production dan deploy preview juga perlu diperiksa karena preview framework dapat tetap memakai `NODE_ENV=production`. Local test memakai mock, local sandbox memakai credentials resmi sandbox. Host base URL perlu di-allowlist berdasarkan environment sehingga credentials production tidak terkirim ke host sembarang. Manual tetap menjadi default production selama gateway belum disetujui.

## 11. Roadmap dan kriteria penerimaan

| Tahap | Pekerjaan | Kriteria selesai |
| --- | --- | --- |
| A. Persetujuan rancangan | Review audit, batas ownership ERP, aturan reservasi dan biaya | Kontrak data dan prioritas disetujui |
| B. Pengamanan backend | Tutup RPC privat terbuka, DTO publik, rate limits, guards body/origin dan secret | Panggilan tanpa otorisasi ditolak tanpa side effect, semua caller existing tetap bekerja |
| C. Fondasi order | Payment/fulfillment terpisah, item/address snapshot, history, repository, dedup/inbox/outbox | Retry dan kegagalan parsial pulih tanpa order/invoice/stok ganda |
| D. Mock lokal | Payment success/fail/expire, shipping quote/label/tracking dan simulasi admin | Mock tidak dapat dipakai pada production dan skenario QA lulus |
| E. DOKU sandbox | Create payment, notification, inquiry, expiry, refund sesuai channel | Signature, nominal dan reference tervalidasi, redirect tidak menandai PAID |
| F. iPaymu sandbox | Adapter alternatif dan callback sesuai dokumentasi | Transaksi terikat provider, fallback ambigu tidak membuat tagihan kedua |
| G. KiriminAja sandbox | Mapping wilayah, tarif, shipment, AWB, label, tracking dan pickup | Pickup hanya setelah konfirmasi admin, duplicate callback/order aman |
| H. Kontrak ERP | Audit ERP terpisah setelah izin, mapping dan dry-run sinkronisasi | Idempotency end-to-end dan ownership master/stok disetujui |
| I. QA terpadu | Browser/mobile, race condition, timeout, observability dan rekonsiliasi | Skenario di bawah lulus dengan bukti |
| J. Persetujuan rilis | Review perubahan, credentials resmi, rollback dan pemantauan | Commit/push/deployment hanya dilakukan setelah persetujuan baru |

Estimasi kerja engineering awal 15–25 hari kerja setelah rancangan disetujui, di luar waktu verifikasi merchant, akses sandbox, audit ERP dan revisi kontrak. Angka tersebut merupakan perkiraan perencanaan, bukan jadwal yang sudah disepakati. Tahap pengamanan dan mock dapat dimulai sebelum credentials production tersedia.

### Matriks QA yang dipersiapkan

| Skenario | Hasil yang wajib |
| --- | --- |
| Checkout normal dan klik ulang | Satu order/invoice, total sama dengan kalkulasi server |
| Payment berhasil | PAID setelah bukti server valid, fulfillment CONFIRMED, stok tidak didebit dua kali |
| Payment gagal atau expired | Status tercatat, reservasi dilepas sesuai aturan |
| Webhook duplikat atau replay | Satu event efektif, tanpa email/stok/invoice ganda |
| Signature salah | Respons 4xx, data order tidak berubah |
| Reference/currency/nominal berbeda | Ditolak atau ditandai mismatch untuk rekonsiliasi |
| Callback terlambat atau terbalik urutan | Tidak menurunkan status sukses, stok diperiksa sebelum fulfillment |
| Dua customer membeli stok terakhir | Maksimal satu reservasi berhasil |
| Voucher tidak sah/expired/nomor lain | Ditolak server, tanpa konsumsi voucher |
| Gratis ongkir sesuai/tidak sesuai area | Ditentukan dari tujuan terverifikasi dan syarat promo |
| Provider timeout setelah create | Inquiry dengan referensi sama sebelum retry/fallback |
| Shipment/pickup/label/tracking/cancel | Tindakan sesuai kemampuan provider dan otorisasi admin |
| Refund sebagian/penuh | Nominal dan status refund benar, stok hanya kembali setelah penerimaan retur |
| ERP timeout atau duplikat | Outbox dapat retry tanpa SO/invoice/jurnal ganda |
| Mobile/desktop | Pemeriksaan viewport 360/390/768/1280+, keyboard, overflow, loading, focus dan retry |
| Regresi existing | Transfer BCA, QRIS manual, promo, voucher, akun, stok, invoice, games dan notifikasi tetap lulus |

Mock lokal dapat menguji raw webhook, signature dan replay. Uji sandbox callback ke localhost memerlukan tunnel HTTPS yang disetujui atau mekanisme simulator lokal. Persetujuan production tetap diperlukan setelah sandbox selesai.

## 12. Biaya operasional dan kredit Netlify

Paket dan penggunaan aktual akun Netlify belum diperiksa. Untuk paket credit-based, dokumentasi saat audit mencantumkan tarif berikut. Paket legacy dapat memakai perhitungan lain. [Netlify credit usage](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)

| Komponen | Kredit |
| --- | --- |
| Production deployment | 15 per deployment |
| Compute | 10 per GB-hour |
| Bandwidth | 20 per GB |
| Web requests | 2 per 10.000 request |

Rumus perkiraan adalah `15 × deploy produksi + 10 × GB-hour + 20 × GB bandwidth + 2 × (request / 10.000)`. Ilustrasi bulanan, dengan asumsi 4 deployment, 5 GB-hour, 10 GB bandwidth dan 100.000 request, menghasilkan 330 kredit. Ini simulasi, belum proyeksi berdasarkan analytics VARTANA. Harga paket, tambahan kredit dan konversi rupiah perlu dikonfirmasi pada billing akun.

### Penggerak biaya pada kode sekarang

- Route katalog force-dynamic dan no-store memanggil master serta stok Apps Script. Cache master quote hanya berlaku pada proses server yang masih hidup, sehingga tidak menggabungkan semua instance Netlify.
- Foto Drive diproxy melalui server dan memakai no-store setelah perbaikan cache foto. Setiap pembacaan dapat mengulang transfer Google, compute dan bandwidth Netlify. Optimasi berikutnya perlu memakai identitas file beserta versi gambar yang jelas agar foto tidak tertukar kembali.
- Halaman operasi admin polling 30 detik ketika terlihat, lalu membaca data order/member/master yang cukup besar. Satu tab terbuka 8 jam dapat menghasilkan sekitar 960 refresh sebelum memperhitungkan aktivitas lain.
- Quote dapat memanggil stok, master, promo, validasi wilayah dan tarif. Call berulang tanpa cache quote terarah menambah latency dan biaya.
- Radio, aset gambar besar, terjemahan dinamis serta unduhan laporan perlu diukur lewat analytics sebelum dipilih optimasinya.

### Optimasi yang direkomendasikan

- Cache master publik dan wilayah dengan TTL serta invalidasi yang jelas. Stok tersedia dan final order tetap diperiksa pada commit transaksi.
- Dedup request serentak dan cache quote singkat dengan semua komponen biaya masuk ke key, mengikuti masa berlaku tarif provider.
- Tampilkan status payment dari storage lokal aplikasi. Inquiry provider dijalankan pada rekonsiliasi terjadwal/kejadian yang relevan, bukan setiap render.
- Gunakan webhook dengan inbox/outbox persisten dan retry terukur. Background execution setelah response tidak menggantikan antrean persisten.
- Kurangi polling admin melalui endpoint ringkas/perubahan sejak versi terakhir, pagination dan refresh sesuai kebutuhan.
- Optimasi ukuran gambar dan gunakan cache beridentitas versi yang aman, dengan pemisahan konten publik dari data customer.
- Kelompokkan rilis setelah pengujian lokal sesuai permintaan pengguna, lalu pasang monitoring error, latency dan quota.

Biaya lain meliputi fee per channel payment, MDR QRIS sesuai perjanjian merchant, fee/refund/settlement bila berlaku, ongkir aktual, asuransi, pickup/COD bila dipakai, serta penyimpanan transaksi. Tarifnya belum dapat dihitung tanpa penawaran resmi akun masing-masing provider.

Email Apps Script mempunyai quota per akun dan dibagi dengan OTP, voucher, notifikasi serta broadcast. Dokumentasi Google mencantumkan 100 penerima per hari untuk akun consumer dan 1.500 untuk Workspace dengan ketentuan khusus akun trial. Quota dan pemakaian aktual perlu dipantau, bersama limit durasi eksekusi dan URL Fetch. [Quota Apps Script](https://developers.google.com/apps-script/guides/services/quotas)

## Keputusan yang diperlukan sebelum coding

1. Persetujuan memperbaiki guard Apps Script dan autentikasi sebagai tahap awal.
2. Penetapan sumber saldo/reservasi stok setelah kontrak ERP ditinjau. Rekomendasi sementara adalah mempertahankan satu ledger existing sampai migrasi disetujui.
3. Persetujuan model payment attempt, pemisahan status, penanganan pembayaran terlambat dan refund sebagian.
4. Data origin KiriminAja, aturan berat packaging, aktivasi channel merchant dan akses sandbox resmi ketika tersedia.
5. Persetujuan implementasi lokal bertahap. Setiap commit, push, perubahan deployment atau penyambungan ke ERP menunggu persetujuan yang sesuai tahapnya.
