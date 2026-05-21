import { useState } from 'react'
import { Activity, ChevronRight, AlertTriangle } from 'lucide-react'

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

export default function VitalsModal({ isOpen, onConfirm }) {
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')

  if (!isOpen) return null

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)

  const taCritical = sys && sysNum > 185
  const taDiaCritical = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400

  const valid = sys && dia && glucose

  function handleConfirm() {
    if (!valid) return
    onConfirm({
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
    })
  }

  const fieldClass = (critical, filled) =>
    `h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
      critical
        ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
        : filled
        ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="bg-brand-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-200">Evaluación inicial</p>
              <h2 className="text-white font-bold text-lg leading-tight">Signos vitales y funcionalidad</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <div className="space-y-2">
            {/* TAS */}
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600 flex-1">
                TA sistólica <span className="text-xs font-normal text-slate-400">mmHg</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="185"
                value={sys}
                onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className={fieldClass(taCritical, !!sys)}
              />
            </label>

            {/* TAD */}
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600 flex-1">
                TA diastólica <span className="text-xs font-normal text-slate-400">mmHg</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="110"
                value={dia}
                onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className={fieldClass(taDiaCritical, !!dia)}
              />
            </label>

            {/* Glucemia */}
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600 flex-1">
                Glucemia <span className="text-xs font-normal text-slate-400">mg/dL</span>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="120"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
                className={fieldClass(glucLow || glucHigh, !!glucose)}
              />
            </label>

          </div>

          {(taCritical || taDiaCritical || glucLow || glucHigh) && (
            <div className="space-y-1.5">
              {taCritical && <VitalAlert message="TA sistólica >185 mmHg: ajustar antes de trombolisis." />}
              {!taCritical && taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg: ajustar antes de trombolisis." />}
              {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
              {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Iniciar protocolo <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
