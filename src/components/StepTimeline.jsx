import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  { value: 1,  short: 'Pac.',  long: 'Datos del paciente' },
  { value: 3,  short: 'Sint.', long: 'Síntomas' },
  { value: 4,  short: 'SV',    long: 'Signos vitales' },
  { value: 5,  short: 'NIHSS', long: 'Escala NIHSS' },
  { value: 6,  short: 'Acc.',  long: 'Acciones inmediatas' },
  { value: 7,  short: 'TC',    long: 'Resultado TC/RM' },
  { value: 8,  short: 'CI',    long: 'Contraindicaciones' },
  { value: 9,  short: 'Dosis', long: 'Dosis trombolítico' },
  { value: 10, short: 'Trom.', long: 'Trombectomía' },
]

export default function StepTimeline({ currentStep, completedSteps = [], onStepClick }) {
  if (!currentStep) return null

  return (
    <div className="fixed left-0 top-0 bottom-0 z-30 w-11 bg-white/95 border-r border-gray-100 backdrop-blur flex flex-col items-center">
      {/* Spacer to clear the sticky header (~96px) */}
      <div className="h-24 flex-shrink-0" />

      {/* Stepper container — relative so the line can be positioned absolutely */}
      <div className="relative flex flex-col items-center flex-1 w-full pb-6">

        {/* Background line (full height, gray) */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200"
          style={{ transform: 'translateX(-50%)' }}
        />

        {/* Foreground line (completed portion, brand-600) */}
        {(() => {
          const currentIndex = STEPS.findIndex((s) => s.value === currentStep)
          const lastCompletedIndex = STEPS.reduce((acc, s, i) => {
            return completedSteps.includes(s.value) ? i : acc
          }, -1)
          // Fill up to and including the active step line (between steps)
          const fillIndex = Math.max(currentIndex, lastCompletedIndex)
          if (fillIndex > 0) {
            // Each step occupies (100% / STEPS.length) of the height.
            // The line starts at the center of the first circle and ends at the
            // center of the last relevant circle. We approximate with percentages.
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

        {/* Circles */}
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

                {/* Tooltip — aparece al hacer hover */}
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
