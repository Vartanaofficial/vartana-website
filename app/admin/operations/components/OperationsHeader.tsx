"use client";

type OperationsHeaderProps = {
  onRefresh: () => void;
  loading: boolean;
};

export default function OperationsHeader({
  onRefresh,
  loading,
}: OperationsHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#B69245]/20 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />

          <h1 className="font-serif text-2xl md:text-4xl font-bold text-[#16382A]">
            Operations Monitoring
          </h1>
        </div>

        <p className="mt-1 text-xs md:text-sm text-[#526158]">
          VARTANA Botanical Wellness — Business Operations Center
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="/admin/dashboard"
          className="rounded-full border border-[#16382A]/15 bg-white px-4 py-2 text-xs font-bold text-[#16382A] transition hover:bg-[#16382A] hover:text-white"
        >
          ← Dashboard Lama
        </a>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full border border-[#B69245] bg-[#FFFDF9] px-4 py-2 text-xs font-bold text-[#8E6E2E] transition hover:bg-[#B69245] hover:text-white disabled:opacity-50"
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh Data"}
        </button>
      </div>
    </header>
  );
}
