import { useEffect, useState } from 'react'
import { Clock, Activity, RotateCcw, BookOpen, User } from 'lucide-react'

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
}

const MILESTONES = [
  { minutes: 25, label: 'TC', tsKey: 'ctRequest' },
  { minutes: 45, label: 'NIHSS', tsKey: null },
  { minutes: 60, label: 'Aguja', tsKey: 'thrombolyticStart' },
]

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

function getPhase(minutes) {
  if (minutes >= 60) return {
    bg: 'bg-blue-900',
    muted: 'text-blue-200',
    done: 'bg-white/25 text-white',
    over: 'bg-white/35 text-white',
    pending: 'bg-white/10 text-white/50',
  }
  if (minutes >= 30) return {
    bg: 'bg-amber-500',
    muted: 'text-amber-200',
    done: 'bg-white/25 text-white',
    over: 'bg-white/35 text-white',
    pending: 'bg-white/10 text-white/50',
  }
  return {
    bg: 'bg-brand-600',
    muted: 'text-brand-300',
    done: 'bg-white/25 text-white',
    over: 'bg-white/30 text-white',
    pending: 'bg-white/10 text-white/50',
  }
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

  const milestoneStatus = startTime
    ? MILESTONES.map((m) => {
        const done = m.tsKey && timestamps[m.tsKey]
        const elapsedMin = done
          ? Math.floor((new Date(timestamps[m.tsKey]).getTime() - startTime.getTime()) / 60000)
          : null
        return { ...m, done, elapsedMin }
      })
    : []

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${bg} transition-colors duration-500`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: brand icon + timer or app name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            {startTime
              ? <Clock size={16} className="text-white" strokeWidth={2} />
              : <Activity size={16} className="text-white" strokeWidth={2} />
            }
          </div>
          {startTime ? (
            <span className="font-mono font-bold text-xl text-white tracking-tight tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          ) : (
            <span className="text-white font-semibold text-sm tracking-wide">Código Stroke</span>
          )}
        </div>

        {/* Center: milestone badges when timer is running */}
        {startTime && (
          <div className="flex items-center gap-1 mx-2 shrink-0">
            {milestoneStatus.map((m) => (
              <span
                key={m.label}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                  m.done
                    ? phase.done
                    : minutes >= m.minutes
                      ? phase.over
                      : phase.pending
                }`}
              >
                {m.label}
                {m.done && <span className="ml-0.5 opacity-75">{m.elapsedMin}&apos;</span>}
              </span>
            ))}
          </div>
        )}

        {/* Right: patient name (desktop) + reset */}
        <div className="flex items-center gap-2 shrink-0">
          {startTime && patient && (
            <span className={`text-xs font-medium ${phase.muted} truncate max-w-[140px] hidden md:block`}>
              {patient.name}
            </span>
          )}
          {patient && (
            <span className={`text-xs font-medium ${phase ? phase.muted : 'text-brand-300'} truncate max-w-[90px] md:hidden`}>
              {patient.name.split(' ')[0]}
            </span>
          )}
          {onAuthClick && (
            <button
              type="button"
              onClick={onAuthClick}
              className="w-8 h-8 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
              className="w-8 h-8 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
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
              className="w-8 h-8 rounded-lg border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              title="Reiniciar protocolo"
              aria-label="Reiniciar protocolo"
            >
              <RotateCcw size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {progressPct > 0 && (
        <div className="h-0.5 bg-white/20">
          <div
            className="h-full bg-white/60 rounded-r-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
