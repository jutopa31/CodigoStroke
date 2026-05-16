import { useState, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import StepCard from '../components/StepCard'
import WakeUpStrokeModal from '../components/WakeUpStrokeModal'
import { StatusPill } from '../components/GuidedControls'

const IV_WINDOW_MINUTES = 270
const OGV_WINDOW_MINUTES = 540
const MAX_SLIDER_MINUTES = 720
const IV_WINDOW_PERCENT = `${(IV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`

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

function parseClockEntry(value) {
  const trimmed = value.trim()
  const colonMatch = trimmed.match(/^(\d{1,2}):(\d{1,2})$/)
  let hours
  let minutes

  if (colonMatch) {
    hours = Number(colonMatch[1])
    minutes = Number(colonMatch[2])
  } else {
    const digits = trimmed.replace(/\D/g, '')
    if (!digits) return null
    if (digits.length <= 2) {
      hours = Number(digits)
      minutes = 0
    } else if (digits.length === 3) {
      hours = Number(digits.slice(0, 1))
      minutes = Number(digits.slice(1))
    } else {
      hours = Number(digits.slice(0, 2))
      minutes = Number(digits.slice(2, 4))
    }
  }

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
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

function getElapsedHours(dateStr) {
  return Math.round((getElapsedMinutes(dateStr) / 60) * 10) / 10
}

function formatElapsed(minutes) {
  const rounded = Math.max(0, Math.round(minutes))
  const h = Math.floor(rounded / 60)
  const m = rounded % 60
  if (h > 0 && m > 0) return `Hace ${h}h ${m}min`
  if (h > 0) return `Hace ${h}h`
  return `Hace ${m} min`
}

function formatClock(dateStr) {
  if (!dateStr) return '--:--'
  return new Date(dateStr).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function TimeStep({ onConfirm }) {
  const [lastSeenDate, setLastSeenDate] = useState(() => toLocalDateInput(new Date()))
  const [lastSeenTime, setLastSeenTime] = useState(() => toLocalTimeInput(new Date()))
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [showWakeUpModal, setShowWakeUpModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [isIncierto, setIsIncierto] = useState(false)

  useInterval(1000)

  const lastSeen = combineDateTime(lastSeenDate, lastSeenTime)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const shouldEvaluateOgv = elapsedMinutes > IV_WINDOW_MINUTES && elapsedMinutes <= OGV_WINDOW_MINUTES
  const isOutOfWindow = elapsedMinutes > OGV_WINDOW_MINUTES
  const timeTone = isOutOfWindow ? 'red' : shouldEvaluateOgv ? 'orange' : 'blue'
  const timeStatusLabel = isOutOfWindow ? 'Fuera de ventana' : shouldEvaluateOgv ? 'Evaluar OGV' : 'Ventana activa'

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
    } else if (shouldEvaluateOgv) {
      setShowWakeUpModal(true)
    } else {
      handleConfirm(false)
    }
  }

  const toneColors = {
    red: {
      border: 'border-red-200 bg-red-50/70',
      label: 'text-red-800',
      input: 'border-red-300 bg-red-50/40 focus:ring-red-400',
      elapsed: 'bg-red-50 border-red-300',
      elapsedText: 'text-red-700',
      elapsedStatus: 'text-red-600',
      icon: 'text-red-500',
    },
    orange: {
      border: 'border-orange-200 bg-orange-50/70',
      label: 'text-orange-800',
      input: 'border-orange-300 bg-orange-50/40 focus:ring-orange-400',
      elapsed: 'bg-orange-50 border-orange-300',
      elapsedText: 'text-orange-700',
      elapsedStatus: 'text-orange-600',
      icon: 'text-orange-500',
    },
    blue: {
      border: 'border-blue-100 bg-blue-50/60',
      label: 'text-blue-800',
      input: 'border-blue-300 bg-blue-50/40 focus:ring-blue-400',
      elapsed: 'bg-blue-50 border-blue-300',
      elapsedText: 'text-blue-700',
      elapsedStatus: 'text-blue-500',
      icon: 'text-blue-500',
    },
  }[timeTone]

  const stepTitle = isIncierto ? 'Última vez asintomático' : 'Inicio de síntomas'
  const sliderLabel = isIncierto ? 'Última vez visto asintomático' : 'Inicio de síntomas'

  return (
    <StepCard step="2" title={stepTitle} accent={timeTone}>
      <div className={`rounded-lg border px-3 pt-2.5 pb-3 ${toneColors.border}`}>
        {/* Header: label + elapsed + status */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <label htmlFor="last-seen-slider" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${toneColors.label}`}>
            <Clock size={12} /> {sliderLabel}
          </label>
          <div className="flex items-center gap-2">
            {lastSeen && (
              <span className={`text-sm font-bold tabular-nums ${toneColors.elapsedText}`}>
                {formatElapsed(elapsedMinutes)}
              </span>
            )}
            <StatusPill complete={confirmed}>
              {confirmed ? timeStatusLabel : 'Pendiente'}
            </StatusPill>
          </div>
        </div>

        {/* Slider */}
        <div className="relative pb-6">
          <input
            id="last-seen-slider"
            type="range"
            min="0"
            max={MAX_SLIDER_MINUTES}
            step="5"
            value={offsetMinutes ?? Math.round(Math.min(elapsedMinutes, MAX_SLIDER_MINUTES))}
            onChange={(e) => applyOffset(e.target.value)}
            className="h-2 w-full cursor-pointer accent-brand-600"
            aria-label="Minutos desde ultima vez asintomatico"
          />
          <button
            type="button"
            onClick={() => applyOffset(IV_WINDOW_MINUTES)}
            className="absolute top-5 flex -translate-x-1/2 flex-col items-center gap-0.5 text-[11px] font-bold text-orange-700 transition hover:text-orange-800 focus:outline-none"
            style={{ left: IV_WINDOW_PERCENT }}
            aria-label="Marcar 4.5 horas"
          >
            <span className="h-2.5 w-0.5 rounded-full bg-orange-400" />
            <span className="rounded-full border border-orange-200 bg-white px-1.5 py-px shadow-sm text-[10px]">4.5 h</span>
          </button>
        </div>

        {/* Footer: register button + incierto + clock */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!lastSeen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all active:scale-95 ${
                confirmed
                  ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
                  : lastSeen
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {confirmed ? <><CheckCircle2 size={12} /> Registrado</> : 'Registrar horario'}
            </button>
            <button
              type="button"
              aria-pressed={isIncierto}
              onClick={() => { setIsIncierto((v) => !v); setConfirmed(false) }}
              title="Inicio incierto / Wake-Up Stroke"
              className={`flex h-7 items-center gap-1 rounded-full border px-2 text-[11px] font-semibold transition-all active:scale-95 ${
                isIncierto
                  ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Clock size={11} />
              Incierto
            </button>
          </div>
          {lastSeen && (
            <span className="text-xs font-semibold text-slate-400 tabular-nums">
              {formatClock(lastSeen)}
            </span>
          )}
        </div>
      </div>

      {showWakeUpModal && (
        <WakeUpStrokeModal
          elapsedHours={getElapsedHours(lastSeen)}
          onActivate={() => { setShowWakeUpModal(false); handleConfirm(true) }}
          onDismiss={() => { setShowWakeUpModal(false); handleConfirm(false) }}
        />
      )}
    </StepCard>
  )
}
