"use client";

import { useEffect, useState } from "react";
import {
  generateSalesReportPdf,
  type SalesReportOrder,
} from "../dashboard/pdf-report";

type ApiResponse = {
  orders?: SalesReportOrder[];
  data?: { orders?: SalesReportOrder[] };
};

export default function SalesReportPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [orders, setOrders] = useState<SalesReportOrder[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem("vartana_admin_auth") === "true");
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/data", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("API gagal mengambil data transaksi.");
        }

        const payload = (await response.json()) as ApiResponse;
        const apiOrders = Array.isArray(payload.orders)
          ? payload.orders
          : Array.isArray(payload.data?.orders)
            ? payload.data.orders
            : null;

        if (!apiOrders) {
          throw new Error("Format data API tidak sesuai. Laporan dibatalkan.");
        }

        const validOrders = apiOrders.filter(
          (order) =>
            typeof order.createdAt === "string" &&
            /^\d{4}-\d{2}/.test(order.createdAt)
        );

        if (!validOrders.length) {
          throw new Error("Tidak ada transaksi bertanggal valid dari API.");
        }

        if (!cancelled) {
          setOrders(validOrders);

          const availableMonths = [
            ...new Set(validOrders.map((order) => order.createdAt!.slice(0, 7))),
          ].sort();

          setSelectedMonth(availableMonths[availableMonths.length - 1]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat data transaksi."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  const months = [
    ...new Set(orders.map((order) => order.createdAt!.slice(0, 7))),
  ].sort();

  const revenue = orders.reduce(
    (sum, order) =>
      sum +
      (Number(order.subtotalProducts || 0) > 0
        ? Number(order.subtotalProducts)
        : Number(order.grandTotal || 0)),
    0
  );

  const rupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const monthName = (month: string) => {
    const [year, number] = month.split("-").map(Number);
    return new Date(year, number - 1, 1).toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  function downloadReport(mode: "monthly" | "all") {
    setError("");
    setNotice("");

    try {
      generateSalesReportPdf(
        orders,
        mode,
        mode === "monthly" ? selectedMonth : undefined
      );
      setNotice("PDF berhasil diminta untuk diunduh.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membuat laporan PDF."
      );
    }
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#F6F7F2] p-8 text-[#16382A]">
        Memeriksa akses admin...
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F7F2] p-6">
        <section className="w-full max-w-md rounded-2xl border border-[#E1E5DC] bg-white p-8 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-[#B5914B]">
            VARTANA BOTANICAL WELLNESS
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-[#16382A]">
            Sales Report
          </h1>
          <p className="mt-3 text-sm text-[#526158]">
            Silakan login melalui Admin Dashboard terlebih dahulu.
          </p>
          <a
            href="/admin/dashboard"
            className="mt-6 inline-flex rounded-full bg-[#16382A] px-5 py-3 text-sm font-semibold text-white"
          >
            Buka Admin Dashboard
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F2] px-4 py-8 text-[#26352D] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="rounded-2xl bg-[#16382A] p-6 text-white sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-[#D5BD83]">
            VARTANA BOTANICAL WELLNESS
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Sales Report
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Laporan penjualan bulanan dan seluruh periode berdasarkan data Admin API.
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E1E5DC] bg-white p-5">
            <p className="text-sm text-[#68766D]">Total omzet data tersedia</p>
            <p className="mt-2 text-2xl font-semibold text-[#16382A]">
              {rupiah(revenue)}
            </p>
            <p className="mt-2 text-xs text-[#7B857E]">
              Menggunakan subtotal produk jika tersedia; jika tidak, grandTotal.
            </p>
          </div>
          <div className="rounded-2xl border border-[#E1E5DC] bg-white p-5">
            <p className="text-sm text-[#68766D]">Jumlah transaksi</p>
            <p className="mt-2 text-2xl font-semibold text-[#16382A]">
              {orders.length}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E1E5DC] bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#16382A]">
            Unduh laporan PDF
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#68766D]">
            Pilih periode laporan bulanan atau seluruh periode beserta grafik tren omzet.
          </p>

          {loading && (
            <p className="mt-5 text-sm text-[#526158]">
              Mengambil data transaksi dari API...
            </p>
          )}

          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="mt-5 rounded-xl bg-[#F1F7F0] p-4 text-sm text-[#16382A]">
              {notice}
            </p>
          )}

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-[#E1E5DC] p-5">
              <h3 className="font-semibold text-[#16382A]">Laporan Bulanan</h3>
              <p className="mt-2 text-sm leading-6 text-[#68766D]">
                Ringkasan omzet, transaksi, estimasi HPP, laba dan margin, serta detail transaksi.
              </p>
              <label htmlFor="report-month" className="mt-5 block text-sm font-medium text-[#526158]">
                Periode laporan
              </label>
              <select
                id="report-month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                disabled={loading || months.length === 0}
                className="mt-2 w-full rounded-xl border border-[#D8DED6] bg-white px-4 py-3 text-sm"
              >
                {months.map((month) => (
                  <option key={month} value={month}>{monthName(month)}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => downloadReport("monthly")}
                disabled={loading || orders.length === 0 || !selectedMonth}
                className="mt-4 w-full rounded-full bg-[#16382A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                Unduh Laporan Bulanan
              </button>
            </div>

            <div className="rounded-xl border border-[#E1E5DC] p-5">
              <h3 className="font-semibold text-[#16382A]">Laporan Seluruh Periode</h3>
              <p className="mt-2 text-sm leading-6 text-[#68766D]">
                Rekap bulanan dan grafik tren omzet untuk seluruh data yang tersedia.
              </p>
              <div className="mt-5 rounded-xl bg-[#F6F7F2] p-4">
                <p className="text-xs text-[#68766D]">Cakupan data</p>
                <p className="mt-1 font-medium text-[#16382A]">
                  {months.length
                    ? `${monthName(months[0])} – ${monthName(months[months.length - 1])}`
                    : "Menunggu data API"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadReport("all")}
                disabled={loading || orders.length === 0}
                className="mt-4 w-full rounded-full border border-[#16382A] bg-white px-5 py-3 text-sm font-semibold text-[#16382A] disabled:opacity-40"
              >
                Unduh Seluruh Periode
              </button>
            </div>
          </div>

          <p className="mt-6 border-t border-[#E1E5DC] pt-4 text-xs leading-5 text-[#7B857E]">
            Catatan: laba dan margin adalah estimasi internal berdasarkan asumsi HPP produk, bukan laporan keuangan audit. Jika API gagal, laporan tidak menggunakan data demo.
          </p>
        </section>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#7B857E]">
          <a href="/admin/dashboard" className="font-semibold text-[#16382A] underline underline-offset-4">
            Kembali ke Admin Dashboard
          </a>
          <span>VARTANA Sales Report</span>
        </footer>
      </div>
    </main>
  );
}
