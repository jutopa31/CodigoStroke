"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { MonthlyDtnRow } from "@/lib/queries";

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Ago",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
};

function formatMonth(yyyymm: string) {
  const [, mm] = yyyymm.split("-");
  return MONTH_LABELS[mm] ?? yyyymm;
}

interface Props {
  data: MonthlyDtnRow[];
}

export default function DoorToNeedleChart({ data }: Props) {
  const chartData = data.map((r) => ({
    name: formatMonth(r.month),
    dtn: r.avg_dtn,
    n: r.count,
  }));

  return (
    <div className="bg-white rounded-xl border border-[#F0F0F0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#132B58]">Puerta-Aguja promedio (min)</h3>
        <p className="text-xs text-[#A8B6D6] mt-0.5">Meta ≤ 45 min · límite ≤ 60 min</p>
      </div>
      {chartData.length === 0 ? (
        <p className="text-sm text-[#A8B6D6] py-12 text-center">Sin datos aún</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#A8B6D6" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#A8B6D6" }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #F0F0F0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, _: any, p: any) => [`${v} min (n=${p?.payload?.n ?? ""})`, "DTN avg"]}
              labelStyle={{ color: "#132B58", fontWeight: 600 }}
            />
            <ReferenceLine y={45} stroke="#D97706" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: "Meta 45", position: "insideTopRight", fontSize: 10, fill: "#D97706" }}
            />
            <ReferenceLine y={60} stroke="#DC2626" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: "Límite 60", position: "insideTopRight", fontSize: 10, fill: "#DC2626" }}
            />
            <Line
              type="monotone"
              dataKey="dtn"
              stroke="#244B99"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#244B99", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
