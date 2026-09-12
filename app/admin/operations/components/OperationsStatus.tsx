"use client";

type OperationsStatusProps = {
  pending: number;
  processing: number;
  shipped: number;
  completed: number;
};

const statusItems = [
  {
    key: "pending",
    label: "Pending Payment",
    icon: "🟡",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "🔵",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
  },
  {
    key: "completed",
    label: "Completed",
    icon: "🟢",
  },
] as const;

export default function OperationsStatus({
  pending,
  processing,
  shipped,
  completed,
}: OperationsStatusProps) {
  const values = {
    pending,
    processing,
    shipped,
    completed,
  };

  return (
    <section className="rounded-3xl border border-[#B69245]/20 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8E6E2E]">
          Order Status Overview
        </p>

        <h2 className="mt-1 font-serif text-xl font-bold text-[#16382A]">
          Kondisi Pesanan Saat Ini
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statusItems.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-[#16382A]/10 bg-[#FFFDF9] p-4"
          >
            <div className="text-lg">{item.icon}</div>

            <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-[#526158]">
              {item.label}
            </p>

            <p className="mt-1 font-serif text-2xl font-bold text-[#16382A]">
              {values[item.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
