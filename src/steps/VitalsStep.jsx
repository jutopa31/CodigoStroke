import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronRight, Heart, Droplets } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'

function VitalAlert({ message, color = 'red' }) {
  const styles = {
    red:    { wrap: 'border-red-100 bg-red-50/50',    icon: 'text-red-500',    text: 'text-red-600'    },
    orange: { wrap: 'border-orange-100 bg-orange-50/50', icon: 'text-orange-500', text: 'text-orange-600' },
  }
  const s = styles[color] ?? styles.red
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${s.wrap}`}>
      <AlertTriangle size={12} className={`mt-0.5 shrink-0 ${s.icon}`} strokeWidth={2} />
      <p className={`text-xs leading-relaxed ${s.text}`}>{message}</p>
    </div>
  )
}

export default function VitalsStep({ onConfirm, isCollapsed = false }) {
  const [sys, setSys]         = useState('')
  const [dia, setDia]         = useState('')
  const [glucose, setGlucose] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const sysRef     = useRef(null)
  const diaRef     = useRef(null)
  const glucoseRef = useRef(null)

  // Abre el teclado al montar el componente
  useEffect(() => {
    const t = setTimeout(() => sysRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const sysNum  = parseInt(sys, 10)
  const diaNum  = parseInt(dia, 10)
  const glucNum = parseInt(glucose, 10)

  const taCritical    = sys     && sysNum  > 185
  const taDiaCritical = dia     && diaNum  > 110
  const glucLow       = glucose && glucNum < 50
  const glucHigh      = glucose && glucNum > 400

  const valid = !!(sys && dia && glucose)

  function handleConfirm() {
    if (!valid) return
    setConfirmed(true)
    onConfirm({ systolic: sysNum, diastolic: diaNum, glucose: glucNum })
  }

  function jumpOnEnter(e, ref) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    ref?.current?.focus()
  }

  const inputBase =
    'w-full rounded-xl border py-3 text-2xl font-semibold text-center text-neutral-800 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-neutral-300'

  const inputClass = (critical, filled) =>
    `${inputBase} ${
      critical
        ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
        : filled
          ? 'border-blue-300 bg-blue-50/30 focus:border-blue-400 focus:ring-blue-100'
          : 'border-neutral-200 bg-white focus:border-blue-300 focus:ring-blue-100'
    }`

  const glucoseInputClass =
    `${inputBase} ${
      glucLow || glucHigh
        ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
        : glucose
          ? 'border-violet-300 bg-violet-50/20 focus:border-violet-400 focus:ring-violet-100'
          : 'border-neutral-200 bg-white focus:border-violet-300 focus:ring-violet-100'
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
        <div className="space-y-5">

          {/* ── Tensión arterial ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Heart size={13} strokeWidth={2} className="text-blue-500" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Tensión arterial
              </span>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1.5 text-center font-medium">
                  Sistólica
                </label>
                <input
                  ref={sysRef}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={300}
                  placeholder="120"
                  value={sys}
                  onChange={(e) => setSys(e.target.value)}
                  onKeyDown={(e) => jumpOnEnter(e, diaRef)}
                  className={inputClass(taCritical, !!sys)}
                />
              </div>

              <div className="flex items-end pb-[14px] text-neutral-300 font-semibold text-xl select-none">
                /
              </div>

              <div className="flex-1">
                <label className="block text-xs text-neutral-500 mb-1.5 text-center font-medium">
                  Diastólica
                </label>
                <input
                  ref={diaRef}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={200}
                  placeholder="80"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  onKeyDown={(e) => jumpOnEnter(e, glucoseRef)}
                  className={inputClass(taDiaCritical, !!dia)}
                />
              </div>
            </div>

            <p className="text-center text-xs text-neutral-400 mt-1.5">mmHg</p>

            {(taCritical || taDiaCritical) && (
              <div className="space-y-1.5 mt-2">
                {taCritical    && <VitalAlert message="TA sistólica >185 mmHg — ajustar antes de trombolisis." />}
                {taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg — ajustar antes de trombolisis." />}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-neutral-100" />

          {/* ── Glucemia ── */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Droplets size={13} strokeWidth={2} className="text-violet-500" />
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Glucemia
              </span>
            </div>

            <div className="relative">
              <input
                ref={glucoseRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={900}
                placeholder="120"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && valid) { e.preventDefault(); handleConfirm() } }}
                className={`${glucoseInputClass} pr-16`}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-neutral-400">
                mg/dL
              </span>
            </div>

            {(glucLow || glucHigh) && (
              <div className="space-y-1.5 mt-2">
                {glucLow  && <VitalAlert message="Hipoglucemia <50 mg/dL — corregir; puede mimetizar ACV." />}
                {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL — controlar antes de proceder." color="orange" />}
              </div>
            )}
          </div>

        </div>
      </StepCard>

      <PrimaryAction onClick={handleConfirm} valid={valid} disabledLabel="Completa TA y glucemia">
        Continuar <ChevronRight size={16} strokeWidth={2} />
      </PrimaryAction>
    </div>
  )
}
