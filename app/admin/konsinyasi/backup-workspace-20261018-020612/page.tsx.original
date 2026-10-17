"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Mitra = {
  kodeMitra: string;
  namaToko: string;
  alamat: string;
  nomorWhatsApp: string;
  namaPIC: string;
  tanggalBergabung: string;
  status: string;
};

const EMPTY_FORM: Mitra = {
  kodeMitra: "",
  namaToko: "",
  alamat: "",
  nomorWhatsApp: "",
  namaPIC: "",
  tanggalBergabung: new Date().toISOString().slice(0, 10),
  status: "AKTIF",
};

const inputClass =
  "w-full rounded-xl border border-[#dce5db] bg-white px-3.5 py-3 text-sm text-[#193d2b] outline-none transition placeholder:text-gray-400 focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10";

export default function KonsinyasiPage() {
  const [mitra, setMitra] = useState<Mitra[]>([]);
  const [form, setForm] = useState<Mitra>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMitra = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "/api/konsinyasi?action=getKonsinyasiMitra",
        { cache: "no-store" }
      );
      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Gagal mengambil data mitra.");
      }
      setMitra(Array.isArray(result.mitra) ? result.mitra : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghubungkan API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMitra();
  }, [loadMitra]);

  const filteredMitra = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return mitra;
    return mitra.filter((item) =>
      [
        item.kodeMitra,
        item.namaToko,
        item.alamat,
        item.nomorWhatsApp,
        item.namaPIC,
        item.status,
      ].some((value) => String(value || "").toLowerCase().includes(keyword))
    );
  }, [mitra, search]);

  function openCreate() {
    setForm({
      ...EMPTY_FORM,
      tanggalBergabung: new Date().toISOString().slice(0, 10),
    });
    setEditing(false);
    setShowForm(true);
    setError("");
    setNotice("");
  }

  function openEdit(item: Mitra) {
    setForm({
      ...EMPTY_FORM,
      ...item,
      tanggalBergabung: item.tanggalBergabung || "",
    });
    setEditing(true);
    setShowForm(true);
    setError("");
    setNotice("");
  }

  function updateField(field: keyof Mitra, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveMitra(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const action = editing ? "updateKonsinyasiMitra" : "saveKonsinyasiMitra";
      const response = await fetch("/api/konsinyasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data: form }),
      });

      const result = await response.json();
      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Data mitra gagal disimpan.");
      }

      setNotice(result.message || "Data mitra berhasil disimpan.");
      setShowForm(false);
      await loadMitra();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  const activeCount = mitra.filter(
    (item) => String(item.status || "AKTIF").toUpperCase() === "AKTIF"
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f5ef] p-4 text-[#193d2b] sm:p-7 lg:p-9">
      <div className="mx-auto max-w-7xl space-y-7">
        <header className="relative overflow-hidden rounded-3xl bg-[#173d2b] p-6 text-white shadow-lg sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-[#c5a45d]/30" />
          <div className="pointer-events-none absolute -right-1 -top-7 h-40 w-40 rounded-full border border-[#c5a45d]/20" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#c5a45d]/40 px-3 py-1.5 text-xs tracking-[0.18em] text-[#e6d4a5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d7b96e]" />
              VARTANA · PARTNERSHIP
            </div>
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-sm text-[#d1dfd3]">OPERATIONS MANAGEMENT</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Master Mitra
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[#d1dfd3]">
                  Kelola data toko mitra konsinyasi dalam satu tempat.
                  Terstruktur, mudah ditelusuri, dan terhubung ke database.
                </p>
              </div>
              <button
                onClick={openCreate}
                className="shrink-0 rounded-xl bg-[#d7b96e] px-5 py-3 text-sm font-semibold text-[#193d2b] transition hover:bg-[#e6cc88]"
              >
                + Tambah Mitra
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Total Mitra</p>
            <p className="mt-3 text-3xl font-semibold">
              {loading ? "—" : mitra.length}
            </p>
            <p className="mt-2 text-xs text-gray-400">Seluruh data terdaftar</p>
          </div>
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Mitra Aktif</p>
            <p className="mt-3 text-3xl font-semibold text-[#34754b]">
              {loading ? "—" : activeCount}
            </p>
            <p className="mt-2 text-xs text-gray-400">Status operasional aktif</p>
          </div>
          <div className="rounded-2xl border border-[#e5e6dc] bg-white p-5">
            <p className="text-sm text-gray-500">Mitra Nonaktif</p>
            <p className="mt-3 text-3xl font-semibold text-gray-500">
              {loading ? "—" : mitra.length - activeCount}
            </p>
            <p className="mt-2 text-xs text-gray-400">Tidak termasuk mitra aktif</p>
          </div>
        </section>

        {notice && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="rounded-2xl border border-[#e5e6dc] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-[#a1833f]">
                  DATA KEMITRAAN
                </p>
                <h2 className="mt-2 text-xl font-semibold">
                  {editing ? "Edit Data Mitra" : "Registrasi Mitra Baru"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Lengkapi data toko dan kontak penanggung jawab.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Tutup ✕
              </button>
            </div>

            <form onSubmit={saveMitra} className="space-y-5">
              {editing && (
                <div className="rounded-xl bg-[#f5f5ef] px-4 py-3 text-sm">
                  Kode Mitra: <strong>{form.kodeMitra}</strong>
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  Nama Toko <span className="text-red-500">*</span>
                  <input
                    className={inputClass}
                    value={form.namaToko}
                    onChange={(e) => updateField("namaToko", e.target.value)}
                    placeholder="Contoh: Toko Sejahtera"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Nama PIC <span className="text-red-500">*</span>
                  <input
                    className={inputClass}
                    value={form.namaPIC}
                    onChange={(e) => updateField("namaPIC", e.target.value)}
                    placeholder="Nama penanggung jawab"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                  <input
                    className={inputClass}
                    type="tel"
                    value={form.nomorWhatsApp}
                    onChange={(e) => updateField("nomorWhatsApp", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Tanggal Bergabung
                  <input
                    className={inputClass}
                    type="date"
                    value={form.tanggalBergabung}
                    onChange={(e) => updateField("tanggalBergabung", e.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium md:col-span-2">
                  Alamat Toko <span className="text-red-500">*</span>
                  <textarea
                    className={inputClass}
                    rows={3}
                    value={form.alamat}
                    onChange={(e) => updateField("alamat", e.target.value)}
                    placeholder="Alamat lengkap toko mitra"
                    required
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Status Mitra
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="NONAKTIF">Nonaktif</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#173d2b] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24563b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Simpan Mitra"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#e5e6dc] bg-white">
          <div className="flex flex-col justify-between gap-4 border-b border-[#eceee6] p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Daftar Mitra</h2>
              <p className="mt-1 text-sm text-gray-500">
                Database mitra konsinyasi VARTANA
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={`${inputClass} sm:w-72`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, kode, PIC..."
                aria-label="Cari mitra"
              />
              <button
                onClick={() => void loadMitra()}
                className="rounded-xl border border-[#dce5db] px-4 py-3 text-sm font-medium hover:bg-[#f5f5ef]"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              Memuat data mitra...
            </div>
          ) : filteredMitra.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f3eb] text-2xl">
                ♧
              </div>
              <h3 className="mt-4 font-semibold">
                {search ? "Mitra tidak ditemukan" : "Belum ada mitra"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {search
                  ? "Coba kata kunci lain untuk menemukan data mitra."
                  : "Tambahkan mitra pertama untuk mulai mengelola jaringan konsinyasi VARTANA."}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="mt-5 rounded-xl bg-[#173d2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24563b]"
                >
                  + Daftarkan Mitra
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f7f7f1] text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Mitra</th>
                    <th className="px-5 py-4 font-semibold">Kontak PIC</th>
                    <th className="px-5 py-4 font-semibold">Alamat</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMitra.map((item, index) => {
                    const active =
                      String(item.status || "AKTIF").toUpperCase() === "AKTIF";
                    return (
                      <tr
                        key={item.kodeMitra || `${item.namaToko}-${index}`}
                        className="transition hover:bg-[#fafaf6]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-[#193d2b]">
                            {item.namaToko}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {item.kodeMitra || "Kode belum tersedia"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <p>{item.namaPIC || "—"}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {item.nomorWhatsApp || "—"}
                          </p>
                        </td>
                        <td className="max-w-xs px-5 py-4">
                          <p className="line-clamp-2 text-gray-600">
                            {item.alamat || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => openEdit(item)}
                            className="rounded-lg border border-[#dce5db] px-3 py-2 text-xs font-semibold text-[#24563b] hover:bg-[#edf3eb]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-col justify-between gap-2 border-t border-[#eceee6] bg-[#fcfcf9] px-5 py-4 text-xs text-gray-500 sm:flex-row">
            <span>VARTANA · Konsinyasi Management</span>
            <span>{filteredMitra.length} data ditampilkan</span>
          </div>
        </section>

        <footer className="pb-3 text-center text-xs text-gray-400">
          VARTANA BOTANICAL WELLNESS · ROOTED IN EARTH, BUILT FOR GROWTH
        </footer>
      </div>
    </main>
  );
}