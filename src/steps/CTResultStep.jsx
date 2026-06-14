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
    <div className="px-4 pb-4 space-y-3 md:px-0">
      <StepCard step="5" title="TAC de encéfalo" accent="blue">
        <div className={`overflow-hidden rounded-xl transition-colors duration-200 ${
          !tacConfirmed
            ? ''
            : bleeding === true
              ? 'bg-status-critical/10'
              : bleeding === false
                ? 'bg-emerald-500/10'
                : ''
        }`}>
          <div className="flex items-start gap-3 px-3 py-3">
            <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
              tacConfirmed ? 'bg-emerald-500/100 text-stroke-bg' : 'bg-brand-600 text-white'
            }`}>
              {tacConfirmed ? <CheckCircle2 size={21} strokeWidth={2.4} /> : <Scan size={21} strokeWidth={2.4} />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className={`text-sm font-bold leading-tight ${tacConfirmed ? 'text-emerald-300' : 'text-blue-300'}`}>
                  {tacConfirmed ? 'TAC solicitada' : 'TAC de encéfalo'}
                </p>
                {tacConfirmed && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-stroke-bg px-2 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                    <Clock size={11} />
                    <span className="tabular-nums">{elapsed}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {!tacConfirmed ? (
            <div className="border-t border-blue-500/30 bg-stroke-bg p-2.5">
              <button
                type="button"
                onClick={handleCtRequest}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg btn-primary px-4 py-2.5 text-sm font-bold text-white transition-all active:scale-[0.98]"
              >
                <Scan size={17} strokeWidth={2.5} />
                TAC solicitada
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-blue-500/30 bg-stroke-bg p-2.5 animate-scale-in">
              <button
                type="button"
                onClick={() => handleBleedingSelect(true)}
                className={`flex min-h-[46px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  bleeding === true
                    ? 'border-status-critical bg-status-critical text-white shadow-elevated'
                    : 'border-status-critical/30 bg-stroke-navy text-red-300 hover:border-status-critical/50 hover:bg-status-critical/10'
                }`}
              >
                <Droplets size={17} strokeWidth={2.5} />
                Sí sangre
              </button>
              <button
                type="button"
                onClick={() => handleBleedingSelect(false)}
                className={`flex min-h-[46px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
                  bleeding === false
                    ? 'border-emerald-500 bg-emerald-700 text-white shadow-elevated'
                    : 'border-emerald-500/30 bg-stroke-navy text-emerald-300 hover:border-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <CheckCircle2 size={17} strokeWidth={2.5} />
                No sangre
              </button>
            </div>
          )}
        </div>

        {bleeding === true && (
          <div className="mt-3 bg-status-critical/10 border border-status-critical/40 rounded-lg px-3 py-2.5 animate-fade-in">
            <p className="text-sm font-bold text-red-300 mb-1">Hemorragia intracraneal presente</p>
            <p className="text-xs text-red-300 leading-relaxed">
              Contraindicacion absoluta para trombolisis IV. No administrar rtPA ni TNK.
            </p>
          </div>
        )}
        {bleeding === false && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-300 rounded-lg px-3 py-2.5 animate-fade-in">
            <p className="text-xs font-semibold text-emerald-300">
              TAC sin hemorragia: continuar evaluación para trombolisis.
            </p>
            <p className="text-xs text-emerald-400 mt-1">
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
