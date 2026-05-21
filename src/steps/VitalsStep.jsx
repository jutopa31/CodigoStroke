import { useRef, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" strokeWidth={2} />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

export default function VitalsStep({ onConfirm, isCollapsed = false }) {
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const diaRef = useRef(null)
  const glucoseRef = useRef(null)

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)

  const taCritical = sys && sysNum > 185
  const taDiaCritical = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400

  const valid = !!(sys && dia && glucose)

  function handleConfirm() {
    if (!valid) return
    setConfirmed(true)
    onConfirm({ systolic: sysNum, diastolic: diaNum, glucose: glucNum })
  }

  function focusOnEnter(e, ref) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    ref.current?.focus()
  }

  const fieldClass = (critical, filled) =>
    `h-11 w-20 rounded-xl border bg-neutral-50 px-2 text-center text-base font-semibold text-neutral-800 outline-none transition placeholder:text-neutral-300 ${
      critical
        ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : filled
          ? 'border-blue-300 bg-blue-50/30 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          : 'border-neutral-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100'
    }`

  if (isCollapsed && confirmed) {
    return (
      <CollapsedStep title="Signos vitales">
        TA {sys}/{dia} mmHg · Glucemia {glucose} mg/dL
      </CollapsedStep>
    )
  }

  return (
    <div className="space-y-3">
      <StepCard step="3" title="Signos vitales" accent="blue">
        <div className="space-y-2.5">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-neutral-600 flex-1">
              TA sistólica <span className="text-xs text-neutral-400">mmHg</span>
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="185"
              value={sys}
              onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => focusOnEnter(e, diaRef)}
              autoFocus
              className={fieldClass(taCritical, !!sys)}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-neutral-600 flex-1">
              TA diastólica <span className="text-xs text-neutral-400">mmHg</span>
            </span>
            <input
              ref={diaRef}
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="110"
              value={dia}
              onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => focusOnEnter(e, glucoseRef)}
              className={fieldClass(taDiaCritical, !!dia)}
            />
          </label>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-neutral-600 flex-1">
              Glucemia <span className="text-xs text-neutral-400">mg/dL</span>
            </span>
            <input
              ref={glucoseRef}
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="120"
              value={glucose}
              onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => { if (e.key === 'Enter' && valid) { e.preventDefault(); handleConfirm() } }}
              className={fieldClass(glucLow || glucHigh, !!glucose)}
            />
          </label>
        </div>

        {(taCritical || taDiaCritical || glucLow || glucHigh) && (
          <div className="space-y-2 pt-3">
            {taCritical && <VitalAlert message="TA sistólica >185 mmHg: ajustar antes de trombolisis." />}
            {!taCritical && taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg: ajustar antes de trombolisis." />}
            {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
            {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
          </div>
        )}
      </StepCard>

      <PrimaryAction onClick={handleConfirm} valid={valid} disabledLabel="Completa TA y glucemia">
        Continuar <ChevronRight size={16} strokeWidth={2} />
      </PrimaryAction>
    </div>
  )
}
