import { AlertCircle, CheckCircle2 } from 'lucide-react'

const toneStyles = {
  blue: {
    active: 'border-blue-200 bg-blue-50/70 text-blue-800',
    idle: 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-200 hover:bg-blue-50/30',
    check: 'bg-blue-500',
  },
  green: {
    active: 'border-emerald-200 bg-emerald-50/70 text-emerald-800',
    idle: 'border-neutral-200 bg-white text-neutral-700 hover:border-emerald-200 hover:bg-emerald-50/30',
    check: 'bg-emerald-500',
  },
  orange: {
    active: 'border-amber-200 bg-amber-50/70 text-amber-800',
    idle: 'border-neutral-200 bg-white text-neutral-700 hover:border-amber-200 hover:bg-amber-50/30',
    check: 'bg-amber-500',
  },
  red: {
    active: 'border-blue-900/30 bg-blue-900/10 text-blue-900',
    idle: 'border-neutral-200 bg-white text-neutral-700 hover:border-blue-900/20 hover:bg-blue-900/5',
    check: 'bg-blue-900',
  },
  gray: {
    active: 'border-neutral-300 bg-neutral-100 text-neutral-800',
    idle: 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
    check: 'bg-neutral-500',
  },
}

export function StatusPill({ complete, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold leading-none transition-colors ${
      complete
        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
        : 'bg-amber-50 text-amber-600 border border-amber-100'
    }`}>
      {complete ? <CheckCircle2 size={10} strokeWidth={2.5} /> : <AlertCircle size={10} strokeWidth={2.5} />}
      {children}
    </span>
  )
}

export function SelectionCheck({ active, tone = 'blue' }) {
  const styles = toneStyles[tone] ?? toneStyles.blue

  return (
    <span className={`w-5 h-5 rounded-md shrink-0 flex items-center justify-center transition-all ${
      active ? styles.check : 'border border-neutral-300 bg-white'
    }`}>
      {active && <CheckCircle2 size={12} className="text-white" strokeWidth={2.5} />}
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
  buttonRef,
  ...props
}) {
  const styles = toneStyles[tone] ?? toneStyles.blue

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={Boolean(active)}
      className={`rounded-xl border transition-all active:scale-[0.98] ${
        active ? styles.active : styles.idle
      } ${className}`}
      {...props}
    >
      {checkPosition === 'left' && showCheck && <SelectionCheck active={active} tone={tone} />}
      {children}
      {checkPosition === 'right' && showCheck && <SelectionCheck active={active} tone={tone} />}
    </button>
  )
}

export function SectionPrompt({ tone = 'blue', title, helper, complete, status }) {
  const toneClasses = {
    blue: 'bg-blue-50/50 border-blue-100 text-blue-700',
    green: 'bg-emerald-50/50 border-emerald-100 text-emerald-700',
    orange: 'bg-amber-50/50 border-amber-100 text-amber-700',
    red: 'bg-blue-900/8 border-blue-900/20 text-blue-900',
  }

  return (
    <div className={`mb-3 rounded-lg border px-3 py-2 ${toneClasses[tone] ?? toneClasses.blue}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold">{title}</p>
        <StatusPill complete={complete}>{status ?? (complete ? 'Completo' : 'Pendiente')}</StatusPill>
      </div>
      {helper && <p className="mt-0.5 text-[11px] leading-snug opacity-80">{helper}</p>}
    </div>
  )
}

export function PrimaryAction({ valid, children, disabledLabel, className = '', buttonRef, ...props }) {
  return (
    <button
      ref={buttonRef}
      disabled={!valid}
      className={`w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {valid ? children : disabledLabel}
    </button>
  )
}
