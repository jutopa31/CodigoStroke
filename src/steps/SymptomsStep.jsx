import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Zap, MessageSquare, Eye, Scale, FileText, ShieldAlert } from 'lucide-react'
import StepCard from '../components/StepCard'
import WakeUpStrokeModal from '../components/WakeUpStrokeModal'

const SYMPTOM_OPTIONS = [
  { id: 'weakness', label: 'Debilidad unilateral', sub: 'Brazo, pierna o cara de un lado', Icon: Zap },
  { id: 'speech', label: 'Trastorno del habla', sub: 'Afasia, disartria o disfasia', Icon: MessageSquare },
  { id: 'vision', label: 'Alteracion visual', sub: 'Perdida de vision, diplopia', Icon: Eye },
  { id: 'ataxia', label: 'Ataxia / Inestabilidad', sub: 'Dificultad para caminar', Icon: Scale },
  { id: 'other', label: 'Otro', sub: 'Otros sintomas', Icon: FileText },
]

const TIME_PRESETS = [
  { label: 'Ahora', mins: 0 },
  { label: '15 min', mins: 15 },
  { label: '30 min', mins: 30 },
  { label: '1 hora', mins: 60 },
  { label: '2 horas', mins: 120 },
  { label: '3 horas', mins: 180 },
  { label: '6 horas', mins: 360 },
  { label: '12 horas', mins: 720 },
]

const IV_WINDOW_MINUTES = 270 // 4.5 hours
const OGV_WINDOW_MINUTES = 1440 // 24 hours
const ANTICOAG_TYPES = [
  { id: 'doac', label: 'DOAC' },
  { id: 'heparina', label: 'Heparina' },
  { id: 'acenocumarol', label: 'Acenocumarol' },
]

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
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
  return Math.round(getElapsedMinutes(dateStr) / 60 * 10) / 10
}

function StatusPill({ complete, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-bold leading-none ${
      complete
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-amber-200 bg-amber-50 text-amber-700'
    }`}>
      {complete ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
      {children}
    </span>
  )
}

function SelectionCheck({ active, tone = 'blue' }) {
  const activeClass = tone === 'red'
    ? 'bg-red-600 border-red-600'
    : tone === 'orange'
    ? 'bg-orange-600 border-orange-600'
    : 'bg-blue-600 border-blue-600'

  return (
    <span className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
      active ? activeClass : 'border-gray-300 bg-white'
    }`}>
      {active && <CheckCircle2 size={15} className="text-white" strokeWidth={3} />}
    </span>
  )
}

