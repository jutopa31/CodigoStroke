import { useState, useEffect, useRef } from 'react'
import {
  AlertCircle,
  Calculator,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  Scale,
  ShieldAlert,
  X,
  Zap,
} from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'
import WakeUpStrokeModal from '../components/WakeUpStrokeModal'
import { SelectionCheck, StatusPill } from '../components/GuidedControls'
import { getNihssSeverity } from '../content/nihss'

const SYMPTOM_OPTIONS = [
  { id: 'weakness', label: 'Debilidad unilateral', sub: 'Brazo, pierna o cara de un lado', Icon: Zap },
  { id: 'speech', label: 'Trastorno del habla', sub: 'Afasia, disartria o disfasia', Icon: MessageSquare },
  { id: 'vision', label: 'Alteracion visual', sub: 'Perdida de vision, diplopia', Icon: Eye },
  { id: 'ataxia', label: 'Ataxia / Inestabilidad', sub: 'Dificultad para caminar', Icon: Scale },
  { id: 'other', label: 'Otro', sub: 'Otros sintomas', Icon: FileText },
]

const IV_WINDOW_MINUTES = 270
const OGV_WINDOW_MINUTES = 1440
const MAX_SLIDER_MINUTES = 1440
const IV_WINDOW_PERCENT = `${(IV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`
const OGV_WINDOW_PERCENT = `${(OGV_WINDOW_MINUTES / MAX_SLIDER_MINUTES) * 100}%`

const ANTICOAG_TYPES = [
  { id: 'doac', label: 'DOAC' },
  { id: 'heparina', label: 'Heparina' },
  { id: 'acenocumarol', label: 'Acenocumarol' },
  { id: 'otro', label: 'Otro / no sabe' },
]

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

