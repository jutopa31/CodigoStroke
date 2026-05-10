import { useState, useEffect } from 'react'
import { ChevronRight, Clock } from 'lucide-react'
import StepCard from '../components/StepCard'

const SYMPTOM_OPTIONS = [
  { id: 'weakness', label: 'Debilidad unilateral', sub: 'Brazo, pierna o cara de un lado', emoji: '💪' },
  { id: 'speech', label: 'Trastorno del habla', sub: 'Afasia, disartria o disfasia', emoji: '🗣️' },
  { id: 'vision', label: 'Alteración visual', sub: 'Pérdida de visión, diplopía', emoji: '👁️' },
  { id: 'ataxia', label: 'Ataxia / Inestabilidad', sub: 'Dificultad para caminar', emoji: '⚖️' },
  { id: 'other', label: 'Otro', sub: 'Especificar', emoji: '📝' },
]

function useInterval(ms) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
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

export default function SymptomsStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [otherText, setOtherText] = useState('')
  const [lastSeen, setLastSeen] = useState('')

  useInterval(1000)

  const elapsed = timeSince(lastSeen)
  const hasSymptom = Object.values(selected).some(Boolean)
  const valid = hasSymptom && lastSeen && (!selected.other || otherText.trim())

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function handleSubmit() {
    if (!valid) return
    onConfirm({
      symptoms: { ...selected, otherText },
      lastSeenNormal: lastSeen,
    })
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="2" title="Síntomas presentes" accent="orange">
        <div className="space-y-2">
          {SYMPTOM_OPTIONS.map((opt) => (
            <div key={opt.id}>
              <button
                onClick={() => toggle(opt.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all text-left ${
                  selected[opt.id]
                    ? 'bg-orange-50 border-orange-400 text-orange-800'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                <span className="text-xl shrink-0">{opt.emoji}</span>
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
              {opt.id === 'other' && selected.other && (
                <input
                  type="text"
                  placeholder="Describir síntoma..."
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  className="mt-2 w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-300"
                />
              )}
            </div>
          ))}
        </div>
      </StepCard>

      {/* Last seen normal */}
      <StepCard step="" title="" accent="blue">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <Clock size={13} /> Última vez visto asintomático
        </label>
        <input
          type="datetime-local"
          value={lastSeen}
          max={new Date().toISOString().slice(0, 16)}
          onChange={(e) => setLastSeen(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        {elapsed && (
          <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
            <Clock size={14} className="text-blue-500 shrink-0" />
            <span className="text-sm font-semibold text-blue-700">{elapsed}</span>
            <span className="text-xs text-blue-400 ml-auto">ventana terapéutica activa</span>
          </div>
        )}
      </StepCard>

      <button
        onClick={handleSubmit}
        disabled={!valid}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ChevronRight size={18} />
      </button>
    </div>
  )
}
