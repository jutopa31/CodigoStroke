import { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { RotateCcw, Clock, Copy, Check } from 'lucide-react'
import GlobalTimer from './components/GlobalTimer'
import AlertModal from './components/AlertModal'
import StepTimeline from './components/StepTimeline'
import QuickAddFAB from './components/QuickAddFAB'
import OutOfWindowModal from './components/OutOfWindowModal'
import StartStep from './steps/StartStep'
import PatientStep from './steps/PatientStep'
import SymptomsStep from './steps/SymptomsStep'
import VitalsStep from './steps/VitalsStep'
import NihssStep from './steps/NihssStep'
import InstructionsStep from './steps/InstructionsStep'
import CTResultStep from './steps/CTResultStep'
import MRIResultStep from './steps/MRIResultStep'
import ContraindicationsStep from './steps/ContraindicationsStep'
import DosageStep from './steps/DosageStep'
import ThrombectomyStep from './steps/ThrombectomyStep'
import TimestampPanel from './components/TimestampPanel'
import { saveStrokeEvent, generatePatientId, saveSession } from './lib/storage'
import { sendStrokeAlert } from './lib/emailService'

const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,
  SYMPTOMS: 3,
  VITALS: 4,
  NIHSS: 5,
  INSTRUCTIONS: 6,
  CT_RESULT: 7,
  CONTRAINDICATIONS: 8,
  DOSAGE: 9,
  THROMBECTOMY: 10,
  DONE: 11,
}

const SIDEBAR_VALUES = [1, 3, 4, 5, 6, 7, 8, 9, 10]

const MOCK_PATIENT = {
  name: 'Paciente Test',
  dni: '38999123',
  passphrase: 'mock',
}

const SYMPTOM_LABELS = {
  weakness: 'Debilidad unilateral',
  speech: 'Trastorno del habla',
  vision: 'Alteracion visual',
  ataxia: 'Ataxia / Inestabilidad',
  other: 'Otro',
}

function fmtTime(date) {
  if (!date) return 'No registrado'
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fmtDateTime(value) {
  if (!value) return 'No registrado'
  const date = value instanceof Date ? value : new Date(value)
  return `${date.toLocaleDateString('es-AR')} ${fmtTime(date)}`
}

function SummaryRow({ label, value, tone = 'gray' }) {
  const toneClass = {
    gray: 'border-gray-200 bg-gray-50 text-gray-800',
    blue: 'border-blue-200 bg-blue-50 text-blue-800',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    orange: 'border-orange-200 bg-orange-50 text-orange-800',
    red: 'border-red-200 bg-red-50 text-red-800',
  }[tone]

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-semibold leading-snug">{value ?? 'No registrado'}</p>
    </div>
  )
}

