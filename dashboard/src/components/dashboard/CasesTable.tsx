"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { CaseRow } from "@/lib/queries";

interface Props {
  data: CaseRow[];
  count: number;
  page: number;
}

const PAGE_SIZE = 20;

function dtnColor(min: number | null): string {
  if (min === null) return "text-[#A8B6D6]";
  if (min <= 45) return "text-emerald-600 font-semibold";
  if (min <= 60) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

function SourceBadge({ source }: { source: string | null }) {
  if (source === "sheets_import") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]">
        Sheets
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#132B58]/10 text-[#132B58]">
      App
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "completed") {
    return <span className="text-emerald-600 text-xs font-medium">Completado</span>;
  }
  if (status === "in_progress") {
    return <span className="text-amber-600 text-xs font-medium">En curso</span>;
  }
  return <span className="text-[#A8B6D6] text-xs">{status ?? "—"}</span>;
}

export default function CasesTable({ data, count, page }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(count / PAGE_SIZE);

  function navigate(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F0F2F5] text-xs font-semibold text-[#A8B6D6] uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Alias</th>
              <th className="px-4 py-3 text-center">NIHSS</th>
              <th className="px-4 py-3 text-center">DTN (min)</th>
              <th className="px-4 py-3 text-center">Droga</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-center">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-[#A8B6D6]">
                  Sin registros
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-[#132B58]/[0.03] transition-colors">
                <td className="px-4 py-3 text-[#132B58] tabular-nums">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString("es-AR") : "—"}
                </td>
                <td className="px-4 py-3 text-[#132B58] font-medium">
                  {row.patient_alias ?? <span className="text-[#A8B6D6]">—</span>}
                </td>
                <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                  {row.nihss_score ?? <span className="text-[#A8B6D6]">—</span>}
                </td>
                <td className={`px-4 py-3 text-center tabular-nums ${dtnColor(row.door_to_needle_min)}`}>
                  {row.door_to_needle_min ?? <span className="text-[#A8B6D6] font-normal">—</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.drug_used ? (
                    <span className="uppercase text-xs font-semibold text-[#132B58]">
                      {row.drug_used}
                    </span>
                  ) : (
                    <span className="text-[#A8B6D6]">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={row.form_status} />
                </td>
                <td className="px-4 py-3 text-center">
                  <SourceBadge source={row.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F0F0]">
          <p className="text-xs text-[#A8B6D6]">
            {count} resultados · página {page} de {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => navigate(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#F0F0F0] text-[#132B58] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => navigate(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#F0F0F0] text-[#132B58] hover:bg-[#F0F2F5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
