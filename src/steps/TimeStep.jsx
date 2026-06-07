import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock, Moon, Pencil } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { getElapsedMinutes, formatElapsed, getWindowStatus, IV_WINDOW_MINUTES, OGV_WINDOW_MINUTES } from '../lib/calculations'

const MAX_SLIDER_MINUTES = 1440
const IV_WINDOW_PCT = (IV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100
const INCIERTO_WINDOW_MINUTES = 540


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
  const [editingTime, setEditingTime] = useState(false)

  useInterval(1000)

  const lastSeen = combineDateTime(lastSeenDate, lastSeenTime)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const windowStatus = getWindowStatus(elapsedMinutes)
  const shouldEvaluateOgv = windowStatus === 'ogv'
  const isOutOfWindow = windowStatus === 'out'
  const timeStatusLabel = isOutOfWindow ? 'Fuera de ventana' : shouldEvaluateOgv ? 'Evaluar OGV' : 'Ventana IV activa'

  const enVentanaIV = elapsedMinutes < IV_WINDOW_MINUTES
  const enVentanaIncierta = isIncierto && elapsedMinutes < INCIERTO_WINDOW_MINUTES
  const isCandidate = enVentanaIV || enVentanaIncierta

  const candidacyBanner = (() => {
    if (enVentanaIV) return {
      label: 'Candidato a Trombolisis',
      sublabel: 'Dentro de ventana IV (< 4.5 h)',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      leftAccent: 'border-l-2 border-emerald-400',
      text: 'text-emerald-800',
      sub: 'text-emerald-600',
      icon: <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-500 shrink-0 mt-0.5" />,
    }
    if (enVentanaIncierta) return {
      label: 'Candidato a Trombolisis',
      sublabel: 'Ventana extendida wake-up (< 9 h)',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      leftAccent: 'border-l-2 border-emerald-400',
      text: 'text-emerald-800',
      sub: 'text-emerald-600',
      icon: <CheckCircle2 size={14} strokeWidth={2} className="text-emerald-500 shrink-0 mt-0.5" />,
    }
    if (windowStatus === 'ogv') return {
      label: 'Evaluar OGV',
      sublabel: 'Fuera de ventana IV — considerar trombectomía',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      leftAccent: 'border-l-2 border-amber-400',
      text: 'text-amber-800',
      sub: 'text-amber-600',
      icon: <AlertCircle size={14} strokeWidth={2} className="text-amber-500 shrink-0 mt-0.5" />,
    }
    return {
      label: 'Fuera de ventana terapéutica',
      sublabel: '> 24 h desde último visto asintomático',
      bg: 'bg-red-50',
      border: 'border-red-200',
      leftAccent: 'border-l-2 border-red-400',
      text: 'text-red-800',
      sub: 'text-red-500',
      icon: <AlertCircle size={14} strokeWidth={2} className="text-red-500 shrink-0 mt-0.5" />,
    }
  })()

  // Left border accent color tracks window state
  const cardBorderAccent = isCandidate
    ? 'border-l-[3px] border-l-emerald-400'
    : windowStatus === 'ogv'
      ? 'border-l-[3px] border-l-amber-400'
      : 'border-l-[3px] border-l-red-400'

  const dotColor = isCandidate ? '#10b981' : windowStatus === 'ogv' ? '#f59e0b' : '#ef4444'
  const dotPct = Math.min((elapsedMinutes / MAX_SLIDER_MINUTES) * 100, 100)

  const isToday = lastSeenDate === toLocalDateInput(new Date())

  function applyOffset(mins) {
    const rounded = Number(mins)
    const date = new Date()
    date.setMinutes(date.getMinutes() - rounded)
    setOffsetMinutes(rounded)
    setLastSeenDate(toLocalDateInput(date))
    setLastSeenTime(toLocalTimeInput(date))
    setConfirmed(false)
  }

  function handleTimeInput(timeValue) {
    if (!timeValue) return
    const [h, m] = timeValue.split(':').map(Number)
    const now = new Date()
    const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)
    if (candidate > now) candidate.setDate(candidate.getDate() - 1)
    const elapsedMins = (now.getTime() - candidate.getTime()) / (1000 * 60)
    setLastSeenDate(toLocalDateInput(candidate))
    setLastSeenTime(toLocalTimeInput(candidate))
    setOffsetMinutes(Math.round(Math.min(Math.max(0, elapsedMins), MAX_SLIDER_MINUTES)))
    setConfirmed(false)
  }

  function handleDateInput(dateValue) {
    setLastSeenDate(dateValue)
    setOffsetMinutes(0)
    setConfirmed(false)
  }

  function handleConfirm(isWakeUpStroke) {
    setConfirmed(true)
    onConfirm({ lastSeenNormal: lastSeen, isWakeUpStroke })
  }

  function handleSubmit() {
    if (!lastSeen) return
    handleConfirm(isIncierto ? shouldEvaluateOgv : false)
  }

  const stepTitle = isIncierto ? 'Última vez asintomático' : 'Reconocimiento de síntomas'
  const sliderLabel = isIncierto ? 'Última vez visto asintomático' : 'Reconocimiento de síntomas'

  if (isCollapsed && confirmed) {
    return (
      <CollapsedStep title={stepTitle}>
        {formatClock(lastSeen)} · {formatElapsed(elapsedMinutes)} · {timeStatusLabel}
      </CollapsedStep>
    )
  }

  return (
    <StepCard step="2" title={stepTitle} accent={isCandidate ? 'green' : windowStatus === 'ogv' ? 'orange' : 'red'}>
      <div className={`rounded-xl border border-neutral-100 bg-white overflow-hidden ${cardBorderAccent}`}>

        {/* Top row: label + time input + wake toggle */}
        <div className="flex flex-wrap items-center gap-2 px-3 pt-3 pb-2.5 border-b border-neutral-50">
          <label className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 text-neutral-400 shrink-0">
            <Clock size={11} strokeWidth={2} />
            {sliderLabel}
          </label>

          {!isToday && (
            <input
              type="date"
              value={lastSeenDate}
              onChange={(e) => handleDateInput(e.target.value)}
              className="text-[10px] font-medium rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-300 cursor-pointer"
            />
          )}

          <div className="relative flex items-center group">
            <input
              type="time"
              value={lastSeenTime}
              onChange={(e) => handleTimeInput(e.target.value)}
              onFocus={() => setEditingTime(true)}
              onBlur={() => setEditingTime(false)}
              className={`text-sm font-bold tabular-nums rounded-lg border bg-white px-2 py-0.5 text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-300 cursor-pointer transition-all ${
                editingTime ? 'border-neutral-400 ring-1 shadow-sm' : 'border-neutral-200 hover:border-neutral-300'
              }`}
              style={{ colorScheme: 'light' }}
            />
            <Pencil
              size={9}
              strokeWidth={2}
              className={`absolute -right-3 text-neutral-400 transition-opacity ${editingTime ? 'opacity-0' : 'opacity-40 group-hover:opacity-70'}`}
            />
          </div>

          <button
            type="button"
            aria-pressed={isIncierto}
            onClick={() => { setIsIncierto((v) => !v); setConfirmed(false) }}
            className={`ml-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition-all active:scale-[0.98] ${
              isIncierto
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                : 'border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <Moon size={11} strokeWidth={2} />
            <span className="flex flex-col items-start leading-none gap-0.5">
              <span>Incierto / Wake-up</span>
              <span className={`text-[9px] font-normal ${isIncierto ? 'text-indigo-400' : 'text-neutral-300'}`}>Síntomas al despertar</span>
            </span>
          </button>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-2 divide-x divide-neutral-50">

          {/* Left: elapsed time + window bar */}
          <div className="px-3 py-3">
            <div className="font-mono text-[2.4rem] font-black text-neutral-900 leading-none tracking-tight tabular-nums">
              {formatElapsed(elapsedMinutes)}
            </div>
            <div className="text-[9px] text-neutral-400 mt-1 uppercase tracking-wider font-semibold">
              desde síntomas
            </div>

            <div className="mt-4">
              <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
                Ventana terapéutica
              </div>

              {/* Bar + invisible slider overlay */}
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[6px] rounded-full overflow-hidden flex pointer-events-none">
                  <div className="bg-emerald-400 rounded-l-full" style={{ width: `${IV_WINDOW_PCT}%` }} />
                  <div className="flex-1 bg-amber-300 rounded-r-full" />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow pointer-events-none z-10 transition-[left] duration-100"
                  style={{ left: `${dotPct}%`, backgroundColor: dotColor }}
                />
                <input
                  type="range"
                  min="0"
                  max={MAX_SLIDER_MINUTES}
                  step="5"
                  value={offsetMinutes ?? Math.round(Math.min(elapsedMinutes, MAX_SLIDER_MINUTES))}
                  onChange={(e) => applyOffset(e.target.value)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  style={{ touchAction: 'none' }}
                  aria-label="Minutos desde última vez asintomático"
                />
              </div>

              {/* Markers */}
              <div className="relative mt-1" style={{ height: 20 }}>
                <button
                  type="button"
                  onClick={() => applyOffset(IV_WINDOW_MINUTES)}
                  className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 transition hover:opacity-75 focus:outline-none"
                  style={{ left: `${IV_WINDOW_PCT}%` }}
                >
                  <span className="h-1.5 w-px bg-amber-300" />
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1 leading-none py-0.5">4.5h</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyOffset(OGV_WINDOW_MINUTES)}
                  className="absolute flex flex-col items-center gap-0.5 -translate-x-full transition hover:opacity-75 focus:outline-none"
                  style={{ left: '100%' }}
                >
                  <span className="h-1.5 w-px bg-blue-300" />
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1 leading-none py-0.5">24h</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: clinical decision */}
          <div className="px-3 py-3">
            <div className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Decisión clínica
            </div>
            <div className={`rounded-lg border px-2.5 py-2.5 ${candidacyBanner.leftAccent} ${candidacyBanner.bg} ${candidacyBanner.border}`}>
              <div className="flex items-start gap-2">
                {candidacyBanner.icon}
                <div>
                  <p className={`text-sm font-bold leading-tight ${candidacyBanner.text}`}>{candidacyBanner.label}</p>
                  <p className={`text-[10px] leading-snug mt-1 ${candidacyBanner.sub}`}>{candidacyBanner.sublabel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="px-3 pb-3 pt-1 border-t border-neutral-50">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!lastSeen}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] ${
              confirmed
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 cursor-default'
                : lastSeen
                  ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {confirmed
              ? <><CheckCircle2 size={13} strokeWidth={2} /> Tiempo registrado</>
              : <><Clock size={13} strokeWidth={2} /> Registrar tiempo</>
            }
          </button>
        </div>

      </div>
    </StepCard>
  )
}
