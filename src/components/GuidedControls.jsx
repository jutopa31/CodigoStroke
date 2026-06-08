import { AlertCircle, CheckCircle2 } from 'lucide-react'

const toneStyles = {
  blue: {
    active: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    idle: 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-blue-500/30 hover:bg-blue-500/10',
    check: 'bg-blue-500/100',
  },
  green: {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    idle: 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-emerald-500/30 hover:bg-emerald-500/10',
    check: 'bg-emerald-500/100',
  },
  orange: {
    active: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    idle: 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-amber-500/30 hover:bg-amber-500/10',
    check: 'bg-amber-500/100',
  },
  red: {
    active: 'border-blue-900/30 bg-blue-900/10 text-blue-300',
    idle: 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-blue-900/20 hover:bg-blue-900/5',
    check: 'bg-blue-900',
  },
  gray: {
    active: 'border-stroke-line bg-stroke-panel text-stroke-text',
    idle: 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-stroke-line hover:bg-stroke-bg',
    check: 'bg-stroke-bg0',
  },
}

export function StatusPill({ complete, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold leading-none transition-colors ${
      complete
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
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
      active ? styles.check : 'border border-stroke-line bg-stroke-navy'
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
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    orange: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    red: 'bg-blue-900/8 border-blue-900/20 text-blue-300',
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
      className={`w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl transition-all disabled:bg-stroke-panel disabled:text-stroke-textMuted disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {valid ? children : disabledLabel}
    </button>
  )
}
