import { describe, it, expect } from 'vitest'
import { PROTOCOL_STEPS, stepForTab, deriveVisibleSteps } from './protocolSteps'

describe('PROTOCOL_STEPS', () => {
  it('has the 8 protocol steps in order', () => {
    expect(PROTOCOL_STEPS.map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('groups CI (5) and Tratamiento (7) into multi-tab steps', () => {
    const ci = PROTOCOL_STEPS.find((s) => s.key === 'ci')
    const trat = PROTOCOL_STEPS.find((s) => s.key === 'tratamiento')
    expect(ci.tabs).toEqual(['ci_abs', 'ci_rel'])
    expect(trat.tabs).toEqual(['trombolisis', 'cuidados', 'trombectomia'])
  })
})

describe('stepForTab', () => {
  it('maps a sub-tab to its grouping step', () => {
    expect(stepForTab('ci_rel').key).toBe('ci')
    expect(stepForTab('trombectomia').key).toBe('tratamiento')
    expect(stepForTab('paciente').key).toBe('paciente')
  })

  it('returns undefined for an unknown tab', () => {
    expect(stepForTab('nope')).toBeUndefined()
  })
})

describe('deriveVisibleSteps', () => {
  it('pre-phase: the 5 evaluation steps', () => {
    const keys = deriveVisibleSteps({ phase: 'pre' }).map((s) => s.key)
    expect(keys).toEqual(['paciente', 'tiempo', 'clinica', 'imagenes', 'ci'])
  })

  it('post-phase without summary unlocked: Decisión + Tratamiento (no Resumen)', () => {
    const keys = deriveVisibleSteps({ phase: 'post', summaryUnlocked: false }).map((s) => s.key)
    expect(keys).toEqual(['decision', 'tratamiento'])
  })

  it('post-phase with summary unlocked: adds Resumen', () => {
    const keys = deriveVisibleSteps({ phase: 'post', summaryUnlocked: true }).map((s) => s.key)
    expect(keys).toEqual(['decision', 'tratamiento', 'resumen'])
  })

  it('start phase: no sections', () => {
    expect(deriveVisibleSteps({ phase: 'start' })).toEqual([])
  })
})
