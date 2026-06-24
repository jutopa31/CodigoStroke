import { CheckCircle2 } from 'lucide-react'

export function ReviewSection({ icon: Icon, title, description, children, tone = 'neutral' }) {
  const toneStyles = {
    neutral: 'bg-stroke-surfaceMuted text-stroke-textMuted',
    clinical: 'bg-clinical-50 text-clinical-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    critical: 'bg-red-50 text-red-700',
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-stroke-line bg-white shadow-card">
      <header className="flex items-start gap-3 border-b border-stroke-line px-4 py-3.5">
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone] ?? toneStyles.neutral}`}>
            <Icon size={17} strokeWidth={2.2} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-stroke-text">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-stroke-textMuted">{description}</p>}
        </div>
      </header>
      <div className="divide-y divide-stroke-line px-4">{children}</div>
    </section>
  )
}

export function ReviewRow({ label, value, detail, tone = 'neutral', complete = false }) {
  if (!value && value !== 0) return null

  const valueStyles = {
    neutral: 'text-stroke-text',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    critical: 'text-red-700',
    info: 'text-blue-700',
  }

  return (
    <div className="flex min-h-[52px] items-center gap-3 py-2.5">
      {complete && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircle2 size={14} strokeWidth={2.5} />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-stroke-textMuted">{label}</p>
        {detail && <p className="mt-0.5 text-[11px] text-stroke-textMuted">{detail}</p>}
      </div>
      <p className={`max-w-[62%] text-right text-xs font-bold leading-snug ${valueStyles[tone] ?? valueStyles.neutral}`}>
        {value}
      </p>
    </div>
  )
}

export function ReviewTag({ children, tone = 'neutral' }) {
  const styles = {
    neutral: 'border-stroke-line bg-stroke-surfaceMuted text-stroke-textMuted',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    critical: 'border-red-200 bg-red-50 text-red-800',
  }

  return (
    <span className={`inline-flex rounded-lg border px-2 py-1 text-[11px] font-semibold ${styles[tone] ?? styles.neutral}`}>
      {children}
    </span>
  )
}
