import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Scan } from 'lucide-react'
import StepCard from '../components/StepCard'

function useInterval(ms) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}

function timeSince(date) {
  if (!date) return null
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`
  return `${s} s`
}

export default function CTResultStep({ onConfirm }) {
  const [ctRequestTime, setCtRequestTime] = useState(null)
  const [bleeding, setBleeding] = useState(null)

  useInterval(1000)

  const elapsed = timeSince(ctRequestTime)

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="6" title="TC de encéfalo" accent="blue">

        {/* Phase 1 — Request */}
        {!ctRequestTime && (
          <>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Presioná el botón cuando se solicite la tomografía para registrar el tiempo.
            </p>
            <button
              onClick={() => setCtRequestTime(new Date())}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl transition-all"
            >
              <Scan size={18} /> Solicitar TC de encéfalo
            </button>
          </>
        )}

        {/* Phase 2 — Result */}
        {ctRequestTime && (
          <>
            <div className="flex items-center gap-2 mb-5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 font-medium">TC solicitada hace {elapsed}</span>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-4">
              ¿La TC presenta hemorragia intracraneal?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBleeding(true)}
                className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                  bleeding === true
                    ? 'bg-red-600 border-red-600 text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                SÍ
              </button>
              <button
                onClick={() => setBleeding(false)}
                className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                  bleeding === false
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                NO
              </button>
            </div>

            {bleeding === true && (
              <div className="mt-4 bg-red-50 border border-red-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-red-700 mb-1">🔴 Hemorragia intracraneal presente</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Contraindicación absoluta para trombolisis IV. No administrar rtPA ni TNK.
                </p>
              </div>
            )}
            {bleeding === false && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-xs font-semibold text-emerald-700">
                  ✓ TC sin hemorragia — continuar evaluación para trombolisis
                </p>
              </div>
            )}
          </>
        )}
      </StepCard>

      {ctRequestTime && (
        <button
          onClick={() => onConfirm({
            bleeding,
            ctRequestTime: ctRequestTime.toISOString(),
            ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
          })}
          disabled={bleeding === null}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}
