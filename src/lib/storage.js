import { supabase } from './supabase'

const STORAGE_KEY = 'codigo_stroke_events'

// ── Privacy ───────────────────────────────────────────────────────────────────

async function hashDni(dni) {
  if (!dni) return null
  const clean = String(dni).replace(/\D/g, '')
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(clean))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── localStorage (fuente de verdad) ──────────────────────────────────────────

function getLocalEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

// Upsert por id para que múltiples saveStrokeEvent del mismo caso no dupliquen
function upsertLocal(event) {
  const events = getLocalEvents()
  const idx = events.findIndex(e => e.id === event.id)
  if (idx >= 0) {
    events[idx] = event
  } else {
    events.unshift(event)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function markSynced(id) {
  const events = getLocalEvents()
  const idx = events.findIndex(e => e.id === id)
  if (idx >= 0) {
    events[idx] = { ...events[idx], _synced: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }
}

// ── Mapeo al esquema de Supabase ──────────────────────────────────────────────

async function toSupabaseRow(data) {
  // El snapshot no guarda el DNI en claro
  const snapshotPatient = data.patient
    ? { ...data.patient, dni: undefined }
    : undefined
  const formSnapshot = snapshotPatient
    ? { ...data, patient: snapshotPatient }
    : data

  return {
    id: data.id,
    source: data.source ?? 'app',
    patient_dni_hash: await hashDni(data.patient?.dni),
    patient_alias: data.patientId ?? null,
    patient_mrs_score: data.symptoms?.modifiedRankinScale?.score ?? null,

    door_time: data.patientArrivalTime ?? null,
    symptom_onset_time: data.symptoms?.lastSeenNormal ?? null,
    alert_sent_at: data.startTime ?? null,
    ct_request_time: data.ctRequestTime ?? null,
    thrombolytic_start_at: data.thrombolyticStartTime ?? null,
    angio_request_time: data.angioRequestTime ?? null,
    thrombectomy_activation_at: data.thrombectomyActivationTime ?? null,

    is_wake_up_stroke: data.symptoms?.isWakeUpStroke ?? null,
    has_bleeding: data.ctResult?.bleeding ?? null,
    has_mismatch: data.ctResult?.mismatch ?? null,
    has_absolute_contraindication: data.contraindications?.hasAbsolute ?? null,
    // thrombolysis_given: verdadero si se registró hora de inicio del trombolítico
    thrombolysis_given: data.thrombolyticStartTime != null
      ? true
      : (data.dosage != null ? false : null),
    thrombectomy_activated: data.thrombectomyActivationTime != null
      ? true
      : (data.thrombectomy != null ? false : null),
    drug_used: data.dosage?.drug ?? null,
    nihss_score: data.nihss?.nihssScore ?? null,
    aspects_score: data.thrombectomy?.aspectScore ?? null,

    vitals: data.vitals ?? null,
    symptoms: data.symptoms ?? null,
    contraindications: data.contraindications ?? null,
    dosage: data.dosage ?? null,
    thrombectomy: data.thrombectomy ?? null,

    form_status: data.outcome ? 'completed' : 'in_progress',
    last_step: data.lastStep ?? null,
    form_snapshot: formSnapshot,
  }
}

async function syncToSupabase(event) {
  if (!supabase) return
  try {
    const row = await toSupabaseRow(event)
    const { error } = await supabase
      .from('stroke_events')
      .upsert(row, { onConflict: 'id' })
    if (!error) markSynced(event.id)
  } catch {
    // Sin conexión — el evento queda pendiente en localStorage
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export function saveStrokeEvent(data) {
  const event = { ...data, savedAt: new Date().toISOString(), _synced: false }
  upsertLocal(event)
  syncToSupabase(event) // fire-and-forget; no bloquea el flujo clínico
  return event
}

export function getStrokeEvents() {
  return getLocalEvents()
}

export function getStrokeEventById(id) {
  return getLocalEvents().find(e => e.id === id) || null
}

// Llamar al iniciar la app o al detectar reconexión de red
export async function syncPendingEvents() {
  if (!supabase) return
  const pending = getLocalEvents().filter(e => !e._synced)
  for (const event of pending) {
    await syncToSupabase(event)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Genera un ID legible: iniciales del nombre + últimos 3 dígitos del DNI
// Ej: "García, Juan" + 12345678 → "GJ678"
export function generatePatientId(name, dni) {
  const initials = name
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase())
    .filter(Boolean)
    .join('')
  const last3 = String(dni).replace(/\D/g, '').slice(-3)
  return `${initials}${last3}`
}

export function saveSession(patientId, data) {
  const sessions = getSessions()
  sessions[patientId] = {
    ...sessions[patientId],
    ...data,
    patientId,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem('codigo_stroke_sessions', JSON.stringify(sessions))
}

export function getSessions() {
  try {
    return JSON.parse(localStorage.getItem('codigo_stroke_sessions') || '{}')
  } catch { return {} }
}

export function loadSession(patientId) {
  return getSessions()[patientId?.toUpperCase().trim()] || null
}

// ── Caso activo (borrador para sobrevivir recargas / crash) ───────────────────
// Un solo caso activo a la vez (contexto de guardia: un ACV agudo por vez).
// Se autoguarda en cada cambio y se LIMPIA al reiniciar el protocolo o iniciar
// un paciente nuevo, para no arrastrar datos de un paciente a otro.
const ACTIVE_CASE_KEY = 'codigo_stroke_active_case'

// Borradores más viejos que esto se descartan: probablemente de un turno
// anterior / otro paciente. Evita ofrecer "retomar" un caso ajeno.
const CASE_DRAFT_MAX_AGE_MS = 12 * 60 * 60 * 1000 // 12 h

export function saveCaseDraft(snapshot) {
  try {
    localStorage.setItem(
      ACTIVE_CASE_KEY,
      JSON.stringify({ ...snapshot, _savedAt: new Date().toISOString() }),
    )
  } catch { /* cuota excedida / modo privado — best effort */ }
}

export function loadCaseDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(ACTIVE_CASE_KEY) || 'null')
    if (!draft) return null
    const savedAt = draft._savedAt ? new Date(draft._savedAt).getTime() : 0
    if (!savedAt || Date.now() - savedAt > CASE_DRAFT_MAX_AGE_MS) {
      clearCaseDraft()
      return null
    }
    return draft
  } catch {
    return null
  }
}

export function clearCaseDraft() {
  try {
    localStorage.removeItem(ACTIVE_CASE_KEY)
  } catch { /* ignore */ }
}

// ── Modo de navegación (flag A/B: stepper horizontal vs scroll vertical) ──────
const NAV_MODE_KEY = 'codigo_stroke_nav_mode'
const NAV_MODES = ['stepper', 'scroll']

// Default 'stepper' — el modo nuevo es opt-in hasta validarlo. Un valor inválido
// o storage inaccesible (Safari privado) cae al default.
export function getNavMode() {
  try {
    const v = localStorage.getItem(NAV_MODE_KEY)
    return NAV_MODES.includes(v) ? v : 'stepper'
  } catch {
    return 'stepper'
  }
}

export function setNavMode(mode) {
  const next = NAV_MODES.includes(mode) ? mode : 'stepper'
  try {
    localStorage.setItem(NAV_MODE_KEY, next)
  } catch { /* ignore */ }
  return next
}
