import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Brain, Heart, Droplets, X, RotateCcw } from 'lucide-react'
import NihssModal from './NihssModal'

function getNihssSeverity(score) {
  if (score === 0)  return { label: 'Normal',          color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
  if (score <= 4)   return { label: 'Leve',            color: 'text-emerald-300',    bg: 'bg-emerald-500/15',    border: 'border-emerald-500/30' }
  if (score <= 15)  return { label: 'Moderado',        color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' }
  if (score <= 20)  return { label: 'Moderado-severo', color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-orange-100' }
  return                   { label: 'Severo',          color: 'text-blue-300',    bg: 'bg-blue-500/15',   border: 'border-blue-500/30' }
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

function ModalShell({ title, onClose, onConfirm, confirmLabel = 'Registrar', confirmDisabled = false, children }) {
  const visualViewportHeight = useVisualViewportHeight()

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto px-4 pb-4 pt-[max(3.5rem,env(safe-area-inset-top,0px))] sm:items-center sm:p-4"
      style={visualViewportHeight ? { '--visual-viewport-height': `${visualViewportHeight}px` } : undefined}
      onClick={onClose}
    >
      <div
        className="bg-stroke-navy w-full max-w-xs max-h-[calc(var(--visual-viewport-height,100svh)-4rem)] overflow-y-auto rounded-2xl shadow-modal animate-scale-in sm:max-h-[calc(100svh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-line">
          <h2 className="font-semibold text-stroke-text text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-stroke-textMuted hover:text-stroke-textMuted transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {children}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-stroke-line rounded-xl text-stroke-textMuted text-sm font-medium hover:bg-stroke-bg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex-1 py-2.5 btn-primary text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function NihssQuickModal({ onClose, onConfirm }) {
  const [value, setValue] = useState('')
  const [showCalculator, setShowCalculator] = useState(false)

  const num = parseInt(value, 10)
  const isValid = value !== '' && !isNaN(num) && num >= 0 && num <= 42
  const severity = isValid ? getNihssSeverity(num) : null

  function handleConfirm() {
    if (!isValid) return
    onConfirm(num)
    onClose()
  }

  if (showCalculator) {
    return (
      <NihssModal
        onLoad={(score) => { onConfirm(score); onClose() }}
        onClose={() => setShowCalculator(false)}
      />
    )
  }

  return (
    <ModalShell
      title="Nuevo NIHSS"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!isValid}
    >
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={42}
        placeholder="0 – 42"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="w-full bg-stroke-bg border border-stroke-line rounded-xl px-4 py-3 text-2xl font-semibold text-center text-stroke-text focus:outline-none focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive/40 transition"
      />

      {severity && (
        <div className={`mt-3 rounded-xl border px-4 py-2.5 text-center animate-fade-in ${severity.bg} ${severity.border}`}>
          <span className={`text-sm font-semibold ${severity.color}`}>
            {num} pts — {severity.label}
          </span>
        </div>
      )}

      {value !== '' && !isValid && (
        <p className="mt-2 text-xs text-blue-300 text-center">Ingresá un valor entre 0 y 42</p>
      )}

      <button
        type="button"
        onClick={() => setShowCalculator(true)}
        className="mt-3 w-full text-xs text-stroke-iconActive font-medium text-center hover:text-stroke-iconActive transition-colors"
      >
        Usar calculadora NIHSS completa
      </button>
    </ModalShell>
  )
}

function VitalsQuickModal({ onClose, onConfirm }) {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')

  const sysNum = parseInt(systolic, 10)
  const diaNum = parseInt(diastolic, 10)
  const isValid =
    systolic !== '' && diastolic !== '' &&
    !isNaN(sysNum) && !isNaN(diaNum) &&
    sysNum > 0 && diaNum > 0
  const highAlert = isValid && sysNum > 185

  function handleConfirm() {
    if (!isValid) return
    onConfirm({ systolic: sysNum, diastolic: diaNum })
    onClose()
  }

  return (
    <ModalShell
      title="Nueva tensión arterial"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!isValid}
    >
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-xs text-stroke-textMuted mb-1.5 text-center font-medium">Sistólica</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="120"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            autoFocus
            className="w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 py-3 text-xl font-semibold text-center text-stroke-text focus:outline-none focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive/50 transition"
          />
        </div>

        <div className="flex items-end pb-3 text-stroke-textMuted font-semibold text-lg">/</div>

        <div className="flex-1">
          <label className="block text-xs text-stroke-textMuted mb-1.5 text-center font-medium">Diastólica</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            className="w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 py-3 text-xl font-semibold text-center text-stroke-text focus:outline-none focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive/50 transition"
          />
        </div>
      </div>

      {highAlert && (
        <p className="mt-3 text-xs text-blue-300 font-medium text-center animate-fade-in">
          TA sistólica &gt; 185 mmHg — considerar manejo antes de trombolisis
        </p>
      )}
    </ModalShell>
  )
}

function GlucoseQuickModal({ onClose, onConfirm }) {
  const [value, setValue] = useState('')

  const num = parseInt(value, 10)
  const isValid = value !== '' && !isNaN(num) && num > 0
  const isHypo  = isValid && num < 50
  const isHyper = isValid && num > 400

  function handleConfirm() {
    if (!isValid) return
    onConfirm(num)
    onClose()
  }

  return (
    <ModalShell
      title="Nueva glucemia"
      onClose={onClose}
      onConfirm={handleConfirm}
      confirmDisabled={!isValid}
    >
      <div>
        <label className="mb-1.5 block text-xs font-medium text-stroke-textMuted">Glucemia</label>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="120"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="w-full bg-stroke-bg border border-stroke-line rounded-xl py-3 pl-4 pr-16 text-2xl font-semibold text-center text-stroke-text focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-status-glucose/40 transition placeholder:text-stroke-textMuted"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-stroke-textMuted">
            mg/dL
          </span>
        </div>
      </div>

      {isHypo && (
        <p className="mt-3 text-xs text-blue-300 font-medium text-center animate-fade-in">
          Hipoglucemia — descartar como causa del cuadro
        </p>
      )}

      {isHyper && (
        <p className="mt-3 text-xs text-amber-400 font-medium text-center animate-fade-in">
          Hiperglucemia severa (&gt;400 mg/dL)
        </p>
      )}
    </ModalShell>
  )
}

export default function QuickAddFAB({
  onAddNihss,
  onAddVitals,
  onAddGlucose,
  onReset,
  latestNihss = null,
  latestVitals = null,
  latestGlucose = null,
  variant = 'floating',
}) {
  const [openModal, setOpenModal] = useState(null)

  const buttons = [
    {
      id: 'nihss',
      label: 'NIHSS',
      Icon: Brain,
      colorClass: 'bg-stroke-navy text-status-warning border-status-warning-border hover:bg-status-warning-muted',
      badge: latestNihss !== null ? String(latestNihss) : null,
      badgeClass: 'bg-status-warning-badge text-white',
    },
    {
      id: 'vitals',
      label: 'TA',
      Icon: Heart,
      colorClass: 'bg-stroke-navy text-status-info border-status-info-border hover:bg-status-info-muted',
      badge: latestVitals ? String(latestVitals.systolic) : null,
      badgeClass: latestVitals && latestVitals.systolic > 185 ? 'bg-status-critical text-white' : 'bg-status-info-badge text-white',
    },
    {
      id: 'glucose',
      label: 'GLC',
      Icon: Droplets,
      colorClass: 'bg-stroke-navy text-status-glucose border-status-glucose-border hover:bg-status-glucose-muted',
      badge: latestGlucose !== null ? String(latestGlucose) : null,
      badgeClass: latestGlucose < 50 ? 'bg-status-critical text-white' : latestGlucose > 400 ? 'bg-status-warning text-white' : 'bg-status-glucose-badge text-white',
    },
  ]

  const isSidebar = variant === 'sidebar'
  const isMobileToolbar = variant === 'mobile-toolbar'
  const isCompactRow = variant === 'compact-row'

  const has4thBtn = onReset

  const containerClass = isMobileToolbar
    ? `grid w-full ${has4thBtn ? 'grid-cols-4' : 'grid-cols-3'} gap-2`
    : isSidebar
      ? `grid ${has4thBtn ? 'grid-cols-4' : 'grid-cols-3'} gap-2`
      : isCompactRow
        ? 'flex items-center gap-1.5'
        : 'flex flex-col gap-2'
  const buttonClass = isMobileToolbar || isSidebar
    ? 'relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border text-[10px] font-semibold active:scale-[0.98] transition-transform'
    : isCompactRow
      ? 'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold active:scale-[0.97] transition-transform'
      : 'relative w-10 h-10 rounded-xl border flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform'
  const resetClass = isMobileToolbar || isSidebar
    ? 'relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg text-[10px] font-semibold active:scale-[0.98] transition-transform'
    : isCompactRow
      ? 'relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg text-[11px] font-semibold active:scale-[0.97] transition-transform'
      : 'w-10 h-10 rounded-xl border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform'
  const iconSize = isCompactRow ? 13 : 14
  const labelClass = isMobileToolbar || isSidebar ? 'text-[10px] font-semibold leading-none' : isCompactRow ? 'text-[11px] font-semibold leading-none' : 'text-[9px] font-semibold leading-none'

  return (
    <>
      <div className={containerClass}>
        {buttons.map(({ id, label, Icon, colorClass, badge, badgeClass }) => (
          <button
            key={id}
            onClick={() => setOpenModal(id)}
            title={`Agregar ${label}`}
            className={`${buttonClass} ${colorClass}`}
          >
            <Icon size={iconSize} strokeWidth={2} />
            <span className={labelClass}>{label}</span>
            {badge !== null && (
              <span className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-md text-[9px] font-semibold flex items-center justify-center leading-none ${badgeClass}`}>
                {badge}
              </span>
            )}
          </button>
        ))}
        {onReset && (
          <button
            onClick={onReset}
            title="Reiniciar protocolo"
            className={resetClass}
          >
            <RotateCcw size={14} strokeWidth={2} />
            <span className={labelClass}>Reset</span>
          </button>
        )}
      </div>

      {openModal === 'nihss' && createPortal(
        <NihssQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(score) => onAddNihss?.(score)}
        />,
        document.body
      )}

      {openModal === 'vitals' && createPortal(
        <VitalsQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(reading) => onAddVitals?.(reading)}
        />,
        document.body
      )}

      {openModal === 'glucose' && createPortal(
        <GlucoseQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(val) => onAddGlucose?.(val)}
        />,
        document.body
      )}
    </>
  )
}
