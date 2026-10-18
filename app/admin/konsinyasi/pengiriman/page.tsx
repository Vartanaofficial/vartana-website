"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AnyRow = Record<string, any>;
type SO = AnyRow & { nomorSO?: string; kodeMitra?: string; namaToko?: string; status?: string; statusSO?: string; items?: AnyRow[]; detail?: AnyRow[]; details?: AnyRow[] };
type Shipment = AnyRow & { nomorPengiriman?: string; nomorSO?: string; namaToko?: string; statusPengiriman?: string; nomorBAST?: string };
const money = (v: unknown) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
const val = (...xs: unknown[]) => xs.find((x) => x !== undefined && x !== null && String(x).trim() !== "") ?? "-";
const listFrom = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  const candidates = [data?.salesOrder, data?.pengiriman, data?.data, data?.items, data?.orders];
  return candidates.find(Array.isArray) ?? [];
};

export default function PengirimanBASTPage() {
  const [orders, setOrders] = useState<SO[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selected, setSelected] = useState("");
  const [received, setReceived] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [soRes, shipRes] = await Promise.all([fetch("/api/konsinyasi/so?action=getKonsinyasiSO", { cache: "no-store" }), fetch("/api/konsinyasi/pengiriman?action=getKonsinyasiPengiriman", { cache: "no-store" })]);
      const soJson = await soRes.json();
      const shipJson = await shipRes.json();
      if (!soRes.ok || soJson.success === false) throw new Error(soJson.message || "Gagal memuat Sales Order.");
      if (!shipRes.ok || shipJson.success === false) throw new Error(shipJson.message || "Gagal memuat data pengiriman.");
      setOrders(listFrom(soJson));
      setShipments(listFrom(shipJson));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const shippedSO = useMemo(() => new Set(shipments.map((x) => String(x.nomorSO || "").trim()).filter(Boolean)), [shipments]);
  const eligible = useMemo(
    () =>
      orders.filter((o) => {
        const status = String(o.statusSO || o.status || "DRAFT").toUpperCase();
        return !["NONAKTIF", "DIKIRIM", "CANCELLED", "DIBATALKAN"].includes(status) && !shippedSO.has(String(o.nomorSO || "").trim());
      }),
    [orders, shippedSO],
  );
  const current = eligible.find((o) => o.nomorSO === selected) || null;
  const lines: AnyRow[] = current ? (Array.isArray(current.items) ? current.items : Array.isArray(current.detail) ? current.detail : Array.isArray(current.details) ? current.details : []) : [];

  async function createShipment() {
    if (!current) {
      setError("Pilih Sales Order terlebih dahulu.");
      return;
    }
    if (!window.confirm(`Buat pengiriman untuk ${current.nomorSO}? Stok mitra tidak boleh bertambah sebelum BAST dikonfirmasi.`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/konsinyasi/pengiriman", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "saveKonsinyasiPengiriman", nomorSO: current.nomorSO, catatan: notes }) });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Pengiriman gagal disimpan.");
      setNotice(json.message || "Pengiriman berhasil dicatat.");
      setSelected("");
      setNotes("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pengiriman gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmBAST(shipment: Shipment) {
    const so = orders.find((o) => o.nomorSO === shipment.nomorSO);
    const detailLines: AnyRow[] = so ? (Array.isArray(so.items) ? so.items : Array.isArray(so.detail) ? so.detail : Array.isArray(so.details) ? so.details : []) : [];
    if (!detailLines.length) {
      setError("Detail SO tidak ditemukan. BAST tidak dikonfirmasi agar stok tidak salah.");
      return;
    }
    const items = detailLines.map((it, i) => ({ sku: String(val(it.sku, it.SKU)), qtyDiterima: Number(received[`${shipment.nomorSO}:${val(it.sku, it.SKU, i)}`] ?? val(it.qty, it.qtySO, it.jumlah, 0)) }));
    if (items.some((x) => !Number.isFinite(x.qtyDiterima) || x.qtyDiterima < 0)) {
      setError("Jumlah diterima harus angka nol atau lebih.");
      return;
    }
    if (!window.confirm(`Konfirmasi penerimaan BAST ${shipment.nomorBAST || shipment.nomorPengiriman}? Pastikan jumlah aktual sudah benar. Pastikan Apps Script sudah diperbarui untuk menambah stok hanya sekali pada konfirmasi.`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/konsinyasi/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "koreksiPenerimaanKonsinyasi", nomorSO: shipment.nomorSO, items, catatan: notes }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Konfirmasi BAST gagal.");
      setNotice(json.message || "Penerimaan BAST berhasil dikonfirmasi.");
      setReceived({});
      setNotes("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Konfirmasi BAST gagal.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-4 text-[#193d2b] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/konsinyasi" className="text-sm text-[#55745c] hover:underline">
          ← Kembali ke Dashboard Konsinyasi
        </Link>
        <header className="rounded-3xl bg-[#173d2b] p-7 text-white sm:p-9">
          <p className="text-xs tracking-[0.18em] text-[#e6d4a5]">VARTANA · KONSINYASI</p>
          <h1 className="mt-3 text-3xl font-semibold">Pengiriman &amp; BAST</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#d1dfd3]">Pengiriman dibuat berdasarkan Sales Order yang sudah tersimpan. Stok mitra semestinya bertambah hanya setelah penerimaan BAST dikonfirmasi sesuai jumlah aktual.</p>
        </header>
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}
        {notice && <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Buat Pengiriman dari Sales Order</h2>
            <p className="mt-1 text-sm text-gray-500">SO NONAKTIF dan SO yang sudah memiliki pengiriman tidak ditampilkan.</p>
          </div>
          <button onClick={() => void load()} disabled={loading || saving} className="rounded-xl border border-[#dce5db] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f7f8f3] disabled:opacity-50">
            {loading ? "Memuat…" : "Muat ulang data"}
          </button>
        </div>
        <section className="rounded-2xl border border-[#e5e6dc] bg-white p-5 sm:p-7">
          <label className="block text-sm font-semibold" htmlFor="so-select">
            Pilih Sales Order
          </label>
          <select id="so-select" value={selected} onChange={(e) => setSelected(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm" disabled={loading || saving}>
            <option value="">{loading ? "Memuat Sales Order…" : "Pilih nomor SO"}</option>
            {eligible.map((o) => (
              <option key={o.nomorSO} value={o.nomorSO}>
                {o.nomorSO} — {val(o.namaToko, o.kodeMitra)} ({val(o.statusSO, o.status, "DRAFT")})
              </option>
            ))}
          </select>
          {current && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Nomor SO</p>
                  <p className="mt-1 font-semibold">{current.nomorSO}</p>
                </div>
                <div className="rounded-xl bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Mitra</p>
                  <p className="mt-1 font-semibold">{val(current.namaToko, current.kodeMitra)}</p>
                </div>
                <div className="rounded-xl bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Status SO</p>
                  <p className="mt-1 font-semibold">{val(current.statusSO, current.status)}</p>
                </div>
              </div>
              <h3 className="font-semibold">Detail produk dari Sales Order</h3>
              {lines.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="p-3">SKU / Produk</th>
                        <th className="p-3">Varian</th>
                        <th className="p-3">Berat / tea bag</th>
                        <th className="p-3">Isi / kemasan</th>
                        <th className="p-3 text-right">Qty SO</th>
                        <th className="p-3 text-right">Harga</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((it, i) => (
                        <tr key={`${val(it.sku, it.SKU)}-${i}`} className="border-b border-gray-100">
                          <td className="p-3">
                            <div className="font-semibold">{val(it.namaProduk, it.nama, it.productName)}</div>
                            <div className="text-xs text-gray-500">{val(it.sku, it.SKU)}</div>
                          </td>
                          <td className="p-3">{val(it.varian, it.namaVarian)}</td>
                          <td className="p-3">
                            {val(it.beratPerTeaBag, it.isiTeaBag, "-")}
                            {Number(it.beratPerTeaBag ?? it.isiTeaBag) > 0 ? " g" : ""}
                          </td>
                          <td className="p-3">
                            {val(it.jumlahTeaBagPerKemasan, "-")}
                            {it.jumlahTeaBagPerKemasan ? " pcs" : ""}
                            {Number(it.totalBeratBersihPerKemasan) > 0 ? <div className="text-xs text-gray-500">{it.totalBeratBersihPerKemasan} g</div> : null}
                          </td>
                          <td className="p-3 text-right">
                            {val(it.qty, it.qtySO, it.jumlah, 0)} {val(it.satuan, "box")}
                          </td>
                          <td className="p-3 text-right">{money(val(it.hargaKonsinyasi, it.hargaSatuan, it.harga, 0))}</td>
                          <td className="p-3 text-right">{money(val(it.subtotal, Number(val(it.qty, it.qtySO, 0)) * Number(val(it.hargaKonsinyasi, it.hargaSatuan, 0)), 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Nomor SO berhasil dipilih, tetapi detail item tidak ditemukan dalam bentuk data yang dikenali halaman ini. Pengiriman tidak bisa dibuat sampai bentuk respons API dipastikan.
                </p>
              )}
              <label className="block text-sm font-semibold" htmlFor="ship-notes">
                Catatan pengiriman (opsional)
              </label>
              <textarea id="ship-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-gray-300 p-3 text-sm" placeholder="Catatan untuk pengiriman / BAST" />
              <button onClick={() => void createShipment()} disabled={saving || !lines.length} className="rounded-xl bg-[#173d2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24543c] disabled:opacity-50">
                {saving ? "Menyimpan…" : "Buat Pengiriman & BAST"}
              </button>
              <p className="text-xs leading-5 text-gray-500">Pembuatan pengiriman tidak boleh menambah saldo stok mitra. Pastikan handler Apps Script sudah diperbarui sesuai alur sebelum transaksi nyata diproses.</p>
            </div>
          )}
          {!loading && !eligible.length && <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-600">Belum ada Sales Order yang memenuhi syarat untuk dibuatkan pengiriman.</p>}
        </section>
        <section className="rounded-2xl border border-[#e5e6dc] bg-white p-5 sm:p-7">
          <h2 className="text-xl font-semibold">Riwayat Pengiriman &amp; BAST</h2>
          <p className="mt-1 text-sm text-gray-500">Daftar dari sheet pengiriman yang sudah tersimpan.</p>
          {loading ? (
            <p className="mt-4 text-sm text-gray-500">Memuat data…</p>
          ) : shipments.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-gray-500">
                    <th className="p-3">No. Pengiriman</th>
                    <th className="p-3">No. SO</th>
                    <th className="p-3">Mitra</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">No. BAST</th>
                    <th className="p-3">Tgl. BAST</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s, i) => {
                    const confirmed =
                      String(s.statusPengiriman || "")
                        .toUpperCase()
                        .includes("SELESAI") || Boolean(s.tanggalBAST);
                    return (
                      <tr key={`${s.nomorPengiriman}-${i}`} className="border-b border-gray-100">
                        <td className="p-3 font-semibold">{val(s.nomorPengiriman)}</td>
                        <td className="p-3">{val(s.nomorSO)}</td>
                        <td className="p-3">{val(s.namaToko, s.kodeMitra)}</td>
                        <td className="p-3">{val(s.statusPengiriman)}</td>
                        <td className="p-3">{val(s.nomorBAST)}</td>
                        <td className="p-3">{val(s.tanggalBAST)}</td>
                        <td className="p-3">
                          {!confirmed && (
                            <button
                              onClick={() => {
                                setSelected("");
                                setNotes("");
                                setError("Pilih jumlah aktual diterima untuk setiap SKU pada bagian konfirmasi BAST. Bagian ini perlu dibuka dari detail SO terkait.");
                              }}
                              className="rounded-lg border px-3 py-2 text-xs font-semibold"
                            >
                              Konfirmasi BAST
                            </button>
                          )}
                          {confirmed && <span className="text-xs text-green-700">Tercatat</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-600">Belum ada riwayat pengiriman.</p>
          )}
        </section>
        <p className="text-xs leading-5 text-gray-500">
          Integrasi mengikuti action Apps Script yang tersedia. Sebelum konfirmasi BAST digunakan untuk transaksi nyata, handler Apps Script wajib dicek/diperbarui untuk mencegah mutasi stok ganda dan memastikan konfirmasi berulang ditolak.
        </p>
      </div>
    </main>
  );
}
