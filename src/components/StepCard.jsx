import { CheckCircle2 } from 'lucide-react'
import useStepProgress from './useStepProgress'

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
  const accents = {
    red: 'bg-brand-600',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    gray: 'bg-gray-400',
  }

  const dotAccents = {
    red: 'bg-brand-600 ring-brand-100',
    blue: 'bg-blue-500 ring-blue-100',
    orange: 'bg-orange-500 ring-orange-100',
    green: 'bg-emerald-500 ring-emerald-100',
    gray: 'bg-gray-500 ring-gray-100',
  }

  const hasStepDot = Boolean(step)
  const hasRailDot = hasStepDot || rail
  const targetStep = railStep ?? step
  const stepValue = hasRailDot ? resolveStepValue(targetStep) : null
  const isCompleted = hasRailDot && completedSteps.includes(stepValue)
  const isActive = hasRailDot && currentStep === stepValue

  const card = (
    <div className={`relative overflow-hidden bg-white rounded-xl border border-gray-100 p-4 md:p-5 animate-slide-down transition-shadow duration-300 ${
      isActive ? 'shadow-card-active ring-1 ring-brand-50' : isCompleted ? 'shadow-card' : 'shadow-card'
    }`}>
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${accents[accent]} rounded-l-xl`} />
      <div className="relative">
        {(step || title) && (
          <div className={`flex items-center gap-2.5 mb-4 ${hasStepDot ? 'pl-6 md:pl-0' : ''}`}>
            {step && (
              <span className={`hidden md:flex w-7 h-7 rounded-full text-white text-xs font-bold items-center justify-center shrink-0 shadow-sm ${
                isCompleted ? 'bg-emerald-500' : 'bg-brand-600'
              }`}>
                {isCompleted ? <CheckCircle2 size={15} strokeWidth={2.5} /> : step}
              </span>
            )}
            {title && (
              <h2 className="font-display text-gray-800 text-lg leading-tight">{title}</h2>
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
        className={`absolute z-10 flex items-center justify-center rounded-full shadow-sm ring-4 transition-all active:scale-95 md:hidden ${
          hasStepDot
            ? `left-[-8px] top-[14px] h-7 w-7 text-xs font-bold ${
                isCompleted
                  ? 'bg-emerald-500 text-white ring-emerald-100'
                  : isActive
                    ? `${dotAccents[accent]} text-white shadow-md`
                    : 'border-2 border-gray-200 bg-white text-gray-400 ring-white'
              }`
            : `left-[-2px] top-[18px] h-4 w-4 ${
                isCompleted
                  ? 'bg-emerald-500 ring-emerald-100'
                  : isActive
                  ? `${dotAccents[accent]} ring-white`
                  : 'border-2 border-gray-200 bg-white ring-white'
              }`
        }`}
      >
        {hasStepDot && (isCompleted ? <CheckCircle2 size={15} strokeWidth={2.5} /> : step)}
      </button>
      {card}
    </div>
  )
}
