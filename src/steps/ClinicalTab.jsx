import { useState, useRef } from 'react'
import { CheckCircle2, AlertTriangle, ChevronDown, Calculator, RotateCcw } from 'lucide-react'
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

// ── NIHSS / Symptoms section ────────────────────────────────────────────────

const NIHSS_BY_ID = Object.fromEntries(nihssItems.map((i) => [i.id, i]))
const NIHSS_ORDER = nihssItems.map((i) => i.id)

const SYMPTOMS = [
  { id: 'consciousness', label: 'Consciencia', sub: 'Nivel de alerta', Icon: Brain,         flashPts: 3, nihssIds: ['1a','1b','1c'], defaults: {'1a':1,'1b':1,'1c':1} },
  { id: 'weakness',      label: 'Debilidad',   sub: 'Unilateral',      Icon: Dumbbell,      flashPts: 3, nihssIds: ['4','5a','5b','6a','6b'], defaults: {'4':1,'5a':1,'5b':0,'6a':1,'6b':0} },
  { id: 'speech',        label: 'Habla',       sub: 'Afasia/Disartria', Icon: MessageSquare, flashPts: 2, nihssIds: ['9','10'], defaults: {'9':1,'10':1} },
  { id: 'vision',        label: 'Visión',      sub: 'Visual/Diplopia',  Icon: Eye,           flashPts: 2, nihssIds: ['2','3'], defaults: {'2':1,'3':1} },
  { id: 'ataxia',        label: 'Ataxia',      sub: 'Inestabilidad',    Icon: Scale,         flashPts: 1, nihssIds: ['7'], defaults: {'7':1} },
  { id: 'other',         label: 'Otro',        sub: 'Otro síntoma',     Icon: FileText,      flashPts: 0, nihssIds: [], defaults: {} },
]

const DISABLING_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

