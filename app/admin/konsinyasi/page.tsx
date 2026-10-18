"use client";

import Link from "next/link";

const modules = [
  { number: "01", eyebrow: "MASTER DATA", title: "Master Mitra", description: "Kelola data toko mitra, kontak PIC, alamat, dan status kemitraan.", href: "/admin/konsinyasi/mitra", icon: "◇" },
  { number: "02", eyebrow: "MASTER DATA", title: "Master Produk", description: "Kelola SKU, nama produk, varian, satuan, dan harga konsinyasi.", href: "/admin/konsinyasi/produk", icon: "▦" },
  { number: "03", eyebrow: "TRANSAKSI", title: "Sales Order", description: "Buat dan kelola Sales Order berdasarkan pesanan mitra.", href: "/admin/konsinyasi/sales-order", icon: "▤" },
  { number: "04", eyebrow: "DISTRIBUSI", title: "Pengiriman & BAST", description: "Buat pengiriman dari Sales Order dan konfirmasi jumlah aktual melalui BAST.", href: "/admin/konsinyasi/pengiriman", icon: "↗" },
  { number: "05", eyebrow: "PROMOSI", title: "Promo Konsinyasi", description: "Kelola program promo dan detail produk yang termasuk dalam promo.", href: "/admin/konsinyasi/promo", icon: "✳" },
  { number: "06", eyebrow: "PENGENDALIAN", title: "Stok Mitra", description: "Pantau saldo stok titipan dan riwayat mutasi stok mitra.", href: "/admin/konsinyasi/stok", icon: "▥" },
  { number: "07", eyebrow: "ANALISIS", title: "Laporan Konsinyasi", description: "Lihat ringkasan dan laporan aktivitas kemitraan konsinyasi.", href: "/admin/konsinyasi/laporan", icon: "▧" },
];

export default function KonsinyasiPage() {
  return (
    <main className="min-h-screen bg-[#f5f5ef] px-4 py-7 text-[#193d2b] sm:px-7 sm:py-9 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link href="/admin-access" className="inline-flex items-center gap-2 text-sm text-[#547363] transition hover:text-[#193d2b]">
          <span aria-hidden="true">←</span> Kembali ke Admin Dashboard
        </Link>
        <header className="relative overflow-hidden rounded-3xl bg-[#173d2b] p-6 text-white shadow-sm sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-[#c5a45d]/25" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-44 w-44 rounded-full border border-[#c5a45d]/20" />
          <div className="relative max-w-3xl">
            <p className="mb-4 text-xs tracking-[0.28em] text-[#e6d4a5]">VARTANA · BUSINESS MANAGEMENT</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Kemitraan Konsinyasi</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#d1dfd3] sm:text-base">Pusat pengelolaan mitra, produk, Sales Order, pengiriman, BAST, stok titipan, promo, dan laporan konsinyasi.</p>
          </div>
        </header>
        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-[#a1833f]">WORKSPACE</p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Menu Operasional</h2>
              <p className="mt-2 text-sm text-[#718075]">Pilih modul yang ingin lu buka.</p>
            </div>
            <span className="rounded-full border border-[#dce5db] bg-white px-3 py-1.5 text-xs text-[#547363]">{modules.length} modul</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.map((item) => (
              <Link key={item.href} href={item.href} className="group flex min-h-56 flex-col rounded-2xl border border-[#e2e5da] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#c5a45d] hover:shadow-md sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf3eb] text-xl text-[#a1833f]">{item.icon}</span>
                  <span className="text-xs tracking-widest text-[#8a9a8e]">{item.number}</span>
                </div>
                <p className="mt-5 text-[10px] font-semibold tracking-[0.2em] text-[#a1833f]">{item.eyebrow}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#193d2b]">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#718075]">{item.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#edf0e8] pt-4 text-sm">
                  <span className="font-medium text-[#a1833f] group-hover:text-[#193d2b]">Buka modul</span>
                  <span className="text-lg text-[#193d2b]" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <footer className="border-t border-[#e2e5da] pt-5 text-center text-xs text-[#8a9a8e]">VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH</footer>
      </div>
    </main>
  );
}
