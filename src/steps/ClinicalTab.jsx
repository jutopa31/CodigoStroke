import { useState, useRef } from 'react'
import { CheckCircle2, AlertTriangle, RotateCcw, ChevronDown } from 'lucide-react'
import { getNihssSeverity, nihssItems } from '../content/nihss'
import NihssFullEditor from '../components/NihssFullEditor'
import StepCard from '../components/StepCard'

// ── Vitals section ──────────────────────────────────────────────────────────

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-status-critical/30 bg-status-critical/10 px-3 py-2">
      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-400" strokeWidth={2} />
      <p className="text-xs leading-relaxed text-red-400">{message}</p>
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
    return `h-11 w-20 rounded-xl border bg-stroke-bg px-2 text-center text-base font-semibold text-stroke-text outline-none transition placeholder:text-stroke-textMuted ${
      critical
        ? 'border-red-300 bg-status-critical/10 focus:border-red-400 focus:ring-2 focus:ring-status-critical/30'
        : filled
          ? 'border-blue-300 bg-blue-500/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
          : 'border-stroke-line focus:border-stroke-iconActive/50 focus:ring-2 focus:ring-blue-500/30'
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
          <span className="text-sm font-medium text-stroke-textMuted flex-1">
            TA sistólica <span className="text-xs text-stroke-textMuted">mmHg</span>
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
          <span className="text-sm font-medium text-stroke-textMuted flex-1">
            TA diastólica <span className="text-xs text-stroke-textMuted">mmHg</span>
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
          <span className="text-sm font-medium text-stroke-textMuted flex-1">
            Glucemia <span className="text-xs text-stroke-textMuted">mg/dL</span>
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
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : valid
              ? 'btn-primary text-white'
              : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
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

// ── NIHSS section ────────────────────────────────────────────────────────────

const DISABLING_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

function NihssSection({ onConfirm, confirmed, initialNihss, draft, onDraftChange }) {
  const [subscaleScores, setSubscaleScores] = useState(initialNihss?.scores ?? {})
  const [useFullScores, setUseFullScores] = useState(!!initialNihss)
  const [showAdjust, setShowAdjust] = useState(false)
  const [hasDisabling, setHasDisabling] = useState(initialNihss?.hasDisablingSymptoms ?? null)
  const [showDisablingList, setShowDisablingList] = useState(false)

  const total = nihssItems.reduce((sum, item) => sum + (subscaleScores[item.id] ?? 0), 0)
  const severity = useFullScores ? getNihssSeverity(total) : null
  const showDisablingBlock = useFullScores && total < 5
  const canConfirm = useFullScores && (!showDisablingBlock || hasDisabling !== null)

  const totalOf = (scores) => nihssItems.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0)
  const allAnswered = (scores) => nihssItems.every((i) => i.id in scores)

  function handleSave(scores) {
    setSubscaleScores(scores)
    setUseFullScores(true)
    setShowAdjust(false)
    // Auto-register the moment the full scale is complete and ≥ 5 (no disabling
    // question needed). For < 5 the disabling block must still be answered.
    if (allAnswered(scores) && totalOf(scores) >= 5) {
      onConfirm({ nihssScore: totalOf(scores), scores: { ...scores }, hasDisablingSymptoms: null })
    }
  }

  function handleReset() {
    setSubscaleScores({})
    setUseFullScores(false)
    setShowAdjust(false)
    setHasDisabling(null)
    onDraftChange?.({ scores: {}, current: 0 })
  }

  // Answering the disabling-deficit question (only shown when NIHSS < 5) commits
  // the score directly — no separate confirm tap.
  function answerDisabling(val) {
    setHasDisabling(val)
    onConfirm({ nihssScore: total, scores: { ...subscaleScores }, hasDisablingSymptoms: val })
  }

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm({
      nihssScore: total,
      scores: { ...subscaleScores },
      hasDisablingSymptoms: hasDisabling,
    })
  }

  return (
    <StepCard step="" title="Evaluación neurológica" accent="orange">

      {/* ── Score banner (after scoring) ── */}
      {useFullScores && severity && (
        <div className={`rounded-xl border-2 px-4 py-3 mb-4 ${severity.bg} ${severity.border}`}>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-0.5">NIHSS</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tabular-nums leading-none ${severity.color}`}>{total}</span>
                <span className={`text-sm font-semibold ${severity.color}`}>{severity.label}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <button type="button" onClick={() => setShowAdjust((v) => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-stroke-bg text-stroke-iconActive hover:bg-stroke-navy transition-all active:scale-95">
                <ChevronDown size={13} className={showAdjust ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'} />
                {showAdjust ? 'Cerrar' : 'Ajustar'}
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-1.5 bg-stroke-bg text-stroke-textMuted hover:bg-stroke-bg transition-all active:scale-95">
                <RotateCcw size={11} /> Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Compact adjust view ── */}
      {showAdjust && (
        <div className="mb-4">
          <NihssFullEditor
            scores={subscaleScores}
            inline={true}
            onSave={handleSave}
            onClose={() => setShowAdjust(false)}
          />
        </div>
      )}

      {/* ── Full inline editor — always shown before scoring ── */}
      {!useFullScores && (
        <div className="mb-4">
          <NihssFullEditor
            scores={draft?.scores ?? {}}
            current={draft?.current ?? 0}
            inlineScroll={true}
            onSave={handleSave}
            onComplete={handleSave}
            onScoresChange={(scores) => onDraftChange?.((d) => ({ ...(d ?? {}), scores }))}
            onCurrentChange={(current) => onDraftChange?.((d) => ({ ...(d ?? {}), current }))}
          />
        </div>
      )}

      {/* ── Disabling deficit question (NIHSS < 5) ── */}
      {showDisablingBlock && (
        <div className="border-t border-amber-500/30 pt-4 mt-2">
          <p className="text-xs font-semibold text-amber-300 mb-2">¿El déficit es discapacitante?</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button type="button" onClick={() => answerDisabling(false)}
              className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                hasDisabling === false ? 'border-stroke-line bg-stroke-panel text-stroke-text' : 'border-stroke-line text-stroke-textMuted hover:border-stroke-line'
              }`}>NO</button>
            <button type="button" onClick={() => answerDisabling(true)}
              className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all active:scale-[0.98] ${
                hasDisabling === true ? 'border-amber-400 bg-amber-500/10 text-amber-300' : 'border-stroke-line text-stroke-textMuted hover:border-amber-500/30'
              }`}>SÍ</button>
          </div>
          <button type="button" onClick={() => setShowDisablingList((v) => !v)}
            className="text-xs text-blue-500 hover:text-blue-300 transition-colors">
            {showDisablingList ? '▲ Ocultar ejemplos' : '▼ Ver ejemplos de déficit discapacitante'}
          </button>
          {showDisablingList && (
            <ul className="mt-2 space-y-1">
              {DISABLING_LIST.map((s) => (
                <li key={s} className="flex items-start gap-1.5 text-xs text-stroke-textMuted">
                  <span className="text-amber-400 shrink-0">—</span>{s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Confirm button ── */}
      <div className="pt-4 border-t border-stroke-line mt-3">
        <button type="button" onClick={handleConfirm} disabled={!canConfirm}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
            confirmed
              ? 'bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-300'
              : canConfirm
                ? 'btn-primary text-white shadow-sm'
                : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
          }`}>
          {confirmed
            ? <><CheckCircle2 size={15} /> NIHSS registrado</>
            : !useFullScores ? 'Completá la escala NIHSS primero'
            : showDisablingBlock && hasDisabling === null ? 'Indicar si el déficit es discapacitante'
            : 'Confirmar evaluación clínica'
          }
        </button>
      </div>
    </StepCard>
  )
}

// ── ClinicalTab (exported) ───────────────────────────────────────────────────

export default function ClinicalTab({ onNihssConfirm, nihss, nihssDraft, onNihssDraftChange }) {
  const nihssConfirmed = nihss !== null

  return (
    <div className="px-4 pb-4 space-y-3 md:px-0">
      {nihssConfirmed && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-300">NIHSS registrado — {nihss.nihssScore} pts</p>
        </div>
      )}
      <NihssSection
        onConfirm={onNihssConfirm}
        confirmed={nihssConfirmed}
        initialNihss={nihss}
        draft={nihssDraft}
        onDraftChange={onNihssDraftChange}
      />
    </div>
  )
}
