import { useState, useRef } from 'react'
import { CheckCircle2, AlertTriangle, RotateCcw, ChevronDown } from 'lucide-react'
import { Dumbbell, MessageSquare, Eye, Scale, FileText, Brain } from 'lucide-react'
import { getNihssSeverity, nihssItems } from '../content/nihss'
import NihssFullEditor from '../components/NihssFullEditor'
import StepCard from '../components/StepCard'

// ── Vitals section ──────────────────────────────────────────────────────────

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" strokeWidth={2} />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars
function VitalsSection({ onConfirm, confirmed, initialVitals }) {
  const [sys, setSys] = useState(initialVitals ? String(initialVitals.systolic) : '')
  const [dia, setDia] = useState(initialVitals ? String(initialVitals.diastolic) : '')
  const [glucose, setGlucose] = useState(initialVitals ? String(initialVitals.glucose) : '')
  const diaRef = useRef(null)
  const glucoseRef = useRef(null)

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)
  const taCritical = sys && sysNum > 185
  const taDiaCritical = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400
  const valid = !!(sys && dia && glucose)

  function fieldClass(critical, filled) {
    return `h-11 w-20 rounded-xl border bg-neutral-50 px-2 text-center text-base font-semibold text-neutral-800 outline-none transition placeholder:text-neutral-300 ${
      critical
        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : filled
          ? 'border-blue-300 bg-blue-50/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          : 'border-neutral-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
    }`
  }

  function focusOnEnter(e, ref) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    ref.current?.focus()
  }

  function handleConfirm() {
    if (!valid) return
    onConfirm({ systolic: sysNum, diastolic: diaNum, glucose: glucNum })
  }

  return (
    <StepCard step="" title="Signos vitales" accent="blue">
      <div className="space-y-2.5">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-600 flex-1">
            TA sistólica <span className="text-xs text-neutral-400">mmHg</span>
          </span>
          <input
            type="text" inputMode="numeric" maxLength={3} placeholder="185"
            value={sys}
            onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => focusOnEnter(e, diaRef)}
            autoFocus
            className={fieldClass(taCritical, !!sys)}
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-600 flex-1">
            TA diastólica <span className="text-xs text-neutral-400">mmHg</span>
          </span>
          <input
            ref={diaRef} type="text" inputMode="numeric" maxLength={3} placeholder="110"
            value={dia}
            onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => focusOnEnter(e, glucoseRef)}
            className={fieldClass(taDiaCritical, !!dia)}
          />
        </label>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-neutral-600 flex-1">
            Glucemia <span className="text-xs text-neutral-400">mg/dL</span>
          </span>
          <input
            ref={glucoseRef} type="text" inputMode="numeric" maxLength={3} placeholder="120"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => { if (e.key === 'Enter' && valid) { e.preventDefault(); handleConfirm() } }}
            className={fieldClass(glucLow || glucHigh, !!glucose)}
          />
        </label>
      </div>

      {(taCritical || taDiaCritical || glucLow || glucHigh) && (
        <div className="space-y-2 pt-3">
          {taCritical && <VitalAlert message="TA sistólica >185 mmHg: ajustar antes de trombolisis." />}
          {!taCritical && taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg: ajustar antes de trombolisis." />}
          {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
          {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
        </div>
      )}

      <button
        type="button" onClick={handleConfirm} disabled={!valid}
        className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
          confirmed
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
            : valid
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}
      >
        {confirmed
          ? <><CheckCircle2 size={15} /> Vitales registrados</>
          : 'Registrar signos vitales'
        }
      </button>
    </StepCard>
  )
}

// ── NIHSS / Symptoms section ─────────────────────────────────────────────────

