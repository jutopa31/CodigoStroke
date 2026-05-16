import { useState } from 'react'
import { Activity, HelpCircle, ChevronRight, AlertTriangle } from 'lucide-react'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas' },
  { score: 1, label: 'Sin discapacidad significativa' },
  { score: 2, label: 'Discapacidad leve' },
  { score: 3, label: 'Discapacidad moderada' },
  { score: 4, label: 'Moderadamente severa' },
  { score: 5, label: 'Discapacidad severa' },
]

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
  const [mrs, setMrs] = useState('')
  const [showMrsHelp, setShowMrsHelp] = useState(false)

  if (!isOpen) return null

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)
  const mrsNum = parseInt(mrs, 10)

  const taCritical = sys && sysNum > 185
  const taDiaCritical = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400
  const mrsValid = mrs !== '' && mrsNum >= 0 && mrsNum <= 5

  const valid = sys && dia && glucose && mrsValid

  function handleMrsChange(value) {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    if (digit === '' || Number(digit) <= 5) setMrs(digit)
  }

  function handleConfirm() {
    if (!valid) return
    onConfirm({
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
      modifiedRankinScale: { score: mrsNum, label: MRS_OPTIONS.find((o) => o.score === mrsNum)?.label ?? '' },
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

            {/* mRS */}
            <div className="flex items-center justify-between gap-3 relative">
              <span className="text-sm font-semibold text-slate-600 flex-1 flex items-center gap-1">
                mRS previo
                <button
                  type="button"
                  onMouseEnter={() => setShowMrsHelp(true)}
                  onMouseLeave={() => setShowMrsHelp(false)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <HelpCircle size={12} />
                </button>
              </span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={1}
                placeholder="0-5"
                value={mrs}
                onChange={(e) => handleMrsChange(e.target.value)}
                className={`h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
                  mrsValid
                    ? 'border-slate-500 bg-slate-50 focus:border-slate-600 focus:ring-2 focus:ring-slate-100'
                    : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                }`}
              />
              {showMrsHelp && (
                <div className="absolute right-0 top-[46px] z-30 w-56 rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-xl">
                  {MRS_OPTIONS.map((o) => (
                    <div key={o.score} className="grid grid-cols-[18px_1fr] gap-1.5 py-0.5">
                      <span className="font-bold text-slate-900">{o.score}</span>
                      <span className="text-slate-600">{o.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
