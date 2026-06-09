"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MrsDistributionRow } from "@/lib/queries";

interface Props {
  data: MrsDistributionRow[];
}

export default function MrsShiftChart({ data }: Props) {
  const chartData = data.map((r) => ({
    name: `mRS ${r.score}`,
    Basal: r.baseline,
    "90 días": r.at90d,
  }));

  const hasData = data.some((r) => r.baseline > 0 || r.at90d > 0);

  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#132B58]">Funcionalidad: basal vs 90 días</h3>
        <p className="text-xs text-[#334155] mt-0.5">Escala de Rankin modificada · 0-2 = independencia</p>
      </div>
      {!hasData ? (
        <p className="text-sm text-[#334155] py-12 text-center">Sin datos aún</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #F0F0F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              labelStyle={{ color: "#132B58", fontWeight: 600 }}
            />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, color: "#475569", paddingTop: 8 }} />
            <Bar dataKey="Basal" fill="#A8B6D6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="90 días" fill="#244B99" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
