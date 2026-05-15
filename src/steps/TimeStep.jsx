import { useState, useEffect } from 'react'
import { CheckCircle2, Clock } from 'lucide-react'
import StepCard from '../components/StepCard'
import WakeUpStrokeModal from '../components/WakeUpStrokeModal'
import { StatusPill } from '../components/GuidedControls'

const TIME_PRESETS = [
  { label: 'Ahora', mins: 0 },
  { label: '15 min', mins: 15 },
  { label: '30 min', mins: 30 },
  { label: '1 hora', mins: 60 },
  { label: '2 horas', mins: 120 },
  { label: '3 horas', mins: 180 },
  { label: '6 horas', mins: 360 },
  { label: '12 horas', mins: 720 },
  { label: '+24 horas', mins: 1500 },
]

const IV_WINDOW_MINUTES = 270
const OGV_WINDOW_MINUTES = 1440

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

function timeSince(dateStr) {
  if (!dateStr) return null
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 0) return 'Tiempo invalido'
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (h > 0) return `Hace ${h}h ${m}min`
  return `Hace ${m} minutos`
}

function getElapsedMinutes(dateStr) {
  if (!dateStr) return 0
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60)
}

function getElapsedHours(dateStr) {
  return Math.round((getElapsedMinutes(dateStr) / 60) * 10) / 10
}

