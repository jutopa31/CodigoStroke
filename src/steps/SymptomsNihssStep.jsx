import { useState, useEffect } from 'react'
import { ChevronRight, Calculator, ChevronDown, ChevronUp, Zap, MessageSquare, Eye, Scale, FileText } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'
import { getNihssSeverity } from '../content/nihss'
import { PrimaryAction, SectionPrompt, SelectableButton, SelectionCheck, StatusPill } from '../components/GuidedControls'

const SYMPTOM_OPTIONS = [
  { id: 'weakness', label: 'Debilidad unilateral', sub: 'Brazo, pierna o cara de un lado', Icon: Zap },
  { id: 'speech', label: 'Trastorno del habla', sub: 'Afasia, disartria o disfasia', Icon: MessageSquare },
  { id: 'vision', label: 'Alteracion visual', sub: 'Perdida de vision, diplopia', Icon: Eye },
  { id: 'ataxia', label: 'Ataxia / Inestabilidad', sub: 'Dificultad para caminar', Icon: Scale },
  { id: 'other', label: 'Otro', sub: 'Otros sintomas', Icon: FileText },
]

const DISABLING_SYMPTOMS_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulacion o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiracion',
  'Negligencia / heminegligencia severa',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

export default function SymptomsNihssStep({ onConfirm }) {
  const [selected, setSelected] = useState({})
  const [score, setScore] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [hasDisabling, setHasDisabling] = useState(null)
  const [showList, setShowList] = useState(false)

  const hasSymptom = Object.values(selected).some(Boolean)
  const selectedCount = Object.values(selected).filter(Boolean).length
  const num = parseInt(score, 10)
  const validNihss = score !== '' && num >= 0 && num <= 42
  const severity = validNihss ? getNihssSeverity(num) : null
  const showDisablingBlock = validNihss && num < 5
  const canContinue = hasSymptom && validNihss && (!showDisablingBlock || hasDisabling !== null)

  function toggle(id) {
    setSelected((s) => ({ ...s, [id]: !s[id] }))
  }

  function handleLoad(result) {
    setScore(String(result))
    setShowModal(false)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && canContinue && !showModal) {
        onConfirm({ symptoms: { ...selected }, nihssScore: num, hasDisablingSymptoms: hasDisabling })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, showModal, selected, num, hasDisabling, onConfirm])

  return (
    <div className="space-y-2.5">
      <StepCard step="3" title="Síntomas NIHSS" accent="orange">
        {/* — Síntomas presentes — */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-orange-100 bg-orange-50/60 px-3 py-2">
          <div>
            <p className="text-sm font-bold text-orange-900">Sintomas presentes</p>
            <p className="text-xs text-orange-700">Selecciona uno o mas sintomas del paciente.</p>
          </div>
          <StatusPill complete={hasSymptom}>
            {hasSymptom ? `${selectedCount} seleccionado${selectedCount === 1 ? '' : 's'}` : 'Pendiente'}
          </StatusPill>
        </div>

        <div className="grid gap-2 md:grid-cols-2 mb-5">
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

        {/* — NIHSS — */}
        <div className="border-t border-orange-100 pt-4">
          <SectionPrompt
            tone="orange"
            title="Escala NIHSS"
            helper="Usa entrada directa o calculadora guiada. Rango valido: 0 a 42."
            complete={validNihss}
          />

          <div className="flex items-center gap-3 mb-4">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0-42"
              min={0}
              max={42}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-gray-800 text-base font-semibold focus:outline-none focus:ring-2 placeholder-gray-300 ${
                validNihss
                  ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-100 focus:ring-orange-400'
                  : 'border-gray-200 focus:ring-orange-400'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-3.5 border-2 border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
            >
              <Calculator size={16} /> Calcular
            </button>
          </div>

          {severity && (
            <div className={`rounded-xl border-2 px-4 py-3 mb-3 ${severity.bg} ${severity.border} animate-fade-in`}>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${severity.color}`}>{num}</span>
                <span className={`font-semibold text-sm ${severity.color}`}>{severity.label}</span>
              </div>
            </div>
          )}
        </div>

        {/* — Síntomas discapacitantes (solo NIHSS < 5) — */}
        {showDisablingBlock && (
          <div className="border-t border-orange-100 pt-4 mt-2">
            <SectionPrompt
              tone="orange"
              title="Confirma si el deficit es discapacitante"
              helper="NIHSS bajo puede justificar trombolisis si el deficit limita funcion."
              complete={hasDisabling !== null}
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <SelectableButton
                onClick={() => setHasDisabling(false)}
                active={hasDisabling === false}
                tone="gray"
                className="flex items-center justify-center gap-2 py-3.5 font-bold text-base"
              >
                NO
              </SelectableButton>
              <SelectableButton
                onClick={() => setHasDisabling(true)}
                active={hasDisabling === true}
                tone="orange"
                className="flex items-center justify-center gap-2 py-3.5 font-bold text-base"
              >
                SI
              </SelectableButton>
            </div>

            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showList ? 'Ocultar ejemplos' : 'Ver ejemplos de sintomas discapacitantes'}
            </button>

            {showList && (
              <ul className="mt-2 space-y-1.5 animate-fade-in">
                {DISABLING_SYMPTOMS_LIST.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className="text-orange-400 mt-0.5 shrink-0">-</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}

            {hasDisabling === true && (
              <div className="mt-3 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 animate-fade-in">
                <p className="text-xs font-semibold text-amber-700">
                  Deficit discapacitante: valorar trombolisis independientemente del puntaje NIHSS.
                </p>
              </div>
            )}
          </div>
        )}
      </StepCard>

      <PrimaryAction
        onClick={() => onConfirm({ symptoms: { ...selected }, nihssScore: num, hasDisablingSymptoms: hasDisabling })}
        valid={canContinue}
        disabledLabel={
          !hasSymptom
            ? 'Selecciona al menos un sintoma'
            : !validNihss
            ? 'Ingresa NIHSS para continuar'
            : 'Responde sintomas discapacitantes para continuar'
        }
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>

      {showModal && <NihssModal onLoad={handleLoad} onClose={() => setShowModal(false)} />}
    </div>
  )
}
