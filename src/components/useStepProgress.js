import { useContext } from 'react'
import { StepProgressContext } from './stepProgressContext'

export default function useStepProgress() {
  return useContext(StepProgressContext)
}
