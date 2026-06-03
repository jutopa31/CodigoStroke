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
import type { MonthlyThrombolysisRow } from "@/lib/queries";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

interface Props {
  data: MonthlyThrombolysisRow[];
}

export default function ThrombolysisChart({ data }: Props) {
  const chartData = data.map((r) => ({
    name: MONTH_LABELS[r.month.slice(5, 7)] ?? r.month,
    "Con trombolisis": r.with_thrombolysis,
    "Sin trombolisis": r.total - r.with_thrombolysis,
    rate: r.rate,
  }));

  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#132B58]">Casos por mes y trombolisis</h3>
        <p className="text-xs text-[#A8B6D6] mt-0.5">Meta de tasa de trombolisis ≥ 80%</p>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-[#A8B6D6] py-12 text-center">Sin datos aún</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#A8B6D6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#A8B6D6" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #F0F0F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, name: any, p: any) =>
                name === "Con trombolisis"
                  ? [`${v} (${p?.payload?.rate ?? 0}%)`, name]
                  : [v, name]
              }
              labelStyle={{ color: "#132B58", fontWeight: 600 }}
            />
            <Legend
              iconType="square"
              iconSize={10}
              wrapperStyle={{ fontSize: 11, color: "#A8B6D6", paddingTop: 8 }}
            />
            <Bar dataKey="Con trombolisis" fill="#244B99" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Sin trombolisis" fill="#A8B6D6" stackId="a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
