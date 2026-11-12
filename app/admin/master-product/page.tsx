"use client";
import {adminFetch as fetch} from '@/lib/admin-fetch';

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import ProductResearch from "./ProductResearch";
import CatalogStock from "./CatalogStock";
import ProductImage from "@/app/components/ProductImage";
import { productImageUrl } from "@/lib/product-image";

type PackageType = "Jar" | "Box" | "Sachet" | "Pcs" | "Pouch" | "Pack";

type DiscountType = "percent" | "nominal";

type Product = {
  sku: string;

  productNumber?: string;

  productName: string;

  category?: string;

  variantName?: string;

  packageType?: PackageType;

  teaBagWeightGram?: number;

  teaBagCount?: number;

  sellingPrice?: number;

  discountType?: DiscountType | "";

  discountValue?: number;

  promoPrice?: number;

  subtitle?: string;

  description?: string;

  ingredients?: string;

  benefits?: string;

  journalReferences?: string;

  brewingInstructions?: string;

  imageUrl?: string;

  status?: string;

  active?: boolean;
};

const emptyProduct: Product = {
  sku: "",

  productNumber: "",

  productName: "",

  category: "BOTANICAL WELLNESS",

  variantName: "",

  packageType: "Jar",

  teaBagWeightGram: 0,

  teaBagCount: 0,

  sellingPrice: 0,

  discountType: "",

  discountValue: 0,

  promoPrice: 0,

  subtitle: "",

  description: "",

  ingredients: "",

  benefits: "",

  journalReferences: "",

  brewingInstructions: "",

  imageUrl: "",

  active: true,

  status: "Active",
};

const fieldClass = "mt-2 w-full rounded-xl border border-[#d7ddcf] bg-white px-4 py-3 text-sm text-[#173b2b] outline-none focus:border-[#a88b43]";

const labelClass = "block text-sm font-medium text-[#173b2b]";

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

function imagePreviewUrl(rawUrl: string) {
  return productImageUrl(rawUrl);
}

function getPromoPrice(product: Product) {
  const price = Math.max(0, Number(product.sellingPrice || 0));

  const value = Math.max(0, Number(product.discountValue || 0));

  if (!product.discountType || value === 0) return price;

  const discount = product.discountType === "percent" ? (price * Math.min(value, 100)) / 100 : Math.min(value, price);

  return Math.max(0, Math.ceil((price - discount) / 100) * 100);
}

function packageCode(value?: PackageType) {
  switch (value) {
    case "Jar":
      return "JAR";

    case "Box":
      return "BOX";

    case "Sachet":
      return "SAC";

    case "Pcs":
      return "PCS";
    case "Pouch":
      return "POU";
    case "Pack":
      return "PAC";

    default:
      return "PRD";
  }
}

