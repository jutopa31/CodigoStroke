import { Activity, Brain, Clock3, UserRound } from 'lucide-react'

function Metric({ label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-stroke-text',
    warning: 'text-status-warning',
    critical: 'text-status-critical',
    success: 'text-emerald-700',
  }
  return (
    <div className="rounded-xl bg-stroke-surfaceMuted px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted">{label}</p>
      <p className={`mt-1 font-mono text-sm font-bold tabular-nums ${tones[tone]}`}>{value}</p>
    </div>
  )
}

export default function ClinicalSummary({
  patient,
  patientId,
  symptoms,
  latestNihss,
  latestVitals,
  latestGlucose,
  ctResult,
}) {
  const timeLabel = symptoms?.lastSeenNormal
    ? new Date(symptoms.lastSeenNormal).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
    : 'Pendiente'

  const imaging = ctResult?.bleeding === true
    ? 'Hemorragia'
    : ctResult?.bleeding === false
      ? 'Sin sangrado'
      : ctResult?.mismatch === true
        ? 'Mismatch +'
        : ctResult?.mismatch === false
          ? 'Mismatch −'
          : 'Pendiente'

  return (
    <aside className="rounded-2xl border border-stroke-line bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-stroke-line px-4 py-3">
        <Activity size={15} className="text-clinical-700" />
        <h2 className="text-sm font-bold text-stroke-text">Resumen clínico</h2>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-clinical-50 text-clinical-700">
            <UserRound size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stroke-text">{patient?.name || 'Paciente pendiente'}</p>
            <p className="text-xs text-stroke-textMuted">
              {patient ? `DNI ${patient.dni}${patientId ? ` · ${patientId}` : ''}` : 'Cargá identificación y signos vitales'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric label="Último normal" value={timeLabel} />
          <Metric label="NIHSS" value={latestNihss ?? '—'} tone={latestNihss >= 21 ? 'critical' : latestNihss >= 5 ? 'warning' : 'neutral'} />
          <Metric
            label="TA"
            value={latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '—'}
            tone={latestVitals?.systolic > 185 ? 'critical' : 'neutral'}
          />
          <Metric
            label="Glucemia"
            value={latestGlucose ?? '—'}
            tone={latestGlucose !== null && latestGlucose !== undefined && (latestGlucose < 50 || latestGlucose > 400) ? 'critical' : 'neutral'}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-stroke-line px-3 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium text-stroke-textMuted">
            <Clock3 size={14} /> Ventana
          </span>
          <span className="text-xs font-semibold text-stroke-text">{timeLabel}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-stroke-line px-3 py-2.5">
          <span className="flex items-center gap-2 text-xs font-medium text-stroke-textMuted">
            <Brain size={14} /> Imagen
          </span>
          <span className={`text-xs font-semibold ${ctResult?.bleeding ? 'text-status-critical' : 'text-stroke-text'}`}>
            {imaging}
          </span>
        </div>
      </div>
    </aside>
  )
}
