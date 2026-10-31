import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type InvoiceOrder = {
  orderSerial: string; customerName: string; phone: string; addressDetail: string;
  itemsSummary: string; subtotalProducts?: number; customerShippingFee?: number;
  grandTotal: number; status: string; createdAt?: string; paymentMethod?: string;
};
export function invoiceAvailable(order: InvoiceOrder) {
  return ["PEMBAYARAN DITERIMA", "PESANAN DISIAPKAN", "DIKIRIM", "SELESAI"].includes(order.status.toUpperCase());
}
export function downloadCustomerInvoice(order: InvoiceOrder) {
  if (!invoiceAvailable(order)) throw new Error("Verifikasi pembayaran terlebih dahulu.");
  const doc = new jsPDF();
  const money = (v: number) => "Rp " + v.toLocaleString("id-ID");
  doc.setFontSize(22); doc.text("VARTANA", 15, 22);
  doc.setFontSize(11); doc.text("NOTA PEMBELIAN | PEMBAYARAN DITERIMA", 15, 32);
  autoTable(doc, { startY: 40, theme: "plain", styles: {fontSize: 10, cellPadding: 3},
    body: [["Nomor pesanan", order.orderSerial], ["Tanggal pesanan", order.createdAt || "-"],
      ["Customer", order.customerName], ["WhatsApp", order.phone], ["Alamat", order.addressDetail],
      ["Metode saat checkout", order.paymentMethod === "qris" ? "QRIS" : order.paymentMethod === "bank_transfer" ? "Transfer BCA" : "Tidak tercatat"],
      ["Rincian produk", order.itemsSummary],
      ["Subtotal produk setelah promo", typeof order.subtotalProducts === "number" ? money(order.subtotalProducts) : "Belum terverifikasi"],
      ["Ongkir customer", typeof order.customerShippingFee === "number" ? money(order.customerShippingFee) : "Belum terverifikasi"],
      ["Total pembayaran", money(order.grandTotal)], ["Status pesanan", order.status],
      ["Terima kasih", "Terima kasih telah memilih VARTANA Botanical Wellness."]],
    columnStyles: {0: {cellWidth: 58}, 1: {cellWidth: 122}},
  });
  doc.save(`Nota-VARTANA-${order.orderSerial.replace(/[^a-z0-9-]/gi, "")}.pdf`);
}
