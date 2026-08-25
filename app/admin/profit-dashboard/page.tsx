"use client";

import React, { useState } from "react";

export default function ProfitDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Data dummy transaksi sesuai kesepakatan HPP & Harga Jual kita
  const transactions = [
    { id: "TRX-001", date: "2026-06-01", customer: "Budi Santoso", variant: "Signature Blend Signature (10s)", qty: 2, price: 72800, hpp: 26400, shippingSub: 10000 },
    { id: "TRX-002", date: "2026-06-02", customer: "Siti Rahma", variant: "Personal Pack (5s)", qty: 3, price: 40000, hpp: 15000, shippingSub: 5000 },
    { id: "TRX-003", date: "2026-06-03", customer: "PT Maju Jaya", variant: "Warm Balance Signature (10s)", qty: 5, price: 72800, hpp: 26400, shippingSub: 15000 },
    { id: "TRX-004", date: "2026-06-04", customer: "Dewi Lestari", variant: "Personal Pack (5s)", qty: 1, price: 40000, hpp: 15000, shippingSub: 0 },
    { id: "TRX-005", date: "2026-06-05", customer: "Ahmad Fauzi", variant: "Signature Blend Signature (10s)", qty: 2, price: 72800, hpp: 26400, shippingSub: 10000 },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "adminvartana" && pin === "281023") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Username atau PIN salah! Periksa kembali kredensial Anda.");
    }
  };

  // Kalkulasi Financial Metrics (P&L Summary)
  const totalTransactions = transactions.length;
  const grossSales = transactions.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  const netSales = grossSales; // Bisa dikurangi diskon jika ada
  const totalCogs = transactions.reduce((acc, curr) => acc + curr.qty * curr.hpp, 0);
  const grossProfit = netSales - totalCogs;
  const grossMargin = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

  const totalShippingSub = transactions.reduce((acc, curr) => acc + curr.shippingSub, 0);
  const netProfit = grossProfit - totalShippingSub;
  const netMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;
  const aov = totalTransactions > 0 ? grossSales / totalTransactions : 0;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  // Tampilan Login jika belum autentikasi
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-400">VARTANA BOTANICAL</h1>
            <p className="text-slate-400 text-sm mt-1">Restricted Area: Menu 2 Profit & Cost Breakdown</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1">PIN ACCESS</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan 6 digit PIN..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            {error && <div className="text-red-400 text-xs bg-red-950/50 border border-red-800 p-2.5 rounded-lg text-center">{error}</div>}

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg transition-colors text-sm shadow-lg">
              Buka Akses Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Utama Dashboard Menu 2 setelah berhasil login
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-amber-400">Profit & Cost Breakdown (P&L Closing)</h1>
            <p className="text-slate-400 text-sm mt-1">Sistem Monitoring Keuangan & Tutup Buku Bulanan Vartana</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors">
            Lock / Keluar Sesi
          </button>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Gross Sales</p>
            <h3 className="text-2xl font-bold text-white mt-2">{formatIDR(grossSales)}</h3>
            <span className="text-xs text-slate-400 mt-1 block">Total Pendapatan Kotor</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Net Sales</p>
            <h3 className="text-2xl font-bold text-white mt-2">{formatIDR(netSales)}</h3>
            <span className="text-xs text-slate-400 mt-1 block">Total Penjualan Bersih</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Gross Profit & Margin</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-2">{formatIDR(grossProfit)}</h3>
            <span className="text-xs text-emerald-500 font-semibold mt-1 block">Margin: {grossMargin.toFixed(1)}%</span>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-sm">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Net Profit & Margin</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-2">{formatIDR(netProfit)}</h3>
            <span className="text-xs text-emerald-500 font-semibold mt-1 block">
              Margin: {netMargin.toFixed(1)}% (AOV: {formatIDR(aov)})
            </span>
          </div>
        </div>

        {/* Detailed Accounting P&L Table */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-white mb-4">Rincian Laporan Tutup Buku (P&L Statement)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Komponen Keuangan</th>
                  <th className="py-3 px-4">Nominal (IDR)</th>
                  <th className="py-3 px-4 rounded-r-lg">Persentase (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Gross Sales (Total Omset Kotor)</td>
                  <td className="py-3 px-4 font-semibold text-white">{formatIDR(grossSales)}</td>
                  <td className="py-3 px-4 text-slate-400">100.0%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Net Sales (Penjualan Bersih)</td>
                  <td className="py-3 px-4 font-semibold text-white">{formatIDR(netSales)}</td>
                  <td className="py-3 px-4 text-slate-400">100.0%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-300">Total COGS (HPP / Modal Barang)</td>
                  <td className="py-3 px-4 text-red-400">({formatIDR(totalCogs)})</td>
                  <td className="py-3 px-4 text-slate-400">{((totalCogs / netSales) * 100).toFixed(1)}%</td>
                </tr>
                <tr className="bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-amber-400">Gross Profit (Laba Kotor)</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{formatIDR(grossProfit)}</td>
                  <td className="py-3 px-4 font-bold text-amber-400">{grossMargin.toFixed(1)}%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-slate-300">Total Biaya Operasional / Subsidi Ongkir</td>
                  <td className="py-3 px-4 text-red-400">({formatIDR(totalShippingSub)})</td>
                  <td className="py-3 px-4 text-slate-400">{((totalShippingSub / netSales) * 100).toFixed(1)}%</td>
                </tr>
                <tr className="bg-emerald-950/20 border-t border-emerald-900/50">
                  <td className="py-3 px-4 font-bold text-emerald-400">NET PROFIT (Laba Bersih Akhir)</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{formatIDR(netProfit)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{netMargin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales Log Table */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-white mb-4">Log Transaksi Penjualan Masuk</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">ID TRX</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Varian Produk</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Total Jual</th>
                  <th className="py-3 px-4 rounded-r-lg">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => {
                  const txOmset = tx.qty * tx.price;
                  const txCogs = tx.qty * tx.hpp;
                  const txProfit = txOmset - txCogs - tx.shippingSub;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono text-xs text-amber-400">{tx.id}</td>
                      <td className="py-3 px-4 text-slate-400 text-xs">{tx.date}</td>
                      <td className="py-3 px-4 font-medium text-white">{tx.customer}</td>
                      <td className="py-3 px-4 text-slate-300 text-xs">{tx.variant}</td>
                      <td className="py-3 px-4">{tx.qty}</td>
                      <td className="py-3 px-4 font-semibold text-white">{formatIDR(txOmset)}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">{formatIDR(txProfit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
