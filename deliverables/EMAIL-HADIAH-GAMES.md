# Revisi lokal: voucher dan email hadiah Games

Revisi kode disiapkan untuk commit dan push sesuai persetujuan terbaru. Pengujian memakai spreadsheet dan pengirim email tiruan, tanpa email nyata. Pemasangan Apps Script dan otorisasi pengirim tetap terpisah dari Git.

## Aturan

- Pemain boleh terus bermain dan memperbaiki ranking. Tiga kemenangan pertama yang berhadiah mendapat tiga kode berbeda, maksimal 3 voucher sepanjang riwayat per email/WhatsApp/member untuk seluruh game.
- Setiap kode tersimpan pada PuzzleVouchers dan terikat pada Attempt ID. Retry atau membuka hasil yang sama tidak menerbitkan kode baru.
- Setiap kode baru berlaku tepat 7 x 24 jam sejak kemenangan, sekali pakai, satu kode per pesanan, tanpa digabung promo lain. Kode dapat dimasukkan di kolom promo checkout atau melalui tautan email. Nomor WhatsApp checkout harus sesuai.
- Kemenangan keempat dan seterusnya tetap dicatat dan masuk ranking tanpa voucher atau email hadiah tambahan. Gagal/kedaluwarsa tidak mengurangi kuota voucher.
- Setiap kode dikirim otomatis satu kali ke alamat pertama yang terikat. Pengiriman berlangsung setelah respons game agar tidak menahan tampilan hasil. Tidak ada tombol kirim ulang.
- Percobaan pengiriman yang hasilnya ambigu berstatus UNKNOWN dan tidak diulang otomatis. BLOCKED berarti pengirim/kuota perlu diperiksa admin. Kode tetap dapat dipakai tanpa menunggu email.
- Email tidak membedakan huruf besar/kecil; titik dan +tag Gmail dikenali sebagai identitas yang sama. Nomor WhatsApp dinormalisasi. Mengganti salah satu identitas yang sudah terikat tidak membuka kuota baru.
- Voucher lama tetap menghitung kuota dan mempertahankan kode, hadiah, serta tenggatnya. Kode lama dikaitkan dengan kemenangan asal saat sesi dibuka kembali.

## Pengirim dan aktivasi nanti

Alamat pengirim hanya **vartana@vartanaglobal.com**. Akun efektif pemilik Apps Script menggunakan MailApp; akun lain memerlukan alias Gmail terverifikasi melalui GmailApp. Jika tidak cocok, pengiriman diblokir tanpa mengganti alamat pengirim.

Pengirim produksi belum diverifikasi dalam revisi lokal ini. Saat aktivasi diizinkan nanti, pemilik project perlu menjalankan setupGamesRewardEmail() untuk otorisasi serta pemeriksaan akun/alias dan kuota. Pemeriksaan tersebut tidak mengirim email. GmailApp dapat memerlukan izin Gmail tambahan. Panduan: https://developers.google.com/apps-script/reference/gmail/gmail-app#sendemailrecipient,-subject,-body,-options

PuzzleVouchers menambahkan metadata Email, Email Key, Email Status, Email Send Count, Email Last Attempt At, Email Sent At, Email Error, Email Delivery ID, dan Attempt ID. Admin Games menampilkan kode, penerima, status, jumlah kiriman, dan kesalahan; respons publik hanya berisi kontak tersamarkan.

Data email/nomor masih berdasarkan isian pemain, belum OTP. Pembatas menggunakan identitas tersimpan, belum membuktikan kepemilikan alamat.

Website memeriksa gameEmailVersion sebelum mengirim action email agar deployment lama tidak meneruskannya ke handler Orders. Sinkronkan fragmen lokal dengan node scripts/sync-games-backend.cjs. Pemasangan website dan Apps Script belum dilakukan.

## Validasi

Tes meliputi tiga kode berbeda, retry idempoten, batas lintas game/identitas, pengiriman di luar lock, pengirim/kuota gagal, hasil ambigu, serta ketiga kode melalui perhitungan checkout dan penyimpanan pesanan. Kode bekas ditolak untuk pesanan lain; tenggat tiap kode diuji terpisah. Tidak ada data uji pada spreadsheet produksi.

Pembaruan tampilan menambahkan ilustrasi berbeda per game dan kartu ranking khusus layar HP. Admin dapat mengganti link gambar ketiga game. Gambar puzzle dipakai untuk keping permainan; gambar hitungan/TTS menjadi sampul kuis. Setiap percobaan mempertahankan gambar versi saat dimulai.

Ranking puzzle mensyaratkan 20 keping benar lalu waktu tercepat. Ranking hitungan/TTS mengurutkan jumlah benar, lalu waktu, lalu selesai lebih awal; rekor terbaik per WhatsApp. TTS menghitung kata lengkap, bukan huruf. Hasil parsial yang dikirim sebelum tenggat dapat masuk ranking, tetapi tidak mendapat voucher. Jawaban terlambat hanya untuk audit dan tidak menambah nilai. GameAttempts menambahkan Correct Answers dan Total Answers tanpa mengubah kolom lama. Admin dan publik menampilkan jumlah benar; kontak publik tetap disamarkan.
