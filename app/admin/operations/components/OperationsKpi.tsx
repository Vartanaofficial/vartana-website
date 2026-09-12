"use client";

type OperationsKpiProps = {
  label: string;
  value: string;
  helper: string;
  icon: string;
};

export default function OperationsKpi({
  label,
  value,
  helper,
  icon,
}: OperationsKpiProps) {
  return (
    <div className="rounded-3xl border border-[#16382A]/10 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#526158]">
            {label}
          </p>

          <p className="mt-2 font-serif text-2xl md:text-3xl font-bold text-[#16382A]">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-[#526158]">
            {helper}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#16382A]/5 text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}