function getElapsedHours(dateStr) {
  return Math.round(getElapsedMinutes(dateStr) / 60 * 10) / 10
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

function getTimeTone(minutes) {
  if (minutes > OGV_WINDOW_MINUTES) return 'red'
  if (minutes > IV_WINDOW_MINUTES) return 'orange'
  return 'blue'
}

function AnticoagulationModal({ onClose, onConfirm }) {
  const [active, setActive] = useState(null)
  const [type, setType] = useState('')
  const needsType = active === true
  const canContinue = active === false || (active === true && type)

  function submit() {
    if (!canContinue) return
    onConfirm({
      active,
      type: active ? type : '',
      thrombolysisBlocked: active === true,
    })
  }

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Enter' && canContinue) submit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, onClose, submit])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-slide-up">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">Alerta antes de avanzar</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Anticoagulacion</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm font-semibold text-slate-800">El paciente recibe anticoagulacion?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              { label: 'No', value: false },
              { label: 'Si', value: true },
            ].map((option) => {
              const selected = active === option.value
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setActive(option.value)
                    if (!option.value) setType('')
                  }}
                  className={`flex min-h-[48px] items-center justify-center gap-2 rounded-lg border-2 text-sm font-bold transition-all active:scale-[0.99] ${
                    selected
                      ? option.value
                        ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-100'
                        : 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <SelectionCheck active={selected} tone={option.value ? 'red' : 'green'} />
                  {option.label}
                </button>
              )
            })}
          </div>

          {needsType && (
            <div className="mt-4 animate-fade-in">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cual usa?</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ANTICOAG_TYPES.map((option) => {
                  const selected = type === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setType(option.id)}
                      className={`rounded-lg border-2 px-3 py-3 text-sm font-bold transition-all active:scale-[0.99] ${
                        selected
                          ? 'border-red-500 bg-red-50 text-red-800 ring-2 ring-red-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-3 text-red-800">
                <div className="flex gap-2">
                  <ShieldAlert size={17} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium leading-snug">
                    Anticoagulacion activa: contraindica o condiciona trombolisis IV. Verificar droga, ultima dosis y laboratorio.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.99]"
          >
            Revisar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canContinue}
            className="flex-[1.6] rounded-lg bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-500"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

function NihssCompactPanel({ score, onScoreChange, hasDisabling, onDisablingChange, inputRef, onReadyEnter }) {
  const [showModal, setShowModal] = useState(false)
  const disablingNoRef = useRef(null)
  const num = parseInt(score, 10)
  const valid = score !== '' && Number.isInteger(num) && num >= 0 && num <= 42
  const severity = valid ? getNihssSeverity(num) : null
  const needsDisabling = valid && num < 5

  function handleScoreChange(value) {
    const digits = value.replace(/\D/g, '').slice(0, 2)
    if (digits === '') {
      onScoreChange('')
      onDisablingChange(null)
      return
    }
    const next = Number(digits)
    if (next <= 42) {
      onScoreChange(String(next))
      if (next >= 5) onDisablingChange(null)
    }
  }

  function handleScoreKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (needsDisabling) {
      disablingNoRef.current?.focus()
      return
    }
    if (valid) onReadyEnter?.()
  }

  return (
    <div className="rounded-lg border border-orange-100 bg-white px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor="nihss-score" className="text-xs font-bold uppercase tracking-wider text-orange-800">
          NIHSS
        </label>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100"
          aria-label="Abrir calculadora NIHSS"
          title="Calculadora NIHSS"
        >
          <Calculator size={15} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id="nihss-score"
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="0-42"
          value={score}
          onChange={(event) => handleScoreChange(event.target.value)}
          onKeyDown={handleScoreKeyDown}
          className={`h-12 w-24 rounded-lg border-2 bg-slate-50 text-center text-xl font-bold outline-none transition ${
            valid
              ? 'border-orange-400 text-orange-900 ring-2 ring-orange-100 focus:border-orange-500'
              : 'border-slate-200 text-slate-900 focus:border-orange-400 focus:ring-2 focus:ring-orange-100'
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-bold ${severity ? severity.color : 'text-slate-700'}`}>
            {severity ? severity.label : 'Pendiente'}
          </p>
        </div>
      </div>

      {needsDisabling && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: 'No discap.', value: false },
            { label: 'Discap.', value: true },
          ].map((option) => {
            const active = hasDisabling === option.value
            return (
              <button
                key={option.label}
                ref={option.value === false ? disablingNoRef : undefined}
                type="button"
                aria-pressed={active}
                onClick={() => onDisablingChange(option.value)}
                className={`rounded-lg border px-2 py-2 text-xs font-bold transition ${
                  active
                    ? option.value
                      ? 'border-orange-400 bg-orange-50 text-orange-800'
                      : 'border-slate-300 bg-slate-50 text-slate-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}

      {showModal && (
        <NihssModal
          onLoad={(result) => {
            handleScoreChange(String(result))
            setShowModal(false)
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default function SymptomsStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [lastSeenDate, setLastSeenDate] = useState(() => toLocalDateInput(new Date()))
  const [lastSeenTime, setLastSeenTime] = useState(() => toLocalTimeInput(new Date()))
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [isIncierto, setIsIncierto] = useState(false)
  const [showWakeUpModal, setShowWakeUpModal] = useState(false)
  const [pendingAnticoagulation, setPendingAnticoagulation] = useState(null)
  const [showAnticoagulationModal, setShowAnticoagulationModal] = useState(false)
  const [nihssScore, setNihssScore] = useState('')
  const [hasDisablingSymptoms, setHasDisablingSymptoms] = useState(null)
  const nihssInputRef = useRef(null)
  const continueButtonRef = useRef(null)

  useInterval(1000)

  const lastSeen = combineDateTime(lastSeenDate, lastSeenTime)
  const elapsedMinutes = getElapsedMinutes(lastSeen)
  const shouldEvaluateOgv = elapsedMinutes > IV_WINDOW_MINUTES && elapsedMinutes <= OGV_WINDOW_MINUTES
  const isOutOfWindow = elapsedMinutes > OGV_WINDOW_MINUTES
  const timeTone = getTimeTone(elapsedMinutes)
  const timeStatusLabel = isOutOfWindow ? 'Fuera de ventana' : shouldEvaluateOgv ? 'Fuera ventana IV - Evaluar OGV' : 'Ventana IV activa'
  const hasSymptom = Object.values(selected).some(Boolean)
  const selectedCount = Object.values(selected).filter(Boolean).length
  const nihssNum = parseInt(nihssScore, 10)
  const nihssValid = nihssScore !== '' && Number.isInteger(nihssNum) && nihssNum >= 0 && nihssNum <= 42
  const disablingComplete = !nihssValid || nihssNum >= 5 || hasDisablingSymptoms !== null
  const valid = hasSymptom && lastSeen && nihssValid && disablingComplete
  const missingItems = [
    !hasSymptom && 'seleccionar al menos un sintoma',
    !lastSeen && 'indicar ultima vez visto asintomatico',
    !nihssValid && 'registrar NIHSS',
    nihssValid && nihssNum < 5 && hasDisablingSymptoms === null && 'definir si el deficit es discapacitante',
  ].filter(Boolean)

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
    requestAnimationFrame(() => nihssInputRef.current?.focus())
  }

  function applyOffset(mins) {
    const rounded = Number(mins)
    const date = new Date()
    date.setMinutes(date.getMinutes() - rounded)
    setOffsetMinutes(rounded)
    setIsIncierto(false)
    setLastSeenDate(toLocalDateInput(date))
    setLastSeenTime(toLocalTimeInput(date))
  }

  function handleInciertoClick() {
    setIsIncierto((current) => !current)
  }

  function handleSubmit() {
    if (!valid) return
    setShowAnticoagulationModal(true)
  }

  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea') return
      if (e.key === 'Enter' && valid && !showWakeUpModal && !showAnticoagulationModal) handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [valid, showWakeUpModal, showAnticoagulationModal, handleSubmit])

  function confirm(isWakeUpStroke, anticoagulation) {
    onConfirm({
      symptoms: { ...selected },
      lastSeenNormal: lastSeen,
      isWakeUpStroke,
      anticoagulation,
      nihss: {
        nihssScore: nihssNum,
        hasDisablingSymptoms: nihssNum < 5 ? hasDisablingSymptoms : null,
      },
    })
  }

  function continueAfterAnticoagulation(anticoagulation) {
    setShowAnticoagulationModal(false)
    setPendingAnticoagulation(anticoagulation)

    if (isIncierto) {
      if (elapsedMinutes < IV_WINDOW_MINUTES) {
        confirm(false, anticoagulation)
      } else if (elapsedMinutes <= OGV_WINDOW_MINUTES) {
        confirm(true, anticoagulation)
      } else {
        confirm(false, anticoagulation)
      }
    } else if (shouldEvaluateOgv) {
      setShowWakeUpModal(true)
    } else {
      confirm(false, anticoagulation)
    }
  }

  return (
    <div className="px-4 pb-4 space-y-2.5">
      <StepCard step="2" title="Sintomas /// NIHSS" accent="orange">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2">
          <p className="text-sm font-bold text-orange-900">Selecciona sintomas y carga NIHSS</p>
          <StatusPill complete={hasSymptom}>
            {hasSymptom ? `${selectedCount} seleccionado${selectedCount === 1 ? '' : 's'}` : 'Pendiente'}
          </StatusPill>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="grid grid-cols-5 gap-2">
            {SYMPTOM_OPTIONS.map((opt) => {
              const active = Boolean(selected[opt.id])
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(opt.id)}
                  title={`${opt.label}: ${opt.sub}`}
                  aria-label={`${opt.label}: ${opt.sub}`}
                  className={`group relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 transition-all ${
                    active
                      ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm ring-2 ring-orange-100'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:bg-orange-50/40'
                  }`}
                >
                  <opt.Icon size={20} />
                  <span className="max-w-full truncate text-[10px] font-bold leading-none">
                    {opt.label.split(' ')[0]}
                  </span>
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-52 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-snug text-slate-700 shadow-xl group-hover:block group-focus-visible:block">
                    <strong className="block text-slate-900">{opt.label}</strong>
                    {opt.sub}
                  </span>
                </button>
              )
            })}
          </div>

          <NihssCompactPanel
            score={nihssScore}
            onScoreChange={setNihssScore}
            hasDisabling={hasDisablingSymptoms}
            onDisablingChange={(value) => {
              setHasDisablingSymptoms(value)
              requestAnimationFrame(() => continueButtonRef.current?.focus())
            }}
            inputRef={nihssInputRef}
            onReadyEnter={handleSubmit}
          />
        </div>
      </StepCard>

      <StepCard step="" title="" accent={timeTone} rail railStep="2" railLabel="ultima vez visto asintomatico">
        <div>
          <section className={`rounded-lg border px-3 py-3 ${
            timeTone === 'red'
              ? 'border-red-200 bg-red-50/70'
              : timeTone === 'orange'
              ? 'border-orange-200 bg-orange-50/70'
              : 'border-blue-100 bg-blue-50/60'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="last-seen-slider" className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                timeTone === 'red' ? 'text-red-800' : timeTone === 'orange' ? 'text-orange-800' : 'text-blue-800'
              }`}>
                <Clock size={13} /> Ultima vez asintomatico
              </label>
              <StatusPill complete={Boolean(lastSeen)}>{timeStatusLabel}</StatusPill>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_132px] md:items-center">
              <div className="relative pb-7">
                <input
                  id="last-seen-slider"
                  type="range"
                  min="0"
                  max={MAX_SLIDER_MINUTES}
                  step="5"
                  value={offsetMinutes}
                  onChange={(event) => applyOffset(event.target.value)}
                  className="h-2 w-full cursor-pointer accent-brand-600"
                  aria-label="Minutos desde ultima vez asintomatico"
                />
                <button
                  type="button"
                  onClick={() => applyOffset(IV_WINDOW_MINUTES)}
                  className="absolute top-5 flex -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-bold text-orange-700 transition hover:text-orange-800 focus:outline-none"
                  style={{ left: IV_WINDOW_PERCENT }}
                  aria-label="Marcar 4.5 horas"
                  title="Marcar 4.5 horas"
                >
                  <span className="h-3 w-0.5 rounded-full bg-orange-500" />
                  <span className="rounded-full border border-orange-200 bg-white px-2 py-0.5 shadow-sm">4.5 h</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyOffset(OGV_WINDOW_MINUTES)}
                  className="absolute top-5 flex -translate-x-full flex-col items-end gap-1 text-[11px] font-bold text-red-700 transition hover:text-red-800 focus:outline-none"
                  style={{ left: OGV_WINDOW_PERCENT }}
                  aria-label="Marcar 24 horas"
                  title="Marcar 24 horas"
                >
                  <span className="h-3 w-0.5 rounded-full bg-red-500" />
                  <span className="rounded-full border border-red-200 bg-white px-2 py-0.5 shadow-sm">24 h</span>
                </button>
              </div>
              <div className="rounded-lg border border-white/70 bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-lg font-bold leading-tight text-slate-900">{formatElapsed(elapsedMinutes)}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{formatClock(lastSeen)}</p>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                aria-pressed={isIncierto}
                aria-label="Inicio incierto"
                title="Inicio incierto"
                onClick={handleInciertoClick}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                  isIncierto
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock size={15} />
              </button>
            </div>
          </section>
        </div>
      </StepCard>

      <button
        ref={continueButtonRef}
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

      {showAnticoagulationModal && (
        <AnticoagulationModal
          onClose={() => setShowAnticoagulationModal(false)}
          onConfirm={continueAfterAnticoagulation}
        />
      )}

      {showWakeUpModal && (
        <WakeUpStrokeModal
          elapsedHours={getElapsedHours(lastSeen)}
          onActivate={() => { setShowWakeUpModal(false); confirm(true, pendingAnticoagulation) }}
          onDismiss={() => { setShowWakeUpModal(false); confirm(false, pendingAnticoagulation) }}
        />
      )}
    </div>
  )
}
