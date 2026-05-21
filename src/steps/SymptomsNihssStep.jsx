import { useState, useEffect, useRef } from 'react'
import { ChevronRight, ChevronDown, Dumbbell, MessageSquare, Eye, Scale, FileText, HelpCircle, Calculator, RotateCcw, Brain } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'
import { nihssItems, getNihssSeverity } from '../content/nihss'
import NihssFullEditor from '../components/NihssFullEditor'

const NIHSS_BY_ID = Object.fromEntries(nihssItems.map((i) => [i.id, i]))
const NIHSS_ORDER = nihssItems.map((i) => i.id)

const SYMPTOMS = [
  {
    id: 'consciousness',
    label: 'Consciencia',
    sub: 'Nivel de alerta',
    Icon: Brain,
    flashPts: 3,
    nihssIds: ['1a', '1b', '1c'],
    defaults: { '1a': 1, '1b': 1, '1c': 1 },
  },
  {
    id: 'weakness',
    label: 'Debilidad',
    sub: 'Unilateral',
    Icon: Dumbbell,
    flashPts: 3,
    nihssIds: ['4', '5a', '5b', '6a', '6b'],
    defaults: { '4': 1, '5a': 1, '5b': 0, '6a': 1, '6b': 0 },
  },
  {
    id: 'speech',
    label: 'Habla',
    sub: 'Afasia / Disartria',
    Icon: MessageSquare,
    flashPts: 2,
    nihssIds: ['9', '10'],
    defaults: { '9': 1, '10': 1 },
  },
  {
    id: 'vision',
    label: 'Visión',
    sub: 'Visual / Diplopia',
    Icon: Eye,
    flashPts: 2,
    nihssIds: ['2', '3'],
    defaults: { '2': 1, '3': 1 },
  },
  {
    id: 'ataxia',
    label: 'Ataxia',
    sub: 'Inestabilidad',
    Icon: Scale,
    flashPts: 1,
    nihssIds: ['7'],
    defaults: { '7': 1 },
  },
  {
    id: 'other',
    label: 'Otro',
    sub: 'Otro síntoma',
    Icon: FileText,
    flashPts: 0,
    nihssIds: [],
    defaults: {},
  },
]

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas' },
  { score: 1, label: 'Sin discapacidad significativa' },
  { score: 2, label: 'Discapacidad leve' },
  { score: 3, label: 'Discapacidad moderada' },
  { score: 4, label: 'Moderadamente severa' },
  { score: 5, label: 'Discapacidad severa' },
]

const DISABLING_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

function FlashBadge({ pts }) {
  const [opacity, setOpacity] = useState(1)
  useEffect(() => {
    const t = setTimeout(() => setOpacity(0), 100)
    return () => clearTimeout(t)
  }, [])
  if (!pts || pts <= 0) return null
  return (
    <span
      style={{ opacity, transition: 'opacity 0.8s ease-out' }}
      className="ml-2 inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600"
    >
      +{pts}
    </span>
  )
}

/**
 * Inline row for compact subscale adjustment.
 * Shows the item label, the clinical prompt (in italic), and the score buttons.
 */
