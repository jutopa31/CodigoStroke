import { Copy, Check, Share2, User, Clock, Activity, Scan, Syringe, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { ReviewRow, ReviewSection, ReviewTag } from '../components/ReviewSection'

const SYMPTOM_LABELS = {
  consciousness: 'Consciencia',
  weakness: 'Debilidad unilateral',
  speech: 'Trastorno del habla',
  vision: 'Alteración visual',
  ataxia: 'Ataxia / Inestabilidad',
  other: 'Otro',
}

function fmtTime(date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDateTime(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
}

function diffMinutes(a, b) {
  if (!a || !b) return null
  const da = a instanceof Date ? a : new Date(a)
  const db = b instanceof Date ? b : new Date(b)
  return Math.round(Math.abs(da - db) / 60000)
}

function TimestampRow({ label, time, delta, deltaLabel, color = 'text-stroke-text' }) {
  if (!time) return null
  return (
    <div className="flex min-h-[52px] items-center gap-3 py-2.5">
      <div className="h-2 w-2 shrink-0 rounded-full bg-clinical-600" />
      <div className="flex flex-1 items-baseline justify-between gap-2">
        <span className="text-xs text-stroke-textMuted">{label}</span>
        <div className="text-right">
          <span className={`font-mono text-xs font-bold tabular-nums ${color}`}>{time}</span>
          {delta != null && (
            <span className="ml-1.5 block text-[10px] text-stroke-textMuted sm:inline">+{delta} min {deltaLabel}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function DecisionBadge({ result }) {
  if (!result) return <span className="text-xs text-stroke-textMuted">No registrado</span>
  const { icon, title } = result
  const cfg = {
    check:   { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', Icon: CheckCircle2, iconColor: 'text-emerald-700' },
    error:   { bg: 'bg-red-50 border-red-200',         text: 'text-red-800',     Icon: XCircle,      iconColor: 'text-red-700' },
    warning: { bg: 'bg-amber-50 border-amber-200',     text: 'text-amber-800',   Icon: AlertTriangle, iconColor: 'text-amber-700' },
    moon:    { bg: 'bg-indigo-50 border-indigo-200',   text: 'text-indigo-800',  Icon: Clock,        iconColor: 'text-indigo-700' },
  }[icon] ?? { bg: 'bg-stroke-bg border-stroke-line', text: 'text-stroke-text', Icon: Clock, iconColor: 'text-stroke-textMuted' }

  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${cfg.bg}`}>
      <cfg.Icon size={16} className={cfg.iconColor} />
      <span className={`text-xs font-bold ${cfg.text}`}>{title}</span>
    </div>
  )
}

export default function SummaryTab({
  patient, patientId, patientArrivalTime,
  timerStart, ctRequestTime, thrombolyticStartTime, angioRequestTime, thrombectomyActivationTime,
  symptoms, vitals, nihss,
  ctResult,
  decisionResult,
  dosage,
  thrombectomy,
  onCopy, copied, onWhatsApp,
}) {
  const selectedSymptoms = symptoms?.symptoms
    ? Object.entries(symptoms.symptoms).filter(([, v]) => v).map(([k]) => SYMPTOM_LABELS[k] ?? k)
    : []

  const nihssSeverity = (score) => {
    if (score == null) return ''
    if (score === 0) return 'Sin déficit'
    if (score <= 4)  return 'Leve'
    if (score <= 15) return 'Moderado'
    if (score <= 20) return 'Moderado-grave'
    return 'Grave'
  }

  const imagingLabel = () => {
    if (!ctResult) return 'No registrado'
    if (ctResult.bleeding === true) return 'TC: Hemorragia intracraneal'
    if (ctResult.bleeding === false) return 'TC: Sin hemorragia'
    if (ctResult.mismatch === true) return 'RM: Mismatch favorable'
    if (ctResult.mismatch === false) return 'RM: Sin mismatch'
    return 'No registrado'
  }

  const doseLabel = () => {
    if (!dosage) return null
    if (dosage.drug === 'tnk') return `TNK ${dosage.dose?.total ?? '-'} mg bolo IV`
    return `rtPA ${dosage.dose?.total ?? '-'} mg (bolo ${dosage.dose?.bolo ?? '-'} mg + inf. ${dosage.dose?.infusion ?? '-'} mg)`
  }

  const dtCode = timerStart && patientArrivalTime ? diffMinutes(timerStart, patientArrivalTime) : null
  const dtCt   = ctRequestTime && timerStart      ? diffMinutes(ctRequestTime, timerStart)      : null
  const dtTnk  = thrombolyticStartTime && timerStart ? diffMinutes(thrombolyticStartTime, timerStart) : null
  const dtAngio = (angioRequestTime || thrombectomyActivationTime) && timerStart
    ? diffMinutes(angioRequestTime || thrombectomyActivationTime, timerStart) : null

  return (
    <div className="space-y-3 px-4 pb-6 animate-slide-down md:px-0">

      {/* Patient header */}
      <div className="rounded-2xl border border-stroke-line bg-white p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinical-50">
            <User size={18} className="text-clinical-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-stroke-text truncate">{patient?.name ?? '—'}</p>
            <p className="text-xs text-stroke-textMuted mt-0.5">
              DNI: {patient?.dni ?? '—'} · ID: <span className="font-mono font-semibold text-stroke-text">{patientId || '—'}</span>
            </p>
            {patientArrivalTime && (
              <p className="text-[11px] text-stroke-textMuted mt-0.5">Ingreso: {fmtDateTime(patientArrivalTime)}</p>
            )}
          </div>
          <DecisionBadge result={decisionResult} />
        </div>
      </div>

      {/* Timeline */}
      <ReviewSection icon={Clock} title="Tiempos clave" description="Cronología registrada durante el protocolo" tone="clinical">
        <div>
          <TimestampRow label="Inicio código stroke" time={fmtTime(timerStart)} />
          <TimestampRow label="Solicitud de TC/RM"   time={fmtTime(ctRequestTime)} delta={dtCt} deltaLabel="del código" />
          <TimestampRow label="Inicio trombolítico"  time={fmtTime(thrombolyticStartTime)} delta={dtTnk} deltaLabel="del código" color="text-emerald-700" />
          <TimestampRow label="Solicitud angio / trombectomía"
            time={fmtTime(angioRequestTime || thrombectomyActivationTime)}
            delta={dtAngio} deltaLabel="del código"
            color="text-blue-700" />
        </div>
        {dtCode != null && (
          <ReviewRow label="Tiempo puerta-código" value={`${dtCode} min`} tone="info" />
        )}
      </ReviewSection>

      {/* Clinical evaluation */}
      <ReviewSection icon={Activity} title="Evaluación clínica" description="Datos basales que sostienen la decisión" tone="neutral">
        <ReviewRow label="Síntomas"
          value={selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'No registrado'} />
        {symptoms?.lastSeenNormal && (
          <ReviewRow label="Última vez asintomático" value={fmtDateTime(symptoms.lastSeenNormal)} />
        )}
        {symptoms?.isWakeUpStroke && (
          <ReviewRow label="Wake-up stroke" value="Sí" tone="warning" />
        )}
        <ReviewRow label="TA"
          value={vitals ? `${vitals.systolic}/${vitals.diastolic} mmHg` : null} />
        <ReviewRow label="Glucemia"
          value={vitals ? `${vitals.glucose} mg/dL` : null} />
        {nihss && (
          <ReviewRow label="NIHSS"
            value={`${nihss.nihssScore} pts — ${nihssSeverity(nihss.nihssScore)}${nihss.hasDisablingSymptoms ? ' (déficit discapacitante)' : ''}`}
            tone="warning" complete />
        )}
      </ReviewSection>

      {/* Imaging + CIs + Treatment in a 2-col grid on wide screens */}
      <div className="grid gap-3 md:grid-cols-2">

        {/* Imaging */}
        <ReviewSection icon={Scan} title="Neuroimagen" tone="clinical">
          <ReviewRow label="Resultado" value={imagingLabel()} complete />
          {thrombectomy?.aspectScore != null && (
            <ReviewRow label="ASPECTS" value={`${thrombectomy.aspectScore} pts`} tone={thrombectomy.aspectScore >= 6 ? 'success' : 'warning'} />
          )}
        </ReviewSection>

        {/* Contraindications */}
        <ReviewSection icon={ShieldAlert} title="Contraindicaciones" tone={decisionResult?.absoluteCI ? 'critical' : decisionResult?.relativeCI ? 'warning' : 'success'}>
          <ReviewRow label="Absolutas"
            value={decisionResult?.absoluteCI ? 'Presentes' : 'Ninguna'}
            tone={decisionResult?.absoluteCI ? 'critical' : 'success'} />
          <ReviewRow label="Relativas"
            value={decisionResult?.relativeCI ? 'Presentes' : 'Ninguna'}
            tone={decisionResult?.relativeCI ? 'warning' : 'success'} />
          {decisionResult?.absoluteDetails?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-3">
              {decisionResult.absoluteDetails.map((d) => (
                <ReviewTag key={d} tone="critical">{d}</ReviewTag>
              ))}
            </div>
          )}
          {decisionResult?.relativeDetails?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 py-3">
              {decisionResult.relativeDetails.map((d) => (
                <ReviewTag key={d} tone="warning">{d}</ReviewTag>
              ))}
            </div>
          )}
        </ReviewSection>
      </div>

      {/* Treatment */}
      <ReviewSection icon={Syringe} title="Tratamiento administrado" description="Intervenciones que quedaron registradas" tone={dosage ? 'success' : 'neutral'}>
        <ReviewRow label="Trombolisis"
          value={doseLabel() ?? 'No administrada'}
          tone={dosage ? 'success' : 'neutral'} complete={!!dosage} />
        {thrombolyticStartTime && (
          <ReviewRow label="Hora de inicio" value={fmtTime(thrombolyticStartTime)} />
        )}
        <ReviewRow label="Angio-TC"
          value={thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'} />
        {(angioRequestTime || thrombectomyActivationTime) && (
          <ReviewRow label="Hora angio / activación"
            value={fmtTime(angioRequestTime || thrombectomyActivationTime)} />
        )}
        <ReviewRow label="Hemodinámica notificada"
          value={thrombectomy?.hemodinamisNotified === true ? 'Sí' : thrombectomy?.hemodinamisNotified === false ? 'No' : null} />
      </ReviewSection>

      {/* Share */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onCopy}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all active:scale-[0.97] ${
            copied
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-stroke-line bg-white text-stroke-text hover:bg-stroke-panel'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copiado' : 'Copiar texto'}
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-3 text-sm font-semibold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.97]"
        >
          <Share2 size={15} />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
