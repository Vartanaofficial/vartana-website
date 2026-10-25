"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type AnyRow = Record<string, any>;
type SO = AnyRow & { nomorSO?: string; kodeMitra?: string; namaToko?: string; status?: string; statusSO?: string; items?: AnyRow[]; detail?: AnyRow[]; details?: AnyRow[] };
type Shipment = AnyRow & { nomorPengiriman?: string; nomorSO?: string; namaToko?: string; statusPengiriman?: string; nomorBAST?: string };
const money = (v: unknown) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(v || 0));
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
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
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [bastShipment, setBastShipment] = useState<Shipment | null>(null);
  const [notes, setNotes] = useState("");
  const [orderChecked, setOrderChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reportSearch, setReportSearch] = useState("");
  const [reportStatus, setReportStatus] = useState("SEMUA");
  const [reportPeriod, setReportPeriod] = useState("BULANAN");
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [reportMonth, setReportMonth] = useState(new Date().toLocaleDateString("en-CA").slice(0, 7));
  const [detailReportRow, setDetailReportRow] = useState<any | null>(null);
  const [activeView, setActiveView] = useState<"bast" | "report">("bast");

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
  const bastSO = bastShipment ? orders.find((o) => String(o.nomorSO || o.nomorSo || o.noSO || "").trim() === String(bastShipment.nomorSO || "").trim()) : null;
  const bastLines: AnyRow[] = bastSO ? (Array.isArray(bastSO.items) ? bastSO.items : Array.isArray(bastSO.detail) ? bastSO.detail : Array.isArray(bastSO.details) ? bastSO.details : []) : [];
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
  const bastDisplayLines: AnyRow[] = bastLines.map((line) => {
    const sku = String(line.sku ?? line.SKU ?? "")
      .trim()
      .toUpperCase();
    const master = productBySku.get(sku) || {};
    const qtySO = Number(val(line.qty, line.qtySO, line.jumlah, 0));
    const hargaSatuan = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, master.hargaKonsinyasi, master.hargaSatuan, master.harga, 0));
    return {
      ...master,
      ...line,
      skuDisplay: sku || "-",
      qtySODisplay: qtySO,
      hargaSatuanDisplay: hargaSatuan,
      subtotalSODisplay: Number(val(line.subtotal, qtySO * hargaSatuan, 0)),
      varianDisplay: val(line.varian, line.namaVarian, master.varian, master.namaVarian, "-"),
      beratPerTeaBagDisplay: val(line.beratPerTeaBag, line.beratTeaBag, master.beratPerTeaBag, master.beratTeaBag, master.beratPerSachet, 0),
      isiKemasanDisplay: val(line.jumlahTeaBagPerKemasan, line.isiPerKemasan, line.isiTeaBag, line.jumlahTeaBag, master.jumlahTeaBagPerKemasan, master.isiTeaBag, 0),
      beratBersihDisplay: val(line.totalBeratBersihPerKemasan, line.totalBeratPerKemasan, master.totalBeratPerKemasan, 0),
      satuanDisplay: val(line.satuan, master.satuan, "box"),
      namaProdukDisplay: val(line.namaProduk, line.nama, line.productName, master.namaProduk, master.nama, master.productName, "-"),
    };
  });

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

  const reportRows = useMemo(() => {
    const orderNumber = (o: SO) => String(o.nomorSO || o.nomorSo || o.noSO || "").trim();
    const shipmentBySO = new Map<string, Shipment>(shipments.map((shipment): [string, Shipment] => [String(shipment.nomorSO || "").trim(), shipment]));
    // SO NONAKTIF/CANCELLED yang invoice-nya sudah pernah dicetak dianggap SO lama
    // yang telah digantikan oleh nomor SO/PO baru, sehingga tidak masuk KPI/report.
    // SO yang belum pernah dicetak tetap terlihat sebagai draft/nonaktif untuk audit.
    return orders
      .filter((order) => {
        const status = normalizeStatus(order.statusSO || order.status);
        const printCount = Number(val(order.jumlahCetak, order.printCount, order.jumlahPrint, 0)) || 0;
        const isInactive = ["NONAKTIF", "CANCELLED", "DIBATALKAN", "CANCELED"].includes(status);
        return !(isInactive && printCount > 0);
      })
      .map((order) => {
        const nomorSO = orderNumber(order);
        const shipment = shipmentBySO.get(nomorSO) || null;
        const lines: AnyRow[] = Array.isArray(order.items) ? order.items : Array.isArray(order.detail) ? order.detail : Array.isArray(order.details) ? order.details : [];
        const totalSO =
          Number(val(order.totalSO, order.total, order.grandTotal, order.totalNominal, 0)) ||
          lines.reduce((sum, line) => {
            const qty = Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0;
            const unitPrice = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, 0)) || 0;
            return sum + (Number(val(line.subtotal, line.total, 0)) || qty * unitPrice);
          }, 0);
        const statusShipment = String(shipment?.statusPengiriman || "")
          .trim()
          .toUpperCase();
        const bastDate = String(shipment?.tanggalBAST || "").trim();
        const received = Boolean(shipment) && (["DITERIMA", "SELESAI", "BAST DITERIMA"].includes(statusShipment) || (Boolean(bastDate) && bastDate !== "-"));
        const hasShipment = Boolean(shipment);
        const qtySO = lines.reduce((sum, line) => sum + (Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0), 0);
        const qtyActual = lines.reduce((sum, line) => sum + (Number(val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, 0)) || 0), 0);
        const qtyDiff = qtyActual - qtySO;
        const itemMismatch =
          received &&
          lines.some((line) => {
            const ordered = Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0;
            const actual = Number(val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, 0)) || 0;
            return ordered !== actual;
          });
        const soStatus = normalizeStatus(order.statusSO || order.status);
        const printCount = Number(val(order.jumlahCetak, order.printCount, order.jumlahPrint, 0)) || 0;
        const isInactiveUnprinted = ["NONAKTIF", "CANCELLED", "DIBATALKAN", "CANCELED"].includes(soStatus) && printCount === 0;
        const status = isInactiveUnprinted ? "BELUM CETAK / NONAKTIF" : !hasShipment ? "BELUM DIKIRIM" : !received ? "MENUNGGU BAST" : itemMismatch ? "DITERIMA - TIDAK SESUAI" : "DITERIMA - SESUAI";
        const actualValue = received
          ? lines.reduce((sum, line) => {
              const actual = Number(val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, 0)) || 0;
              const unitPrice = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, 0)) || 0;
              return sum + actual * unitPrice;
            }, 0)
          : 0;
        const nominalGagalTerkirim = received
          ? lines.reduce((sum, line) => {
              const ordered = Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0;
              const actual = Number(val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, 0)) || 0;
              const unitPrice = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, 0)) || 0;
              return sum + Math.max(0, ordered - actual) * unitPrice;
            }, 0)
          : 0;
        const nominalLebihTerkirim = received
          ? lines.reduce((sum, line) => {
              const ordered = Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0;
              const actual = Number(val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, 0)) || 0;
              const unitPrice = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, 0)) || 0;
              return sum + Math.max(0, actual - ordered) * unitPrice;
            }, 0)
          : 0;
        const tanggalLaporan = String(shipment?.tanggalKeluarGudang || order.tanggalSO || order.timestamp || "").slice(0, 10);
        return {
          nomorSO,
          namaToko: val(order.namaToko, order.kodeMitra),
          kodeMitra: val(order.kodeMitra),
          order,
          lines,
          shipment,
          hasShipment,
          received,
          status,
          totalSO,
          actualValue,
          nominalGagalTerkirim,
          nominalLebihTerkirim,
          tanggalLaporan,
          qtySO,
          qtyActual,
          qtyDiff,
          itemMismatch,
          isInactiveUnprinted,
        };
      })
      .filter((row) => Boolean(row.nomorSO));
  }, [orders, shipments]);

  const periodReportRows = useMemo(() => {
    const dateOnly = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
    const selected = new Date(`${reportDate}T12:00:00`);
    const day = selected.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(selected);
    monday.setDate(selected.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return reportRows.filter((row) => {
      const date = dateOnly(row.tanggalLaporan || "");
      if (reportPeriod === "SEMUA") return true;
      if (!date) return false;
      if (reportPeriod === "HARIAN") return date === reportDate;
      if (reportPeriod === "MINGGUAN") return date >= fmt(monday) && date <= fmt(sunday);
      return date.slice(0, 7) === reportMonth;
    });
  }, [reportRows, reportPeriod, reportDate, reportMonth]);

  const filteredReportRows = useMemo(() => {
    const query = reportSearch.trim().toLowerCase();
    return periodReportRows.filter((row) => {
      const matchesSearch =
        !query ||
        [row.nomorSO, row.namaToko, row.shipment?.nomorPengiriman, row.shipment?.nomorBAST].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(query),
        );
      const matchesStatus = reportStatus === "SEMUA" || row.status === reportStatus;
      return matchesSearch && matchesStatus;
    });
  }, [periodReportRows, reportSearch, reportStatus]);

  const reportSummary = useMemo(
    () => ({
      totalSO: periodReportRows.length,
      belumDikirim: periodReportRows.filter((row) => !row.hasShipment).length,
      menungguBAST: periodReportRows.filter((row) => row.hasShipment && !row.received).length,
      sesuai: periodReportRows.filter((row) => row.status === "DITERIMA - SESUAI").length,
      tidakSesuai: periodReportRows.filter((row) => row.status === "DITERIMA - TIDAK SESUAI").length,
      nominalSO: periodReportRows.filter((row) => !row.isInactiveUnprinted).reduce((sum, row) => sum + row.totalSO, 0),
      nominalTerkirim: periodReportRows.filter((row) => !row.isInactiveUnprinted && row.hasShipment).reduce((sum, row) => sum + row.totalSO, 0),
      nominalMenunggu: periodReportRows.filter((row) => !row.isInactiveUnprinted && row.hasShipment && !row.received).reduce((sum, row) => sum + row.totalSO, 0),
      nominalDiterima: periodReportRows.filter((row) => !row.isInactiveUnprinted && row.received).reduce((sum, row) => sum + row.actualValue, 0),
      nominalGagalTerkirim: periodReportRows.filter((row) => !row.isInactiveUnprinted).reduce((sum, row) => sum + row.nominalGagalTerkirim, 0),
    }),
    [periodReportRows],
  );

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

  function openBAST(shipment: Shipment) {
    const so = orders.find((o) => String(o.nomorSO || o.nomorSo || o.noSO || "").trim() === String(shipment.nomorSO || "").trim());
    const detailLines: AnyRow[] = so ? (Array.isArray(so.items) ? so.items : Array.isArray(so.detail) ? so.detail : Array.isArray(so.details) ? so.details : []) : [];
    if (!detailLines.length) {
      setError("Detail SO tidak ditemukan. BAST tidak dibuka agar jumlah dan stok tidak salah.");
      return;
    }
    const initial: Record<string, string> = {};
    detailLines.forEach((it, i) => {
      const sku = val(it.sku, it.SKU, `ITEM-${i + 1}`);
      const qty = val(it.qty, it.qtySO, it.jumlah, 0);
      initial[`${shipment.nomorSO}:${sku}`] = qty === "-" ? "0" : qty;
    });
    setReceived(initial);
    setItemNotes({});
    setBastShipment(shipment);
    setNotes("");
    setError("");
    setNotice("");
  }

  async function submitBAST() {
    if (!bastShipment) return;
    if (!bastDisplayLines.length) {
      setError("Detail SO tidak ditemukan. BAST tidak dikonfirmasi agar stok tidak salah.");
      return;
    }
    const items = bastDisplayLines.map((it, i) => {
      const sku = String(val(it.sku, it.SKU, `ITEM-${i + 1}`));
      const rawQty = received[`${bastShipment.nomorSO}:${sku}`];
      return { sku, qtyDiterima: rawQty === undefined || rawQty.trim() === "" ? NaN : Number(rawQty), keterangan: (itemNotes[`${bastShipment.nomorSO}:${sku}`] || "").trim() };
    });
    if (items.some((x) => !Number.isFinite(x.qtyDiterima) || x.qtyDiterima < 0 || !Number.isInteger(x.qtyDiterima))) {
      setError("Isi jumlah aktual diterima untuk setiap SKU dengan bilangan bulat nol atau lebih.");
      return;
    }
    const itemWithMissingNote = bastDisplayLines.some((line, i) => {
      const sku = String(val(line.sku, line.SKU, `ITEM-${i + 1}`));
      const qtySO = Number(val(line.qty, line.qtySO, line.jumlah, 0));
      return items[i]?.qtyDiterima !== qtySO && !items[i]?.keterangan;
    });
    if (itemWithMissingNote) {
      setError("Setiap SKU yang memiliki selisih wajib diisi keterangannya pada kolom Keterangan per Item.");
      return;
    }
    if (!window.confirm(`Simpan dan konfirmasi penerimaan ${bastShipment.nomorBAST || bastShipment.nomorPengiriman}? Periksa jumlah aktual setiap SKU. Proses ini akan memperbarui stok mitra.`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/konsinyasi/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "koreksiPenerimaanKonsinyasi", nomorSO: bastShipment.nomorSO, items, catatan: notes }),
      });
      const json = await res.json();
      if (!res.ok || json.success === false) throw new Error(json.message || "Konfirmasi BAST gagal.");
      setNotice(json.message || "Penerimaan BAST berhasil dikonfirmasi.");
      setReceived({});
      setItemNotes({});
      setNotes("");
      setBastShipment(null);
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
        <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e5e6dc] bg-white p-2 shadow-sm" aria-label="Menu Pengiriman dan BAST">
          <button type="button" onClick={() => setActiveView("bast")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeView === "bast" ? "bg-[#173d2b] text-white shadow" : "text-[#315640] hover:bg-[#f3f5ee]"}`}>
            <span className="block">BAST Pengiriman</span>
            <span className={`mt-1 block text-xs font-normal ${activeView === "bast" ? "text-[#dbe7dc]" : "text-gray-500"}`}>Buat pengiriman dan konfirmasi receipt</span>
          </button>
          <button type="button" onClick={() => setActiveView("report")} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeView === "report" ? "bg-[#173d2b] text-white shadow" : "text-[#315640] hover:bg-[#f3f5ee]"}`}>
            <span className="block">Report BAST Pengiriman</span>
            <span className={`mt-1 block text-xs font-normal ${activeView === "report" ? "text-[#dbe7dc]" : "text-gray-500"}`}>Dashboard, pencarian, detail, dan PDF</span>
          </button>
        </nav>
        {activeView === "bast" && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Buat Pengiriman dari Sales Order</h2>
                <p className="mt-1 text-sm text-gray-500">SO NONAKTIF dan SO yang sudah memiliki pengiriman tidak ditampilkan.</p>
              </div>
              <button onClick={() => void load()} disabled={loading || saving} className="rounded-xl border border-[#dce5db] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f7f8f3] disabled:opacity-50">
                {loading ? "Memuat..." : "Muat ulang data"}
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
                <option value="">{loading ? "Memuat Sales Order..." : "Pilih nomor SO"}</option>
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
                      <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
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
                    {saving ? "Menyimpan..." : "Konfirmasi Pesanan & Buat Pengiriman"}
                  </button>
                  <p className="text-xs leading-5 text-gray-500">
                    Konfirmasi ini mencatat bahwa SO sudah diperiksa; tidak mengubah qty SO. Stok mitra tidak boleh bertambah saat pengiriman dibuat, hanya setelah BAST penerimaan dikonfirmasi.
                  </p>
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
              {bastShipment && (
                <div className="mt-5 rounded-2xl border border-[#cbd9c9] bg-[#f7f8f3] p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">Form Penerimaan BAST</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        BAST {val(bastShipment.nomorBAST, bastShipment.nomorPengiriman)} · SO {val(bastShipment.nomorSO)} · {val(bastShipment.namaToko, bastShipment.kodeMitra)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setBastShipment(null);
                        setReceived({});
                        setItemNotes({});
                        setError("");
                      }}
                      disabled={saving}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
                    >
                      Batal
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">Masukkan jumlah aktual yang diterima mitra untuk setiap SKU. Nilai awal mengikuti jumlah pada Sales Order; ubah jika jumlah fisik berbeda.</p>
                  {bastDisplayLines.length ? (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[1450px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-gray-300 text-xs text-gray-500">
                            <th className="p-3">SKU</th>
                            <th className="p-3">Detail Produk</th>
                            <th className="p-3 text-right">Qty SO</th>
                            <th className="p-3 text-right">Harga Satuan</th>
                            <th className="p-3 text-right">Subtotal SO</th>
                            <th className="p-3">Qty Aktual Diterima</th>
                            <th className="p-3 text-right">Selisih Qty</th>
                            <th className="p-3 text-right">Selisih Nominal</th>
                            <th className="p-3">Keterangan per Item</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bastDisplayLines.map((it, i) => {
                            const sku = String(val(it.skuDisplay, it.sku, it.SKU, `ITEM-${i + 1}`));
                            const key = `${bastShipment.nomorSO}:${sku}`;
                            const qtySO = Number(it.qtySODisplay ?? val(it.qty, it.qtySO, it.jumlah, 0));
                            const unitPrice = Number(it.hargaSatuanDisplay ?? 0);
                            const subtotalSO = Number(it.subtotalSODisplay ?? qtySO * unitPrice);
                            const rawActual = received[key];
                            const qtyActual = rawActual === undefined || rawActual.trim() === "" ? NaN : Number(rawActual);
                            const difference = Number.isFinite(qtyActual) ? qtyActual - qtySO : null;
                            const unit = val(it.satuan, "box");
                            return (
                              <tr key={`${sku}-${i}`} className="border-b border-gray-200">
                                <td className="p-3 font-semibold">{sku}</td>
                                <td className="p-3">
                                  <div className="font-semibold">{val(it.namaProdukDisplay, it.namaProduk, it.nama, it.productName)}</div>
                                  <div className="mt-1 text-xs text-amber-800">Varian: {val(it.varianDisplay, it.varian, it.namaVarian)}</div>
                                  <div className="text-xs text-gray-600">Berat per tea bag: {Number(it.beratPerTeaBagDisplay) > 0 ? `${it.beratPerTeaBagDisplay} g` : "-"}</div>
                                  <div className="text-xs text-gray-600">Isi per kemasan: {Number(it.isiKemasanDisplay) > 0 ? `${it.isiKemasanDisplay} tea bag` : "-"}</div>
                                  <div className="text-xs text-gray-600">Berat bersih per kemasan: {Number(it.beratBersihDisplay) > 0 ? `${it.beratBersihDisplay} g` : "-"}</div>
                                  <div className="text-xs text-gray-600">Satuan penjualan: {unit}</div>
                                </td>
                                <td className="p-3 text-right font-medium">
                                  {qtySO} {unit}
                                </td>
                                <td className="p-3 text-right whitespace-nowrap">{money(unitPrice)}</td>
                                <td className="p-3 text-right whitespace-nowrap">{money(subtotalSO)}</td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      inputMode="numeric"
                                      aria-label={`Jumlah aktual diterima ${sku}`}
                                      value={received[key] ?? ""}
                                      onChange={(e) => setReceived((prev) => ({ ...prev, [key]: e.target.value }))}
                                      disabled={saving}
                                      className="w-32 rounded-lg border border-gray-300 bg-white p-2 text-right"
                                    />
                                    <span className="whitespace-nowrap text-xs text-gray-500">{unit}</span>
                                  </div>
                                  <p className="mt-1 text-xs text-gray-500">Isi jumlah fisik: {unit} yang diterima</p>
                                </td>
                                <td className="p-3 text-right">
                                  {difference === null ? (
                                    <span className="text-xs text-gray-400">Belum diisi</span>
                                  ) : difference === 0 ? (
                                    <span className="inline-flex whitespace-nowrap rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">Sesuai</span>
                                  ) : difference < 0 ? (
                                    <span className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                                      Kurang {Math.abs(difference)} {unit}
                                    </span>
                                  ) : (
                                    <span className="inline-flex whitespace-nowrap rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-800">
                                      Lebih {difference} {unit}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right whitespace-nowrap">
                                  {difference === null ? (
                                    <span className="text-xs text-gray-400">Belum dihitung</span>
                                  ) : (
                                    <span className={`font-semibold ${difference === 0 ? "text-green-700" : difference < 0 ? "text-amber-800" : "text-blue-800"}`}>{money(difference * unitPrice)}</span>
                                  )}
                                  <p className="mt-1 text-xs text-gray-500">(Qty aktual − Qty SO) × harga satuan</p>
                                </td>
                                <td className="p-3">
                                  <input
                                    type="text"
                                    aria-label={`Keterangan penerimaan ${sku}`}
                                    value={itemNotes[key] ?? ""}
                                    onChange={(e) => setItemNotes((prev) => ({ ...prev, [key]: e.target.value }))}
                                    disabled={saving}
                                    className="w-64 rounded-lg border border-gray-300 bg-white p-2 text-sm"
                                    placeholder={difference !== null && difference !== 0 ? "Wajib isi alasan selisih" : "Opsional"}
                                  />
                                  {difference !== null && difference !== 0 && !String(itemNotes[key] || "").trim() ? <p className="mt-1 text-xs text-amber-700">Wajib diisi karena ada selisih.</p> : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Detail item SO tidak ditemukan. Konfirmasi dinonaktifkan untuk mencegah kesalahan stok.</p>
                  )}
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Total Nilai SO</p>
                      <p className="mt-1 text-lg font-semibold">{money(bastDisplayLines.reduce((sum, line) => sum + Number(line.subtotalSODisplay || 0), 0))}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Total Selisih Nominal</p>
                      <p className="mt-1 text-lg font-semibold">
                        {money(
                          bastDisplayLines.reduce((sum, line, i) => {
                            const sku = String(val(line.skuDisplay, line.sku, line.SKU, `ITEM-${i + 1}`));
                            const raw = received[`${bastShipment.nomorSO}:${sku}`];
                            const actual = raw === undefined || raw.trim() === "" ? NaN : Number(raw);
                            return sum + (Number.isFinite(actual) ? (actual - Number(line.qtySODisplay || 0)) * Number(line.hargaSatuanDisplay || 0) : 0);
                          }, 0),
                        )}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">Nilai positif = lebih; negatif = kurang</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <p className="text-xs text-gray-500">Total Nilai Aktual Diterima</p>
                      <p className="mt-1 text-lg font-semibold">
                        {money(
                          bastDisplayLines.reduce((sum, line, i) => {
                            const sku = String(val(line.skuDisplay, line.sku, line.SKU, `ITEM-${i + 1}`));
                            const raw = received[`${bastShipment.nomorSO}:${sku}`];
                            const actual = raw === undefined || raw.trim() === "" ? NaN : Number(raw);
                            return sum + (Number.isFinite(actual) ? actual * Number(line.hargaSatuanDisplay || 0) : 0);
                          }, 0),
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl border border-[#e5d8ad] bg-[#fffaf0] p-3 text-sm text-[#76591b]">
                    <p className="font-semibold">Panduan membaca selisih</p>
                    <p className="mt-1">
                      Selisih dihitung otomatis dari Qty Aktual Diterima dikurangi Qty SO. <strong>Sesuai</strong> berarti jumlah sama, <strong>Kurang</strong> berarti jumlah fisik lebih sedikit dari pesanan, dan <strong>Lebih</strong>{" "}
                      berarti jumlah fisik melebihi pesanan.
                    </p>
                    <p className="mt-1">
                      Jika ada selisih, isi kolom Keterangan per Item pada SKU tersebut. Kolom keterangan wajib diisi untuk setiap SKU yang jumlah aktualnya berbeda dari Qty SO. Catatan umum di bawah hanya untuk informasi tambahan.
                    </p>
                  </div>
                  <label className="mt-4 block text-sm font-semibold" htmlFor="bast-notes">
                    Catatan umum penerimaan (opsional)
                  </label>
                  <textarea
                    id="bast-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
                    placeholder="Catatan umum tambahan untuk penerimaan BAST"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={() => void submitBAST()} disabled={saving || !bastDisplayLines.length} className="rounded-xl bg-[#173d2b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24543c] disabled:opacity-50">
                      {saving ? "Menyimpan..." : "Simpan & Konfirmasi BAST"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBastShipment(null);
                        setReceived({});
                        setItemNotes({});
                        setNotes("");
                        setError("");
                      }}
                      disabled={saving}
                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold disabled:opacity-50"
                    >
                      Tutup Form
                    </button>
                  </div>
                </div>
              )}
              {loading ? (
                <p className="mt-4 text-sm text-gray-500">Memuat data...</p>
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
                        const statusPengiriman = String(s.statusPengiriman || "")
                          .trim()
                          .toUpperCase();
                        const tanggalBAST = String(s.tanggalBAST || "").trim();
                        const confirmed = ["DITERIMA", "SELESAI", "BAST DITERIMA"].includes(statusPengiriman) || (Boolean(tanggalBAST) && tanggalBAST !== "-");
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
                                <button onClick={() => openBAST(s)} className="rounded-lg border px-3 py-2 text-xs font-semibold">
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
          </>
        )}
        {activeView === "report" && (
          <>
            <section className="rounded-2xl border border-[#e5e6dc] bg-white p-5 sm:p-7" id="reporting-so-pengiriman">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-[0.16em] text-[#71836f]">VARTANA · DISTRIBUTION CONTROL</p>
                  <h2 className="mt-1 text-xl font-semibold">Dashboard &amp; Reporting SO vs Pengiriman</h2>
                  <p className="mt-1 text-sm text-gray-500">Ringkasan resmi SO vs pengiriman, status receipt/BAST, serta nominal barang.</p>
                  <p className="mt-1 hidden text-xs text-gray-600 print:block">Dicetak: {new Date().toLocaleString("id-ID")} · VARTANA Distribution Control</p>
                </div>
                <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#173d2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#24543c] print:hidden">
                  Unduh / Cetak PDF
                </button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-gray-100 bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Total SO</p>
                  <p className="mt-1 text-2xl font-semibold">{reportSummary.totalSO}</p>
                  <p className="mt-1 text-xs text-gray-500">Semua SO yang terbaca</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Belum dikirim</p>
                  <p className="mt-1 text-2xl font-semibold">{reportSummary.belumDikirim}</p>
                  <p className="mt-1 text-xs text-gray-500">Belum ada nomor pengiriman</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs text-amber-800">Menunggu receipt / BAST</p>
                  <p className="mt-1 text-2xl font-semibold text-amber-900">{reportSummary.menungguBAST}</p>
                  <p className="mt-1 text-xs text-amber-800">Pengiriman belum dikonfirmasi penerimaannya</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#f7f8f3] p-4">
                  <p className="text-xs text-gray-500">Sesuai / Tidak sesuai</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {reportSummary.sesuai} / {reportSummary.tidakSesuai}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">SO dengan BAST terkonfirmasi</p>
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-gray-500">Total nominal SO</p>
                  <p className="mt-1 text-lg font-semibold">{money(reportSummary.nominalSO)}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-gray-500">Nominal sudah terkirim</p>
                  <p className="mt-1 text-lg font-semibold">{money(reportSummary.nominalTerkirim)}</p>
                </div>
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <p className="text-xs text-amber-800">Nominal menunggu BAST</p>
                  <p className="mt-1 text-lg font-semibold text-amber-900">{money(reportSummary.nominalMenunggu)}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-gray-500">Nominal aktual diterima</p>
                  <p className="mt-1 text-lg font-semibold">{money(reportSummary.nominalDiterima)}</p>
                </div>
                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-xs text-red-800">Nominal gagal / kurang terkirim</p>
                  <p className="mt-1 text-lg font-semibold text-red-900">{money(reportSummary.nominalGagalTerkirim)}</p>
                  <p className="mt-1 text-xs text-red-800">Dihitung dari kekurangan qty pada BAST terkonfirmasi</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#e5e6dc] bg-[#fbfcf8] p-4 sm:p-5 print:hidden">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a1833f]">Report Controls</p>
                    <h3 className="mt-1 text-base font-semibold text-[#173d2b]">Filter Laporan Pengiriman & BAST</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReportPeriod("BULANAN");
                      setReportMonth(localToday().slice(0, 7));
                      setReportDate(localToday());
                      setReportSearch("");
                      setReportStatus("SEMUA");
                    }}
                    className="rounded-xl border border-[#d9e2d6] bg-white px-3 py-2 text-xs font-semibold text-[#24563b] hover:bg-[#f1f5ee]"
                  >
                    Reset filter
                  </button>
                </div>
                <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="block min-w-0 text-sm font-semibold leading-5 text-[#254333]">
                    Periode laporan
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value)}
                      className="mt-2 h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10"
                    >
                      <option value="HARIAN">Harian</option>
                      <option value="MINGGUAN">Mingguan</option>
                      <option value="BULANAN">Bulanan</option>
                      <option value="SEMUA">Semua periode</option>
                    </select>
                  </label>
                  {reportPeriod === "BULANAN" ? (
                    <label className="block min-w-0 text-sm font-semibold leading-5 text-[#254333]">
                      Pilih bulan
                      <input
                        type="month"
                        value={reportMonth}
                        onChange={(e) => setReportMonth(e.target.value)}
                        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10"
                      />
                    </label>
                  ) : reportPeriod !== "SEMUA" ? (
                    <label className="block min-w-0 text-sm font-semibold leading-5 text-[#254333]">
                      Tanggal acuan
                      <input
                        type="date"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="mt-2 h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10"
                      />
                    </label>
                  ) : (
                    <div className="hidden xl:block" aria-hidden="true" />
                  )}
                  <label className="block min-w-0 text-sm font-semibold leading-5 text-[#254333]">
                    Cari SO / PO, pengiriman, BAST, atau mitra
                    <input
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      placeholder="Contoh: SO-20261024 / BAST-0004"
                      className="mt-2 h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10"
                    />
                  </label>
                  <label className="block min-w-0 text-sm font-semibold leading-5 text-[#254333]">
                    Filter status
                    <select
                      value={reportStatus}
                      onChange={(e) => setReportStatus(e.target.value)}
                      className="mt-2 h-12 w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 text-sm font-normal outline-none focus:border-[#326b49] focus:ring-2 focus:ring-[#326b49]/10"
                    >
                      <option value="SEMUA">Semua status</option>
                      <option value="BELUM CETAK / NONAKTIF">SO nonaktif belum dicetak (audit)</option>
                      <option value="BELUM DIKIRIM">Belum dikirim</option>
                      <option value="MENUNGGU BAST">Menunggu receipt / BAST</option>
                      <option value="DITERIMA - SESUAI">Diterima - sesuai</option>
                      <option value="DITERIMA - TIDAK SESUAI">Diterima - tidak sesuai</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#173d2b] text-xs text-gray-500">
                      <th className="p-3">No. SO / PO</th>
                      <th className="p-3">Mitra</th>
                      <th className="p-3">No. Pengiriman</th>
                      <th className="p-3">No. BAST</th>
                      <th className="p-3">Status Penerimaan</th>
                      <th className="p-3 text-right">Qty SO</th>
                      <th className="p-3 text-right">Qty aktual</th>
                      <th className="p-3 text-right">Nilai SO / terkirim</th>
                      <th className="p-3 text-right">Nilai aktual diterima</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReportRows.map((row) => (
                      <tr key={row.nomorSO} className="border-b border-gray-100 transition hover:bg-[#f5f8f1]">
                        <td className="p-3 font-semibold">
                          <button type="button" onClick={() => setDetailReportRow(row)} className="text-left text-[#1e6542] underline decoration-dotted underline-offset-4 hover:text-[#a1833f]" title={`Lihat detail SO ${row.nomorSO}`}>
                            {row.nomorSO}
                          </button>
                          <p className="mt-1 text-[11px] font-normal text-gray-400">Klik untuk detail</p>
                        </td>
                        <td className="p-3">{row.namaToko}</td>
                        <td className="p-3">
                          {row.shipment?.nomorPengiriman ? (
                            <button type="button" onClick={() => setDetailReportRow(row)} className="text-[#1e6542] underline decoration-dotted underline-offset-4">
                              {row.shipment.nomorPengiriman}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          {row.shipment?.nomorBAST ? (
                            <button type="button" onClick={() => setDetailReportRow(row)} className="text-[#1e6542] underline decoration-dotted underline-offset-4">
                              {row.shipment.nomorBAST}
                            </button>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.status === "DITERIMA - SESUAI" ? "bg-green-50 text-green-700" : row.status === "DITERIMA - TIDAK SESUAI" ? "bg-amber-50 text-amber-800" : row.status === "MENUNGGU BAST" ? "bg-orange-50 text-orange-800" : "bg-gray-100 text-gray-700"}`}
                          >
                            {row.status}
                          </span>
                          {row.received && row.qtyDiff !== 0 ? (
                            <p className="mt-1 text-xs text-gray-500">
                              Selisih total qty: {row.qtyDiff > 0 ? "+" : ""}
                              {row.qtyDiff}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-3 text-right">{row.qtySO}</td>
                        <td className="p-3 text-right">{row.received ? row.qtyActual : "—"}</td>
                        <td className="p-3 text-right whitespace-nowrap">{row.hasShipment ? money(row.totalSO) : "—"}</td>
                        <td className="p-3 text-right whitespace-nowrap">{row.received ? money(row.actualValue) : "—"}</td>
                      </tr>
                    ))}
                    {filteredReportRows.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-sm text-gray-500">
                          Tidak ada data yang cocok dengan pencarian atau filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                Catatan: periode mengikuti tanggal keluar gudang, atau tanggal SO bila pengiriman belum dibuat. Nominal gagal/kurang terkirim dihitung dari Qty SO dikurangi Qty aktual untuk BAST terkonfirmasi. Jika BAST lama pernah
                dikonfirmasi dengan Qty aktual 0, dashboard membaca nilai yang tersimpan dan tidak menebak angka yang tidak tersedia; periksa detail SO pada spreadsheet untuk koreksi historis.
              </p>
            </section>

            {detailReportRow && (
              <div
                className="fixed inset-0 z-[80] flex items-center justify-center bg-[#10271b]/65 p-3 backdrop-blur-sm sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="bast-detail-title"
                onClick={(e) => {
                  if (e.target === e.currentTarget) setDetailReportRow(null);
                }}
              >
                <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-[#f8f9f4] shadow-2xl">
                  <div className="relative overflow-hidden rounded-t-3xl bg-[#173d2b] p-5 text-white sm:p-7">
                    <div className="pointer-events-none absolute -right-6 -top-12 h-44 w-44 rounded-full border border-[#c5a45d]/40" />
                    <div className="relative flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#e6d4a5]">VARTANA · RECEIPT DETAIL</p>
                        <h3 id="bast-detail-title" className="mt-2 text-2xl font-bold sm:text-3xl">
                          Detail SO &amp; BAST
                        </h3>
                        <p className="mt-2 text-sm text-[#d1dfd3]">
                          {detailReportRow.nomorSO} · {detailReportRow.namaToko}
                        </p>
                      </div>
                      <button type="button" onClick={() => setDetailReportRow(null)} className="rounded-xl border border-white/30 px-3 py-2 text-sm font-semibold hover:bg-white/10">
                        Tutup ✕
                      </button>
                    </div>
                    <div className="relative mt-5 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">{detailReportRow.status}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">Pengiriman: {val(detailReportRow.shipment?.nomorPengiriman)}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">BAST: {val(detailReportRow.shipment?.nomorBAST)}</span>
                    </div>
                  </div>
                  <div className="space-y-5 p-4 sm:p-7">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-[#e2e7dc] bg-white p-4">
                        <p className="text-xs text-gray-500">Nilai SO</p>
                        <p className="mt-2 text-lg font-bold text-[#173d2b]">{money(detailReportRow.totalSO)}</p>
                        <p className="mt-1 text-xs text-gray-400">Nilai pesanan awal</p>
                      </div>
                      <div className="rounded-2xl border border-[#e2e7dc] bg-white p-4">
                        <p className="text-xs text-gray-500">Nilai aktual diterima</p>
                        <p className="mt-2 text-lg font-bold text-[#173d2b]">{detailReportRow.received ? money(detailReportRow.actualValue) : "Belum dikonfirmasi"}</p>
                        <p className="mt-1 text-xs text-gray-400">Dihitung dari Qty aktual tersimpan</p>
                      </div>
                      <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                        <p className="text-xs text-red-700">Nominal kurang terkirim</p>
                        <p className="mt-2 text-lg font-bold text-red-800">{money(detailReportRow.nominalGagalTerkirim)}</p>
                        <p className="mt-1 text-xs text-red-600">Kuantitas kurang × harga satuan</p>
                      </div>
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-xs text-blue-700">Nominal lebih diterima</p>
                        <p className="mt-2 text-lg font-bold text-blue-800">{money(detailReportRow.nominalLebihTerkirim)}</p>
                        <p className="mt-1 text-xs text-blue-600">Kuantitas lebih × harga satuan</p>
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl border border-[#e2e7dc] bg-white p-4">
                        <h4 className="font-semibold text-[#173d2b]">Informasi Dokumen</h4>
                        <dl className="mt-3 grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                          <dt className="text-gray-500">Nomor SO / PO</dt>
                          <dd className="break-words font-semibold">{detailReportRow.nomorSO}</dd>
                          <dt className="text-gray-500">Mitra</dt>
                          <dd>{detailReportRow.namaToko}</dd>
                          <dt className="text-gray-500">No. Pengiriman</dt>
                          <dd>{val(detailReportRow.shipment?.nomorPengiriman)}</dd>
                          <dt className="text-gray-500">Tanggal keluar gudang</dt>
                          <dd>{val(detailReportRow.shipment?.tanggalKeluarGudang)}</dd>
                          <dt className="text-gray-500">No. BAST</dt>
                          <dd>{val(detailReportRow.shipment?.nomorBAST)}</dd>
                          <dt className="text-gray-500">Tanggal BAST</dt>
                          <dd>{val(detailReportRow.shipment?.tanggalBAST)}</dd>
                          <dt className="text-gray-500">Status pengiriman</dt>
                          <dd>{val(detailReportRow.shipment?.statusPengiriman)}</dd>
                          <dt className="text-gray-500">Catatan umum</dt>
                          <dd className="whitespace-pre-wrap">{val(detailReportRow.shipment?.catatanPenerimaan, detailReportRow.shipment?.catatan, detailReportRow.order?.catatan, "Tidak ada catatan umum yang dikirim API.")}</dd>
                        </dl>
                      </div>
                      <div className="rounded-2xl border border-[#e2e7dc] bg-white p-4">
                        <h4 className="font-semibold text-[#173d2b]">Ringkasan Penerimaan</h4>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-xl bg-[#f5f6ef] p-3">
                            <p className="text-xs text-gray-500">Qty SO</p>
                            <p className="mt-1 text-xl font-bold">{detailReportRow.qtySO}</p>
                          </div>
                          <div className="rounded-xl bg-[#f5f6ef] p-3">
                            <p className="text-xs text-gray-500">Qty aktual</p>
                            <p className="mt-1 text-xl font-bold">{detailReportRow.received ? detailReportRow.qtyActual : "—"}</p>
                          </div>
                          <div className={`rounded-xl p-3 ${detailReportRow.qtyDiff === 0 && detailReportRow.received ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
                            <p className="text-xs">Selisih Qty</p>
                            <p className="mt-1 text-xl font-bold">{detailReportRow.received ? `${detailReportRow.qtyDiff > 0 ? "+" : ""}${detailReportRow.qtyDiff}` : "—"}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-gray-500">Alasan selisih dibaca dari field detail yang dikembalikan Apps Script. Jika tidak tersedia, API belum mengirimkan keterangan item untuk SO tersebut.</p>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-[#e2e7dc] bg-white">
                      <div className="border-b border-[#e8ebe3] px-4 py-4 sm:px-5">
                        <h4 className="font-semibold text-[#173d2b]">Detail Item SO vs Penerimaan</h4>
                        <p className="mt-1 text-xs text-gray-500">Qty, harga, selisih dan alasan per SKU.</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                          <thead className="bg-[#f5f6ef] text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                              <th className="p-3">SKU / Produk</th>
                              <th className="p-3">Varian / Detail</th>
                              <th className="p-3 text-right">Qty SO</th>
                              <th className="p-3 text-right">Qty Aktual</th>
                              <th className="p-3 text-right">Selisih</th>
                              <th className="p-3 text-right">Harga</th>
                              <th className="p-3 text-right">Nilai SO</th>
                              <th className="p-3 text-right">Nilai Aktual</th>
                              <th className="p-3">Alasan / Keterangan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(detailReportRow.lines || []).map((line: AnyRow, index: number) => {
                              const sku = String(val(line.sku, line.SKU, line.kodeSKU, `ITEM-${index + 1}`));
                              const master = productBySku.get(sku.trim().toUpperCase()) || {};
                              const ordered = Number(val(line.qty, line.qtySO, line.jumlah, 0)) || 0;
                              const actualRaw = val(line.qtyDiterima, line.jumlahDiterima, line.qtyAktual, line.qtyReceived, "");
                              const actual = actualRaw === "" || actualRaw === "-" ? null : Number(actualRaw);
                              const diff = actual === null || !Number.isFinite(actual) ? null : actual - ordered;
                              const price = Number(val(line.hargaKonsinyasi, line.hargaSatuan, line.harga, master.hargaKonsinyasi, master.hargaSatuan, 0)) || 0;
                              const note = val(line.keteranganPenerimaan, line.keteranganSelisih, line.alasanSelisih, line.catatanPenerimaan, line.keterangan, line.catatan, line.alasan, "");
                              const variant = val(line.varian, line.namaVarian, master.varian, master.namaVarian, "");
                              const weight = val(line.beratPerTeaBag, master.beratPerTeaBag, master.beratTeaBag, "");
                              const pack = val(line.jumlahTeaBagPerKemasan, line.isiPerKemasan, master.jumlahTeaBagPerKemasan, master.isiTeaBag, "");
                              return (
                                <tr key={`${sku}-${index}`} className="border-t border-gray-100 align-top">
                                  <td className="p-3">
                                    <p className="font-semibold">{sku}</p>
                                    <p className="mt-1 max-w-[220px] whitespace-normal">{val(line.namaProduk, line.nama, master.namaProduk, master.nama, sku)}</p>
                                  </td>
                                  <td className="p-3">
                                    <p>{variant}</p>
                                    {weight !== "-" && <p className="mt-1 text-xs text-gray-500">{weight} g / tea bag</p>}
                                    {pack !== "-" && <p className="text-xs text-gray-500">{pack} pcs / kemasan</p>}
                                  </td>
                                  <td className="p-3 text-right">{ordered}</td>
                                  <td className="p-3 text-right font-semibold">{actual === null ? (detailReportRow.received ? "0*" : "Belum receipt") : actual}</td>
                                  <td className="p-3 text-right">
                                    {diff === null ? (
                                      "—"
                                    ) : (
                                      <span className={diff === 0 ? "font-semibold text-green-700" : "font-semibold text-amber-800"}>
                                        {diff > 0 ? "+" : ""}
                                        {diff}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">{money(price)}</td>
                                  <td className="p-3 text-right whitespace-nowrap">{money(ordered * price)}</td>
                                  <td className="p-3 text-right whitespace-nowrap">{actual === null ? "—" : money(actual * price)}</td>
                                  <td className="max-w-[260px] p-3">
                                    <span className={note && note !== "-" ? "whitespace-pre-wrap text-gray-700" : "text-gray-400"}>{note && note !== "-" ? note : "Alasan tidak tersedia dari data yang dikirim API."}</span>
                                  </td>
                                </tr>
                              );
                            })}
                            {!(detailReportRow.lines || []).length && (
                              <tr>
                                <td colSpan={9} className="p-6 text-center text-gray-500">
                                  Detail item SO tidak tersedia dari respons Apps Script.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-end gap-3 print:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setReportSearch(detailReportRow.nomorSO);
                          setDetailReportRow(null);
                        }}
                        className="rounded-xl border border-[#dce5db] bg-white px-4 py-2.5 text-sm font-semibold text-[#173d2b]"
                      >
                        Filter laporan ke SO ini
                      </button>
                      <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#173d2b] px-4 py-2.5 text-sm font-semibold text-white">
                        Cetak laporan PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <style jsx global>{`
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          @media print {
            html,
            body {
              background: #fff !important;
              color: #183c2b !important;
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }
            body * {
              visibility: hidden !important;
            }
            #reporting-so-pengiriman,
            #reporting-so-pengiriman * {
              visibility: visible !important;
            }
            #reporting-so-pengiriman {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
              border: 0 !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              overflow: visible !important;
              background: #fff !important;
            }
            #reporting-so-pengiriman h2 {
              font-size: 19px !important;
              margin-bottom: 3px !important;
            }
            #reporting-so-pengiriman p {
              line-height: 1.25 !important;
            }
            #reporting-so-pengiriman button,
            #reporting-so-pengiriman input,
            #reporting-so-pengiriman select,
            #reporting-so-pengiriman label {
              display: none !important;
            }
            #reporting-so-pengiriman .grid {
              break-inside: avoid !important;
            }
            #reporting-so-pengiriman .rounded-xl {
              border-radius: 5px !important;
            }
            #reporting-so-pengiriman table {
              width: 100% !important;
              min-width: 0 !important;
              table-layout: fixed !important;
              border-collapse: collapse !important;
              font-size: 8px !important;
            }
            #reporting-so-pengiriman th,
            #reporting-so-pengiriman td {
              padding: 5px 4px !important;
              overflow-wrap: anywhere !important;
            }
            #reporting-so-pengiriman thead {
              display: table-header-group;
            }
            #reporting-so-pengiriman tr {
              break-inside: avoid !important;
            }
            #reporting-so-pengiriman .overflow-x-auto {
              overflow: visible !important;
            }
            #reporting-so-pengiriman .print\:block {
              display: block !important;
            }
          }
        `}</style>
        <p className="text-xs leading-5 text-gray-500">
          Dashboard menghitung status berdasarkan SO, riwayat pengiriman, dan Qty Diterima yang tersimpan pada detail SO. SO NONAKTIF/CANCELLED yang sudah pernah dicetak dikeluarkan dari KPI karena dianggap telah digantikan SO baru; SO
          nonaktif yang belum dicetak tetap tersedia untuk audit. Nominal aktual dihitung dari kuantitas aktual dikalikan harga satuan yang tercatat.
        </p>
      </div>
    </main>
  );
}
