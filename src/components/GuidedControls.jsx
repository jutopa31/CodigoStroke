import { AlertCircle, CheckCircle2 } from 'lucide-react'

const toneStyles = {
  blue: {
    active: 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-2 ring-blue-100',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40',
    check: 'bg-blue-600 border-blue-600',
  },
  green: {
    active: 'border-green-600 bg-green-50 text-green-900 shadow-sm ring-2 ring-green-100',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50/40',
    check: 'bg-green-600 border-green-600',
  },
  orange: {
    active: 'border-orange-500 bg-orange-50 text-orange-950 shadow-sm ring-2 ring-orange-100',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50/40',
    check: 'bg-orange-600 border-orange-600',
  },
  red: {
    active: 'border-red-500 bg-red-50 text-red-900 shadow-sm ring-2 ring-red-100',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50/40',
    check: 'bg-red-600 border-red-600',
  },
  gray: {
    active: 'border-slate-500 bg-slate-100 text-slate-800 shadow-sm ring-2 ring-slate-100',
    idle: 'border-gray-200 bg-white text-gray-700 hover:border-slate-300 hover:bg-slate-50',
    check: 'bg-slate-600 border-slate-600',
  },
}

export function StatusPill({ complete, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold leading-none ${
      complete
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'
    }`}>
      {complete ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {children}
    </span>
  )
}

export function SelectionCheck({ active, tone = 'blue' }) {
  const styles = toneStyles[tone] ?? toneStyles.blue

  return (
    <span className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
      active ? styles.check : 'border-gray-300 bg-white'
    }`}>
      {active && <CheckCircle2 size={15} className="text-white" strokeWidth={3} />}
    </span>
  )
}

export function SelectableButton({
  active,
  tone = 'blue',
  children,
  className = '',
  showCheck = true,
  checkPosition = 'left',
  ...props
}) {
  const styles = toneStyles[tone] ?? toneStyles.blue
  const check = showCheck ? <SelectionCheck active={active} tone={tone} /> : null

  return (
    <button
      type="button"
      aria-pressed={Boolean(active)}
      className={`rounded-lg border-2 transition-all active:scale-[0.99] ${
        active ? styles.active : styles.idle
      } ${className}`}
      {...props}
    >
      {checkPosition === 'left' && check}
      {children}
      {checkPosition === 'right' && check}
    </button>
  )
}

export function SectionPrompt({ tone = 'blue', title, helper, complete, status }) {
  const toneClasses = {
    blue: 'border-blue-100 bg-blue-50/60 text-blue-800',
    green: 'border-green-100 bg-green-50/60 text-green-800',
    orange: 'border-orange-100 bg-orange-50/60 text-orange-900',
    red: 'border-red-100 bg-red-50/60 text-red-800',
  }

  return (
    <div className={`mb-3 rounded-lg border px-3 py-2 ${toneClasses[tone] ?? toneClasses.blue}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">{title}</p>
        <StatusPill complete={complete}>{status ?? (complete ? 'Completo' : 'Pendiente')}</StatusPill>
      </div>
      {helper && <p className="mt-1 text-xs opacity-90">{helper}</p>}
    </div>
  )
}

export function PrimaryAction({ valid, children, disabledLabel, className = '', ...props }) {
  return (
    <button
      disabled={!valid}
      className={`w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-3.5 rounded-lg transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-100 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {valid ? children : disabledLabel}
    </button>
  )
}
