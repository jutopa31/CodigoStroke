import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Zap, MessageSquare, Eye, Scale, FileText, ShieldAlert } from 'lucide-react'
import StepCard from '../components/StepCard'
import WakeUpStrokeModal from '../components/WakeUpStrokeModal'

const SYMPTOM_OPTIONS = [
  { id: 'weakness', label: 'Debilidad unilateral', sub: 'Brazo, pierna o cara de un lado', Icon: Zap },
  { id: 'speech', label: 'Trastorno del habla', sub: 'Afasia, disartria o disfasia', Icon: MessageSquare },
  { id: 'vision', label: 'Alteración visual', sub: 'Pérdida de visión, diplopía', Icon: Eye },
  { id: 'ataxia', label: 'Ataxia / Inestabilidad', sub: 'Dificultad para caminar', Icon: Scale },
  { id: 'other', label: 'Otro', sub: 'Otros síntomas', Icon: FileText },
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

const WAKE_UP_THRESHOLD_MINUTES = 270 // 4.5 hours
const ANTICOAG_TYPES = [
  { id: 'doac',         label: 'DOAC' },
  { id: 'heparina',     label: 'Heparina' },
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
  if (diff < 0) return 'Tiempo inválido'
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

export default function SymptomsStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [lastSeen, setLastSeen] = useState(() => toLocalInput(new Date()))
  const [showWakeUpModal, setShowWakeUpModal] = useState(false)
  const [anticoagulationActive, setAnticoagulationActive] = useState(null)
  const [anticoagulationType, setAnticoagulationType] = useState('')

  useInterval(1000)

  const elapsed = timeSince(lastSeen)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const isOverWindow = elapsedMinutes > WAKE_UP_THRESHOLD_MINUTES
  const hasSymptom = Object.values(selected).some(Boolean)
  const selectedCount = Object.values(selected).filter(Boolean).length
  const needsAnticoagulationType = anticoagulationActive === true
  const valid = hasSymptom && lastSeen && anticoagulationActive !== null && (!needsAnticoagulationType || anticoagulationType)
  const anticoagulationComplete = anticoagulationActive !== null && (!needsAnticoagulationType || anticoagulationType)
  const missingItems = [
    !hasSymptom && 'seleccionar al menos un sÃ­ntoma',
    !lastSeen && 'indicar Ãºltima vez visto asintomÃ¡tico',
    anticoagulationActive === null && 'responder anticoagulaciÃ³n',
    needsAnticoagulationType && !anticoagulationType && 'elegir tipo de anticoagulante',
  ].filter(Boolean)

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function applyPreset(mins) {
    const d = new Date()
    d.setMinutes(d.getMinutes() - mins)
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
    if (isOverWindow) {
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
      <StepCard step="2" title="Síntomas presentes" accent="orange">
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
          {SYMPTOM_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={Boolean(selected[opt.id])}
              onClick={() => toggle(opt.id)}
              className={`w-full min-h-[66px] flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 transition-all text-left ${
                selected[opt.id]
                  ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-sm ring-2 ring-orange-100'
                  : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                selected[opt.id] ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-orange-400'
              }`}>
                <opt.Icon size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{opt.label}</p>
                <p className="text-[12px] leading-snug text-gray-400 mt-0.5">{opt.sub}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                selected[opt.id] ? 'bg-orange-600 border-orange-600' : 'border-gray-300 bg-white'
              }`}>
                {selected[opt.id] && (
                  <CheckCircle2 size={15} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          ))}
        </div>
      </StepCard>

      {/* Last seen normal */}
      <StepCard step="" title="" accent={isOverWindow ? 'orange' : 'blue'}>
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock size={13} /> Última vez visto asintomático
          </label>
          <StatusPill complete={Boolean(lastSeen)}>
            {lastSeen ? 'Completo' : 'Pendiente'}
          </StatusPill>
        </div>

        {/* Quick time presets */}
        <div className="flex gap-1.5 flex-wrap mb-2.5">
          {TIME_PRESETS.map(({ label, mins }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(mins)}
              className={`px-2.5 py-1 rounded-full border text-xs font-medium bg-white active:scale-95 transition-all ${
                mins >= 360
                  ? 'border-orange-300 text-orange-600 hover:bg-orange-50'
                  : 'border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="datetime-local"
          value={lastSeen}
          max={toLocalInput(new Date())}
          onChange={(e) => setLastSeen(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />

        {elapsed && (
          <div className={`mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 border ${
            isOverWindow
              ? 'bg-orange-50 border-orange-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <Clock size={14} className={isOverWindow ? 'text-orange-500 shrink-0' : 'text-blue-500 shrink-0'} />
            <span className={`text-sm font-semibold ${isOverWindow ? 'text-orange-700' : 'text-blue-700'}`}>
              {elapsed}
            </span>
            <span className={`text-xs ml-auto ${isOverWindow ? 'text-orange-500' : 'text-blue-400'}`}>
              {isOverWindow ? '⚠ ventana superada' : 'ventana terapéutica activa'}
            </span>
          </div>
        )}

        <div className="mt-3 border-t border-gray-100 pt-3 space-y-2.5">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              ¿El paciente recibe anticoagulación?
              </p>
              <StatusPill complete={anticoagulationComplete}>
                {anticoagulationComplete ? 'Completo' : 'Pendiente'}
              </StatusPill>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { label: 'Sí', value: true },
                { label: 'No', value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAnticoagulationAnswer(option.value)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    anticoagulationActive === option.value
                      ? 'border-red-400 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {needsAnticoagulationType && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {ANTICOAG_TYPES.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAnticoagulationType(id)}
                    className={`rounded-lg border py-2.5 text-sm font-medium transition-all active:scale-95 ${
                      anticoagulationType === id
                        ? 'border-red-400 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {anticoagulationType && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2.5 text-red-800">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-snug">
                      Anticoagulación activa — contraindicación relativa para trombólisis. Esperar laboratorio (coagulograma, anti-Xa o TT según droga).
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
            <p>
              Falta: {missingItems.join(', ')}.
            </p>
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