function ItemRow({ itemId, score, onChange }) {
  const item = NIHSS_BY_ID[itemId]
  if (!item) return null
  const shortLabel = item.label
    .replace(/^\d+[abc]?\.\s*/i, '')
    .replace('NC –', '')
    .replace('Motor brazo –', 'Brazo')
    .replace('Motor pierna –', 'Pierna')
    .trim()

  return (
    <div className="py-2 border-b border-neutral-100 last:border-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-neutral-700 leading-snug block">{shortLabel}</span>
          {item.prompt && (
            <span className="text-[10px] italic text-neutral-400 leading-snug block mt-0.5">{item.prompt}</span>
          )}
        </div>
        <div className="flex gap-1 shrink-0 mt-0.5">
          {item.options.map((opt) => (
            <button
              key={opt.score}
              type="button"
              title={opt.text}
              onClick={() => onChange(itemId, opt.score)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                score === opt.score
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              {opt.score}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SymptomsNihssStep({ onConfirm, isCollapsed = false }) {
  const [selected, setSelected] = useState({})
  const [subscaleScores, setSubscaleScores] = useState({})
  const [otherScore, setOtherScore] = useState('')
  const [flash, setFlash] = useState(null)
  const [hasDisabling, setHasDisabling] = useState(null)
  const [showDisablingList, setShowDisablingList] = useState(false)
  // Ajustar: inline collapsible subscale view
  const [showSubscales, setShowSubscales] = useState(false)
  // Guía: NihssFullEditor modal (full scale with descriptions)
  const [showGuidedModal, setShowGuidedModal] = useState(false)
  const [useFullScores, setUseFullScores] = useState(false)
  const [mrs, setMrs] = useState(null)
  const [showMrsScale, setShowMrsScale] = useState(false)
  const flashKeyRef = useRef(0)

  const hasSymptom = Object.values(selected).some(Boolean)
  const activeSymptoms = SYMPTOMS.filter((s) => selected[s.id])

  const activeIds = [
    ...new Set(
      activeSymptoms.filter((s) => s.id !== 'other').flatMap((s) => s.nihssIds)
    ),
  ].sort((a, b) => NIHSS_ORDER.indexOf(a) - NIHSS_ORDER.indexOf(b))

  const subscaleTotal = useFullScores
    ? nihssItems.reduce((sum, item) => sum + (subscaleScores[item.id] ?? 0), 0)
    : activeIds.reduce((sum, id) => sum + (subscaleScores[id] ?? 0), 0)
  const otherNum = selected['other'] ? parseInt(otherScore, 10) || 0 : 0
  const total = subscaleTotal + otherNum

  const severity = hasSymptom ? getNihssSeverity(total) : null
  const showDisablingBlock = hasSymptom && total < 5
  const onlyOther = activeSymptoms.length === 1 && selected['other']
  const otherValid = !onlyOther || otherScore !== ''
  const canContinue = hasSymptom && otherValid && (!showDisablingBlock || hasDisabling !== null) && mrs !== null

  function toggleSymptom(id) {
    const sym = SYMPTOMS.find((s) => s.id === id)
    const isNowOn = !selected[id]
    setSelected((prev) => ({ ...prev, [id]: isNowOn }))

    if (isNowOn && sym.nihssIds.length > 0) {
      setSubscaleScores((prev) => {
        const updated = { ...prev }
        Object.entries(sym.defaults).forEach(([itemId, val]) => {
          if (val > 0 && !updated[itemId]) updated[itemId] = val
        })
        return updated
      })
      if (sym.flashPts > 0) {
        flashKeyRef.current += 1
        setFlash({ pts: sym.flashPts, key: flashKeyRef.current })
      }
    }
  }

  function setItemScore(itemId, val) {
    setSubscaleScores((prev) => ({ ...prev, [itemId]: val }))
  }

  // Called when NihssFullEditor (Guía) saves — full 15-item scores
  function handleGuidedSave(scores) {
    setSubscaleScores(scores)
    setUseFullScores(true)
    setShowGuidedModal(false)
  }

  function resetToSymptomBased() {
    setUseFullScores(false)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && canContinue) {
        onConfirm({
          symptoms: { ...selected },
          nihssScore: total,
          hasDisablingSymptoms: hasDisabling,
          modifiedRankinScale: mrs !== null ? { score: mrs, label: MRS_OPTIONS[mrs].label } : null,
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, selected, total, hasDisabling, mrs, onConfirm])

  if (isCollapsed && hasSymptom) {
    const activeLabels = activeSymptoms.map((s) => s.label).join(', ')
    return (
      <CollapsedStep title="Síntomas / NIHSS">
        NIHSS {total}{severity ? ` — ${severity.label}` : ''}{activeLabels ? ` · ${activeLabels}` : ''}
      </CollapsedStep>
    )
  }

  return (
    <div className="space-y-3">
      <StepCard step="4" title="Síntomas / NIHSS" accent="orange">

        {/* ── mRS previo ── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Funcionalidad previa (mRS)
            </p>
            <button
              type="button"
              onClick={() => setShowMrsScale((v) => !v)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <HelpCircle size={12} />
              {showMrsScale ? 'Ocultar escala' : 'Ver escala'}
            </button>
          </div>
          {showMrsScale && (
            <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs animate-fade-in">
              {MRS_OPTIONS.map((o) => (
                <div key={o.score} className="grid grid-cols-[20px_1fr] gap-2 py-0.5">
                  <span className="font-bold text-neutral-800">{o.score}</span>
                  <span className="text-neutral-600">{o.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-6 gap-1.5">
            {MRS_OPTIONS.map((o) => (
              <button
                key={o.score}
                type="button"
                onClick={() => setMrs(o.score)}
                className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                  mrs === o.score
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                    : 'border-neutral-200 text-neutral-500 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                {o.score}
              </button>
            ))}
          </div>
          {mrs !== null && (
            <p className="mt-1.5 text-xs text-blue-600 font-medium animate-fade-in">
              {MRS_OPTIONS[mrs].label}
            </p>
          )}
        </div>

        {/* ── Síntomas ── */}
        <div className="border-t border-neutral-100 pt-4 mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Síntomas</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((sym) => {
              const active = Boolean(selected[sym.id])
              return (
                <button
                  key={sym.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleSymptom(sym.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all active:scale-[0.98] ${
                    active
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-neutral-200 text-neutral-600 hover:border-amber-200 hover:bg-amber-50/50'
                  }`}
                >
                  <sym.Icon size={13} strokeWidth={2} />
                  {sym.label}
                  {sym.flashPts > 0 && (
                    <span className="text-[10px] font-semibold text-neutral-400">+{sym.flashPts}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── NIHSS ── */}
        {hasSymptom && severity && (
          <div className="border-t border-neutral-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">NIHSS</p>

            {/* Score banner */}
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 mb-3 ${severity.bg} ${severity.border}`}>
              <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
              <span className={`font-medium text-sm flex-1 ${severity.color}`}>{severity.label}</span>
              {flash && <FlashBadge key={flash.key} pts={flash.pts} />}
              {useFullScores && (
                <span className="text-[10px] font-semibold rounded-md bg-white/70 px-1.5 py-0.5 text-neutral-500">
                  Manual
                </span>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {useFullScores && (
                  <button
                    type="button"
                    onClick={resetToSymptomBased}
                    title="Volver a cálculo por síntomas"
                    className="flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 bg-white/60 text-neutral-500 hover:bg-white/80 transition-all"
                  >
                    <RotateCcw size={10} /> Recalcular
                  </button>
                )}

                {/* Guía → NihssFullEditor modal (escala completa con descripciones) */}
                <button
                  type="button"
                  onClick={() => setShowGuidedModal(true)}
                  title="Escala NIHSS completa con opciones descriptivas"
                  className="flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 bg-white/60 text-brand-600 hover:bg-white/80 transition-all"
                >
                  <Calculator size={10} /> Guía
                </button>

                {/* Ajustar → inline collapsible con botones numéricos + consignas */}
                {activeIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSubscales((v) => !v)}
                    className={`flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 transition-all ${
                      showSubscales ? 'bg-white/70 text-neutral-600' : 'bg-white/50 text-neutral-500 hover:bg-white/70'
                    }`}
                  >
                    <ChevronDown
                      size={11}
                      className={showSubscales ? 'rotate-180 transition-transform' : 'transition-transform'}
                    />
                    {showSubscales ? 'Ocultar' : 'Ajustar'}
                  </button>
                )}
              </div>
            </div>

            {/* Inline subscale items (Ajustar mode) */}
            {showSubscales &&
              activeSymptoms
                .filter((s) => s.id !== 'other' && s.nihssIds.length > 0)
                .map((sym) => (
                  <div key={sym.id} className="mb-3 animate-fade-in">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <sym.Icon size={11} className="text-amber-500 shrink-0" strokeWidth={2} />
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                        {sym.label} — {sym.sub}
                      </p>
                    </div>
                    <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-1">
                      {sym.nihssIds.map((id) => (
                        <ItemRow
                          key={id}
                          itemId={id}
                          score={subscaleScores[id] ?? 0}
                          onChange={setItemScore}
                        />
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        )}

        {/* Other: manual NIHSS */}
        {selected['other'] && (
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
              Otro — puntos NIHSS adicionales
            </p>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={42}
              placeholder="0"
              value={otherScore}
              onChange={(e) => setOtherScore(e.target.value)}
              className="w-24 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
            />
          </div>
        )}

        {/* Disabling symptoms (NIHSS < 5) */}
        {showDisablingBlock && (
          <div className="border-t border-amber-100 pt-4 mt-2">
            <p className="text-xs font-semibold text-amber-700 mb-2">¿El déficit es discapacitante?</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setHasDisabling(false)}
                className={`py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-[0.98] ${
                  hasDisabling === false
                    ? 'border-neutral-400 bg-neutral-100 text-neutral-800'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => setHasDisabling(true)}
                className={`py-2.5 rounded-xl border font-medium text-sm transition-all active:scale-[0.98] ${
                  hasDisabling === true
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-neutral-200 text-neutral-500 hover:border-amber-200'
                }`}
              >
                SÍ
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDisablingList((v) => !v)}
              className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              {showDisablingList ? '▲ Ocultar ejemplos' : '▼ Ver ejemplos'}
            </button>

            {showDisablingList && (
              <ul className="mt-2 space-y-1">
                {DISABLING_LIST.map((s) => (
                  <li key={s} className="flex items-start gap-1.5 text-xs text-neutral-600">
                    <span className="text-amber-400 shrink-0">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {hasDisabling === true && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5">
                <p className="text-xs font-medium text-amber-700">
                  Déficit discapacitante: valorar trombolisis independientemente del NIHSS.
                </p>
              </div>
            )}
          </div>
        )}
      </StepCard>

      <PrimaryAction
        onClick={() =>
          onConfirm({
            symptoms: { ...selected },
            nihssScore: total,
            hasDisablingSymptoms: hasDisabling,
            modifiedRankinScale: mrs !== null ? { score: mrs, label: MRS_OPTIONS[mrs].label } : null,
          })
        }
        valid={canContinue}
        disabledLabel={
          !hasSymptom
            ? 'Selecciona al menos un síntoma'
            : onlyOther && !otherScore
            ? 'Ingresa puntaje NIHSS'
            : 'Responde si el déficit es discapacitante'
        }
      >
        Continuar <ChevronRight size={16} strokeWidth={2} />
      </PrimaryAction>

      {/* Guía: NihssFullEditor (escala completa con opciones descriptivas) */}
      {showGuidedModal && (
        <NihssFullEditor
          scores={subscaleScores}
          onSave={handleGuidedSave}
          onClose={() => setShowGuidedModal(false)}
        />
      )}
    </div>
  )
}
