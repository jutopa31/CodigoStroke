import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  { value: 1, long: 'Datos del paciente' },
  { value: 3, long: 'Última vez asintomático' },
  { value: 4, long: 'SV y Status previo' },
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
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gray-200 rounded-full" />
          <div className="space-y-0">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.value)
              const isActive = currentStep === step.value
              return (
                <button
                  key={step.value}
                  type="button"
                  aria-label={step.long}
                  onClick={() => onStepClick?.(step.value)}
                  className={`relative flex items-center gap-2.5 w-full text-left rounded-lg py-1.5 pr-2 transition-all group focus:outline-none ${
                    isActive ? 'bg-white shadow-sm ring-1 ring-gray-100' : 'hover:bg-white/70'
                  }`}
                >
                  <span
                    className={`relative z-10 w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-brand-600 text-white ring-2 ring-brand-100'
                        : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={16} strokeWidth={2.5} /> : index + 1}
                  </span>
                  <span
                    className={`text-[12px] leading-tight transition-colors ${
                      isCompleted
                        ? 'text-emerald-700 font-medium'
                        : isActive
                        ? 'text-brand-700 font-semibold'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
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

  // Mobile variant — fixed left sidebar
  return (
    <div className="fixed left-0 top-0 bottom-0 z-30 w-11 bg-white/95 border-r border-gray-100 backdrop-blur flex flex-col items-center">
      <div className="h-24 flex-shrink-0" />
      <div className="relative flex flex-col items-center flex-1 w-full pb-6">
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"
          style={{ transform: 'translateX(-50%)' }}
        />
        {(() => {
          const currentIndex = STEPS.findIndex((s) => s.value === currentStep)
          const lastCompletedIndex = STEPS.reduce((acc, s, i) => (completedSteps.includes(s.value) ? i : acc), -1)
          const fillIndex = Math.max(currentIndex, lastCompletedIndex)
          if (fillIndex > 0) {
            const pct = (fillIndex / (STEPS.length - 1)) * 100
            return (
              <div
                className="absolute left-1/2 top-0 w-0.5 bg-brand-600 transition-all duration-500"
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
                    <span className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-sm">
                      <CheckCircle2 size={16} className="text-white" strokeWidth={2.5} />
                    </span>
                  ) : isActive ? (
                    <span className="relative w-8 h-8 flex items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-brand-600 opacity-30 animate-ping" />
                      <span className="w-8 h-8 rounded-full bg-brand-600 ring-2 ring-white ring-offset-1 flex items-center justify-center shadow-md z-10">
                        <span className="text-white text-xs font-bold leading-none">{index + 1}</span>
                      </span>
                    </span>
                  ) : (
                    <span className="w-8 h-8 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                      <span className="text-gray-400 text-xs font-semibold leading-none">{index + 1}</span>
                    </span>
                  )}
                </button>
                <span className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
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
