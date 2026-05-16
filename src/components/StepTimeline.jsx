import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  { value: 1, long: 'Datos del paciente' },
  { value: 3, long: 'Tiempo de síntomas' },
  { value: 5, long: 'Síntomas NIHSS' },
  { value: 6, long: 'TAC de encéfalo' },
  { value: 7, long: 'Contraindicaciones' },
  { value: 8, long: 'Dosis trombolítico' },
  { value: 9, long: 'Trombectomía' },
]

export default function StepTimeline({ currentStep, completedSteps = [], onStepClick, variant = 'mobile' }) {
  if (!currentStep) return null

  if (variant === 'desktop') {
    return (
      <nav className="w-full">
        <div className="relative pl-1">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-neutral-100 rounded-full" />
          <div className="space-y-0.5">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.value)
              const isActive = currentStep === step.value
              const isPending = !isCompleted && !isActive
              return (
                <button
                  key={step.value}
                  type="button"
                  aria-label={step.long}
                  onClick={() => onStepClick?.(step.value)}
                  className={`
                    relative flex items-center gap-3 w-full text-left rounded-xl py-2 pr-3 
                    transition-all group focus:outline-none
                    ${isActive
                      ? 'bg-brand-50/60'
                      : 'hover:bg-neutral-50'
                    }
                  `}
                >
                  <span
                    className={`
                      relative z-10 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center 
                      font-semibold text-xs transition-all
                      ${isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-brand-600 text-white shadow-minimal'
                          : 'bg-neutral-100 text-neutral-300 group-hover:bg-neutral-200 group-hover:text-neutral-400'
                      }
                    `}
                  >
                    {isCompleted ? <CheckCircle2 size={14} strokeWidth={2.5} /> : index + 1}
                  </span>
                  <span
                    className={`
                      text-[13px] leading-tight transition-colors
                      ${isCompleted
                        ? 'text-emerald-600 font-medium'
                        : isActive
                          ? 'text-brand-600 font-semibold'
                          : isPending
                            ? 'text-neutral-300'
                            : 'text-neutral-400 group-hover:text-neutral-600'
                      }
                    `}
                  >
                    {step.long}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>
    )
  }

  // Mobile variant
  return (
    <div className="fixed left-0 top-0 bottom-0 z-30 w-12 bg-white/90 backdrop-blur-md border-r border-neutral-100 flex flex-col items-center">
      <div className="h-20 flex-shrink-0" />
      <div className="relative flex flex-col items-center flex-1 w-full pb-6">
        {/* Track line */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px bg-neutral-100"
          style={{ transform: 'translateX(-50%)' }}
        />
        
        {/* Progress fill */}
        {(() => {
          const currentIndex = STEPS.findIndex((s) => s.value === currentStep)
          const lastCompletedIndex = STEPS.reduce((acc, s, i) => (completedSteps.includes(s.value) ? i : acc), -1)
          const fillIndex = Math.max(currentIndex, lastCompletedIndex)
          if (fillIndex > 0) {
            const pct = (fillIndex / (STEPS.length - 1)) * 100
            return (
              <div
                className="absolute left-1/2 top-0 w-px bg-brand-500 transition-all duration-500 ease-out"
                style={{ transform: 'translateX(-50%)', height: `${pct}%` }}
              />
            )
          }
          return null
        })()}
        
        <div className="relative z-10 flex flex-col items-center justify-between h-full w-full">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.value)
            const isActive = currentStep === step.value
            return (
              <div key={step.value} className="relative group flex items-center">
                <button
                  type="button"
                  aria-label={`${step.long}${isCompleted ? ' (completado)' : isActive ? ' (actual)' : ''}`}
                  onClick={() => onStepClick?.(step.value)}
                  className="flex items-center justify-center flex-shrink-0 focus:outline-none"
                >
                  {isCompleted ? (
                    <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" strokeWidth={2.5} />
                    </span>
                  ) : isActive ? (
                    <span className="relative w-7 h-7 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-lg bg-brand-500 opacity-20 animate-pulse-subtle" />
                      <span className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center shadow-elevated z-10">
                        <span className="text-white text-[11px] font-semibold">{index + 1}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-lg border border-neutral-200 bg-white flex items-center justify-center">
                      <span className="text-neutral-300 text-[11px] font-medium">{index + 1}</span>
                    </span>
                  )}
                </button>
                
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-neutral-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-modal">
                  {step.long}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
