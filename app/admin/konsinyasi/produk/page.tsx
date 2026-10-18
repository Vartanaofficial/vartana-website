"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

type Product = {
  sku: string;
  namaProduk: string;
  kategori: string;
  varian: string;
  isiTeaBag: number; // jumlah tea bag per kemasan (kompatibilitas data lama)
  beratPerTeaBag: number;
  jumlahTeaBagPerKemasan: number;
  totalBeratPerKemasan?: number;
  satuan: string;
  hargaKonsinyasi: number;
  status: string;
};

type ProductForm = {
  namaProduk: string;
  kategori: string;
  varian: string;
  beratPerTeaBag: string;
  jumlahTeaBagPerKemasan: string;
  satuan: string;
  hargaKonsinyasi: string;
  status: string;
};

const emptyForm: ProductForm = {
  namaProduk: "",
  kategori: "BOTANICAL WELLNESS",
  varian: "",
  beratPerTeaBag: "9",
  jumlahTeaBagPerKemasan: "0",
  satuan: "Jar",
  hargaKonsinyasi: "",
  status: "AKTIF",
};

const inputClass = "w-full rounded-xl border border-[#cbd8cc] bg-white px-4 py-3 text-sm text-[#193d2b] outline-none focus:border-[#1b5036] focus:ring-2 focus:ring-[#d9bd72]/40";

