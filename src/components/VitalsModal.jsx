import { useEffect, useRef, useState } from 'react'
import { Activity, ChevronRight, AlertTriangle } from 'lucide-react'


function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-status-critical/30 bg-status-critical/10 px-3 py-2">
      <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-400" strokeWidth={2} />
      <p className="text-xs leading-relaxed text-red-400">{message}</p>
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
  const diaRef = useRef(null)
  const glucoseRef = useRef(null)
  const visualViewportHeight = useVisualViewportHeight()

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
    onConfirm({ systolic: sysNum, diastolic: diaNum, glucose: glucNum })
  }

  function focusOnEnter(event, ref) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    ref.current?.focus()
  }

  const fieldClass = (critical, filled) =>
    `h-11 w-20 rounded-xl border bg-stroke-bg px-2 text-center text-base font-semibold text-stroke-text outline-none transition placeholder:text-stroke-textMuted ${
      critical
        ? 'border-red-300 bg-status-critical/10 focus:border-red-400 focus:ring-2 focus:ring-status-critical/30'
        : filled
          ? 'border-blue-300 bg-blue-500/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
          : 'border-stroke-line focus:border-stroke-iconActive/50 focus:ring-2 focus:ring-blue-500/30'
    }`

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 pb-4 pt-[max(3.75rem,env(safe-area-inset-top,0px))] backdrop-blur-sm sm:items-center sm:py-4"
      style={visualViewportHeight ? { '--visual-viewport-height': `${visualViewportHeight}px` } : undefined}
    >
      <div className="w-full max-w-md max-h-[calc(var(--visual-viewport-height,100svh)-4.5rem)] overflow-y-auto bg-stroke-navy rounded-2xl shadow-modal animate-scale-in sm:max-h-[calc(100svh-2rem)]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stroke-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stroke-iconActive/15 flex items-center justify-center shrink-0">
              <Activity size={18} className="text-stroke-iconActive" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted">Evaluación inicial</p>
              <h2 className="text-stroke-text font-semibold text-base leading-tight">Signos vitales</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-3">
          <div className="space-y-2.5">
            {/* TAS */}
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-stroke-textMuted flex-1">
                TA sistólica <span className="text-xs text-stroke-textMuted">mmHg</span>
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
              <span className="text-sm font-medium text-stroke-textMuted flex-1">
                TA diastólica <span className="text-xs text-stroke-textMuted">mmHg</span>
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
              <span className="text-sm font-medium text-stroke-textMuted flex-1">
                Glucemia <span className="text-xs text-stroke-textMuted">mg/dL</span>
              </span>
              <input
                ref={glucoseRef}
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="120"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
                onKeyDown={(event) => { if (event.key === 'Enter' && valid) { event.preventDefault(); handleConfirm() } }}
                className={fieldClass(glucLow || glucHigh, !!glucose)}
              />
            </label>

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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed btn-primary text-white"
          >
            Iniciar protocolo <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}
