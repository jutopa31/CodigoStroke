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

export default function StepTimeline({ currentStep, completedSteps = [], onStepClick, activeTab, variant = 'mobile' }) {
  if (!currentStep) return null

  if (variant === 'desktop') {
    return (
      <nav className="w-full">
        <div className="relative pl-1">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-neutral-100 rounded-full" />
          <div className="space-y-0.5">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.value)
              const isActive = activeTab === step.value
              const isUnlocked = currentStep >= step.value || isCompleted
              const isPending = !isCompleted && !isActive && !isUnlocked
              return (
                <button
                  key={step.value}
                  type="button"
                  aria-label={step.long}
                  disabled={!isUnlocked}
                  onClick={() => isUnlocked ? onStepClick?.(step.value) : undefined}
                  className={`
                    relative flex items-center gap-3 w-full text-left rounded-xl py-2 pr-3
                    transition-all group focus:outline-none
                    ${isActive
                      ? 'bg-brand-50/60'
                      : isUnlocked
                        ? 'hover:bg-neutral-50'
                        : 'opacity-40 cursor-not-allowed'
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
                          : isUnlocked
                            ? 'bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200 group-hover:text-neutral-500'
                            : 'bg-neutral-100 text-neutral-300'
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
                          : isUnlocked
                            ? 'text-neutral-400 group-hover:text-neutral-600'
                            : 'text-neutral-300'
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

  // Mobile variant — no fixed rail in the new tab-based layout
  return null
}
