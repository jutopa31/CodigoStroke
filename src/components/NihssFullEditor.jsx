import { useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

// ── Guided wizard mode (one item at a time) ──────────────────────────────────

function GuidedWizard({ onSave, onClose }) {
  const [scores, setScores] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)

  const item = nihssItems[currentIdx]
  const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
  const isLast = currentIdx === nihssItems.length - 1
  const dirty = Object.keys(scores).length > 0
  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  function select(score) {
    const newScores = { ...scores, [item.id]: score }
    setScores(newScores)
    if (!isLast) setTimeout(() => setCurrentIdx((c) => c + 1), 260)
  }

  function handleClose() {
    if (dirty && !window.confirm('¿Descartar el NIHSS en progreso?')) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-down">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-base font-bold text-neutral-800">Escala NIHSS</h2>
            <p className="text-xs text-neutral-400 mt-0.5 tabular-nums">
              Ítem {currentIdx + 1} de {nihssItems.length}
            </p>
          </div>
          <button onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mb-4 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIdx + 1) / nihssItems.length) * 100}%` }} />
        </div>

        {/* Item content */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="mb-1">
            <span className="inline-block text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-1">{item.id}</span>
            <p className="text-base font-semibold text-neutral-800 leading-snug">{label}</p>
            {item.prompt && (
              <p className="text-xs text-neutral-500 italic mt-1.5 leading-relaxed border-l-2 border-neutral-200 pl-2.5">{item.prompt}</p>
            )}
          </div>

          <div className="space-y-2 mt-4">
            {item.options.map((opt) => {
              const active = item.id in scores && scores[item.id] === opt.score
              return (
                <button key={opt.score} type="button" onClick={() => select(opt.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150 active:scale-[0.99] ${
                    active
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}>
                  <span className={`font-mono text-xs font-bold mr-3 ${active ? 'text-white/70' : 'text-neutral-400'}`}>{opt.score}</span>
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>

        {/* Score summary on last item */}
        {isLast && dirty && (
          <div className={`mx-5 mb-3 rounded-xl border-2 px-4 py-3 ${severity.bg} ${severity.border} animate-fade-in`}>
            <p className="text-xs font-semibold opacity-60 mb-0.5">Puntaje total</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold tabular-nums ${severity.color}`}>{total}</span>
              <span className={`text-sm font-medium ${severity.color}`}>{severity.label}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-5 pb-5 flex gap-2 pt-2 border-t border-neutral-100 mt-1">
          <button onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))} disabled={currentIdx === 0}
            className="w-11 h-11 flex items-center justify-center border-2 border-neutral-200 rounded-xl text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors">
            <ChevronLeft size={18} />
          </button>

          {!isLast ? (
            <button onClick={() => setCurrentIdx((c) => c + 1)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-neutral-200 rounded-xl text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors">
              Siguiente <ChevronRight size={15} />
            </button>
          ) : (
            <button type="button" onClick={() => onSave(scores)}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all shadow-sm">
              Guardar · {total} pts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline adjust view (embedded in step card, compact) ──────────────────────

function InlineAdjust({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  return (
    <div className="rounded-xl border-2 border-neutral-200 overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">Revisión completa</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">Ajustá ítems individuales si es necesario</p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-neutral-200 text-neutral-500 hover:bg-neutral-300 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Items — compact score buttons */}
      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
        {nihssItems.map((item) => {
          const shortLabel = item.label.replace(/^\d+[abc]?\.\s*/i, '').replace('NC –', '').replace('Motor brazo –', 'Brazo').replace('Motor pierna –', 'Pierna').trim()
          const score = scores[item.id] ?? 0
          return (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-mono font-bold text-neutral-400 w-5 shrink-0">{item.id}</span>
              <span className="text-xs font-medium text-neutral-700 flex-1 leading-snug">{shortLabel}</span>
              <div className="flex gap-1 shrink-0">
                {item.options.map((opt) => (
                  <button key={opt.score} type="button"
                    title={opt.text}
                    onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                    className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                      score === opt.score
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}>
                    {opt.score}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className={`flex items-center gap-3 px-4 py-3 border-t-2 ${severity.bg} ${severity.border}`}>
        <div className="flex-1 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
          <span className={`text-sm font-medium ${severity.color}`}>{severity.label}</span>
        </div>
        <button type="button" onClick={() => onSave(scores)}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ── Public component ─────────────────────────────────────────────────────────

export default function NihssFullEditor({ scores, onSave, onClose, guided, inline }) {
  if (guided) return <GuidedWizard onSave={onSave} onClose={onClose} />
  if (inline) return <InlineAdjust scores={scores} onSave={onSave} onClose={onClose} />

  // Scroll modal — used by NihssModal-adjacent callers in other steps
  return <ScrollModal scores={scores} onSave={onSave} onClose={onClose} />
}

function ScrollModal({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <div>
            <h2 className="font-bold text-neutral-800 text-base">Escala NIHSS completa</h2>
            <p className="text-xs text-neutral-400 mt-0.5">15 ítems · máximo 42 pts</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {nihssItems.map((item) => {
            const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
            const itemScore = scores[item.id] ?? 0
            return (
              <div key={item.id}>
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 mt-0.5 shrink-0 w-6">{item.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800 leading-snug">{label}</p>
                    {item.prompt && <p className="text-[11px] text-neutral-500 italic mt-0.5 leading-snug">{item.prompt}</p>}
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${itemScore > 0 ? 'text-amber-600' : 'text-neutral-300'}`}>{itemScore}</span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {item.options.map((opt) => {
                    const active = scores[item.id] === opt.score
                    return (
                      <button key={opt.score} type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                          active
                            ? 'border-brand-600 bg-brand-600 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-brand-300 hover:bg-brand-50'
                        }`}>
                        <span className={`font-mono text-xs font-bold w-4 shrink-0 ${active ? 'text-white/70' : 'text-neutral-400'}`}>{opt.score}</span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className={`shrink-0 border-t-2 px-5 py-4 flex items-center gap-3 rounded-b-2xl ${severity.bg} ${severity.border}`}>
          <div className="flex-1">
            <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
            <span className={`text-sm font-medium ml-2 ${severity.color}`}>{severity.label}</span>
          </div>
          <button type="button" onClick={() => onSave(scores)}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all">
            Guardar · {total} pts
          </button>
        </div>
      </div>
    </div>
  )
}
