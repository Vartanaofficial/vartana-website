import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type SalesReportOrder = {
  orderSerial?: string;
  memberId?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  sku?: string;
  itemsSummary?: string;
  createdAt?: string;
  subtotalProducts?: number | string;
  originalShipping?: number | string;
  shippingSubsidy?: number | string;
  customerShippingFee?: number | string;
  grandTotal?: number | string;
  status?: string;
  resiJNT?: string;
};

type ReportMode = "monthly" | "all";

type MonthlySummary = {
  month: string;
  label: string;
  revenue: number;
  transactions: number;
  units: number;
  cogs: number;
  estimatedProfit: number;
  estimatedMargin: number;
};

const GREEN: [number, number, number] = [24, 65, 51];
const GOLD: [number, number, number] = [181, 145, 75];
const MUTED: [number, number, number] = [105, 115, 110];

const rupiah = (value: number) =>
  "Rp " + Math.round(value).toLocaleString("id-ID");

const monthLabel = (month: string) => {
  const [year, number] = month.split("-").map(Number);
  return new Date(year, number - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

const getMonth = (date: string) => {
  const match = date.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : null;
};

const getQuantity = (summary: string) => {
  const matches = [...summary.matchAll(/\((\d+)\s*x\)/gi)];
  return matches.length ? Number(matches[matches.length - 1][1]) : 1;
};

const getCogsPerUnit = (summary: string) => {
  if (summary.includes("5 Tea Bags")) return 15000;
  if (summary.includes("Signature") || summary.includes("10 Tea Bags")) {
    return 26400;
  }
  return 18139;
};

const getRevenue = (order: SalesReportOrder) => {
  const subtotal = Number(order.subtotalProducts || 0);
  return subtotal > 0 ? subtotal : Number(order.grandTotal || 0);
};

const buildMonthlySummaries = (orders: SalesReportOrder[]) => {
  const buckets = new Map<string, MonthlySummary>();

  for (const order of orders) {
    const month = getMonth(order.createdAt || "");
    if (!month) continue;

    if (!buckets.has(month)) {
      buckets.set(month, {
        month,
        label: monthLabel(month),
        revenue: 0,
        transactions: 0,
        units: 0,
        cogs: 0,
        estimatedProfit: 0,
        estimatedMargin: 0,
      });
    }

    const row = buckets.get(month)!;
    const summary = order.itemsSummary || "";
    const quantity = getQuantity(summary);

    row.revenue += getRevenue(order);
    row.transactions += 1;
    row.units += quantity;
    row.cogs += getCogsPerUnit(summary) * quantity;
  }

  const months = [...buckets.keys()].sort();

  if (months.length) {
    const [startYear, startMonth] = months[0].split("-").map(Number);
    const [endYear, endMonth] = months[months.length - 1].split("-").map(Number);

    for (
      let date = new Date(startYear, startMonth - 1, 1);
      date <= new Date(endYear, endMonth - 1, 1);
      date.setMonth(date.getMonth() + 1)
    ) {
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!buckets.has(key)) {
        buckets.set(key, {
          month: key,
          label: monthLabel(key),
          revenue: 0,
          transactions: 0,
          units: 0,
          cogs: 0,
          estimatedProfit: 0,
          estimatedMargin: 0,
        });
      }
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((row) => {
      row.estimatedProfit = row.revenue - row.cogs;
      row.estimatedMargin = row.revenue > 0
        ? (row.estimatedProfit / row.revenue) * 100
        : 0;
      return row;
    });
};

const drawHeader = (doc: jsPDF, title: string, subtitle: string) => {
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(...GREEN);
  doc.rect(0, 0, width, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("VARTANA", 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("BOTANICAL WELLNESS | SALES REPORT", 14, 21);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(14, 25, width - 14, 25);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, 14, 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(subtitle, 14, 49);

  doc.setTextColor(35, 40, 37);
};

const drawKpi = (
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) => {
  doc.setDrawColor(220, 225, 220);
  doc.setFillColor(250, 250, 247);
  doc.roundedRect(x, y, width, 20, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(label, x + 4, y + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text(value, x + 4, y + 14);
};

const drawRevenueChart = (
  doc: jsPDF,
  rows: MonthlySummary[],
  startY: number
) => {
  const width = doc.internal.pageSize.getWidth();
  const chartX = 22;
  const chartY = startY + 13;
  const chartW = width - 44;
  const chartH = 43;
  const maxRevenue = Math.max(1, ...rows.map((row) => row.revenue));
  const points = rows.map((row, index) => ({
    x: rows.length === 1
      ? chartX + chartW / 2
      : chartX + (index / (rows.length - 1)) * chartW,
    y: chartY + chartH - (row.revenue / maxRevenue) * chartH,
    row,
  }));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text("Tren Omzet Bulanan", 14, startY + 5);

  doc.setDrawColor(225, 229, 225);
  doc.setLineWidth(0.3);

  for (let i = 0; i <= 3; i++) {
    const y = chartY + (chartH / 3) * i;
    doc.line(chartX, y, chartX + chartW, y);
  }

  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.2);

  for (let i = 1; i < points.length; i++) {
    doc.line(
      points[i - 1].x,
      points[i - 1].y,
      points[i].x,
      points[i].y
    );
  }

  points.forEach((point) => {
    doc.setFillColor(...GOLD);
    doc.circle(point.x, point.y, 1.6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(
      point.row.month,
      point.x,
      chartY + chartH + 7,
      { align: "center" }
    );
  });

  doc.setTextColor(35, 40, 37);
  return chartY + chartH + 15;
};

const drawFooter = (doc: jsPDF) => {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.4);
    doc.line(14, height - 14, width - 14, height - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("VARTANA Botanical Wellness | Estimasi internal, bukan laporan audit", 14, height - 8);
    doc.text(`Halaman ${page} dari ${pageCount}`, width - 14, height - 8, {
      align: "right",
    });
  }
};

export function generateSalesReportPdf(
  orders: SalesReportOrder[],
  mode: ReportMode,
  selectedMonth?: string
) {
  if (!Array.isArray(orders) || orders.length === 0) {
    throw new Error("Tidak ada data transaksi untuk dibuat menjadi laporan.");
  }

  const validOrders = orders.filter(
    (order) => getMonth(order.createdAt || "") !== null
  );

  if (!validOrders.length) {
    throw new Error("Tidak ada tanggal transaksi valid pada data API.");
  }

  const monthly = buildMonthlySummaries(validOrders);
  const selected = mode === "monthly"
    ? monthly.filter((row) => row.month === selectedMonth)
    : monthly;

  if (!selected.length) {
    throw new Error("Tidak ada transaksi untuk periode yang dipilih.");
  }

  const periodOrders = validOrders.filter((order) => {
    const month = getMonth(order.createdAt || "");
    return mode === "all" || month === selectedMonth;
  });

  const revenue = selected.reduce((sum, row) => sum + row.revenue, 0);
  const transactions = selected.reduce((sum, row) => sum + row.transactions, 0);
  const units = selected.reduce((sum, row) => sum + row.units, 0);
  const cogs = selected.reduce((sum, row) => sum + row.cogs, 0);
  const estimatedProfit = revenue - cogs;
  const margin = revenue > 0 ? (estimatedProfit / revenue) * 100 : 0;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const title = mode === "all" ? "Laporan Seluruh Periode" : "Laporan Bulanan";
  const periodLabel = mode === "all"
    ? `${monthly[0].label} - ${monthly[monthly.length - 1].label}`
    : selected[0].label;

  drawHeader(doc, title, `Periode: ${periodLabel} | Dibuat: ${new Date().toLocaleDateString("id-ID")}`);

  drawKpi(doc, 14, 56, 88, "TOTAL OMZET", rupiah(revenue));
  drawKpi(doc, 108, 56, 88, "TRANSAKSI", String(transactions));
  drawKpi(doc, 14, 80, 88, "UNIT TERJUAL", String(units));
  drawKpi(doc, 108, 80, 88, "ESTIMASI LABA KOTOR", rupiah(estimatedProfit));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `Estimasi margin laba kotor: ${margin.toFixed(1)}%`,
    14,
    107
  );
  doc.text(
    `Estimasi HPP: ${rupiah(cogs)} | Dasar omzet: subtotal produk jika tersedia, jika tidak menggunakan grandTotal.`,
    14,
    113,
    { maxWidth: 180 }
  );

  let tableY = 124;

  if (mode === "all") {
    tableY = drawRevenueChart(doc, selected, 120);
  }

  autoTable(doc, {
    startY: tableY,
    head: [[
      "Bulan",
      "Omzet",
      "Transaksi",
      "Unit",
      "Estimasi HPP",
      "Estimasi Laba",
      "Margin",
    ]],
    body: selected.map((row) => [
      row.label,
      rupiah(row.revenue),
      String(row.transactions),
      String(row.units),
      rupiah(row.cogs),
      rupiah(row.estimatedProfit),
      `${row.estimatedMargin.toFixed(1)}%`,
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [45, 50, 46],
      lineColor: [220, 225, 220],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [247, 248, 244] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? tableY;

  // Analisis produk berdasarkan ringkasan item yang tersedia.
  const productMap = new Map<string, { orders: number; units: number; sales: number }>();

  periodOrders.forEach((order) => {
    const summary = (order.itemsSummary || "Produk tidak teridentifikasi").trim();
    const quantity = getQuantity(summary);
    const productName = summary.replace(/\s*\(\d+\s*x\)\s*$/i, "").trim() || "Produk tidak teridentifikasi";
    const existing = productMap.get(productName) || { orders: 0, units: 0, sales: 0 };
    existing.orders += 1;
    existing.units += quantity;
    existing.sales += getRevenue(order);
    productMap.set(productName, existing);
  });

  let sectionY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? tableY;

  doc.addPage();
  drawHeader(doc, "Analisis Produk", `Periode: ${periodLabel}`);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    "Catatan: nama produk dan kuantitas diolah dari itemsSummary; omzet menggunakan subtotal produk jika tersedia.",
    14,
    57,
    { maxWidth: 180 }
  );

  autoTable(doc, {
    startY: 64,
    head: [["Produk / Ringkasan Item", "Transaksi", "Unit", "Omzet Produk", "Kontribusi Omzet"]],
    body: [...productMap.entries()]
      .sort((a, b) => b[1].sales - a[1].sales)
      .map(([name, item]) => [
        name,
        String(item.orders),
        String(item.units),
        rupiah(item.sales),
        `${revenue > 0 ? (item.sales / revenue * 100).toFixed(1) : "0.0"}%`,
      ]),
    foot: [["TOTAL", String(transactions), String(units), rupiah(revenue), "100.0%"]],
    showFoot: "lastPage",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
      textColor: [45, 50, 46],
      lineColor: [220, 225, 220],
      lineWidth: 0.2,
    },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
    footStyles: { fillColor: [239, 242, 235], textColor: GREEN, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 244] },
    margin: { left: 14, right: 14 },
  });

  // Detail transaksi untuk laporan bulanan dan seluruh periode.
  doc.addPage();
  drawHeader(doc, "Detail Transaksi", `Periode: ${periodLabel}`);

  const statusCounts = new Map<string, number>();
  periodOrders.forEach((order) => {
    const status = (order.status || "STATUS TIDAK TERSEDIA").toUpperCase();
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text("Ringkasan Status Pesanan", 14, 57);

  autoTable(doc, {
    startY: 62,
    head: [["Status", "Jumlah Transaksi"]],
    body: [...statusCounts.entries()].map(([status, count]) => [status, String(count)]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255] },
    margin: { left: 14, right: 14 },
  });

  const statusY = (doc as jsPDF & { lastAutoTable?: { finalY: number } })
    .lastAutoTable?.finalY ?? 80;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...GREEN);
  doc.text("Rincian Pembelian per Transaksi", 14, statusY + 10);

  autoTable(doc, {
    startY: statusY + 14,
    head: [[
      "Tanggal",
      "No. Transaksi",
      "Pembeli / Member",
      "Produk",
      "Nilai Produk",
      "Subsidi Ongkir",
      "Total Bayar",
      "Status",
    ]],
    body: [...periodOrders]
      .sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""))
      .map((order) => [
        order.createdAt || "-",
        order.orderSerial || "-",
        `${order.customerName || "Nama tidak tersedia"}\nID: ${order.memberId || "-"}\nTelp: ${order.phone || "-"}`,
        `${order.sku ? `[${order.sku}] ` : ""}${order.itemsSummary || "Produk tidak tersedia"}`,
        rupiah(Number(order.subtotalProducts || order.grandTotal || 0)),
        rupiah(Number(order.shippingSubsidy || 0)),
        rupiah(Number(order.grandTotal || 0)),
        order.status || "-",
      ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 6.5,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "top",
      textColor: [45, 50, 46],
      lineColor: [220, 225, 220],
      lineWidth: 0.2,
    },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [247, 248, 244] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 22 },
      2: { cellWidth: 35 },
      3: { cellWidth: 37 },
      4: { cellWidth: 22 },
      5: { cellWidth: 20 },
      6: { cellWidth: 22 },
      7: { cellWidth: 19 },
    },
    margin: { left: 10, right: 10, bottom: 18 },
    didDrawPage: () => {
      // Footer halaman akan ditambahkan setelah seluruh tabel selesai.
    },
  });

  // Catatan metodologi dan batasan untuk pembaca laporan.
  doc.addPage();
  drawHeader(doc, "Catatan Management", `Periode: ${periodLabel}`);

  const notes = [
    ["Dasar omzet", "Subtotal produk digunakan jika tersedia. Jika tidak tersedia, grand total digunakan sebagai pengganti."],
    ["Total pembayaran", "Menggunakan grandTotal dari data pesanan. Nilai ini dapat mencakup komponen selain produk."],
    ["HPP dan laba", "HPP memakai asumsi biaya per jenis produk yang ditetapkan di generator. Laba kotor adalah estimasi omzet produk dikurangi estimasi HPP."],
    ["Status pesanan", "Laporan menampilkan transaksi dari semua status. Periksa ringkasan status sebelum menyamakan nilai pesanan dengan penjualan yang sudah selesai."],
    ["Rincian produk", "Produk dan kuantitas diambil dari itemsSummary. Jika satu ringkasan memuat beberapa produk tanpa format yang konsisten, analisis produk dapat mengelompokkan item secara kurang akurat."],
    ["Biaya dan laba bersih", "Laporan ini belum mengurangi seluruh biaya operasional, biaya marketplace, pajak, retur, atau biaya lain yang tidak tersedia di data sumber. Angka laba bukan laba bersih aktual dan bukan laporan audit."],
  ];

  autoTable(doc, {
    startY: 58,
    head: [["Aspek", "Penjelasan"]],
    body: notes,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      valign: "top",
      textColor: [45, 50, 46],
      lineColor: [220, 225, 220],
      lineWidth: 0.2,
    },
    headStyles: { fillColor: GREEN, textColor: [255, 255, 255], fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 38 }, 1: { cellWidth: 142 } },
    margin: { left: 14, right: 14 },
  });

  drawFooter(doc);

  const safePeriod = mode === "all" ? "all-period" : selectedMonth || "monthly";
  doc.save(`VARTANA-Sales-Report-${safePeriod}.pdf`);
}