export default function TimeStep({ onConfirm }) {
  const [lastSeenDate, setLastSeenDate] = useState(() => toLocalDateInput(new Date()))
  const [lastSeenTime, setLastSeenTime] = useState(() => toLocalTimeInput(new Date()))
  const [lastSeenTimeText, setLastSeenTimeText] = useState(() => toLocalTimeInput(new Date()))
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [showWakeUpModal, setShowWakeUpModal] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useInterval(1000)

  const lastSeen = combineDateTime(lastSeenDate, lastSeenTime)
  const elapsed = timeSince(lastSeen)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const shouldEvaluateOgv = elapsedMinutes > IV_WINDOW_MINUTES && elapsedMinutes <= OGV_WINDOW_MINUTES
  const isOutOfWindow = elapsedMinutes > OGV_WINDOW_MINUTES
  const timeAccent = isOutOfWindow ? 'red' : shouldEvaluateOgv ? 'orange' : 'blue'
  const timeStatusLabel = isOutOfWindow
    ? 'Fuera de ventana'
    : shouldEvaluateOgv
    ? 'Evaluar OGV'
    : 'Ventana activa'

  function applyPreset(mins) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - mins)
    setSelectedPreset(mins)
    setLastSeenDate(toLocalDateInput(d))
    setLastSeenTime(toLocalTimeInput(d))
    setLastSeenTimeText(toLocalTimeInput(d))
    setConfirmed(false)
  }

  function handleDateChange(value) {
    setSelectedPreset(null)
    setLastSeenDate(value)
    setConfirmed(false)
  }

  function commitTimeText(value) {
    const parsed = parseClockEntry(value)
    if (!parsed) {
      setLastSeenTimeText(lastSeenTime)
      return
    }
    setLastSeenTime(parsed)
    setLastSeenTimeText(parsed)
  }

  function handleTimeTextChange(value) {
    setSelectedPreset(null)
    setLastSeenTimeText(value)
    const parsed = parseClockEntry(value)
    if (parsed) setLastSeenTime(parsed)
    setConfirmed(false)
  }

  function handleClockPickerChange(value) {
    setSelectedPreset(null)
    setLastSeenTime(value)
    setLastSeenTimeText(value)
    setConfirmed(false)
  }

  function handleConfirm(isWakeUpStroke) {
    setConfirmed(true)
    onConfirm({ lastSeenNormal: lastSeen, isWakeUpStroke })
  }

  function handleSubmit() {
    if (!lastSeen) return
    if (shouldEvaluateOgv) {
      setShowWakeUpModal(true)
    } else {
      handleConfirm(false)
    }
  }

  return (
    <StepCard step="1" title="Última vez asintomático" accent={timeAccent}>
      <div className={`mb-3 rounded-lg border px-3 py-2 ${
        isOutOfWindow
          ? 'border-red-200 bg-red-50/70'
          : shouldEvaluateOgv
          ? 'border-orange-200 bg-orange-50/70'
          : 'border-blue-100 bg-blue-50/60'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isOutOfWindow ? 'text-red-800' : shouldEvaluateOgv ? 'text-orange-800' : 'text-blue-800'
          }`}>
            <Clock size={13} /> Ultima vez visto asintomatico
          </label>
          <StatusPill complete={confirmed}>
            {confirmed ? 'Registrado' : 'Pendiente'}
          </StatusPill>
        </div>
        <p className={`mt-1 text-xs ${
          isOutOfWindow ? 'text-red-700' : shouldEvaluateOgv ? 'text-orange-700' : 'text-blue-700'
        }`}>
          Elegi un atajo o ajusta fecha y hora manualmente.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-2.5 sm:grid-cols-9">
        {TIME_PRESETS.map(({ label, mins }) => {
          const active = selectedPreset === mins
          const latePreset = mins >= 360
          return (
            <button
              key={label}
              type="button"
              aria-pressed={active}
              onClick={() => applyPreset(mins)}
              className={`min-h-[38px] rounded-lg border-2 px-2 py-1 text-xs font-bold active:scale-95 transition-all ${
                active
                  ? latePreset
                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm ring-2 ring-orange-100'
                    : 'border-blue-600 bg-blue-600 text-white shadow-sm ring-2 ring-blue-100'
                  : latePreset
                    ? 'border-orange-200 bg-white text-orange-600 hover:border-orange-400 hover:bg-orange-50'
                    : 'border-blue-200 bg-white text-blue-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-1">
                {active && <CheckCircle2 size={12} />}
                {label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_1fr_150px]">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Dia</span>
          <input
            type="date"
            value={lastSeenDate}
            max={toLocalDateInput(new Date())}
            onChange={(e) => handleDateChange(e.target.value)}
            className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
              isOutOfWindow
                ? 'border-red-300 bg-red-50/40 focus:ring-red-400'
                : shouldEvaluateOgv
                ? 'border-orange-300 bg-orange-50/40 focus:ring-orange-400'
                : 'border-blue-300 bg-blue-50/40 focus:ring-blue-400'
            }`}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Hora manual</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="930, 09:30, 15"
            value={lastSeenTimeText}
            onChange={(e) => handleTimeTextChange(e.target.value)}
            onBlur={(e) => commitTimeText(e.target.value)}
            className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
              isOutOfWindow
                ? 'border-red-300 bg-red-50/40 focus:ring-red-400'
                : shouldEvaluateOgv
                ? 'border-orange-300 bg-orange-50/40 focus:ring-orange-400'
                : 'border-blue-300 bg-blue-50/40 focus:ring-blue-400'
            }`}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500">Reloj</span>
          <input
            type="time"
            value={lastSeenTime}
            onChange={(e) => handleClockPickerChange(e.target.value)}
            className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
              isOutOfWindow
                ? 'border-red-300 bg-red-50/40 focus:ring-red-400'
                : shouldEvaluateOgv
                ? 'border-orange-300 bg-orange-50/40 focus:ring-orange-400'
                : 'border-blue-300 bg-blue-50/40 focus:ring-blue-400'
            }`}
          />
        </label>
      </div>

      <p className="mt-1.5 text-xs text-gray-400">
        Atajos de hora: 930 = 09:30, 1530 = 15:30, 15 = 15:00.
      </p>

      {elapsed && (
        <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 border-2 ${
          isOutOfWindow
            ? 'bg-red-50 border-red-300'
            : shouldEvaluateOgv
            ? 'bg-orange-50 border-orange-300'
            : 'bg-blue-50 border-blue-300'
        }`}>
          <Clock size={14} className={
            isOutOfWindow ? 'text-red-500 shrink-0' : shouldEvaluateOgv ? 'text-orange-500 shrink-0' : 'text-blue-500 shrink-0'
          } />
          <span className={`text-sm font-semibold ${
            isOutOfWindow ? 'text-red-700' : shouldEvaluateOgv ? 'text-orange-700' : 'text-blue-700'
          }`}>
            {elapsed}
          </span>
          <span className={`text-xs font-semibold ml-auto ${
            isOutOfWindow ? 'text-red-600' : shouldEvaluateOgv ? 'text-orange-600' : 'text-blue-500'
          }`}>
            {timeStatusLabel}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!lastSeen}
        className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all active:scale-95 ${
          confirmed
            ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700'
            : lastSeen
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {confirmed ? (
          <><CheckCircle2 size={16} /> Horario registrado — edita si necesitas corregir</>
        ) : (
          'Registrar horario'
        )}
      </button>

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
