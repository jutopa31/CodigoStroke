import { describe, it, expect } from 'vitest'
import { computeStrokeDecision } from './strokeAlgorithm'
import { RED_IDS, ORANGE_IDS, CONTRA_LABELS } from './contraindications'

// Helpers ───────────────────────────────────────────────────────────────────
const nowISO = () => new Date().toISOString()
const minutesAgoISO = (m) => new Date(Date.now() - m * 60_000).toISOString()

// A baseline eligible non-wake-up patient: in window, NIHSS ≥ 5, no CI.
const eligible = () => ({
  symptoms: { isWakeUpStroke: false, lastSeenNormal: minutesAgoISO(60) },
  nihss: { nihssScore: 8, hasDisablingSymptoms: false },
  ctResult: { bleeding: false },
  contraindications: { red: {}, orange: {}, hasAbsolute: false, hasRelative: false, decidedNotToThrombolyze: false },
})

const allNo = (ids) => Object.fromEntries(ids.map((k) => [k, false]))

// 1. Hemorrhage on CT ─────────────────────────────────────────────────────────
describe('computeStrokeDecision — hemorrhage', () => {
  it('excludes thrombolysis when CT shows bleeding', () => {
    const r = computeStrokeDecision({ ...eligible(), ctResult: { bleeding: true } })
    expect(r.thrombolyze).toBe(false)
    expect(r.title).toMatch(/Hemorragia/)
    expect(r.drug).toBeNull()
  })

  it('bleeding takes priority over a wake-up stroke', () => {
    const r = computeStrokeDecision({
      symptoms: { isWakeUpStroke: true },
      nihss: {},
      ctResult: { bleeding: true, mismatch: true },
      contraindications: {},
    })
    expect(r.thrombolyze).toBe(false)
    expect(r.title).toMatch(/Hemorragia/)
  })
})

// 2. Wake-up stroke path ──────────────────────────────────────────────────────
describe('computeStrokeDecision — wake-up stroke', () => {
  const wake = (ctResult) => ({
    symptoms: { isWakeUpStroke: true },
    nihss: { nihssScore: 2 }, // low NIHSS must NOT block wake-up path
    ctResult,
    contraindications: { red: {}, orange: {} },
  })

  it('returns pending when MRI mismatch is unknown', () => {
    const r = computeStrokeDecision(wake({}))
    expect(r.thrombolyze).toBeNull()
    expect(r.title).toMatch(/Pendiente RMN/)
  })

  it('excludes when mismatch is explicitly false', () => {
    const r = computeStrokeDecision(wake({ mismatch: false }))
    expect(r.thrombolyze).toBe(false)
    expect(r.title).toMatch(/sin mismatch/)
  })

  it('indicates rtPA (not TNK) when mismatch positive and no CI', () => {
    const r = computeStrokeDecision(wake({ mismatch: true }))
    expect(r.thrombolyze).toBe(true)
    expect(r.drug).toBe('rtpa')
  })
})

// 3. Time window (non-wake-up) ────────────────────────────────────────────────
describe('computeStrokeDecision — IV time window', () => {
  it('excludes beyond 270 min', () => {
    const r = computeStrokeDecision({ ...eligible(), symptoms: { isWakeUpStroke: false, lastSeenNormal: minutesAgoISO(300) } })
    expect(r.thrombolyze).toBe(false)
    expect(r.title).toMatch(/Fuera de ventana/)
  })

  it('allows just inside the window', () => {
    const r = computeStrokeDecision({ ...eligible(), symptoms: { isWakeUpStroke: false, lastSeenNormal: minutesAgoISO(260) } })
    expect(r.thrombolyze).toBe(true)
  })

  it('treats now (elapsed 0) as in-window', () => {
    const r = computeStrokeDecision({ ...eligible(), symptoms: { isWakeUpStroke: false, lastSeenNormal: nowISO() } })
    expect(r.thrombolyze).toBe(true)
  })
})

