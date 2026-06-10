"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const NAV = [
  {
    href: "/dashboard",
    label: "Resumen",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V19a1 1 0 001 1h6v-6H3zm0 0V8a1 1 0 011-1h4.5M21 13.5V19a1 1 0 01-1 1h-6v-6h7zm0 0V8a1 1 0 00-1-1h-4.5M10.5 4h3M12 4v16" />
      </svg>
    ),
  },
  {
    href: "/dashboard/casos",
    label: "Casos",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l2 2h3a2 2 0 012 2v12a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Sidebar({
  userName,
  className = "",
  onNavigate,
}: {
  userName?: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    onNavigate?.();
    await supabase?.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className={`w-60 shrink-0 flex flex-col h-full bg-[#10264F] ${className}`}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-[#29416D]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-700 text-white text-xs font-black tracking-tight">ACV</span>
          <div>
            <p className="text-white text-sm font-bold leading-tight">Código Stroke</p>
            <p className="text-[#A8B6D6] text-[11px] leading-tight">Analytics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#244B99] text-white"
                  : "text-[#A8B6D6] hover:text-white hover:bg-[#29416D]"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User / logout */}
      <div className="px-3 pb-5 border-t border-[#29416D] pt-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#244B99] text-white text-xs font-semibold uppercase">
            {userName?.charAt(0) ?? "A"}
          </span>
          <span className="text-[#A8B6D6] text-xs truncate flex-1">{userName ?? "Admin"}</span>
          <button
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="text-[#A8B6D6] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