export default function MasterProductPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);

  const [editingSku, setEditingSku] = useState<string | null>(null);

  const [form, setForm] = useState<Product>(emptyProduct);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [ingredientOptions, setIngredientOptions] = useState<string[]>([]);

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [newIngredientName, setNewIngredientName] = useState("");

  const [loadingIngredients, setLoadingIngredients] = useState(false);

  const [savingIngredient, setSavingIngredient] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    setError("");

    try {
      const response = await fetch("/api/admin/products", { cache: "no-store" });

      const data = await response.json();

      if (!response.ok || data.success !== true) throw new Error(data.message || "Gagal mengambil data produk.");

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil master produk. Periksa sesi admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const loadIngredients = useCallback(async () => {
    setLoadingIngredients(true);

    try {
      const response = await fetch("/api/admin/ingredients", { cache: "no-store" });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Gagal mengambil daftar bahan.");
      }

      setIngredientOptions(Array.isArray(data.ingredients) ? data.ingredients.map((item: unknown) => String(item).trim()).filter(Boolean) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil daftar bahan.");
    } finally {
      setLoadingIngredients(false);
    }
  }, []);

  useEffect(() => {
    void loadIngredients();
  }, [loadIngredients]);

  async function addIngredient() {
    const name = newIngredientName.trim();

    if (!name) return;

    const duplicate = ingredientOptions.some((item) => item.toLowerCase() === name.toLowerCase());

    if (duplicate) {
      setError("Nama bahan sudah ada di Master Ingredients.");

      return;
    }

    setSavingIngredient(true);

    setError("");

    setMessage("");

    try {
      const response = await fetch("/api/admin/ingredients", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Gagal menyimpan bahan.");
      }

      const latest = Array.isArray(data.ingredients) ? data.ingredients.map((item: unknown) => String(item).trim()).filter(Boolean) : [...ingredientOptions, String(data.name || name)];

      setIngredientOptions(latest);

      setSelectedIngredients((previous) => (previous.some((item) => item.toLowerCase() === name.toLowerCase()) ? previous : [...previous, String(data.name || name)]));

      setNewIngredientName("");

      setMessage(data.message || "Bahan berhasil ditambahkan ke Spreadsheet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan bahan.");
    } finally {
      setSavingIngredient(false);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const keyword = search.toLowerCase();

        const matchesSearch = [product.sku, product.productName, product.variantName, product.productNumber, product.category].some((value) =>
          String(value || "")
            .toLowerCase()

            .includes(keyword),
        );

        const active = product.active !== false;

        return matchesSearch && (filter === "all" || (filter === "active" && active) || (filter === "inactive" && !active));
      }),

    [products, search, filter],
  );

  const totalWeight = Number(form.teaBagWeightGram || 0) * Number(form.teaBagCount || 0);

  const calculatedPromoPrice = getPromoPrice(form);

  function updateField<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function numberField(key: "teaBagWeightGram" | "teaBagCount" | "sellingPrice" | "discountValue") {
    return {
      value: form[key] ?? "",
      onFocus: () => {
        if (form[key] === 0) updateField(key, undefined);
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.currentTarget.value;
        updateField(key, raw === "" ? undefined : Number(raw));
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        if (input.value !== "" && Number.isFinite(Number(input.value))) {
          input.value = String(Number(input.value));
        }
      },
    };
  }

  function startCreate() {
    setEditingSku(null);

    setForm({ ...emptyProduct });

    setSelectedIngredients([]);

    setMessage("");

    setError("");

    setFormOpen(true);
  }

  function startEdit(product: Product) {
    setEditingSku(product.sku);

    setForm({ ...emptyProduct, ...product, active: product.active !== false });

    setSelectedIngredients(
      String(product.ingredients || "")
        .split(/\r?\n|,/)

        .map((item) => item.trim())

        .filter(Boolean),
    );

    setMessage("");

    setError("");

    setFormOpen(true);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);

    setError("");

    setMessage("");

    try {
      const payload = {
        ...form,

        sku: editingSku || "", // SKU produk baru dibuat otomatis oleh API berdasarkan jenis kemasan.

        productName: form.productName.trim(),

        productNumber: form.productNumber || "",

        category: form.category || "",

        variantName: form.variantName || "",

        packageType: form.packageType || "Jar",

        teaBagWeightGram: Number(form.teaBagWeightGram || 0),

        teaBagCount: Number(form.teaBagCount || 0),

        weightGram: totalWeight,

        sellingPrice: Number(form.sellingPrice || 0),

        discountType: form.discountType || "",

        discountValue: Number(form.discountValue || 0),

        promoPrice: calculatedPromoPrice,

        subtitle: form.subtitle || "",

        description: form.description || "",

        ingredients: selectedIngredients.join(", "),

        benefits: form.benefits || "",

        journalReferences: form.journalReferences || "",

        brewingInstructions: form.brewingInstructions || "",

        imageUrl: form.imageUrl || "",

        status: form.active ? "Active" : "Inactive",

        active: form.active !== false,
      };

      const response = await fetch("/api/admin/products", {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.success !== true) throw new Error(data.message || "Gagal menyimpan produk.");

      setMessage(data.message || "Produk berhasil disimpan.");

      setFormOpen(false);

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#173b2b]">
      <header className="bg-[#103b2b] px-6 py-7 text-white sm:px-10">
        <div className="mx-auto max-w-7xl">
          <Link href="/admin-access" className="text-sm text-[#dfc783] hover:text-white">
            ← Kembali ke Admin Control Center
          </Link>

          <p className="mt-6 text-xs tracking-[0.25em] text-[#dfc783]">VARTANA INTERNAL SYSTEM</p>

          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Master Product</h1>

          <p className="mt-3 text-sm text-[#d6e0d7]">Atur produk katalog di sini. Produk aktif dengan harga jual di atas Rp0 otomatis tampil. Nonaktifkan produk untuk menurunkannya dari katalog.</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8 sm:px-10">
        {message && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{message}</div>}

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e1dccf] bg-white p-5">
            <p className="text-sm text-gray-500">Total Produk</p>

            <p className="mt-3 text-3xl font-semibold">{products.length}</p>
          </div>

          <div className="rounded-2xl border border-[#e1dccf] bg-white p-5">
            <p className="text-sm text-gray-500">Produk Aktif</p>

            <p className="mt-3 text-3xl font-semibold">{products.filter((p) => p.active !== false).length}</p>
          </div>

          <div className="rounded-2xl border border-[#e1dccf] bg-white p-5">
            <p className="text-sm text-gray-500">Ditampilkan</p>

            <p className="mt-3 text-3xl font-semibold">{filteredProducts.length}</p>
          </div>
        </div>

        <CatalogStock products={filteredProducts}/>
        <section className="mt-8 rounded-2xl border border-[#e1dccf] bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Daftar Produk</h2>

              <p className="mt-1 text-sm text-gray-500">Tambah dan perbarui data produk yang digunakan katalog.</p>
            </div>

            <button type="button" onClick={startCreate} className="rounded-xl bg-[#173b2b] px-5 py-3 text-sm font-medium text-white hover:bg-[#24523d]">
              + Tambah Produk
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_200px]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode, nama, varian, kategori..." className={fieldClass} />

            <select value={filter} onChange={(e) => setFilter(e.target.value)} className={fieldClass.replace("mt-2 ", "")}>
              <option value="all">Semua Status</option>

              <option value="active">Aktif</option>

              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-[#e5e0d5]">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f3f0e7] text-[#526456]">
                <tr>
                  <th className="px-4 py-4 font-medium">Produk</th>

                  <th className="px-4 py-4 font-medium">SKU</th>

                  <th className="px-4 py-4 font-medium">Kemasan</th>

                  <th className="px-4 py-4 font-medium">Harga Jual</th>

                  <th className="px-4 py-4 font-medium">Harga Promo</th>

                  <th className="px-4 py-4 font-medium">Status</th>

                  <th className="px-4 py-4 font-medium">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#eee9de]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      Memuat data produk...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      {products.length === 0 ? "Belum ada data produk yang berhasil dimuat." : "Produk tidak ditemukan."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.sku} className="hover:bg-[#faf9f6]">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <ProductImage src={imagePreviewUrl(product.imageUrl)} alt={product.productName} className="h-12 w-12 shrink-0 rounded-lg border border-[#e5e0d5] bg-[#FBF9F4] p-1 object-contain" />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f3f0e7] text-xs text-gray-400">Foto</div>
                          )}

                          <div>
                            <p className="font-semibold">{product.productName}</p>

                            <p className="mt-1 text-xs text-gray-500">
                              {product.category || "Tanpa kategori"} · {product.variantName || "Tanpa varian"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-mono text-xs">{product.sku}</td>

                      <td className="px-4 py-4">{product.packageType || "—"}</td>

                      <td className="px-4 py-4">{money(Number(product.sellingPrice || 0))}</td>

                      <td className="px-4 py-4">{product.discountType && Number(product.discountValue || 0) > 0 ? money(getPromoPrice(product)) : "—"}</td>

                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs ${product.active !== false ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{product.active !== false ? "Aktif" : "Nonaktif"}</span>
                      </td>

                      <td className="px-4 py-4">
                        <button type="button" onClick={() => startEdit(product)} className="font-semibold text-[#876c2e] hover:underline">
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

        {formOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
            <div className="mx-auto my-6 max-w-4xl rounded-2xl bg-[#fdfcf8] p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#9b7b35]">PRODUCT MASTER DATA</p>

                  <h2 className="mt-2 text-2xl font-semibold">{editingSku ? "Edit Produk" : "Tambah Produk"}</h2>

                  <p className="mt-2 text-sm text-gray-500">SKU dibuat otomatis berdasarkan jenis kemasan dan nomor urut.</p>
                </div>

                <button type="button" onClick={() => setFormOpen(false)} className="rounded-full border border-[#ded8ca] px-3 py-2 text-sm">
                  Tutup
                </button>
              </div>

              <form onSubmit={saveProduct} className="mt-7 space-y-6">
                <section>
                  <h3 className="mb-3 font-semibold">Informasi Produk</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Nama Produk *<input required maxLength={200} value={form.productName} onChange={(e) => updateField("productName", e.target.value)} placeholder="Contoh: VARTANA Botanical Wellness" className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Kategori *
                      <select required value={form.category || ""} onChange={(e) => updateField("category", e.target.value)} className={fieldClass}>
                        <option value="">Pilih kategori</option>

                        <option value="BOTANICAL WELLNESS">BOTANICAL WELLNESS</option>

                        <option value="VARTANA FRESH">VARTANA FRESH</option>

                        <option value="HERBAL TEA">HERBAL TEA</option>

                        <option value="LAINNYA">LAINNYA</option>
                      </select>
                    </label>

                    <label className={labelClass}>
                      Varian Produk
                      <input value={form.variantName || ""} onChange={(e) => updateField("variantName", e.target.value)} placeholder="Contoh: Signature Blend" className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Jenis Kemasan *
                      <select required value={form.packageType || "Jar"} onChange={(e) => updateField("packageType", e.target.value as PackageType)} className={fieldClass}>
                        <option value="Jar">Jar</option>

                        <option value="Box">Box</option>

                        <option value="Sachet">Sachet</option>

                        <option value="Pcs">Pcs</option>
                        <option value="Pouch">Pouch</option>
                        <option value="Pack">Pack</option>
                      </select>
                      <span className="mt-1 block text-xs font-normal text-gray-500">Kode produk akan mengikuti jenis kemasan: {packageCode(form.packageType)}-0001 (nomor final dibuat server).</span>
                    </label>

                    <label className={labelClass}>
                      Berat per Tea Bag (gram)
                      <input type="number" min="0" step="0.1" {...numberField("teaBagWeightGram")} className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Jumlah Tea Bag per Kemasan
                      <input type="number" min="0" step="1" {...numberField("teaBagCount")} className={fieldClass} />
                    </label>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-[#173b2b]">Total berat bersih: {totalWeight.toLocaleString("id-ID")} g</p>
                </section>

                <section className="border-t border-[#e5e0d5] pt-5">
                  <h3 className="mb-3 font-semibold">Harga dan Promo</h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={labelClass}>
                      Harga Jual (Rp) *<input required type="number" min="0" step="1" {...numberField("sellingPrice")} className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Jenis Diskon
                      <select value={form.discountType || ""} onChange={(e) => updateField("discountType", e.target.value as DiscountType | "")} className={fieldClass}>
                        <option value="">Tanpa diskon</option>

                        <option value="percent">Persentase (%)</option>

                        <option value="nominal">Nominal (Rp)</option>
                      </select>
                    </label>

                    <label className={labelClass}>
                      {form.discountType === "nominal" ? "Potongan Harga (Rp)" : "Diskon (%)"}

                      <input
                        type="number"
                        min="0"
                        max={form.discountType === "percent" ? 100 : undefined}
                        step="1"
                        disabled={!form.discountType}
                        {...numberField("discountValue")}
                        className={fieldClass + " disabled:bg-gray-100"}
                      />
                    </label>

                    <div className="rounded-xl border border-[#d7ddcf] bg-[#f3f6ef] p-4">
                      <p className="text-sm text-gray-600">Harga Promo Otomatis</p>

                      <p className="mt-2 text-xl font-semibold text-[#173b2b]">{money(calculatedPromoPrice)}</p>

                      <p className="mt-1 text-xs text-gray-500">Harga setelah diskon otomatis dibulatkan ke atas ke kelipatan Rp100.</p>
                    </div>
                  </div>
                </section>

                <section className="border-t border-[#e5e0d5] pt-5">
                  <h3 className="mb-3 font-semibold">Informasi Produk untuk Pelanggan</h3>

                  <div className="space-y-4">
                    <label className={labelClass}>
                      Subtitle / Deskripsi Singkat
                      <input value={form.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Deskripsi Produk
                      <textarea rows={3} value={form.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Cerita produk, karakter rasa, dan penjelasan produk..." className={fieldClass} />
                    </label>

                    <div>
                      <label className={labelClass}>Ingredients / Komposisi</label>

                      <p className="mt-1 text-xs font-normal text-gray-500">Pilih nama bahan yang sudah tersimpan di Master Ingredients. Bahan baru akan disimpan ke Spreadsheet.</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedIngredients.map((ingredient) => (
                          <span key={ingredient} className="inline-flex items-center gap-2 rounded-full bg-[#e8efe5] px-3 py-2 text-sm text-[#173b2b]">
                            {ingredient}

                            <button type="button" onClick={() => setSelectedIngredients((previous) => previous.filter((item) => item !== ingredient))} className="font-bold text-[#6d493b]" aria-label={`Hapus ${ingredient}`}>
                              ×
                            </button>
                          </span>
                        ))}

                        {selectedIngredients.length === 0 && <p className="text-sm text-gray-500">Belum ada bahan yang dipilih.</p>}
                      </div>

                      <div className="mt-3">
                        <p className="mb-2 text-sm text-gray-600">Centang semua bahan yang digunakan dalam produk.</p>
                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#ded8ca] bg-white p-2">
                          {loadingIngredients ? (
                            <p className="p-3 text-sm text-gray-500">Memuat daftar bahan...</p>
                          ) : ingredientOptions.length === 0 ? (
                            <p className="p-3 text-sm text-gray-500">Belum ada bahan aktif.</p>
                          ) : (
                            ingredientOptions.map((ingredient) => {
                              const checked = selectedIngredients.some((item) => item.toLowerCase() === ingredient.toLowerCase());

                              return (
                                <label key={ingredient} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 hover:bg-[#f5f3ed]">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                      const isChecked = event.target.checked;
                                      setSelectedIngredients((previous) => {
                                        if (isChecked) {
                                          if (previous.some((item) => item.toLowerCase() === ingredient.toLowerCase())) {
                                            return previous;
                                          }
                                          return [...previous, ingredient];
                                        }
                                        return previous.filter((item) => item.toLowerCase() !== ingredient.toLowerCase());
                                      });
                                    }}
                                    className="h-5 w-5 shrink-0 accent-[#173b2b]"
                                  />
                                  <span className="text-sm text-[#173b2b]">{ingredient}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">{selectedIngredients.length} bahan dipilih</p>
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-[#cfc8b8] p-4">
                        <label className={labelClass}>
                          Tambah Bahan Baru
                          <input value={newIngredientName} onChange={(e) => setNewIngredientName(e.target.value)} maxLength={100} placeholder="Contoh: Rosella" className={fieldClass} />
                        </label>

                        <button
                          type="button"
                          onClick={() => void addIngredient()}
                          disabled={savingIngredient || !newIngredientName.trim()}
                          className="mt-3 rounded-xl bg-[#173b2b] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {savingIngredient ? "Menyimpan bahan..." : "+ Tambah Bahan"}
                        </button>
                      </div>
                    </div>

                    <ProductResearch key={`${editingSku || "new"}:${selectedIngredients.join("|")}`} ingredients={selectedIngredients} onApply={(benefits,references)=>setForm(previous=>({...previous, benefits:[previous.benefits,benefits].filter(Boolean).join("\n\n"), journalReferences:[previous.journalReferences,references].filter(Boolean).join("\n\n")}))}/>
                    <label className={labelClass}>
                      Manfaat Produk
                      <textarea rows={3} value={form.benefits || ""} onChange={(e) => updateField("benefits", e.target.value)} placeholder="Masukkan manfaat berdasarkan bukti yang tersedia..." className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Referensi Jurnal Ilmiah
                      <textarea rows={3} value={form.journalReferences || ""} onChange={(e) => updateField("journalReferences", e.target.value)} placeholder="Judul, penulis, tahun, DOI atau tautan..." className={fieldClass} />
                    </label>

                    <label className={labelClass}>
                      Cara Penyajian
                      <textarea rows={2} value={form.brewingInstructions || ""} onChange={(e) => updateField("brewingInstructions", e.target.value)} placeholder="Contoh: seduh 3–5 menit..." className={fieldClass} />
                    </label>
                  </div>
                </section>

                <section className="border-t border-[#e5e0d5] pt-5">
                  <h3 className="mb-3 font-semibold">Foto Produk</h3>

                  <label className={labelClass}>
                    Link Google Drive / URL Gambar
                    <input type="text" inputMode="url" value={form.imageUrl || ""} onChange={(e) => updateField("imageUrl", e.target.value)} placeholder="Tempel link Google Drive atau URL gambar HTTPS" className={fieldClass} />
                    <span className="mt-2 block text-xs font-normal text-gray-500">Untuk Drive: Bagikan → Siapa saja yang memiliki link → Pelihat.</span>
                  </label>

                  {form.imageUrl && (
                    <div className="mt-3 rounded-xl border border-[#e5e0d5] bg-white p-4">
                      <p className="mb-3 text-xs text-gray-500">Pratinjau gambar</p>

                      <ProductImage src={imagePreviewUrl(form.imageUrl)} alt="Pratinjau produk" className="h-40 w-full max-w-sm rounded-xl border border-[#e5e0d5] bg-[#FBF9F4] p-3 object-contain" errorMessage="Gambar gagal dimuat. Cek link dan pastikan akses Drive: Siapa saja yang memiliki link (Pelihat)." />

                      <button type="button" onClick={() => updateField("imageUrl", "")} className="mt-3 block text-sm font-medium text-red-700 underline">
                        Hapus URL gambar
                      </button>
                    </div>
                  )}
                </section>

                <label className={labelClass}>
                  Status Produk
                  <select value={form.active === false ? "inactive" : "active"} onChange={(e) => updateField("active", e.target.value === "active")} className={fieldClass}>
                    <option value="active">Aktif</option>

                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>

                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

                <div className="flex flex-col-reverse gap-3 border-t border-[#e5e0d5] pt-5 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-[#ded8ca] px-5 py-3 text-sm">
                    Batal
                  </button>

                  <button type="submit" disabled={saving} className="rounded-xl bg-[#173b2b] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
                    {saving ? "Menyimpan..." : "Simpan Produk"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
