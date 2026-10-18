"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AnyRow = Record<string, any>;
type SO = AnyRow & { nomorSO?: string; kodeMitra?: string; namaToko?: string; status?: string; statusSO?: string; items?: AnyRow[]; detail?: AnyRow[]; details?: AnyRow[] };
type Shipment = AnyRow & { nomorPengiriman?: string; nomorSO?: string; namaToko?: string; statusPengiriman?: string; nomorBAST?: string };
const money = (v: unknown) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
const val = (...xs: unknown[]): string => {
  const found = xs.find((x) => x !== undefined && x !== null && String(x).trim() !== "");

  return found === undefined ? "-" : String(found);
};
const listFrom = (response: any, preferredKey?: string): any[] => {
  // API Konsinyasi dapat membungkus data dengan nama properti berbeda.
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [preferredKey ? response[preferredKey] : undefined, response.salesOrder, response.pengiriman, response.data, response.items, response.orders, response.records, response.result];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (candidate && typeof candidate === "object") {
      for (const nestedKey of ["salesOrder", "pengiriman", "data", "items", "orders", "records"]) {
        if (Array.isArray(candidate[nestedKey])) return candidate[nestedKey];
      }
    }
  }
  return [];
};

const normalizeStatus = (value: unknown) =>
  String(value ?? "DRAFT")
    .trim()
    .toUpperCase()
    .replace(/[\s_-]+/g, " ");

