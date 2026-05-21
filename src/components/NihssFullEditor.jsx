import { useState } from 'react'
import { X } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

export default function NihssFullEditor({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((sum, item) => sum + (scores[item.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  function select(id, score) {
    setScores((prev) => ({ ...prev, [id]: score }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-display text-gray-800 text-lg">Escala NIHSS completa</h2>
            <p className="text-xs text-gray-400 mt-0.5">15 ítems · máximo 42 pts</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {nihssItems.map((item) => {
            const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
            const itemScore = scores[item.id] ?? 0

            return (
              <div key={item.id}>
                {/* Item header */}
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 mt-0.5 shrink-0 w-6">
                    {item.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">{label}</p>
                    {item.prompt && (
                      <p className="text-[11px] text-gray-500 italic mt-0.5 leading-snug">{item.prompt}</p>
                    )}
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${
                    itemScore > 0 ? 'text-amber-600' : 'text-neutral-300'
                  }`}>
                    {itemScore}
                  </span>
                </div>

                {/* Score options */}
                <div className="space-y-1 pl-8">
                  {item.options.map((opt) => {
                    const active = scores[item.id] === opt.score
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => select(item.id, opt.score)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                          active
                            ? 'bg-brand-600 border-brand-600 text-white'
                            : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50 active:scale-98'
                        }`}
                      >
                        <span className={`font-mono text-xs font-bold w-4 shrink-0 ${active ? 'text-white/80' : 'text-neutral-400'}`}>
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

        {/* Footer */}
        <div className={`shrink-0 border-t px-5 py-4 flex items-center gap-3 rounded-b-2xl ${severity.bg} ${severity.border} border-t`}>
          <div className="flex-1">
            <span className={`text-2xl font-bold tabular-nums ${severity.color}`}>{total}</span>
            <span className={`text-sm font-medium ml-2 ${severity.color}`}>{severity.label}</span>
          </div>
          <button
            type="button"
            onClick={() => onSave(scores)}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all"
          >
            Guardar · {total} pts
          </button>
        </div>
      </div>
    </div>
  )
}
