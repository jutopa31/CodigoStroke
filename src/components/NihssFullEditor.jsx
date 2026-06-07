import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

// ── Severity badge colors ────────────────────────────────────────────────────

const SEV_BADGE = {
  'Sin déficit':    'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Leve':           'bg-sky-100 text-sky-700 border-sky-200',
  'Moderado':       'bg-amber-100 text-amber-700 border-amber-200',
  'Moderado-grave': 'bg-orange-100 text-orange-700 border-orange-300',
  'Grave':          'bg-red-100 text-red-700 border-red-200',
  'Muy grave':      'bg-red-200 text-red-800 border-red-400',
}

// ── Guided wizard modal ──────────────────────────────────────────────────────

function GuidedWizard({ onSave, onClose }) {
  const [scores, setScores] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)

  const item = nihssItems[currentIdx]
  const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
  const isLast = currentIdx === nihssItems.length - 1
  const dirty = Object.keys(scores).length > 0
  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const badgeClass = SEV_BADGE[severity.label] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'
  const progress = ((currentIdx + 1) / nihssItems.length) * 100

  function select(score) {
    const newScores = { ...scores, [item.id]: score }
    setScores(newScores)
    if (!isLast) setTimeout(() => setCurrentIdx((c) => c + 1), 240)
  }

  function handleClose() {
    if (dirty && !window.confirm('¿Descartar el NIHSS en progreso?')) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-1 bg-brand-600 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">{item.id}</span>
              <span className="text-[10px] text-neutral-300">·</span>
              <span className="text-[10px] text-neutral-400 tabular-nums">{currentIdx + 1} / {nihssItems.length}</span>
            </div>
            <p className="text-base font-bold text-neutral-800 mt-0.5 leading-snug">{label}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Prompt */}
        {item.prompt && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-[11px] text-amber-800 leading-relaxed">{item.prompt}</p>
          </div>
        )}

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="space-y-2">
            {item.options.map((opt) => {
              const active = item.id in scores && scores[item.id] === opt.score
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => select(opt.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150 active:scale-[0.99] ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300 hover:bg-brand-50/60'
                  }`}
                >
                  <span className={`font-mono text-xs font-black mr-3 ${active ? 'text-white/60' : 'text-neutral-300'}`}>
                    {opt.score}
                  </span>
                  <span className="font-medium">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Score preview on last item */}
        {isLast && dirty && (
          <div className="mx-5 mb-3 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl font-black tabular-nums text-neutral-800">{total}</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${badgeClass}`}>{severity.label}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="px-5 pb-5 pt-2 border-t border-neutral-100 flex gap-2">
          <button
            onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))}
            disabled={currentIdx === 0}
            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-25 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {!isLast ? (
            <button
              onClick={() => setCurrentIdx((c) => c + 1)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-neutral-200 text-neutral-600 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(scores)}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm"
            >
              Guardar · {total} pts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline scroll — full NIHSS editor embedded (no modal overlay) ─────────────

function InlineScroll({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const badgeClass = SEV_BADGE[severity.label] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'

  return (
    <div className="rounded-2xl border-2 border-neutral-200 overflow-hidden bg-white animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div>
          <p className="text-xs font-bold text-neutral-700">Escala NIHSS — ingreso manual</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">15 ítems · seleccioná una opción por ítem</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 hover:bg-neutral-200 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-5">
        {nihssItems.map((item) => {
          const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
          const itemScore = scores[item.id] ?? 0
          return (
            <div key={item.id}>
              {/* Item label + score */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-neutral-300 mt-0.5 shrink-0 w-6 text-right">{item.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-800 leading-snug">{label}</p>
                  {item.prompt && (
                    <p className="text-[11px] text-amber-700 mt-1 leading-relaxed bg-amber-50 rounded-lg px-2.5 py-1.5 border border-amber-100">
                      {item.prompt}
                    </p>
                  )}
                </div>
                <span className={`text-sm font-black tabular-nums shrink-0 min-w-[1.5rem] text-right ${itemScore > 0 ? 'text-amber-600' : 'text-neutral-200'}`}>
                  {itemScore}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-1.5 pl-8">
                {item.options.map((opt) => {
                  const active = scores[item.id] === opt.score
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                        active
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-neutral-200 text-neutral-700 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                    >
                      <span className={`font-mono text-xs font-black w-4 shrink-0 ${active ? 'text-white/50' : 'text-neutral-300'}`}>
                        {opt.score}
                      </span>
                      <span className="leading-snug">{opt.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Sticky footer with total */}
      <div className={`border-t-2 px-4 py-3 flex items-center gap-3 ${severity.bg} ${severity.border}`}>
        <div className="flex items-baseline gap-2 flex-1">
          <span className={`text-2xl font-black tabular-nums ${severity.color}`}>{total}</span>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${badgeClass}`}>
            {severity.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSave(scores)}
          className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all shadow-sm"
        >
          Guardar · {total} pts
        </button>
      </div>
    </div>
  )
}

// ── Inline adjust (compact pill buttons — for post-score corrections) ─────────

function InlineAdjust({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  return (
    <div className="rounded-xl border-2 border-neutral-200 overflow-hidden bg-white animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 border-b border-neutral-200">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ajuste por ítem</p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-neutral-100">
        {nihssItems.map((item) => {
          const shortLabel = item.label
            .replace(/^\d+[abc]?\.\s*/i, '')
            .replace('NC –', '')
            .replace('Motor brazo –', 'Brazo')
            .replace('Motor pierna –', 'Pierna')
            .trim()
          const score = scores[item.id] ?? 0
          return (
            <div key={item.id} className="flex items-center gap-2.5 px-3 py-2">
              <span className="text-[10px] font-mono font-bold text-neutral-300 w-5 shrink-0 text-right">{item.id}</span>
              <span className="text-xs text-neutral-600 flex-1 leading-tight truncate">{shortLabel}</span>
              <div className="flex gap-1 shrink-0">
                {item.options.map((opt) => (
                  <button
                    key={opt.score}
                    type="button"
                    title={opt.text}
                    onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                    className={`min-w-[26px] h-6 px-1 rounded-lg text-[11px] font-black transition-all active:scale-90 ${
                      score === opt.score
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    {opt.score}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 border-t-2 ${severity.bg} ${severity.border}`}>
        <div className="flex items-baseline gap-2 flex-1">
          <span className={`text-xl font-black tabular-nums ${severity.color}`}>{total}</span>
          <span className={`text-xs font-bold ${severity.color} opacity-70`}>{severity.label}</span>
        </div>
        <button
          type="button"
          onClick={() => onSave(scores)}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs hover:bg-brand-700 active:scale-95 transition-all"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ── Public API ───────────────────────────────────────────────────────────────

export default function NihssFullEditor({ scores, onSave, onClose, guided, inlineScroll, inline }) {
  if (guided)       return <GuidedWizard onSave={onSave} onClose={onClose} />
  if (inlineScroll) return <InlineScroll scores={scores} onSave={onSave} onClose={onClose} />
  if (inline)       return <InlineAdjust scores={scores} onSave={onSave} onClose={onClose} />
  return <ScrollModal scores={scores} onSave={onSave} onClose={onClose} />
}

// ── Scroll modal (used by DosageStep and other steps) ────────────────────────

function ScrollModal({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const badgeClass = SEV_BADGE[severity.label] ?? 'bg-neutral-100 text-neutral-600 border-neutral-200'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div>
            <p className="font-bold text-neutral-800 text-sm">Escala NIHSS completa</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">15 ítems · máximo 42 pts</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-400 hover:bg-neutral-200 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {nihssItems.map((item) => {
            const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
            const itemScore = scores[item.id] ?? 0
            return (
              <div key={item.id}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-300 mt-0.5 shrink-0 w-6">{item.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 leading-snug">{label}</p>
                    {item.prompt && <p className="text-[11px] text-neutral-400 italic mt-0.5 leading-snug">{item.prompt}</p>}
                  </div>
                  <span className={`text-sm font-black tabular-nums shrink-0 ${itemScore > 0 ? 'text-amber-600' : 'text-neutral-200'}`}>
                    {itemScore}
                  </span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {item.options.map((opt) => {
                    const active = scores[item.id] === opt.score
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        <span className={`font-mono text-xs font-black w-4 shrink-0 ${active ? 'text-white/50' : 'text-neutral-300'}`}>
                          {opt.score}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className={`shrink-0 border-t-2 px-5 py-4 flex items-center gap-3 ${severity.bg} ${severity.border}`}>
          <div className="flex-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black tabular-nums ${severity.color}`}>{total}</span>
            <span className={`text-sm font-semibold ${severity.color} opacity-70`}>{severity.label}</span>
          </div>
          <button
            type="button"
            onClick={() => onSave(scores)}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all"
          >
            Guardar · {total} pts
          </button>
        </div>
      </div>
    </div>
  )
}
