import { useState, useEffect } from 'react'
import { ChevronRight, Clock, Zap, MessageSquare, Eye, Scale, FileText, ShieldAlert } from 'lucide-react'
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
const ANTICOAGULATION_OPTIONS = [
  { id: 'acod_dabigatran', label: 'Dabigatrán', group: 'ACOD / NOAC' },
  { id: 'acod_rivaroxaban', label: 'Rivaroxabán', group: 'ACOD / NOAC' },
  { id: 'acod_apixaban', label: 'Apixabán', group: 'ACOD / NOAC' },
  { id: 'acod_edoxaban', label: 'Edoxabán', group: 'ACOD / NOAC' },
  { id: 'avk', label: 'Warfarina / Acenocumarol', group: 'AVK' },
  { id: 'hbpm', label: 'HBPM', group: 'Heparinas' },
  { id: 'hnf', label: 'HNF', group: 'Heparinas' },
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
  const needsAnticoagulationType = anticoagulationActive === true
  const isAcod = anticoagulationType.startsWith('acod_')
  const valid = hasSymptom && lastSeen && anticoagulationActive !== null && (!needsAnticoagulationType || anticoagulationType)

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
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="2" title="Síntomas presentes" accent="orange">
        <div className="space-y-2">
          {SYMPTOM_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                selected[opt.id]
                  ? 'bg-orange-50 border-orange-400 text-orange-800'
                  : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <opt.Icon size={18} className="shrink-0 text-orange-400" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                selected[opt.id] ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
              }`}>
                {selected[opt.id] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </StepCard>

      {/* Last seen normal */}
      <StepCard step="" title="" accent={isOverWindow ? 'orange' : 'blue'}>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Clock size={13} /> Última vez visto asintomático
        </label>

        {/* Quick time presets */}
        <div className="flex gap-2 flex-wrap mb-3">
          {TIME_PRESETS.map(({ label, mins }) => (
            <button
              key={label}
              type="button"
              onClick={() => applyPreset(mins)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium bg-white active:scale-95 transition-all ${
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
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />

        {elapsed && (
          <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 border ${
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

        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              ¿El paciente recibe anticoagulación?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Sí', value: true },
                { label: 'No', value: false },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleAnticoagulationAnswer(option.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
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
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo de anticoagulación
              </p>
              <div className="space-y-3">
                {['ACOD / NOAC', 'AVK', 'Heparinas'].map((group) => (
                  <div key={group}>
                    <p className="text-xs font-semibold text-gray-600 mb-2">{group}</p>
                    <div className="grid gap-2">
                      {ANTICOAGULATION_OPTIONS.filter((option) => option.group === group).map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAnticoagulationType(option.id)}
                          className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                            anticoagulationType === option.id
                              ? 'border-red-400 bg-red-50 text-red-700'
                              : 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/40'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {isAcod && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">
                      Los ACOD pueden contraindicar la trombólisis. Verificar última dosis y función renal.
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
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ChevronRight size={18} />
      </button>

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
