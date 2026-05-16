import { useState, useEffect } from 'react'
import { AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction, SectionPrompt } from '../components/GuidedControls'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin sintomas' },
  { score: 1, label: 'Sin discapacidad significativa' },
  { score: 2, label: 'Discapacidad leve' },
  { score: 3, label: 'Discapacidad moderada' },
  { score: 4, label: 'Moderadamente severa' },
  { score: 5, label: 'Discapacidad severa' },
]

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
      <AlertTriangle size={14} className="mt-0.5 shrink-0 text-red-500" />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

function CompactInput({ label, value, onChange, placeholder, danger = false, maxLength, suffix, hint }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block truncate text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, maxLength))}
          className={`h-12 w-full rounded-lg border-2 bg-slate-50 px-3 text-center text-lg font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
            danger
              ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : value
              ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-0.5 block text-[10px] text-slate-400">{hint}</span>}
    </label>
  )
}

export default function VitalsStep({ onConfirm }) {
  const [mrs, setMrs] = useState('')
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')
  const [showMrsHelp, setShowMrsHelp] = useState(false)

  const mrsNum = parseInt(mrs, 10)
  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)

  const mrsValid = mrs !== '' && mrsNum >= 0 && mrsNum <= 5
  const taCritical = sys && sysNum > 185
  const taDia = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400
  const valid = mrsValid && sys && dia && glucose
  const mrsLabel = MRS_OPTIONS.find((option) => option.score === mrsNum)?.label ?? ''

  function handleMrsChange(value) {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    if (digit === '' || Number(digit) <= 5) setMrs(digit)
  }

  function handleSubmit() {
    if (!valid) return
    onConfirm({
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
      modifiedRankinScale: {
        score: mrsNum,
        label: mrsLabel,
      },
    })
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && valid) handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [valid, handleSubmit])

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="2" title="SV y Status previo" accent="blue">
        <SectionPrompt
          tone="blue"
          title="Completa tension arterial y glucemia"
          helper="Los campos completos quedan marcados; los valores criticos se destacan en rojo."
          complete={Boolean(valid)}
        />

        {/* TA — unified CompactInput */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Tensión arterial (mmHg)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <CompactInput label="Sistólica" value={sys} onChange={setSys} placeholder="185" danger={Boolean(taCritical)} maxLength={3} suffix="mmHg" hint="Normal: <140" />
            <CompactInput label="Diastólica" value={dia} onChange={setDia} placeholder="110" danger={Boolean(taDia)} maxLength={3} suffix="mmHg" hint="Normal: <90" />
          </div>
        </div>

        {/* Glucemia */}
        <div className="mb-4">
          <CompactInput label="Glucemia" value={glucose} onChange={setGlucose} placeholder="120" danger={Boolean(glucLow || glucHigh)} maxLength={3} suffix="mg/dL" hint="Normal: 70–140" />
        </div>

        {/* mRS — propia fila */}
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rankin previo (mRS)
            </label>
            <button
              type="button"
              onClick={() => setShowMrsHelp((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
            >
              <HelpCircle size={14} />
            </button>
          </div>

          {showMrsHelp && (
            <div className="mb-2 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm animate-fade-in">
              {MRS_OPTIONS.map((option) => (
                <div key={option.score} className="grid grid-cols-[22px_1fr] gap-2 py-0.5">
                  <span className="font-bold text-slate-900">{option.score}</span>
                  <span className="text-slate-600">{option.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-6 gap-1.5">
            {MRS_OPTIONS.map((option) => (
              <button
                key={option.score}
                type="button"
                onClick={() => handleMrsChange(String(option.score))}
                className={`py-2.5 rounded-lg border-2 text-sm font-bold transition-all active:scale-95 ${
                  mrsNum === option.score
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                    : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50/40'
                }`}
              >
                {option.score}
              </button>
            ))}
          </div>
          {mrsValid && (
            <p className="mt-1.5 text-xs text-blue-600 animate-fade-in">{mrsLabel}</p>
          )}
        </div>

        {(taCritical || taDia || glucLow || glucHigh) && (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {taCritical && <VitalAlert message="TA sistolica >185 mmHg: ajustar antes de trombolisis." />}
            {!taCritical && taDia && <VitalAlert message="TA diastolica >110 mmHg: ajustar antes de trombolisis." />}
            {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
            {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
          </div>
        )}
      </StepCard>

      <PrimaryAction
        onClick={handleSubmit}
        valid={Boolean(valid)}
        disabledLabel="Completa mRS, TA y glucemia"
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>
    </div>
  )
}
