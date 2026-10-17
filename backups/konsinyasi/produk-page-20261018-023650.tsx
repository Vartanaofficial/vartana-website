"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Product = {
  sku: string;
  namaProduk: string;
  kategori: string;
  satuan: string;
  hargaKonsinyasi: number;
  status: string;
};

const emptyForm = {
  namaProduk: "",
  kategori: "",
  satuan: "Pcs",
  hargaKonsinyasi: "",
  status: "AKTIF",
};

export default function MasterProdukKonsinyasiPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingSku, setEditingSku] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "/api/konsinyasi/produk?action=getKonsinyasiProduk",
        { cache: "no-store" }
      );
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Gagal mengambil data produk.");
      }
      setItems(Array.isArray(result.produk) ? result.produk : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadProducts(); }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) =>
      [item.sku, item.namaProduk, item.kategori, item.satuan]
        .some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [items, search]);

  function startEdit(item: Product) {
    setEditingSku(item.sku);
    setForm({
      namaProduk: item.namaProduk || "",
      kategori: item.kategori || "",
      satuan: item.satuan || "Pcs",
      hargaKonsinyasi: String(item.hargaKonsinyasi ?? ""),
      status: item.status || "AKTIF",
    });
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const price = Number(form.hargaKonsinyasi);
    if (!form.namaProduk.trim() || !form.satuan.trim() || !Number.isFinite(price) || price < 0) {
      setError("Nama produk, satuan, dan harga yang valid wajib diisi.");
      setSaving(false);
      return;
    }

    const data = {
      ...form,
      namaProduk: form.namaProduk.trim(),
      kategori: form.kategori.trim(),
      hargaKonsinyasi: price,
      ...(editingSku ? { sku: editingSku } : {}),
    };

    try {
      const response = await fetch("/api/konsinyasi/produk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: editingSku ? "updateKonsinyasiProduk" : "saveKonsinyasiProduk",
          data,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Produk gagal disimpan.");
      }

      setMessage(result.message || "Produk berhasil disimpan.");
      setForm(emptyForm);
      setEditingSku("");
      setShowForm(false);
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Produk gagal disimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-4 text-[#193d2b] sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link href="/admin/konsinyasi" className="text-sm text-[#55745c] hover:underline">
          ← Dashboard Konsinyasi
        </Link>

        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-[#173d2b] p-7 text-white sm:flex-row sm:items-end sm:p-9">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#e6d4a5]">VARTANA · PRODUCT MASTER</p>
            <h1 className="mt-3 text-3xl font-semibold">Master Produk Konsinyasi</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#d1dfd3]">
              Kelola SKU dan harga dasar produk khusus transaksi konsinyasi.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSku("");
              setForm(emptyForm);
              setShowForm(!showForm);
              setMessage("");
              setError("");
            }}
            className="rounded-xl bg-[#d9bb70] px-5 py-3 text-sm font-semibold text-[#173d2b]"
          >
            {showForm ? "Tutup Form" : "+ Tambah Produk"}
          </button>
        </header>

        {message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {showForm && (
          <form onSubmit={submitForm} className="space-y-5 rounded-2xl border border-[#e5e6dc] bg-white p-6">
            <h2 className="text-lg font-semibold">{editingSku ? `Edit Produk · ${editingSku}` : "Registrasi Produk Baru"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">Nama Produk *
                <input required value={form.namaProduk} onChange={(e) => setForm({ ...form, namaProduk: e.target.value })} className="w-full rounded-xl border p-3" />
              </label>
              <label className="space-y-2 text-sm">Kategori
                <input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full rounded-xl border p-3" placeholder="Contoh: Botanical Wellness" />
              </label>
              <label className="space-y-2 text-sm">Satuan *
                <select value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} className="w-full rounded-xl border p-3">
                  <option value="Pcs">Pcs</option><option value="Pouch">Pouch</option><option value="Box">Box</option><option value="Jar">Jar</option><option value="Pack">Pack</option>
                </select>
              </label>
              <label className="space-y-2 text-sm">Harga Konsinyasi (Rp) *
                <input required type="number" min="0" step="1" value={form.hargaKonsinyasi} onChange={(e) => setForm({ ...form, hargaKonsinyasi: e.target.value })} className="w-full rounded-xl border p-3" />
              </label>
              <label className="space-y-2 text-sm">Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full rounded-xl border p-3">
                  <option value="AKTIF">Aktif</option><option value="NONAKTIF">Nonaktif</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <button disabled={saving} className="rounded-xl bg-[#173d2b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? "Menyimpan..." : editingSku ? "Simpan Perubahan" : "Simpan Produk"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingSku(""); setForm(emptyForm); }} className="rounded-xl border px-5 py-3 text-sm">
                Batal
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e5e6dc] bg-white">
          <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold">Daftar Produk</h2>
              <p className="mt-1 text-sm text-gray-500">{items.length} produk terdaftar</p>
            </div>
            <div className="flex gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari SKU atau nama..." className="min-w-0 rounded-xl border p-3 text-sm" />
              <button onClick={() => void loadProducts()} className="rounded-xl border px-4 text-sm">Refresh</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f7f1] text-xs uppercase tracking-wide text-gray-500">
                <tr><th className="p-4">SKU / Produk</th><th className="p-4">Kategori</th><th className="p-4">Satuan</th><th className="p-4">Harga</th><th className="p-4">Status</th><th className="p-4">Aksi</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">Memuat produk...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-gray-500">{error ? "Data belum berhasil dimuat." : "Belum ada produk. Tambahkan produk pertama."}</td></tr>
                ) : filtered.map((item) => (
                  <tr key={item.sku} className="border-t">
                    <td className="p-4"><div className="font-semibold">{item.namaProduk}</div><div className="mt-1 text-xs text-gray-500">{item.sku}</div></td>
                    <td className="p-4">{item.kategori || "—"}</td>
                    <td className="p-4">{item.satuan}</td>
                    <td className="whitespace-nowrap p-4">{Number(item.hargaKonsinyasi || 0).toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })}</td>
                    <td className="p-4"><span className={`rounded-full px-3 py-1 text-xs ${item.status === "AKTIF" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.status}</span></td>
                    <td className="p-4"><button onClick={() => startEdit(item)} className="rounded-lg border px-3 py-2 text-xs hover:bg-gray-50">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <footer className="pb-4 text-center text-xs text-gray-400">VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH</footer>
      </div>
    </main>
  );
}