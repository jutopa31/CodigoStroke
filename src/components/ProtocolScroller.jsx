import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Stream vertical de cards a pantalla completa con scroll-snap. Una sección por
// `step`; sólo una visible a la vez (snap mandatory + stop always). Sincroniza
// en ambos sentidos con `activeSectionKey`:
//   - scroll del usuario → IntersectionObserver → onActiveChange(sectionKey)
//   - cambio externo de activeSectionKey (handlers, jump del rail) → scrollIntoView
// `lastObserved` evita que el efecto de scroll pelee con el observer (si ya
// estamos parados en esa sección por scroll, no re-scrollea).
const ProtocolScroller = forwardRef(function ProtocolScroller(
  { steps, activeSectionKey, renderStep, onActiveChange },
  ref,
) {
  const containerRef = useRef(null)
  const sectionRefs = useRef({})
  const lastObserved = useRef(null)

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  function scrollToStep(sectionKey) {
    const el = sectionRefs.current[sectionKey]
    if (el) el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' })
  }

  useImperativeHandle(ref, () => ({ scrollToStep }))

  // Observer: la sección que ocupa >=60% del viewport del scroller es la activa.
  useEffect(() => {
    const root = containerRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            const key = e.target.dataset.stepKey
            lastObserved.current = key
            onActiveChange?.(key)
          }
        })
      },
      { root, threshold: [0.6] },
    )
    Object.values(sectionRefs.current).forEach((el) => el && io.observe(el))
    return () => io.disconnect()
    // Re-observa cuando cambia el set de secciones (cambio de fase / branching).
  }, [steps, onActiveChange])

  // Scroll programático cuando activeSectionKey cambia desde afuera.
  useEffect(() => {
    if (!activeSectionKey) return
    if (lastObserved.current === activeSectionKey) return
    scrollToStep(activeSectionKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionKey])

  return (
    <div
      ref={containerRef}
      className="flex-1 snap-y snap-mandatory overflow-y-auto overflow-x-hidden scroll-smooth"
      style={{ scrollbarWidth: 'none' }}
    >
      {steps.map((step) => {
        const isActive = step.key === activeSectionKey
        return (
          <section
            key={step.key}
            ref={(el) => { sectionRefs.current[step.key] = el }}
            data-step-key={step.key}
            className="h-full w-full snap-start snap-always overflow-y-auto overflow-x-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* pt-14 despeja la StepPill flotante (top-center). pl ajustado al ancho
                real del riel (~48px) para no desperdiciar espacio: la card ya trae
                su propio px-4, así que con pl-10 queda ~8-12px de aire al riel. */}
            <div className="mx-auto w-full max-w-5xl px-0 pb-3 pt-14 pl-10 md:px-5 md:pl-12">
              {renderStep(step, isActive)}
            </div>
          </section>
        )
      })}
    </div>
  )
})

export default ProtocolScroller
