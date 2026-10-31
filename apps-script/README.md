# Promotions dan catatan checkout

Revisi ini belum dipasang ke deployment Google karena sesi clasp kedaluwarsa (`invalid_rapt`). `Code.gs` disiapkan dari sumber Apps Script yang diberikan pengguna. Sebelum push, tarik versi live ke direktori terpisah dan cocokkan perubahan agar revisi di Google tidak tertimpa.

## Isi tab Promotions

Kolom lama tetap dipertahankan. Kolom tambahan: `Scope`, `Promo Code`, `Promo Type`, `Promo Value`, `Min Spend`, `Max Discount`. Nama, tanggal mulai/akhir, dan status aktif tetap menggunakan kolom lama. `Banner Text` menjadi ringkasan yang bisa dibaca, bukan JSON.

- `Scope`: `checkout-v1` untuk promo tambahan checkout.
- `Promo Type`: `percent`, `nominal`, atau `shipping`.
- `Promo Value`: angka persen (10 berarti 10%) atau nominal rupiah.
- Minimum/maksimum 0 berarti tanpa batas tambahan.

`setupCheckoutPromotions()` menambah kolom dan memindahkan konfigurasi JSON lama ke kolom baru. Promo produk lama dan data lain tetap dipertahankan. Tidak ada tab baru.

## Isi tab Orders

Kolom tambahan: `Gross Subtotal Products`, `Promo Code`, `Promo Name`, `Product Discount`, `Promo Shipping Discount`. Ringkasan promo juga tetap tercatat di `Items Summary` untuk kompatibilitas deployment lama.

## Melanjutkan pemasangan

1. Jalankan `clasp.cmd login` untuk login ulang Google.
2. Tarik dan bandingkan Apps Script live sebelum menerapkan fungsi pada `promotion-functions.txt` serta pemanggilan `recordCheckoutPromoOnOrder_` setelah penyimpanan order.
3. Push revisi yang sudah digabungkan, jalankan `setupCheckoutPromotions()` di editor Apps Script, lalu perbarui versi deployment web app yang dipakai website.
4. Uji bahwa `getPromotions` mengembalikan `scope`, `checkoutCode`, `checkoutType`, `checkoutValue`, `minSpend`, dan `maxDiscount`. Website otomatis memakai kolom eksplisit jika tersedia; sebelum deployment, konfigurasi JSON lama tetap didukung.
