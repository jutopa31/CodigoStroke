"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  userName,
  children,
}: {
  userName?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden">
      {/* Sidebar fijo (desktop) */}
      <Sidebar userName={userName} className="hidden md:flex" />

      {/* Drawer deslizable (mobile) */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 transition-transform duration-200 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar userName={userName} onNavigate={() => setOpen(false)} />
        </div>
      </div>

      {/* Columna de contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 h-14 px-4 bg-[#10264F] text-white shrink-0">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            className="-ml-1 p-1.5 rounded-lg text-[#A8B6D6] hover:text-white hover:bg-[#29416D] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-700 text-white text-[11px] font-black tracking-tight">
            ACV
          </span>
          <span className="text-sm font-bold">Código Stroke</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
