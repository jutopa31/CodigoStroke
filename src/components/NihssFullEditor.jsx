import { useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

export default function NihssFullEditor({ scores: initialScores, onSave, onClose, guided }) {
  const [scores, setScores] = useState(() =>
    guided
      ? {}
      : Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )
  const [currentIdx, setCurrentIdx] = useState(0)

  const total = nihssItems.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const dirty = Object.keys(scores).length > 0

  function select(id, score) {
    setScores((prev) => ({ ...prev, [id]: score }))
  }

  function selectGuided(score) {
    const item = nihssItems[currentIdx]
    setScores((prev) => ({ ...prev, [item.id]: score }))
    if (currentIdx < nihssItems.length - 1) {
      setTimeout(() => setCurrentIdx((c) => c + 1), 280)
    }
  }

  function handleClose() {
    if (guided && dirty && !window.confirm('¿Descartar el NIHSS en progreso?')) return
    onClose()
  }

  if (guided) {
    const item = nihssItems[currentIdx]
    const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
    const isLast = currentIdx === nihssItems.length - 1

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 animate-fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-down">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-display text-gray-800 text-lg">Escala NIHSS completa</h2>
              <p className="text-xs text-gray-400 mt-0.5">{currentIdx + 1} de {nihssItems.length} · máx 42 pts</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="h-1 bg-gray-100">
            <div className="h-1 bg-brand-600 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / nihssItems.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ítem {currentIdx + 1} de {nihssItems.length}</p>
            <p className="font-semibold text-gray-800 mb-1 leading-snug">{label}</p>
            {item.prompt && <p className="text-xs text-gray-500 italic mb-4 leading-snug">{item.prompt}</p>}
            <div className="space-y-2 mt-4">
              {item.options.map((opt) => {
                const active = item.id in scores && scores[item.id] === opt.score
                return (
                  <button key={opt.score} type="button" onClick={() => selectGuided(opt.score)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-[0.99] ${
                      active
                        ? 'bg-brand-600 border-brand-600 text-white font-medium'
                        : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                    }`}>
                    <span className="font-mono text-xs opacity-60 mr-2">{opt.score}</span>
                    {opt.text}
                  </button>
                )
              })}
            </div>
          </div>

          {isLast && dirty && (
            <div className={`mx-5 mb-3 rounded-xl border px-4 py-3 ${severity.bg} ${severity.border} animate-fade-in`}>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold tabular-nums ${severity.color}`}>{total}</span>
                <span className={`text-sm font-medium ${severity.color}`}>{severity.label}</span>
              </div>
            </div>
          )}

          <div className="px-5 pb-5 flex gap-3">
            <button onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))} disabled={currentIdx === 0}
              className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft size={18} />
            </button>
            {!isLast && (
              <button onClick={() => setCurrentIdx((c) => c + 1)}
                className="flex-1 flex items-center justify-center gap-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors">
                Siguiente <ChevronRight size={16} />
              </button>
            )}
            {isLast && (
              <button type="button" onClick={() => onSave(scores)}
                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all">
                Guardar · {total} pts
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Non-guided: existing scroll behavior unchanged
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-display text-gray-800 text-lg">Escala NIHSS completa</h2>
            <p className="text-xs text-gray-400 mt-0.5">15 ítems · máximo 42 pts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {nihssItems.map((item) => {
            const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
            const itemScore = scores[item.id] ?? 0
            return (
              <div key={item.id}>
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 mt-0.5 shrink-0 w-6">{item.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{label}</p>
                    {item.prompt && <p className="text-[11px] text-gray-500 italic mt-0.5 leading-snug">{item.prompt}</p>}
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${itemScore > 0 ? 'text-amber-600' : 'text-neutral-300'}`}>{itemScore}</span>
                </div>
                <div className="space-y-1 pl-8">
                  {item.options.map((opt) => {
                    const active = scores[item.id] === opt.score
                    return (
                      <button key={opt.score} type="button" onClick={() => select(item.id, opt.score)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                          active
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50 active:scale-98'
                        }`}>
                        <span className={`font-mono text-xs font-bold w-4 shrink-0 ${active ? 'text-white/80' : 'text-neutral-400'}`}>{opt.score}</span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className={`shrink-0 border-t px-5 py-4 flex items-center gap-3 rounded-b-2xl ${severity.bg} ${severity.border} border-t`}>
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
