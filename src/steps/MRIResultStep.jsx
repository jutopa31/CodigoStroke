import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Moon } from 'lucide-react'
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

export default function MRIResultStep({ onConfirm }) {
  const [mriRequestTime, setMriRequestTime] = useState(null)
  const [mismatch, setMismatch] = useState(null)

  useInterval(1000)

  const elapsed = timeSince(mriRequestTime)

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="6" title="RMN de encéfalo — ACV del despertar" accent="blue">

        {/* Wake-up badge */}
        <div className="flex items-center gap-2 mb-4 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
          <Moon size={14} className="text-indigo-600 shrink-0" />
          <span className="text-xs text-indigo-700 font-medium">Protocolo WAKE-UP activo — ventana &gt; 4.5h</span>
        </div>

        {/* Phase 1 — Request MRI */}
        {!mriRequestTime && (
          <>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Solicitá la RMN con secuencias <strong className="text-gray-600">DWI y FLAIR</strong> para evaluar elegibilidad por mismatch.
            </p>
            <button
              onClick={() => setMriRequestTime(new Date())}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-semibold rounded-xl transition-all"
            >
              <Moon size={18} /> Solicitar RMN DWI + FLAIR
            </button>
          </>
        )}

        {/* Phase 2 — Record result */}
        {mriRequestTime && (
          <>
            <div className="flex items-center gap-2 mb-5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 font-medium">RMN solicitada hace {elapsed}</span>
            </div>

            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Criterio de mismatch FLAIR-DWI</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>✅ <strong>DWI positivo</strong> — restricción de difusión presente</p>
                <p>✅ <strong>FLAIR negativo o sutil</strong> — sin cambios establecidos</p>
                <p className="text-gray-400 mt-1.5">→ Mismatch = lesión aguda &lt; ~4.5h → elegible para trombolisis</p>
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-4">
              ¿Presenta mismatch FLAIR-DWI?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMismatch(false)}
                className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                  mismatch === false
                    ? 'bg-gray-400 border-gray-400 text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                NO
              </button>
              <button
                onClick={() => setMismatch(true)}
                className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                  mismatch === true
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                    : 'border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                SÍ
              </button>
            </div>

            {mismatch === true && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-emerald-700 mb-1">✓ Mismatch presente — elegible para trombolisis</p>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  DWI+ / FLAIR− confirma lesión aguda. Continuar evaluación de contraindicaciones.
                </p>
              </div>
            )}
            {mismatch === false && (
              <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-amber-700 mb-1">Sin mismatch — trombolisis IV no indicada</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  No se cumplen criterios WAKE-UP. Evaluar trombectomía mecánica si corresponde.
                </p>
              </div>
            )}
          </>
        )}
      </StepCard>

      {mriRequestTime && (
        <button
          onClick={() => onConfirm({
            mismatch,
            mriRequestTime: mriRequestTime.toISOString(),
            mriElapsedSeconds: Math.floor((Date.now() - mriRequestTime.getTime()) / 1000),
          })}
          disabled={mismatch === null}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar <ChevronRight size={18} />
        </button>
      )}
    </div>
  )
}
