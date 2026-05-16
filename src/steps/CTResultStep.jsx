import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Scan, CheckCircle2, Droplets, Calculator } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'
import AspectModal from '../components/AspectModal'

function getAspectColor(score) {
  if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (score >= 6) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function getAspectLabel(score) {
  if (score >= 8) return 'Cambios leves'
  if (score >= 6) return 'Cambios moderados'
  return 'Cambios extensos'
}

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

export default function CTResultStep({ onConfirm, initialCtRequestTime = null, onCtRequest }) {
  const [ctRequestTime, setCtRequestTime] = useState(initialCtRequestTime)
  const [bleeding, setBleeding] = useState(null)
  const [aspectScore, setAspectScore] = useState('')
  const [showAspectModal, setShowAspectModal] = useState(false)

  useInterval(1000)

  const elapsed = timeSince(ctRequestTime)
  const tacConfirmed = Boolean(ctRequestTime)
  const aspectNum = aspectScore !== '' ? parseInt(aspectScore, 10) : null
  const aspectValid = aspectNum !== null && !isNaN(aspectNum) && aspectNum >= 0 && aspectNum <= 10
  const canContinue = bleeding !== null && (bleeding === true || aspectValid)

  function handleCtRequest() {
    const now = new Date()
    setCtRequestTime(now)
    onCtRequest?.(now)
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="5" title="TAC de encéfalo" accent="blue">
        {/* Split layout */}
        <div className="grid grid-cols-2 gap-3 min-h-[160px]">
          {/* Lado izquierdo — Solicitar TAC */}
          <div className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
            tacConfirmed
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-blue-300 bg-blue-50/50'
          }`}>
            {!tacConfirmed ? (
              <>
                <Scan size={28} className="text-blue-500 mb-3" />
                <p className="text-xs text-center text-blue-700 font-semibold mb-3 leading-snug">
                  TAC de encéfalo solicitada
                </p>
                <button
                  type="button"
                  onClick={handleCtRequest}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all"
                >
                  <Scan size={14} /> Solicitar
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 size={28} className="text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-emerald-700 text-center leading-snug">
                  TAC solicitada
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock size={11} className="text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 font-medium tabular-nums">{elapsed}</span>
                </div>
              </>
            )}
          </div>

          {/* Lado derecho — ¿Hay sangre? */}
          <div className={`flex flex-col rounded-xl border-2 p-4 transition-all ${
            !tacConfirmed
              ? 'border-gray-100 bg-gray-50/50 opacity-40 pointer-events-none'
              : bleeding === true
              ? 'border-red-300 bg-red-50'
              : bleeding === false
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-200 bg-white'
          }`}>
            <div className="flex items-center gap-1.5 mb-3">
              <Droplets size={15} className={tacConfirmed ? 'text-gray-600' : 'text-gray-300'} />
              <p className={`text-xs font-bold uppercase tracking-wide ${tacConfirmed ? 'text-gray-700' : 'text-gray-400'}`}>
                ¿Hay sangre?
              </p>
            </div>

            <div className="flex flex-col gap-2 flex-1 justify-center">
              <button
                type="button"
                disabled={!tacConfirmed}
                onClick={() => setBleeding(true)}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 border-2 ${
                  bleeding === true
                    ? 'border-red-500 bg-red-600 text-white shadow-sm'
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50 hover:border-red-400'
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                disabled={!tacConfirmed}
                onClick={() => setBleeding(false)}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all active:scale-95 border-2 ${
                  bleeding === false
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-sm'
                    : 'border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-400'
                }`}
              >
                No
              </button>
            </div>
          </div>
        </div>

        {/* Mensaje resultado */}
        {bleeding === true && (
          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-sm font-bold text-red-700 mb-1">Hemorragia intracraneal presente</p>
            <p className="text-xs text-red-600 leading-relaxed">
              Contraindicacion absoluta para trombolisis IV. No administrar rtPA ni TNK.
            </p>
          </div>
        )}
        {bleeding === false && (
          <>
            <div className="mt-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-700">
                TAC sin hemorragia: continuar evaluacion para trombolisis.
              </p>
            </div>

            {/* ASPECTS */}
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                ASPECTS — Puntaje de TC precoz
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0–10"
                  min={0}
                  max={10}
                  value={aspectScore}
                  onChange={(e) => setAspectScore(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowAspectModal(true)}
                  className="flex items-center gap-2 px-4 py-3.5 border border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
                >
                  <Calculator size={16} /> Calcular
                </button>
              </div>
              {aspectValid && (
                <div className={`mt-2 flex items-center gap-2 border rounded-xl px-3 py-2.5 animate-fade-in ${getAspectColor(aspectNum)}`}>
                  <span className="text-xl font-bold font-mono">{aspectNum}</span>
                  <span className="text-xs font-semibold">{getAspectLabel(aspectNum)}</span>
                </div>
              )}
            </div>
          </>
        )}
      </StepCard>

      {tacConfirmed && (
        <PrimaryAction
          onClick={() => onConfirm({
            bleeding,
            ctRequestTime: ctRequestTime.toISOString(),
            ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
            aspectScore: bleeding === false ? aspectNum : null,
          })}
          valid={canContinue}
          disabledLabel={bleeding === null ? "Registra resultado de TAC para continuar" : "Registra el puntaje ASPECTS para continuar"}
        >
          Continuar <ChevronRight size={18} />
        </PrimaryAction>
      )}

      {showAspectModal && (
        <AspectModal
          onLoad={(score) => { setAspectScore(String(score)); setShowAspectModal(false) }}
          onClose={() => setShowAspectModal(false)}
        />
      )}
    </div>
  )
}
