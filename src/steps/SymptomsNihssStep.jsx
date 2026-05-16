import { useState, useEffect } from 'react'
import { ChevronRight, Zap, MessageSquare, Eye, Scale, FileText } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction, SelectableButton } from '../components/GuidedControls'
import { nihssItems, getNihssSeverity } from '../content/nihss'

const NIHSS_BY_ID = Object.fromEntries(nihssItems.map((i) => [i.id, i]))
const NIHSS_ORDER = nihssItems.map((i) => i.id)

// Symptom → NIHSS subscale mapping
// defaults: which items get pre-filled (score > 0) when the symptom is first selected
const SYMPTOMS = [
  {
    id: 'weakness',
    label: 'Debilidad',
    sub: 'Unilateral',
    Icon: Zap,
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

const DISABLING_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

// Flash badge: mounts, waits briefly, fades out
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
      className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-600 ring-1 ring-emerald-300"
    >
      +{pts}
    </span>
  )
}

// Compact subscale item row: short label + score buttons
function ItemRow({ itemId, score, onChange }) {
  const item = NIHSS_BY_ID[itemId]
  if (!item) return null
  // Strip numeric prefix and side indicator for display
  const shortLabel = item.label
    .replace(/^\d+[abc]?\.\s*/i, '')
    .replace('NC –', '')
    .replace('Motor brazo –', 'Brazo')
    .replace('Motor pierna –', 'Pierna')
    .trim()

  return (
    <div className="flex items-center gap-2 py-1 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-600 flex-1 min-w-0 truncate" title={item.label}>
        {shortLabel}
      </span>
      <div className="flex gap-1 shrink-0">
        {item.options.map((opt) => (
          <button
            key={opt.score}
            type="button"
            title={opt.text}
            onClick={() => onChange(itemId, opt.score)}
            className={`w-7 h-7 rounded-md text-xs font-bold transition-all active:scale-95 ${
              score === opt.score
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {opt.score}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SymptomsNihssStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [subscaleScores, setSubscaleScores] = useState({})
  const [otherScore, setOtherScore] = useState('')
  const [flash, setFlash] = useState(null)   // { pts, key }
  const [hasDisabling, setHasDisabling] = useState(null)
  const [showDisablingList, setShowDisablingList] = useState(false)

  const hasSymptom = Object.values(selected).some(Boolean)
  const activeSymptoms = SYMPTOMS.filter((s) => selected[s.id])

  // Ordered, deduplicated list of active NIHSS item IDs
  const activeIds = [
    ...new Set(
      activeSymptoms.filter((s) => s.id !== 'other').flatMap((s) => s.nihssIds)
    ),
  ].sort((a, b) => NIHSS_ORDER.indexOf(a) - NIHSS_ORDER.indexOf(b))

  const subscaleTotal = activeIds.reduce((sum, id) => sum + (subscaleScores[id] ?? 0), 0)
  const otherNum = selected['other'] ? parseInt(otherScore, 10) || 0 : 0
  const total = subscaleTotal + otherNum

  const severity = hasSymptom ? getNihssSeverity(total) : null
  const showDisablingBlock = hasSymptom && total < 5
  const onlyOther = activeSymptoms.length === 1 && selected['other']
  const otherValid = !onlyOther || otherScore !== ''
  const canContinue = hasSymptom && otherValid && (!showDisablingBlock || hasDisabling !== null)

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
        setFlash({ pts: sym.flashPts, key: Date.now() })
      }
    }
  }

  function setItemScore(itemId, val) {
    setSubscaleScores((prev) => ({ ...prev, [itemId]: val }))
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && canContinue) {
        onConfirm({ symptoms: { ...selected }, nihssScore: total, hasDisablingSymptoms: hasDisabling })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, selected, total, hasDisabling, onConfirm])

  return (
    <div className="space-y-2">
      <StepCard step="3" title="Síntomas / NIHSS" accent="orange">

        {/* ── Symptom pill buttons ── */}
        <div className="flex flex-wrap gap-2 mb-4">
          {SYMPTOMS.map((sym) => {
            const active = Boolean(selected[sym.id])
            return (
              <button
                key={sym.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSymptom(sym.id)}
                className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                  active
                    ? 'border-orange-500 bg-orange-100 text-orange-800 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                }`}
              >
                <sym.Icon size={13} />
                {sym.label}
              </button>
            )
          })}
        </div>

        {/* ── NIHSS total display ── */}
        {hasSymptom && severity && (
          <div className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 mb-3 ${severity.bg} ${severity.border}`}>
            <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
            <span className={`font-semibold text-sm ${severity.color}`}>{severity.label}</span>
            {flash && <FlashBadge key={flash.key} pts={flash.pts} />}
          </div>
        )}

        {/* ── Subscale items grouped by symptom ── */}
        {activeSymptoms.filter((s) => s.id !== 'other' && s.nihssIds.length > 0).map((sym) => (
          <div key={sym.id} className="mb-3">
            <div className="mb-1 flex items-center gap-1.5">
              <sym.Icon size={11} className="text-orange-500 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">{sym.label} — {sym.sub}</p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-1">
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

        {/* ── Other: manual NIHSS input ── */}
        {selected['other'] && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
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
              className="w-24 rounded-lg border-2 border-gray-200 px-3 py-2 text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            />
          </div>
        )}

        {/* ── Disabling symptoms (NIHSS < 5) ── */}
        {showDisablingBlock && (
          <div className="border-t border-orange-100 pt-3 mt-1">
            <p className="text-xs font-bold text-orange-800 mb-2">¿El déficit es discapacitante?</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setHasDisabling(false)}
                className={`py-2 rounded-lg border-2 font-bold text-sm transition-all active:scale-95 ${
                  hasDisabling === false
                    ? 'border-slate-500 bg-slate-100 text-slate-800'
                    : 'border-gray-200 text-gray-500 hover:border-slate-400'
                }`}
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => setHasDisabling(true)}
                className={`py-2 rounded-lg border-2 font-bold text-sm transition-all active:scale-95 ${
                  hasDisabling === true
                    ? 'border-orange-500 bg-orange-100 text-orange-800'
                    : 'border-gray-200 text-gray-500 hover:border-orange-400'
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
                  <li key={s} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className="text-orange-400 shrink-0">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {hasDisabling === true && (
              <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold text-amber-700">
                  Déficit discapacitante: valorar trombolisis independientemente del NIHSS.
                </p>
              </div>
            )}
          </div>
        )}
      </StepCard>

      <PrimaryAction
        onClick={() => onConfirm({ symptoms: { ...selected }, nihssScore: total, hasDisablingSymptoms: hasDisabling })}
        valid={canContinue}
        disabledLabel={
          !hasSymptom
            ? 'Selecciona al menos un síntoma'
            : onlyOther && !otherScore
            ? 'Ingresa puntaje NIHSS'
            : 'Responde si el déficit es discapacitante'
        }
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>
    </div>
  )
}
