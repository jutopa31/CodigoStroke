import type { CaseFilters } from "@/lib/queries";

/** Construye el link de descarga de CSV preservando los filtros activos. */
export default function ExportButton({ filters }: { filters: CaseFilters }) {
  const qs = new URLSearchParams();
  if (filters.source) qs.set("source", filters.source);
  if (filters.drug) qs.set("drug", filters.drug);
  if (filters.from) qs.set("from", filters.from);
  if (filters.to) qs.set("to", filters.to);
  const href = `/api/export${qs.toString() ? `?${qs.toString()}` : ""}`;

  return (
    <a
      href={href}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#132B58] text-white hover:bg-[#10264F] transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
      </svg>
      Exportar CSV
    </a>
  );
}
