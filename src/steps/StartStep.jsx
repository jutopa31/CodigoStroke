import { useState } from 'react'
import { Activity, Zap, RotateCcw, Clock, ChevronRight, BookOpen, User } from 'lucide-react'
import { loadSession, getSessions } from '../lib/storage'

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
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

function formatElapsed(ms) {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}min`
}

export default function StartStep({ onStart, onResume, onOpenEducational, authUser, onAuthClick }) {
  const [resumeId, setResumeId] = useState('')
  const [error, setError] = useState(false)
  const [showManualResume, setShowManualResume] = useState(false)
  const [recentSession] = useState(() => getRecentSession())
  const [now] = useState(() => Date.now())

  function handleResume() {
    const session = loadSession(resumeId)
    if (session) {
      setError(false)
      onResume(resumeId, session)
    } else {
      setError(true)
    }
  }

  function handleRecentResume() {
    if (!recentSession) return
    const session = loadSession(recentSession.id)
    if (session) onResume(recentSession.id, session)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-stroke-bg">
      {/* Logo */}
      <div className="relative mb-10">
        <div className="w-20 h-20 rounded-2xl bg-stroke-iconActive flex items-center justify-center shadow-elevated">
          <Activity size={36} className="text-white" strokeWidth={2} />
        </div>
      </div>

      <h1 className="text-3xl font-semibold text-stroke-text text-center tracking-tight mb-2">
        Código Stroke
      </h1>
      <p className="text-stroke-textMuted text-center text-sm mb-10 max-w-xs leading-relaxed">
        Protocolo de atención para ACV isquémico en fase aguda — AHA/ASA 2026
      </p>

      {/* Info chips */}
      <div className="flex gap-2 mb-10 flex-wrap justify-center">
        {['Ventana 4.5h', 'NIHSS', 'rtPA / TNK'].map((label) => (
          <span
            key={label}
            className="text-xs bg-stroke-navy text-stroke-textMuted px-3 py-1.5 rounded-lg border border-stroke-line"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Quick resume card */}
      {recentSession && (
        <button
          onClick={handleRecentResume}
          className="w-full max-w-xs mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 text-left transition-all hover:bg-amber-500/15 active:scale-[0.98]"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-amber-400" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Caso activo</p>
              <p className="text-sm font-semibold text-stroke-text truncate mt-0.5">
                {recentSession.patientName || 'Paciente'}
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                {recentSession.id} · hace {formatElapsed(now - recentSession.updated)}
              </p>
            </div>
            <ChevronRight size={18} className="text-amber-400/70 shrink-0 mt-2.5" />
          </div>
        </button>
      )}

      {/* CTA — large + bold so white-on-accent passes WCAG AA as large text (3.87 ≥ 3.0) */}
      <button
        onClick={onStart}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-stroke-iconActive hover:bg-[#4D6CD6] active:scale-[0.98] text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-elevated transition-all duration-150"
      >
        <Zap size={20} strokeWidth={2} />
        Iniciar Código Stroke
      </button>

      {/* Separator */}
      <div className="flex items-center gap-3 w-full max-w-xs mt-8">
        <hr className="flex-1 border-stroke-line" />
        <button
          type="button"
          onClick={() => setShowManualResume((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-stroke-textMuted hover:text-stroke-iconActive transition-colors min-h-[44px] px-3 -my-3"
        >
          <RotateCcw size={13} strokeWidth={2} />
          {showManualResume ? 'Ocultar' : 'Retomar otro caso'}
        </button>
        <hr className="flex-1 border-stroke-line" />
      </div>

      {/* Manual resume */}
      {showManualResume && (
        <div className="w-full max-w-xs mt-4 flex flex-col items-center gap-3 animate-fade-in">
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="XXXXXX"
              maxLength={6}
              value={resumeId}
              onChange={(e) => {
                setResumeId(e.target.value.toUpperCase())
                setError(false)
              }}
              className="flex-1 min-w-0 bg-stroke-navy border border-stroke-line rounded-xl px-4 py-3 text-stroke-text text-base font-mono tracking-widest focus:ring-2 focus:ring-stroke-iconActive/40 focus:border-stroke-iconActive placeholder-stroke-textMuted/50 uppercase transition-all"
            />
            <button
              onClick={handleResume}
              disabled={resumeId.length < 3}
              className="border border-stroke-iconActive text-stroke-iconActive rounded-xl py-3 px-5 font-semibold text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 hover:bg-stroke-iconActive/10"
            >
              <RotateCcw size={14} strokeWidth={2} />
              Reanudar
            </button>
          </div>
          <p className="text-xs text-stroke-textMuted self-start">Ingresá el ID del caso anterior</p>
          {error && (
            <p className="text-status-critical text-xs self-start animate-fade-in">Caso no encontrado</p>
          )}
        </div>
      )}

      <p className="mt-10 text-xs text-stroke-textMuted/70 text-center">
        Cada minuto importa · 1.9M neuronas/min
      </p>

      {/* Bottom actions */}
      <div className="mt-6 flex items-center gap-4">
        {onOpenEducational && (
          <button
            type="button"
            onClick={onOpenEducational}
            className="flex items-center gap-2 text-xs text-stroke-textMuted hover:text-amber-400 transition-colors min-h-[44px] px-3"
          >
            <BookOpen size={14} strokeWidth={2} />
            Modo educativo
          </button>
        )}
        {onAuthClick && (
          <button
            type="button"
            onClick={onAuthClick}
            className="flex items-center gap-2 text-xs text-stroke-textMuted hover:text-stroke-iconActive transition-colors min-h-[44px] px-3"
          >
            <User size={14} strokeWidth={2} />
            {authUser
              ? (authUser.user_metadata?.display_name || authUser.email || getInitials(authUser))
              : 'Iniciar sesión'
            }
          </button>
        )}
      </div>
    </div>
  )
}
