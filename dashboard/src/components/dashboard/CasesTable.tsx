"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  type StrokeCase,
  type LvoSite,
  DRUG_LABEL,
  TOAST_SHORT,
  LVO_SITE_SHORT,
  LVO_SITE_LABEL,
  DESTINATION_LABEL,
  deriveTimes,
  isFavorableMrs,
} from "@/lib/types";

interface Props {
  data: StrokeCase[];
  count: number;
  page: number;
}

const PAGE_SIZE = 20;

function dtnColor(min: number | null): string {
  if (min === null) return "text-[#334155]";
  if (min <= 45) return "text-emerald-600 font-semibold";
  if (min <= 60) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

function dtcColor(min: number | null): string {
  if (min === null) return "text-[#334155]";
  if (min <= 25) return "text-emerald-600 font-semibold";
  if (min <= 45) return "text-amber-600 font-semibold";
  return "text-red-600 font-semibold";
}

const dash = <span className="text-[#334155] font-normal">—</span>;

function onsetCell(c: StrokeCase) {
  if (c.isWakeUpStroke)
    return <span className="text-[#92400E] text-xs font-medium">Wake-up</span>;
  if (!c.symptomOnset) return dash;
  return (
    <span className="tabular-nums text-[#132B58]">
      {new Date(c.symptomOnset).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}
    </span>
  );
}

function LvoCell({ has, site }: { has: boolean | null; site: LvoSite | null }) {
  if (has === null) return dash;
  if (!has) return <span className="text-[#334155]">No</span>;
  return (
    <span
      title={site ? LVO_SITE_LABEL[site] : "Oclusión de gran vaso"}
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-700"
    >
      {site ? LVO_SITE_SHORT[site] : "Sí"}
    </span>
  );
}

function YesNo({ value }: { value: boolean | null }) {
  if (value === null) return dash;
  return value ? (
    <span className="text-[#132B58] font-semibold">Sí</span>
  ) : (
    <span className="text-[#334155]">No</span>
  );
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
  if (score === null) return dash;
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

const COL_COUNT = 17;

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
        <table className="w-full min-w-[1500px] text-sm whitespace-nowrap">
          <thead>
            <tr className="bg-[#F0F2F5] text-xs font-semibold text-[#334155] uppercase tracking-wide">
              <th className="px-4 py-3 text-left sticky left-0 z-10 bg-[#F0F2F5]">Fecha</th>
              <th className="px-4 py-3 text-left">Alias</th>
              <th className="px-4 py-3 text-center">Edad/Sexo</th>
              <th className="px-4 py-3 text-center">Inicio</th>
              <th className="px-4 py-3 text-center">NIHSS</th>
              <th className="px-4 py-3 text-center">ASPECTS</th>
              <th className="px-4 py-3 text-center">OGV</th>
              <th className="px-4 py-3 text-center">Puerta-TC</th>
              <th className="px-4 py-3 text-center">DTN</th>
              <th className="px-4 py-3 text-center">Droga</th>
              <th className="px-4 py-3 text-center">Trombect.</th>
              <th className="px-4 py-3 text-center">TOAST</th>
              <th className="px-4 py-3 text-center">mRS basal</th>
              <th className="px-4 py-3 text-center">mRS 90d</th>
              <th className="px-4 py-3 text-center">Días int.</th>
              <th className="px-4 py-3 text-left">Destino</th>
              <th className="px-4 py-3 text-center">Fuente</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0F0]">
            {data.length === 0 && (
              <tr>
                <td colSpan={COL_COUNT} className="py-12 text-center text-sm text-[#334155]">
                  Sin registros
                </td>
              </tr>
            )}
            {data.map((row) => {
              const t = deriveTimes(row);
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
                    {row.patientAlias ?? dash}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.age ? `${row.age} ${row.sex ?? ""}`.trim() : dash}
                  </td>
                  <td className="px-4 py-3 text-center">{onsetCell(row)}</td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.nihssScore ?? dash}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.aspectsScore ?? dash}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <LvoCell has={row.hasLvo} site={row.lvoSite} />
                  </td>
                  <td className={`px-4 py-3 text-center tabular-nums ${dtcColor(t.doorToCtMin)}`}>
                    {t.doorToCtMin ?? dash}
                  </td>
                  <td className={`px-4 py-3 text-center tabular-nums ${dtnColor(t.doorToNeedleMin)}`}>
                    {t.doorToNeedleMin ?? dash}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.drugUsed ? (
                      <span className="uppercase text-xs font-semibold text-[#132B58]">{DRUG_LABEL[row.drugUsed]}</span>
                    ) : (
                      dash
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <YesNo value={row.thrombectomyDone} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.toastEtiology ? (
                      <span className="text-xs text-[#475569]">{TOAST_SHORT[row.toastEtiology]}</span>
                    ) : (
                      dash
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <MrsPill score={row.mrsBaseline} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <MrsPill score={row.mrs90d} />
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums text-[#132B58]">
                    {row.lengthOfStayDays ?? dash}
                  </td>
                  <td className="px-4 py-3 text-left text-xs text-[#475569]">
                    {row.dischargeDestination ? DESTINATION_LABEL[row.dischargeDestination] : dash}
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
          <p className="text-xs text-[#334155]">
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