function ItemRow({ itemId, score, onChange }) {
  const item = NIHSS_BY_ID[itemId]
  if (!item) return null
  const shortLabel = item.label.replace(/^\d+[abc]?\.\s*/i, '').replace('NC –', '').replace('Motor brazo –', 'Brazo').replace('Motor pierna –', 'Pierna').trim()
  return (
    <div className="py-2 border-b border-neutral-100 last:border-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-neutral-700 leading-snug block">{shortLabel}</span>
          {item.prompt && <span className="text-[10px] italic text-neutral-400 leading-snug block mt-0.5">{item.prompt}</span>}
        </div>
        <div className="flex gap-1 shrink-0 mt-0.5">
          {item.options.map((opt) => (
            <button key={opt.score} type="button" title={opt.text} onClick={() => onChange(itemId, opt.score)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                score === opt.score ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}>
              {opt.score}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NihssSection({ onConfirm, confirmed, initialNihss, initialSymptoms }) {
  const [selected, setSelected] = useState(() => initialSymptoms?.symptoms ?? {})
  const [subscaleScores, setSubscaleScores] = useState({})
  const [otherScore, setOtherScore] = useState('')
  const [hasDisabling, setHasDisabling] = useState(initialNihss?.hasDisablingSymptoms ?? null)
  const [showSubscales, setShowSubscales] = useState(true)
  const [showGuidedModal, setShowGuidedModal] = useState(false)
  const [useFullScores, setUseFullScores] = useState(false)
  const [showDisablingList, setShowDisablingList] = useState(false)

  const hasSymptom = Object.values(selected).some(Boolean)
  const activeSymptoms = SYMPTOMS.filter((s) => selected[s.id])
  const activeIds = [...new Set(activeSymptoms.filter((s) => s.id !== 'other').flatMap((s) => s.nihssIds))]
    .sort((a, b) => NIHSS_ORDER.indexOf(a) - NIHSS_ORDER.indexOf(b))

  const subscaleTotal = useFullScores
    ? nihssItems.reduce((sum, item) => sum + (subscaleScores[item.id] ?? 0), 0)
    : activeIds.reduce((sum, id) => sum + (subscaleScores[id] ?? 0), 0)
  const otherNum = selected['other'] ? parseInt(otherScore, 10) || 0 : 0
  const total = subscaleTotal + otherNum
  const severity = hasSymptom ? getNihssSeverity(total) : null
  const showDisablingBlock = hasSymptom && total < 5
  const onlyOther = activeSymptoms.length === 1 && selected['other']
  const otherValid = !onlyOther || otherScore !== ''
  const canConfirm = hasSymptom && otherValid && (!showDisablingBlock || hasDisabling !== null)

  function toggleSymptom(id) {
    const sym = SYMPTOMS.find((s) => s.id === id)
    const isNowOn = !selected[id]
    setSelected((prev) => ({ ...prev, [id]: isNowOn }))
    if (isNowOn && sym.nihssIds.length > 0) {
      setSubscaleScores((prev) => {
        const updated = { ...prev }
        Object.entries(sym.defaults).forEach(([itemId, val]) => { if (val > 0 && !updated[itemId]) updated[itemId] = val })
        return updated
      })
    }
  }

  function handleGuidedSave(scores) {
    setSubscaleScores(scores)
    setUseFullScores(true)
    setShowGuidedModal(false)
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
    <StepCard step="" title="Síntomas / NIHSS" accent="orange">
      {/* Sticky confirm at top — stays visible while scrolling through symptoms/NIHSS */}
      <div className="sticky top-0 z-10 -mx-5 px-5 pb-2 mb-3 bg-white md:-mx-6 md:px-6">
        <button
          type="button" onClick={handleConfirm} disabled={!canConfirm}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
            confirmed
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : canConfirm
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}
        >
          {confirmed
            ? <><CheckCircle2 size={15} /> NIHSS registrado</>
            : !hasSymptom ? 'Seleccioná síntomas primero'
            : showDisablingBlock && hasDisabling === null ? 'Responder si el déficit es discapacitante'
            : 'Registrar evaluación clínica'
          }
        </button>
      </div>

      {/* Symptoms */}
      <div className="border-t border-neutral-100 pt-4 mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Síntomas</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((sym) => {
            const active = Boolean(selected[sym.id])
            return (
              <button key={sym.id} type="button" aria-pressed={active} onClick={() => toggleSymptom(sym.id)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all active:scale-[0.98] ${
                  active ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-600 hover:border-amber-200 hover:bg-amber-50/50'
                }`}>
                <sym.Icon size={13} strokeWidth={2} />
                {sym.label}
                {sym.flashPts > 0 && <span className="text-[10px] font-semibold text-neutral-400">+{sym.flashPts}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* NIHSS */}
      {hasSymptom && severity && (
        <div className="border-t border-neutral-100 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">NIHSS</p>
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-3 ${severity.bg} ${severity.border}`}>
            <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
            <span className={`font-medium text-sm flex-1 ${severity.color}`}>{severity.label}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              {useFullScores && (
                <button type="button" onClick={() => setUseFullScores(false)}
                  className="flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 bg-white/60 text-neutral-500 hover:bg-white/80 transition-all">
                  <RotateCcw size={10} /> Reset
                </button>
              )}
              <button type="button" onClick={() => setShowGuidedModal(true)}
                className="flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 bg-white/60 text-brand-600 hover:bg-white/80 transition-all">
                <Calculator size={10} /> Guía
              </button>
              {activeIds.length > 0 && (
                <button type="button" onClick={() => setShowSubscales((v) => !v)}
                  className="flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 bg-white/50 text-neutral-500 hover:bg-white/70 transition-all">
                  <ChevronDown size={11} className={showSubscales ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  {showSubscales ? 'Ocultar' : 'Ajustar'}
                </button>
              )}
            </div>
          </div>

          {showSubscales && activeSymptoms.filter((s) => s.id !== 'other' && s.nihssIds.length > 0).map((sym) => (
            <div key={sym.id} className="mb-3 animate-fade-in">
              <div className="mb-1.5 flex items-center gap-1.5">
                <sym.Icon size={11} className="text-amber-500 shrink-0" strokeWidth={2} />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">{sym.label}</p>
              </div>
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-1">
                {sym.nihssIds.map((id) => (
                  <ItemRow key={id} itemId={id} score={subscaleScores[id] ?? 0}
                    onChange={(itemId, val) => setSubscaleScores((prev) => ({ ...prev, [itemId]: val }))} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected['other'] && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">NIHSS adicionales</p>
          <input type="number" inputMode="numeric" min={0} max={42} placeholder="0" value={otherScore}
            onChange={(e) => setOtherScore(e.target.value)}
            className="w-24 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all" />
        </div>
      )}

      {showDisablingBlock && (
        <div className="border-t border-amber-100 pt-4 mt-2">
          <p className="text-xs font-semibold text-amber-700 mb-2">¿El déficit es discapacitante?</p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button type="button" onClick={() => setHasDisabling(false)}
              className={`py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-[0.98] ${
                hasDisabling === false ? 'border-neutral-400 bg-neutral-100 text-neutral-800' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}>NO</button>
            <button type="button" onClick={() => setHasDisabling(true)}
              className={`py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-[0.98] ${
                hasDisabling === true ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-neutral-200 text-neutral-500 hover:border-amber-200'
              }`}>SÍ</button>
          </div>
          <button type="button" onClick={() => setShowDisablingList((v) => !v)} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
            {showDisablingList ? '▲ Ocultar ejemplos' : '▼ Ver ejemplos'}
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

      {showGuidedModal && (
        <NihssFullEditor scores={subscaleScores} onSave={handleGuidedSave} onClose={() => setShowGuidedModal(false)} />
      )}
    </StepCard>
  )
}

// ── ClinicalTab (exported) — NIHSS + symptoms only ──────────────────────────

export default function ClinicalTab({ onNihssConfirm, nihss, symptoms }) {
  const nihssConfirmed = nihss !== null

  return (
    <div className="px-4 pb-4 space-y-4">
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
