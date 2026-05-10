// Storage interface — localStorage now, ready to swap for Supabase
const STORAGE_KEY = 'codigo_stroke_events'

export function saveStrokeEvent(data) {
  const events = getStrokeEvents()
  const event = { ...data, savedAt: new Date().toISOString() }
  events.unshift(event)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  return event
}

export function getStrokeEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function getStrokeEventById(id) {
  return getStrokeEvents().find((e) => e.id === id) || null
}
