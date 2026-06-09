"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { type StrokeCase, DRUG_LABEL, deriveTimes, isFavorableMrs } from "@/lib/types";

interface Props {
  data: StrokeCase[];
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

function SourceBadge({ source }: { source: string }) {
  if (source === "sheets_import") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#92400E] border border-[#FCD34D]">
        Sheets
      </span>
    );
  }
  if (source === "manual") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F0F2F5] text-[#475569]">
        Manual
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#132B58]/10 text-[#132B58]">
      App
    </span>
  );
}

function MrsPill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[#A8B6D6]">—</span>;
  const favorable = isFavorableMrs(score as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  return (
    <span
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
        score === 6
          ? "bg-[#132B58] text-white"
          : favorable
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {score}
    </span>
  );
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
        <table className="w-full min-w-[880px] text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-[#F0F2F5] text-xs font-semibold text-[#A8B6D6] uppercase tracking-wide">
              <th className="px-4 py-3 text-left sticky left-0 z-10 bg-[#F0F2F5]">Fecha</th>
              <th className="px-4 py-3 text-left">Alias</th>
              <th className="px-4 py-3 text-center">Edad/Sexo</th>
              <th className="px-4 py-3 text-center">NIHSS</th>
              <th className="px-4 py-3 text-center">DTN (min)</th>
              <th className="px-4 py-3 text-center">Droga</th>
              <th className="px-4 py-3 text-center">mRS 90d</th>
              <th className="px-4 py-3 text-center">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {data.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-sm text-[#A8B6D6]">
                  Sin registros
                </td>
              </tr>
            )}
            {data.map((row) => {
              const dtn = deriveTimes(row).doorToNeedleMin;
              return (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/dashboard/casos/${row.id}`)}
                  className="bg-white hover:bg-[#EEF1F6] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-[#132B58] tabular-nums sticky left-0 z-10 bg-inherit">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#132B58] font-medium">
                    {row.patientAlias ?? <span className="text-[#A8B6D6]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.age ? `${row.age} ${row.sex ?? ""}`.trim() : <span className="text-[#A8B6D6]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.nihssScore ?? <span className="text-[#A8B6D6]">—</span>}
                  </td>
                  <td className={`px-4 py-3 text-center tabular-nums ${dtnColor(dtn)}`}>
                    {dtn ?? <span className="text-[#A8B6D6] font-normal">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.drugUsed ? (
                      <span className="uppercase text-xs font-semibold text-[#132B58]">{DRUG_LABEL[row.drugUsed]}</span>
                    ) : (
                      <span className="text-[#A8B6D6]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <MrsPill score={row.mrs90d} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <SourceBadge source={row.source} />
                  </td>
                </tr>
              );
            })}
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