function SummarySection({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(STEP.START)
  const [timerStart, setTimerStart] = useState(null)
  const [patientArrivalTime, setPatientArrivalTime] = useState(null)
  const [ctRequestTime, setCtRequestTime] = useState(null)
  const [angioRequestTime, setAngioRequestTime] = useState(null)
  const [thrombolyticStartTime, setThrombolyticStartTime] = useState(null)
  const [thrombectomyActivationTime, setThrombectomyActivationTime] = useState(null)
  const [patient, setPatient] = useState(null)
  const [patientId, setPatientId] = useState('')
  const [symptoms, setSymptoms] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [nihss, setNihss] = useState(null)
  const [ctResult, setCtResult] = useState(null)
  const [contraindications, setContraindications] = useState(null)
  const [dosage, setDosage] = useState(null)
  const [thrombectomy, setThrombectomy] = useState(null)
  const [copied, setCopied] = useState(false)
  const [eventId] = useState(uuidv4)
  const [nihssReadings, setNihssReadings] = useState([])
  const [vitalsReadings, setVitalsReadings] = useState([])
  const [glucoseReadings, setGlucoseReadings] = useState([])
  const [showOutOfWindow, setShowOutOfWindow] = useState(false)
  const [caseSaved, setCaseSaved] = useState(false)

  const symptomsRef = useRef(null)
  const vitalsRef = useRef(null)
  const nihssRef = useRef(null)
  const instructionsRef = useRef(null)
  const ctResultRef = useRef(null)
  const contraindicationsRef = useRef(null)
  const dosageRef = useRef(null)
  const thrombectomyRef = useRef(null)
  const doneRef = useRef(null)

  function scrollTo(ref) {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function advanceTo(nextStep) {
    setStep((currentStep) => Math.max(currentStep, nextStep))
  }

  function handleStart() {
    setStep(STEP.PATIENT)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    function activateMockEvaluation() {
      const now = new Date()
      const mockPatientId = generatePatientId(MOCK_PATIENT.name, MOCK_PATIENT.dni)

      setPatient(MOCK_PATIENT)
      setPatientId(mockPatientId)
      setPatientArrivalTime(now)
      setTimerStart(now)
      setCtRequestTime(null)
      setAngioRequestTime(null)
      setThrombolyticStartTime(null)
      setThrombectomyActivationTime(null)
      setSymptoms(null)
      setVitals(null)
      setNihss(null)
      setCtResult(null)
      setContraindications(null)
      setDosage(null)
      setStep(STEP.SYMPTOMS)

      saveSession(mockPatientId, {
        patientName: MOCK_PATIENT.name,
        patientDNI: MOCK_PATIENT.dni,
        patientArrivalTime: now.toISOString(),
        startTime: now.toISOString(),
      })

      setTimeout(() => {
        symptomsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === 'evaluacion') {
      activateMockEvaluation()
    }

    function handleDevShortcut(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        activateMockEvaluation()
      }
    }

    window.addEventListener('keydown', handleDevShortcut)
    return () => window.removeEventListener('keydown', handleDevShortcut)
  }, [])

  function handleResume(id, session) {
    setPatientId(id)
    setPatient({ name: session.patientName, dni: session.patientDNI })
    if (session.startTime) setTimerStart(new Date(session.startTime))
    if (session.patientArrivalTime) setPatientArrivalTime(new Date(session.patientArrivalTime))
    if (session.ctRequestTime) setCtRequestTime(new Date(session.ctRequestTime))
    if (session.angioRequestTime) setAngioRequestTime(new Date(session.angioRequestTime))
    if (session.thrombolyticStartTime) setThrombolyticStartTime(new Date(session.thrombolyticStartTime))
    if (session.thrombectomyActivationTime) setThrombectomyActivationTime(new Date(session.thrombectomyActivationTime))
    setStep(STEP.SYMPTOMS)
  }

  function handlePatientConfirm(data) {
    const now = new Date()
    setPatient(data)
    setPatientArrivalTime(now)
    setPatientId(generatePatientId(data.name, data.dni))
    setStep(STEP.ALERT)
  }

  async function handleAlertConfirm() {
    const now = new Date()
    setTimerStart(now)
    setStep(STEP.SYMPTOMS)
    scrollTo(symptomsRef)

    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: now.toISOString(),
    })

    try {
      await sendStrokeAlert({ patient, startTime: now })
    } catch (err) {
      console.error('Email error:', err)
    }

    saveStrokeEvent({
      id: eventId,
      patientDNI: patient.dni,
      patientName: patient.name,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: now.toISOString(),
      emailSent: true,
    })
  }

  function handleCtRequest(time) {
    setCtRequestTime(time)
    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: time.toISOString(),
      thrombolyticStartTime: thrombolyticStartTime?.toISOString(),
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
    })
  }

  function handleThrombolyticStart(time) {
    setThrombolyticStartTime(time)
    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      thrombolyticStartTime: time.toISOString(),
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
    })
  }

  function handleAngioRequest(time) {
    setAngioRequestTime(time)
    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      angioRequestTime: time.toISOString(),
      thrombolyticStartTime: thrombolyticStartTime?.toISOString(),
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
    })
  }

  function handleThrombectomyActivation(time) {
    setThrombectomyActivationTime(time)
    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      angioRequestTime: angioRequestTime?.toISOString(),
      thrombolyticStartTime: thrombolyticStartTime?.toISOString(),
      thrombectomyActivationTime: time.toISOString(),
    })
  }

  function handleSymptomsConfirm(data) {
    setSymptoms(data)
    advanceTo(STEP.VITALS)
    scrollTo(vitalsRef)
  }

  function handleVitalsConfirm(data) {
    setVitals(data)
    advanceTo(STEP.NIHSS)
    scrollTo(nihssRef)
  }

  function handleNihssConfirm(data) {
    setNihss(data)
    advanceTo(STEP.INSTRUCTIONS)
    scrollTo(instructionsRef)
  }

  function handleInstructionsConfirm(data) {
    saveStrokeEvent({
      id: eventId,
      patientDNI: patient.dni,
      patientName: patient.name,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      thrombolyticStartTime: thrombolyticStartTime?.toISOString(),
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
      symptoms,
      vitals,
      nihss,
      checklist: data.checklist,
    })
    advanceTo(STEP.CT_RESULT)
    scrollTo(ctResultRef)
  }

  function handleCtResultConfirm(data) {
    setCtResult(data)
    setCtRequestTime(new Date(data.ctRequestTime))
    if (data.bleeding) {
      setStep(STEP.DONE)
      scrollTo(doneRef)
    } else {
      const indicated = nihss?.nihssScore >= 5 || nihss?.hasDisablingSymptoms === true
      if (indicated) {
        advanceTo(STEP.CONTRAINDICATIONS)
        scrollTo(contraindicationsRef)
      } else {
        advanceTo(STEP.THROMBECTOMY)
        scrollTo(thrombectomyRef)
      }
    }
  }

  function handleMRIResultConfirm(data) {
    setCtResult(data)
    if (data.mismatch) {
      advanceTo(STEP.CONTRAINDICATIONS)
      scrollTo(contraindicationsRef)
    } else {
      advanceTo(STEP.THROMBECTOMY)
      scrollTo(thrombectomyRef)
    }
  }

  function handleContraindicationsConfirm(data) {
    setContraindications(data)
    if (data.hasAbsolute || data.decidedNotToThrombolyze) {
      advanceTo(STEP.THROMBECTOMY)
      scrollTo(thrombectomyRef)
    } else {
      advanceTo(STEP.DOSAGE)
      scrollTo(dosageRef)
    }
  }

  function handleDosageConfirm(data) {
    setDosage(data)
    setThrombolyticStartTime(new Date(data.thrombolyticStartTime))
    advanceTo(STEP.THROMBECTOMY)
    scrollTo(thrombectomyRef)
  }

  function handleThrombectomyConfirm(data) {
    setThrombectomy(data)
    if (data.thrombectomyActivationTime) {
      setThrombectomyActivationTime(new Date(data.thrombectomyActivationTime))
    }
    setStep(STEP.DONE)
    scrollTo(doneRef)
  }

  function handleAddNihss(score) {
    setNihssReadings((prev) => [...prev, { score, timestamp: new Date() }])
  }

  function handleAddVitals({ systolic, diastolic }) {
    setVitalsReadings((prev) => [...prev, { systolic, diastolic, timestamp: new Date() }])
  }

  function handleAddGlucose(value) {
    setGlucoseReadings((prev) => [...prev, { value, timestamp: new Date() }])
  }

  function handleSidebarStepClick(stepValue) {
    const refMap = {
      3: symptomsRef,
      4: vitalsRef,
      5: nihssRef,
      6: instructionsRef,
      7: ctResultRef,
      8: contraindicationsRef,
      9: dosageRef,
      10: thrombectomyRef,
    }
    const ref = refMap[stepValue]
    if (ref) scrollTo(ref)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSaveCase() {
    saveStrokeEvent({
      id: eventId,
      patientId,
      patient,
      timerStart: timerStart?.toISOString(),
      patientArrivalTime: patientArrivalTime?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      thrombolyticStartTime: thrombolyticStartTime?.toISOString(),
      angioRequestTime: angioRequestTime?.toISOString(),
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
      symptoms,
      vitals,
      nihss,
      ctResult,
      contraindications,
      dosage,
      thrombectomy,
      nihssReadings,
      vitalsReadings,
      glucoseReadings,
      outcome: getDoneContent()?.title,
    })
    setCaseSaved(true)
  }

  function buildSummaryText() {
    const done = getDoneContent()
    const lines = [
      `CÓDIGO STROKE — Resumen del caso`,
      `Paciente: ${patient?.name ?? '-'}  |  DNI: ${patient?.dni ?? '-'}  |  ID: ${patientId || '-'}`,
      `Estado final: ${done?.title ?? '-'}`,
      ``,
      `--- TIEMPOS ---`,
      `Ingreso:                  ${fmtDateTime(patientArrivalTime)}`,
      `Inicio código:            ${fmtDateTime(timerStart)}`,
      `Última vez asintomático:  ${fmtDateTime(symptoms?.lastSeenNormal)}`,
      `Solicitud TC:             ${fmtDateTime(ctRequestTime)}`,
      `Inicio trombolítico:      ${fmtDateTime(thrombolyticStartTime)}`,
      `Angio / trombectomía:     ${fmtDateTime(angioRequestTime || thrombectomyActivationTime)}`,
      ``,
      `--- EVALUACIÓN INICIAL ---`,
      `Síntomas:        ${getSelectedSymptomsSummary()}`,
      `Ventana / OGV:   ${symptoms?.isWakeUpStroke ? 'ACV del despertar / evaluar imagen' : 'Según horario registrado'}`,
      `TA:              ${vitals ? `${vitals.systolic}/${vitals.diastolic} mmHg` : 'No registrado'}`,
      `Glucemia:        ${vitals ? `${vitals.glucose} mg/dL` : 'No registrado'}`,
      `NIHSS:           ${nihss ? `${nihss.nihssScore} puntos${nihss.hasDisablingSymptoms ? ' + déficit discapacitante' : ''}` : 'No registrado'}`,
      `Anticoagulación: ${symptoms?.anticoagulation?.active ? `Sí: ${symptoms.anticoagulation.type || 'tipo no registrado'}` : symptoms?.anticoagulation ? 'No' : 'No registrado'}`,
      ``,
      `--- IMAGEN Y DECISIONES ---`,
      `Imagen:            ${getImagingSummary()}`,
      `Contraindicaciones:${getContraSummary()}`,
      `Trombolisis:       ${getDoseSummary()}`,
      `Peso:              ${dosage?.weight ? `${dosage.weight} kg` : 'No registrado'}`,
      `AngioTAC:          ${thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'}`,
      `ASPECTS:           ${thrombectomy?.aspectScore ?? 'No registrado'}`,
    ]
    if (nihssReadings.length > 0)
      lines.push(`\nNIHSS adicionales: ${nihssReadings.map((r) => `${r.score} (${fmtTime(r.timestamp)})`).join(', ')}`)
    if (vitalsReadings.length > 0)
      lines.push(`TA adicionales: ${vitalsReadings.map((r) => `${r.systolic}/${r.diastolic} (${fmtTime(r.timestamp)})`).join(', ')}`)
    if (glucoseReadings.length > 0)
      lines.push(`Glucemias adicionales: ${glucoseReadings.map((r) => `${r.value} (${fmtTime(r.timestamp)})`).join(', ')}`)
    return lines.join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildSummaryText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleReset() {
    const confirmed = window.confirm('¿Reiniciar el protocolo? Se perderán todos los datos del caso actual.')
    if (!confirmed) return
    window.location.reload()
  }

  const sidebarCompletedSteps = step === STEP.DONE
    ? SIDEBAR_VALUES
    : SIDEBAR_VALUES.filter((v) => v < step)
  const protocolUnlocked = step >= STEP.SYMPTOMS

  // Trombolisis potencialmente indicada: NIHSS≥5, o NIHSS<5 con síntomas discapacitantes,
  // o wake-up con mismatch positivo en RMN
  const thrombolysisPathActive = !ctResult?.bleeding && (
    symptoms?.isWakeUpStroke
      ? ctResult?.mismatch === true
      : (nihss?.nihssScore >= 5 || nihss?.hasDisablingSymptoms === true)
  )

  const RED_CONTRA_LABELS = {
    prior_ich:         'Hemorragia intracraneal previa o actual',
    large_infarct:     'Infarto extenso en TC (ASPECTS < 3)',
    tce:               'TCE grave o cirugía intracraneal reciente',
    axial_tumor:       'Tumor intra-axial',
    coagulopathy:      'Coagulopatía severa',
    aortic_dissection: 'Disección aórtica',
    endocarditis:      'Endocarditis infecciosa activa',
  }

  function generateSummaryText() {
    const lines = ['=== CÓDIGO STROKE ===']
    if (patient) lines.push(`Paciente: ${patient.name} · DNI ${patient.dni}`)
    if (timerStart) lines.push(`Inicio del código: ${timerStart.toLocaleTimeString('es-AR')}`)
    if (patientArrivalTime && ctRequestTime) {
      const mins = Math.round((ctRequestTime - patientArrivalTime) / 60000)
      lines.push(`Tiempo puerta-imagen: ${mins} min`)
    }
    if (patientArrivalTime && thrombolyticStartTime) {
      const mins = Math.round((thrombolyticStartTime - patientArrivalTime) / 60000)
      lines.push(`Tiempo puerta-aguja: ${mins} min`)
    }
    lines.push('')
    if (nihss) lines.push(`NIHSS: ${nihss.nihssScore}`)
    if (ctResult?.bleeding) {
      lines.push('TC: Hemorragia intracraneal — trombolisis contraindicada')
    } else if (ctResult) {
      lines.push('TC: Sin hemorragia')
    }
    if (contraindications?.hasAbsolute) {
      const names = Object.entries(contraindications.red || {})
        .filter(([, v]) => v)
        .map(([k]) => RED_CONTRA_LABELS[k])
        .filter(Boolean)
      lines.push(`Contraindicaciones: ${names.length ? names.join('; ') : 'Contraindicación absoluta'}`)
    } else if (contraindications?.hasRelative && contraindications?.decidedNotToThrombolyze) {
      lines.push('Trombolisis: No indicada (contraindicación relativa — decisión de no trombolizar)')
    }
    if (dosage) {
      const drug = dosage.drug === 'tnk' ? 'TNK' : 'rtPA'
      const dose = dosage.drug === 'tnk'
        ? `${dosage.dose?.total} mg bolo único`
        : `${dosage.dose?.total} mg total (bolo ${dosage.dose?.bolo} mg + infusión ${dosage.dose?.infusion} mg)`
      lines.push(`Trombolisis: ${drug} — ${dose}`)
      if (thrombolyticStartTime) lines.push(`Inicio trombolisis: ${thrombolyticStartTime.toLocaleTimeString('es-AR')}`)
    }
    if (thrombectomy) {
      const angio = thrombectomy.angioRequested ? 'Sí' : 'No'
      lines.push(`AngioTAC solicitada: ${angio}`)
      if (thrombectomy.angioRequested) {
        lines.push(`OGV: ${thrombectomy.ogvFound === true ? 'Sí' : thrombectomy.ogvFound === false ? 'No' : 'Pendiente'}`)
      }
      if (thrombectomy.thrombectomyActivationTime) {
        lines.push(`Trombectomía activada: ${new Date(thrombectomy.thrombectomyActivationTime).toLocaleTimeString('es-AR')}`)
      }
    }
    return lines.join('\n')
  }

  function getDoneContent() {
    if (ctResult?.bleeding) {
      return {
        icon: 'error',
        iconBg: 'bg-red-100',
        borderColor: 'border-red-400',
        title: 'Hemorragia intracraneal',
        body: 'La TC evidencia hemorragia. Trombolisis contraindicada. Derivar a Neurocirugía.',
      }
    }
    if (symptoms?.isWakeUpStroke && ctResult?.mismatch === false) {
      return {
        icon: 'moon',
        iconBg: 'bg-indigo-100',
        borderColor: 'border-indigo-400',
        title: 'ACV del despertar — sin mismatch',
        body: 'No se cumplen criterios WAKE-UP para trombolisis IV. Evaluar trombectomía mecánica si corresponde.',
      }
    }
    if (contraindications?.hasAbsolute) {
      const activeNames = Object.entries(contraindications.red || {})
        .filter(([, v]) => v)
        .map(([k]) => RED_CONTRA_LABELS[k])
        .filter(Boolean)
      const motivo = activeNames.length ? activeNames.join('; ') : 'Contraindicación absoluta'
      return {
        icon: 'error',
        iconBg: 'bg-red-100',
        borderColor: 'border-red-400',
        title: 'Contraindicación absoluta — trombolisis NO indicada',
        body: `Motivo: ${motivo}. Continuar manejo de soporte y evaluar trombectomía mecánica.`,
      }
    }
    if (dosage) {
      const drugName = dosage.drug === 'tnk' ? 'Tenecteplase (TNK)' : 'Alteplase (rtPA)'
      const doseStr = dosage.drug === 'tnk'
        ? `${dosage.dose?.total} mg bolo único`
        : `${dosage.dose?.total} mg total (bolo ${dosage.dose?.bolo} mg + infusión ${dosage.dose?.infusion} mg)`
      return {
        icon: 'check',
        iconBg: 'bg-emerald-100',
        borderColor: 'border-emerald-500',
        title: 'Trombolisis indicada',
        body: `${drugName} — ${doseStr}. Protocolo completo registrado.`,
      }
    }
    if (contraindications?.hasRelative && contraindications?.decidedNotToThrombolyze) {
      return {
        icon: 'warning',
        iconBg: 'bg-amber-100',
        borderColor: 'border-amber-400',
        title: 'No candidato a trombolisis IV — contraindicación relativa',
        body: 'Decisión de no trombolizar. Se descartó OGV. Continuar con manejo de soporte y monitoreo.',
      }
    }
    if (contraindications?.hasRelative) {
      return {
        icon: 'warning',
        iconBg: 'bg-amber-100',
        borderColor: 'border-amber-400',
        title: 'Contraindicación relativa — valorar riesgo/beneficio',
        body: 'Interconsulta con coordinación antes de proceder. Decisión individualizada.',
      }
    }
    return {
      icon: 'check',
      iconBg: 'bg-emerald-100',
      borderColor: 'border-emerald-500',
      title: 'Fase inicial completa',
      body: 'Datos registrados. Continuar con evaluación para trombolisis.',
    }
  }

  function getSelectedSymptomsSummary() {
    const selectedSymptoms = symptoms?.symptoms
      ? Object.entries(symptoms.symptoms)
        .filter(([, value]) => value)
        .map(([key]) => SYMPTOM_LABELS[key] ?? key)
      : []

    return selectedSymptoms.length ? selectedSymptoms.join(', ') : 'No registrado'
  }

  function getContraSummary() {
    if (!contraindications) return 'No registrado'
    if (contraindications.hasAbsolute) return 'Contraindicacion absoluta presente'
    if (contraindications.hasRelative) return contraindications.decidedNotToThrombolyze
      ? 'Contraindicacion relativa: no trombolizar'
      : 'Contraindicacion relativa: trombolisis con precaucion'
    return 'Sin contraindicaciones registradas'
  }

  function getDoseSummary() {
    if (!dosage) return 'No administrada / no registrada'
    if (dosage.drug === 'tnk') return `Tenecteplase ${dosage.dose?.total ?? '-'} mg bolo IV`
    return `Alteplase ${dosage.dose?.total ?? '-'} mg total: bolo ${dosage.dose?.bolo ?? '-'} mg + infusion ${dosage.dose?.infusion ?? '-'} mg`
  }

  function getImagingSummary() {
    if (!ctResult) return 'No registrado'
    if (ctResult.bleeding === true) return 'TC con hemorragia intracraneal'
    if (ctResult.bleeding === false) return 'TC sin hemorragia'
    if (ctResult.mismatch === true) return 'RMN con mismatch FLAIR-DWI'
    if (ctResult.mismatch === false) return 'RMN sin mismatch'
    return 'Imagen registrada'
  }

  if (step === STEP.START) {
    return <StartStep onStart={handleStart} onResume={handleResume} />
  }

  const done = step === STEP.DONE ? getDoneContent() : null

  return (
    <div
      className="min-h-[100dvh] bg-gray-50 flex flex-col"
      style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <GlobalTimer startTime={timerStart} />

      {/* Sticky header */}
      <div className="bg-brand-600 sticky top-0 z-50">
        {/* Mobile header row — patient name + reset */}
        {patient ? (
          <div className="pl-12 pr-4 py-3 flex items-center justify-between gap-3 md:hidden">
            <div className="min-w-0 flex-1">
              <p className="text-brand-300 text-xs uppercase tracking-wider leading-none mb-0.5">Código Stroke</p>
              <p className="text-white font-semibold text-sm truncate leading-tight">{patient.name}</p>
            </div>
            <p className="text-brand-300 text-xs leading-tight flex-shrink-0">DNI {patient.dni}</p>
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              title="Reiniciar protocolo"
              aria-label="Reiniciar protocolo"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        ) : (
          <div className="pl-12 pr-4 py-3 flex items-center md:hidden">
            <p className="text-white font-bold text-sm tracking-wide">Código Stroke</p>
          </div>
        )}

        {/* Desktop header row — thin brand bar only */}
        <div className="hidden md:flex px-5 py-2.5 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
            <span className="text-white font-bold text-sm tracking-wide">Código Stroke</span>
          </div>
          {patient && (
            <button
              type="button"
              onClick={handleReset}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20"
              title="Reiniciar protocolo"
              aria-label="Reiniciar protocolo"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        {/* Mobile timestamp strip */}
        {patient && step > STEP.ALERT && (
          <div className="md:hidden">
            <TimestampPanel
              variant="mobile"
              arrival={patientArrivalTime}
              ct={ctRequestTime}
              thrombolytic={thrombolyticStartTime}
              angio={angioRequestTime}
            />
          </div>
        )}
      </div>

      {/* Mobile-only fixed sidebar */}
      {patient && (
        <div className="md:hidden">
          <StepTimeline
            currentStep={step}
            completedSteps={sidebarCompletedSteps}
            onStepClick={handleSidebarStepClick}
          />
        </div>
      )}

      {/* Botones de registros rápidos — fijos en el costado derecho */}
      {patient && step > STEP.ALERT && (
        <div className="fixed right-3 top-1/3 z-40">
          <QuickAddFAB
            onAddNihss={handleAddNihss}
            onAddVitals={handleAddVitals}
            onAddGlucose={handleAddGlucose}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Botón flotante — ACV fuera de ventana */}
      {step > STEP.ALERT && (
        <button
          type="button"
          onClick={() => setShowOutOfWindow(true)}
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          className="fixed left-14 z-40 flex items-center gap-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold px-4 py-3 min-h-[44px] rounded-full shadow-lg transition-all md:hidden"
        >
          <Clock size={14} />
          Fuera de ventana
        </button>
      )}

      {/* Modal ACV fuera de ventana */}
      {showOutOfWindow && (
        <OutOfWindowModal
          patient={patient}
          onClose={() => setShowOutOfWindow(false)}
          onSave={(data) => console.info('OutOfWindow:', data)}
        />
      )}

      {/* Body — two-column on desktop */}
      <div className={`flex-1 flex flex-col ${step === STEP.PATIENT ? 'justify-center' : ''} md:grid md:items-start ${patient ? 'md:grid-cols-[248px_minmax(0,1fr)]' : 'md:grid-cols-1'} w-full md:gap-8 md:px-6 lg:px-9 md:pt-5`}>

        {/* Desktop sidebar */}
        {patient && (
          <div className="hidden md:flex md:flex-col md:sticky md:top-[48px] md:self-start md:max-h-[calc(100vh-48px)] md:overflow-y-auto md:pr-1">
            {/* Patient card */}
            <div className="rounded-lg bg-white/70 border border-gray-200/70 p-3.5 mb-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Paciente</p>
              <p className="font-semibold text-gray-800 text-sm leading-snug">{patient.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">DNI {patient.dni}</p>
              {patientId && (
                <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID del caso</p>
                  <p className="text-xs font-mono font-bold text-brand-600 tracking-widest mt-0.5">{patientId}</p>
                </div>
              )}
            </div>

            {step > STEP.ALERT && (
              <button
                type="button"
                onClick={() => setShowOutOfWindow(true)}
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-700 px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 active:scale-[0.99]"
              >
                <Clock size={14} />
                Fuera de ventana
              </button>
            )}

            <StepTimeline
              variant="desktop"
              currentStep={step}
              completedSteps={sidebarCompletedSteps}
              onStepClick={handleSidebarStepClick}
            />
            <TimestampPanel
              variant="desktop"
              arrival={patientArrivalTime}
              ct={ctRequestTime}
              thrombolytic={thrombolyticStartTime}
              angio={angioRequestTime}
            />
          </div>
        )}

        {/* Main content */}
      <div className={`${patient ? 'pl-12 pr-3' : 'px-3'} md:px-0 md:min-w-0 w-full md:max-w-4xl md:mx-auto pt-4 md:pt-0 space-y-3 lg:space-y-3.5`}>
          {step >= STEP.PATIENT && (
            <div className={step > STEP.ALERT ? 'md:hidden' : ''}>
              <PatientStep
                onConfirm={handlePatientConfirm}
                confirmed={step > STEP.ALERT}
                patient={patient}
                patientId={patientId}
                arrivalTime={patientArrivalTime}
              />
            </div>
          )}

          {step === STEP.ALERT && patient && (
            <AlertModal
              patient={patient}
              onConfirm={handleAlertConfirm}
              onClose={() => setStep(STEP.PATIENT)}
            />
          )}

          {protocolUnlocked && (
            <div ref={symptomsRef}>
              <SymptomsStep onConfirm={handleSymptomsConfirm} />
            </div>
          )}

          {protocolUnlocked && (
            <div ref={vitalsRef}>
              <VitalsStep onConfirm={handleVitalsConfirm} />
            </div>
          )}

          {protocolUnlocked && (
            <div ref={nihssRef}>
              <NihssStep onConfirm={handleNihssConfirm} />
            </div>
          )}

          {protocolUnlocked && (
            <div ref={instructionsRef}>
              <InstructionsStep onConfirm={handleInstructionsConfirm} />
            </div>
          )}

          {step >= STEP.CT_RESULT && (
            <div ref={ctResultRef}>
              {symptoms?.isWakeUpStroke
                ? <MRIResultStep onConfirm={handleMRIResultConfirm} />
                : (
                  <CTResultStep
                    onConfirm={handleCtResultConfirm}
                    initialCtRequestTime={ctRequestTime}
                    onCtRequest={handleCtRequest}
                  />
                )
              }
            </div>
          )}

          {step >= STEP.CONTRAINDICATIONS && thrombolysisPathActive && (
            <div ref={contraindicationsRef}>
              <ContraindicationsStep onConfirm={handleContraindicationsConfirm} />
            </div>
          )}

          {step >= STEP.DOSAGE && thrombolysisPathActive && !contraindications?.hasAbsolute && !contraindications?.decidedNotToThrombolyze && (
            <div ref={dosageRef}>
              <DosageStep
                onConfirm={handleDosageConfirm}
                thrombolyticStartTime={thrombolyticStartTime}
                onThrombolyticStart={handleThrombolyticStart}
                onAddNihss={handleAddNihss}
              />
            </div>
          )}

          {step >= STEP.THROMBECTOMY && (
            <div ref={thrombectomyRef}>
              <ThrombectomyStep
                nihssScore={nihss?.nihssScore ?? 0}
                isWakeUpStroke={symptoms?.isWakeUpStroke ?? false}
                onConfirm={handleThrombectomyConfirm}
                angioRequestTime={angioRequestTime}
                onAngioRequest={handleAngioRequest}
                thrombectomyActivationTime={thrombectomyActivationTime}
                onThrombectomyActivation={handleThrombectomyActivation}
              />
            </div>
          )}

          {step === STEP.DONE && done && (
            <div ref={doneRef} className="px-4 pb-4 animate-slide-down">

              {/* Outcome banner — always visible */}
              <div className={`bg-white rounded-xl border-l-4 ${done.borderColor} shadow-sm p-6 mb-3`}>
                <div className={`w-14 h-14 ${done.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {done.icon === 'check' && <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                  {done.icon === 'error' && <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
                  {done.icon === 'warning' && <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
                  {done.icon === 'moon' && <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
                </div>
                <h2 className="font-display text-gray-800 text-xl text-center mb-2">{done.title}</h2>
                <p className="text-sm text-gray-500 text-center leading-relaxed">{done.body}</p>
                {timerStart && (
                  <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-gray-400">Inicio del código</p>
                    <p className="text-sm font-mono font-semibold text-gray-700 mt-0.5">
                      {timerStart.toLocaleTimeString('es-AR')}
                    </p>
                  </div>
                )}
              </div>

              {!caseSaved ? (
                /* PRE-SAVE: only the save button */
                <div className="space-y-3">
                  <p className="text-center text-sm text-gray-500 px-2">
                    Guardá el caso para acceder al resumen clínico y copiarlo.
                  </p>
                  <button
                    type="button"
                    onClick={handleSaveCase}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold py-5 rounded-xl transition-all text-base shadow-md"
                  >
                    Guardar y finalizar caso
                  </button>
                </div>
              ) : (
                /* POST-SAVE: full summary + copy + new protocol */
                <div className="space-y-3">
                  <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Resumen del caso</p>
                        <h2 className="mt-1 text-xl font-bold text-gray-900">{patient?.name ?? 'Paciente'}</h2>
                        <p className="text-sm text-gray-500">DNI {patient?.dni ?? '-'} · Caso {patientId || '-'}</p>
                      </div>
                      <div className="rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-right">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">Estado final</p>
                        <p className="text-sm font-semibold text-brand-700">{done.title}</p>
                      </div>
                    </div>
                  </div>

                  <SummarySection title="Tiempos">
                    <SummaryRow label="Ingreso" value={fmtDateTime(patientArrivalTime)} tone="blue" />
                    <SummaryRow label="Inicio codigo" value={fmtDateTime(timerStart)} tone="blue" />
                    <SummaryRow label="Ultima vez asintomatico" value={fmtDateTime(symptoms?.lastSeenNormal)} tone="orange" />
                    <SummaryRow label="Solicitud TC" value={fmtDateTime(ctRequestTime)} tone="blue" />
                    <SummaryRow label="Inicio trombolitico" value={fmtDateTime(thrombolyticStartTime)} tone={thrombolyticStartTime ? 'green' : 'gray'} />
                    <SummaryRow label="Angio / trombectomia" value={fmtDateTime(angioRequestTime || thrombectomyActivationTime)} tone={angioRequestTime || thrombectomyActivationTime ? 'blue' : 'gray'} />
                  </SummarySection>

                  <SummarySection title="Evaluacion inicial">
                    <SummaryRow label="Sintomas" value={getSelectedSymptomsSummary()} tone="orange" />
                    <SummaryRow label="Ventana / OGV" value={symptoms?.isWakeUpStroke ? 'ACV del despertar / evaluar imagen' : 'Segun horario registrado'} tone="orange" />
                    <SummaryRow label="TA" value={vitals ? `${vitals.systolic}/${vitals.diastolic} mmHg` : 'No registrado'} tone="blue" />
                    <SummaryRow label="Glucemia" value={vitals ? `${vitals.glucose} mg/dL` : 'No registrado'} tone="blue" />
                    <SummaryRow label="NIHSS" value={nihss ? `${nihss.nihssScore} puntos${nihss.hasDisablingSymptoms ? ' + deficit discapacitante' : ''}` : 'No registrado'} tone="orange" />
                    <SummaryRow label="Anticoagulacion" value={symptoms?.anticoagulation?.active ? `Si: ${symptoms.anticoagulation.type || 'tipo no registrado'}` : symptoms?.anticoagulation ? 'No' : 'No registrado'} tone={symptoms?.anticoagulation?.active ? 'red' : 'green'} />
                  </SummarySection>

                  <SummarySection title="Imagen y decisiones">
                    <SummaryRow label="Imagen" value={getImagingSummary()} tone={ctResult?.bleeding ? 'red' : 'blue'} />
                    <SummaryRow label="Contraindicaciones" value={getContraSummary()} tone={contraindications?.hasAbsolute ? 'red' : contraindications?.hasRelative ? 'orange' : 'green'} />
                    <SummaryRow label="Trombolisis" value={getDoseSummary()} tone={dosage ? 'green' : 'gray'} />
                    <SummaryRow label="Peso" value={dosage?.weight ? `${dosage.weight} kg` : 'No registrado'} tone={dosage?.weight ? 'green' : 'gray'} />
                    <SummaryRow label="AngioTAC" value={thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'} tone={thrombectomy?.angioRequested ? 'blue' : 'gray'} />
                    <SummaryRow label="ASPECTS" value={thrombectomy?.aspectScore ?? 'No registrado'} tone={thrombectomy?.aspectScore !== undefined ? 'blue' : 'gray'} />
                  </SummarySection>

                  {(nihssReadings.length > 0 || vitalsReadings.length > 0 || glucoseReadings.length > 0) && (
                    <SummarySection title="Registros rapidos">
                      <SummaryRow label="NIHSS adicionales" value={nihssReadings.length ? nihssReadings.map((r) => `${r.score} (${fmtTime(r.timestamp)})`).join(', ') : 'Sin registros'} tone="orange" />
                      <SummaryRow label="TA adicionales" value={vitalsReadings.length ? vitalsReadings.map((r) => `${r.systolic}/${r.diastolic} (${fmtTime(r.timestamp)})`).join(', ') : 'Sin registros'} tone="blue" />
                      <SummaryRow label="Glucemias adicionales" value={glucoseReadings.length ? glucoseReadings.map((r) => `${r.value} (${fmtTime(r.timestamp)})`).join(', ') : 'Sin registros'} tone="blue" />
                    </SummarySection>
                  )}

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all active:scale-95 border-2 ${
                      copied
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {copied
                      ? <><Check size={16} className="text-emerald-500" /> Resumen copiado</>
                      : <><Copy size={16} /> Copiar resumen clinico</>
                    }
                  </button>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center">
                    <p className="text-sm font-semibold text-emerald-800">Caso guardado correctamente</p>
                    <p className="text-xs text-emerald-600 mt-1">ID: {patientId || eventId.slice(0, 8).toUpperCase()}</p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="mt-3 w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-95"
                    >
                      Nuevo protocolo
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
      </div>
    </div>
  )
}
