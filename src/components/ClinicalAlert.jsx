import { AlertTriangle, Info, CheckCircle2, Droplets } from 'lucide-react'

// Unified clinical alert card (HANDOFF_SPEC "Warning Card"):
// 3px left-border in the status color, muted translucent background,
// icon + bold lead + muted body. One component, five clinical channels.
const VARIANTS = {
  warning: {
    wrap: 'bg-status-warning-muted border-status-warning-border border-l-status-warning',
    lead: 'text-status-warning', icon: 'text-status-warning', Default: AlertTriangle,
  },
  critical: {
    wrap: 'bg-status-critical-muted border-status-critical-border border-l-status-critical',
    lead: 'text-status-critical', icon: 'text-status-critical', Default: AlertTriangle,
  },
  info: {
    wrap: 'bg-stroke-iconActive/10 border-stroke-iconActive/30 border-l-stroke-iconActive',
    lead: 'text-stroke-iconActive', icon: 'text-stroke-iconActive', Default: Info,
  },
  glucose: {
    wrap: 'bg-status-glucose-muted border-status-glucose-border border-l-status-glucose',
    lead: 'text-status-glucose', icon: 'text-status-glucose', Default: Droplets,
  },
  success: {
    wrap: 'bg-emerald-500/10 border-emerald-500/30 border-l-emerald-400',
    lead: 'text-emerald-300', icon: 'text-emerald-400', Default: CheckCircle2,
  },
}

export default function ClinicalAlert({
  variant = 'warning',
  title,
  Icon,
  iconSize = 16,
  children,
  role,
  className = '',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.warning
  const IconCmp = Icon ?? v.Default

  return (
    <div
      role={role}
      className={`flex items-start gap-2.5 rounded-[10px] border border-l-[3px] px-3.5 py-3 ${v.wrap} ${className}`}
    >
      <IconCmp size={iconSize} className={`shrink-0 mt-0.5 ${v.icon}`} strokeWidth={2} aria-hidden="true" />
      <p className="text-xs leading-snug text-stroke-textMuted">
        {title && <span className={`font-semibold ${v.lead}`}>{title} </span>}
        {children}
      </p>
    </div>
  )
}
