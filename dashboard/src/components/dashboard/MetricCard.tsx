type Status = "ok" | "warning" | "alert" | "neutral";

interface MetricCardProps {
  label: string;
  value: string | number | null;
  unit?: string;
  status?: Status;
  delta?: string;
  deltaPositive?: boolean;
  subtitle?: string;
}

const STATUS_BORDER: Record<Status, string> = {
  ok: "border-l-[#059669]",
  warning: "border-l-[#D97706]",
  alert: "border-l-[#DC2626]",
  neutral: "border-l-[#244B99]",
};

const STATUS_VALUE: Record<Status, string> = {
  ok: "text-[#059669]",
  warning: "text-[#D97706]",
  alert: "text-[#DC2626]",
  neutral: "text-[#132B58]",
};

export default function MetricCard({
  label,
  value,
  unit,
  status = "neutral",
  delta,
  deltaPositive,
  subtitle,
}: MetricCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border-l-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] pl-5 pr-4 py-4 flex flex-col gap-1.5 ${STATUS_BORDER[status]}`}
    >
      <p className="text-xs font-medium text-[#A8B6D6] uppercase tracking-wide">{label}</p>
      <div className="flex items-end gap-1.5">
        <span className={`text-4xl font-bold tabular-nums leading-none ${STATUS_VALUE[status]}`}>
          {value ?? "—"}
        </span>
        {unit && (
          <span className="text-sm text-[#A8B6D6] mb-1">{unit}</span>
        )}
      </div>
      {(delta || subtitle) && (
        <div className="flex items-center gap-1 mt-0.5">
          {delta && (
            <span
              className={`text-xs font-medium ${
                deltaPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {deltaPositive ? "▲" : "▼"} {delta}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-[#A8B6D6]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
