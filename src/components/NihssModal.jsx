import { useState } from 'react'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

export default function NihssModal({ onLoad, onClose }) {
  const [scores, setScores] = useState({})
  const [current, setCurrent] = useState(0)

  const item = nihssItems[current]
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const answered = Object.keys(scores).length
  const allDone = answered === nihssItems.length
  const severity = getNihssSeverity(total)

  function select(score) {
    const next = { ...scores, [item.id]: score }
    setScores(next)
    if (current < nihssItems.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 280)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-display text-gray-800 text-lg">Calculadora NIHSS</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {answered}/{nihssItems.length} ítems completados
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-brand-600 transition-all duration-300"
            style={{ width: `${(answered / nihssItems.length) * 100}%` }}
          />
        </div>

        {/* Item */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            Ítem {current + 1} de {nihssItems.length}
          </p>
          <p className="font-semibold text-gray-800 mb-4 leading-snug">{item.label}</p>

          <div className="space-y-2">
            {item.options.map((opt) => {
              const selected = scores[item.id] === opt.score
              return (
                <button
                  key={opt.score}
                  onClick={() => select(opt.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    selected
                      ? 'bg-brand-600 border-brand-600 text-white font-medium'
                      : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50 active:scale-98'
                  }`}
                >
                  <span className="font-mono text-xs opacity-60 mr-2">{opt.score}</span>
                  {opt.text}
                </button>
              )
            })}
          </div>
        </div>

        {/* Score display */}
        {allDone && (
          <div className={`mx-5 mb-3 rounded-xl border px-4 py-3 ${severity.bg} ${severity.border} animate-fade-in`}>
            <p className="text-xs text-gray-500 mb-1">Puntaje total</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${severity.color}`}>{total}</span>
              <span className={`text-sm font-medium ${severity.color}`}>{severity.label}</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {current < nihssItems.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex-1 flex items-center justify-center gap-1 py-3 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : null}

          {allDone && (
            <button
              onClick={() => onLoad(total)}
              className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all"
            >
              Cargar resultado ({total} pts)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
