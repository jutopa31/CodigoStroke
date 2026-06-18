import { describe, it, expect, beforeEach } from 'vitest'
import {
  generatePatientId,
  saveStrokeEvent,
  getStrokeEvents,
  getStrokeEventById,
  saveSession,
  getSessions,
  loadSession,
  saveCaseDraft,
  loadCaseDraft,
  clearCaseDraft,
  getNavMode,
  setNavMode,
} from './storage'

// localStorage stub (vitest/node doesn't have it)
const store = {}
const localStorage = {
  getItem: (k) => store[k] ?? null,
  setItem: (k, v) => { store[k] = v },
  removeItem: (k) => { delete store[k] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
}
global.localStorage = localStorage

beforeEach(() => localStorage.clear())

// ── generatePatientId ─────────────────────────────────────────────────────────

describe('generatePatientId', () => {
  it('produces initials + last 3 DNI digits for a typical patient', () => {
    expect(generatePatientId('García, Juan', '12345678')).toBe('GJ678')
  })

  it('handles surname-only names', () => {
    expect(generatePatientId('Rodriguez', '12345678')).toBe('R678')
  })

  it('handles names with multiple parts (3 words → 3 initials)', () => {
    expect(generatePatientId('Fernández, María José', '99887766')).toBe('FMJ766')
  })

  it('uses last 3 digits of DNI (ignores non-digit characters)', () => {
    expect(generatePatientId('Ana', '12.345.678')).toBe('A678')
  })

  it('returns only last 3 digits even for short DNIs', () => {
    expect(generatePatientId('Ana', '12')).toBe('A12')
    expect(generatePatientId('Ana', '5')).toBe('A5')
  })

  it('returns empty string for empty name', () => {
    expect(generatePatientId('', '12345678')).toBe('678')
  })

  it('returns only initials when DNI has no digits', () => {
    expect(generatePatientId('García, Juan', '')).toBe('GJ')
  })

  it('uppercases initials regardless of input case', () => {
    expect(generatePatientId('garcía, juan', '12345678')).toBe('GJ678')
  })
})

// ── saveStrokeEvent / getStrokeEvents / getStrokeEventById ────────────────────

describe('saveStrokeEvent', () => {
  it('stores an event and returns it with savedAt timestamp', () => {
    const saved = saveStrokeEvent({ id: 'e1', type: 'stroke' })
    expect(saved.id).toBe('e1')
    expect(saved.savedAt).toBeDefined()
    expect(new Date(saved.savedAt)).toBeInstanceOf(Date)
  })

  it('prepends new events (most recent first)', () => {
    saveStrokeEvent({ id: 'first' })
    saveStrokeEvent({ id: 'second' })
    const events = getStrokeEvents()
    expect(events[0].id).toBe('second')
    expect(events[1].id).toBe('first')
  })

  it('accumulates multiple events', () => {
    saveStrokeEvent({ id: 'a' })
    saveStrokeEvent({ id: 'b' })
    saveStrokeEvent({ id: 'c' })
    expect(getStrokeEvents()).toHaveLength(3)
  })
})

describe('getStrokeEvents', () => {
  it('returns empty array when storage is empty', () => {
    expect(getStrokeEvents()).toEqual([])
  })

  it('returns empty array when localStorage contains invalid JSON', () => {
    localStorage.setItem('codigo_stroke_events', 'not-json{{{')
    expect(getStrokeEvents()).toEqual([])
  })
})

describe('getStrokeEventById', () => {
  it('finds an event by id', () => {
    saveStrokeEvent({ id: 'target', foo: 'bar' })
    const found = getStrokeEventById('target')
    expect(found.foo).toBe('bar')
  })

  it('returns null when not found', () => {
    expect(getStrokeEventById('does-not-exist')).toBeNull()
  })
})

// ── saveSession / getSessions / loadSession ───────────────────────────────────

describe('saveSession', () => {
  it('stores a session keyed by patientId', () => {
    saveSession('GJ678', { step: 3 })
    const sessions = getSessions()
    expect(sessions['GJ678']).toBeDefined()
    expect(sessions['GJ678'].step).toBe(3)
  })

  it('adds updatedAt and patientId to the stored record', () => {
    saveSession('GJ678', { step: 2 })
    const session = getSessions()['GJ678']
    expect(session.patientId).toBe('GJ678')
    expect(session.updatedAt).toBeDefined()
  })

  it('overwrites an existing session for the same id', () => {
    saveSession('GJ678', { step: 1 })
    saveSession('GJ678', { step: 5 })
    expect(getSessions()['GJ678'].step).toBe(5)
  })
})

describe('getSessions', () => {
  it('returns empty object when storage is empty', () => {
    expect(getSessions()).toEqual({})
  })

  it('returns empty object when localStorage contains invalid JSON', () => {
    localStorage.setItem('codigo_stroke_sessions', 'bad-json')
    expect(getSessions()).toEqual({})
  })
})

describe('loadSession', () => {
  it('loads a session by its exact id', () => {
    saveSession('GJ678', { step: 4 })
    expect(loadSession('GJ678')?.step).toBe(4)
  })

  it('is case-insensitive and trims whitespace on lookup', () => {
    saveSession('GJ678', { step: 4 })
    // loadSession uppercases + trims before looking up
    expect(loadSession('gj678')?.step).toBe(4)
    expect(loadSession('  GJ678  ')?.step).toBe(4)
  })

  it('returns null for a missing session', () => {
    expect(loadSession('UNKNOWN')).toBeNull()
  })

  it('returns null for null/undefined input', () => {
    expect(loadSession(null)).toBeNull()
    expect(loadSession(undefined)).toBeNull()
  })
})

// ── caso activo (borrador crash-safe) ─────────────────────────────────────────

describe('case draft (saveCaseDraft / loadCaseDraft / clearCaseDraft)', () => {
  it('round-trips a saved case draft', () => {
    saveCaseDraft({ phase: 'pre', activeTab: 'clinica', nihss: { nihssScore: 5 } })
    const loaded = loadCaseDraft()
    expect(loaded.phase).toBe('pre')
    expect(loaded.activeTab).toBe('clinica')
    expect(loaded.nihss.nihssScore).toBe(5)
  })

  it('stamps _savedAt on save', () => {
    saveCaseDraft({ phase: 'pre' })
    expect(loadCaseDraft()._savedAt).toBeTruthy()
  })

  it('returns null when there is no draft', () => {
    expect(loadCaseDraft()).toBeNull()
  })

  it('clearCaseDraft removes the draft', () => {
    saveCaseDraft({ phase: 'pre' })
    clearCaseDraft()
    expect(loadCaseDraft()).toBeNull()
  })

  it('discards (and clears) a draft older than 12 h — avoids resuming a stale/other-patient case', () => {
    const old = new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString()
    localStorage.setItem('codigo_stroke_active_case', JSON.stringify({ phase: 'pre', _savedAt: old }))
    expect(loadCaseDraft()).toBeNull()
    // the stale entry was purged, not just ignored
    expect(localStorage.getItem('codigo_stroke_active_case')).toBeNull()
  })

  it('keeps a recent draft (within 12 h)', () => {
    const recent = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    localStorage.setItem('codigo_stroke_active_case', JSON.stringify({ phase: 'pre', _savedAt: recent }))
    expect(loadCaseDraft()?.phase).toBe('pre')
  })
})

// ── navMode (flag A/B: stepper vs scroll) ─────────────────────────────────────

describe('getNavMode / setNavMode', () => {
  it('defaults to "stepper" when nothing is stored', () => {
    expect(getNavMode()).toBe('stepper')
  })

  it('persists and reads back a valid mode', () => {
    setNavMode('scroll')
    expect(getNavMode()).toBe('scroll')
    setNavMode('stepper')
    expect(getNavMode()).toBe('stepper')
  })

  it('falls back to "stepper" for an invalid stored value', () => {
    localStorage.setItem('codigo_stroke_nav_mode', 'banana')
    expect(getNavMode()).toBe('stepper')
  })

  it('setNavMode rejects invalid input and normalizes to "stepper"', () => {
    expect(setNavMode('banana')).toBe('stepper')
    expect(getNavMode()).toBe('stepper')
  })
})
