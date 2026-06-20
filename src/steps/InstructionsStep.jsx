import { useState } from 'react'
import { ChevronRight, Siren, Syringe, Droplets, Brain } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction, SectionPrompt, SelectionCheck } from '../components/GuidedControls'

const CHECKLIST = [
  {
    id: 'shockroom',
    label: 'Trasladar a Shockroom',
    sub: 'Iniciar O₂ solo si SatO₂ < 94%',
    Icon: Siren,
  },
  {
    id: 'ivAccess',
    label: 'Colocar 2 accesos venosos periféricos',
    sub: 'Calibre 18G o mayor. Evitar brazo parético.',
    Icon: Syringe,
  },
  {
    id: 'labs',
    label: 'Tomar muestra de laboratorio',
    sub: 'Hemograma, coagulación, glucemia, función renal y electrolitos',
    Icon: Droplets,
  },
  {
    id: 'ct',
    label: 'Solicitar TC de encéfalo sin contraste',
    sub: 'Excluir hemorragia intracraneal',
    Icon: Brain,
  },
]

export default function InstructionsStep({ onConfirm }) {
  const [checked, setChecked] = useState({})

  const allChecked = CHECKLIST.every((item) => checked[item.id])

  function toggle(id) {
    setChecked((c) => ({ ...c, [id]: !c[id] }))
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="4" title="Acciones inmediatas" accent="green">
        <SectionPrompt
          tone="green"
          title="Marca cada accion cuando este hecha"
          helper="Las acciones completas quedan con check y borde verde."
          complete={allChecked}
          status={`${Object.values(checked).filter(Boolean).length}/${CHECKLIST.length}`}
        />
        <div className="space-y-2">
          {CHECKLIST.map((item) => {
            const done = !!checked[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition ${
                  done
                    ? 'bg-emerald-500/15 border-green-500 text-emerald-300 shadow-sm ring-2 ring-emerald-500/30'
                    : 'border-stroke-line bg-stroke-navy hover:border-green-300 hover:bg-emerald-500/15'
                }`}
              >
                <item.Icon size={18} className={`shrink-0 mt-0.5 ${done ? 'text-green-600' : 'text-stroke-textMuted'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${done ? 'text-emerald-300 line-through decoration-green-400' : 'text-stroke-text'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-stroke-textMuted mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
                <SelectionCheck active={done} tone="green" />
              </button>
            )
          })}
        </div>
      </StepCard>

      {/* Progress indicator */}
      <div className="bg-stroke-navy rounded-xl border border-gray-100 shadow-sm px-5 py-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stroke-textMuted uppercase tracking-wider">Progreso</span>
          <span className="text-xs font-semibold text-stroke-textMuted">
            {Object.values(checked).filter(Boolean).length}/{CHECKLIST.length}
          </span>
        </div>
        <div className="h-2 bg-stroke-panel rounded-full overflow-hidden">
          <div
            className="h-2 bg-emerald-500/150 rounded-full transition duration-300"
            style={{ width: `${(Object.values(checked).filter(Boolean).length / CHECKLIST.length) * 100}%` }}
          />
        </div>
      </div>

      <PrimaryAction
        onClick={() => onConfirm({ checklist: checked })}
        valid={allChecked}
        disabledLabel="Completa las acciones inmediatas para continuar"
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>
    </div>
  )
}
