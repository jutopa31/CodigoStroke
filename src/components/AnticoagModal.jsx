import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { SelectionCheck } from './GuidedControls'

const ANTICOAG_TYPES = [
  { id: 'doac', label: 'DOAC' },
  { id: 'heparina', label: 'Heparina' },
  { id: 'acenocumarol', label: 'Acenocumarol' },
]

export default function AnticoagModal({ isOpen, onConfirm }) {
  const [active, setActive] = useState(null)

  if (!isOpen) return null

  function handleNo() {
    setActive(false)
    onConfirm({ active: false, type: '' })
  }

  function handleTypeSelect(id) {
    setActive(true)
    onConfirm({ active: true, type: id })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-brand-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">Evaluación</p>
              <h2 className="text-white font-semibold text-base leading-tight">Anticoagulación</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm font-medium text-neutral-700">
            ¿El paciente recibe anticoagulación?
          </p>

          {/* NO / SÍ — auto-confirm on NO */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={active === false}
              onClick={handleNo}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                active === false
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <SelectionCheck active={active === false} tone="green" />
              No
            </button>
            <button
              type="button"
              aria-pressed={active === true}
              onClick={() => setActive(true)}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
                active === true
                  ? 'border-blue-200 bg-blue-50 text-blue-800'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <SelectionCheck active={active === true} tone="blue" />
              Sí
            </button>
          </div>

          {/* Drug type — auto-confirm when selected */}
          {active === true && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Tipo — toca para confirmar</p>
              <div className="grid grid-cols-3 gap-2">
                {ANTICOAG_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTypeSelect(id)}
                    className="flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50/60 py-3 text-xs font-semibold text-blue-800 hover:bg-blue-100 active:scale-[0.97] transition-all"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5 text-blue-700" strokeWidth={2} />
                  <p className="text-xs text-blue-800 leading-snug">
                    Anticoagulación activa: contraindicación relativa. Esperar laboratorio según droga.
                  </p>
                </div>
              </div>
            </div>
          )}

          {active === false && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 animate-fade-in">
              <p className="text-xs text-emerald-600">Sin anticoagulación activa — continuando...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
