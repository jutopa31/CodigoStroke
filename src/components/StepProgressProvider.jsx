import { DISPLAY_TO_STEP, StepProgressContext } from './stepProgressContext'

export default function StepProgressProvider({ currentStep, completedSteps = [], onStepClick, children }) {
  return (
    <StepProgressContext.Provider
      value={{
        currentStep,
        completedSteps,
        onStepClick,
        resolveStepValue: (displayStep) => DISPLAY_TO_STEP[Number(displayStep)] ?? Number(displayStep),
      }}
    >
      {children}
    </StepProgressContext.Provider>
  )
}
