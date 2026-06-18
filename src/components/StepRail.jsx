import { useEffect, useRef, useState } from 'react'
import { PROTOCOL_STEPS } from '../lib/protocolSteps'

// Riel vertical de progreso al borde izquierdo (Dirección B). Equivalente vertical
// de StepStepper: mismos 8 nodos, mismo cálculo de estado. Marca número + estado
// de cada paso; al tocar un nodo salta a ese paso y revela su nombre ~1.5s.
// El nombre del paso activo lo muestra StepPill (arriba), no el riel.

function stepStatus(step, { completion, postUnlocked, summaryUnlocked }) {
  if (step.key === 'decision') return postUnlocked ? 'complete' : 'empty'
  if (step.key === 'tratamiento') return summaryUnlocked ? 'complete' : 'empty'
  if (step.key === 'resumen') return 'empty'
  const states = step.tabs.map((t) => completion[t] ?? 'empty')
  if (states.every((s) => s === 'complete')) return 'complete'
  if (states.some((s) => s === 'complete' || s === 'partial')) return 'partial'
  return 'empty'
}

function dotClasses(status, active) {
  if (active && status === 'complete') return 'bg-status-warning text-stroke-bg ring-2 ring-stroke-iconActive'
  if (active) return 'border-2 border-stroke-iconActive bg-stroke-iconActive/15 text-stroke-iconActive'
  if (status === 'complete') return 'bg-status-warning text-stroke-bg border border-status-warning'
  if (status === 'partial') return 'bg-stroke-navy border border-status-warning text-status-warning'
  return 'bg-stroke-navy border border-stroke-line text-stroke-textMuted'
}

export default function StepRail({
  phase,
  activeTab,
  completion = {},
  postUnlocked = false,
  showTrombolisis = false,
  summaryUnlocked = false,
  onNavigate,
}) {
  const activeStep = PROTOCOL_STEPS.find((s) => s.tabs.includes(activeTab))
  const [tipKey, setTipKey] = useState(null)
  const tipTimer = useRef(null)

  useEffect(() => () => clearTimeout(tipTimer.current), [])

  function reveal(key) {
    setTipKey(key)
    clearTimeout(tipTimer.current)
    tipTimer.current = setTimeout(() => setTipKey(null), 1500)
  }

  function go(step) {
    const reachable = step.phase === 'pre' || (postUnlocked && (step.key !== 'resumen' || summaryUnlocked))
    if (!reachable) return
    reveal(step.key)
    const tabs = step.tabs.filter((t) => !(t === 'trombolisis' && !showTrombolisis))
    onNavigate?.(step.phase, tabs[0] ?? step.tabs[0])
  }

  return (
    <nav
      aria-label="Progreso del protocolo"
      className="absolute left-0 top-14 z-30 pl-1"
    >
      <div className="relative flex flex-col items-center">
        {/* Connector line behind the nodes */}
        <div className="absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2 bg-stroke-line" aria-hidden="true" />
        {PROTOCOL_STEPS.map((step) => {
          const status = stepStatus(step, { completion, postUnlocked, summaryUnlocked })
          const active = activeStep?.n === step.n
          const reachable = step.phase === 'pre' || (postUnlocked && (step.key !== 'resumen' || summaryUnlocked))
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
              className="relative flex h-11 w-11 items-center justify-center"
            >
              {/* tap-reveal name tooltip (to the right of the rail) */}
              {tipKey === step.key && (
                <span className="pointer-events-none absolute left-10 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-md border border-stroke-line bg-stroke-navy px-2 py-1 text-[11px] font-semibold text-stroke-text shadow-elevated animate-fade-in">
                  <span className="mr-1 font-mono text-stroke-iconActive">{step.n}</span>
                  {step.name}
                </span>
              )}
              <span
                className={`relative z-[1] flex items-center justify-center rounded-full font-mono font-semibold transition duration-base
                  ${active ? 'h-8 w-8 text-[14px]' : 'h-6 w-6 text-[12px]'}
                  ${dotClasses(status, active)}
                  ${pending ? 'animate-pending-pulse motion-reduce:animate-none' : ''}
                  ${reachable ? 'active:scale-95' : 'opacity-50'}`}
              >
                {step.n}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
