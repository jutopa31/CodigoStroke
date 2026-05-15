import { createContext } from 'react'

export const DISPLAY_TO_STEP = {
  1: 1,
  2: 3,
  3: 4,
  4: 6,
  5: 7,
  6: 8,
  7: 9,
  8: 10,
}

export const StepProgressContext = createContext({
  currentStep: null,
  completedSteps: [],
  onStepClick: null,
  resolveStepValue: (displayStep) => DISPLAY_TO_STEP[Number(displayStep)] ?? Number(displayStep),
})
