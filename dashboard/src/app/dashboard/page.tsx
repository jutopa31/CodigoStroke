import {
  getSummaryStats,
  getDoorToNeedleByMonth,
  getThrombolysisRateByMonth,
} from "@/lib/queries";
import MetricCard from "@/components/dashboard/MetricCard";
import DoorToNeedleChart from "@/components/dashboard/DoorToNeedleChart";
import ThrombolysisChart from "@/components/dashboard/ThrombolysisChart";
import SyncButton from "@/components/dashboard/SyncButton";

function dtnStatus(avg: number | null): "ok" | "warning" | "alert" | "neutral" {
  if (avg === null) return "neutral";
  if (avg <= 45) return "ok";
  if (avg <= 60) return "warning";
  return "alert";
}

function thrombolysisStatus(rate: number | null): "ok" | "warning" | "alert" | "neutral" {
  if (rate === null) return "neutral";
  if (rate >= 80) return "ok";
  if (rate >= 60) return "warning";
  return "alert";
}

export default async function DashboardPage() {
  const [stats, dtnData, thrombolysisData] = await Promise.all([
    getSummaryStats(),
    getDoorToNeedleByMonth(),
    getThrombolysisRateByMonth(),
  ]);

  return (
    <div className="px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#132B58]">Resumen</h1>
          <p className="text-sm text-[#A8B6D6] mt-0.5">
            Métricas de calidad asistencial · ACV isquémico
          </p>
        </div>
        <SyncButton />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="DTN promedio"
          value={stats.avgDtn}
          unit="min"
          status={dtnStatus(stats.avgDtn)}
          subtitle="puerta-aguja"
        />
        <MetricCard
          label="Tasa de trombolisis"
          value={stats.thrombolysisRate}
          unit="%"
          status={thrombolysisStatus(stats.thrombolysisRate)}
          subtitle="casos completados"
        />
        <MetricCard
          label="Casos este mes"
          value={stats.casesThisMonth}
          status="neutral"
          subtitle="completados"
        />
        <MetricCard
          label="Total de casos"
          value={stats.totalCases}
          status="neutral"
          subtitle="histórico"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DoorToNeedleChart data={dtnData} />
        <ThrombolysisChart data={thrombolysisData} />
      </div>
    </div>
  );
}
