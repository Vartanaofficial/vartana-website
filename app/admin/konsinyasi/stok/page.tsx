import Link from "next/link";

const descriptions: Record<string, string> = {
  produk: "Kelola SKU, nama produk, satuan, harga konsinyasi, dan status produk.",
  "sales-order": "Buat pesanan multi-produk dan siapkan dokumen Sales Order.",
  pengiriman: "Catat barang keluar gudang, penerimaan, BAST, dan selisih.",
  stok: "Pantau stok mitra dan riwayat setiap mutasi barang.",
  promo: "Kelola program promo, periode berlaku, SKU, dan mitra sasaran.",
  laporan: "Lihat rekap transaksi, pengiriman, stok, dan aktivitas mitra.",
};

export default async function KonsinyasiModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const titleMap: Record<string, string> = {
    produk: "Master Produk",
    "sales-order": "Sales Order",
    pengiriman: "Pengiriman & BAST",
    stok: "Kartu Stok Mitra",
    promo: "Promo",
    laporan: "Laporan Konsinyasi",
  };
  const title = titleMap[module] || "Modul Konsinyasi";

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-5 text-[#193d2b] sm:p-9">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link href="/admin/konsinyasi" className="text-sm text-[#55745c] hover:underline">
          ← Kembali ke Dashboard Konsinyasi
        </Link>
        <section className="rounded-3xl bg-[#173d2b] p-8 text-white sm:p-10">
          <p className="text-xs tracking-[0.18em] text-[#e6d4a5]">VARTANA · KONSINYASI</p>
          <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d1dfd3]">
            {descriptions[module] || "Modul operasional konsinyasi VARTANA."}
          </p>
        </section>
        <section className="rounded-2xl border border-[#e5e6dc] bg-white p-6 sm:p-8">
          <span className="rounded-full bg-[#f5edd8] px-3 py-1.5 text-xs font-semibold text-[#8a6d2e]">
            TAHAP IMPLEMENTASI
          </span>
          <h2 className="mt-5 text-xl font-semibold">Workspace {title}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Kerangka halaman sudah disiapkan. Fitur transaksi dan integrasi data untuk modul ini belum diaktifkan. Kita akan membangunnya bertahap dengan tab Google Spreadsheet berawalan KON_ tanpa mengubah data lama.
          </p>
          <Link
            href="/admin/konsinyasi/mitra"
            className="mt-6 inline-flex rounded-xl border border-[#dce5db] px-4 py-3 text-sm font-semibold hover:bg-[#f5f5ef]"
          >
            Buka Master Mitra →
          </Link>
        </section>
      </div>
    </main>
  );
}