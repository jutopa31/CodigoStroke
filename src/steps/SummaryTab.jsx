import { Copy, Check, Share2, User, Clock, Activity, Scan, Syringe, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

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

function SectionHeader({ icon: Icon, label, color = 'text-stroke-textMuted' }) {
  return (
    <p className={`text-[10px] font-bold uppercase tracking-wider ${color} flex items-center gap-1.5 mb-2`}>
      <Icon size={11} />
      {label}
    </p>
  )
}

function Row({ label, value, highlight }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-baseline justify-between gap-3 py-1 border-b border-neutral-50 last:border-0">
      <span className="text-xs text-stroke-textMuted shrink-0">{label}</span>
      <span className={`text-xs font-medium text-right ${highlight ? 'text-emerald-300' : 'text-stroke-text'}`}>{value}</span>
    </div>
  )
}

function TimestampRow({ label, time, delta, deltaLabel, color = 'text-stroke-text' }) {
  if (!time) return null
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-stroke-navy/40 shrink-0 mt-0.5" />
      <div className="flex-1 flex items-baseline justify-between gap-2">
        <span className="text-xs text-stroke-textMuted">{label}</span>
        <div className="text-right">
          <span className={`text-xs font-semibold ${color}`}>{time}</span>
          {delta != null && (
            <span className="text-[10px] text-stroke-textMuted ml-1.5">+{delta} min {deltaLabel}</span>
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
    check:   { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-300', Icon: CheckCircle2, iconColor: 'text-emerald-400' },
    error:   { bg: 'bg-blue-500/10 border-blue-500/30',       text: 'text-blue-300',    Icon: XCircle,      iconColor: 'text-blue-300' },
    warning: { bg: 'bg-amber-500/10 border-amber-500/30',     text: 'text-amber-300',   Icon: AlertTriangle, iconColor: 'text-amber-400' },
    moon:    { bg: 'bg-indigo-500/10 border-indigo-500/30',   text: 'text-indigo-300',  Icon: Clock,        iconColor: 'text-indigo-300' },
  }[icon] ?? { bg: 'bg-stroke-bg border-stroke-line', text: 'text-stroke-text', Icon: Clock, iconColor: 'text-stroke-textMuted' }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${cfg.bg}`}>
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
    <div className="px-4 pb-6 animate-slide-down md:px-0 space-y-3">

      {/* Patient header */}
      <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-stroke-navy/10 flex items-center justify-center shrink-0">
            <User size={18} className="text-stroke-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-stroke-text truncate">{patient?.name ?? '—'}</p>
            <p className="text-xs text-stroke-textMuted mt-0.5">
              DNI: {patient?.dni ?? '—'} · ID: <span className="font-mono font-semibold text-stroke-navy">{patientId || '—'}</span>
            </p>
            {patientArrivalTime && (
              <p className="text-[11px] text-stroke-textMuted mt-0.5">Ingreso: {fmtDateTime(patientArrivalTime)}</p>
            )}
          </div>
          <DecisionBadge result={decisionResult} />
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
        <SectionHeader icon={Clock} label="Tiempos clave" color="text-stroke-navy/70" />
        <div className="divide-y divide-stroke-line/50">
          <TimestampRow label="Inicio código stroke" time={fmtTime(timerStart)} />
          <TimestampRow label="Solicitud de TC/RM"   time={fmtTime(ctRequestTime)} delta={dtCt} deltaLabel="del código" />
          <TimestampRow label="Inicio trombolítico"  time={fmtTime(thrombolyticStartTime)} delta={dtTnk} deltaLabel="del código" color="text-emerald-300" />
          <TimestampRow label="Solicitud angio / trombectomía"
            time={fmtTime(angioRequestTime || thrombectomyActivationTime)}
            delta={dtAngio} deltaLabel="del código"
            color="text-blue-300" />
        </div>
        {dtCode != null && (
          <p className="text-[10px] text-stroke-textMuted mt-2 pt-2 border-t border-stroke-line">
            Tiempo puerta-código: <span className="font-semibold text-stroke-textMuted">{dtCode} min</span>
          </p>
        )}
      </div>

      {/* Clinical evaluation */}
      <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
        <SectionHeader icon={Activity} label="Evaluación clínica" color="text-stroke-textMuted" />
        <Row label="Síntomas"
          value={selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'No registrado'} />
        {symptoms?.lastSeenNormal && (
          <Row label="Última vez asintomático" value={fmtDateTime(symptoms.lastSeenNormal)} />
        )}
        {symptoms?.isWakeUpStroke && (
          <Row label="Wake-up stroke" value="Sí" />
        )}
        <Row label="TA"
          value={vitals ? `${vitals.systolic}/${vitals.diastolic} mmHg` : null} />
        <Row label="Glucemia"
          value={vitals ? `${vitals.glucose} mg/dL` : null} />
        {nihss && (
          <Row label="NIHSS"
            value={`${nihss.nihssScore} pts — ${nihssSeverity(nihss.nihssScore)}${nihss.hasDisablingSymptoms ? ' (déficit discapacitante)' : ''}`}
            highlight />
        )}
      </div>

      {/* Imaging + CIs + Treatment in a 2-col grid on wide screens */}
      <div className="grid gap-3 md:grid-cols-2">

        {/* Imaging */}
        <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
          <SectionHeader icon={Scan} label="Neuroimagen" color="text-stroke-textMuted" />
          <Row label="Resultado" value={imagingLabel()} />
          {thrombectomy?.aspectScore != null && (
            <Row label="ASPECTS" value={`${thrombectomy.aspectScore} pts`} highlight={thrombectomy.aspectScore >= 6} />
          )}
        </div>

        {/* Contraindications */}
        <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
          <SectionHeader icon={ShieldAlert} label="Contraindicaciones" color="text-stroke-textMuted" />
          <Row label="Absolutas"
            value={decisionResult?.absoluteCI ? 'Presentes' : 'Ninguna'} />
          <Row label="Relativas"
            value={decisionResult?.relativeCI ? 'Presentes' : 'Ninguna'} />
          {decisionResult?.absoluteDetails?.length > 0 && (
            <div className="mt-2 space-y-1">
              {decisionResult.absoluteDetails.map((d) => (
                <div key={d} className="text-[11px] text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded px-2 py-0.5">{d}</div>
              ))}
            </div>
          )}
          {decisionResult?.relativeDetails?.length > 0 && (
            <div className="mt-2 space-y-1">
              {decisionResult.relativeDetails.map((d) => (
                <div key={d} className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-0.5">{d}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treatment */}
      <div className="bg-stroke-navy rounded-xl border border-stroke-line p-4">
        <SectionHeader icon={Syringe} label="Tratamiento administrado" color="text-emerald-400/80" />
        <Row label="Trombolisis"
          value={doseLabel() ?? 'No administrada'}
          highlight={!!dosage} />
        {thrombolyticStartTime && (
          <Row label="Hora de inicio" value={fmtTime(thrombolyticStartTime)} />
        )}
        <Row label="Angio-TC"
          value={thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'} />
        {(angioRequestTime || thrombectomyActivationTime) && (
          <Row label="Hora angio / activación"
            value={fmtTime(angioRequestTime || thrombectomyActivationTime)} />
        )}
        <Row label="Hemodinámica notificada"
          value={thrombectomy?.hemodinamisNotified === true ? 'Sí' : thrombectomy?.hemodinamisNotified === false ? 'No' : null} />
      </div>

      {/* Share */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={onCopy}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition active:scale-[0.97] ${
            copied
              ? 'border-emerald-300 bg-emerald-500/10 text-emerald-300'
              : 'border-stroke-line bg-stroke-navy text-stroke-text hover:bg-stroke-bg'
          }`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? 'Copiado' : 'Copiar texto'}
        </button>
        <button
          type="button"
          onClick={onWhatsApp}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 transition active:scale-[0.97]"
        >
          <Share2 size={15} />
          WhatsApp
        </button>
      </div>
    </div>
  )
}
