// Modelo canónico de los 8 pasos del protocolo, compartido por la navegación
// scroll vertical (StepRail / ProtocolScroller / StepPill) y la derivación de
// pasos visibles. Es el mismo modelo de 8 pasos que usa StepStepper.jsx; acá
// vive de forma reutilizable para que el modo scroll no lo duplique.
//
// Pasos agrupados (5 Contraindicaciones, 7 Tratamiento) tienen varios `tabs`:
// se renderizan como UNA card con sub-control segmentado interno.
export const PROTOCOL_STEPS = [
  { n: 1, key: 'paciente',    name: 'Paciente',           phase: 'pre',  tabs: ['paciente'] },
  { n: 2, key: 'tiempo',      name: 'Tiempo',             phase: 'pre',  tabs: ['tiempo'] },
  { n: 3, key: 'clinica',     name: 'NIHSS',              phase: 'pre',  tabs: ['clinica'] },
  { n: 4, key: 'imagenes',    name: 'Imagen',             phase: 'pre',  tabs: ['imagenes'] },
  { n: 5, key: 'ci',          name: 'Contraindicaciones', phase: 'pre',  tabs: ['ci_abs', 'ci_rel'] },
  { n: 6, key: 'decision',    name: 'Decisión',           phase: 'post', tabs: ['decision'] },
  { n: 7, key: 'tratamiento', name: 'Tratamiento',        phase: 'post', tabs: ['trombolisis', 'cuidados', 'trombectomia'] },
  { n: 8, key: 'resumen',     name: 'Resumen',            phase: 'post', tabs: ['resumen'] },
]

// Devuelve el `step` cuyo grupo de tabs incluye el tab dado (o undefined).
export function stepForTab(tabId) {
  return PROTOCOL_STEPS.find((s) => s.tabs.includes(tabId))
}

// Secciones que entran al stream de scroll para la fase actual.
// - pre:  los 5 pasos de evaluación (1-5).
// - post: Decisión (6) + Tratamiento (7), y Resumen (8) solo cuando ya está
//         desbloqueado (hay trombectomía confirmada) — coherente con cuándo el
//         tab `resumen` puede renderizarse con datos completos.
export function deriveVisibleSteps({ phase, summaryUnlocked = false }) {
  if (phase === 'pre') {
    return PROTOCOL_STEPS.filter((s) => s.phase === 'pre')
  }
  if (phase === 'post') {
    return PROTOCOL_STEPS.filter(
      (s) => s.phase === 'post' && (s.key !== 'resumen' || summaryUnlocked),
    )
  }
  return []
}
