"use client";

import { useEffect, useMemo, useState } from "react";
import OperationsHeader from "./components/OperationsHeader";
import OperationsKpi from "./components/OperationsKpi";
import OperationsStatus from "./components/OperationsStatus";
import OperationsOrders from "./components/OperationsOrders";

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

type Period = "ALL" | "TODAY" | "7DAYS" | "THIS_MONTH";

const periodLabels: Record<Period, string> = {
  ALL: "Semua",
  TODAY: "Hari Ini",
  "7DAYS": "7 Hari",
  THIS_MONTH: "Bulan Ini",
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function parseDate(value?: string) {
  if (!value) return null;

  const normalized = value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isWithinPeriod(order: OrderItem, period: Period) {
  if (period === "ALL") return true;

  const date = parseDate(order.createdAt);
  if (!date) return false;

  const now = new Date();

  if (period === "TODAY") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  if (period === "7DAYS") {
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return date >= sevenDaysAgo;
  }

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export default function OperationsPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [period, setPeriod] = useState<Period>("ALL");
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/data");

      if (!response.ok) {
        throw new Error("Gagal mengambil data operasi.");
      }

      const data = await response.json();

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setMembers(Array.isArray(data.members) ? data.members : []);
    } catch (err) {
      console.error("Operations monitoring error:", err);
      setError("Data monitoring belum berhasil dimuat. Silakan refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("vartana_admin_auth");

    if (savedAuth === "true") {
      setAuthenticated(true);
      fetchData();
    } else {
      setAuthenticated(false);
    }
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => isWithinPeriod(order, period));
  }, [orders, period]);

  const metrics = useMemo(() => {
    const revenue = filteredOrders.reduce(
      (total, order) => total + (Number(order.grandTotal) || 0),
      0
    );

    const pending = filteredOrders.filter((order) => {
      const status = order.status.toUpperCase();
      return (
        status.includes("PENDING") ||
        status.includes("MENUNGGU") ||
        status.includes("BELUM")
      );
    }).length;

    const processing = filteredOrders.filter((order) => {
      const status = order.status.toUpperCase();
      return (
        status.includes("SIAP") ||
        status.includes("PROSES") ||
        status.includes("DIPROSES")
      );
    }).length;

    const shipped = filteredOrders.filter((order) => {
      const status = order.status.toUpperCase();
      return status.includes("KIRIM") || status.includes("DIKIRIM");
    }).length;

    const completed = filteredOrders.filter((order) => {
      return order.status.toUpperCase().includes("SELESAI");
    }).length;

    return {
      revenue,
      pending,
      processing,
      shipped,
      completed,
    };
  }, [filteredOrders]);

  const recentOrders = useMemo(() => {
    return [...filteredOrders]
      .sort((a, b) => {
        const dateA = parseDate(a.createdAt)?.getTime() || 0;
        const dateB = parseDate(b.createdAt)?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10);
  }, [filteredOrders]);

  if (authenticated === null) {
    return (
      <main className="min-h-screen bg-[#F7F4ED] p-6">
        <div className="mx-auto max-w-7xl py-20 text-center text-sm text-[#526158]">
          Memeriksa akses...
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#F7F4ED] px-5 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-[#B69245]/30 bg-white p-7 text-center shadow-lg">
          <span className="text-3xl">🔐</span>

          <h1 className="mt-4 font-serif text-2xl font-bold text-[#16382A]">
            Operations Monitoring
          </h1>

          <p className="mt-2 text-sm text-[#526158]">
            Silakan login melalui Admin Dashboard terlebih dahulu.
          </p>

          <a
            href="/admin/dashboard"
            className="mt-6 inline-flex rounded-full bg-[#16382A] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#244F3B]"
          >
            Buka Admin Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F4ED] px-4 py-5 md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <OperationsHeader onRefresh={fetchData} loading={loading} />

        <section className="rounded-3xl border border-[#B69245]/20 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8E6E2E]">
                Monitoring Period
              </p>

              <p className="mt-1 text-xs text-[#526158]">
                Pilih rentang data operasional.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(Object.keys(periodLabels) as Period[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setPeriod(item)}
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                    period === item
                      ? "bg-[#16382A] text-white"
                      : "border border-[#16382A]/15 bg-[#FFFDF9] text-[#526158] hover:bg-[#16382A]/5"
                  }`}
                >
                  {periodLabels[item]}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <OperationsKpi
            label="Total Orders"
            value={String(filteredOrders.length)}
            helper={`${periodLabels[period]}`}
            icon="🧾"
          />

          <OperationsKpi
            label="Revenue"
            value={formatRupiah(metrics.revenue)}
            helper="Gross transfer customer"
            icon="💰"
          />

          <OperationsKpi
            label="Pending"
            value={String(metrics.pending)}
            helper="Perlu perhatian"
            icon="⏳"
          />

          <OperationsKpi
            label="Members"
            value={String(members.length)}
            helper="Member terdaftar"
            icon="👥"
          />
        </section>

        <OperationsStatus
          pending={metrics.pending}
          processing={metrics.processing}
          shipped={metrics.shipped}
          completed={metrics.completed}
        />

        <OperationsOrders
          orders={recentOrders}
          formatRupiah={formatRupiah}
        />

        <footer className="pb-6 pt-1 text-center text-[10px] text-[#526158]">
          VARTANA Operations Monitoring • Data source: Admin API
        </footer>
      </div>
    </main>
  );
}
