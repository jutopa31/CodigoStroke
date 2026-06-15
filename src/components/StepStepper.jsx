import { useEffect, useRef, useState } from 'react'

// Numeric 7-step protocol stepper (HANDOFF_SPEC Phase 2, adapted to the tab state machine).
// Replaces the icon TabBar. Each circle maps to one or more underlying tabs; grouped
// steps (CI, Tratamiento) expose a thin secondary nav when active so no sub-tab is lost.

const STEPS = [
  { n: 1, key: 'paciente',    name: 'Paciente',    phase: 'pre',  tabs: ['paciente'] },
  { n: 2, key: 'tiempo',      name: 'Tiempo',      phase: 'pre',  tabs: ['tiempo'] },
  { n: 3, key: 'clinica',     name: 'NIHSS',       phase: 'pre',  tabs: ['clinica'] },
  { n: 4, key: 'imagenes',    name: 'Imagen',      phase: 'pre',  tabs: ['imagenes'] },
  { n: 5, key: 'ci',          name: 'Contraindicaciones', phase: 'pre',  tabs: ['ci_abs', 'ci_rel'] },
  { n: 6, key: 'decision',    name: 'Decisión',    phase: 'post', tabs: ['decision'] },
  { n: 7, key: 'tratamiento', name: 'Tratamiento', phase: 'post', tabs: ['trombolisis', 'cuidados', 'trombectomia'] },
  { n: 8, key: 'resumen',     name: 'Resumen',     phase: 'post', tabs: ['resumen'] },
]

const SUB_LABELS = {
  ci_abs: 'CI Absolutas',
  ci_rel: 'CI Relativas',
  trombolisis: 'Trombolisis',
  cuidados: 'Cuidados',
  trombectomia: 'Trombectomía',
  resumen: 'Resumen',
}

// Roll a step's underlying tab completion up to a single status.
function stepStatus(step, { completion, postUnlocked, summaryUnlocked }) {
  if (step.key === 'decision') return postUnlocked ? 'complete' : 'empty'
  if (step.key === 'tratamiento') return summaryUnlocked ? 'complete' : 'empty'
  if (step.key === 'resumen') return 'empty'
  const states = step.tabs.map((t) => completion[t] ?? 'empty')
  if (states.every((s) => s === 'complete')) return 'complete'
  if (states.some((s) => s === 'complete' || s === 'partial')) return 'partial'
  return 'empty'
}

function circleClasses(status, active) {
  // A step you're standing on AND have completed still gets the amber "done" fill,
  // with the blue ring layered on so it also reads as "you are here".
  if (active && status === 'complete') return 'bg-status-warning text-stroke-bg ring-2 ring-stroke-iconActive ring-offset-2 ring-offset-stroke-navy'
  if (active) return 'border-2 border-stroke-iconActive bg-stroke-iconActive/15 text-stroke-iconActive'
  if (status === 'complete') return 'bg-status-warning text-stroke-bg border border-status-warning'
  if (status === 'partial') return 'bg-stroke-navy border border-status-warning text-status-warning'
  return 'bg-stroke-navy border border-stroke-line text-stroke-textMuted'
}

export default function StepStepper({ phase, activeTab, completion = {}, postUnlocked = false, showTrombolisis = false, summaryUnlocked = false, onNavigate }) {
  const activeStep = STEPS.find((s) => s.phase === phase && s.tabs.includes(activeTab))

  // One-shot "pop" flash when a step transitions into the completed state.
  const prevStatuses = useRef({})
  const [popping, setPopping] = useState({})
  useEffect(() => {
    const next = {}
    STEPS.forEach((s) => { next[s.key] = stepStatus(s, { completion, postUnlocked, summaryUnlocked }) })
    const justCompleted = STEPS.filter(
      (s) => next[s.key] === 'complete' && prevStatuses.current[s.key] && prevStatuses.current[s.key] !== 'complete',
    ).map((s) => s.key)
    if (justCompleted.length) {
      setPopping((p) => ({ ...p, ...Object.fromEntries(justCompleted.map((k) => [k, true])) }))
      const timers = justCompleted.map((k) =>
        setTimeout(() => setPopping((p) => { const np = { ...p }; delete np[k]; return np }), 320),
      )
      prevStatuses.current = next
      return () => timers.forEach(clearTimeout)
    }
    prevStatuses.current = next
  }, [completion, postUnlocked, summaryUnlocked])

  function go(step) {
    const reachable = step.phase === 'pre' || (postUnlocked && (step.key !== 'resumen' || summaryUnlocked))
    if (!reachable) return
    const tabs = step.tabs.filter((t) => !(t === 'trombolisis' && !showTrombolisis))
    onNavigate?.(step.phase, tabs[0] ?? step.tabs[0])
  }

  // Secondary nav for the active grouped step (CI / Tratamiento)
  const subTabs = activeStep && activeStep.tabs.length > 1
    ? activeStep.tabs.filter((t) => !(t === 'trombolisis' && !showTrombolisis))
    : []

  return (
    <div className="px-5 pt-2 pb-2 md:px-0">
     <div className="mx-auto w-full max-w-md">
      {/* Circles + connector line */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-4 right-4 top-1/2 h-px -translate-y-1/2 bg-stroke-line" aria-hidden="true" />
        {STEPS.map((step) => {
          const status = stepStatus(step, { completion, postUnlocked, summaryUnlocked })
          const active = activeStep?.n === step.n
          const reachable = step.phase === 'pre' || (postUnlocked && (step.key !== 'resumen' || summaryUnlocked))
          // Persistent gentle pulse on still-incomplete pre-phase steps so it's
          // obvious what's missing to unlock the thrombolysis decision.
          const pending = phase === 'pre' && step.phase === 'pre' && status !== 'complete' && !active
          return (
            <button
              key={step.n}
              type="button"
              onClick={() => go(step)}
              disabled={!reachable}
              aria-current={active ? 'step' : undefined}
              aria-label={`Paso ${step.n}: ${step.name}`}
              title={step.name}
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full font-mono text-[13px] font-semibold
                transition duration-base ${circleClasses(status, active)} ${popping[step.key] ? 'animate-step-pop' : ''} ${pending ? 'animate-pending-pulse motion-reduce:animate-none' : ''} ${reachable ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
            >
              {step.n}
            </button>
          )
        })}
      </div>

      {/* Active grouped-step secondary nav */}
      {subTabs.length > 0 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {subTabs.map((t) => {
            const sel = activeTab === t
            return (
              <button
                key={t}
                type="button"
                onClick={() => onNavigate?.(activeStep.phase, t)}
                aria-pressed={sel}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  sel
                    ? 'bg-stroke-iconActive/15 text-stroke-iconActive border border-stroke-iconActive/40'
                    : 'bg-stroke-navy text-stroke-textMuted border border-stroke-line hover:bg-stroke-panel/40'
                }`}
              >
                {SUB_LABELS[t] ?? t}
              </button>
            )
          })}
        </div>
      )}
     </div>
    </div>
  )
}
