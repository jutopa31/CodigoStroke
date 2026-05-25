import { CheckCircle2 } from 'lucide-react'
import useStepProgress from './useStepProgress'

export function CollapsedStep({ title, children }) {
  return (
    <div className="relative bg-white rounded-xl border border-neutral-100 px-4 py-3 flex items-center gap-3 animate-fade-in">
      <span className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
        <CheckCircle2 size={12} className="text-white" strokeWidth={2.5} />
      </span>
      <div className="flex-1 min-w-0 flex items-baseline flex-wrap gap-x-1.5">
        {title && <span className="text-xs font-semibold text-neutral-500">{title}</span>}
        {children && (
          <span className="text-xs text-neutral-400 truncate">{children}</span>
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
    red: 'bg-brand-600',
    blue: 'bg-blue-500',
    orange: 'bg-amber-500',
    green: 'bg-emerald-500',
    gray: 'bg-neutral-400',
  }

  const dotColors = {
    red: 'bg-brand-600',
    blue: 'bg-blue-500',
    orange: 'bg-amber-500',
    green: 'bg-emerald-500',
    gray: 'bg-neutral-400',
  }

  const hasStepDot = Boolean(step)
  const hasRailDot = hasStepDot || rail
  const targetStep = railStep ?? step
  const stepValue = hasRailDot ? resolveStepValue(targetStep) : null
  const isCompleted = hasRailDot && completedSteps.includes(stepValue)
  const isActive = hasRailDot && currentStep === stepValue

  const card = (
    <div className={`
      relative bg-white rounded-2xl border transition-all duration-200
      ${isActive 
        ? 'border-brand-200 shadow-elevated' 
        : isCompleted 
          ? 'border-emerald-100' 
          : 'border-neutral-100'
      }
    `}>
      {/* Minimal accent line */}
      <div className={`absolute left-0 top-4 bottom-4 w-0.5 rounded-full ${accentColors[accent]} opacity-60`} />
      
      <div className="p-4 md:p-5">
        {(step || title) && (
          <div className="flex items-center gap-3 mb-2.5">
            {step && (
              <span className={`
                hidden md:flex w-7 h-7 rounded-full text-white text-xs font-semibold 
                items-center justify-center shrink-0 transition-colors
                ${isCompleted ? 'bg-emerald-500' : accentColors[accent]}
              `}>
                {isCompleted ? <CheckCircle2 size={14} strokeWidth={2.5} /> : step}
              </span>
            )}
            {title && (
              <h2 className="text-neutral-800 text-base font-semibold tracking-tight">{title}</h2>
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
                    : 'border border-neutral-200 bg-white text-neutral-400'
              }`
            : `left-0 top-[20px] h-3 w-3 ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isActive
                    ? dotColors[accent]
                    : 'border border-neutral-200 bg-white'
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
