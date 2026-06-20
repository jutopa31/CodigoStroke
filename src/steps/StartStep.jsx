import { useState } from 'react'
import { RotateCcw, BookOpen, User, History, ClipboardList } from 'lucide-react'
import { loadSession, getSessions } from '../lib/storage'

// Maximum IV thrombolysis window: 4h 29min
const WINDOW_HH = 4
const WINDOW_MM = 29

function pad(n) {
  return String(n).padStart(2, '0')
}

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
}

function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function getRecentSession() {
  const sessions = getSessions()
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000
  let best = null
  for (const [id, s] of Object.entries(sessions)) {
    const updated = new Date(s.updatedAt || s.startTime || 0).getTime()
    if (updated > fourHoursAgo && (!best || updated > best.updated)) {
      best = { id, ...s, updated }
    }
  }
  return best
}

function getTreatmentBadge(session) {
  const drug = session?.dosage?.drug ?? session?.drug_used
  if (drug === 'rtPA') return 'rtPA'
  if (drug === 'TNK') return 'TNK'
  if (session?.thrombectomy?.activated || session?.thrombectomy_activated) return 'TM'
  return null
}

function getSessionMeta(session) {
  const parts = []
  const sex = session?.patient?.sex
  const age = session?.patient?.age
  if (sex) parts.push(sex === 'M' ? 'M' : 'F')
  if (age) parts.push(age)
  const nihss = session?.nihss?.nihssScore ?? session?.nihss_score
  if (nihss != null) parts.push(`NIHSS ${nihss}`)
  return parts.join('')
}

