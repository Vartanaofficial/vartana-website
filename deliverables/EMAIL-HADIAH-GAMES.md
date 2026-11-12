# Revisi lokal: voucher dan email hadiah Games

Backend Web app aktif diperbarui ke versi 65 pada 12 November 2026. Pengirim vartana@vartanaglobal.com terverifikasi siap. Dua voucher lama yang belum dikirim telah dipulihkan ke status SENT, masing-masing satu kali, tanpa membuat kode baru atau memperpanjang tenggat. Tes otomatis tetap memakai spreadsheet dan pengirim tiruan.

## Aturan

- Pemain boleh terus bermain dan memperbaiki ranking. Tiga kemenangan pertama yang berhadiah mendapat tiga kode berbeda, maksimal 3 voucher sepanjang riwayat per email/WhatsApp/member untuk seluruh game.
- Setiap kode tersimpan pada PuzzleVouchers dan terikat pada Attempt ID. Retry atau membuka hasil yang sama tidak menerbitkan kode baru.
- Setiap kode baru berlaku tepat 7 x 24 jam sejak kemenangan, sekali pakai, satu kode per pesanan, tanpa digabung promo lain. Kode dapat dimasukkan di kolom promo checkout atau melalui tautan email. Nomor WhatsApp checkout harus sesuai.
- Kemenangan keempat dan seterusnya tetap dicatat dan masuk ranking tanpa voucher atau email hadiah tambahan. Gagal/kedaluwarsa tidak mengurangi kuota voucher.
- Setiap kode dikirim otomatis satu kali ke alamat pertama yang terikat. Pengiriman berlangsung setelah respons game agar tidak menahan tampilan hasil. Tidak ada tombol kirim ulang.
- Percobaan pengiriman yang hasilnya ambigu berstatus UNKNOWN dan tidak diulang otomatis. BLOCKED berarti pengirim/kuota perlu diperiksa admin. Kode tetap dapat dipakai tanpa menunggu email.
- Email tidak membedakan huruf besar/kecil; titik dan +tag Gmail dikenali sebagai identitas yang sama. Nomor WhatsApp dinormalisasi. Nomor berbeda yang memakai email sama berbagi kuota tiga voucher; kode tetap terikat pada kemenangan dan WhatsApp asal. Mengganti email pada nomor yang sudah terikat ditolak.
- Voucher lama tetap menghitung kuota dan mempertahankan kode, hadiah, serta tenggatnya. Kode lama dikaitkan dengan kemenangan asal saat sesi dibuka kembali.

## Pengirim dan aktivasi nanti

Alamat pengirim hanya **vartana@vartanaglobal.com**. Web app harus dideploy oleh akun vartana@vartanaglobal.com dan memakai MailApp. Jika tidak cocok, pengiriman diblokir tanpa mengganti alamat pengirim. GmailApp tidak dipakai agar pemasangan tidak menambahkan izin membaca Gmail yang tidak diperlukan.

Pengirim produksi sudah diverifikasi. Untuk pemeriksaan ulang, pemilik project dapat menjalankan setupGamesRewardEmail() untuk memeriksa akun dan kuota. Pemeriksaan tersebut tidak mengirim email. Tidak memerlukan izin GmailApp. Panduan: https://developers.google.com/apps-script/reference/gmail/gmail-app#sendemailrecipient,-subject,-body,-options

PuzzleVouchers menambahkan metadata Email, Email Key, Email Status, Email Send Count, Email Last Attempt At, Email Sent At, Email Error, Email Delivery ID, dan Attempt ID. Admin Games menampilkan kode, penerima, status, jumlah kiriman, dan kesalahan; respons publik hanya berisi kontak tersamarkan.

Data email/nomor masih berdasarkan isian pemain, belum OTP. Pembatas menggunakan identitas tersimpan, belum membuktikan kepemilikan alamat.

Website memeriksa gameEmailVersion sebelum mengirim action email agar deployment lama tidak meneruskannya ke handler Orders. Sinkronkan fragmen lokal dengan node scripts/sync-games-backend.cjs. Website versi 41fba74 telah terpublikasi; backend Apps Script versi 65 sudah aktif. Pembaruan cache kemampuan email membuat website segera mengenali aktivasi backend tanpa menunggu lima menit.

## Validasi

Tes meliputi tiga kode berbeda, retry idempoten, batas lintas game/identitas, pengiriman di luar lock, pengirim/kuota gagal, hasil ambigu, serta ketiga kode melalui perhitungan checkout dan penyimpanan pesanan. Kode bekas ditolak untuk pesanan lain; tenggat tiap kode diuji terpisah. Tidak ada data uji pada spreadsheet produksi.

Pembaruan tampilan menambahkan ilustrasi berbeda per game dan kartu ranking khusus layar HP. Admin dapat mengganti link gambar ketiga game. Gambar puzzle dipakai untuk keping permainan; gambar hitungan/TTS menjadi sampul kuis. Setiap percobaan mempertahankan gambar versi saat dimulai.

Ranking puzzle mensyaratkan 20 keping benar lalu waktu tercepat. Ranking hitungan/TTS mengurutkan jumlah benar, lalu waktu, lalu selesai lebih awal; rekor terbaik per WhatsApp. TTS menghitung kata lengkap, bukan huruf. Hasil parsial yang dikirim sebelum tenggat dapat masuk ranking, tetapi tidak mendapat voucher. Jawaban terlambat hanya untuk audit dan tidak menambah nilai. GameAttempts menambahkan Correct Answers dan Total Answers tanpa mengubah kolom lama. Admin dan publik menampilkan jumlah benar; kontak publik tetap disamarkan.

Pemulihan kode lama tersedia melalui operasi gamesAdmin bertanda tangan recoverRewardEmails. Hanya kode yang belum dikirim dan belum kedaluwarsa diproses; SENT, UNKNOWN, SENDING dan kode dengan jumlah kirim positif tidak diulang. Operasi mengembalikan jumlah berhasil/tertahan tanpa memaparkan kontak publik.
