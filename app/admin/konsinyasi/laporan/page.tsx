"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Mitra = { kodeMitra?: string; namaToko?: string; nama?: string };
type SO = { nomorSO?: string; kodeMitra?: string; namaToko?: string; tanggalSO?: string; statusSO?: string; status?: string; totalSO?: number; subtotal?: number; total?: number };
type Shipment = { nomorPengiriman?: string; nomorSO?: string; kodeMitra?: string; namaToko?: string; tanggalKeluarGudang?: string; tanggalBAST?: string; statusPengiriman?: string };
type Stock = { kodeMitra?: string; sku?: string; namaProduk?: string; varian?: string; stok?: number };
type Payload = {
  success?: boolean;
  message?: string;
  laporan?: { salesOrder?: SO[]; pengiriman?: Shipment[]; stok?: Stock[]; promo?: { status?: string }[] };
  salesOrder?: SO[];
  pengiriman?: Shipment[];
  stok?: Stock[];
  promo?: { status?: string }[];
  mitra?: Mitra[];
};
const input = "mt-2 w-full rounded-xl border border-[#dce5db] bg-white px-3 py-2.5 text-sm text-[#193d2b] outline-none focus:border-[#326b49]";
const money = (v: unknown) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v) || 0);
const number = (v: unknown) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(Number(v) || 0);
function dateOnly(v?: string) {
  if (!v) return "";
  const m = String(v).match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function KonsinyasiLaporanPage() {
  const [orders, setOrders] = useState<SO[]>([]),
    [shipments, setShipments] = useState<Shipment[]>([]),
    [stocks, setStocks] = useState<Stock[]>([]),
    [promos, setPromos] = useState<{ status?: string }[]>([]),
    [mitras, setMitras] = useState<Mitra[]>([]);
  const [start, setStart] = useState("2026-10-01"),
    [end, setEnd] = useState("2026-10-31"),
    [mitra, setMitra] = useState("SEMUA"),
    [kind, setKind] = useState("SEMUA");
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [updated, setUpdated] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rr, mr] = await Promise.all([fetch("/api/konsinyasi/laporan?action=getKonsinyasiLaporan", { cache: "no-store" }), fetch("/api/konsinyasi?action=getKonsinyasiMitra", { cache: "no-store" })]);
      const [rt, mt] = await Promise.all([rr.text(), mr.text()]);
      let r: Payload, m: Payload;
      try {
        r = JSON.parse(rt) as Payload;
      } catch {
        throw new Error("Respons API laporan bukan JSON valid.");
      }
      try {
        m = JSON.parse(mt) as Payload;
      } catch {
        throw new Error("Respons API mitra bukan JSON valid.");
      }
      if (!rr.ok || r.success === false) throw new Error(r.message || "Gagal membaca laporan aktual.");
      if (!mr.ok || m.success === false) throw new Error(m.message || "Gagal membaca master mitra.");
      const d = r.laporan || r;
      setOrders(Array.isArray(d.salesOrder) ? d.salesOrder : []);
      setShipments(Array.isArray(d.pengiriman) ? d.pengiriman : []);
      setStocks(Array.isArray(d.stok) ? d.stok : []);
      setPromos(Array.isArray(d.promo) ? d.promo : []);
      setMitras(Array.isArray(m.mitra) ? m.mitra : []);
      setUpdated(new Date().toLocaleString("id-ID"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const mitraName = (code?: string) => mitras.find((x) => x.kodeMitra === code)?.namaToko || mitras.find((x) => x.kodeMitra === code)?.nama || code || "Mitra tidak diketahui";
  const filteredSO = useMemo(
    () =>
      orders.filter((x) => {
        const d = dateOnly(x.tanggalSO);
        return (!d || (d >= start && d <= end)) && (mitra === "SEMUA" || x.kodeMitra === mitra);
      }),
    [orders, start, end, mitra],
  );
  const filteredShip = useMemo(
    () =>
      shipments.filter((x) => {
        const d = dateOnly(x.tanggalBAST || x.tanggalKeluarGudang);
        return (!d || (d >= start && d <= end)) && (mitra === "SEMUA" || x.kodeMitra === mitra);
      }),
    [shipments, start, end, mitra],
  );
  const filteredStock = useMemo(() => stocks.filter((x) => mitra === "SEMUA" || x.kodeMitra === mitra), [stocks, mitra]);
  const totalSO = filteredSO.reduce((a, x) => a + Number(x.totalSO ?? x.total ?? x.subtotal ?? 0), 0),
    totalStock = filteredStock.reduce((a, x) => a + Number(x.stok || 0), 0);
  const showSO = kind === "SEMUA" || kind === "SO",
    showShip = kind === "SEMUA" || kind === "PENGIRIMAN",
    showStock = kind === "SEMUA" || kind === "STOK";
  const exportCSV = () => {
    const rows: string[][] = [["Jenis", "Tanggal", "Mitra", "Kode Mitra", "Referensi", "Status", "Nilai/Qty"]];
    if (showSO)
      filteredSO.forEach((x) =>
        rows.push(["Sales Order", dateOnly(x.tanggalSO), x.namaToko || mitraName(x.kodeMitra), x.kodeMitra || "", x.nomorSO || "", x.statusSO || x.status || "", String(Number(x.totalSO ?? x.total ?? x.subtotal ?? 0))]),
      );
    if (showShip)
      filteredShip.forEach((x) => rows.push(["Pengiriman", dateOnly(x.tanggalBAST || x.tanggalKeluarGudang), x.namaToko || mitraName(x.kodeMitra), x.kodeMitra || "", x.nomorPengiriman || x.nomorSO || "", x.statusPengiriman || "", ""]));
    if (showStock) filteredStock.forEach((x) => rows.push(["Saldo stok", "", mitraName(x.kodeMitra), x.kodeMitra || "", x.sku || "", x.varian || "", String(Number(x.stok || 0))]));
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.map((v) => '"' + v.replace(/"/g, '""') + '"').join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-konsinyasi-${start}-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const card = (label: string, value: string, note: string) => (
    <div key={label} className="rounded-2xl border border-[#e1e6db] bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold">{loading ? "…" : value}</p>
      <p className="mt-2 text-xs text-gray-400">{note}</p>
    </div>
  );
  return (
    <main className="min-h-screen bg-[#f5f6ef] px-4 py-6 text-[#193d2b] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/konsinyasi" className="inline-flex text-sm font-medium text-[#52745d]">
          ← Kembali ke Dashboard Konsinyasi
        </Link>
        <header className="flex flex-col justify-between gap-5 rounded-[28px] bg-[#173f2d] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#e8c875]">VARTANA · KONSINYASI</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Laporan Konsinyasi</h1>
            <p className="mt-2 text-sm text-white/75">Laporan SO, pengiriman, dan saldo stok dari Google Sheets aktual.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm">
            <p className="text-white/60">Status koneksi</p>
            <p className={`mt-1 font-semibold ${error ? "text-amber-300" : loading ? "text-white" : "text-emerald-300"}`}>{error ? "Perlu diperiksa" : loading ? "Memuat data…" : "Data berhasil dibaca"}</p>
            <p className="mt-1 text-xs text-white/60">Update: {updated || "—"}</p>
          </div>
        </header>
        <section className="rounded-2xl border border-[#e1e6db] bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Filter laporan</h2>
              <p className="mt-1 text-sm text-gray-500">Tanggal 1–31 Oktober 2026 · Semua mitra · Semua laporan.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} disabled={loading || !!error} className="rounded-xl border border-[#dce5db] px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                Export CSV
              </button>
              <button onClick={() => void load()} className="rounded-xl bg-[#173f2d] px-4 py-2.5 text-sm font-semibold text-white">
                ↻ Refresh
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tanggal awal
              <input type="date" className={input} value={start} max={end} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Tanggal akhir
              <input type="date" className={input} value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Mitra
              <select className={input} value={mitra} onChange={(e) => setMitra(e.target.value)}>
                <option value="SEMUA">Semua Mitra</option>
                {mitras.map((m, i) => (
                  <option key={`${m.kodeMitra}-${i}`} value={m.kodeMitra || ""}>
                    {m.namaToko || m.nama || m.kodeMitra} {m.kodeMitra ? `(${m.kodeMitra})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Jenis laporan
              <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="SEMUA">Semua laporan</option>
                <option value="SO">Sales Order</option>
                <option value="PENGIRIMAN">Pengiriman</option>
                <option value="STOK">Saldo stok</option>
              </select>
            </label>
          </div>
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <b>Data laporan belum berhasil dimuat.</b>
              <p className="mt-1">{error}</p>
            </div>
          )}
        </section>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {card("Sales Order dalam filter", number(filteredSO.length), "Jumlah SO dari data aktual")}
          {card("Nilai total SO", money(totalSO), "Nilai order, bukan omzet penjualan mitra")}
          {card("Pengiriman dalam filter", number(filteredShip.length), "Berdasarkan tanggal BAST/keluar gudang")}
          {card("Saldo stok saat ini", `${number(totalStock)} unit`, "Snapshot saat ini, bukan saldo historis")}
        </section>
        {showSO && (
          <section className="rounded-2xl border border-[#e1e6db] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              Sales Order <span className="text-sm font-normal text-gray-400">({filteredSO.length})</span>
            </h2>
            {loading ? (
              <p className="py-6 text-sm text-gray-500">Memuat…</p>
            ) : !filteredSO.length ? (
              <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-500">Tidak ada Sales Order pada filter ini.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[#f5f7f1] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nomor SO</th>
                      <th className="px-4 py-3">Mitra</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Nilai SO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSO.map((x, i) => (
                      <tr key={`${x.nomorSO}-${i}`} className="border-b border-[#edf0e9]">
                        <td className="px-4 py-3">{dateOnly(x.tanggalSO) || "—"}</td>
                        <td className="px-4 py-3 font-semibold">{x.nomorSO || "—"}</td>
                        <td className="px-4 py-3">
                          {x.namaToko || mitraName(x.kodeMitra)}
                          <small className="block text-gray-400">{x.kodeMitra}</small>
                        </td>
                        <td className="px-4 py-3">{x.statusSO || x.status || "—"}</td>
                        <td className="px-4 py-3 text-right">{money(x.totalSO ?? x.total ?? x.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {showShip && (
          <section className="rounded-2xl border border-[#e1e6db] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              Pengiriman <span className="text-sm font-normal text-gray-400">({filteredShip.length})</span>
            </h2>
            {loading ? (
              <p className="py-6 text-sm text-gray-500">Memuat…</p>
            ) : !filteredShip.length ? (
              <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-500">Tidak ada pengiriman pada filter ini.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[#f5f7f1] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Nomor Pengiriman</th>
                      <th className="px-4 py-3">Nomor SO</th>
                      <th className="px-4 py-3">Mitra</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShip.map((x, i) => (
                      <tr key={`${x.nomorPengiriman}-${i}`} className="border-b border-[#edf0e9]">
                        <td className="px-4 py-3">{dateOnly(x.tanggalBAST || x.tanggalKeluarGudang) || "—"}</td>
                        <td className="px-4 py-3 font-semibold">{x.nomorPengiriman || "—"}</td>
                        <td className="px-4 py-3">{x.nomorSO || "—"}</td>
                        <td className="px-4 py-3">{x.namaToko || mitraName(x.kodeMitra)}</td>
                        <td className="px-4 py-3">{x.statusPengiriman || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {showStock && (
          <section className="rounded-2xl border border-[#e1e6db] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">
              Saldo stok mitra <span className="text-sm font-normal text-gray-400">({filteredStock.length})</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500">Saldo terkini. Filter tanggal tidak mengubah snapshot menjadi saldo historis.</p>
            {loading ? (
              <p className="py-6 text-sm text-gray-500">Memuat…</p>
            ) : !filteredStock.length ? (
              <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-500">Tidak ada saldo stok untuk filter ini.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-[#f5f7f1] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Mitra</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Varian</th>
                      <th className="px-4 py-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((x, i) => (
                      <tr key={`${x.kodeMitra}-${x.sku}-${i}`} className="border-b border-[#edf0e9]">
                        <td className="px-4 py-3">
                          {mitraName(x.kodeMitra)}
                          <small className="block text-gray-400">{x.kodeMitra}</small>
                        </td>
                        <td className="px-4 py-3">{x.sku}</td>
                        <td className="px-4 py-3">{x.namaProduk}</td>
                        <td className="px-4 py-3">{x.varian}</td>
                        <td className="px-4 py-3 text-right font-bold">{number(x.stok)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        <section className="rounded-2xl border border-amber-200 bg-[#fffaf0] p-5 text-sm text-[#785b22]">
          <h2 className="font-bold">Catatan akurasi laporan</h2>
          <p className="mt-2">
            API Apps Script saat ini menyediakan Sales Order, pengiriman, stok, dan promo. Nilai SO bukan omzet penjualan mitra. Omzet, setoran, dan piutang belum bisa dilaporkan secara aktual sebelum transaksi penjualan manual dan
            pembayaran mitra dicatat pada sheet/API khusus. Saldo stok yang ditampilkan adalah snapshot saat ini.
          </p>
          <p className="mt-2">
            Promo aktif yang terbaca: <b>{promos.filter((x) => String(x.status || "").toUpperCase() === "AKTIF").length}</b>. Tidak ada angka contoh yang ditambahkan.
          </p>
        </section>
        <footer className="pb-4 text-center text-xs text-gray-400">VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH</footer>
      </div>
    </main>
  );
}
