import { useState } from 'react'
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import StepCard from '../components/StepCard'

const CHECKLIST = [
  {
    id: 'shockroom',
    label: 'Trasladar a Shockroom',
    sub: 'Monitoreo continuo: ECG, SatO₂, PANI',
    emoji: '🚨',
  },
  {
    id: 'ivAccess',
    label: 'Colocar 2 accesos venosos periféricos',
    sub: 'Calibre 18G o mayor. Evitar brazo parético.',
    emoji: '💉',
  },
  {
    id: 'labs',
    label: 'Tomar muestra de laboratorio',
    sub: 'Hemograma, coagulación, glucemia, función renal, electrolitos, grupo y factor',
    emoji: '🩸',
  },
  {
    id: 'ct',
    label: 'Solicitar TC de encéfalo sin contraste',
    sub: 'Excluir hemorragia. Si NIHSS ≥6 agregar angio-TC.',
    emoji: '🧠',
  },
  {
    id: 'ecg',
    label: 'ECG de 12 derivaciones',
    sub: 'Buscar FA, IAM o arritmias',
    emoji: '❤️',
  },
]

export default function InstructionsStep({ nihssScore, onConfirm }) {
  const [checked, setChecked] = useState({})

  const allChecked = CHECKLIST.every((item) => checked[item.id])

  function toggle(id) {
    setChecked((c) => ({ ...c, [id]: !c[id] }))
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="5" title="Acciones inmediatas" accent="green">
        <div className="space-y-2">
          {CHECKLIST.map((item) => {
            const done = !!checked[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                  done
                    ? 'bg-green-50 border-green-400'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/40'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${done ? 'text-green-800 line-through decoration-green-400' : 'text-gray-700'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300" />
                  }
                </div>
              </button>
            )
          })}
        </div>

        {/* NIHSS reminder */}
        {nihssScore >= 6 && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">⚡ NIHSS {nihssScore} — Oclusión de gran vaso</p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Solicitar angio-TC de encéfalo y cuello. Evaluar trombectomía mecánica (ventana 0–24h con imagen favorable).
            </p>
          </div>
        )}
      </StepCard>

      {/* Progress indicator */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Progreso</span>
          <span className="text-xs font-semibold text-gray-600">
            {Object.values(checked).filter(Boolean).length}/{CHECKLIST.length}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-2 bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(checked).filter(Boolean).length / CHECKLIST.length) * 100}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onConfirm({ checklist: checked })}
        disabled={!allChecked}
        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar <ChevronRight size={18} />
      </button>
    </div>
  )
}