export default function PengirimanBASTPage() {
  const [orders, setOrders] = useState<SO[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [products, setProducts] = useState<AnyRow[]>([]);
  const [selected, setSelected] = useState("");
  const [received, setReceived] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [orderChecked, setOrderChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [soRes, shipRes, productRes] = await Promise.all([
        fetch("/api/konsinyasi/so?action=getKonsinyasiSO", { cache: "no-store" }),
        fetch("/api/konsinyasi/pengiriman?action=getKonsinyasiPengiriman", { cache: "no-store" }),
        fetch("/api/konsinyasi/produk?action=getKonsinyasiProduk", { cache: "no-store" }),
      ]);
      const soJson = await soRes.json();
      const shipJson = await shipRes.json();
      const productJson = await productRes.json();
      if (!soRes.ok || soJson.success === false) throw new Error(soJson.message || "Gagal memuat Sales Order.");
      if (!shipRes.ok || shipJson.success === false) throw new Error(shipJson.message || "Gagal memuat data pengiriman.");
      if (!productRes.ok || productJson.success === false) throw new Error(productJson.message || "Gagal memuat Master Produk untuk melengkapi berat dan isi kemasan.");
      setOrders(listFrom(soJson, "salesOrder"));
      setShipments(listFrom(shipJson, "pengiriman"));
      setProducts(listFrom(productJson, "produk"));
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
        const status = normalizeStatus(o.statusSO || o.status);
        const nomorSO = String(o.nomorSO || o.nomorSo || o.noSO || "").trim();
        const sudahAdaPengiriman = shippedSO.has(nomorSO);
        // SELESAI pada modul Sales Order menandakan SO selesai disimpan/dicetak,
        // bukan bukti barang telah dikirim. Pengiriman ditentukan dari sheet pengiriman.
        return Boolean(nomorSO) && !["NONAKTIF", "DIKIRIM", "CANCELLED", "DIBATALKAN"].includes(status) && !sudahAdaPengiriman;
      }),
    [orders, shippedSO],
  );
  const current = eligible.find((o) => String(o.nomorSO || o.nomorSo || o.noSO || "") === selected) || null;
  const rawLines: AnyRow[] = current ? (Array.isArray(current.items) ? current.items : Array.isArray(current.detail) ? current.detail : Array.isArray(current.details) ? current.details : []) : [];
  // Detail SO tidak selalu menyimpan berat/isi kemasan. Lengkapi dari Master Produk berdasarkan SKU.
  const productBySku = useMemo(
    () =>
      new Map(
        products.map((p) => [
          String(p.sku ?? p.SKU ?? "")
            .trim()
            .toUpperCase(),
          p,
        ]),
      ),
    [products],
  );
  const lines: AnyRow[] = rawLines.map((line) => {
    const sku = String(line.sku ?? line.SKU ?? "")
      .trim()
      .toUpperCase();
    const master = productBySku.get(sku) || {};
    return {
      ...master,
      ...line,
      beratPerTeaBag: val(line.beratPerTeaBag, line.beratTeaBag, master.beratPerTeaBag, master.beratTeaBag, master.beratPerSachet, 0),
      jumlahTeaBagPerKemasan: val(line.jumlahTeaBagPerKemasan, line.isiPerKemasan, line.isiTeaBag, line.jumlahTeaBag, master.jumlahTeaBagPerKemasan, master.isiTeaBag, 0),
      totalBeratBersihPerKemasan: val(line.totalBeratBersihPerKemasan, line.totalBeratPerKemasan, master.totalBeratPerKemasan, 0),
      satuan: val(line.satuan, master.satuan, "box"),
    };
  });

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
          <select
            id="so-select"
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setOrderChecked(false);
              setError("");
              setNotice("");
            }}
            className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
            disabled={loading || saving}
          >
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
              <div className="rounded-xl border border-[#dce5db] bg-[#f7f8f3] p-4">
                <h3 className="font-semibold">1. Konfirmasi Sales Order dan barang keluar</h3>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  Cocokkan daftar pesanan di bawah dengan barang yang benar-benar disiapkan. Pengiriman mengikuti kuantitas SO; jika barang yang disiapkan berbeda, selesaikan selisihnya sebelum membuat pengiriman.
                </p>
              </div>
              {lines.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="p-3">Konfirmasi</th>
                        <th className="p-3">SKU / Produk</th>
                        <th className="p-3">Varian</th>
                        <th className="p-3">Berat / tea bag</th>
                        <th className="p-3">Isi / kemasan</th>
                        <th className="p-3 text-right">Qty SO / keluar</th>
                        <th className="p-3 text-right">Harga</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((it, i) => {
                        const isiKemasan = val(it.jumlahTeaBagPerKemasan, it.isiPerKemasan, it.isiTeaBag, it.jumlahTeaBag, "-");
                        const beratPerBag = val(it.beratPerTeaBag, it.beratTeaBag, "-");
                        const qty = val(it.qty, it.qtySO, it.jumlah, 0);
                        return (
                          <tr key={`${val(it.sku, it.SKU)}-${i}`} className="border-b border-gray-100">
                            <td className="p-3">
                              <span className="inline-flex rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-800">Sesuai SO</span>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">{val(it.namaProduk, it.nama, it.productName)}</div>
                              <div className="text-xs text-gray-500">{val(it.sku, it.SKU)}</div>
                            </td>
                            <td className="p-3">{val(it.varian, it.namaVarian)}</td>
                            <td className="p-3">{Number(beratPerBag) > 0 ? `${beratPerBag} g` : "-"}</td>
                            <td className="p-3">
                              {isiKemasan !== "-" ? `${isiKemasan} tea bag/kemasan` : "Data isi kemasan belum tersedia dari API"}
                              {Number(it.totalBeratBersihPerKemasan) > 0 ? <div className="text-xs text-gray-500">Berat bersih: {it.totalBeratBersihPerKemasan} g</div> : null}
                            </td>
                            <td className="p-3 text-right font-semibold">
                              {qty} {val(it.satuan, "box")}
                            </td>
                            <td className="p-3 text-right">{money(val(it.hargaKonsinyasi, it.hargaSatuan, it.harga, 0))}</td>
                            <td className="p-3 text-right">{money(val(it.subtotal, Number(qty) * Number(val(it.hargaKonsinyasi, it.hargaSatuan, 0)), 0))}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  Nomor SO berhasil dipilih, tetapi detail item tidak ditemukan dalam bentuk data yang dikenali halaman ini. Pengiriman tidak bisa dibuat sampai bentuk respons API dipastikan.
                </p>
              )}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#dce5db] p-4 text-sm">
                <input type="checkbox" checked={orderChecked} onChange={(e) => setOrderChecked(e.target.checked)} className="mt-1 h-4 w-4 accent-[#173d2b]" />
                <span>
                  <strong>Pesanan sudah saya konfirmasi.</strong>
                  <span className="mt-1 block text-gray-600">Saya sudah mencocokkan SKU, varian, isi kemasan, dan jumlah barang yang akan dikeluarkan dengan Sales Order.</span>
                </span>
              </label>
              <label className="block text-sm font-semibold" htmlFor="ship-notes">
                Catatan pengiriman (opsional)
              </label>
              <textarea id="ship-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-gray-300 p-3 text-sm" placeholder="Catatan untuk pengiriman / BAST" />
              <button onClick={() => void createShipment()} disabled={saving || !lines.length || !orderChecked} className="rounded-xl bg-[#173d2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24543c] disabled:opacity-50">
                {saving ? "Menyimpan…" : "Konfirmasi Pesanan & Buat Pengiriman"}
              </button>
              <p className="text-xs leading-5 text-gray-500">Konfirmasi ini mencatat bahwa SO sudah diperiksa; tidak mengubah qty SO. Stok mitra tidak boleh bertambah saat pengiriman dibuat, hanya setelah BAST penerimaan dikonfirmasi.</p>
            </div>
          )}
          {!loading && !eligible.length && (
            <div className="mt-4 rounded-xl bg-[#f7f8f3] p-4 text-sm text-gray-600">
              <p>Belum ada Sales Order yang memenuhi syarat untuk dibuatkan pengiriman.</p>
              <p className="mt-2 text-xs">
                Data SO terbaca: {orders.length} · Riwayat pengiriman terbaca: {shipments.length}. Jika jumlah SO 0, periksa bentuk respons endpoint Sales Order.
              </p>
            </div>
          )}
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
