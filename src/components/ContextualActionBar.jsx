import { AlertCircle, ArrowRight, Brain, CheckCircle2 } from 'lucide-react'

export default function ContextualActionBar({
  title,
  detail,
  actionLabel,
  onAction,
  disabled = false,
  complete = false,
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stroke-line bg-white/95 px-4 pt-3 shadow-[0_-8px_28px_rgba(36,36,36,0.08)] backdrop-blur-md md:static md:z-auto md:mt-3 md:rounded-2xl md:border md:px-4 md:pb-3 md:shadow-card"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${
          complete ? 'bg-emerald-50 text-emerald-700' : disabled ? 'bg-amber-50 text-amber-700' : 'bg-clinical-50 text-clinical-700'
        }`}>
          {complete ? <CheckCircle2 size={19} /> : disabled ? <AlertCircle size={19} /> : <Brain size={19} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-stroke-text">{title}</p>
          {detail && <p className="truncate text-xs text-stroke-textMuted">{detail}</p>}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            disabled={disabled}
            className={`flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors active:scale-[0.98] ${
              disabled
                ? 'cursor-not-allowed bg-stroke-panel text-stroke-textMuted'
                : 'bg-clinical-700 text-white hover:bg-clinical-800'
            }`}
          >
            {actionLabel}
            {!disabled && <ArrowRight size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}
