import { PROTOCOL_STEPS } from '../lib/protocolSteps'

// Píldora flotante (top-center) con "N · Nombre" del paso activo. Es el rótulo
// del paso visible en el modo scroll (el StepRail muestra sólo los números).
export default function StepPill({ activeTab }) {
  const step = PROTOCOL_STEPS.find((s) => s.tabs.includes(activeTab))
  if (!step) return null
  return (
    <div data-testid="step-pill" className="pointer-events-none absolute left-1/2 top-2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-stroke-line bg-stroke-navy/95 px-4 py-1.5 text-sm font-semibold text-stroke-text shadow-elevated backdrop-blur-sm">
        <span className="font-mono text-stroke-iconActive">{step.n}</span>
        <span>{step.name}</span>
      </div>
    </div>
  )
}
