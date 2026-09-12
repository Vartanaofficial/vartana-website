"use client";

type OrderRow = {
  orderSerial: string;
  customerName: string;
  grandTotal: number;
  status: string;
  sku?: string;
  createdAt?: string;
};

type OperationsOrdersProps = {
  orders: OrderRow[];
  formatRupiah: (value: number) => string;
};

function getStatusClass(status: string) {
  const value = status.toUpperCase();

  if (value.includes("SELESAI")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value.includes("KIRIM")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (value.includes("SIAP") || value.includes("PROSES")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function OperationsOrders({
  orders,
  formatRupiah,
}: OperationsOrdersProps) {
  return (
    <section className="rounded-3xl border border-[#16382A]/10 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#16382A]/10 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8E6E2E]">
          Live Order Queue
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="font-serif text-xl font-bold text-[#16382A]">
            Pesanan Terbaru
          </h2>

          <span className="text-xs text-[#526158]">
            {orders.length} order
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-[#FFFDF9]">
            <tr className="border-b border-[#16382A]/10">
              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                Order
              </th>

              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                Customer
              </th>

              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                SKU
              </th>

              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                Amount
              </th>

              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                Status
              </th>

              <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-sm text-[#526158]"
                >
                  Belum ada data order.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.orderSerial}
                  className="border-b border-[#16382A]/5 last:border-0 hover:bg-[#FFFDF9]/70"
                >
                  <td className="px-5 py-4 text-xs font-bold text-[#16382A]">
                    {order.orderSerial}
                  </td>

                  <td className="px-5 py-4 text-xs text-[#526158]">
                    {order.customerName || "-"}
                  </td>

                  <td className="px-5 py-4 text-xs font-semibold text-[#526158]">
                    {order.sku || "-"}
                  </td>

                  <td className="px-5 py-4 text-xs font-bold text-[#16382A]">
                    {formatRupiah(order.grandTotal || 0)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status || "UNKNOWN"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-[11px] text-[#526158]">
                    {order.createdAt || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
