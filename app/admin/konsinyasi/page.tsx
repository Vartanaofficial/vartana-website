"use client";

import Link from "next/link";

const modules = [
  { n: "01", title: "Master Mitra", desc: "Data toko, PIC, alamat, dan status kemitraan.", href: "/admin/konsinyasi/mitra", icon: "🏪", status: "Siap digunakan" },
  { n: "02", title: "Master Produk", desc: "SKU konsinyasi, satuan, harga, dan status produk.", href: "/admin/konsinyasi/produk", icon: "📦", status: "Tahap berikutnya" },
  { n: "03", title: "Sales Order", desc: "Pesanan multi-SKU, nomor SO, nilai pesanan, dan cetak dokumen.", href: "/admin/konsinyasi/sales-order", icon: "📋", status: "Tahap berikutnya" },
  { n: "04", title: "Pengiriman & BAST", desc: "Barang keluar gudang, penerimaan, dan pencatatan selisih.", href: "/admin/konsinyasi/pengiriman", icon: "🚚", status: "Tahap berikutnya" },
  { n: "05", title: "Kartu Stok Mitra", desc: "Stok berjalan, mutasi, retur, barang rusak, dan koreksi.", href: "/admin/konsinyasi/stok", icon: "🗃️", status: "Tahap berikutnya" },
  { n: "06", title: "Promo", desc: "Program promosi, periode, SKU, mitra, dan ketentuan.", href: "/admin/konsinyasi/promo", icon: "🏷️", status: "Tahap berikutnya" },
  { n: "07", title: "Laporan", desc: "Rekap SO, pengiriman, stok, mutasi, dan aktivitas mitra.", href: "/admin/konsinyasi/laporan", icon: "📊", status: "Tahap berikutnya" },
];

export default function KonsinyasiDashboard() {
  return (
    <main className="min-h-screen bg-[#f5f5ef] p-4 text-[#193d2b] sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="relative overflow-hidden rounded-3xl bg-[#173d2b] p-7 text-white shadow-lg sm:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#d7b96e]/30" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-[#d7b96e]/40 px-3 py-1.5 text-xs tracking-[0.16em] text-[#e6d4a5]">
              VARTANA · PARTNERSHIP OPERATIONS
            </span>
            <p className="mt-6 text-sm text-[#d1dfd3]">OPERATIONS MANAGEMENT SYSTEM</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Konsinyasi Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d1dfd3]">
              Pusat pengelolaan mitra, produk, pesanan, pengiriman, stok, program promo, dan laporan konsinyasi VARTANA.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Modul Konsinyasi</p>
            <p className="mt-3 text-3xl font-semibold">7</p>
            <p className="mt-2 text-xs text-gray-400">Pusat operasional</p>
          </div>
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Master Mitra</p>
            <p className="mt-3 text-xl font-semibold">Terhubung</p>
            <p className="mt-2 text-xs text-gray-400">Google Spreadsheet melalui API</p>
          </div>
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Kontrol Transaksi</p>
            <p className="mt-3 text-xl font-semibold">Berbasis referensi</p>
            <p className="mt-2 text-xs text-gray-400">SO, pengiriman, BAST, dan mutasi</p>
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#a1833f]">WORKSPACE</p>
              <h2 className="mt-1 text-xl font-semibold">Modul Konsinyasi</h2>
              <p className="mt-1 text-sm text-gray-500">Pilih modul yang ingin lu kelola.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((item) => {
              const ready = item.n === "01";
              return (
                <Link
                  key={item.n}
                  href={item.href}
                  className="group flex min-h-[220px] flex-col rounded-2xl border border-[#e3e6dc] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#b8c9b7] hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs tracking-widest text-gray-400">{item.n}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className={`text-xs font-medium ${ready ? "text-green-700" : "text-[#94752f]"}`}>
                      {item.status}
                    </span>
                    <span className="text-lg transition group-hover:translate-x-1">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="pb-3 text-center text-xs text-gray-400">
          VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH
        </footer>
      </div>
    </main>
  );
}