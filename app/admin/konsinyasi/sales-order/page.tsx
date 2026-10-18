"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Mitra = { kodeMitra: string; namaToko: string; alamat?: string; namaPIC?: string; status?: string };
type Product = {
  sku: string;
  namaProduk: string;
  kategori?: string;
  varian?: string;
  isiTeaBag?: number;
  satuan: string;
  hargaKonsinyasi: number;
  status?: string;
  beratPerTeaBag?: number;
  jumlahTeaBagPerKemasan?: number;
  totalBeratBersihPerKemasan?: number;
};
type Line = { sku: string; qty: string };
type SO = {
  nomorSO?: string;
  tanggalSO?: string;
  kodeMitra?: string;
  namaToko?: string;
  totalSO?: number;
  status?: string;
  statusDokumen?: string;
  jumlahCetak?: number;
  catatan?: string;
  items?: Array<{ sku?: string; namaProduk?: string; varian?: string; isiTeaBag?: string | number; qty?: number; hargaKonsinyasi?: number; subtotal?: number }>;
};

const inputClass = "w-full rounded-xl border border-[#dce5db] bg-white px-3.5 py-3 text-sm text-[#193d2b] outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10";
const rupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(n) || 0);
const today = () => new Date().toLocaleDateString("en-CA");

export default function SalesOrderKonsinyasiPage() {
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [produk, setProduk] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SO[]>([]);
  const [tanggalSO, setTanggalSO] = useState(today());
  const [kodeMitra, setKodeMitra] = useState("");
  const [catatan, setCatatan] = useState("");
  const [lines, setLines] = useState<Line[]>([{ sku: "", qty: "1" }]);
  const [editingSO, setEditingSO] = useState<string | null>(null);
  const [invoiceSO, setInvoiceSO] = useState<SO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [mRes, pRes, soRes] = await Promise.all([
        fetch("/api/konsinyasi?action=getKonsinyasiMitra", { cache: "no-store" }),
        fetch("/api/konsinyasi/produk?action=getKonsinyasiProduk", { cache: "no-store" }),
        fetch("/api/konsinyasi/so?action=getKonsinyasiSO", { cache: "no-store" }),
      ]);
      const [mData, pData, soData] = await Promise.all([mRes.json(), pRes.json(), soRes.json()]);
      if (!mRes.ok || mData.success === false) throw new Error(mData.message || "Gagal memuat master mitra.");
      if (!pRes.ok || pData.success === false) throw new Error(pData.message || "Gagal memuat master produk.");
      if (!soRes.ok || soData.success === false) throw new Error(soData.message || "Gagal memuat riwayat Sales Order.");
      setMitra(Array.isArray(mData.mitra) ? mData.mitra : []);
      setProduk(Array.isArray(pData.produk) ? pData.produk : []);
      const rows = soData.salesOrder ?? soData.salesOrders ?? soData.data ?? [];
      setOrders(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data Sales Order.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);
  const activeMitra = useMemo(() => mitra.filter((x) => String(x.status || "AKTIF").toUpperCase() === "AKTIF"), [mitra]);
  const activeProducts = useMemo(() => produk.filter((x) => String(x.status || "AKTIF").toUpperCase() === "AKTIF"), [produk]);
  const selectedMitra = activeMitra.find((x) => x.kodeMitra === kodeMitra);
  const cart = lines
    .map((line, index) => ({ ...line, index, product: activeProducts.find((p) => p.sku === line.sku), subtotal: (activeProducts.find((p) => p.sku === line.sku)?.hargaKonsinyasi || 0) * Math.max(0, Number(line.qty) || 0) }))
    .filter((x) => x.sku);
  const total = cart.reduce((sum, line) => sum + line.subtotal, 0);

  function updateLine(index: number, field: keyof Line, value: string | number) {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, [field]: String(value) } : line)));
  }
  function addLine() {
    setLines((current) => [...current, { sku: "", qty: "1" }]);
  }
  function removeLine(index: number) {
    setLines((current) => (current.length === 1 ? [{ sku: "", qty: "1" }] : current.filter((_, i) => i !== index)));
  }

  async function saveSO(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!selectedMitra) {
      setError("Pilih mitra aktif terlebih dahulu.");
      return;
    }
    if (!cart.length || cart.some((x) => !x.product || !Number.isInteger(Number(x.qty)) || Number(x.qty) < 1)) {
      setError("Pilih minimal satu produk dan pastikan kuantitas berupa bilangan bulat minimal 1.");
      return;
    }
    const seen = new Set<string>();
    for (const item of cart) {
      if (seen.has(item.sku)) {
        setError("SKU yang sama tidak boleh dimasukkan dua kali. Ubah kuantitas pada baris SKU tersebut.");
        return;
      }
      seen.add(item.sku);
    }
    setSaving(true);
    try {
      const payload = {
        tanggalSO,
        kodeMitra: selectedMitra.kodeMitra,
        namaToko: selectedMitra.namaToko,
        catatan: editingSO ? `Revisi dari Sales Order No. ${editingSO}${catatan.trim() ? ` | ${catatan.trim()}` : ""}` : catatan.trim(),
        total,
        items: cart.map((x) => ({
          sku: x.product!.sku,
          namaProduk: x.product!.namaProduk,
          kategori: x.product!.kategori || "",
          varian: x.product!.varian || "",
          isiTeaBag: Number(x.product!.beratPerTeaBag ?? x.product!.isiTeaBag ?? 0),
          beratPerTeaBag: Number(x.product!.beratPerTeaBag ?? x.product!.isiTeaBag ?? 0),
          jumlahTeaBagPerKemasan: Number(x.product!.jumlahTeaBagPerKemasan ?? x.product!.isiTeaBag ?? 0),
          totalBeratBersihPerKemasan: Number(x.product!.totalBeratBersihPerKemasan ?? Number(x.product!.beratPerTeaBag ?? x.product!.isiTeaBag ?? 0) * Number(x.product!.jumlahTeaBagPerKemasan ?? x.product!.isiTeaBag ?? 0)),
          satuan: x.product!.satuan,
          qty: Number(x.qty),
          hargaKonsinyasi: Number(x.product!.hargaKonsinyasi),
          subtotal: x.subtotal,
        })),
      };
      // Revisi harus membuat SO baru dan mengarsipkan SO lama di Apps Script.
      const response = await fetch("/api/konsinyasi/so", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingSO ? "reviseKonsinyasiSO" : "saveKonsinyasiSO",
          ...(editingSO ? { nomorSO: editingSO } : {}),
          data: payload,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.message || "Sales Order gagal disimpan.");
      const savedSO = result.salesOrder || result.data || {};
      const nomorSO = savedSO.nomorSO || result.nomorSO || "";
      setNotice(
        `${editingSO ? `Revisi ${editingSO} berhasil diproses sebagai Sales Order baru` : "Sales Order berhasil disimpan"}${nomorSO ? `: ${nomorSO}` : "."}${editingSO ? ". Periksa riwayat untuk memastikan nomor SO baru dan status SO lama sudah diperbarui di database." : ""}`,
      );
      setEditingSO(null);
      setTanggalSO(today());
      setKodeMitra("");
      setCatatan("");
      setLines([{ sku: "", qty: "1" }]);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sales Order gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function registerInvoicePrint(nomorSO: string) {
    const current = orders.find((x) => x.nomorSO === nomorSO) || invoiceSO;
    if (!current || String(current.status || "DRAFT").toUpperCase() === "NONAKTIF") return;
    const isReprint = Number(current.jumlahCetak || 0) > 0;
    const confirmed = window.confirm(isReprint ? `Apakah invoice ${nomorSO} berhasil dicetak/disimpan? Ini akan dicatat sebagai REPRINT.` : `Apakah invoice ${nomorSO} berhasil dicetak/disimpan? Status SO akan menjadi SELESAI.`);
    if (!confirmed) return;
    try {
      const response = await fetch("/api/konsinyasi/so", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "registerKonsinyasiSOPrint", nomorSO }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.message || "Riwayat cetak invoice gagal disimpan.");
      setNotice(isReprint ? `Invoice ${nomorSO} dicatat sebagai REPRINT.` : `Invoice ${nomorSO} dicatat dan status SO menjadi SELESAI.`);
      if (invoiceSO?.nomorSO === nomorSO) {
        setInvoiceSO({ ...invoiceSO, status: result.statusSO || invoiceSO.status, statusDokumen: result.statusDokumen || invoiceSO.statusDokumen, jumlahCetak: Number(result.jumlahCetak ?? Number(invoiceSO.jumlahCetak || 0) + 1) });
      }
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan riwayat cetak invoice.");
    }
  }

  function printInvoice() {
    if (!invoiceSO?.nomorSO) {
      setError("Pilih Sales Order yang valid sebelum mencetak invoice.");
      return;
    }
    if (String(invoiceSO.status || "DRAFT").toUpperCase() === "NONAKTIF") {
      setError("SO NONAKTIF hanya dapat dilihat sebagai histori dan tidak dapat dicetak sebagai dokumen aktif.");
      return;
    }
    const nomorSO = invoiceSO.nomorSO;
    const afterPrint = () => {
      window.removeEventListener("afterprint", afterPrint);
      void registerInvoicePrint(nomorSO);
    };
    window.addEventListener("afterprint", afterPrint, { once: true });
    window.print();
  }

  async function reactivateSO(so: SO) {
    if (!so.nomorSO || !window.confirm(`Aktifkan kembali Sales Order ${so.nomorSO}? Nomor SO dan riwayat tetap sama.`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/konsinyasi/so", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivateKonsinyasiSO", nomorSO: so.nomorSO }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) throw new Error(result.message || "SO gagal diaktifkan kembali.");
      setNotice(`Sales Order ${so.nomorSO} berhasil diaktifkan kembali dengan status ${result.statusSO || "sebelumnya"}.`);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "SO gagal diaktifkan kembali.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-4 text-[#193d2b] sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/konsinyasi" className="text-sm text-[#55745c] hover:underline">
          ← Kembali ke Konsinyasi
        </Link>
        <header className="relative overflow-hidden rounded-3xl bg-[#173d2b] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-8 -top-14 h-56 w-56 rounded-full border border-[#c5a45d]/30" />
          <div className="relative">
            <p className="mb-4 inline-flex rounded-full border border-[#c5a45d]/40 px-3 py-1.5 text-xs tracking-[0.18em] text-[#e6d4a5]">VARTANA · PARTNERSHIP</p>
            <p className="text-sm text-[#d1dfd3]">OPERATIONS MANAGEMENT</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Sales Order</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d1dfd3]">Buat pesanan konsinyasi multi-produk, hitung total otomatis, simpan ke database, dan pantau riwayat pesanan mitra.</p>
          </div>
        </header>
        {notice && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={saveSO} className="space-y-6">
          <section className="rounded-2xl border border-[#e5e6dc] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-semibold tracking-[0.16em] text-[#a1833f]">TRANSAKSI BARU</p>
              <h2 className="mt-2 text-xl font-semibold">Informasi Pesanan</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Tanggal SO
                <input type="date" className={`${inputClass} mt-2`} value={tanggalSO} onChange={(e) => setTanggalSO(e.target.value)} required />
              </label>
              <label className="text-sm font-medium">
                Mitra <span className="text-red-500">*</span>
                <select className={`${inputClass} mt-2`} value={kodeMitra} onChange={(e) => setKodeMitra(e.target.value)} required>
                  <option value="">Pilih mitra aktif</option>
                  {activeMitra.map((m) => (
                    <option key={m.kodeMitra} value={m.kodeMitra}>
                      {m.kodeMitra} - {m.namaToko}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {selectedMitra && (
              <div className="mt-4 rounded-xl bg-[#f5f5ef] p-4 text-sm">
                <p className="font-semibold">{selectedMitra.namaToko}</p>
                <p className="mt-1 text-gray-600">{selectedMitra.alamat || "Alamat belum tersedia"}</p>
                <p className="mt-1 text-gray-500">PIC: {selectedMitra.namaPIC || "-"}</p>
              </div>
            )}
          </section>
          <section className="overflow-hidden rounded-2xl border border-[#e5e6dc] bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-[#eceee6] p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">Daftar Produk</h2>
                <p className="mt-1 text-sm text-gray-500">Pilih SKU dari Master Produk Konsinyasi.</p>
              </div>
              <button type="button" onClick={addLine} className="rounded-xl border border-[#dce5db] px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f5ef]">
                + Tambah Produk
              </button>
            </div>
            {loading ? (
              <p className="p-8 text-sm text-gray-500">Memuat master produk...</p>
            ) : activeProducts.length === 0 ? (
              <p className="p-8 text-sm text-amber-700">Belum ada produk aktif. Tambahkan produk terlebih dahulu di Master Produk.</p>
            ) : (
              <div className="space-y-4 p-4 sm:p-6">
                {lines.map((line, index) => {
                  const p = activeProducts.find((item) => item.sku === line.sku);
                  const subtotal = (p?.hargaKonsinyasi || 0) * (Number(line.qty) || 0);
                  return (
                    <div key={index} className="grid gap-3 rounded-xl border border-[#e5e6dc] p-4 md:grid-cols-[minmax(0,2fr)_100px_minmax(120px,1fr)_auto] md:items-end">
                      <label className="text-sm font-medium">
                        Produk / SKU
                        <select className={`${inputClass} mt-2`} value={line.sku} onChange={(e) => updateLine(index, "sku", e.target.value)} required>
                          <option value="">Pilih produk</option>
                          {activeProducts.map((item) => (
                            <option key={item.sku} value={item.sku} disabled={lines.some((other, i) => i !== index && other.sku === item.sku)}>
                              {item.sku} - {item.namaProduk}
                              {item.varian ? ` (${item.varian})` : ""}
                            </option>
                          ))}
                        </select>
                        {p && (
                          <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                            <span className="block">Satuan jual: {p.satuan}</span>
                            {Number(p.beratPerTeaBag ?? p.isiTeaBag) > 0 && <span className="block">Berat per tea bag: {Number(p.beratPerTeaBag ?? p.isiTeaBag)} g</span>}
                            {Number(p.jumlahTeaBagPerKemasan ?? p.isiTeaBag) > 0 && <span className="block">Isi per kemasan: {Number(p.jumlahTeaBagPerKemasan ?? p.isiTeaBag)} pcs</span>}
                            {Number(p.totalBeratBersihPerKemasan) > 0 && <span className="block">Berat bersih per kemasan: {Number(p.totalBeratBersihPerKemasan)} g</span>}
                          </div>
                        )}
                      </label>
                      <label className="text-sm font-medium">
                        Qty
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateLine(index, "qty", String(Math.max(1, Number(line.qty || 1) - 1)))}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce5db] text-lg font-bold hover:bg-[#edf3eb]"
                            aria-label="Kurangi jumlah"
                          >
                            −
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`${inputClass} mt-0 min-w-0 w-20 px-2 text-center`}
                            value={line.qty}
                            onChange={(e) => updateLine(index, "qty", e.target.value.replace(/[^0-9]/g, ""))}
                            required
                            aria-label="Kuantitas produk"
                          />
                          <button
                            type="button"
                            onClick={() => updateLine(index, "qty", String(Number(line.qty || 0) + 1))}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#dce5db] text-lg font-bold hover:bg-[#edf3eb]"
                            aria-label="Tambah jumlah"
                          >
                            +
                          </button>
                        </div>
                      </label>
                      <div className="text-sm">
                        <p className="text-gray-500">Harga / subtotal</p>
                        <p className="mt-2 font-medium">{p ? rupiah(p.hargaKonsinyasi) : "-"}</p>
                        <p className="mt-1 font-semibold text-[#24563b]">{rupiah(subtotal)}</p>
                      </div>
                      <button type="button" onClick={() => removeLine(index)} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        Hapus
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="border-t border-[#eceee6] bg-[#fcfcf9] p-5 sm:p-6">
              <label className="block text-sm font-medium">
                Catatan pesanan
                <textarea className={`${inputClass} mt-2`} rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional: catatan pengiriman atau permintaan mitra" />
              </label>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total pesanan</p>
                  <p className="mt-1 text-2xl font-bold text-[#173d2b]">{rupiah(total)}</p>
                  <p className="mt-1 text-xs text-gray-500">{cart.length} jenis produk dipilih</p>
                </div>
                <button
                  type="submit"
                  disabled={saving || loading || !activeProducts.length}
                  className="rounded-xl bg-[#173d2b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#24563b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Menyimpan Sales Order..." : editingSO ? "Buat SO Revisi Baru" : "Simpan Sales Order"}
                </button>
              </div>
            </div>
          </section>
        </form>
        <section className="overflow-hidden rounded-2xl border border-[#e5e6dc] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#eceee6] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Riwayat Sales Order</h2>
              <p className="mt-1 text-sm text-gray-500">Data yang dikembalikan oleh Apps Script.</p>
            </div>
            <button type="button" onClick={() => void loadAll()} className="rounded-xl border border-[#dce5db] px-4 py-2.5 text-sm font-semibold hover:bg-[#f5f5ef]">
              ↻ Refresh
            </button>
          </div>
          {loading ? (
            <p className="p-8 text-sm text-gray-500">Memuat riwayat...</p>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-semibold">Belum ada Sales Order</p>
              <p className="mt-2 text-sm text-gray-500">Sales Order yang berhasil disimpan akan muncul di sini jika Apps Script mengembalikan daftar SO.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f7f7f1] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Nomor SO</th>
                    <th className="px-5 py-4">Tanggal</th>
                    <th className="px-5 py-4">Mitra</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((so, i) => (
                    <tr key={so.nomorSO || `${so.kodeMitra}-${so.tanggalSO}-${i}`}>
                      <td className="px-5 py-4 font-semibold">{so.nomorSO || "-"}</td>
                      <td className="px-5 py-4">{so.tanggalSO || "-"}</td>
                      <td className="px-5 py-4">{so.namaToko || so.kodeMitra || "-"}</td>
                      <td className="px-5 py-4 font-semibold">{rupiah(Number(so.totalSO) || 0)}</td>
                      <td className="px-5 py-4">{so.status || "DRAFT"}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {String(so.status || "DRAFT").toUpperCase() === "NONAKTIF" ? (
                            <button type="button" onClick={() => void reactivateSO(so)} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                              Aktifkan Kembali
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!so.nomorSO) return;
                                  if (!Array.isArray(so.items) || !so.items.length) {
                                    setError("Detail item SO belum dikirim oleh Apps Script. Periksa fungsi getKonsinyasiSO_.");
                                    return;
                                  }
                                  setEditingSO(so.nomorSO);
                                  setTanggalSO(so.tanggalSO ? so.tanggalSO.slice(0, 10) : today());
                                  setKodeMitra(so.kodeMitra || "");
                                  setCatatan(so.catatan || "");
                                  setLines(so.items.map((item) => ({ sku: item.sku || "", qty: String(item.qty || 1) })));
                                  setNotice(`Mode revisi ${so.nomorSO}: simpan akan membuat nomor Sales Order baru menggunakan tanggal dan mitra yang dipilih.`);
                                  setError("");
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                disabled={["NONAKTIF", "SELESAI", "DIKIRIM"].includes(String(so.status || "DRAFT").toUpperCase())}
                                className="rounded-lg border border-[#dce5db] px-3 py-2 text-xs font-semibold hover:bg-[#f5f5ef] disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Edit/Revisi
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!so.nomorSO || !window.confirm(`Nonaktifkan Sales Order ${so.nomorSO}? Data, detail, dan riwayat cetak tetap disimpan. SO tidak dihapus permanen.`)) return;
                                  setError("");
                                  setNotice("");
                                  try {
                                    const response = await fetch("/api/konsinyasi/so", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteKonsinyasiSO", nomorSO: so.nomorSO }) });
                                    const result = await response.json();
                                    if (!response.ok || result.success === false) throw new Error(result.message || "SO gagal dinonaktifkan.");
                                    setNotice(`Sales Order ${so.nomorSO} berhasil dinonaktifkan. Riwayat tetap tersimpan.`);
                                    await loadAll();
                                  } catch (e) {
                                    setError(e instanceof Error ? e.message : "SO gagal dinonaktifkan.");
                                  }
                                }}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                              >
                                Nonaktifkan
                              </button>
                            </>
                          )}
                          <button type="button" onClick={() => setInvoiceSO(so)} className="rounded-lg bg-[#173d2b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#24563b]">
                            {Number(so.jumlahCetak || 0) > 0 ? "Cetak Ulang Invoice" : "Cetak Invoice"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {invoiceSO && (
          <div className="invoice-overlay fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-6 text-[#193d2b] shadow-xl sm:p-10" id="so-invoice">
              <header className="mb-6 flex items-center justify-between gap-5 border-b-2 border-[#193d2b] pb-5">
                {Number(invoiceSO.jumlahCetak || 0) > 0 && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rotate-[-28deg] border-4 border-red-700/40 px-8 py-3 text-4xl font-black tracking-[0.25em] text-red-700/40">REPRINT</div>
                )}
                <div className="flex min-w-0 items-center gap-4">
                  <img src="/Logo%20Vartana%20Bulat.png" alt="Logo utama VARTANA Botanical Wellness" className="h-20 w-20 shrink-0 object-contain" />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.18em] text-[#a1833f]">VARTANA BOTANICAL WELLNESS</p>
                    <h2 className="mt-1 text-2xl font-bold">SALES ORDER</h2>
                    <p className="mt-1 text-sm text-gray-500">Dokumen pesanan konsinyasi</p>
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm">
                  <p className="font-bold">{invoiceSO.nomorSO || "-"}</p>
                  <p>{invoiceSO.tanggalSO || "-"}</p>
                </div>
              </header>
              <section className="mb-6 rounded-xl bg-[#f5f5ef] p-4 text-sm">
                <p className="font-semibold">{invoiceSO.namaToko || invoiceSO.kodeMitra || "-"}</p>
                <p className="mt-1">Kode Mitra: {invoiceSO.kodeMitra || "-"}</p>
                <p className="mt-1">Status SO: {invoiceSO.status || "DRAFT"}</p>
                <p className="mt-1">Status dokumen: {Number(invoiceSO.jumlahCetak || 0) > 0 ? "REPRINT" : invoiceSO.statusDokumen || "BELUM CETAK"}</p>
              </section>
              <div className="overflow-x-auto">
                <table className="invoice-items w-full border-collapse text-left text-sm">
                  <colgroup>
                    <col style={{ width: "12%" }} />
                    <col style={{ width: "40%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-y-2 border-[#193d2b] bg-[#f5f5ef]">
                      <th className="px-2 py-3">No.</th>
                      <th className="px-2 py-3">SKU / Nama Produk</th>
                      <th className="px-2 py-3 text-right">Qty</th>
                      <th className="px-2 py-3 text-right">Harga Satuan</th>
                      <th className="px-2 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoiceSO.items || []).map((item, idx) => (
                      <tr key={`${item.sku || "item"}-${idx}`} className="border-b border-gray-200">
                        <td className="px-2 py-3 align-top">{idx + 1}</td>
                        <td className="break-words px-2 py-3 align-top">
                          <div className="font-semibold">{item.sku || "-"}</div>
                          <div className="mt-1">{item.namaProduk || item.sku || "-"}</div>
                          {(() => {
                            const masterProduct = produk.find((p) => p.sku === item.sku);
                            const variant = String(masterProduct?.varian || item.varian || "").trim();
                            const teaBagWeight = Number(masterProduct?.beratPerTeaBag ?? masterProduct?.isiTeaBag ?? item.isiTeaBag ?? 0);
                            const bagsPerPack = Number(masterProduct?.jumlahTeaBagPerKemasan ?? masterProduct?.isiTeaBag ?? 0);
                            const totalNetWeight = Number(masterProduct?.totalBeratBersihPerKemasan ?? teaBagWeight * bagsPerPack);
                            const unit = String(masterProduct?.satuan || "Kemasan").trim();
                            return (
                              <>
                                {variant && <div className="mt-1 text-xs font-semibold text-[#80632b]">Varian: {variant}</div>}
                                {teaBagWeight > 0 && <div className="mt-0.5 text-xs text-gray-600">Berat per tea bag: {teaBagWeight} g</div>}
                                {bagsPerPack > 0 && <div className="mt-0.5 text-xs text-gray-600">Isi per kemasan: {bagsPerPack} pcs tea bag</div>}
                                {totalNetWeight > 0 && (
                                  <div className="mt-0.5 text-xs text-gray-600">
                                    Berat bersih per kemasan: {totalNetWeight} g ({bagsPerPack} pcs × {teaBagWeight} g)
                                  </div>
                                )}
                                <div className="mt-0.5 text-xs text-gray-600">Satuan penjualan: {unit}</div>
                              </>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-3 text-right align-top">{item.qty || 0}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-right align-top">{rupiah(Number(item.hargaKonsinyasi) || 0)}</td>
                        <td className="whitespace-nowrap px-2 py-3 text-right align-top">{rupiah(Number(item.subtotal) || (Number(item.qty) || 0) * (Number(item.hargaKonsinyasi) || 0))}</td>
                      </tr>
                    ))}
                    {(!invoiceSO.items || invoiceSO.items.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-red-600">
                          Detail produk belum tersedia dari Apps Script. Periksa data KON_SO_DETAIL dan deployment getKonsinyasiSO_.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm border-t-2 border-[#193d2b] pt-3">
                  <div className="flex justify-between gap-4 py-1 text-sm">
                    <span>Subtotal</span>
                    <span>{rupiah(Number(invoiceSO.items?.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.hargaKonsinyasi) || 0), 0)) || Number(invoiceSO.totalSO) || 0)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 font-bold">
                    <span>TOTAL SO</span>
                    <span className="text-xl">{rupiah(Number(invoiceSO.totalSO) || 0)}</span>
                  </div>
                </div>
              </div>
              {invoiceSO.catatan && (
                <p className="mt-5 text-sm">
                  <strong>Catatan:</strong> {invoiceSO.catatan}
                </p>
              )}
              <section className="mt-10 grid grid-cols-2 gap-8 text-center text-sm">
                <div className="relative min-h-36">
                  <p>Diserahkan oleh,</p>
                  <div className="mx-auto mt-3 flex h-20 items-center justify-center">
                    <img src="/publicvartana-stempel.png.jpeg" alt="Stempel resmi VARTANA" className="h-20 w-20 object-contain" />
                  </div>
                  <div className="mx-auto mt-2 w-4/5 border-b border-[#193d2b]" />
                  <p className="mt-1">Nama & tanda tangan</p>
                </div>
                <div className="min-h-36">
                  <p>Diterima oleh,</p>
                  <div className="h-24" />
                  <div className="mx-auto w-4/5 border-b border-[#193d2b]" />
                  <p className="mt-1">Nama & tanda tangan mitra</p>
                </div>
              </section>
              <p className="mt-8 text-center text-xs text-gray-400">VARTANA · ROOTED IN EARTH, BUILT FOR GROWTH</p>
              <div className="mt-8 flex justify-end gap-3 print:hidden">
                <button type="button" onClick={() => setInvoiceSO(null)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold">
                  Tutup
                </button>
                <button type="button" onClick={() => void printInvoice()} className="rounded-xl bg-[#173d2b] px-4 py-2 text-sm font-semibold text-white">
                  Cetak / Simpan PDF
                </button>
              </div>
            </div>
          </div>
        )}
        <footer className="pb-3 text-center text-xs text-gray-400">VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH</footer>
      </div>
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 7mm;
        }
        @media print {
          html,
          body {
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            overflow: visible !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #so-invoice,
          #so-invoice * {
            visibility: visible !important;
          }
          .invoice-overlay {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 196mm !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            background: #fff !important;
          }
          #so-invoice {
            position: relative !important;
            display: block !important;
            box-sizing: border-box !important;
            width: 196mm !important;
            max-width: 196mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
            background: #fff !important;
            color: #193d2b !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #so-invoice header {
            margin-bottom: 4mm !important;
            padding-bottom: 3mm !important;
          }
          #so-invoice header img {
            width: 18mm !important;
            height: 18mm !important;
          }
          #so-invoice h2 {
            font-size: 16pt !important;
            line-height: 1.1 !important;
          }
          #so-invoice p {
            line-height: 1.25 !important;
          }
          #so-invoice section {
            margin-bottom: 4mm !important;
            padding: 3mm !important;
          }
          #so-invoice table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
          }
          #so-invoice th,
          #so-invoice td {
            overflow-wrap: break-word !important;
            word-break: normal !important;
            white-space: normal !important;
            padding: 2mm 1.5mm !important;
            font-size: 8pt !important;
            line-height: 1.2 !important;
          }
          #so-invoice tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          #so-invoice .mt-6 {
            margin-top: 3mm !important;
          }
          #so-invoice .mt-10 {
            margin-top: 5mm !important;
          }
          #so-invoice .mt-8 {
            margin-top: 3mm !important;
          }
          #so-invoice .min-h-36 {
            min-height: 0 !important;
          }
          #so-invoice .h-24 {
            height: 14mm !important;
          }
          #so-invoice .h-20 {
            height: 12mm !important;
          }
          #so-invoice .print\:hidden,
          #so-invoice button {
            display: none !important;
          }
          #so-invoice img {
            object-fit: contain !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}</style>
    </main>
  );
}