// 4. NIHSS threshold (non-wake-up) ────────────────────────────────────────────
describe('computeStrokeDecision — NIHSS threshold', () => {
  it('excludes NIHSS < 5 without disabling symptoms', () => {
    const r = computeStrokeDecision({ ...eligible(), nihss: { nihssScore: 3, hasDisablingSymptoms: false } })
    expect(r.thrombolyze).toBe(false)
    expect(r.title).toMatch(/NIHSS/)
  })

  it('allows NIHSS < 5 WITH disabling symptoms', () => {
    const r = computeStrokeDecision({ ...eligible(), nihss: { nihssScore: 2, hasDisablingSymptoms: true } })
    expect(r.thrombolyze).toBe(true)
  })

  it('allows NIHSS exactly 5', () => {
    const r = computeStrokeDecision({ ...eligible(), nihss: { nihssScore: 5, hasDisablingSymptoms: false } })
    expect(r.thrombolyze).toBe(true)
  })

  it('treats missing NIHSS as 0 → excluded', () => {
    const r = computeStrokeDecision({ ...eligible(), nihss: {} })
    expect(r.thrombolyze).toBe(false)
  })
})

// 5. Contraindications ────────────────────────────────────────────────────────
describe('computeStrokeDecision — contraindications', () => {
  it('absolute CI excludes thrombolysis', () => {
    const r = computeStrokeDecision({
      ...eligible(),
      contraindications: { red: { ...allNo(RED_IDS), ct_hemorrhage: true }, orange: {}, hasAbsolute: true },
    })
    expect(r.thrombolyze).toBe(false)
    expect(r.absoluteCI).toBe(true)
    expect(r.absoluteDetails).toContain('TC: hemorragia intracraneal')
  })

  it('explicit decision-not-to-thrombolyze on relative CI excludes', () => {
    const r = computeStrokeDecision({
      ...eligible(),
      contraindications: { red: {}, orange: { ...allNo(ORANGE_IDS), pregnancy: true }, hasRelative: true, decidedNotToThrombolyze: true },
    })
    expect(r.thrombolyze).toBe(false)
    expect(r.relativeCI).toBe(true)
    expect(r.relativeDetails).toContain('Embarazo / puerperio')
  })

  it('relative CI present but no opt-out → indicated, flagged for risk/benefit', () => {
    const r = computeStrokeDecision({
      ...eligible(),
      contraindications: { red: {}, orange: { ...allNo(ORANGE_IDS), doac: true }, hasRelative: true, decidedNotToThrombolyze: false },
    })
    expect(r.thrombolyze).toBe(true)
    expect(r.relativeCI).toBe(true)
    expect(r.title).toMatch(/riesgo\/beneficio/)
    expect(r.relativeDetails).toContain('DOAC < 48h')
  })

  it('clean eligible patient → TNK, no CI flags', () => {
    const r = computeStrokeDecision(eligible())
    expect(r.thrombolyze).toBe(true)
    expect(r.drug).toBe('tnk')
    expect(r.absoluteCI).toBe(false)
    expect(r.relativeCI).toBe(false)
  })
})

// 6. Label completeness — regression guard for the stale-label bug ────────────
// Every real contraindication ID must resolve to a human-readable label, never
// the raw snake_case key, on the clinician-facing decision screen.
describe('contraindication label completeness', () => {
  it('every absolute ID maps to a human label (not the raw key)', () => {
    for (const id of RED_IDS) {
      expect(CONTRA_LABELS[id], `missing label for ${id}`).toBeTruthy()
      expect(CONTRA_LABELS[id]).not.toBe(id)
    }
  })

  it('every relative ID maps to a human label (not the raw key)', () => {
    for (const id of ORANGE_IDS) {
      expect(CONTRA_LABELS[id], `missing label for ${id}`).toBeTruthy()
      expect(CONTRA_LABELS[id]).not.toBe(id)
    }
  })

  it('absoluteDetails never leaks a raw snake_case key for any single absolute CI', () => {
    for (const id of RED_IDS) {
      const r = computeStrokeDecision({
        ...eligible(),
        contraindications: { red: { ...allNo(RED_IDS), [id]: true }, orange: {}, hasAbsolute: true },
      })
      for (const d of r.absoluteDetails) {
        expect(d, `raw key leaked for ${id}`).not.toMatch(/^[a-z]+(_[a-z0-9]+)+$/)
      }
    }
  })

  it('relativeDetails never leaks a raw snake_case key for any single relative CI', () => {
    for (const id of ORANGE_IDS) {
      const r = computeStrokeDecision({
        ...eligible(),
        contraindications: { red: {}, orange: { ...allNo(ORANGE_IDS), [id]: true }, hasRelative: true, decidedNotToThrombolyze: true },
      })
      for (const d of r.relativeDetails) {
        expect(d, `raw key leaked for ${id}`).not.toMatch(/^[a-z]+(_[a-z0-9]+)+$/)
      }
    }
  })
})
