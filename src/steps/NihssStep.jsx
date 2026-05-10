import { useState } from 'react'
import { ChevronRight, Calculator } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'
import { getNihssSeverity } from '../content/nihss'

export default function NihssStep({ onConfirm }) {
  const [score, setScore] = useState('')
  const [showModal, setShowModal] = useState(false)

  const num = parseInt(score, 10)
  const valid = score !== '' && num >= 0 && num <= 42
  const severity = valid ? getNihssSeverity(num) : null

  function handleLoad(result) {
    setScore(String(result))
    setShowModal(false)
  }

  return (
    <div className="px-4 pb-4">
      <StepCard step="4" title="Escala NIHSS" accent="orange">
        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
          Ingresá el puntaje directamente o usá la calculadora guiada (0–42 puntos).
        </p>

        {/* Direct input */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="number"
            inputMode="numeric"
            placeholder="0–42"
            min={0}
            max={42}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder-gray-300"
          />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-3.5 border border-orange-300 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
          >
            <Calculator size={16} /> Calcular
          </button>
        </div>

        {/* Severity badge */}
        {severity && (
          <div className={`rounded-xl border px-4 py-3 ${severity.bg} ${severity.border} animate-fade-in`}>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${severity.color}`}>{num}</span>
              <span className={`font-semibold text-sm ${severity.color}`}>{severity.label}</span>
            </div>
            {num >= 6 && (
              <p className="text-xs text-gray-500 mt-1">NIHSS ≥6 → considerar angio-TC para evaluar oclusión de gran vaso</p>
            )}
          </div>
        )}
      </StepCard>

      <button
        onClick={() => onConfirm({ nihssScore: num })}
        disabled={!valid}
        className="w-full mt-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ChevronRight size={18} />
      </button>

      {showModal && <NihssModal onLoad={handleLoad} onClose={() => setShowModal(false)} />}
    </div>
  )
}
