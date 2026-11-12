# Akun customer dan sinkronisasi label stok

Menu **Akun saya** tersedia di beranda, navigasi publik, dan checkout. Customer masuk memakai email dan password. Login tidak diwajibkan untuk membeli; checkout tanpa akun tetap tersedia.

## Member lama

1. Buka `/akun`, masukkan email yang dahulu dipakai belanja, lalu lanjutkan.
2. Pilih **Kirim kode buat / reset password**.
3. Masukkan OTP dari email dan tentukan password sendiri (6–128 karakter).
4. Masuk menggunakan email dan password baru. Data lama dicari berdasarkan email terverifikasi; aktivasi akun tidak membuat baris Members baru.

Nomor Members yang tersimpan numerik tanpa nol depan kini dikenali saat checkout dan pembaruan profil member, sehingga Member ID lama dipertahankan. Jika data lama belum mempunyai ID wilayah terstruktur, pilih wilayah sekali saat checkout. Alamat lengkap dari pesanan berhasil berikutnya disimpan untuk pembelian selanjutnya.

## Profil dan checkout

Nama, WhatsApp, dan alamat dapat diedit di akun. Saat checkout, profil hanya mengisi kolom yang kosong. Draft dengan email lain dan alamat yang sedang diketik tidak ditimpa. Tombol **Gunakan data & alamat akun** mengizinkan penggantian secara eksplisit.

Penyimpanan alamat setelah order berhasil berjalan terpisah dan tidak menunda pembayaran. Perhitungan harga, promo, ongkir, reservasi 30 menit, dan pembuatan order tetap menggunakan alur yang sama. Keluar dari akun membersihkan draft checkout pada tab tersebut.

## Penyimpanan dan pembatasan

Tab Apps Script baru: `CustomerAccounts`, `CustomerAccountSessions`, `CustomerAccountCodes`, dan `CustomerAccountLogins`. Password diolah pada server Node dengan salted scrypt (N=65536, r=8, p=2); spreadsheet hanya menyimpan hash. Token sesi browser disimpan pada cookie HttpOnly; backend menyimpan hash token.

OTP berlaku 10 menit, maksimal 5 kesalahan, jeda kirim ulang 60 detik, maksimal 5 permintaan/email/jam dan 30 per identitas jaringan/jam. OTP diverifikasi sebelum proses hash password. Grant reset hanya diketahui server, berlaku 2 menit, dan sekali pakai. Reset membatalkan kode lain dan sesi akun lama. Login dibatasi 10 percobaan/email/15 menit dan 50 per identitas jaringan/15 menit.

Opsi **Ingat akun selama 30 hari** menggunakan cookie persisten dan masa sesi 30 hari. Tanpa opsi tersebut cookie bersifat sesi browser dengan batas server 8 jam. Keluar membatalkan sesi saat ini; reset password membatalkan seluruh versi sesi lama. Respons akun tidak di-cache dan tidak mengirim password/hash/grant kepada browser.

## Label stok

Label beranda, kartu produk, dan detail mengikuti saldo tersedia SKU, bukan teks READY STOCK dari master produk. Produk dinyatakan tersedia bila minimal satu variannya memiliki stok tercatat yang bisa dibeli. Detail kemasan mengikuti varian yang dipilih. Saldo nol, seluruh stok ditahan pesanan, atau stok belum tercatat tampil sebagai **Stok habis**. Varian lain yang masih tersedia tetap dapat dipilih.

Pengujian otomatis mencakup reset/aktivasi member lama, kode salah/kedaluwarsa/sekali pakai, binding browser, pembatasan login, pencabutan sesi, kerahasiaan respons, autofill draft, serta label stok. Pengujian email memakai fixture; tidak mengirim kode uji ke customer produksi.

Validasi rilis: 265 tes dan build produksi lolos. Apps Script versi 70 menambahkan RPC akun yang kompatibel dengan checkout sebelumnya. Rilis website memasukkan halaman akun serta label stok yang terhubung saldo SKU.

Rujukan: [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [Node.js crypto](https://nodejs.org/api/crypto.html).
