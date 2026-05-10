import { useState } from 'react'
import { ChevronRight, Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'
import { getNihssSeverity } from '../content/nihss'

const DISABLING_SYMPTOMS_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulación o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiración',
  'Negligencia / heminegligencia severa',
  'Ataxia severa — imposibilidad de caminar sin asistencia',
]

export default function NihssStep({ onConfirm }) {
  const [score, setScore] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [hasDisabling, setHasDisabling] = useState(null)
  const [showList, setShowList] = useState(false)

  const num = parseInt(score, 10)
  const valid = score !== '' && num >= 0 && num <= 42
  const severity = valid ? getNihssSeverity(num) : null
  const showDisablingBlock = valid && num < 5

  const canContinue = valid && (!showDisablingBlock || hasDisabling !== null)

  function handleLoad(result) {
    setScore(String(result))
    setShowModal(false)
  }

  return (
    <div className="px-4 pb-4 space-y-3">
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
          </div>
        )}
      </StepCard>

      {/* Disabling symptoms block — only when NIHSS < 5 */}
      {showDisablingBlock && (
        <StepCard step="" title="Síntomas discapacitantes" accent="orange">
          <p className="text-xs text-gray-400 mb-4 leading-relaxed">
            NIHSS bajo pero puede haber déficits que justifiquen trombolisis. ¿El paciente presenta síntomas discapacitantes?
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={() => setHasDisabling(false)}
              className={`py-3.5 rounded-xl border-2 font-bold text-base transition-all active:scale-95 ${
                hasDisabling === false
                  ? 'bg-gray-200 border-gray-300 text-gray-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              NO
            </button>
            <button
              onClick={() => setHasDisabling(true)}
              className={`py-3.5 rounded-xl border-2 font-bold text-base transition-all active:scale-95 ${
                hasDisabling === true
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              SÍ
            </button>
          </div>

          {/* Expandable reference list */}
          <button
            onClick={() => setShowList((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showList ? 'Ocultar ejemplos' : 'Ver ejemplos de síntomas discapacitantes'}
          </button>

          {showList && (
            <ul className="mt-2 space-y-1.5 animate-fade-in">
              {DISABLING_SYMPTOMS_LIST.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                  {s}
                </li>
              ))}
            </ul>
          )}

          {hasDisabling === true && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-amber-700">
                ⚡ Déficit discapacitante — indicación de trombolisis independientemente del puntaje NIHSS
              </p>
            </div>
          )}
        </StepCard>
      )}

      <button
        onClick={() => onConfirm({ nihssScore: num, hasDisablingSymptoms: hasDisabling })}
        disabled={!canContinue}
        className="w-full mt-0 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ChevronRight size={18} />
      </button>

      {showModal && <NihssModal onLoad={handleLoad} onClose={() => setShowModal(false)} />}
    </div>
  )
}
