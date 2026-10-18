"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
type Item = { sku: string; namaProduk?: string; varian?: string; qty?: number; qtySO?: number; qtyDiterima?: number; qtyTerjual?: number; sisaStok?: number; hargaKonsinyasi?: number; subtotal?: number };
type SO = { nomorSO: string; kodeMitra: string; namaToko: string; tanggalSO?: string; statusPenerimaan?: string; items: Item[]; qtyDiterima?: number; qtyTerjual?: number; sisaStok?: number; nominalTerjual?: number };
type Sale = {
  timestamp?: string;
  idTransaksi: string;
  tanggalPenjualan?: string;
  kodeMitra: string;
  namaToko: string;
  nomorSO: string;
  sku: string;
  namaProduk: string;
  varian: string;
  qtyTerjual: number;
  hargaKonsinyasi: number;
  nominalWajibSetor: number;
  catatan?: string;
};
type Payment = {
  timestamp?: string;
  idSetoran: string;
  idTransaksi: string;
  tanggalSetoran?: string;
  kodeMitra: string;
  namaToko: string;
  nomorSO: string;
  nominalWajibSetor: number;
  nominalDiterima: number;
  statusSetoran: string;
  metodePembayaran: string;
  referensiPembayaran: string;
  catatan?: string;
};
const money = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v || 0);
const qty = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const today = () => new Date().toLocaleDateString("en-CA");
async function request(url: string, init?: RequestInit) {
  const r = await fetch(url, { cache: "no-store", ...init });
  const d = await r.json();
  if (!r.ok || d.success === false) throw new Error(d.message || `Request gagal ${r.status}`);
  return d;
}
export default function StokMitraPage() {
  const [orders, setOrders] = useState<SO[]>([]),
    [sales, setSales] = useState<Sale[]>([]),
    [payments, setPayments] = useState<Payment[]>([]),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState<SO | null>(null),
    [sold, setSold] = useState<Record<string, string>>({}),
    [saleDate, setSaleDate] = useState(today()),
    [amount, setAmount] = useState(""),
    [method, setMethod] = useState("TRANSFER"),
    [reference, setReference] = useState(""),
    [note, setNote] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [a, b] = await Promise.all([request("/api/konsinyasi/stok?action=getKonsinyasiPenjualanMitra"), request("/api/konsinyasi/so?action=getKonsinyasiSO")]);
      setOrders(Array.isArray(a.saldoSO) ? a.saldoSO : []);
      setSales(Array.isArray(a.penjualan) ? a.penjualan : []);
      setPayments(Array.isArray(a.setoran) ? a.setoran : []);
      setOrders((prev) => (Array.isArray(a.saldoSO) ? a.saldoSO : prev.length ? prev : Array.isArray(b.salesOrder) ? b.salesOrder : []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengambil data Google Sheets.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const visible = useMemo(
    () =>
      orders.filter((o) =>
        [o.nomorSO, o.kodeMitra, o.namaToko].some((v) =>
          String(v || "")
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      ),
    [orders, query],
  );
  const draftTotal = selected ? selected.items.reduce((a, it) => a + qty(sold[it.sku] || "0") * qty(it.hargaKonsinyasi), 0) : 0;
  useEffect(() => {
    if (selected) setAmount(String(draftTotal));
  }, [draftTotal, selected]);
  async function submit() {
    if (!selected) return;
    setError("");
    setNotice("");
    const items = selected.items.map((it) => ({ sku: it.sku, qtyTerjual: qty(sold[it.sku] || "0") }));
    if (!items.some((x) => x.qtyTerjual > 0)) {
      setError("Isi jumlah terjual lebih dari 0 untuk minimal satu SKU.");
      return;
    }
    if (qty(amount) !== draftTotal) {
      setError(`Nominal setoran harus sama persis: ${money(draftTotal)}.`);
      return;
    }
    if (!method || !reference.trim()) {
      setError("Metode pembayaran dan referensi bukti pembayaran wajib diisi.");
      return;
    }
    setBusy(true);
    try {
      const d = await request("/api/konsinyasi/stok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveKonsinyasiPenjualanMitra",
          nomorSO: selected.nomorSO,
          items,
          nominalSetoran: qty(amount),
          tanggalPenjualan: saleDate,
          metodePembayaran: method,
          referensiPembayaran: reference.trim(),
          catatan: note,
        }),
      });
      setNotice(d.message || "Transaksi tersimpan.");
      setSelected(null);
      setSold({});
      setAmount("");
      setReference("");
      setNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan penjualan dan setoran.");
    } finally {
      setBusy(false);
    }
  }
  const totalSold = sales.reduce((a, x) => a + qty(x.qtyTerjual), 0),
    totalDue = payments.reduce((a, x) => a + qty(x.nominalWajibSetor), 0),
    totalPaid = payments.reduce((a, x) => a + qty(x.nominalDiterima), 0);
  return (
    <main className="min-h-screen bg-[#f5f6f0] px-4 py-7 text-[#183d2b] sm:px-7 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <a href="/admin/konsinyasi" className="text-sm text-[#54715e] hover:underline">
          ← Kembali ke Dashboard Konsinyasi
        </a>
        <header className="rounded-[28px] bg-[#173d2b] p-6 text-white sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#e7c77e]">VARTANA · KONSINYASI</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Stok, Penjualan & Setoran Mitra</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/75">Stok awal dan Sales Order tetap sebagai riwayat. Catat qty terjual; sistem menghitung sisa stok dan mewajibkan setoran penuh sesuai harga konsinyasi SO.</p>
        </header>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
        {notice && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Sales Order diterima", String(orders.length)],
            ["Total unit terjual", String(totalSold)],
            ["Kewajiban tercatat", money(totalDue)],
            ["Setoran tercatat", money(totalPaid)],
          ].map(([a, b]) => (
            <div key={a} className="rounded-2xl border border-[#e3e6dc] bg-white p-5">
              <p className="text-sm text-[#758276]">{a}</p>
              <p className="mt-3 text-2xl font-semibold">{loading ? "—" : b}</p>
            </div>
          ))}
        </section>
        <section className="rounded-2xl border border-[#e3e6dc] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Daftar stok per Sales Order</h2>
              <p className="mt-1 text-sm text-[#718073]">Satu baris per SO. Klik detail untuk mencatat penjualan.</p>
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari mitra atau nomor SO…" className="rounded-xl border border-[#dce5db] px-4 py-3 text-sm sm:w-80" />
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f5f7f2] text-xs uppercase text-[#6e7d70]">
                <tr>
                  {["Mitra / SO", "Tanggal SO", "Qty diterima", "Terjual", "Sisa stok", "Nilai penjualan", "Aksi"].map((x) => (
                    <th key={x} className="px-4 py-4">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {visible.map((o) => (
                  <tr key={o.nomorSO} className="hover:bg-[#f7faf5]">
                    <td className="px-4 py-4">
                      <b>{o.namaToko}</b>
                      <p className="mt-1 text-xs text-[#718073]">{o.kodeMitra}</p>
                      <p className="mt-1 font-medium">{o.nomorSO}</p>
                    </td>
                    <td className="px-4 py-4">{o.tanggalSO || "—"}</td>
                    <td className="px-4 py-4">{qty(o.qtyDiterima)}</td>
                    <td className="px-4 py-4">{qty(o.qtyTerjual)}</td>
                    <td className="px-4 py-4 font-semibold">{qty(o.sisaStok)}</td>
                    <td className="px-4 py-4">{money(qty(o.nominalTerjual))}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => {
                          setSelected(o);
                          setSold(Object.fromEntries(o.items.map((it) => [it.sku, "0"])));
                          setSaleDate(today());
                          setReference("");
                          setNote("");
                          setMethod("TRANSFER");
                        }}
                        className="rounded-lg bg-[#173d2b] px-3 py-2 font-semibold text-white"
                      >
                        Detail / Input
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && !visible.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[#718073]">
                      Belum ada SO dengan penerimaan BAST terkonfirmasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-2xl border border-[#e3e6dc] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Riwayat penjualan mitra</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f5f7f2] text-xs uppercase text-[#6e7d70]">
                <tr>
                  {["ID Transaksi", "Mitra / SO", "Produk", "Qty terjual", "Harga SO", "Wajib setor", "Tanggal"].map((x) => (
                    <th key={x} className="px-4 py-3">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sales
                  .slice()
                  .reverse()
                  .map((x, i) => (
                    <tr key={x.idTransaksi + x.sku + i}>
                      <td className="px-4 py-3">{x.idTransaksi}</td>
                      <td className="px-4 py-3">
                        {x.namaToko}
                        <p className="text-xs text-[#718073]">{x.nomorSO}</p>
                      </td>
                      <td className="px-4 py-3">
                        {x.namaProduk}
                        <p className="text-xs text-[#718073]">
                          {x.sku} · {x.varian}
                        </p>
                      </td>
                      <td className="px-4 py-3">{x.qtyTerjual}</td>
                      <td className="px-4 py-3">{money(x.hargaKonsinyasi)}</td>
                      <td className="px-4 py-3 font-semibold">{money(x.nominalWajibSetor)}</td>
                      <td className="px-4 py-3">{String(x.tanggalPenjualan || "")}</td>
                    </tr>
                  ))}
                {!sales.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#718073]">
                      Belum ada transaksi penjualan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-2xl border border-[#e3e6dc] bg-white p-5 sm:p-7">
          <h2 className="text-lg font-semibold">Riwayat setoran</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f5f7f2] text-xs uppercase text-[#6e7d70]">
                <tr>
                  {["ID Setoran", "Mitra / SO", "Wajib setor", "Diterima", "Status", "Metode", "Referensi"].map((x) => (
                    <th key={x} className="px-4 py-3">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments
                  .slice()
                  .reverse()
                  .map((x) => (
                    <tr key={x.idSetoran}>
                      <td className="px-4 py-3">{x.idSetoran}</td>
                      <td className="px-4 py-3">
                        {x.namaToko}
                        <p className="text-xs text-[#718073]">{x.nomorSO}</p>
                      </td>
                      <td className="px-4 py-3">{money(x.nominalWajibSetor)}</td>
                      <td className="px-4 py-3">{money(x.nominalDiterima)}</td>
                      <td className="px-4 py-3 font-semibold">{x.statusSetoran}</td>
                      <td className="px-4 py-3">{x.metodePembayaran}</td>
                      <td className="px-4 py-3">{x.referensiPembayaran}</td>
                    </tr>
                  ))}
                {!payments.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[#718073]">
                      Belum ada setoran tercatat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <p className="rounded-xl border border-[#e8dcb9] bg-[#fffaf0] p-4 text-sm leading-6 text-[#725b2b]">
          Aturan sistem: qty SO dan qty BAST tidak dapat diedit dari halaman ini. Penjualan hanya dapat disimpan setelah BAST dikonfirmasi, qty tidak boleh melebihi sisa stok, dan nominal setoran harus sama persis dengan total qty terjual ×
          harga konsinyasi pada SO. Penjualan dan setoran disimpan dalam satu proses.
        </p>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#10271c]/50 p-0 sm:items-center sm:p-5">
          <section role="dialog" aria-modal="true" className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9b7936]">INPUT PENJUALAN + SETORAN PENUH</p>
                <h2 className="mt-2 text-2xl font-semibold">{selected.namaToko}</h2>
                <p className="mt-1 text-sm text-[#718073]">{selected.nomorSO} · Harga dikunci dari SO</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full border px-3 py-2">
                ✕
              </button>
            </div>
            <div className="mt-5 overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-[#f5f7f2] text-xs uppercase">
                  <tr>
                    {["Produk / SKU", "Qty SO", "Diterima", "Terjual sebelumnya", "Sisa tersedia", "Harga SO", "Input terjual"].map((x) => (
                      <th key={x} className="px-3 py-3">
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selected.items.map((it) => (
                    <tr key={it.sku}>
                      <td className="px-3 py-3">
                        {it.namaProduk}
                        <p className="text-xs text-[#718073]">
                          {it.sku} · {it.varian}
                        </p>
                      </td>
                      <td className="px-3 py-3">{qty(it.qtySO || it.qty)}</td>
                      <td className="px-3 py-3">{qty(it.qtyDiterima)}</td>
                      <td className="px-3 py-3">{qty(it.qtyTerjual)}</td>
                      <td className="px-3 py-3 font-semibold">{qty(it.sisaStok)}</td>
                      <td className="px-3 py-3">{money(qty(it.hargaKonsinyasi))}</td>
                      <td className="px-3 py-3">
                        <input type="number" min="0" max={qty(it.sisaStok)} step="1" value={sold[it.sku] ?? "0"} onChange={(e) => setSold((v) => ({ ...v, [it.sku]: e.target.value }))} className="w-24 rounded-lg border px-3 py-2" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Tanggal penjualan
                <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3" />
              </label>
              <label className="text-sm">
                Total wajib setor (otomatis)
                <input value={money(draftTotal)} readOnly className="mt-2 w-full rounded-xl border bg-[#f5f7f2] px-3 py-3 font-semibold" />
              </label>
              <label className="text-sm">
                Nominal setoran diterima
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3" />
              </label>
              <label className="text-sm">
                Metode pembayaran
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-2 w-full rounded-xl border bg-white px-3 py-3">
                  <option value="TRANSFER">Transfer</option>
                  <option value="TUNAI">Tunai</option>
                  <option value="QRIS">QRIS</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Referensi bukti pembayaran
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Nomor referensi transfer / nomor bukti penerimaan" className="mt-2 w-full rounded-xl border px-3 py-3" />
              </label>
              <label className="text-sm sm:col-span-2">
                Catatan (opsional)
                <input value={note} onChange={(e) => setNote(e.target.value)} className="mt-2 w-full rounded-xl border px-3 py-3" />
              </label>
            </div>
            <p className="mt-4 rounded-xl bg-[#fff8e8] p-4 text-sm text-[#725b2b]">Setoran harus sama persis dengan {money(draftTotal)}. Jika berbeda, sistem menolak dan tidak menyimpan penjualan maupun setoran.</p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setSelected(null)} disabled={busy} className="rounded-xl border px-5 py-3 font-semibold">
                Batal
              </button>
              <button onClick={() => void submit()} disabled={busy || draftTotal <= 0} className="rounded-xl bg-[#173d2b] px-5 py-3 font-semibold text-white disabled:opacity-50">
                {busy ? "Menyimpan…" : "Simpan Penjualan + Setoran"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
