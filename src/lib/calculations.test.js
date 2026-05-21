import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  calcRtPA,
  calcTNK,
  getElapsedMinutes,
  formatElapsed,
  getWindowStatus,
  IV_WINDOW_MINUTES,
  OGV_WINDOW_MINUTES,
} from './calculations'

// ── calcRtPA ──────────────────────────────────────────────────────────────────

describe('calcRtPA', () => {
  it('calculates dose for a typical 70 kg patient', () => {
    const { total, bolo, infusion } = calcRtPA(70)
    expect(total).toBe(63)       // 70 * 0.9 = 63
    expect(bolo).toBe(6.3)       // 10% of 63
    expect(infusion).toBe(56.7)  // 90% of 63
  })

  it('caps total dose at 90 mg for heavy patients', () => {
    const { total, bolo, infusion } = calcRtPA(100)
    expect(total).toBe(90)
    expect(bolo).toBe(9)
    expect(infusion).toBe(81)
  })

  it('caps total dose at 90 mg for 110 kg patient', () => {
    expect(calcRtPA(110).total).toBe(90)
  })

  it('calculates correctly at the cap boundary (100 kg → exactly 90)', () => {
    expect(calcRtPA(100).total).toBe(90)
    // 99 kg: 99 * 0.9 = 89.1 — below cap
    expect(calcRtPA(99).total).toBe(89.1)
  })

  it('rounds to 1 decimal place', () => {
    // 99 kg: total=89.1, bolo=8.9, infusion=80.2
    const { total, bolo, infusion } = calcRtPA(99)
    expect(total).toBe(89.1)
    expect(bolo).toBe(8.9)
    expect(infusion).toBe(80.2)
  })

  it('works for minimum viable weight (1 kg)', () => {
    const { total, bolo, infusion } = calcRtPA(1)
    expect(total).toBe(0.9)
    expect(bolo).toBe(0.1)
    expect(infusion).toBe(0.8)
  })

  it('total equals bolo + infusion within floating point tolerance', () => {
    for (const kg of [50, 70, 80, 90, 99, 100, 150]) {
      const { total, bolo, infusion } = calcRtPA(kg)
      expect(bolo + infusion).toBeCloseTo(total, 5)
    }
  })
})

// ── calcTNK ───────────────────────────────────────────────────────────────────

describe('calcTNK', () => {
  it('calculates dose for a typical 70 kg patient', () => {
    expect(calcTNK(70).total).toBe(17.5)  // 70 * 0.25
  })

  it('caps total dose at 25 mg for heavy patients', () => {
    expect(calcTNK(100).total).toBe(25)
    expect(calcTNK(120).total).toBe(25)
  })

  it('is at cap boundary for 100 kg (100 * 0.25 = 25)', () => {
    expect(calcTNK(100).total).toBe(25)
    expect(calcTNK(99).total).toBe(24.8)  // 99 * 0.25 = 24.75 → rounds to 24.8
  })

  it('works for minimum viable weight (1 kg)', () => {
    expect(calcTNK(1).total).toBe(0.3)  // 1 * 0.25 = 0.25 → rounds to 0.3
  })
})

// ── getElapsedMinutes ─────────────────────────────────────────────────────────

describe('getElapsedMinutes', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns 0 for a null or empty input', () => {
    expect(getElapsedMinutes(null)).toBe(0)
    expect(getElapsedMinutes('')).toBe(0)
    expect(getElapsedMinutes(undefined)).toBe(0)
  })

  it('returns approximately correct elapsed time for a past date', () => {
    const now = Date.now()
    const ninetyMinutesAgo = new Date(now - 90 * 60 * 1000).toISOString()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(getElapsedMinutes(ninetyMinutesAgo)).toBeCloseTo(90, 0)
  })

  it('returns 0 (not negative) for a future date', () => {
    const future = new Date(Date.now() + 60_000).toISOString()
    expect(getElapsedMinutes(future)).toBe(0)
  })

  it('handles the IV window boundary (270 min)', () => {
    const now = Date.now()
    const exactly270 = new Date(now - IV_WINDOW_MINUTES * 60 * 1000).toISOString()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    expect(getElapsedMinutes(exactly270)).toBeCloseTo(IV_WINDOW_MINUTES, 0)
  })
})

// ── formatElapsed ─────────────────────────────────────────────────────────────

describe('formatElapsed', () => {
  it('formats minutes-only durations', () => {
    expect(formatElapsed(0)).toBe('0 min')
    expect(formatElapsed(30)).toBe('30 min')
    expect(formatElapsed(59)).toBe('59 min')
  })

  it('formats whole-hour durations', () => {
    expect(formatElapsed(60)).toBe('1h')
    expect(formatElapsed(120)).toBe('2h')
    expect(formatElapsed(1440)).toBe('24h')
  })

  it('formats hours + minutes durations', () => {
    expect(formatElapsed(90)).toBe('1h 30min')
    expect(formatElapsed(270)).toBe('4h 30min')
    expect(formatElapsed(61)).toBe('1h 1min')
  })

  it('rounds fractional minutes', () => {
    expect(formatElapsed(30.4)).toBe('30 min')
    expect(formatElapsed(30.6)).toBe('31 min')
  })

  it('clamps negative input to 0', () => {
    expect(formatElapsed(-10)).toBe('0 min')
  })
})

// ── getWindowStatus ───────────────────────────────────────────────────────────

describe('getWindowStatus', () => {
  it('returns "iv" for elapsed time within the IV window', () => {
    expect(getWindowStatus(0)).toBe('iv')
    expect(getWindowStatus(100)).toBe('iv')
    expect(getWindowStatus(270)).toBe('iv')
  })

  it('returns "ogv" for elapsed time in the OGV evaluation window', () => {
    expect(getWindowStatus(271)).toBe('ogv')
    expect(getWindowStatus(900)).toBe('ogv')
    expect(getWindowStatus(1440)).toBe('ogv')
  })

  it('returns "out" beyond both windows', () => {
    expect(getWindowStatus(1441)).toBe('out')
    expect(getWindowStatus(9999)).toBe('out')
  })

  it('uses the correct constants (270 and 1440 min)', () => {
    expect(IV_WINDOW_MINUTES).toBe(270)
    expect(OGV_WINDOW_MINUTES).toBe(1440)
  })
})
