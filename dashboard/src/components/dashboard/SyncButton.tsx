"use client";

import { useState } from "react";

export default function SyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  async function handleSync() {
    setStatus("loading");
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      setStatus(res.ok ? "ok" : "error");
    } catch {
      setStatus("error");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={status === "loading"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
        status === "ok"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : status === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-[#132B58] text-white hover:bg-[#10264F]"
      }`}
    >
      {status === "loading" ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sincronizando…
        </>
      ) : status === "ok" ? (
        <>✓ Sincronizado</>
      ) : status === "error" ? (
        <>✗ Error</>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0115.93-2.07M20 15a9 9 0 01-15.93 2.07" />
          </svg>
          Sync Sheets
        </>
      )}
    </button>
  );
}
