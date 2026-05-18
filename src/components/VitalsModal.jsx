import { useEffect, useRef, useState } from 'react'
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
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-500" strokeWidth={2} />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

function useVisualViewportHeight() {
  const [height, setHeight] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const viewport = window.visualViewport
    const updateHeight = () => setHeight(Math.round(viewport?.height ?? window.innerHeight))

    updateHeight()
    viewport?.addEventListener('resize', updateHeight)
    window.addEventListener('resize', updateHeight)

    return () => {
      viewport?.removeEventListener('resize', updateHeight)
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return height
}

export default function VitalsModal({ isOpen, onConfirm }) {
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')
  const [mrs, setMrs] = useState('')
  const [showMrsHelp, setShowMrsHelp] = useState(false)
  const diaRef = useRef(null)
  const glucoseRef = useRef(null)
  const mrsRef = useRef(null)
  const visualViewportHeight = useVisualViewportHeight()

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

  function focusOnEnter(event, ref) {
    if (event.key !== 'Enter') return
    event.preventDefault()
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-4 pt-[max(3.75rem,env(safe-area-inset-top,0px))] backdrop-blur-sm sm:items-center sm:py-4"
      style={visualViewportHeight ? { '--visual-viewport-height': `${visualViewportHeight}px` } : undefined}
    >
      <div className="w-full max-w-md max-h-[calc(var(--visual-viewport-height,100svh)-4.5rem)] overflow-y-auto bg-white rounded-2xl shadow-modal animate-scale-in sm:max-h-[calc(100svh-2rem)]">
        {/* Header */}
        <div className="bg-brand-600 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Activity size={18} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-200">Evaluación inicial</p>
              <h2 className="text-white font-semibold text-base leading-tight">Signos vitales y funcionalidad</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          <div className="space-y-2.5">
            {/* TAS */}
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
                onKeyDown={(event) => focusOnEnter(event, diaRef)}
                autoFocus
                className={fieldClass(taCritical, !!sys)}
              />
            </label>

            {/* TAD */}
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
                onKeyDown={(event) => focusOnEnter(event, glucoseRef)}
                className={fieldClass(taDiaCritical, !!dia)}
              />
            </label>

            {/* Glucemia */}
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
                onKeyDown={(event) => focusOnEnter(event, mrsRef)}
                className={fieldClass(glucLow || glucHigh, !!glucose)}
              />
            </label>

            {/* mRS */}
            <div className="flex items-center justify-between gap-3 relative">
              <span className="text-sm font-medium text-neutral-600 flex-1 flex items-center gap-1.5">
                mRS previo
                <button
                  type="button"
                  onMouseEnter={() => setShowMrsHelp(true)}
                  onMouseLeave={() => setShowMrsHelp(false)}
                  className="text-neutral-300 hover:text-neutral-500 transition-colors"
                >
                  <HelpCircle size={12} strokeWidth={2} />
                </button>
              </span>
              <input
                ref={mrsRef}
                type="text"
                inputMode="numeric"
                maxLength={1}
                placeholder="0-5"
                value={mrs}
                onChange={(e) => handleMrsChange(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && valid) {
                    event.preventDefault()
                    handleConfirm()
                  }
                }}
                className={`h-11 w-20 rounded-xl border bg-neutral-50 px-2 text-center text-base font-semibold text-neutral-800 outline-none transition placeholder:text-neutral-300 ${
                  mrsValid
                    ? 'border-neutral-400 bg-neutral-50 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100'
                    : 'border-neutral-200 focus:border-neutral-300 focus:ring-2 focus:ring-neutral-100'
                }`}
              />
              {showMrsHelp && (
                <div className="absolute right-0 top-[50px] z-30 w-52 rounded-xl border border-neutral-100 bg-white p-3 text-xs shadow-modal">
                  {MRS_OPTIONS.map((o) => (
                    <div key={o.score} className="grid grid-cols-[18px_1fr] gap-2 py-0.5">
                      <span className="font-semibold text-neutral-800">{o.score}</span>
                      <span className="text-neutral-600">{o.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(taCritical || taDiaCritical || glucLow || glucHigh) && (
            <div className="space-y-2 pt-1">
              {taCritical && <VitalAlert message="TA sistólica >185 mmHg: ajustar antes de trombolisis." />}
              {!taCritical && taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg: ajustar antes de trombolisis." />}
              {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
              {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Iniciar protocolo <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
