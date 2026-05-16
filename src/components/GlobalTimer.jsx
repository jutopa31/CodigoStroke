import { useEffect, useState } from 'react'
import { Clock, Target, Zap, Scissors, ChevronDown, ChevronUp } from 'lucide-react'

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
  if (minutes >= 60) return { 
    bg: 'bg-red-50/80', 
    border: 'border-red-100',
    text: 'text-red-600', 
    badge: 'bg-red-500', 
    label: 'Ventana vencida' 
  }
  if (minutes >= 30) return { 
    bg: 'bg-amber-50/80', 
    border: 'border-amber-100',
    text: 'text-amber-600', 
    badge: 'bg-amber-500', 
    label: `${Math.ceil(60 - minutes)} min` 
  }
  return { 
    bg: 'bg-emerald-50/80', 
    border: 'border-emerald-100',
    text: 'text-emerald-600', 
    badge: 'bg-emerald-500', 
    label: 'Activa' 
  }
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
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${phase.bg} ${phase.border}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer md:px-6"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${phase.badge} text-white shadow-timer`}>
            <Clock size={18} strokeWidth={2} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono font-bold text-xl tracking-tight ${phase.text}`}>
              {formatElapsed(elapsed)}
            </span>
            <span className={`text-xs font-medium ${phase.text} opacity-70`}>
              {phase.label}
            </span>
          </div>
        </div>

        {/* Milestone pills */}
        <div className="flex items-center gap-1.5">
          {milestoneStatus.map((m) => (
            <span
              key={m.label}
              className={`text-[10px] font-medium px-2 py-1 rounded-md transition-colors ${
                m.done
                  ? 'bg-emerald-100 text-emerald-700'
                  : minutes >= m.minutes
                    ? 'bg-red-100 text-red-600'
                    : 'bg-white/70 text-neutral-500 border border-neutral-100'
              }`}
            >
              {m.label}
              {m.done && <span className="ml-0.5 opacity-75">{m.elapsedMin}&apos;</span>}
            </span>
          ))}
          <button className={`ml-1 p-1 rounded-md ${phase.text} opacity-50 hover:opacity-100 transition-opacity`}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 md:px-6 animate-slide-down">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {milestoneStatus.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.label}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    m.done
                      ? 'bg-emerald-100 text-emerald-700'
                      : minutes >= m.minutes
                        ? 'bg-red-100 text-red-600'
                        : 'bg-white text-neutral-500 border border-neutral-100'
                  }`}
                >
                  <Icon size={14} strokeWidth={2} />
                  <span>{m.label}</span>
                  {m.done ? (
                    <span className="font-mono">{m.elapsedMin}&apos;</span>
                  ) : (
                    <span className="font-mono opacity-60">
                      {minutes < m.minutes ? `−${Math.ceil(m.minutes - minutes)}'` : 'vencido'}
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
