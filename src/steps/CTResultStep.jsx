import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Scan } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction, SectionPrompt, SelectableButton } from '../components/GuidedControls'

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

  useInterval(1000)

  const elapsed = timeSince(ctRequestTime)

  function handleCtRequest() {
    const now = new Date()
    setCtRequestTime(now)
    onCtRequest?.(now)
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="6" title="TC de encefalo" accent="blue">
        {!ctRequestTime && (
          <>
            <SectionPrompt
              tone="blue"
              title="Solicita la TC"
              helper="Registra el momento exacto del pedido de tomografia."
              complete={false}
              status="Pendiente"
            />
            <button
              type="button"
              onClick={handleCtRequest}
              className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold rounded-xl transition-all"
            >
              <Scan size={18} /> Solicitar TC de encefalo
            </button>
          </>
        )}

        {ctRequestTime && (
          <>
            <div className="flex items-center gap-2 mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-2.5">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 font-medium">TC solicitada hace {elapsed}</span>
            </div>

            <SectionPrompt
              tone="blue"
              title="Registra resultado de TC"
              helper="Selecciona SI si hay hemorragia; NO si permite continuar evaluacion."
              complete={bleeding !== null}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectableButton
                onClick={() => setBleeding(true)}
                active={bleeding === true}
                tone="red"
                className="flex items-center justify-center gap-2 py-5 font-bold text-xl"
              >
                SI
              </SelectableButton>
              <SelectableButton
                onClick={() => setBleeding(false)}
                active={bleeding === false}
                tone="green"
                className="flex items-center justify-center gap-2 py-5 font-bold text-xl"
              >
                NO
              </SelectableButton>
            </div>

            {bleeding === true && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-red-700 mb-1">Hemorragia intracraneal presente</p>
                <p className="text-xs text-red-600 leading-relaxed">
                  Contraindicacion absoluta para trombolisis IV. No administrar rtPA ni TNK.
                </p>
              </div>
            )}
            {bleeding === false && (
              <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-xs font-semibold text-emerald-700">
                  TC sin hemorragia: continuar evaluacion para trombolisis
                </p>
              </div>
            )}
          </>
        )}
      </StepCard>

      {ctRequestTime && (
        <PrimaryAction
          onClick={() => onConfirm({
            bleeding,
            ctRequestTime: ctRequestTime.toISOString(),
            ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
          })}
          valid={bleeding !== null}
          disabledLabel="Registra resultado de TC para continuar"
        >
          Continuar <ChevronRight size={18} />
        </PrimaryAction>
      )}
    </div>
  )
}