export default function StartStep({ onStart, onResume, onOutOfWindow, onOpenEducational, authUser, onAuthClick }) {
  const [recentSession] = useState(() => getRecentSession())
  const [showResume, setShowResume] = useState(false)
  const [resumeId, setResumeId] = useState('')
  const [error, setError] = useState(false)

  function handleRecentResume() {
    if (!recentSession) return
    const session = loadSession(recentSession.id)
    if (session) onResume(recentSession.id, session)
  }

  function handleManualResume() {
    const session = loadSession(resumeId)
    if (session) { setError(false); onResume(resumeId, session) }
    else setError(true)
  }

  const badge = recentSession ? getTreatmentBadge(recentSession) : null
  const meta  = recentSession ? getSessionMeta(recentSession) : ''

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-stroke-bg px-5 py-8"
      style={{ paddingTop: 'max(32px, env(safe-area-inset-top, 0px))' }}
    >
      {/* Top-right utility buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-xl border border-stroke-line/70 bg-stroke-navy/45 p-1 backdrop-blur-sm"
           style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
        {onOpenEducational && (
          <button
            type="button"
            onClick={onOpenEducational}
            aria-label="Modo educativo"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stroke-textMuted transition-colors hover:bg-stroke-iconActive/10 hover:text-amber-400"
          >
            <BookOpen size={16} strokeWidth={2} />
          </button>
        )}
        {onAuthClick && (
          <button
            type="button"
            onClick={onAuthClick}
            aria-label={authUser ? 'Tu cuenta' : 'Iniciar sesión'}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-stroke-textMuted transition-colors hover:bg-stroke-iconActive/10 hover:text-stroke-iconActive"
          >
            {authUser
              ? <span className="text-[10px] font-bold text-stroke-iconActive">{getInitials(authUser)}</span>
              : <User size={16} strokeWidth={2} />
            }
          </button>
        )}
      </div>

      {/* ── Title ── */}
      <div className="flex w-full max-w-sm flex-col items-center">
      <h1 className="text-[2rem] font-bold tracking-tight mb-1 text-center md:text-[2.15rem]">
        <span className="text-stroke-text">Código</span>
        <span className="text-stroke-iconActive">Stroke</span>
      </h1>
      <p className="text-stroke-textMuted text-sm text-center mb-8">
        Protocolo ACV Isquémico · AHA/ASA 2026
      </p>

      {/* ── Hero: IV thrombolysis window (static reference, NOT a live clock) ── */}
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stroke-textMuted mb-2">
          Ventana de trombólisis IV
        </p>
        <div
          className="font-mono font-bold text-stroke-text tabular-nums leading-none flex items-baseline justify-center gap-1"
          style={{ fontSize: 'clamp(2.5rem, 12vw, 3.25rem)', letterSpacing: '-0.01em' }}
          aria-label={`Ventana de trombólisis intravenosa: ${WINDOW_HH} horas ${WINDOW_MM} minutos`}
        >
          <span>{WINDOW_HH}</span>
          <span className="font-sans text-xl font-semibold text-stroke-textMuted">h</span>
          <span>{pad(WINDOW_MM)}</span>
          <span className="font-sans text-xl font-semibold text-stroke-textMuted">min</span>
        </div>
        <p className="text-stroke-textMuted text-xs mt-2">desde el inicio de los síntomas</p>
      </div>

      {/* ── Last event card ── */}
      <div className="w-full mb-4">
        {recentSession ? (
          <button
            onClick={handleRecentResume}
            className="w-full rounded-xl border border-stroke-line bg-stroke-navy/90 px-4 py-3.5 text-left transition hover:bg-stroke-navy/70 active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-stroke-textMuted uppercase tracking-wider mb-1.5">
                  Último evento
                </p>
                <p className="text-sm font-semibold text-stroke-text leading-snug">
                  {recentSession.updated ? `Hoy ${fmtTime(recentSession.updated)}` : recentSession.id}
                  {meta ? ` · ${meta}` : ''}
                </p>
              </div>
              {badge && (
                <span className="shrink-0 mt-0.5 bg-stroke-iconActive/15 text-stroke-iconActive text-[10px] font-bold px-2 py-0.5 rounded-md border border-stroke-iconActive/25">
                  {badge}
                </span>
              )}
            </div>
          </button>
        ) : (
          <div className="w-full rounded-xl border border-stroke-line bg-stroke-navy/70 px-4 py-3.5">
            <p className="text-[10px] font-semibold text-stroke-textMuted uppercase tracking-wider mb-1.5">
              Último evento
            </p>
            <p className="text-sm text-stroke-textMuted/40">Sin casos recientes</p>
          </div>
        )}
      </div>

      {/* ── Primary CTA ── */}
      <button
        onClick={onStart}
        className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-elevated transition duration-150 hover:bg-brand-700 active:scale-[0.98]"
      >
        Iniciar Código Stroke
      </button>

      {/* ── Secondary CTA ── */}
      <button
        type="button"
        onClick={() => setShowResume(v => !v)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-stroke-line px-8 py-[13px] text-sm font-medium text-stroke-textMuted transition duration-150 hover:border-stroke-iconActive/40 hover:text-stroke-iconActive active:scale-[0.98]"
      >
        <History size={15} strokeWidth={2} />
        Ver historial de eventos
      </button>

      {/* ── ACV evolucionado / fuera de ventana — NO activa el código stroke ── */}
      {onOutOfWindow && (
        <button
          type="button"
          onClick={onOutOfWindow}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-[13px] text-sm font-medium text-stroke-textMuted transition duration-150 hover:bg-stroke-navy/55 hover:text-stroke-text active:scale-[0.98]"
        >
          <ClipboardList size={15} strokeWidth={2} />
          ACV fuera de ventana
        </button>
      )}

      {/* ── Manual resume (expandable) ── */}
      {showResume && (
        <div className="mt-4 flex w-full flex-col gap-3 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ID del caso"
              maxLength={6}
              value={resumeId}
              onChange={(e) => { setResumeId(e.target.value.toUpperCase()); setError(false) }}
              className="flex-1 min-w-0 bg-stroke-navy border border-stroke-line rounded-xl px-4 py-3 text-stroke-text text-base font-mono tracking-widest focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive placeholder-stroke-textMuted/40 uppercase transition"
            />
            <button
              onClick={handleManualResume}
              disabled={resumeId.length < 3}
              className="border border-stroke-iconActive text-stroke-iconActive rounded-xl py-3 px-4 font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95 hover:bg-stroke-iconActive/10"
            >
              <RotateCcw size={14} strokeWidth={2} />
              Ir
            </button>
          </div>
          {error && (
            <p className="text-status-critical text-xs animate-fade-in">Caso no encontrado</p>
          )}
        </div>
      )}
      </div>

    </div>
  )
}
