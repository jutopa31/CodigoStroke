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

// Genera un ID legible: iniciales del nombre + últimos 3 dígitos del DNI
// Ej: "García, Juan" + 12345678 → "GJ678"
export function generatePatientId(name, dni) {
  const initials = name
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean)
    .join('')
  const last3 = String(dni).replace(/\D/g, '').slice(-3)
  return `${initials}${last3}`
}

// Guarda/actualiza una sesión por ID
export function saveSession(patientId, data) {
  const sessions = getSessions()
  sessions[patientId] = { ...data, patientId, updatedAt: new Date().toISOString() }
  localStorage.setItem('codigo_stroke_sessions', JSON.stringify(sessions))
}

// Obtiene todas las sesiones guardadas
export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem('codigo_stroke_sessions') || '{}')
  } catch { return {} }
}

// Carga una sesión por ID (retorna null si no existe)
export function loadSession(patientId) {
  return getSessions()[patientId?.toUpperCase().trim()] || null
}
