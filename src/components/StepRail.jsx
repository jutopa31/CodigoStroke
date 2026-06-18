import { useEffect, useRef, useState } from 'react'
import { PROTOCOL_STEPS } from '../lib/protocolSteps'

// Riel vertical de progreso al borde izquierdo (Dirección B). Guía periférica
// "tipo Stories": dots diminutos, sólo el paso activo se agranda a una pastilla
// numerada. El estado se lee por color (ámbar = completo). El nombre del paso
// activo lo muestra StepPill (arriba); al tocar un dot salta y revela su nombre
// ~1.5s. Mismos 8 nodos y cálculo de estado que StepStepper, pero al borde y sin
// línea conectora, para que no compita con el contenido (fidelidad al mock B).

function stepStatus(step, { completion, postUnlocked, summaryUnlocked }) {
  if (step.key === 'decision') return postUnlocked ? 'complete' : 'empty'
  if (step.key === 'tratamiento') return summaryUnlocked ? 'complete' : 'empty'
  if (step.key === 'resumen') return 'empty'
  const states = step.tabs.map((t) => completion[t] ?? 'empty')
  if (states.every((s) => s === 'complete')) return 'complete'
  if (states.some((s) => s === 'complete' || s === 'partial')) return 'partial'
  return 'empty'
}

// El activo es el único nodo numerado (pastilla); el resto son dots periféricos.
function dotVisual(status, active) {
  if (active && status === 'complete') return 'h-6 w-6 text-[12px] bg-status-warning text-stroke-bg ring-2 ring-stroke-iconActive'
  if (active) return 'h-6 w-6 text-[12px] bg-stroke-iconActive text-white ring-4 ring-stroke-iconActive/25'
  if (status === 'complete') return 'h-2 w-2 bg-status-warning'
  if (status === 'partial') return 'h-2 w-2 bg-stroke-navy ring-1 ring-status-warning'
  return 'h-2 w-2 bg-stroke-line'
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
      className="absolute left-0 top-1/2 z-30 -translate-y-1/2 pl-1"
    >
      <div className="relative flex flex-col items-center">
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
                  ${dotVisual(status, active)}
                  ${pending ? 'animate-pending-pulse motion-reduce:animate-none' : ''}
                  ${reachable ? 'active:scale-90' : 'opacity-40'}`}
              >
                {active ? step.n : null}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
