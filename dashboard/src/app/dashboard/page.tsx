import {
  getQualityMetrics,
  getDtnByMonth,
  getThrombolysisByMonth,
  getMrsDistribution,
} from "@/lib/queries";
import MetricCard from "@/components/dashboard/MetricCard";
import DoorToNeedleChart from "@/components/dashboard/DoorToNeedleChart";
import ThrombolysisChart from "@/components/dashboard/ThrombolysisChart";
import MrsShiftChart from "@/components/dashboard/MrsShiftChart";
import SyncButton from "@/components/dashboard/SyncButton";

type Status = "ok" | "warning" | "alert" | "neutral";

function band(value: number | null, ok: number, warn: number, higherIsBetter = true): Status {
  if (value === null) return "neutral";
  if (higherIsBetter) {
    if (value >= ok) return "ok";
    if (value >= warn) return "warning";
    return "alert";
  }
  if (value <= ok) return "ok";
  if (value <= warn) return "warning";
  return "alert";
}

export default async function DashboardPage() {
  const [m, dtnData, thrombolysisData, mrsData] = await Promise.all([
    getQualityMetrics(),
    getDtnByMonth(),
    getThrombolysisByMonth(),
    getMrsDistribution(),
  ]);

  return (
    <div className="px-4 py-5 sm:px-8 sm:py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#132B58]">Resumen</h1>
          <p className="text-sm text-[#334155] mt-0.5">
            Métricas de calidad asistencial · ACV isquémico
          </p>
        </div>
        <SyncButton />
      </div>

      {/* Métricas de proceso */}
      <div>
        <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-2">Proceso</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard label="DTN promedio" value={m.avgDtn} unit="min" status={band(m.avgDtn, 45, 60, false)} subtitle="puerta-aguja" />
          <MetricCard label="DTN ≤ 60 min" value={m.pctDtnUnder60} unit="%" status={band(m.pctDtnUnder60, 75, 50)} subtitle="meta GWTG ≥75%" />
          <MetricCard label="Puerta-TC" value={m.avgDoorToCt} unit="min" status={band(m.avgDoorToCt, 25, 45, false)} subtitle="meta ≤25 min" />
          <MetricCard label="Casos este mes" value={m.casesThisMonth} status="neutral" subtitle={`${m.totalCases} histórico`} />
        </div>
      </div>

      {/* Métricas de tratamiento y resultado */}
      <div>
        <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-2">Tratamiento y resultado</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard label="Tasa trombólisis" value={m.thrombolysisRate} unit="%" status={band(m.thrombolysisRate, 80, 60)} subtitle="casos completados" />
          <MetricCard label="Tasa trombectomía" value={m.thrombectomyRate} unit="%" status="neutral" subtitle="casos completados" />
          <MetricCard label="mRS 0-2 a 90d" value={m.mrs90FavorableRate} unit="%" status={band(m.mrs90FavorableRate, 50, 35)} subtitle="independencia funcional" />
          <MetricCard label="Mortalidad 90d" value={m.mortality90Rate} unit="%" status={band(m.mortality90Rate, 15, 25, false)} subtitle="casos con seguimiento" />
        </div>
      </div>

      {/* Seguridad */}
      <div>
        <p className="text-[11px] font-semibold text-[#334155] uppercase tracking-wider mb-2">Seguridad</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard label="sICH" value={m.sichRate} unit="%" status={band(m.sichRate, 6, 9, false)} subtitle="hemorragia sintomática (SITS)" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DoorToNeedleChart data={dtnData} />
        <ThrombolysisChart data={thrombolysisData} />
        <MrsShiftChart data={mrsData} />
      </div>
    </div>
  );
}
