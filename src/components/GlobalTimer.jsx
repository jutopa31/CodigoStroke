import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

const MILESTONES = [
  { minutes: 25, label: 'TC' },
  { minutes: 45, label: 'NIHSS' },
  { minutes: 60, label: 'Aguja' },
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

function getTimerColor(seconds) {
  const minutes = seconds / 60
  if (minutes >= 60) return 'bg-red-600 text-white'
  if (minutes >= 30) return 'bg-yellow-500 text-white'
  return 'bg-emerald-600 text-white'
}

export default function GlobalTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0)

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
  const nextMilestone = MILESTONES.find((m) => minutes < m.minutes)

  return (
    <div className={`fixed top-3 right-3 z-50 rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 max-w-[calc(100vw-1.5rem)] ${getTimerColor(elapsed)} animate-fade-in`}>
      <Clock size={15} className="opacity-80" />
      <span className="font-mono font-semibold text-sm tracking-wide">
        {formatElapsed(elapsed)}
      </span>
      {nextMilestone && (
        <span className="text-xs opacity-75 hidden sm:inline">
          → {nextMilestone.label} {pad(nextMilestone.minutes - Math.floor(minutes))}′
        </span>
      )}
    </div>
  )
}