export default function SymptomsStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [lastSeen, setLastSeen] = useState(() => toLocalInput(new Date()))
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [showWakeUpModal, setShowWakeUpModal] = useState(false)
  const [anticoagulationActive, setAnticoagulationActive] = useState(null)
  const [anticoagulationType, setAnticoagulationType] = useState('')

  useInterval(1000)

  const elapsed = timeSince(lastSeen)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const shouldEvaluateOgv = elapsedMinutes > IV_WINDOW_MINUTES && elapsedMinutes <= OGV_WINDOW_MINUTES
  const isOutOfWindow = elapsedMinutes > OGV_WINDOW_MINUTES
  const timeAccent = isOutOfWindow ? 'red' : shouldEvaluateOgv ? 'orange' : 'blue'
  const timeStatusLabel = isOutOfWindow
    ? 'Fuera de ventana'
    : shouldEvaluateOgv
    ? 'Evaluar OGV'
    : 'ventana activa'
  const hasSymptom = Object.values(selected).some(Boolean)
  const selectedCount = Object.values(selected).filter(Boolean).length
  const needsAnticoagulationType = anticoagulationActive === true
  const anticoagulationComplete = anticoagulationActive !== null && (!needsAnticoagulationType || anticoagulationType)
  const valid = hasSymptom && lastSeen && anticoagulationComplete
  const missingItems = [
    !hasSymptom && 'seleccionar al menos un sintoma',
    !lastSeen && 'indicar ultima vez visto asintomatico',
    anticoagulationActive === null && 'responder anticoagulacion',
    needsAnticoagulationType && !anticoagulationType && 'elegir tipo de anticoagulante',
  ].filter(Boolean)

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function applyPreset(mins) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - mins)
    setSelectedPreset(mins)
    setLastSeen(toLocalInput(d))
  }

  function handleAnticoagulationAnswer(active) {
    setAnticoagulationActive(active)
    if (!active) {
      setAnticoagulationType('')
    }
  }

  function handleSubmit() {
    if (!valid) return
    if (shouldEvaluateOgv) {
      setShowWakeUpModal(true)
    } else {
      confirm(false)
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && valid && !showWakeUpModal) handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [valid, showWakeUpModal])

  function confirm(isWakeUpStroke) {
    onConfirm({
      symptoms: { ...selected },
      lastSeenNormal: lastSeen,
      isWakeUpStroke,
      anticoagulation: {
        active: anticoagulationActive,
        type: anticoagulationActive ? anticoagulationType : '',
      },
    })
  }

  return (
    <div className="px-4 pb-4 space-y-2.5">
      <StepCard step="2" title="Sintomas presentes" accent="orange">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2">
          <div>
            <p className="text-sm font-bold text-orange-900">Selecciona uno o mas sintomas</p>
            <p className="text-xs text-orange-700">Toca una tarjeta para marcarla como presente.</p>
          </div>
          <StatusPill complete={hasSymptom}>
            {hasSymptom ? `${selectedCount} seleccionado${selectedCount === 1 ? '' : 's'}` : 'Pendiente'}
          </StatusPill>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {SYMPTOM_OPTIONS.map((opt) => {
            const active = Boolean(selected[opt.id])
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(opt.id)}
                className={`w-full min-h-[66px] flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                  active
                    ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-sm ring-2 ring-orange-100'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-orange-400'
                }`}>
                  <opt.Icon size={17} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{opt.label}</p>
                  <p className="text-[12px] leading-snug text-gray-400 mt-0.5">{opt.sub}</p>
                </div>
                <SelectionCheck active={active} tone="orange" />
              </button>
            )
          })}
        </div>
      </StepCard>

      <StepCard step="" title="" accent={timeAccent}>
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
            <StatusPill complete={Boolean(lastSeen)}>
              {lastSeen ? 'Completo' : 'Pendiente'}
            </StatusPill>
          </div>
          <p className={`mt-1 text-xs ${
            isOutOfWindow ? 'text-red-700' : shouldEvaluateOgv ? 'text-orange-700' : 'text-blue-700'
          }`}>
            Elegi un atajo o ajusta fecha y hora manualmente.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2.5 sm:grid-cols-8">
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

        <input
          type="datetime-local"
          value={lastSeen}
          max={toLocalInput(new Date())}
          onChange={(e) => {
            setSelectedPreset(null)
            setLastSeen(e.target.value)
          }}
          className={`w-full rounded-lg border-2 px-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:border-transparent ${
            isOutOfWindow
              ? 'border-red-300 bg-red-50/40 focus:ring-red-400'
              : shouldEvaluateOgv
              ? 'border-orange-300 bg-orange-50/40 focus:ring-orange-400'
              : 'border-blue-300 bg-blue-50/40 focus:ring-blue-400'
          }`}
        />

        {elapsed && (
          <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 border-2 ${
            isOutOfWindow
              ? 'bg-red-50 border-red-300'
              : shouldEvaluateOgv
              ? 'bg-orange-50 border-orange-300'
              : 'bg-blue-50 border-blue-300'
          }`}>
            <Clock size={14} className={
              isOutOfWindow
                ? 'text-red-500 shrink-0'
                : shouldEvaluateOgv
                ? 'text-orange-500 shrink-0'
                : 'text-blue-500 shrink-0'
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

        <div className="mt-3 border-t border-gray-100 pt-3 space-y-2.5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                El paciente recibe anticoagulacion?
              </p>
              <StatusPill complete={anticoagulationComplete}>
                {anticoagulationComplete ? 'Completo' : 'Pendiente'}
              </StatusPill>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: 'Si', value: true },
                { label: 'No', value: false },
              ].map((option) => {
                const active = anticoagulationActive === option.value
                return (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={active}
                    onClick={() => handleAnticoagulationAnswer(option.value)}
                    className={`flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-bold transition-all ${
                      active
                        ? 'border-red-500 bg-red-50 text-red-800 shadow-sm ring-2 ring-red-100'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                    }`}
                  >
                    <SelectionCheck active={active} tone="red" />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          {needsAnticoagulationType && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {ANTICOAG_TYPES.map(({ id, label }) => {
                  const active = anticoagulationType === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setAnticoagulationType(id)}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 py-3 text-sm font-bold transition-all active:scale-95 ${
                        active
                          ? 'border-red-500 bg-red-50 text-red-800 shadow-sm ring-2 ring-red-100'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                      }`}
                    >
                      <SelectionCheck active={active} tone="red" />
                      {label}
                    </button>
                  )
                })}
              </div>

              {anticoagulationType && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2.5 text-red-800">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-snug">
                      Anticoagulacion activa: contraindicacion relativa para trombolisis. Esperar laboratorio segun droga.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </StepCard>

      <button
        onClick={handleSubmit}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-3.5 rounded-lg transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:opacity-100 disabled:cursor-not-allowed"
      >
        {valid ? 'Continuar' : 'Completa lo pendiente para continuar'} <ChevronRight size={18} />
      </button>

      {!valid && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>Falta: {missingItems.join(', ')}.</p>
          </div>
        </div>
      )}

      {showWakeUpModal && (
        <WakeUpStrokeModal
          elapsedHours={getElapsedHours(lastSeen)}
          onActivate={() => { setShowWakeUpModal(false); confirm(true) }}
          onDismiss={() => { setShowWakeUpModal(false); confirm(false) }}
        />
      )}
    </div>
  )
}
