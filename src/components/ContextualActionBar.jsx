import { ChevronRight, CheckCircle2 } from 'lucide-react'

/**
 * ContextualActionBar — the single bottom bar whose label + action mutate by
 * where you are in the protocol (DESIGN.md → "Mesa Clínica Clara"). It is the
 * signature MercadoLibre-style interaction: the one relevant primary action is
 * always visible and named ("Faltan…" → "Continuar a Imagen" → "Calcular
 * decisión"). Presentational only — App.jsx computes the `action` from
 * (phase, activeTab, completion).
 *
 * action shape:
 *   { type: 'action', cta, onClick, icon?, pulse?, sublabel? }   → filled button
 *   { type: 'status', label, sublabel? }                          → quiet status (no tap)
 *
 * variant:
 *   'fixed'  → mobile, pinned to the bottom of the viewport (safe-area aware)
 *   'inline' → desktop, sits in the content flow at the top of the work area
 */
export default function ContextualActionBar({ action, variant = 'fixed' }) {
  if (!action) return null

  const Icon = action.icon ?? (action.type === 'action' ? ChevronRight : CheckCircle2)

  const body =
    action.type === 'action' ? (
      <button
        type="button"
        onClick={action.onClick}
        disabled={action.disabled}
        className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold
          btn-primary text-white shadow-elevated transition active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-60
          md:rounded-lg md:py-3 md:shadow-none
          ${action.pulse ? 'animate-pulse-subtle md:animate-none' : ''}`}
      >
        <Icon size={18} strokeWidth={2} />
        <span className="min-w-0 truncate">{action.cta}</span>
        <ChevronRight size={16} strokeWidth={2.5} className="shrink-0" />
      </button>
    ) : (
      <div
        className="w-full flex items-start justify-center gap-2 rounded-xl border border-stroke-line bg-stroke-bg
          px-3 py-3 text-sm font-medium text-stroke-textMuted select-none
          md:rounded-lg md:py-3"
      >
        <Icon size={15} strokeWidth={2} className="mt-0.5 shrink-0" />
        <span className="min-w-0 text-center leading-snug">
          {action.label}
          {action.sublabel && (
            <>
              {' '}
              <span className="font-semibold text-status-warning">{action.sublabel}</span>
            </>
          )}
        </span>
      </div>
    )

  if (variant === 'inline') {
    return (
      <div className="shrink-0 border-b border-stroke-line bg-stroke-bg/80 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl">{body}</div>
      </div>
    )
  }

  // fixed (mobile)
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stroke-line bg-stroke-surface/95 px-3 py-3 shadow-elevated backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="mx-auto max-w-3xl">{body}</div>
    </div>
  )
}
