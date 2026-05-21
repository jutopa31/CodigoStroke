// Pure clinical calculation functions — no React, no side effects

export const IV_WINDOW_MINUTES = 270
export const OGV_WINDOW_MINUTES = 1440

function round1(n) { return Math.round(n * 10) / 10 }

/**
 * rtPA (alteplase) dose: 0.9 mg/kg, max 90 mg.
 * Bolo = 10% given over 1 min; infusion = 90% over 60 min.
 */
export function calcRtPA(kg) {
  const total    = Math.min(round1(kg * 0.9), 90)
  const bolo     = round1(total * 0.1)
  const infusion = round1(total * 0.9)
  return { total, bolo, infusion }
}

/**
 * TNK (tenecteplase) dose: 0.25 mg/kg, max 25 mg.
 */
export function calcTNK(kg) {
  return { total: Math.min(round1(kg * 0.25), 25) }
}

/**
 * Returns elapsed minutes since dateStr (ISO string or parseable date).
 * Returns 0 for missing/invalid input.
 */
export function getElapsedMinutes(dateStr) {
  if (!dateStr) return 0
  const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60)
  return Math.max(0, diff)
}

/**
 * Formats elapsed minutes as a human-readable string in Spanish.
 * e.g. 90 → "1h 30min", 45 → "45 min", 120 → "2h"
 */
export function formatElapsed(minutes) {
  const rounded = Math.max(0, Math.round(minutes))
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m} min`
}

/**
 * Given elapsed minutes, returns the treatment window status.
 * 'iv'  — within IV thrombolysis window (≤ 270 min)
 * 'ogv' — OGV evaluation window (270 < elapsed ≤ 1440 min)
 * 'out' — beyond all treatment windows (> 1440 min)
 */
export function getWindowStatus(elapsedMinutes) {
  if (elapsedMinutes > OGV_WINDOW_MINUTES) return 'out'
  if (elapsedMinutes > IV_WINDOW_MINUTES)  return 'ogv'
  return 'iv'
}
