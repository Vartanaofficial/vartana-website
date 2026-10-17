"use client";

import { ReactNode } from "react";

type DashboardMetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: ReactNode;
};

export default function DashboardMetricCard({
  title,
  value,
  subtitle,
  icon,
}: DashboardMetricCardProps) {
  return (
    <div className="rounded-2xl border border-[#16382A]/10 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#526158]">
            {title}
          </p>

          <p className="mt-2 font-serif text-2xl font-bold text-[#16382A]">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-[11px] text-[#526158]">
              {subtitle}
            </p>
          )}
        </div>

        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFFDF9] text-base">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
