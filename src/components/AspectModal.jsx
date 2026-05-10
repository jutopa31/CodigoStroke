import { useState } from 'react'
import { X } from 'lucide-react'

const REGIONS = [
  {
    group: 'Estructuras profundas',
    items: [
      { id: 'C', label: 'C — Núcleo caudado' },
      { id: 'L', label: 'L — Núcleo lenticular' },
      { id: 'IC', label: 'IC — Cápsula interna' },
      { id: 'I', label: 'I — Cinta de la ínsula' },
    ],
  },
  {
    group: 'Corteza MCA (corte ganglio-basal)',
    items: [
      { id: 'M1', label: 'M1 — MCA anterior' },
      { id: 'M2', label: 'M2 — MCA lateral a ínsula' },
      { id: 'M3', label: 'M3 — MCA posterior' },
    ],
  },
  {
    group: 'Corteza MCA (corte supraganglio-basal)',
    items: [
      { id: 'M4', label: 'M4 — Frontal superior' },
      { id: 'M5', label: 'M5 — Parietal superior' },
      { id: 'M6', label: 'M6 — Occipital superior' },
    ],
  },
]

function getScoreColor(score) {
  if (score >= 8) return 'text-emerald-600'
  if (score >= 6) return 'text-amber-600'
  return 'text-red-600'
}

function getScoreLabel(score) {
  if (score >= 8) return 'Cambios leves'
  if (score >= 6) return 'Cambios moderados'
  return 'Cambios extensos'
}

export default function AspectModal({ onLoad, onClose }) {
  const [affected, setAffected] = useState({})

  const affectedCount = Object.values(affected).filter(Boolean).length
  const score = 10 - affectedCount

  function toggle(id) {
    setAffected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-2 pb-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-indigo-600 px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-indigo-200 text-xs uppercase tracking-wider">Calculadora</p>
            <h2 className="text-white font-bold text-lg">ASPECTS</h2>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors p-1">
            <X size={22} />
          </button>
        </div>

        {/* Score display */}
        <div className="px-5 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-bold font-mono ${getScoreColor(score)}`}>{score}</span>
            <span className="text-gray-400 text-sm">/10</span>
          </div>
          <p className={`text-xs font-semibold mt-1 ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
          <p className="text-xs text-gray-400 mt-1">
            Marcá las regiones con cambios isquémicos precoces (hipodensidad, pérdida de diferenciación)
          </p>
        </div>

        {/* Regions */}
        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4">
          {REGIONS.map(({ group, items }) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group}</p>
              <div className="space-y-2">
                {items.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      affected[id]
                        ? 'bg-red-50 border-red-300 text-red-800'
                        : 'border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      affected[id] ? 'bg-red-500 border-red-500' : 'border-gray-300'
                    }`}>
                      {affected[id] && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                    {affected[id] && <span className="ml-auto text-xs text-red-400 font-semibold">−1</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 shrink-0">
          <button
            onClick={() => onLoad(score)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all"
          >
            Usar ASPECTS {score}
          </button>
        </div>
      </div>
    </div>
  )
}