const labelClass = "mb-1.5 block text-sm font-medium text-[#315541]";

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function MasterProdukKonsinyasiPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(emptyForm);
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
      const response = await fetch("/api/konsinyasi/produk?action=getKonsinyasiProduk", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Gagal mengambil data produk.");
      }

      setItems(Array.isArray(result.produk) ? result.produk : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data produk.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) =>
      [item.sku, item.namaProduk, item.kategori, item.varian, item.satuan, String(item.isiTeaBag ?? ""), String(item.beratPerTeaBag ?? ""), String(item.jumlahTeaBagPerKemasan ?? "")].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [items, search]);

  function changeField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNewForm() {
    setForm(emptyForm);
    setEditingSku("");
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function startEdit(item: Product) {
    setEditingSku(item.sku);
    setForm({
      namaProduk: item.namaProduk || "",
      kategori: item.kategori || "",
      varian: item.varian || "",
      beratPerTeaBag: String(item.beratPerTeaBag ?? 0),
      jumlahTeaBagPerKemasan: String(item.jumlahTeaBagPerKemasan ?? item.isiTeaBag ?? 0),
      satuan: item.satuan || "Jar",
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
    const beratPerTeaBag = Number(form.beratPerTeaBag);
    const teaBagCount = Number(form.jumlahTeaBagPerKemasan);

    if (!form.namaProduk.trim()) {
      setError("Nama produk wajib diisi.");
      setSaving(false);
      return;
    }

    if (!form.satuan.trim()) {
      setError("Satuan wajib dipilih.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Harga konsinyasi harus lebih besar dari nol.");
      setSaving(false);
      return;
    }

    if (!Number.isFinite(beratPerTeaBag) || beratPerTeaBag < 0 || (teaBagCount > 0 && beratPerTeaBag <= 0)) {
      setError("Berat per tea bag harus lebih besar dari nol jika kemasan berisi tea bag.");
      setSaving(false);
      return;
    }

    if (!Number.isInteger(teaBagCount) || teaBagCount < 0 || (["Jar", "Box", "Pack", "Pouch"].includes(form.satuan) && teaBagCount < 1)) {
      setError("Jumlah tea bag per kemasan harus bilangan bulat minimal 1 untuk Jar, Box, Pack, atau Pouch.");
      setSaving(false);
      return;
    }

    const data = {
      namaProduk: form.namaProduk.trim(),
      kategori: form.kategori.trim(),
      varian: form.varian.trim(),
      // isiTeaBag tetap dikirim sebagai alias agar kompatibel dengan Apps Script lama.
      isiTeaBag: teaBagCount,
      beratPerTeaBag,
      jumlahTeaBagPerKemasan: teaBagCount,
      totalBeratPerKemasan: beratPerTeaBag * teaBagCount,
      satuan: form.satuan,
      hargaKonsinyasi: price,
      status: form.status,
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

      // Jangan tampilkan sukses sebelum Apps Script mengonfirmasi.
      setMessage(result.message || "Produk berhasil disimpan.");
      setShowForm(false);
      setEditingSku("");
      setForm(emptyForm);

      // Baca ulang dari server agar daftar mencerminkan spreadsheet.
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Produk gagal disimpan.");
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

        <section className="flex flex-col justify-between gap-5 rounded-[26px] bg-[#173f2d] p-7 text-white shadow-sm sm:flex-row sm:items-center sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e4c878]">VARTANA · PRODUCT MASTER</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Master Produk Konsinyasi</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e0e9e1]">Kelola SKU, varian, berat per tea bag, jumlah tea bag per kemasan, dan harga konsinyasi.</p>
          </div>

          <button type="button" onClick={() => (showForm ? setShowForm(false) : openNewForm())} className="rounded-xl bg-[#dfc173] px-5 py-3 text-sm font-bold text-[#193d2b] hover:bg-[#ecd38a]">
            {showForm ? "Tutup Form" : "+ Tambah Produk"}
          </button>
        </section>

        {message && (
          <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="rounded-2xl border border-[#e4e4d8] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-bold">{editingSku ? "Edit Produk" : "Registrasi Produk Baru"}</h2>

            <form onSubmit={submitForm} className="space-y-5">
              {editingSku && (
                <div>
                  <label className={labelClass}>SKU</label>
                  <input className={inputClass} value={editingSku} readOnly />
                  <p className="mt-1 text-xs text-gray-500">SKU yang sudah digunakan tidak diubah saat edit.</p>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nama Produk *</label>
                  <input className={inputClass} value={form.namaProduk} onChange={(e) => changeField("namaProduk", e.target.value)} placeholder="Contoh: VARTANA BOTANICAL WELLNESS JAR" required />
                </div>

                <div>
                  <label className={labelClass}>Kategori</label>
                  <input className={inputClass} value={form.kategori} onChange={(e) => changeField("kategori", e.target.value)} placeholder="Contoh: BOTANICAL WELLNESS" />
                </div>

                <div>
                  <label className={labelClass}>Varian Produk</label>
                  <input className={inputClass} value={form.varian} onChange={(e) => changeField("varian", e.target.value)} placeholder="Contoh: Signature Blend" />
                </div>

                <div>
                  <label className={labelClass}>Berat per Tea Bag (gram) *</label>
                  <input className={inputClass} type="number" min="0" step="0.1" value={form.beratPerTeaBag} onChange={(e) => changeField("beratPerTeaBag", e.target.value)} required />
                  <p className="mt-1 text-xs text-gray-500">Contoh: 9 gram untuk satu tea bag.</p>
                </div>

                <div>
                  <label className={labelClass}>Jumlah Tea Bag per Kemasan (pcs) *</label>
                  <input className={inputClass} type="number" min="0" step="1" value={form.jumlahTeaBagPerKemasan} onChange={(e) => changeField("jumlahTeaBagPerKemasan", e.target.value)} required />
                  <p className="mt-1 text-xs text-gray-500">Jumlah tea bag dalam satu box/jar/pouch.</p>
                  <p className="mt-1 text-sm font-semibold text-[#315541]">Total berat bersih: {(Math.max(0, Number(form.beratPerTeaBag) || 0) * Math.max(0, Number(form.jumlahTeaBagPerKemasan) || 0)).toLocaleString("id-ID")} g</p>
                </div>

                <div>
                  <label className={labelClass}>Satuan *</label>
                  <select className={inputClass} value={form.satuan} onChange={(e) => changeField("satuan", e.target.value)} required>
                    <option value="Jar">Jar</option>
                    <option value="Pouch">Pouch</option>
                    <option value="Box">Box</option>
                    <option value="Pack">Pack</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Harga Konsinyasi (Rp) *</label>
                  <input className={inputClass} type="number" min="1" step="1" value={form.hargaKonsinyasi} onChange={(e) => changeField("hargaKonsinyasi", e.target.value)} placeholder="Contoh: 30000" required />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={form.status} onChange={(e) => changeField("status", e.target.value)}>
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                <button type="submit" disabled={saving} className="rounded-xl bg-[#173f2d] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? "Menyimpan..." : editingSku ? "Simpan Perubahan" : "Simpan Produk"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSku("");
                    setForm(emptyForm);
                    setError("");
                  }}
                  className="rounded-xl border border-[#b9cbbd] px-6 py-3 text-sm font-semibold hover:bg-[#f5f5ef]"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e4e4d8] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-[#e4e4d8] p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold">Daftar Produk</h2>
              <p className="mt-1 text-sm text-gray-500">{loading ? "Memuat data..." : `${filtered.length} produk ditampilkan`}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <input className={`${inputClass} min-w-[220px] sm:w-64`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari SKU, nama, varian..." aria-label="Cari produk" />
              <button type="button" onClick={() => void loadProducts()} className="rounded-xl border border-[#b9cbbd] px-4 py-3 text-sm font-semibold hover:bg-[#f5f5ef]">
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-[#f7f7f1] text-xs uppercase tracking-wide text-[#55745c]">
                <tr>
                  <th className="px-4 py-4">SKU / Produk</th>
                  <th className="px-4 py-4">Kategori</th>
                  <th className="px-4 py-4">Varian</th>
                  <th className="px-4 py-4">Berat / Tea Bag</th>
                  <th className="px-4 py-4">Tea Bag / Kemasan</th>
                  <th className="px-4 py-4">Total Berat</th>
                  <th className="px-4 py-4">Satuan</th>
                  <th className="px-4 py-4">Harga</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecece3]">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                      Memuat data produk...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500">
                      Belum ada produk yang cocok. Periksa koneksi spreadsheet atau tambahkan produk baru.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.sku} className="hover:bg-[#fafaf6]">
                      <td className="px-4 py-4">
                        <div className="font-semibold">{item.namaProduk}</div>
                        <div className="mt-1 text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-4 py-4">{item.kategori || "—"}</td>
                      <td className="px-4 py-4">{item.varian || "—"}</td>
                      <td className="px-4 py-4">{Number(item.beratPerTeaBag) > 0 ? `${item.beratPerTeaBag} g` : "—"}</td>
                      <td className="px-4 py-4">{Number(item.jumlahTeaBagPerKemasan ?? item.isiTeaBag) || "—"}</td>
                      <td className="px-4 py-4">
                        {Number(item.totalBeratPerKemasan ?? Number(item.beratPerTeaBag) * Number(item.jumlahTeaBagPerKemasan ?? item.isiTeaBag)) > 0
                          ? `${Number(item.totalBeratPerKemasan ?? Number(item.beratPerTeaBag) * Number(item.jumlahTeaBagPerKemasan ?? item.isiTeaBag)).toLocaleString("id-ID")} g`
                          : "—"}
                      </td>
                      <td className="px-4 py-4">{item.satuan || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-4">{rupiah(item.hargaKonsinyasi)}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${String(item.status).toUpperCase() === "AKTIF" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.status || "—"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <button type="button" onClick={() => startEdit(item)} className="rounded-lg border border-[#b9cbbd] px-3 py-2 text-xs font-semibold hover:bg-[#f5f5ef]">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pb-4 text-center text-xs tracking-wide text-gray-400">VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH</footer>
      </div>
    </main>
  );
}
