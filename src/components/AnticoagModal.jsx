import { useState } from 'react'
import { ShieldAlert, ChevronRight } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-red-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-red-200">Evaluación</p>
              <h2 className="text-white font-semibold text-base leading-tight">Anticoagulación</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm font-medium text-neutral-700">
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
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                    isActive
                      ? option.value
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Tipo de anticoagulante</p>
              <div className="grid grid-cols-3 gap-2">
                {ANTICOAG_TYPES.map(({ id, label }) => {
                  const isActive = type === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setType(id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-medium transition-all active:scale-[0.98] ${
                        isActive
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:border-red-200 hover:bg-red-50/30'
                      }`}
                    >
                      <SelectionCheck active={isActive} tone="red" />
                      {label}
                    </button>
                  )
                })}
              </div>

              {type && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-500" strokeWidth={2} />
                    <p className="text-xs text-red-600 leading-snug">
                      Anticoagulación activa: contraindicación relativa para trombolisis. Esperar laboratorio según droga.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {active === false && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 animate-fade-in">
              <p className="text-xs text-emerald-600">Sin anticoagulación activa — continuar evaluación.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Continuar <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
