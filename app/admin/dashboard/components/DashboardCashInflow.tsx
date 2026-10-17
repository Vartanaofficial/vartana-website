"use client";

type DashboardCashInflowProps = {
  totalOrdersCount: number;
  grossTotal: number;
  aov: number;
  netSalesTotal: number;
  formatRupiah: (amount: number) => string;
};

export default function DashboardCashInflow({
  totalOrdersCount,
  grossTotal,
  aov,
  netSalesTotal,
  formatRupiah,
}: DashboardCashInflowProps) {
  return (
    <div className="rounded-2xl md:rounded-3xl border border-[#B69245]/30 bg-gradient-to-br from-[#16382A] to-[#0D261C] p-4 md:p-6 text-white shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start">
          <span className="rounded-full bg-[#B69245]/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest text-[#B69245] border border-[#B69245]/30">
            TOTAL CASH INFLOW (BCA)
          </span>

          <span className="text-[10px] text-emerald-300 font-bold">
            {totalOrdersCount} Trx
          </span>
        </div>

        <h2 className="font-serif text-2xl md:text-3xl font-bold mt-2 text-[#F6F2E8]">
          {formatRupiah(grossTotal)}
        </h2>

        <p className="text-[10px] text-white/70 mt-0.5">
          Pemasukan Bersih Transfer Customer
        </p>
      </div>

      <div className="mt-4 border-t border-white/10 pt-3 flex justify-between text-[11px] text-white/80">
        <span>
          Rata-Rata: <strong>{formatRupiah(aov)}</strong>/Trx
        </span>

        <span>
          Net Product: <strong>{formatRupiah(netSalesTotal)}</strong>
        </span>
      </div>
    </div>
  );
}
