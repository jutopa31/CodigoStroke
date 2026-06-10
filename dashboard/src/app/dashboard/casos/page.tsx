import Link from "next/link";
import { getRecentCases } from "@/lib/queries";
import CasesTable from "@/components/dashboard/CasesTable";
import ExportButton from "@/components/dashboard/ExportButton";

interface Props {
  searchParams: Promise<{ page?: string; source?: string; from?: string; to?: string; drug?: string }>;
}

export default async function CasosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const filters = {
    source: params.source,
    from: params.from,
    to: params.to,
    drug: params.drug,
  };

  const { data, count } = await getRecentCases(page, filters);

  return (
    <div className="px-4 py-5 sm:px-8 sm:py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#132B58]">Casos</h1>
          <p className="text-sm text-[#334155] mt-0.5">Registro histórico de eventos ACV</p>
        </div>
        <ExportButton filters={filters} />
      </div>

      {/* Filter bar */}
      <form className="flex flex-wrap gap-2 items-center">
        <select
          name="source"
          defaultValue={params.source ?? ""}
          className="rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-xs text-[#132B58] outline-none focus:border-[#244B99] transition"
        >
          <option value="">Todas las fuentes</option>
          <option value="app">App</option>
          <option value="sheets_import">Google Sheets</option>
          <option value="manual">Manual</option>
        </select>

        <select
          name="drug"
          defaultValue={params.drug ?? ""}
          className="rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-xs text-[#132B58] outline-none focus:border-[#244B99] transition"
        >
          <option value="">Todas las drogas</option>
          <option value="rtpa">rtPA</option>
          <option value="tnk">TNK</option>
        </select>

        <input
          type="date"
          name="from"
          defaultValue={params.from ?? ""}
          className="rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-xs text-[#132B58] outline-none focus:border-[#244B99] transition"
        />
        <input
          type="date"
          name="to"
          defaultValue={params.to ?? ""}
          className="rounded-lg border border-[#F0F0F0] bg-white px-3 py-2 text-xs text-[#132B58] outline-none focus:border-[#244B99] transition"
        />

        <button
          type="submit"
          className="px-4 py-2 text-xs font-medium rounded-lg bg-[#132B58] text-white hover:bg-[#10264F] transition-colors"
        >
          Filtrar
        </button>

        {Object.values(filters).some(Boolean) && (
          <Link
            href="/dashboard/casos"
            className="px-3 py-2 text-xs text-[#334155] hover:text-[#132B58] transition-colors"
          >
            Limpiar
          </Link>
        )}
      </form>

      <CasesTable data={data} count={count} page={page} />
    </div>
  );
}
