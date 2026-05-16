import { useEffect, useState } from 'react'
import { Clock, Target, Zap, Scissors } from 'lucide-react'

const MILESTONES = [
  { minutes: 25, label: 'TC', icon: Target },
  { minutes: 45, label: 'NIHSS', icon: Zap },
  { minutes: 60, label: 'Aguja', icon: Scissors },
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
  if (minutes >= 60) return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-600', label: 'Ventana vencida' }
  if (minutes >= 30) return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500', label: `${Math.ceil(60 - minutes)} min restantes` }
  return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-600', label: 'Ventana abierta' }
}

export default function GlobalTimer({ startTime, timestamps = {} }) {
  const [elapsed, setElapsed] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!startTime) return
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  if (!startTime) return null

  const minutes = elapsed / 60
  const phase = getPhase(minutes)

  const milestoneStatus = MILESTONES.map((m) => {
    const tsKey = m.label === 'TC' ? 'ctRequest' : m.label === 'Aguja' ? 'thrombolyticStart' : null
    const done = tsKey && timestamps[tsKey]
    const elapsedMin = done
      ? Math.floor((new Date(timestamps[tsKey]).getTime() - startTime.getTime()) / 60000)
      : null
    return { ...m, done, elapsedMin }
  })

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-500 ${phase.bg} animate-fade-in`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer md:px-6"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${phase.badge} text-white shadow-timer`}>
            <Clock size={16} />
          </div>
          <div>
            <span className={`font-mono font-bold text-lg tracking-wide ${phase.text}`}>
              {formatElapsed(elapsed)}
            </span>
            <span className={`ml-2 text-xs font-medium ${phase.text} opacity-75 hidden sm:inline`}>
              {phase.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {milestoneStatus.map((m) => (
            <span
              key={m.label}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                m.done
                  ? 'bg-emerald-100 text-emerald-700'
                  : minutes >= m.minutes
                    ? 'bg-red-100 text-red-600'
                    : 'bg-white/60 text-gray-500'
              }`}
            >
              {m.label}
              {m.done ? ` ${m.elapsedMin}′` : ''}
            </span>
          ))}
          <span className={`text-xs ${phase.text} opacity-50 ml-1 md:hidden`}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-2.5 md:px-6 animate-slide-down">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {milestoneStatus.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.label}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                    m.done
                      ? 'bg-emerald-100 text-emerald-700'
                      : minutes >= m.minutes
                        ? 'bg-red-100 text-red-600'
                        : 'bg-white/80 text-gray-500 border border-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{m.label}</span>
                  {m.done ? (
                    <span className="font-mono">{m.elapsedMin}′</span>
                  ) : (
                    <span className="font-mono opacity-60">
                      {minutes < m.minutes ? `−${Math.ceil(m.minutes - minutes)}′` : 'vencido'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
