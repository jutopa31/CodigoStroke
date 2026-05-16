import { useState } from 'react'
import { Brain, Heart, Droplets, X, RotateCcw } from 'lucide-react'
import NihssModal from './NihssModal'

// ─── NIHSS severity helper ────────────────────────────────────────────────────
function getNihssSeverity(score) {
  if (score === 0)        return { label: 'Normal',            color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  if (score <= 4)         return { label: 'Leve',              color: 'text-lime-700',    bg: 'bg-lime-50',    border: 'border-lime-200' }
  if (score <= 15)        return { label: 'Moderado',          color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200' }
  if (score <= 20)        return { label: 'Moderado-severo',   color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-200' }
  return                         { label: 'Severo',            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200' }
}

// ─── Reusable modal shell ─────────────────────────────────────────────────────
function ModalShell({ title, onClose, onConfirm, confirmLabel = 'Registrar', confirmDisabled = false, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-xs rounded-2xl shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
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
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── NIHSS modal ──────────────────────────────────────────────────────────────
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
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
      />

      {severity && (
        <div className={`mt-3 rounded-xl border px-4 py-2 text-center animate-fade-in ${severity.bg} ${severity.border}`}>
          <span className={`text-sm font-semibold ${severity.color}`}>
            {num} pts — {severity.label}
          </span>
        </div>
      )}

      {value !== '' && !isValid && (
        <p className="mt-2 text-xs text-red-500 text-center">Ingresá un valor entre 0 y 42</p>
      )}

      <button
        type="button"
        onClick={() => setShowCalculator(true)}
        className="mt-3 w-full text-xs text-brand-600 font-semibold text-center underline underline-offset-2 hover:text-brand-700 transition-colors"
      >
        Usar calculadora NIHSS completa
      </button>
    </ModalShell>
  )
}

// ─── TA modal ─────────────────────────────────────────────────────────────────
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
          <label className="block text-xs text-gray-500 mb-1 text-center">Sistólica</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="120"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xl font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-end pb-3 text-gray-400 font-bold text-lg">/</div>

        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1 text-center">Diastólica</label>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-xl font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
        </div>
      </div>

      {highAlert && (
        <p className="mt-3 text-xs text-red-600 font-semibold text-center animate-fade-in">
          TA sistólica &gt; 185 mmHg — considerar manejo antes de trombolisis
        </p>
      )}
    </ModalShell>
  )
}

// ─── Glucemia modal ───────────────────────────────────────────────────────────
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
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="mg/dL"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
        />
        <span className="text-sm text-gray-400 font-medium">mg/dL</span>
      </div>

      {isHypo && (
        <p className="mt-3 text-xs text-red-600 font-semibold text-center animate-fade-in">
          Hipoglucemia — descartar como causa del cuadro
        </p>
      )}

      {isHyper && (
        <p className="mt-3 text-xs text-orange-600 font-semibold text-center animate-fade-in">
          Hiperglucemia severa (&gt;400 mg/dL)
        </p>
      )}
    </ModalShell>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
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
  const [openModal, setOpenModal] = useState(null) // null | 'nihss' | 'vitals' | 'glucose'

  const buttons = [
    {
      id: 'nihss',
      label: 'NIHSS',
      Icon: Brain,
      colorClass: 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50 shadow-md',
      badge: latestNihss !== null ? String(latestNihss) : null,
      badgeClass: 'bg-amber-500 text-white',
    },
    {
      id: 'vitals',
      label: 'TA',
      Icon: Heart,
      colorClass: 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50 shadow-md',
      badge: latestVitals ? String(latestVitals.systolic) : null,
      badgeClass: latestVitals && latestVitals.systolic > 185 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white',
    },
    {
      id: 'glucose',
      label: 'GLC',
      Icon: Droplets,
      colorClass: 'bg-white text-violet-600 border-violet-300 hover:bg-violet-50 shadow-md',
      badge: latestGlucose !== null ? String(latestGlucose) : null,
      badgeClass: latestGlucose < 50 ? 'bg-red-500 text-white' : latestGlucose > 400 ? 'bg-orange-500 text-white' : 'bg-violet-500 text-white',
    },
  ]

  const isSidebar = variant === 'sidebar'
  const isMobileToolbar = variant === 'mobile-toolbar'
  const containerClass = isMobileToolbar
    ? 'grid w-full grid-cols-4 gap-2'
    : isSidebar
      ? 'grid grid-cols-4 gap-2'
      : 'flex flex-col gap-2'
  const buttonClass = isMobileToolbar || isSidebar
    ? 'relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border text-[10px] font-bold active:scale-95 transition-transform'
    : 'relative w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform'
  const resetClass = isMobileToolbar || isSidebar
    ? 'relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm text-[10px] font-bold active:scale-95 transition-transform'
    : 'w-11 h-11 rounded-full border-2 border-slate-300 bg-white text-slate-500 hover:bg-slate-50 shadow-md flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform'
  const iconSize = isMobileToolbar || isSidebar ? 14 : 15
  const labelClass = isMobileToolbar || isSidebar ? 'text-[10px] font-bold leading-none' : 'text-[9px] font-bold leading-none'

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
            <Icon size={iconSize} />
            <span className={labelClass}>{label}</span>
            {badge !== null && (
              <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center leading-none ${badgeClass}`}>
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
            <RotateCcw size={14} />
            <span className={labelClass}>Reset</span>
          </button>
        )}
      </div>

      {/* Modales */}
      {openModal === 'nihss' && (
        <NihssQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(score) => onAddNihss?.(score)}
        />
      )}

      {openModal === 'vitals' && (
        <VitalsQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(reading) => onAddVitals?.(reading)}
        />
      )}

      {openModal === 'glucose' && (
        <GlucoseQuickModal
          onClose={() => setOpenModal(null)}
          onConfirm={(val) => onAddGlucose?.(val)}
        />
      )}
    </>
  )
}
