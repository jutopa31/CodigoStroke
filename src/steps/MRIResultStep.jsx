import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Moon } from 'lucide-react'
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

export default function MRIResultStep({ onConfirm }) {
  const [mriRequestTime, setMriRequestTime] = useState(null)
  const [mismatch, setMismatch] = useState(null)

  useInterval(1000)

  const elapsed = timeSince(mriRequestTime)

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="5" title="RMN de encefalo - ACV del despertar" accent="blue">
        <div className="flex items-center gap-2 mb-4 bg-indigo-50 border-2 border-indigo-200 rounded-lg px-3 py-2">
          <Moon size={14} className="text-indigo-600 shrink-0" />
          <span className="text-xs text-indigo-700 font-medium">Protocolo WAKE-UP activo: evaluar mismatch</span>
        </div>

        {!mriRequestTime && (
          <>
            <SectionPrompt
              tone="blue"
              title="Solicita RMN DWI + FLAIR"
              helper="Registra el pedido para continuar con criterio de mismatch."
              complete={false}
              status="Pendiente"
            />
            <button
              type="button"
              onClick={() => setMriRequestTime(new Date())}
              className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-semibold rounded-xl transition-all"
            >
              <Moon size={18} /> Solicitar RMN DWI + FLAIR
            </button>
          </>
        )}

        {mriRequestTime && (
          <>
            <div className="flex items-center gap-2 mb-4 bg-blue-50 border-2 border-blue-200 rounded-lg px-3 py-2.5">
              <Clock size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 font-medium">RMN solicitada hace {elapsed}</span>
            </div>

            <div className="mb-4 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Criterio de mismatch FLAIR-DWI</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>DWI positivo: restriccion de difusion presente</p>
                <p>FLAIR negativo o sutil: sin cambios establecidos</p>
                <p className="text-gray-400 mt-1.5">Mismatch = lesion aguda potencialmente elegible.</p>
              </div>
            </div>

            <SectionPrompt
              tone="blue"
              title="Registra mismatch FLAIR-DWI"
              helper="Selecciona SI si cumple criterio de mismatch."
              complete={mismatch !== null}
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectableButton
                onClick={() => setMismatch(false)}
                active={mismatch === false}
                tone="gray"
                className="flex items-center justify-center gap-2 py-5 font-bold text-xl"
              >
                NO
              </SelectableButton>
              <SelectableButton
                onClick={() => setMismatch(true)}
                active={mismatch === true}
                tone="green"
                className="flex items-center justify-center gap-2 py-5 font-bold text-xl"
              >
                SI
              </SelectableButton>
            </div>

            {mismatch === true && (
              <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-emerald-700 mb-1">Mismatch presente: elegible segun protocolo</p>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  Continuar evaluacion de contraindicaciones.
                </p>
              </div>
            )}
            {mismatch === false && (
              <div className="mt-4 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-sm font-bold text-amber-700 mb-1">Sin mismatch: trombolisis IV no indicada</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Evaluar trombectomia mecanica si corresponde.
                </p>
              </div>
            )}
          </>
        )}
      </StepCard>

      {mriRequestTime && (
        <PrimaryAction
          onClick={() => onConfirm({
            mismatch,
            mriRequestTime: mriRequestTime.toISOString(),
            mriElapsedSeconds: Math.floor((Date.now() - mriRequestTime.getTime()) / 1000),
          })}
          valid={mismatch !== null}
          disabledLabel="Registra mismatch para continuar"
        >
          Continuar <ChevronRight size={18} />
        </PrimaryAction>
      )}
    </div>
  )
}
