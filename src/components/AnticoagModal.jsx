import { useState } from 'react'
import { ShieldAlert, X, ChevronRight } from 'lucide-react'
import { SelectionCheck } from './GuidedControls'

const ANTICOAG_TYPES = [
  { id: 'doac', label: 'DOAC' },
  { id: 'heparina', label: 'Heparina' },
  { id: 'acenocumarol', label: 'Acenocumarol' },
]

export default function AnticoagModal({ isOpen, onConfirm }) {
  const [active, setActive] = useState(null)
  const [type, setType] = useState('')

  if (!isOpen) return null

  const needsType = active === true
  const canConfirm = active !== null && (!needsType || type)

  function handleAnswer(val) {
    setActive(val)
    if (!val) setType('')
  }

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm({ active, type: active ? type : '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-red-200">Evaluación</p>
              <h2 className="text-white font-bold text-lg leading-tight">Anticoagulación</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            ¿El paciente recibe anticoagulación?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'No', value: false },
              { label: 'Sí', value: true },
            ].map((option) => {
              const isActive = active === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleAnswer(option.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-base font-bold transition-all active:scale-95 ${
                    isActive
                      ? option.value
                        ? 'border-red-500 bg-red-50 text-red-800 shadow-sm ring-2 ring-red-100'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm ring-2 ring-emerald-100'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <SelectionCheck active={isActive} tone={option.value ? 'red' : 'green'} />
                  {option.label}
                </button>
              )
            })}
          </div>

          {needsType && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Tipo de anticoagulante</p>
              <div className="grid grid-cols-3 gap-2">
                {ANTICOAG_TYPES.map(({ id, label }) => {
                  const isActive = type === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setType(id)}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-3 text-sm font-bold transition-all active:scale-95 ${
                        isActive
                          ? 'border-red-500 bg-red-50 text-red-800 shadow-sm ring-2 ring-red-100'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                      }`}
                    >
                      <SelectionCheck active={isActive} tone="red" />
                      {label}
                    </button>
                  )
                })}
              </div>

              {type && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={15} className="shrink-0 mt-0.5 text-red-600" />
                    <p className="text-xs font-medium text-red-700 leading-snug">
                      Anticoagulacion activa: contraindicacion relativa para trombolisis. Esperar laboratorio segun droga.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {active === false && (
            <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in">
              <p className="text-xs font-medium text-emerald-700">Sin anticoagulacion activa — continuar evaluacion.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Continuar <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
