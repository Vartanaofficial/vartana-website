"use client";

type AdminHeaderProps = {
  activeMenuTab: "omset" | "profit";
  setActiveMenuTab: (tab: "omset" | "profit") => void;
  onRefresh: () => void;
  onLogout: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
};

export default function AdminHeader({ activeMenuTab, setActiveMenuTab, onRefresh, onLogout, onExportCurrent, onExportAll }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#B69245]/20 pb-4 gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <h1 className="font-serif text-xl md:text-3xl font-bold text-[#16382A]">Monitoring & Operations</h1>
        </div>

        <p className="text-[11px] md:text-xs text-[#526158] mt-0.5">VARTANA Botanical Wellness — Financial Intelligence</p>
      </div>

      <div className="flex bg-[#FFFDF9] p-1 rounded-2xl border border-[#16382A]/15 shadow-xs">
        <button
          onClick={() => setActiveMenuTab("omset")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeMenuTab === "omset" ? "bg-[#16382A] text-white shadow-xs" : "text-[#526158] hover:text-[#16382A]"}`}
        >
          📊 1. Omset & Pendapatan
        </button>

        <button
          onClick={() => setActiveMenuTab("profit")}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeMenuTab === "profit" ? "bg-[#16382A] text-white shadow-xs" : "text-[#526158] hover:text-[#16382A]"}`}
        >
          💰 2. Profit & P&L Closing
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeMenuTab === "omset" && (
          <>
            <button
              onClick={onExportCurrent}
              className="flex items-center justify-center gap-1.5 rounded-full border border-emerald-700 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-700 hover:text-white transition shadow-xs"
            >
              📊 Export Filter (.CSV)
            </button>

            <button
              onClick={onExportAll}
              className="flex items-center justify-center gap-1.5 rounded-full border border-[#B69245] bg-[#FFFDF9] px-3 py-2 text-xs font-bold text-[#8E6E2E] hover:bg-[#B69245] hover:text-white transition shadow-xs"
            >
              🗃️ Export All Master
            </button>
          </>
        )}

        <button onClick={onRefresh} className="rounded-full border border-[#16382A]/20 bg-white px-3 py-2 text-xs font-bold text-[#16382A] hover:bg-[#16382A] hover:text-white transition">
          🔄 Refresh
        </button>

        <button onClick={onLogout} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition">
          🔒 Logout
        </button>
      </div>
    </div>
  );
}
