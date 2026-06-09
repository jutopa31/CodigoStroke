import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseById } from "@/lib/queries";
import { deriveTimes, DRUG_LABEL, SOURCE_LABEL } from "@/lib/types";
import RetrospectiveForm from "@/components/dashboard/RetrospectiveForm";

interface Props {
  params: Promise<{ id: string }>;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[#132B58] font-medium mt-0.5">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <h3 className="text-sm font-semibold text-[#132B58] mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Interval({ label, min, ok, warn }: { label: string; min: number | null; ok: number; warn: number }) {
  const color =
    min === null ? "text-[#334155]" : min <= ok ? "text-emerald-600" : min <= warn ? "text-amber-600" : "text-red-600";
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-[#F0F0F0] last:border-0">
      <span className="text-sm text-[#475569]">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${color}`}>{min === null ? "—" : `${min} min`}</span>
    </div>
  );
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const c = await getCaseById(id);
  if (!c) notFound();

  const d = deriveTimes(c);

  return (
    <div className="px-8 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <Link href="/dashboard/casos" className="text-xs text-[#334155] hover:text-[#132B58] transition-colors">
          ← Volver a casos
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <h1 className="text-xl font-bold text-[#132B58]">{c.patientAlias ?? "Caso sin alias"}</h1>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#132B58]/10 text-[#132B58]">
            {SOURCE_LABEL[c.source]}
          </span>
          {c.formStatus === "in_progress" && (
            <span className="text-amber-600 text-xs font-medium">En curso</span>
          )}
        </div>
        <p className="text-sm text-[#334155] mt-0.5">{fmtTime(c.createdAt)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Presentación">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="NIHSS" value={c.nihssScore ?? "—"} />
            <Stat label="ASPECTS" value={c.aspectsScore ?? "—"} />
            <Stat label="Wake-up" value={c.isWakeUpStroke === null ? "—" : c.isWakeUpStroke ? "Sí" : "No"} />
            <Stat label="Edad" value={c.age ?? "—"} />
            <Stat label="Sexo" value={c.sex ?? "—"} />
            <Stat label="Hemorragia TC" value={c.hasBleeding === null ? "—" : c.hasBleeding ? "Sí" : "No"} />
          </div>
        </Card>

        <Card title="Tratamiento">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Trombólisis" value={c.thrombolysisGiven === null ? "—" : c.thrombolysisGiven ? "Sí" : "No"} />
            <Stat label="Droga" value={c.drugUsed ? DRUG_LABEL[c.drugUsed] : "—"} />
            <Stat label="Trombectomía" value={c.thrombectomyDone === null ? "—" : c.thrombectomyDone ? "Sí" : "No"} />
          </div>
        </Card>

        <Card title="Tiempos del protocolo">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <Stat label="Inicio síntomas" value={fmtTime(c.symptomOnset)} />
            <Stat label="Arribo (puerta)" value={fmtTime(c.doorTime)} />
            <Stat label="Pedido TC" value={fmtTime(c.ctRequestTime)} />
            <Stat label="Inicio trombolítico" value={fmtTime(c.thrombolyticStart)} />
            <Stat label="Pedido angio" value={fmtTime(c.angioRequestTime)} />
            <Stat label="Activación TME" value={fmtTime(c.thrombectomyActivation)} />
          </div>
        </Card>

        <Card title="Intervalos derivados">
          <Interval label="Puerta-aguja (DTN)" min={d.doorToNeedleMin} ok={45} warn={60} />
          <Interval label="Inicio-aguja" min={d.onsetToNeedleMin} ok={150} warn={270} />
          <Interval label="Puerta-TC" min={d.doorToCtMin} ok={25} warn={45} />
          <Interval label="Puerta-punción" min={d.doorToGroinMin} ok={90} warn={120} />
        </Card>
      </div>

      {/* Outcomes retrospectivos */}
      <Card title="Outcomes (carga retrospectiva)">
        <p className="text-xs text-[#334155] -mt-2 mb-4">
          Datos que exceden a la app del momento agudo. Se cargan desde la historia clínica.
        </p>
        <RetrospectiveForm c={c} />
      </Card>
    </div>
  );
}
