import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Scan, CheckCircle2, Droplets } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'

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

export default function CTResultStep({ onConfirm, initialCtRequestTime = null, onCtRequest, isCollapsed = false }) {
  const [ctRequestTime, setCtRequestTime] = useState(initialCtRequestTime)
  const [bleeding, setBleeding] = useState(null)

  useInterval(1000)

  const elapsed = timeSince(ctRequestTime)
  const tacConfirmed = Boolean(ctRequestTime)
  const canContinue = bleeding !== null

  function handleCtRequest() {
    const now = new Date()
    setCtRequestTime(now)
    onCtRequest?.(now)
  }

  function handleBleedingSelect(value) {
    if (!ctRequestTime) return

    setBleeding(value)
    onConfirm({
      bleeding: value,
      ctRequestTime: ctRequestTime.toISOString(),
      ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
    })
  }

  if (isCollapsed && bleeding !== null) {
    return (
      <CollapsedStep title="TAC de encéfalo">
        {bleeding ? 'Hemorragia intracraneal' : 'Sin hemorragia'}
      </CollapsedStep>
    )
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="5" title="TAC de encéfalo" accent="blue">
        <div className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
          !tacConfirmed
            ? 'border-blue-200 bg-blue-50/70 shadow-minimal'
            : bleeding === true
              ? 'border-red-200 bg-red-50/80 shadow-card'
              : bleeding === false
                ? 'border-emerald-200 bg-emerald-50/80 shadow-card'
                : 'border-blue-100 bg-white shadow-card'
        }`}>
          <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              tacConfirmed ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
            }`}>
              {tacConfirmed ? <CheckCircle2 size={21} strokeWidth={2.4} /> : <Scan size={21} strokeWidth={2.4} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className={`text-sm font-bold leading-tight ${tacConfirmed ? 'text-emerald-800' : 'text-blue-800'}`}>
                  {tacConfirmed ? 'TAC solicitada' : 'TAC de encéfalo'}
                </p>
                {tacConfirmed && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                    <Clock size={11} />
                    <span className="tabular-nums">{elapsed}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {!tacConfirmed ? (
            <div className="border-t border-blue-100 bg-white/60 p-3">
              <button
                type="button"
                onClick={handleCtRequest}
                className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-elevated transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                <Scan size={17} strokeWidth={2.5} />
                TAC solicitada
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-blue-100 bg-white/70 p-3 animate-scale-in">
              <button
                type="button"
                onClick={() => handleBleedingSelect(true)}
                className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                  bleeding === true
                    ? 'border-red-500 bg-red-600 text-white shadow-elevated'
                    : 'border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50'
                }`}
              >
                <Droplets size={17} strokeWidth={2.5} />
                Sí sangre
              </button>
              <button
                type="button"
                onClick={() => handleBleedingSelect(false)}
                className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                  bleeding === false
                    ? 'border-emerald-500 bg-emerald-600 text-white shadow-elevated'
                    : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 size={17} strokeWidth={2.5} />
                No sangre
              </button>
            </div>
          )}
        </div>

        {bleeding === true && (
          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-sm font-bold text-red-700 mb-1">Hemorragia intracraneal presente</p>
            <p className="text-xs text-red-600 leading-relaxed">
              Contraindicacion absoluta para trombolisis IV. No administrar rtPA ni TNK.
            </p>
          </div>
        )}
        {bleeding === false && (
          <div className="mt-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-xs font-semibold text-emerald-700">
              TAC sin hemorragia: continuar evaluación para trombolisis.
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              El puntaje ASPECTS se evaluará en el paso de trombectomía mecánica.
            </p>
          </div>
        )}
      </StepCard>

      {tacConfirmed && bleeding === null && (
        <PrimaryAction
          onClick={() => onConfirm({
            bleeding,
            ctRequestTime: ctRequestTime.toISOString(),
            ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
          })}
          valid={canContinue}
          disabledLabel="Registrá el resultado de la TAC para continuar"
        >
          Continuar <ChevronRight size={18} />
        </PrimaryAction>
      )}
    </div>
  )
}
