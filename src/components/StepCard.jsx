import { CheckCircle2 } from 'lucide-react'
import useStepProgress from './useStepProgress'

export function CollapsedStep({ title, children }) {
  return (
    <div className="relative flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-card animate-fade-in">
      <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
        <CheckCircle2 size={12} className="text-white" strokeWidth={2.5} />
      </span>
      <div className="flex-1 min-w-0 flex items-baseline flex-wrap gap-x-1.5">
        {title && <span className="text-xs font-semibold text-stroke-text">{title}</span>}
        {children && (
          <span className="text-xs text-stroke-textMuted truncate">{children}</span>
        )}
      </div>
    </div>
  )
}

export default function StepCard({
  step,
  title,
  children,
  accent = 'red',
  rail = false,
  railStep = null,
  railLabel = null,
}) {
  const { currentStep, completedSteps, onStepClick, resolveStepValue } = useStepProgress()
  
  const accentColors = {
    red: 'bg-stroke-iconActive',
    blue: 'bg-blue-500',
    orange: 'bg-amber-500',
    green: 'bg-emerald-500',
    gray: 'bg-stroke-line',
  }

  const dotColors = {
    red: 'bg-stroke-iconActive',
    blue: 'bg-blue-500',
    orange: 'bg-amber-500',
    green: 'bg-emerald-500',
    gray: 'bg-stroke-line',
  }

  const hasStepDot = Boolean(step)
  const hasRailDot = hasStepDot || rail
  const targetStep = railStep ?? step
  const stepValue = hasRailDot ? resolveStepValue(targetStep) : null
  const isCompleted = hasRailDot && completedSteps.includes(stepValue)
  const isActive = hasRailDot && currentStep === stepValue

  const card = (
    <div className={`
      relative rounded-2xl border bg-white shadow-card transition-colors duration-200
      ${isActive
        ? 'border-stroke-iconActive/40'
        : 'border-stroke-line'
      }
    `}>

      <div className="p-4 md:p-4">
        {(step || title) && (
          <div className="flex items-center gap-2.5 mb-3">
            {step && (
              <span className={`
                hidden md:flex w-6 h-6 rounded-full text-white text-[11px] font-semibold
                items-center justify-center shrink-0 transition-colors
                ${isCompleted ? 'bg-emerald-500' : accentColors[accent]}
              `}>
                {isCompleted ? <CheckCircle2 size={14} strokeWidth={2.5} /> : step}
              </span>
            )}
            {title && (
              <h2 className="text-stroke-text text-[15px] font-semibold tracking-tight">{title}</h2>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )

  if (!hasRailDot) return card

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Ir a ${railLabel || title || `paso ${step}`}`}
        onClick={() => onStepClick?.(stepValue)}
        className={`
          absolute z-10 flex items-center justify-center rounded-full 
          transition-all active:scale-95 md:hidden
          ${hasStepDot
            ? `left-[-6px] top-[18px] h-6 w-6 text-[10px] font-semibold shadow-minimal ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isActive
                    ? `${dotColors[accent]} text-white shadow-elevated`
                    : 'border border-stroke-line bg-stroke-navy text-stroke-textMuted'
              }`
            : `left-0 top-[20px] h-3 w-3 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                    ? dotColors[accent]
                    : 'border border-stroke-line bg-stroke-navy'
              }`
          }
        `}
      >
        {hasStepDot && (isCompleted ? <CheckCircle2 size={12} strokeWidth={2.5} /> : step)}
      </button>
      {card}
    </div>
  )
}
