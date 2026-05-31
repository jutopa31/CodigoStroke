import { useEffect, useState } from 'react'
import { Clock, Activity, RotateCcw, BookOpen, User } from 'lucide-react'

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function fmtClock(ts) {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function getPhase(minutes) {
  if (minutes >= 60) return {
    bg: 'bg-blue-900',
    muted: 'text-blue-200',
    badge: 'bg-white/25 text-white',
    timer: 'md:bg-stroke-panel md:text-white',
  }
  if (minutes >= 30) return {
    bg: 'bg-brand-700',
    muted: 'text-brand-200',
    badge: 'bg-white/25 text-white',
    timer: 'md:bg-amber-500 md:text-white',
  }
  return {
    bg: 'bg-brand-600',
    muted: 'text-brand-300',
    badge: 'bg-white/25 text-white',
    timer: 'md:bg-stroke-panel md:text-white',
  }
}

function EventBadge({ label, time, badgeClass, compact = false }) {
  return (
    <span className={`flex items-center gap-1 rounded-md whitespace-nowrap ${compact ? 'px-2.5 py-1.5' : 'px-2 py-0.5'} ${badgeClass}`}>
      <span className={`${compact ? 'text-[10px]' : 'text-[9px]'} font-semibold uppercase tracking-wide opacity-75`}>{label}</span>
      <span className={`${compact ? 'text-[11px]' : 'text-[10px]'} font-mono font-bold`}>{fmtClock(time)}</span>
    </span>
  )
}

function getEventBadges(startTime, timestamps) {
  if (!startTime) return []
  return [
    { label: 'Código', time: startTime },
    timestamps.ctRequest && { label: 'TC', time: timestamps.ctRequest },
    timestamps.thrombolyticStart && { label: 'Trombolisis', time: timestamps.thrombolyticStart },
    timestamps.angioRequest && { label: 'Hemodinamia', time: timestamps.angioRequest },
  ].filter(Boolean)
}

export default function GlobalTimer({ startTime, timestamps = {}, patient, onReset, progressPct, onEducationalOpen, authUser, onAuthClick }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return
    const tick = () => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const minutes = elapsed / 60
  const phase = startTime ? getPhase(minutes) : null
  const bg = phase ? phase.bg : 'bg-brand-600'
  const eventBadges = getEventBadges(startTime, timestamps)
  const primaryEvent = eventBadges[eventBadges.length - 1]

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${bg} transition-colors duration-500 md:border-b md:border-stroke-line md:bg-stroke-navy`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2 md:h-11 md:px-5 md:py-0">
        <div className="flex items-center gap-2.5 min-w-0 shrink md:gap-3">
          <div className={`w-10 h-10 md:w-7 md:h-7 rounded-xl md:rounded-lg bg-white/20 flex items-center justify-center shrink-0 ${phase?.timer ?? 'md:bg-stroke-panel md:text-white'}`}>
            {startTime
              ? <Clock size={16} className="text-white" strokeWidth={2} />
              : <Activity size={16} className="text-white" strokeWidth={2} />
            }
          </div>
          {startTime ? (
            <div className="min-w-0">
              <span className="block font-mono font-bold text-[1.35rem] leading-none md:text-lg text-white tracking-tight tabular-nums">
                {formatElapsed(elapsed)}
              </span>
              {primaryEvent && (
                <span className="mt-1 block truncate text-[10px] font-semibold uppercase tracking-wide text-white/65 md:hidden">
                  {primaryEvent.label} {fmtClock(primaryEvent.time)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-white font-semibold text-sm tracking-wide">Código Stroke</span>
          )}
        </div>

        {startTime && (
          <div className="hidden md:flex items-center justify-center gap-1.5 mx-2 overflow-x-auto shrink min-w-0" style={{ scrollbarWidth: 'none' }}>
            {eventBadges.map((event) => (
              <EventBadge
                key={event.label}
                label={event.label}
                time={event.time}
                badgeClass={`${phase.badge} md:bg-white/10 md:text-stroke-textMuted`}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          {startTime && patient && (
            <span className={`text-xs font-medium ${phase.muted} md:text-white truncate max-w-[140px] hidden md:block`}>
              {patient.name}
            </span>
          )}
          {onAuthClick && (
            <button
              type="button"
              onClick={onAuthClick}
              className="w-11 h-11 md:w-7 md:h-7 rounded-xl md:rounded-lg border border-white/20 md:border-white/10 bg-white/10 md:bg-white/10 flex items-center justify-center text-white md:text-stroke-textMuted hover:bg-white/20 md:hover:bg-white/15 transition-colors"
              title={authUser ? 'Tu cuenta' : 'Iniciar sesión'}
              aria-label={authUser ? 'Tu cuenta' : 'Iniciar sesión'}
            >
              {authUser
                ? <span className="text-[10px] font-bold leading-none">{getInitials(authUser)}</span>
                : <User size={14} strokeWidth={2} />
              }
            </button>
          )}
          {onEducationalOpen && (
            <button
              type="button"
              onClick={onEducationalOpen}
              className="w-11 h-11 md:w-7 md:h-7 rounded-xl md:rounded-lg border border-white/20 md:border-white/10 bg-white/10 md:bg-white/10 flex items-center justify-center text-white md:text-stroke-textMuted hover:bg-white/20 md:hover:bg-white/15 transition-colors"
              title="Referencia educativa del protocolo"
              aria-label="Abrir referencia educativa"
            >
              <BookOpen size={14} strokeWidth={2} />
            </button>
          )}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="w-11 h-11 md:w-7 md:h-7 rounded-xl md:rounded-lg border border-white/20 md:border-white/10 bg-white/10 md:bg-white/10 flex items-center justify-center text-white md:text-stroke-textMuted hover:bg-white/20 md:hover:bg-white/15 transition-colors"
              title="Reiniciar protocolo"
              aria-label="Reiniciar protocolo"
            >
              <RotateCcw size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {startTime && eventBadges.length > 1 && (
        <div className="md:hidden border-t border-white/10 px-3 pb-2">
          <div
            className="flex gap-1.5 overflow-x-auto pt-2 pr-8 [mask-image:linear-gradient(to_right,black_0%,black_86%,transparent_100%)]"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {eventBadges.map((event) => (
              <EventBadge key={event.label} label={event.label} time={event.time} badgeClass={phase.badge} compact />
            ))}
          </div>
        </div>
      )}

      {progressPct > 0 && (
        <div className="h-1.5 bg-white/10 md:bg-stroke-line">
          <div
            className={`h-full rounded-r-full transition-all duration-500 md:bg-stroke-iconActive ${
              !phase ? 'bg-emerald-400' :
              minutes < 30 ? 'bg-emerald-400' :
              minutes < 60 ? 'bg-amber-400' :
              'bg-blue-400'
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
