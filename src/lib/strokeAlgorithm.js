import { getElapsedMinutes, IV_WINDOW_MINUTES } from './calculations'
import { CONTRA_LABELS } from './contraindications'

/**
 * Computes the stroke thrombolysis decision.
 *
 * @param {{ symptoms, nihss, ctResult, contraindications }} state
 * @returns {{ thrombolyze: boolean|null, icon: string, title: string, body: string,
 *             drug: string|null, absoluteCI: boolean, relativeCI: boolean,
 *             relativeDetails: string[], absoluteDetails: string[] }}
 */
export function computeStrokeDecision({ symptoms, nihss, ctResult, contraindications }) {
  const isWakeUp = symptoms?.isWakeUpStroke === true

  // 1. Hemorrhage on CT → immediate exclusion
  if (ctResult?.bleeding === true) {
    return {
      thrombolyze: false,
      icon: 'error',
      title: 'Hemorragia intracraneal',
      body: 'La TC evidencia hemorragia. Trombolisis contraindicada. Derivar a Neurocirugía.',
      drug: null,
      absoluteCI: false,
      relativeCI: false,
      absoluteDetails: [],
      relativeDetails: [],
    }
  }

  // 2. Wake-up stroke path
  if (isWakeUp) {
    if (ctResult?.mismatch === false) {
      return {
        thrombolyze: false,
        icon: 'moon',
        title: 'ACV del despertar — sin mismatch',
        body: 'No se cumplen criterios WAKE-UP para trombolisis IV. Evaluar trombectomía mecánica si corresponde.',
        drug: null,
        absoluteCI: false,
        relativeCI: false,
        absoluteDetails: [],
        relativeDetails: [],
      }
    }
    if (ctResult?.mismatch !== true) {
      return {
        thrombolyze: null,
        icon: 'pending',
        title: 'Pendiente RMN',
        body: 'ACV del despertar detectado. Se requiere RMN con mismatch FLAIR-DWI para determinar elegibilidad.',
        drug: null,
        absoluteCI: false,
        relativeCI: false,
        absoluteDetails: [],
        relativeDetails: [],
      }
    }
    // mismatch === true → continue to CI check
  }

  // 3. Time window check (only for non-wake-up strokes)
  if (!isWakeUp) {
    const elapsed = getElapsedMinutes(symptoms?.lastSeenNormal)
    if (elapsed > IV_WINDOW_MINUTES) {
      return {
        thrombolyze: false,
        icon: 'warning',
        title: 'Fuera de ventana terapéutica IV',
        body: `Tiempo transcurrido: ${Math.round(elapsed)} min (límite: ${IV_WINDOW_MINUTES} min). Evaluar trombectomía mecánica.`,
        drug: null,
        absoluteCI: false,
        relativeCI: false,
        absoluteDetails: [],
        relativeDetails: [],
      }
    }
  }

  // 4. NIHSS threshold (only for non-wake-up strokes)
  if (!isWakeUp) {
    const nihssOk = (nihss?.nihssScore ?? 0) >= 5 || nihss?.hasDisablingSymptoms === true
    if (!nihssOk) {
      return {
        thrombolyze: false,
        icon: 'warning',
        title: 'NIHSS < 5 sin síntomas discapacitantes',
        body: `NIHSS: ${nihss?.nihssScore ?? 0}. No cumple umbral para trombolisis IV. Evaluar trombectomía.`,
        drug: null,
        absoluteCI: false,
        relativeCI: false,
        absoluteDetails: [],
        relativeDetails: [],
      }
    }
  }

  // 5. Absolute contraindication
  if (contraindications?.hasAbsolute) {
    const details = Object.entries(contraindications.red || {})
      .filter(([, v]) => v)
      .map(([k]) => CONTRA_LABELS[k] ?? k)
      .filter(Boolean)
    return {
      thrombolyze: false,
      icon: 'error',
      title: 'Contraindicación absoluta — trombolisis NO indicada',
      body: `Motivo: ${details.join('; ') || 'contraindicación absoluta'}. Continuar manejo de soporte y evaluar trombectomía.`,
      drug: null,
      absoluteCI: true,
      relativeCI: false,
      absoluteDetails: details,
      relativeDetails: [],
    }
  }

  // 6. Decided not to thrombolyze (relative CI + explicit decision)
  if (contraindications?.decidedNotToThrombolyze) {
    const details = Object.entries(contraindications.orange || {})
      .filter(([, v]) => v)
      .map(([k]) => CONTRA_LABELS[k] ?? k)
      .filter(Boolean)
    return {
      thrombolyze: false,
      icon: 'warning',
      title: 'No candidato — contraindicación relativa',
      body: 'Decisión de no trombolizar. Evaluar trombectomía mecánica y continuar manejo de soporte.',
      drug: null,
      absoluteCI: false,
      relativeCI: true,
      absoluteDetails: [],
      relativeDetails: details,
    }
  }

  // 7. Thrombolysis indicated
  const relativeDetails = Object.entries(contraindications?.orange || {})
    .filter(([, v]) => v)
    .map(([k]) => CONTRA_LABELS[k] ?? k)
    .filter(Boolean)
  const hasRelative = !!(contraindications?.hasRelative || relativeDetails.length > 0)
  // Prefer TNK for standard window; rtPA for wake-up (no formal TNK wake-up data)
  const drug = isWakeUp ? 'rtpa' : 'tnk'

  return {
    thrombolyze: true,
    icon: 'check',
    title: hasRelative ? 'Trombolisis indicada — valorar riesgo/beneficio' : 'Trombolisis indicada',
    body: hasRelative
      ? `${isWakeUp ? 'Mismatch FLAIR-DWI positivo.' : 'Dentro de ventana terapéutica.'} Contraindicaciones relativas presentes: individualizar decisión.`
      : `${isWakeUp ? 'Mismatch FLAIR-DWI positivo.' : 'Dentro de ventana terapéutica, sin contraindicaciones.'} Proceder con ${drug === 'tnk' ? 'TNK (Tenecteplase)' : 'rtPA (Alteplase)'}.`,
    drug,
    absoluteCI: false,
    relativeCI: hasRelative,
    absoluteDetails: [],
    relativeDetails,
  }
}
