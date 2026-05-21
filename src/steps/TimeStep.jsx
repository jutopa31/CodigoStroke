import { useState, useEffect } from 'react'
import { CheckCircle2, Clock, Pencil } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { StatusPill } from '../components/GuidedControls'
import { getElapsedMinutes, formatElapsed, getWindowStatus, IV_WINDOW_MINUTES, OGV_WINDOW_MINUTES } from '../lib/calculations'

const MAX_SLIDER_MINUTES = 1440
const IV_WINDOW_PERCENT = `${(IV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`
const OGV_WINDOW_PERCENT = `${(OGV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`
const INCIERTO_WINDOW_MINUTES = 540 // 9 horas


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
  const timeTone = isOutOfWindow ? 'red' : shouldEvaluateOgv ? 'orange' : 'blue'
  const timeStatusLabel = isOutOfWindow ? 'Fuera de ventana' : shouldEvaluateOgv ? 'Evaluar OGV' : 'Ventana IV activa'

  // Etiqueta dinámica de candidatura — cambia en tiempo real según elapsed e isIncierto
  // < 4.5h (ambos modos)              → Candidato a Trombolisis
  // 4.5h–9h + isIncierto              → Candidato a Trombolisis (ventana extendida)
  // ≥ 4.5h clásico | ≥ 9h incierto   → Evaluar OGV
  const candidacyLabel = (() => {
    const enVentanaIV       = elapsedMinutes < IV_WINDOW_MINUTES
    const enVentanaIncierta = isIncierto && elapsedMinutes < INCIERTO_WINDOW_MINUTES
    return (enVentanaIV || enVentanaIncierta) ? 'Candidato a Trombolisis' : 'Evaluar OGV'
  })()

  // Es hoy o fecha anterior
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

  // Input manual de hora: si la hora resultante está en el futuro, asume que fue ayer
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
    if (isIncierto) {
      handleConfirm(shouldEvaluateOgv)
    } else {
      handleConfirm(false)
    }
  }

  const toneStyles = {
    red: {
      container: 'bg-blue-900/8 border-blue-200',
      label: 'text-blue-900',
      elapsed: 'text-blue-900',
      slider: 'accent-blue-900',
      timeInput: 'border-blue-200 focus:ring-blue-300 text-blue-900',
    },
    orange: {
      container: 'bg-amber-50/50 border-amber-100',
      label: 'text-amber-700',
      elapsed: 'text-amber-600',
      slider: 'accent-amber-500',
      timeInput: 'border-amber-200 focus:ring-amber-300 text-amber-700',
    },
    blue: {
      container: 'bg-blue-50/50 border-blue-100',
      label: 'text-blue-700',
      elapsed: 'text-blue-600',
      slider: 'accent-blue-500',
      timeInput: 'border-blue-200 focus:ring-blue-300 text-blue-700',
    },
  }[timeTone]

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
    <StepCard step="2" title={stepTitle} accent={timeTone}>
      <div className={`rounded-xl border p-4 ${toneStyles.container}`}>

        {/* Header: label + input de hora editable + elapsed + pill
            NOTA layout: el pill usa min-w fijo para que su texto variable
            no desplace la hora al cambiar de ventana. */}
        <div className="flex items-center gap-2 mb-3">

          {/* Izquierda: ícono + label + hora — siempre en una sola línea, sin wrap */}
          <label className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap ${toneStyles.label}`}>
            <Clock size={12} strokeWidth={2} />
            {sliderLabel}
          </label>

          {/* Bloque de hora editable — posición fija, no depende del ancho del pill */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Fecha — solo si no es hoy */}
            {!isToday && (
              <input
                type="date"
                value={lastSeenDate}
                onChange={(e) => handleDateInput(e.target.value)}
                className={`text-[10px] font-medium rounded border bg-white/80 px-1.5 py-0.5 focus:outline-none focus:ring-1 cursor-pointer ${toneStyles.timeInput}`}
              />
            )}

            {/* Hora — siempre visible, editable */}
            <div className="relative flex items-center group">
              <input
                type="time"
                value={lastSeenTime}
                onChange={(e) => handleTimeInput(e.target.value)}
                onFocus={() => setEditingTime(true)}
                onBlur={() => setEditingTime(false)}
                className={`text-sm font-bold tabular-nums rounded-lg border bg-white/80 px-2 py-0.5 focus:outline-none focus:ring-1 cursor-pointer transition-all ${toneStyles.timeInput} ${
                  editingTime ? 'ring-1 shadow-sm' : 'hover:border-opacity-70'
                }`}
                style={{ colorScheme: 'light' }}
              />
              <Pencil
                size={9}
                strokeWidth={2}
                className={`absolute -right-3 transition-opacity ${toneStyles.label} ${editingTime ? 'opacity-0' : 'opacity-40 group-hover:opacity-70'}`}
              />
            </div>
          </div>

          {/* Separador flexible — empuja el bloque derecho al extremo */}
          <div className="flex-1" />

          {/* Derecha: tiempo transcurrido + pill con ancho mínimo fijo
              min-w-[9rem] ≥ ancho de "Candidato a Trombolisis" para evitar
              que el pill empuje la hora al cambiar de texto */}
          <div className="flex items-center gap-2 shrink-0">
            {lastSeen && (
              <span className={`text-sm font-bold tabular-nums ${toneStyles.elapsed}`}>
                {formatElapsed(elapsedMinutes)}
              </span>
            )}
            <div className="min-w-[9rem] flex justify-end">
              <StatusPill complete={confirmed}>
                {confirmed ? timeStatusLabel : candidacyLabel}
              </StatusPill>
            </div>
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

          {/* Marcadores */}
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
            <span className="h-2 w-0.5 rounded-full bg-blue-700" />
            <span className="text-[10px] font-semibold text-blue-800 bg-white px-1.5 py-0.5 rounded-md border border-blue-200">24h</span>
          </button>
        </div>

        {/* Footer: botones de acción */}
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

      </div>
    </StepCard>
  )
}
