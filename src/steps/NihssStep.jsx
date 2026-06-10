import { useState, useEffect, useRef } from 'react'
import { ChevronRight, Calculator, ChevronDown, ChevronUp } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssGuided from '../components/NihssGuided'
import { getNihssSeverity } from '../content/nihss'
import { PrimaryAction, SectionPrompt, SelectableButton } from '../components/GuidedControls'

const DISABLING_SYMPTOMS_LIST = [
  'Afasia o dificultad severa para comunicarse',
  'Paresia que impide deambulacion o uso del miembro',
  'Hemianopsia funcionalmente significativa',
  'Disfagia con riesgo de aspiracion',
  'Negligencia / heminegligencia severa',
  'Ataxia severa: imposibilidad de caminar sin asistencia',
]

export default function NihssStep({ onConfirm }) {
  const [score, setScore] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [hasDisabling, setHasDisabling] = useState(null)
  const [showList, setShowList] = useState(false)
  const noDisablingRef = useRef(null)
  const continueRef = useRef(null)

  const num = parseInt(score, 10)
  const valid = score !== '' && num >= 0 && num <= 42
  const severity = valid ? getNihssSeverity(num) : null
  const showDisablingBlock = valid && num < 5
  const canContinue = valid && (!showDisablingBlock || hasDisabling !== null)

  useEffect(() => {
    function onKey(e) {
      const tag = e.target?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'button' || tag === 'select' || tag === 'textarea') return
      if (e.key === 'Enter' && canContinue && !showModal) {
        onConfirm({ nihssScore: num, hasDisablingSymptoms: hasDisabling })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canContinue, showModal, num, hasDisabling, onConfirm])

  function handleLoad(result) {
    setScore(String(result))
    setShowModal(false)
  }

  if (showModal) {
    return (
      <div className="px-4 pb-4 space-y-3">
        <NihssGuided
          onLoad={handleLoad}
          onClose={() => setShowModal(false)}
        />
      </div>
    )
  }

  function handleScoreKeyDown(event) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    if (showDisablingBlock) {
      noDisablingRef.current?.focus()
      return
    }
    if (canContinue && !showModal) onConfirm({ nihssScore: num, hasDisablingSymptoms: hasDisabling })
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="4" title="Escala NIHSS" accent="orange">
        <SectionPrompt
          tone="orange"
          title="Ingresa el NIHSS"
          helper="Usa entrada directa o calculadora guiada. El rango valido es 0 a 42."
          complete={valid}
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
            onKeyDown={handleScoreKeyDown}
            autoFocus
            className={`flex-1 rounded-xl border-2 px-4 py-3.5 text-stroke-text text-base font-semibold focus:outline-none focus:ring-2 placeholder-stroke-textMuted/50 ${
              valid
                ? 'border-orange-500 bg-amber-500/15 ring-2 ring-amber-500/30 focus:ring-orange-400'
                : 'border-stroke-line focus:ring-orange-400'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-3.5 border-2 border-amber-500/40 text-amber-300 bg-amber-500/15 hover:bg-amber-500/15 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap"
          >
            <Calculator size={16} /> Calcular
          </button>
        </div>

        {severity && (
          <div className={`rounded-xl border-2 px-4 py-3 ${severity.bg} ${severity.border} animate-fade-in`}>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${severity.color}`}>{num}</span>
              <span className={`font-semibold text-sm ${severity.color}`}>{severity.label}</span>
            </div>
          </div>
        )}
      </StepCard>

      {showDisablingBlock && (
        <StepCard step="" title="Sintomas discapacitantes" accent="orange" rail railStep="4">
          <SectionPrompt
            tone="orange"
            title="Confirma si el deficit es discapacitante"
            helper="NIHSS bajo puede justificar trombolisis si el deficit limita funcion."
            complete={hasDisabling !== null}
          />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <SelectableButton
              buttonRef={noDisablingRef}
              onClick={() => {
                setHasDisabling(false)
                requestAnimationFrame(() => continueRef.current?.focus())
              }}
              active={hasDisabling === false}
              tone="gray"
              className="flex items-center justify-center gap-2 py-3.5 font-bold text-base"
            >
              NO
            </SelectableButton>
            <SelectableButton
              onClick={() => {
                setHasDisabling(true)
                requestAnimationFrame(() => continueRef.current?.focus())
              }}
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
            className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-300 transition-colors"
          >
            {showList ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {showList ? 'Ocultar ejemplos' : 'Ver ejemplos de sintomas discapacitantes'}
          </button>

          {showList && (
            <ul className="mt-2 space-y-1.5 animate-fade-in">
              {DISABLING_SYMPTOMS_LIST.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-stroke-textMuted">
                  <span className="text-orange-400 mt-0.5 shrink-0">-</span>
                  {s}
                </li>
              ))}
            </ul>
          )}

          {hasDisabling === true && (
            <div className="mt-3 bg-amber-500/10 border-2 border-amber-300 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-amber-300">
                Deficit discapacitante: valorar trombolisis independientemente del puntaje NIHSS.
              </p>
            </div>
          )}
        </StepCard>
      )}

      <PrimaryAction
        buttonRef={continueRef}
        onClick={() => onConfirm({ nihssScore: num, hasDisablingSymptoms: hasDisabling })}
        valid={canContinue}
        disabledLabel={valid ? 'Responde sintomas discapacitantes para continuar' : 'Ingresa NIHSS para continuar'}
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>

    </div>
  )
}
