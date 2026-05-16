import { useState, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { StatusPill } from '../components/GuidedControls'

const IV_WINDOW_MINUTES = 270
const OGV_WINDOW_MINUTES = 1440
const MAX_SLIDER_MINUTES = 1440
const IV_WINDOW_PERCENT = `${(IV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`
const OGV_WINDOW_PERCENT = `${(OGV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`

function toLocalDateInput(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toLocalTimeInput(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function combineDateTime(datePart, timePart) {
  if (!datePart || !timePart) return ''
  return `${datePart}T${timePart}`
}

function useInterval(ms) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}

function getElapsedMinutes(dateStr) {
  if (!dateStr) return 0
  return Math.max(0, (Date.now() - new Date(dateStr).getTime()) / (1000 * 60))
}

function formatElapsed(minutes) {
  const rounded = Math.max(0, Math.round(minutes))
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  if (h > 0 && m > 0) return `${h}h ${m}min`
  if (h > 0) return `${h}h`
  return `${m} min`
}

function formatClock(dateStr) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function TimeStep({ onConfirm, isCollapsed = false }) {
  const [lastSeenDate, setLastSeenDate] = useState(() => toLocalDateInput(new Date()))
  const [lastSeenTime, setLastSeenTime] = useState(() => toLocalTimeInput(new Date()))
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [isIncierto, setIsIncierto] = useState(false)

  useInterval(1000)

  const lastSeen = combineDateTime(lastSeenDate, lastSeenTime)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const shouldEvaluateOgv = elapsedMinutes > IV_WINDOW_MINUTES && elapsedMinutes <= OGV_WINDOW_MINUTES
  const isOutOfWindow = elapsedMinutes > OGV_WINDOW_MINUTES
  const timeTone = isOutOfWindow ? 'red' : shouldEvaluateOgv ? 'orange' : 'blue'
  const timeStatusLabel = isOutOfWindow ? 'Fuera de ventana' : shouldEvaluateOgv ? 'Evaluar OGV' : 'Ventana IV activa'

  function applyOffset(mins) {
    const rounded = Number(mins)
    const date = new Date()
    date.setMinutes(date.getMinutes() - rounded)
    setOffsetMinutes(rounded)
    setLastSeenDate(toLocalDateInput(date))
    setLastSeenTime(toLocalTimeInput(date))
    setConfirmed(false)
  }

  function handleConfirm(isWakeUpStroke) {
    setConfirmed(true)
    onConfirm({ lastSeenNormal: lastSeen, isWakeUpStroke })
  }

  function handleSubmit() {
    if (!lastSeen) return
    if (isIncierto) {
      handleConfirm(shouldEvaluateOgv)
    } else {
      handleConfirm(false)
    }
  }

  const toneStyles = {
    red: {
      container: 'bg-red-50/50 border-red-100',
      label: 'text-red-700',
      elapsed: 'text-red-600',
      slider: 'accent-red-500',
    },
    orange: {
      container: 'bg-amber-50/50 border-amber-100',
      label: 'text-amber-700',
      elapsed: 'text-amber-600',
      slider: 'accent-amber-500',
    },
    blue: {
      container: 'bg-blue-50/50 border-blue-100',
      label: 'text-blue-700',
      elapsed: 'text-blue-600',
      slider: 'accent-blue-500',
    },
  }[timeTone]

  const stepTitle = isIncierto ? 'Última vez asintomático' : 'Inicio de síntomas'
  const sliderLabel = isIncierto ? 'Última vez visto asintomático' : 'Inicio de síntomas'

  if (isCollapsed && confirmed) {
    return (
      <CollapsedStep title={stepTitle}>
        {formatClock(lastSeen)} · {formatElapsed(elapsedMinutes)} · {timeStatusLabel}
      </CollapsedStep>
    )
  }

  return (
    <StepCard step="2" title={stepTitle} accent={timeTone}>
      <div className={`rounded-xl border p-4 ${toneStyles.container}`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 ${toneStyles.label}`}>
            <Clock size={12} strokeWidth={2} /> {sliderLabel}
          </label>
          <div className="flex items-center gap-2">
            {lastSeen && (
              <span className={`text-sm font-bold tabular-nums ${toneStyles.elapsed}`}>
                {formatElapsed(elapsedMinutes)}
              </span>
            )}
            <StatusPill complete={confirmed}>
              {confirmed ? timeStatusLabel : 'Pendiente'}
            </StatusPill>
          </div>
        </div>

        {/* Slider */}
        <div className="relative pb-8">
          <input
            id="last-seen-slider"
            type="range"
            min="0"
            max={MAX_SLIDER_MINUTES}
            step="5"
            value={offsetMinutes ?? Math.round(Math.min(elapsedMinutes, MAX_SLIDER_MINUTES))}
            onChange={(e) => applyOffset(e.target.value)}
            className={`h-2 w-full cursor-pointer rounded-full ${toneStyles.slider}`}
            aria-label="Minutos desde ultima vez asintomático"
          />
          
          {/* Markers */}
          <button
            type="button"
            onClick={() => applyOffset(IV_WINDOW_MINUTES)}
            className="absolute top-6 flex -translate-x-1/2 flex-col items-center gap-1 transition hover:opacity-80 focus:outline-none"
            style={{ left: IV_WINDOW_PERCENT }}
          >
            <span className="h-2 w-0.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-semibold text-amber-600 bg-white px-1.5 py-0.5 rounded-md border border-amber-200">4.5h</span>
          </button>
          <button
            type="button"
            onClick={() => applyOffset(OGV_WINDOW_MINUTES)}
            className="absolute top-6 flex -translate-x-full flex-col items-end gap-1 transition hover:opacity-80 focus:outline-none"
            style={{ left: OGV_WINDOW_PERCENT }}
          >
            <span className="h-2 w-0.5 rounded-full bg-red-400" />
            <span className="text-[10px] font-semibold text-red-600 bg-white px-1.5 py-0.5 rounded-md border border-red-200">24h</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!lastSeen}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all active:scale-[0.98] ${
                confirmed
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : lastSeen
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              }`}
            >
              {confirmed ? <><CheckCircle2 size={12} strokeWidth={2} /> Registrado</> : 'Registrar'}
            </button>
            <button
              type="button"
              aria-pressed={isIncierto}
              onClick={() => { setIsIncierto((v) => !v); setConfirmed(false) }}
              className={`flex h-8 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-medium transition-all active:scale-[0.98] ${
                isIncierto
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-50'
              }`}
            >
              <Clock size={11} strokeWidth={2} />
              Incierto
            </button>
          </div>
          {lastSeen && (
            <span className="text-xs font-medium text-neutral-400 tabular-nums">
              {formatClock(lastSeen)}
            </span>
          )}
        </div>
      </div>
    </StepCard>
  )
}