const SYMPTOMS = [
  { id: 'consciousness', label: 'Consciencia',  sub: 'Nivel de alerta',   Icon: Brain,         nihssIds: ['1a','1b','1c'] },
  { id: 'weakness',      label: 'Debilidad',    sub: 'Unilateral',        Icon: Dumbbell,      nihssIds: ['4','5a','5b','6a','6b'] },
  { id: 'speech',        label: 'Habla',        sub: 'Afasia/Disartria',  Icon: MessageSquare, nihssIds: ['9','10'] },
  { id: 'vision',        label: 'Visión',       sub: 'Visual/Diplopia',   Icon: Eye,           nihssIds: ['2','3'] },
  { id: 'ataxia',        label: 'Ataxia',       sub: 'Inestabilidad',     Icon: Scale,         nihssIds: ['7'] },
  { id: 'other',         label: 'Otro',         sub: 'Otro síntoma',      Icon: FileText,      nihssIds: [] },
]

const DISABLING_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

function NihssSection({ onConfirm, confirmed, initialNihss, initialSymptoms }) {
  const [selected, setSelected] = useState(() => initialSymptoms?.symptoms ?? {})
  const [subscaleScores, setSubscaleScores] = useState({})
  const [otherScore, setOtherScore] = useState('')
  const [hasDisabling, setHasDisabling] = useState(initialNihss?.hasDisablingSymptoms ?? null)
  const [showGuidedModal, setShowGuidedModal] = useState(() => !initialNihss)
  const [useFullScores, setUseFullScores] = useState(!!initialNihss)
  const [showAdjust, setShowAdjust] = useState(false)
  const [showDisablingList, setShowDisablingList] = useState(false)

  // Total: prefer freshly calculated from wizard scores, fall back to stored total
  const calculatedTotal = nihssItems.reduce((sum, item) => sum + (subscaleScores[item.id] ?? 0), 0)
  const nihssBase = (useFullScores && Object.keys(subscaleScores).length > 0)
    ? calculatedTotal
    : (initialNihss?.nihssScore ?? 0)
  const otherNum = selected['other'] ? parseInt(otherScore, 10) || 0 : 0
  const total = nihssBase + otherNum
  const severity = useFullScores ? getNihssSeverity(total) : null
  const showDisablingBlock = useFullScores && total < 5
  const otherValid = !selected['other'] || otherScore !== ''
  const canConfirm = useFullScores && otherValid && (!showDisablingBlock || hasDisabling !== null)

  function toggleSymptom(id) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleGuidedSave(scores) {
    setSubscaleScores(scores)
    setUseFullScores(true)
    setShowGuidedModal(false)
    setShowAdjust(true)
  }

  function handleAdjustSave(scores) {
    setSubscaleScores(scores)
    setShowAdjust(false)
  }

  function handleReset() {
    setSubscaleScores({})
    setUseFullScores(false)
    setShowAdjust(false)
    setShowGuidedModal(true)
  }

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm({
      symptoms: { ...selected },
      nihssScore: total,
      hasDisablingSymptoms: hasDisabling,
    })
  }

  return (
    <StepCard step="" title="Evaluación neurológica" accent="orange">

      {/* ── NIHSS score banner (after wizard completes) ── */}
      {useFullScores && severity && (
        <div className={`rounded-xl border-2 px-4 py-3 mb-4 ${severity.bg} ${severity.border}`}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-0.5">NIHSS</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold tabular-nums leading-none ${severity.color}`}>{total}</span>
                <span className={`text-sm font-semibold ${severity.color}`}>{severity.label}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <button type="button" onClick={() => setShowAdjust((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-white/70 text-brand-700 hover:bg-white transition-all active:scale-95">
                <ChevronDown size={13} className={showAdjust ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'} />
                {showAdjust ? 'Cerrar' : 'Ajustar'}
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-white/50 text-neutral-500 hover:bg-white/70 transition-all active:scale-95">
                <RotateCcw size={11} /> Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Inline adjust view (auto-opens after wizard) ── */}
      {showAdjust && (
        <div className="mb-4 animate-fade-in">
          <NihssFullEditor
            scores={subscaleScores}
            inline={true}
            onSave={handleAdjustSave}
            onClose={() => setShowAdjust(false)}
          />
        </div>
      )}

      {/* ── Pending state placeholder (before wizard) ── */}
      {!useFullScores && (
        <div className="flex items-center gap-3 rounded-xl border-2 border-dashed border-neutral-200 px-4 py-4 mb-4 bg-neutral-50/50">
          <div className="flex-1">
            <p className="text-sm font-semibold text-neutral-600">NIHSS pendiente</p>
            <p className="text-xs text-neutral-400 mt-0.5">La escala se abre automáticamente</p>
          </div>
          <button type="button" onClick={() => setShowGuidedModal(true)}
            className="text-xs font-semibold rounded-xl px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 transition-all active:scale-95 shadow-sm">
            Iniciar
          </button>
        </div>
      )}

      {/* ── Symptom chips — categorization only (no score hints) ── */}
      <div className="border-t border-neutral-100 pt-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Síntomas presentes</p>
        <div className="flex flex-wrap gap-1.5">
          {SYMPTOMS.map((sym) => {
            const active = Boolean(selected[sym.id])
            return (
              <button key={sym.id} type="button" aria-pressed={active} onClick={() => toggleSymptom(sym.id)}
                className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-semibold transition-all active:scale-[0.97] ${
                  active
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-amber-200 hover:bg-amber-50/40'
                }`}>
                <sym.Icon size={13} strokeWidth={2} />
                {sym.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── "Otro" score input ── */}
      {selected['other'] && (
        <div className="mb-3 animate-fade-in">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Puntos adicionales (otro síntoma)</p>
          <input type="number" inputMode="numeric" min={0} max={42} placeholder="0" value={otherScore}
            onChange={(e) => setOtherScore(e.target.value)}
            className="w-24 rounded-xl border-2 border-neutral-200 bg-neutral-50 px-3 py-2.5 text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
        </div>
      )}

      {/* ── Disabling deficit question ── */}
      {showDisablingBlock && (
        <div className="border-t border-amber-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-amber-700 mb-2">¿El déficit es discapacitante?</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button type="button" onClick={() => setHasDisabling(false)}
              className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                hasDisabling === false ? 'border-neutral-400 bg-neutral-100 text-neutral-800' : 'border-neutral-200 text-neutral-400 hover:border-neutral-300'
              }`}>NO</button>
            <button type="button" onClick={() => setHasDisabling(true)}
              className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                hasDisabling === true ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-400 hover:border-amber-200'
              }`}>SÍ</button>
          </div>
          <button type="button" onClick={() => setShowDisablingList((v) => !v)}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
            {showDisablingList ? '▲ Ocultar ejemplos' : '▼ Ver ejemplos de déficit discapacitante'}
          </button>
          {showDisablingList && (
            <ul className="mt-2 space-y-1">
              {DISABLING_LIST.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-neutral-600">
                  <span className="text-amber-400 shrink-0">—</span>{s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Confirm button ── */}
      <div className="pt-4 border-t border-neutral-100 mt-3">
        <button type="button" onClick={handleConfirm} disabled={!canConfirm}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
            confirmed
              ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700'
              : canConfirm
                ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}>
          {confirmed
            ? <><CheckCircle2 size={15} /> NIHSS registrado</>
            : !useFullScores ? 'Completá la escala NIHSS primero'
            : showDisablingBlock && hasDisabling === null ? 'Indicar si el déficit es discapacitante'
            : 'Confirmar evaluación clínica'
          }
        </button>
      </div>

      {/* ── Guided wizard modal ── */}
      {showGuidedModal && (
        <NihssFullEditor guided={true} onSave={handleGuidedSave} onClose={() => setShowGuidedModal(false)} />
      )}
    </StepCard>
  )
}

// ── ClinicalTab (exported) ───────────────────────────────────────────────────

export default function ClinicalTab({ onNihssConfirm, nihss, symptoms }) {
  const nihssConfirmed = nihss !== null

  return (
    <div className="px-4 pb-4 space-y-3 md:px-0">
      {nihssConfirmed && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">NIHSS registrado — {nihss.nihssScore} pts</p>
        </div>
      )}
      <NihssSection
        onConfirm={onNihssConfirm}
        confirmed={nihssConfirmed}
        initialNihss={nihss}
        initialSymptoms={symptoms}
      />
    </div>
  )
}
