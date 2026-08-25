"use client";

import { useState, useEffect, useMemo } from "react";

type OrderItem = {
  orderSerial: string;
  memberId: string;
  customerName: string;
  phone: string;
  email: string;
  addressDetail: string;
  sku?: string;
  itemsSummary: string;
  subtotalProducts?: number;
  originalShipping?: number;
  shippingSubsidy?: number;
  customerShippingFee?: number;
  grandTotal: number;
  status: string;
  resiJNT: string;
  createdAt?: string;
};

type MemberItem = {
  memberId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cityName: string;
  districtName: string;
  totalOrders?: number;
};

const ADMIN_CREDENTIALS = {
  username: "adminvartana",
  accessCode: "VARTANA2026",
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputUsername, setInputUsername] = useState<string>("");
  const [inputAccessCode, setInputAccessCode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"orders" | "members">("orders");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [datePreset, setDatePreset] = useState<"ALL" | "TODAY" | "7DAYS" | "THIS_MONTH" | "LAST_MONTH" | "CUSTOM">("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedSkuFilter, setSelectedSkuFilter] = useState<string | null>(null);

  const [editingSerial, setEditingSerial] = useState<string | null>(null);
  const [inputResi, setInputResi] = useState<string>("");
  const [inputStatus, setInputStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.members) setMembers(data.members);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("vartana_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim().toLowerCase() === ADMIN_CREDENTIALS.username && inputAccessCode.trim() === ADMIN_CREDENTIALS.accessCode) {
      setIsAuthenticated(true);
      sessionStorage.setItem("vartana_admin_auth", "true");
      setAuthError("");
      fetchDashboardData();
    } else {
      setAuthError("Username atau Kode Akses yang Anda masukkan salah!");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("vartana_admin_auth");
    setInputUsername("");
    setInputAccessCode("");
  };

  const handleUpdateOrder = async (orderSerial: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/update-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderSerial,
          status: inputStatus,
          resiJNT: inputResi,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setOrders((prev) => prev.map((ord) => (ord.orderSerial === orderSerial ? { ...ord, status: inputStatus, resiJNT: inputResi } : ord)));
        setEditingSerial(null);
        alert("Status & Resi berhasil diperbarui!");
      } else {
        alert("Gagal memperbarui data: " + result.message);
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Terjadi kesalahan sistem saat memperbarui.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePresetChange = (preset: typeof datePreset) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === "TODAY") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "7DAYS") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (preset === "LAST_MONTH") {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(firstDayLastMonth.toISOString().split("T")[0]);
      setEndDate(lastDayLastMonth.toISOString().split("T")[0]);
    } else if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    }
  };

  const filteredOrdersByPeriod = useMemo(() => {
    return orders.filter((ord) => {
      if (startDate || endDate) {
        const ordDateStr = ord.createdAt ? ord.createdAt.split(" ")[0] : "";
        if (ordDateStr) {
          if (startDate && ordDateStr < startDate) return false;
          if (endDate && ordDateStr > endDate) return false;
        }
      }

      if (selectedSkuFilter) {
        const skuString = ord.sku || "";
        const summary = ord.itemsSummary || "";

        if (selectedSkuFilter.includes("VRT-01") && !skuString.includes("VRT-01") && !summary.includes("Signature")) return false;
        if (selectedSkuFilter.includes("VRT-02") && !skuString.includes("VRT-02") && !summary.includes("Morning")) return false;
        if (selectedSkuFilter.includes("VRT-03") && !skuString.includes("VRT-03") && !summary.includes("Golden")) return false;
        if (selectedSkuFilter.includes("VRT-04") && !skuString.includes("VRT-04") && !summary.includes("Warm")) return false;

        if (selectedSkuFilter.includes("10S") && !summary.includes("10 Tea Bags")) return false;
        if (selectedSkuFilter.includes("05S") && !summary.includes("5 Tea Bags")) return false;
      }

      return true;
    });
  }, [orders, startDate, endDate, selectedSkuFilter]);

  // KALKULASI FINANSIAL & ETIMASI PPH FINAL UMKM (0.5%)
  const metrics = useMemo(() => {
    let grossTotal = 0;
    let netSalesTotal = 0;
    let totalRegularValue = 0;
    let originalShippingTotal = 0;
    let shippingSubsidyTotal = 0;
    let customerShippingTotal = 0;

    filteredOrdersByPeriod.forEach((ord) => {
      const grand = Number(ord.grandTotal || 0);
      const net = Number(ord.subtotalProducts || grand);
      const origShip = Number(ord.originalShipping || 0);
      const subShip = Number(ord.shippingSubsidy || 0);
      const custShip = Number(ord.customerShippingFee || 0);

      grossTotal += grand;
      netSalesTotal += net;
      originalShippingTotal += origShip;
      shippingSubsidyTotal += subShip;
      customerShippingTotal += custShip;

      const summary = ord.itemsSummary || "";
      const matchQty = summary.match(/\((\d+)x\)/);
      const qty = matchQty ? parseInt(matchQty[1]) : 1;

      if (summary.includes("5 Tea Bags")) {
        totalRegularValue += 50000 * qty;
      } else {
        totalRegularValue += 97000 * qty;
      }
    });

    const totalProductDiscount = Math.max(0, totalRegularValue - netSalesTotal);
    const totalCombinedSubsidy = totalProductDiscount + shippingSubsidyTotal;
    const totalOrdersCount = filteredOrdersByPeriod.length;
    const aov = totalOrdersCount > 0 ? Math.round(netSalesTotal / totalOrdersCount) : 0;

    // Kalkulasi Pajak PPh Final UMKM 0,5% dari Gross Sales (Omset Bruto)
    const pphEstimated = Math.round(grossTotal * 0.005);

    const discountPercent = totalCombinedSubsidy > 0 ? Math.round((totalProductDiscount / totalCombinedSubsidy) * 100) : 0;
    const subsidyPercent = totalCombinedSubsidy > 0 ? 100 - discountPercent : 0;

    return {
      grossTotal,
      netSalesTotal,
      totalRegularValue,
      totalProductDiscount,
      originalShippingTotal,
      shippingSubsidyTotal,
      customerShippingTotal,
      totalCombinedSubsidy,
      totalOrdersCount,
      aov,
      pphEstimated,
      discountPercent,
      subsidyPercent,
    };
  }, [filteredOrdersByPeriod]);

  const skuStats = useMemo(() => {
    const stats: Record<string, { name: string; size: string; qty: number; omset: number }> = {
      "VRT-01-10S": { name: "Signature Blend", size: "10 Bags Pouch", qty: 0, omset: 0 },
      "VRT-01-05S": { name: "Signature Blend", size: "5 Bags Pack", qty: 0, omset: 0 },
      "VRT-02-10S": { name: "Morning Energy", size: "10 Bags Pouch", qty: 0, omset: 0 },
      "VRT-02-05S": { name: "Morning Energy", size: "5 Bags Pack", qty: 0, omset: 0 },
      "VRT-03-10S": { name: "Golden Turmeric", size: "10 Bags Pouch", qty: 0, omset: 0 },
      "VRT-03-05S": { name: "Golden Turmeric", size: "5 Bags Pack", qty: 0, omset: 0 },
      "VRT-04-10S": { name: "Warm Balance", size: "10 Bags Pouch", qty: 0, omset: 0 },
      "VRT-04-05S": { name: "Warm Balance", size: "5 Bags Pack", qty: 0, omset: 0 },
    };

    orders.forEach((ord) => {
      if (startDate || endDate) {
        const ordDateStr = ord.createdAt ? ord.createdAt.split(" ")[0] : "";
        if (ordDateStr) {
          if (startDate && ordDateStr < startDate) return;
          if (endDate && ordDateStr > endDate) return;
        }
      }

      const summary = ord.itemsSummary || "";
      const skuString = ord.sku || "";
      const net = Number(ord.subtotalProducts || ord.grandTotal || 0);

      if (skuString.includes("VRT-01") || summary.includes("Signature")) {
        if (summary.includes("5 Tea Bags") || skuString.includes("05S")) {
          stats["VRT-01-05S"].qty += 1;
          stats["VRT-01-05S"].omset += net;
        } else {
          stats["VRT-01-10S"].qty += 1;
          stats["VRT-01-10S"].omset += net;
        }
      } else if (skuString.includes("VRT-02") || summary.includes("Morning")) {
        if (summary.includes("5 Tea Bags") || skuString.includes("05S")) {
          stats["VRT-02-05S"].qty += 1;
          stats["VRT-02-05S"].omset += net;
        } else {
          stats["VRT-02-10S"].qty += 1;
          stats["VRT-02-10S"].omset += net;
        }
      } else if (skuString.includes("VRT-03") || summary.includes("Golden")) {
        if (summary.includes("5 Tea Bags") || skuString.includes("05S")) {
          stats["VRT-03-05S"].qty += 1;
          stats["VRT-03-05S"].omset += net;
        } else {
          stats["VRT-03-10S"].qty += 1;
          stats["VRT-03-10S"].omset += net;
        }
      } else if (skuString.includes("VRT-04") || summary.includes("Warm")) {
        if (summary.includes("5 Tea Bags") || skuString.includes("05S")) {
          stats["VRT-04-05S"].qty += 1;
          stats["VRT-04-05S"].omset += net;
        } else {
          stats["VRT-04-10S"].qty += 1;
          stats["VRT-04-10S"].omset += net;
        }
      }
    });

    return stats;
  }, [orders, startDate, endDate]);

  const finalFilteredOrders = useMemo(() => {
    return filteredOrdersByPeriod.filter((ord) => {
      const matchesSearch = ord.orderSerial.toLowerCase().includes(searchQuery.toLowerCase()) || ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || ord.phone.includes(searchQuery);
      const matchesStatus = statusFilter === "ALL" || ord.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [filteredOrdersByPeriod, searchQuery, statusFilter]);

  const filteredMembers = members.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.phone.includes(searchQuery) || m.memberId.toLowerCase().includes(searchQuery.toLowerCase()));

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  // --- FUNSI EXPORT REKAP PENJUALAN KE EXCEL (.CSV) ---
  const exportToExcel = (dataToExport: OrderItem[], filenamePrefix: string) => {
    if (dataToExport.length === 0) {
      alert("Tidak ada data pesanan untuk di-export!");
      return;
    }

    // Header Kolom CSV
    const headers = [
      "No Seri Pesanan",
      "Tanggal Transaksi",
      "Member ID",
      "Nama Pelanggan",
      "No WhatsApp",
      "Email",
      "Alamat Pengiriman",
      "SKU Varian",
      "Ringkasan Produk",
      "Net Sales (Produk)",
      "Ongkir Asli J&T",
      "Subsidi Ongkir Toko",
      "Ongkir Customer",
      "Gross Sales (Total Transfer)",
      "Status Pesanan",
      "No Resi J&T",
    ];

    // Baris Data Transaksi
    const csvRows = dataToExport.map((ord) => [
      `"${ord.orderSerial}"`,
      `"${ord.createdAt || "-"}"`,
      `"${ord.memberId}"`,
      `"${ord.customerName.replace(/"/g, '""')}"`,
      `"${ord.phone}"`,
      `"${ord.email}"`,
      `"${ord.addressDetail.replace(/"/g, '""')}"`,
      `"${ord.sku || "-"}"`,
      `"${ord.itemsSummary.replace(/"/g, '""')}"`,
      ord.subtotalProducts || ord.grandTotal,
      ord.originalShipping || 0,
      ord.shippingSubsidy || 0,
      ord.customerShippingFee || 0,
      ord.grandTotal,
      `"${ord.status}"`,
      `"${ord.resiJNT || "-"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `VARTANA_${filenamePrefix}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D261C] p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#B69245]/40 bg-[#FBF9F4] p-6 md:p-8 shadow-2xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-[#16382A]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#B69245]">VARTANA EXECUTIVE</span>
            <h2 className="mt-3 font-serif text-2xl md:text-3xl font-bold text-[#16382A]">Control Center</h2>
            <p className="mt-1 text-xs text-[#526158]">Masukkan Akses Otentikasi Admin</p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            {authError && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-700">⚠️ {authError}</div>}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#16382A] mb-1">Username Admin</label>
              <input
                type="text"
                placeholder="Username Admin"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="w-full rounded-2xl border border-[#16382A]/20 bg-white p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B69245]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#16382A] mb-1">Kode Akses / PIN</label>
              <input
                type="password"
                placeholder="Masukkan PIN Akses"
                value={inputAccessCode}
                onChange={(e) => setInputAccessCode(e.target.value)}
                className="w-full rounded-2xl border border-[#16382A]/20 bg-white p-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#B69245]"
                required
              />
            </div>

            <button type="submit" className="mt-2 w-full rounded-full bg-gradient-to-r from-[#16382A] to-[#0D261C] py-4 text-xs font-bold uppercase tracking-widest text-[#FBF9F4] shadow-lg transition active:scale-95">
              🔓 Masuk Panel Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F2E8] text-[#16382A] p-3 md:p-8 font-sans pb-24 md:pb-8">
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#B69245]/20 pb-4 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-serif text-xl md:text-3xl font-bold text-[#16382A]">Monitoring & Operations</h1>
          </div>
          <p className="text-[11px] md:text-xs text-[#526158] mt-0.5">VARTANA Botanical Wellness — Financial Intelligence</p>
        </div>

        {/* ACTION BUTTONS & EXPORT DATA CENTER */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportToExcel(finalFilteredOrders, "Report_Current_View")}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-700 hover:text-white transition shadow-xs"
            title="Download Excel Sesuai Filter di Screen"
          >
            📊 Export Filter (.CSV)
          </button>
          <button
            onClick={() => exportToExcel(orders, "Report_All_Master_Data")}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-full border border-[#B69245] bg-[#FFFDF9] px-3.5 py-2 text-xs font-bold text-[#8E6E2E] hover:bg-[#B69245] hover:text-white transition shadow-xs"
            title="Download Seluruh Master Database"
          >
            🗃️ Export All Master (.CSV)
          </button>
          <button onClick={fetchDashboardData} className="rounded-full border border-[#16382A]/20 bg-white px-3 py-2 text-xs font-bold text-[#16382A] hover:bg-[#16382A] hover:text-white transition">
            🔄 Refresh
          </button>
          <button onClick={handleLogout} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition">
            🔒 Logout
          </button>
        </div>
      </div>

      {/* FILTER PERIODE PENJUALAN */}
      <div className="mt-4 md:mt-6 rounded-2xl md:rounded-3xl border border-[#B69245]/30 bg-white p-3.5 md:p-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E6E2E]">📅 PERIODE PENJUALAN</p>
            <p className="text-[11px] text-[#526158] hidden md:block">Pilih rentang waktu analisis data</p>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-1.5 pb-1 md:pb-0">
            {[
              { id: "ALL", label: "Semua" },
              { id: "TODAY", label: "Hari Ini" },
              { id: "7DAYS", label: "7 Hari" },
              { id: "THIS_MONTH", label: "Bulan Ini" },
              { id: "LAST_MONTH", label: "Bulan Lalu" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id as any)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold transition ${datePreset === p.id ? "bg-[#16382A] text-white shadow-xs" : "bg-[#F6F2E8] text-[#526158] hover:bg-[#B69245]/20 hover:text-[#16382A]"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-2.5 text-[11px]">
          <span className="font-bold text-[#16382A]">Custom Tanggal:</span>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("CUSTOM");
              }}
              className="flex-1 rounded-xl border border-gray-300 p-1.5 text-[11px] focus:ring-1 focus:ring-[#B69245]"
            />
            <span className="text-gray-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("CUSTOM");
              }}
              className="flex-1 rounded-xl border border-gray-300 p-1.5 text-[11px] focus:ring-1 focus:ring-[#B69245]"
            />
          </div>
          {(startDate || endDate) && (
            <button onClick={() => handlePresetChange("ALL")} className="text-[10px] font-bold text-red-600 hover:underline ml-auto">
              Reset ✕
            </button>
          )}
        </div>
      </div>

      {/* HIGHLIGHT HERO CARDS - CASH INFLOW & PROMO BAR */}
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {/* CASH INFLOW HERO CARD */}
        <div className="rounded-2xl md:rounded-3xl border border-[#B69245]/30 bg-gradient-to-br from-[#16382A] to-[#0D261C] p-4 md:p-6 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="rounded-full bg-[#B69245]/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#B69245] border border-[#B69245]/30">TOTAL CASH INFLOW (BCA)</span>
              <span className="text-[10px] text-emerald-300 font-bold">{metrics.totalOrdersCount} Trx</span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold mt-2 text-[#F6F2E8]">{formatRupiah(metrics.grossTotal)}</h2>
            <p className="text-[10px] text-white/70 mt-0.5">Pemasukan Bersih Transfer Customer</p>
          </div>

          <div className="mt-4 border-t border-white/10 pt-3 flex justify-between text-[11px] text-white/80">
            <span>
              Rata-Rata: <strong>{formatRupiah(metrics.aov)}</strong>/Trx
            </span>
            <span>
              Net Product: <strong>{formatRupiah(metrics.netSalesTotal)}</strong>
            </span>
          </div>
        </div>

        {/* PROMO VS SUBSIDI VISUAL PROGRESS CARD */}
        <div className="rounded-2xl md:rounded-3xl border border-[#B69245]/30 bg-[#FFFDF9] p-4 md:p-6 shadow-xs lg:col-span-2 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E6E2E]">📊 KOMPOSISI DISKON & SUBSIDI TOKO</span>
              <span className="text-xs font-extrabold text-[#16382A]">Total: {formatRupiah(metrics.totalCombinedSubsidy)}</span>
            </div>
            <p className="text-[11px] text-[#526158]">Perbandingan total diskon produk murni vs subsidi ongkir toko</p>
          </div>

          <div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-gray-100 flex p-0.5 border border-gray-200">
              <div style={{ width: `${metrics.discountPercent}%` }} className="bg-amber-500 rounded-full transition-all duration-500" />
              <div style={{ width: `${metrics.subsidyPercent}%` }} className="bg-rose-500 rounded-full transition-all duration-500 ml-0.5" />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-bold">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                <span className="text-amber-800 block text-[9px] uppercase">Diskon Retail Produk</span>
                <span className="text-amber-900 text-sm font-serif font-bold">{formatRupiah(metrics.totalProductDiscount)}</span>
                <span className="text-[9px] text-amber-700 block font-normal mt-0.5">Porsi: {metrics.discountPercent}%</span>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5">
                <span className="text-rose-800 block text-[9px] uppercase">Subsidi Ongkir Toko</span>
                <span className="text-rose-900 text-sm font-serif font-bold">{formatRupiah(metrics.shippingSubsidyTotal)}</span>
                <span className="text-[9px] text-rose-700 block font-normal mt-0.5">Porsi: {metrics.subsidyPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARDS KEUANGAN & KARTU ESTIMASI PAJAK PPH FINAL UMKM (0.5%) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 md:gap-4 mt-3 md:mt-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-xs">
          <p className="text-[9px] font-bold uppercase text-gray-400">1. Omset Reguler Katalog</p>
          <p className="font-serif text-base md:text-xl font-bold text-gray-600 mt-1">{formatRupiah(metrics.totalRegularValue)}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Harga Tanpa Diskon</p>
        </div>

        <div className="rounded-2xl border border-[#B69245]/40 bg-white p-3 md:p-4 shadow-xs">
          <p className="text-[9px] font-bold uppercase text-[#8E6E2E]">2. Net Sales (Omset Produk)</p>
          <p className="font-serif text-base md:text-xl font-bold text-[#16382A] mt-1">{formatRupiah(metrics.netSalesTotal)}</p>
          <p className="text-[9px] text-emerald-700 mt-0.5">Omset Murni Barang</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-xs">
          <p className="text-[9px] font-bold uppercase text-gray-500">3. Ongkir Ekspedisi Asli</p>
          <p className="font-serif text-base md:text-xl font-bold text-gray-700 mt-1">{formatRupiah(metrics.originalShippingTotal)}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Tarif Riil J&T Express</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-xs">
          <p className="text-[9px] font-bold uppercase text-gray-500">4. Ongkir Dibayar Customer</p>
          <p className="font-serif text-base md:text-xl font-bold text-gray-800 mt-1">{formatRupiah(metrics.customerShippingTotal)}</p>
          <p className="text-[9px] text-gray-400 mt-0.5">Sisa Ongkir Masuk</p>
        </div>

        {/* KARTU ESTIMASI PAJAK PPH FINAL UMKM (0,5%) */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-purple-200 bg-purple-50/60 p-3 md:p-4 shadow-xs">
          <p className="text-[9px] font-bold uppercase text-purple-800">5. Estimasi PPh Final (0,5%)</p>
          <p className="font-serif text-base md:text-xl font-bold text-purple-950 mt-1">{formatRupiah(metrics.pphEstimated)}</p>
          <p className="text-[9px] text-purple-700 mt-0.5">Pajak Negara PP 55/2022</p>
        </div>
      </div>

      {/* VISUAL BAR KONTRIBUSI SKU VARIAN */}
      <div className="mt-4 md:mt-6 rounded-2xl md:rounded-3xl border border-[#B69245]/20 bg-white p-3.5 md:p-5 shadow-xs">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8E6E2E]">📦 FILTER SKU VARIAN & PAKET KEMASAN</p>
            <p className="text-[11px] text-[#526158]">Klik kartu varian di bawah ini untuk menyaring tabel pesanan</p>
          </div>
          {selectedSkuFilter && (
            <button onClick={() => setSelectedSkuFilter(null)} className="rounded-full bg-red-100 px-2.5 py-1 text-[9px] font-bold text-red-700 hover:bg-red-200 transition">
              Reset Filter ({selectedSkuFilter}) ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4 text-xs">
          {Object.entries(skuStats).map(([code, item]) => {
            const isSelected = selectedSkuFilter === code;
            const percentContrib = metrics.netSalesTotal > 0 ? Math.round((item.omset / metrics.netSalesTotal) * 100) : 0;

            return (
              <button
                key={code}
                onClick={() => setSelectedSkuFilter(isSelected ? null : code)}
                className={`rounded-xl md:rounded-2xl border p-3 md:p-4 text-left transition duration-200 ${
                  isSelected ? "border-[#B69245] bg-[#F6F2E8] shadow-md ring-2 ring-[#B69245]" : "border-gray-200 bg-white hover:border-[#B69245]/40 hover:bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-[#16382A] bg-gray-100 px-1.5 py-0.5 rounded text-[9px]">{code}</span>
                  <span className="font-extrabold text-[#8E6E2E] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">{item.qty} Trx</span>
                </div>
                <h4 className="mt-1.5 font-bold text-[#16382A] text-[11px] md:text-xs truncate">{item.name}</h4>
                <p className="text-[9px] font-semibold text-[#8E6E2E]">{item.size}</p>
                <p className="mt-1 text-[10px] md:text-[11px] text-[#526158] font-medium">{formatRupiah(item.omset)}</p>

                <div className="mt-2.5">
                  <div className="flex justify-between text-[9px] text-gray-400 mb-0.5 font-semibold">
                    <span>Porsi Omset</span>
                    <span>{percentContrib}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div style={{ width: `${percentContrib}%` }} className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-[#B69245]" : "bg-[#16382A]"}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTROLS & SEARCH BAR */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#16382A]/10 pb-3">
        <div className="flex bg-[#FFFDF9] p-1 rounded-xl border border-[#16382A]/10 self-start w-full md:w-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${activeTab === "orders" ? "bg-[#16382A] text-white shadow-xs" : "text-[#526158] hover:text-[#16382A]"}`}
          >
            Pesanan ({finalFilteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${activeTab === "members" ? "bg-[#16382A] text-white shadow-xs" : "text-[#526158] hover:text-[#16382A]"}`}
          >
            Member ({members.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "orders" && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-[#16382A]/20 bg-white px-2.5 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#B69245]">
              <option value="ALL">Semua Status</option>
              <option value="PEMBAYARAN DITERIMA">Pembayaran Diterima</option>
              <option value="PESANAN DISIAPKAN">Pesanan Disiapkan</option>
              <option value="DIKIRIM">Dikirim</option>
              <option value="SELESAI">Selesai</option>
            </select>
          )}

          <input
            type="text"
            placeholder={activeTab === "orders" ? "Cari No Seri / Nama / WA..." : "Cari Member ID / WA..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 rounded-xl border border-[#16382A]/20 bg-white px-3 py-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#B69245]"
          />
        </div>
      </div>

      {/* TAB DAFTAR PESANAN */}
      {activeTab === "orders" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#16382A]/10 bg-white shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#526158]">Memuat data pesanan...</div>
          ) : finalFilteredOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#526158]">Tidak ada data pesanan yang cocok dengan filter.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap md:whitespace-normal">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F6F2E8] text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-[#16382A]">
                  <th className="p-3">No. Seri / Tgl</th>
                  <th className="p-3">Pelanggan</th>
                  <th className="p-3">Rincian SKU & Item</th>
                  <th className="p-3 text-right">Net Sales</th>
                  <th className="p-3 text-right">Subsidi Ongkir</th>
                  <th className="p-3 text-right">Total Transfer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Resi J&T</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {finalFilteredOrders.map((ord) => {
                  const isEditing = editingSerial === ord.orderSerial;

                  return (
                    <tr key={ord.orderSerial} className="hover:bg-gray-50/80 transition">
                      <td className="p-3 align-top font-mono">
                        <span className="font-bold text-[#8E6E2E] block text-xs">{ord.orderSerial}</span>
                        <span className="text-[10px] text-gray-400">{ord.createdAt || "-"}</span>
                      </td>

                      <td className="p-3 align-top">
                        <span className="font-bold text-[#16382A] block">{ord.customerName}</span>
                        <span className="text-gray-500 block text-[10px]">{ord.phone}</span>
                      </td>

                      <td className="p-3 align-top max-w-xs">
                        {ord.sku && <span className="font-mono text-[9px] bg-gray-100 px-1.5 py-0.5 rounded mr-1 font-bold">{ord.sku}</span>}
                        <p className="text-gray-700 font-medium text-[11px] truncate md:whitespace-normal">{ord.itemsSummary}</p>
                      </td>

                      <td className="p-3 align-top text-right font-semibold text-[#16382A]">{formatRupiah(Number(ord.subtotalProducts || ord.grandTotal))}</td>

                      <td className="p-3 align-top text-right text-rose-600 font-medium">-{formatRupiah(Number(ord.shippingSubsidy || 0))}</td>

                      <td className="p-3 align-top text-right font-bold text-[#8E6E2E]">{formatRupiah(Number(ord.grandTotal))}</td>

                      <td className="p-3 align-top">
                        {isEditing ? (
                          <select value={inputStatus} onChange={(e) => setInputStatus(e.target.value)} className="rounded-lg border border-gray-300 p-1 text-[11px]">
                            <option value="PEMBAYARAN DITERIMA">PEMBAYARAN DITERIMA</option>
                            <option value="PESANAN DISIAPKAN">PESANAN DISIAPKAN</option>
                            <option value="DIKIRIM">DIKIRIM</option>
                            <option value="SELESAI">SELESAI</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              ord.status === "SELESAI" ? "bg-emerald-100 text-emerald-800" : ord.status === "DIKIRIM" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.status || "PEMBAYARAN DITERIMA"}
                          </span>
                        )}
                      </td>

                      <td className="p-3 align-top">
                        {isEditing ? (
                          <input type="text" placeholder="Input No Resi..." value={inputResi} onChange={(e) => setInputResi(e.target.value)} className="w-28 rounded-lg border border-gray-300 p-1 font-mono text-[11px]" />
                        ) : (
                          <span className="font-mono font-bold text-gray-700">{ord.resiJNT && ord.resiJNT !== "-" ? ord.resiJNT : "—"}</span>
                        )}
                      </td>

                      <td className="p-3 align-top text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => handleUpdateOrder(ord.orderSerial)} disabled={isUpdating} className="rounded bg-emerald-700 px-2 py-1 text-[9px] font-bold text-white">
                              Simpan
                            </button>
                            <button onClick={() => setEditingSerial(null)} className="rounded bg-gray-200 px-1.5 py-1 text-[9px] font-bold text-gray-600">
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSerial(ord.orderSerial);
                              setInputStatus(ord.status || "PEMBAYARAN DITERIMA");
                              setInputResi(ord.resiJNT && ord.resiJNT !== "-" ? ord.resiJNT : "");
                            }}
                            className="rounded border border-[#16382A]/20 bg-[#F6F2E8] px-2.5 py-1 text-[10px] font-bold text-[#16382A] hover:bg-[#16382A] hover:text-white transition"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB DATA MEMBER */}
      {activeTab === "members" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#16382A]/10 bg-white shadow-xs">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#526158]">Memuat data member...</div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#526158]">Tidak ada data member.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-[#F6F2E8] text-[9px] font-bold uppercase tracking-wider text-[#16382A]">
                  <th className="p-3">Member ID</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Kecamatan / Kota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                {filteredMembers.map((m) => (
                  <tr key={m.memberId} className="hover:bg-gray-50/80 transition">
                    <td className="p-3 font-mono font-bold text-[#8E6E2E]">{m.memberId}</td>
                    <td className="p-3 font-bold text-[#16382A]">{m.name}</td>
                    <td className="p-3 font-mono">{m.phone}</td>
                    <td className="p-3 text-gray-600">{m.email}</td>
                    <td className="p-3 text-gray-600">{m.districtName ? `${m.districtName}, ${m.cityName}` : m.cityName || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
