import { useState } from 'react'
import { RotateCcw, BookOpen, User, History } from 'lucide-react'
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

export default function StartStep({ onStart, onResume, onOpenEducational, authUser, onAuthClick }) {
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
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 bg-stroke-bg"
      style={{ paddingTop: 'max(40px, env(safe-area-inset-top, 0px))' }}
    >
      {/* Top-right utility buttons */}
      <div className="absolute top-0 right-0 flex items-center gap-0.5 p-2"
           style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
        {onOpenEducational && (
          <button
            type="button"
            onClick={onOpenEducational}
            aria-label="Modo educativo"
            className="w-11 h-11 flex items-center justify-center text-stroke-textMuted hover:text-amber-400 transition-colors rounded-xl"
          >
            <BookOpen size={16} strokeWidth={2} />
          </button>
        )}
        {onAuthClick && (
          <button
            type="button"
            onClick={onAuthClick}
            aria-label={authUser ? 'Tu cuenta' : 'Iniciar sesión'}
            className="w-11 h-11 flex items-center justify-center text-stroke-textMuted hover:text-stroke-iconActive transition-colors rounded-xl"
          >
            {authUser
              ? <span className="text-[10px] font-bold text-stroke-iconActive">{getInitials(authUser)}</span>
              : <User size={16} strokeWidth={2} />
            }
          </button>
        )}
      </div>

      {/* ── Title ── */}
      <h1 className="text-[2rem] font-bold tracking-tight mb-1 text-center">
        <span className="text-stroke-text">Código</span>
        <span className="text-stroke-iconActive">Stroke</span>
      </h1>
      <p className="text-stroke-textMuted text-sm text-center mb-10">
        Protocolo ACV Isquémico · AHA/ASA 2026
      </p>

      {/* ── Hero: therapeutic window ── */}
      <div className="text-center mb-10">
        <div
          className="font-mono font-bold text-status-warning tabular-nums leading-none"
          style={{ fontSize: 'clamp(3rem, 15vw, 3.75rem)', letterSpacing: '-0.01em' }}
          aria-label={`Ventana terapéutica: ${WINDOW_HH} horas ${WINDOW_MM} minutos`}
        >
          {pad(WINDOW_HH)}&nbsp;:&nbsp;{pad(WINDOW_MM)}
        </div>
        <p className="text-stroke-textMuted text-sm mt-3">ventana terapéutica disponible</p>
      </div>

      {/* ── Last event card ── */}
      <div className="w-full max-w-xs mb-4">
        {recentSession ? (
          <button
            onClick={handleRecentResume}
            className="w-full bg-stroke-navy border border-stroke-line rounded-2xl px-5 py-4 text-left transition-all hover:bg-stroke-navy/70 active:scale-[0.98]"
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
          <div className="w-full bg-stroke-navy border border-stroke-line rounded-2xl px-5 py-4">
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
        className="w-full max-w-xs flex items-center justify-center font-bold text-base py-4 px-8 rounded-full bg-stroke-iconActive hover:bg-[#4D6CD6] active:scale-[0.98] text-white shadow-elevated transition-all duration-150 mb-3"
      >
        Iniciar Código Stroke
      </button>

      {/* ── Secondary CTA ── */}
      <button
        type="button"
        onClick={() => setShowResume(v => !v)}
        className="w-full max-w-xs flex items-center justify-center gap-2 font-medium text-sm py-[15px] px-8 rounded-full border border-stroke-line text-stroke-textMuted hover:border-stroke-iconActive/40 hover:text-stroke-iconActive active:scale-[0.98] transition-all duration-150"
      >
        <History size={15} strokeWidth={2} />
        Ver historial de eventos
      </button>

      {/* ── Manual resume (expandable) ── */}
      {showResume && (
        <div className="w-full max-w-xs mt-4 flex flex-col gap-3 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ID del caso"
              maxLength={6}
              value={resumeId}
              onChange={(e) => { setResumeId(e.target.value.toUpperCase()); setError(false) }}
              className="flex-1 min-w-0 bg-stroke-navy border border-stroke-line rounded-xl px-4 py-3 text-stroke-text text-base font-mono tracking-widest focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive placeholder-stroke-textMuted/40 uppercase transition-all"
            />
            <button
              onClick={handleManualResume}
              disabled={resumeId.length < 3}
              className="border border-stroke-iconActive text-stroke-iconActive rounded-xl py-3 px-4 font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-stroke-iconActive/10"
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
  )
}
