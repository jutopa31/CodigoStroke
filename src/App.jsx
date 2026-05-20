import { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import GlobalTimer from './components/GlobalTimer'
import AlertModal from './components/AlertModal'
import StepTimeline from './components/StepTimeline'
import StepProgressProvider from './components/StepProgressProvider'
import QuickAddFAB from './components/QuickAddFAB'
import OutOfWindowModal from './components/OutOfWindowModal'
import StartStep from './steps/StartStep'
import PatientStep from './steps/PatientStep'
import TimeStep from './steps/TimeStep'
import SymptomsNihssStep from './steps/SymptomsNihssStep'
import CTResultStep from './steps/CTResultStep'
import MRIResultStep from './steps/MRIResultStep'
import ContraindicationsStep from './steps/ContraindicationsStep'
import DosageStep from './steps/DosageStep'
import ThrombectomyStep from './steps/ThrombectomyStep'
import TimestampPanel from './components/TimestampPanel'
import AnticoagModal from './components/AnticoagModal'
import AvisoModal from './components/AvisoModal'
import VitalsModal from './components/VitalsModal'
import { saveStrokeEvent, generatePatientId, saveSession } from './lib/storage'
import { getNihssSeverity } from './content/nihss'
import { sendStrokeAlert } from './lib/emailService'

const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,
  TIME: 3,
  VITALS: 4,
  NIHSS_SYMPTOMS: 5,
  CT_RESULT: 6,
  CONTRAINDICATIONS: 7,
  DOSAGE: 8,
  THROMBECTOMY: 9,
  DONE: 10,
}

const SIDEBAR_VALUES = [1, 3, 5, 6, 7, 8, 9]

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
    gray: 'bg-neutral-50 text-neutral-700',
    blue: 'bg-blue-50/50 text-blue-700',
    green: 'bg-emerald-50/50 text-emerald-700',
    orange: 'bg-amber-50/50 text-amber-700',
    red: 'bg-red-50/50 text-red-700',
  }[tone]

  return (
    <div className={`rounded-xl px-3 py-2.5 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">{label}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug">{value ?? 'No registrado'}</p>
    </div>
  )
}

function SummarySection({ title, children }) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-100 px-4 py-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">{title}</h3>
      <div className="grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  )
}

function FloatingProtocolNav({
  onBack,
  onForward,
  canGoBack,
  canGoForward,
  forwardLabel,
}) {
  return (
    <div className="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] right-3 z-50 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-elevated backdrop-blur-md md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        title="Volver al paso anterior"
        aria-label="Volver al paso anterior"
        className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={18} strokeWidth={2.4} />
        <span className="hidden sm:inline">Atras</span>
      </button>
      <button
        type="button"
        onClick={onForward}
        disabled={!canGoForward}
        title={forwardLabel}
        aria-label={forwardLabel}
        className="flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
      >
        <span className="hidden sm:inline">Adelante</span>
        <ChevronRight size={18} strokeWidth={2.4} />
      </button>
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
  const [showAnticoagModal, setShowAnticoagModal] = useState(false)
  const [showAvisoModal, setShowAvisoModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showVitalsModal, setShowVitalsModal] = useState(false)
  const [caseSaved, setCaseSaved] = useState(false)

  const timeRef = useRef(null)
  const vitalsRef = useRef(null)
  const nihssRef = useRef(null)
  const ctResultRef = useRef(null)
  const contraindicationsRef = useRef(null)
  const dosageRef = useRef(null)
  const thrombectomyRef = useRef(null)
  const doneRef = useRef(null)

  function scrollTo(ref) {
    setTimeout(() => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const headerOffset = 80
      // Skip scroll if element is already fully visible — prevents unwanted upward
      // scrolling on desktop when a collapsing step makes the next step appear in viewport
      if (rect.top >= headerOffset && rect.bottom <= window.innerHeight) return
      const targetY = window.scrollY + rect.top - headerOffset
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' })
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
    function activateMockComplete() {
      const now = new Date()
      const mockPatientId = generatePatientId(MOCK_PATIENT.name, MOCK_PATIENT.dni)
      const ago = (mins) => new Date(now.getTime() - mins * 60000)
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

      // 5 escenarios clínicos aleatorios
      const scenario = Math.floor(Math.random() * 5)

      const arrivalTime = ago(45 + Math.floor(Math.random() * 20))
      const startTime   = ago(40 + Math.floor(Math.random() * 15))

      // Síntomas aleatorios (1-3 síntomas)
      const symptomKeys = ['weakness', 'speech', 'vision', 'ataxia', 'other']
      const numSymp = 1 + Math.floor(Math.random() * 3)
      const shuffled = [...symptomKeys].sort(() => Math.random() - 0.5)
      const selectedSymptoms = Object.fromEntries(shuffled.slice(0, numSymp).map((k) => [k, true]))

      const isWakeUp = scenario === 3 || scenario === 4
      const lastSeenMins = isWakeUp
        ? 330 + Math.floor(Math.random() * 150)   // 5.5–8h → ventana WakeUp
        : 60  + Math.floor(Math.random() * 120)   // 1–3h   → ventana estándar
      const lastSeenDate = ago(lastSeenMins)
      const pad = (n) => String(n).padStart(2, '0')
      const lastSeenNormal = `${lastSeenDate.getFullYear()}-${pad(lastSeenDate.getMonth() + 1)}-${pad(lastSeenDate.getDate())}T${pad(lastSeenDate.getHours())}:${pad(lastSeenDate.getMinutes())}`

      const symptomsData = {
        symptoms: selectedSymptoms,
        lastSeenNormal,
        isWakeUpStroke: isWakeUp,
        anticoagulation: { active: false, type: '' },
        modifiedRankinScale: { score: Math.floor(Math.random() * 4), label: 'Mock mRS' },
      }

      const vitalsData = {
        systolic: 130 + Math.floor(Math.random() * 50),
        diastolic: 80  + Math.floor(Math.random() * 30),
        glucose:   90  + Math.floor(Math.random() * 60),
      }

      const nihssScore = scenario === 1 ? 1 + Math.floor(Math.random() * 3) : 6 + Math.floor(Math.random() * 14)
      const nihssData = { nihssScore, hasDisablingSymptoms: nihssScore < 5 && Math.random() > 0.5 }

      const weight = 60 + Math.floor(Math.random() * 31) // 60–90 kg
      const ctReqTime = ago(22 + Math.floor(Math.random() * 10))

      const RED_IDS   = ['prior_ich','large_infarct','tce','axial_tumor','coagulopathy','aortic_dissection','endocarditis']
      const ORANGE_IDS = ['prev_stroke','major_surgery','acod','gi_bleed','arterial_puncture','avm','aneurysm','ic_dissection']
      const allNo = (ids) => Object.fromEntries(ids.map((k) => [k, false]))

      const rtpaDose = (w) => {
        const total = Math.round(w * 0.9 * 10) / 10
        const bolo  = Math.round(total * 0.1 * 10) / 10
        return { total, bolo, infusion: Math.round((total - bolo) * 10) / 10 }
      }

      let ctResultData, contraindicationsData = null, dosageData = null
      let thrombolyticStart = null, angioReqTime = null, thrombectomyActTime = null
      let thrombectomyData = null

      if (scenario === 0) {
        // Trombolisis + trombectomía estándar
        ctResultData = { bleeding: false, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }
        contraindicationsData = { red: allNo(RED_IDS), orange: allNo(ORANGE_IDS), hasAbsolute: false, hasRelative: false, decidedNotToThrombolyze: false }
        thrombolyticStart = ago(10)
        dosageData = { drug: 'rtpa', weight, dose: rtpaDose(weight), checklist: {}, thrombolyticStartTime: thrombolyticStart.toISOString() }
        angioReqTime = ago(8); thrombectomyActTime = ago(5)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 7 + Math.floor(Math.random() * 3), thrombectomyActivationTime: thrombectomyActTime.toISOString() }

      } else if (scenario === 1) {
        // Hemorragia en TC → fin inmediato
        ctResultData = { bleeding: true, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }

      } else if (scenario === 2) {
        // Contraindicación absoluta → trombectomía sin trombolisis
        ctResultData = { bleeding: false, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }
        const redAnswers = { ...allNo(RED_IDS), prior_ich: true }
        contraindicationsData = { red: redAnswers, orange: allNo(ORANGE_IDS), hasAbsolute: true, hasRelative: false, decidedNotToThrombolyze: false }
        angioReqTime = ago(8)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 8, thrombectomyActivationTime: null }

      } else if (scenario === 3) {
        // WakeUp Stroke con mismatch → trombolisis + trombectomía
        ctResultData = { mismatch: true, mriRequestTime: ctReqTime.toISOString(), mriElapsedSeconds: 900 }
        contraindicationsData = { red: allNo(RED_IDS), orange: allNo(ORANGE_IDS), hasAbsolute: false, hasRelative: false, decidedNotToThrombolyze: false }
        thrombolyticStart = ago(10)
        dosageData = { drug: pick(['rtpa','tnk']), weight, dose: rtpaDose(weight), checklist: {}, thrombolyticStartTime: thrombolyticStart.toISOString() }
        angioReqTime = ago(8); thrombectomyActTime = ago(5)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 7 + Math.floor(Math.random() * 3), thrombectomyActivationTime: thrombectomyActTime.toISOString() }

      } else {
        // scenario 4: WakeUp Stroke sin mismatch → trombectomía directa
        ctResultData = { mismatch: false, mriRequestTime: ctReqTime.toISOString(), mriElapsedSeconds: 900 }
        angioReqTime = ago(8)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 6 + Math.floor(Math.random() * 4), thrombectomyActivationTime: ago(5).toISOString() }
      }

      setPatient(MOCK_PATIENT)
      setPatientId(mockPatientId)
      setPatientArrivalTime(arrivalTime)
      setTimerStart(startTime)
      setCtRequestTime(ctReqTime)
      setAngioRequestTime(angioReqTime)
      setThrombolyticStartTime(thrombolyticStart)
      setThrombectomyActivationTime(thrombectomyActTime)
      setSymptoms(symptomsData)
      setVitals(vitalsData)
      setNihss(nihssData)
      setCtResult(ctResultData)
      setContraindications(contraindicationsData)
      setDosage(dosageData)
      setThrombectomy(thrombectomyData)
      setCaseSaved(false)
      setStep(STEP.DONE)

      setTimeout(() => {
        doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === 'evaluacion') {
      activateMockComplete()
    }

    function handleDevShortcut(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        activateMockComplete()
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
    setStep(STEP.TIME)
  }

  function handlePatientConfirm(data) {
    const now = new Date()
    setPatient(data)
    setPatientArrivalTime(now)
    setPatientId(generatePatientId(data.name, data.dni))
    setStep(STEP.ALERT)
    setShowAlertModal(true)
  }

  function handleAlertConfirm() {
    setShowAlertModal(false)
    setShowVitalsModal(true)
  }

  function handleAlertClose() {
    setShowAlertModal(false)
    setStep(STEP.PATIENT)
  }


  async function handleVitalsModalConfirm(vitalsData) {
    const now = new Date()
    setVitals(vitalsData)
    setShowVitalsModal(false)
    setTimerStart(now)
    setStep(STEP.TIME)
    scrollTo(timeRef)

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

  function handleTimeConfirm(data) {
    setSymptoms((prev) => ({ ...prev, ...data }))
    advanceTo(STEP.NIHSS_SYMPTOMS)
    scrollTo(nihssRef)
  }

  function handleSymptomsNihssConfirm(data) {
    const nihssData = { nihssScore: data.nihssScore, hasDisablingSymptoms: data.hasDisablingSymptoms }
    setNihss(nihssData)
    setSymptoms((prev) => ({ ...prev, symptoms: data.symptoms }))
    setShowAnticoagModal(true)
  }

  function handleAnticoagConfirm(anticoag) {
    setSymptoms((prev) => ({ ...prev, anticoagulation: anticoag }))
    setShowAnticoagModal(false)
    const nihssScore = nihss?.nihssScore ?? 0
    const hasDisabling = nihss?.hasDisablingSymptoms ?? false
    const indicated = nihssScore >= 5 || hasDisabling
    if (indicated) {
      setShowAvisoModal(true)
    } else {
      advanceTo(STEP.CT_RESULT)
      scrollTo(ctResultRef)
    }
  }

  function handleAvisoClose() {
    setShowAvisoModal(false)
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
      const indicated = (nihss?.nihssScore ?? 0) >= 5 || nihss?.hasDisablingSymptoms === true
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
    if (data.mismatch && !symptoms?.anticoagulation?.active) {
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
      3: timeRef,
      4: vitalsRef,
      5: nihssRef,
      6: ctResultRef,
      7: contraindicationsRef,
      8: dosageRef,
      9: thrombectomyRef,
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
      `mRS previo:      ${symptoms?.modifiedRankinScale ? `${symptoms.modifiedRankinScale.score} - ${symptoms.modifiedRankinScale.label}` : 'No registrado'}`,
      ``,
      `--- IMAGEN Y DECISIONES ---`,
      `Imagen:            ${getImagingSummary()}`,
      `Contraindicaciones:${getContraSummary()}`,
      `Trombolisis:       ${getDoseSummary()}`,
      `Peso:              ${dosage?.weight ? `${dosage.weight} kg` : 'No registrado'}`,
      `AngioTAC:          ${thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'}`,
      `ASPECTS:           ${ctResult?.aspectScore ?? thrombectomy?.aspectScore ?? 'No registrado'}`,
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
  const protocolUnlocked = step >= STEP.TIME

  // Trombolisis potencialmente indicada: NIHSS≥5, o NIHSS<5 con síntomas discapacitantes,
  // o wake-up con mismatch positivo en RMN
  const thrombolysisPathActive = !ctResult?.bleeding && (
    symptoms?.isWakeUpStroke
      ? ctResult?.mismatch === true
      : (nihss?.nihssScore >= 5 || nihss?.hasDisablingSymptoms === true)
  ) && !symptoms?.anticoagulation?.active

  function getProtocolPath() {
    const path = [
      { step: STEP.PATIENT, target: 'top', label: 'Datos del paciente' },
      { step: STEP.TIME, target: 'time', label: 'Tiempo de sintomas' },
      { step: STEP.NIHSS_SYMPTOMS, target: 'nihss', label: 'Sintomas / NIHSS' },
      { step: STEP.CT_RESULT, target: 'ctResult', label: symptoms?.isWakeUpStroke ? 'RMN de encefalo' : 'TAC de encefalo' },
    ]

    if (thrombolysisPathActive) {
      path.push({ step: STEP.CONTRAINDICATIONS, target: 'contraindications', label: 'Contraindicaciones' })

      if (!contraindications?.hasAbsolute && !contraindications?.decidedNotToThrombolyze) {
        path.push({ step: STEP.DOSAGE, target: 'dosage', label: 'Dosis trombolitico' })
      }
    }

    path.push({ step: STEP.THROMBECTOMY, target: 'thrombectomy', label: 'Trombectomia' })
    path.push({ step: STEP.DONE, target: 'done', label: 'Resumen final' })
    return path
  }

  function getNextMissingTarget() {
    if (!symptoms?.lastSeenNormal) {
      return { step: STEP.TIME, target: 'time', label: 'Completar tiempo de sintomas' }
    }
    if (!nihss) {
      return { step: STEP.NIHSS_SYMPTOMS, target: 'nihss', label: 'Completar sintomas / NIHSS' }
    }
    if (!symptoms?.anticoagulation) {
      return { step: STEP.NIHSS_SYMPTOMS, target: 'nihss', label: 'Completar anticoagulacion' }
    }
    if (!ctResult) {
      return { step: STEP.CT_RESULT, target: 'ctResult', label: symptoms?.isWakeUpStroke ? 'Completar RMN' : 'Completar TAC' }
    }
    if (thrombolysisPathActive && !contraindications) {
      return { step: STEP.CONTRAINDICATIONS, target: 'contraindications', label: 'Completar contraindicaciones' }
    }
    if (
      thrombolysisPathActive &&
      !contraindications?.hasAbsolute &&
      !contraindications?.decidedNotToThrombolyze &&
      !dosage
    ) {
      return { step: STEP.DOSAGE, target: 'dosage', label: 'Completar dosis trombolitico' }
    }
    if (!ctResult?.bleeding && !thrombectomy) {
      return { step: STEP.THROMBECTOMY, target: 'thrombectomy', label: 'Completar trombectomia' }
    }
    return null
  }

  function goToProtocolTarget(target) {
    if (!target) return
    if (target.step > step) {
      setStep(target.step)
    }

    const refMap = {
      time: timeRef,
      nihss: nihssRef,
      ctResult: ctResultRef,
      contraindications: contraindicationsRef,
      dosage: dosageRef,
      thrombectomy: thrombectomyRef,
      done: doneRef,
    }
    const ref = refMap[target.target]

    if (ref) {
      scrollTo(ref)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function handleProtocolBack() {
    const path = getProtocolPath()
    const currentIndex = path.findIndex((item) => item.step === step)
    const fallbackIndex = path.reduce((last, item, index) => (item.step < step ? index : last), 0)
    const targetIndex = Math.max(0, (currentIndex >= 0 ? currentIndex : fallbackIndex) - 1)
    const target = path[targetIndex]

    if (showAlertModal) setShowAlertModal(false)
    if (showVitalsModal) setShowVitalsModal(false)
    if (showAnticoagModal) setShowAnticoagModal(false)
    if (showAvisoModal) setShowAvisoModal(false)

    setStep(target.step)
    goToProtocolTarget(target)
  }

  function handleProtocolForward() {
    goToProtocolTarget(getNextMissingTarget())
  }

  const nextMissingTarget = getNextMissingTarget()
  const canUseProtocolNav = patient && step > STEP.ALERT
  const protocolPath = getProtocolPath()
  const currentProtocolIndex = protocolPath.findIndex((item) => item.step === step)
  const canGoBack = canUseProtocolNav && (currentProtocolIndex > 0 || step > STEP.PATIENT)

  const RED_CONTRA_LABELS = {
    prior_ich:         'Hemorragia intracraneal previa o actual',
    large_infarct:     'Infarto extenso en TC (ASPECTS < 3)',
    tce:               'TCE grave o cirugía intracraneal reciente',
    axial_tumor:       'Tumor intra-axial',
    coagulopathy:      'Coagulopatía severa',
    aortic_dissection: 'Disección aórtica',
    endocarditis:      'Endocarditis infecciosa activa',
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
    if (symptoms?.anticoagulation?.active && !dosage) {
      return {
        icon: 'warning',
        iconBg: 'bg-red-100',
        borderColor: 'border-red-400',
        title: 'Anticoagulacion activa',
        body: `Trombolisis IV contraindicada o condicionada por anticoagulacion (${symptoms.anticoagulation.type || 'tipo no registrado'}). Evaluar OGV/trombectomia y verificar ultima dosis, droga y laboratorio.`,
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
    if (contraindications.hasAbsolute) {
      const names = Object.entries(contraindications.red || {})
        .filter(([, v]) => v)
        .map(([k]) => RED_CONTRA_LABELS[k])
        .filter(Boolean)
      return names.length ? `Contraindicacion absoluta: ${names.join('; ')}` : 'Contraindicacion absoluta presente'
    }
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

  function renderDoneScreen({
    done, patient, patientId, eventId, timerStart,
    patientArrivalTime, ctRequestTime, thrombolyticStartTime,
    angioRequestTime, thrombectomyActivationTime,
    symptoms, vitals, nihss, ctResult, contraindications,
    dosage, thrombectomy, nihssReadings, vitalsReadings,
    glucoseReadings, onCopy, copied, onReset, summaryText,
    getSelectedSymptomsSummary, getContraSummary, getDoseSummary, getImagingSummary,
  }) {
    function handleShareWhatsApp() {
      const url = `https://wa.me/?text=${encodeURIComponent(summaryText)}`
      window.open(url, '_blank')
    }

    return (
      <div className="px-4 pb-4 animate-slide-down">
        <div className={`bg-white rounded-2xl border ${done.borderColor} p-6 mb-4`}>
          <div className={`w-12 h-12 ${done.iconBg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            {done.icon === 'check' && <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {done.icon === 'error' && <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
            {done.icon === 'warning' && <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
            {done.icon === 'moon' && <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>}
          </div>
          <h2 className="text-neutral-800 text-lg font-semibold text-center mb-2">{done.title}</h2>
          <p className="text-sm text-neutral-500 text-center leading-relaxed">{done.body}</p>
          {timerStart && (
            <div className="mt-4 bg-neutral-50 rounded-xl px-4 py-3 text-center">
              <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">Inicio del código</p>
              <p className="text-sm font-mono font-semibold text-neutral-700 mt-1">
                {timerStart.toLocaleTimeString('es-AR')}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-white border border-neutral-100 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Resumen del caso</p>
                <h2 className="mt-1 text-lg font-semibold text-neutral-800">{patient?.name ?? 'Paciente'}</h2>
                <p className="text-sm text-neutral-500">DNI {patient?.dni ?? '-'} · Caso {patientId || '-'}</p>
              </div>
              <div className="rounded-xl bg-brand-50 px-3 py-2 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-600">Estado final</p>
                <p className="text-sm font-medium text-brand-700">{done.title}</p>
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
            <SummaryRow label="mRS previo" value={symptoms?.modifiedRankinScale ? `${symptoms.modifiedRankinScale.score} - ${symptoms.modifiedRankinScale.label}` : 'No registrado'} tone="gray" />
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

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCopy}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98] border ${
                copied
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {copied
                ? <><Check size={16} className="text-emerald-500" /> Copiado</>
                : <><Copy size={16} /> Copiar</>
              }
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all active:scale-[0.98] border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
          </div>

          <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4 text-center">
            <p className="text-sm font-medium text-emerald-700">Caso guardado</p>
            <p className="text-xs text-emerald-600 mt-1">ID: {patientId || eventId.slice(0, 8).toUpperCase()}</p>
            <button
              type="button"
              onClick={onReset}
              className="mt-3 w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.98]"
            >
              Nuevo protocolo
            </button>
          </div>
        </div>
      </div>
    )
  }

  const done = step === STEP.DONE ? getDoneContent() : null

  useEffect(() => {
    if (step === STEP.DONE && !caseSaved) {
      const timeout = setTimeout(handleSaveCase, 0)
      return () => clearTimeout(timeout)
    }
  }, [step, caseSaved, handleSaveCase])

  if (step === STEP.START) {
    return <StartStep onStart={handleStart} onResume={handleResume} />
  }

  const latestNihss = nihssReadings.length > 0
    ? nihssReadings[nihssReadings.length - 1].score
    : nihss?.nihssScore ?? null
  const latestVitals = vitalsReadings.length > 0
    ? vitalsReadings[vitalsReadings.length - 1]
    : vitals ? { systolic: vitals.systolic, diastolic: vitals.diastolic } : null
  const latestGlucose = glucoseReadings.length > 0
    ? glucoseReadings[glucoseReadings.length - 1].value
    : vitals?.glucose ?? null

  return (
    <StepProgressProvider
      currentStep={step}
      completedSteps={sidebarCompletedSteps}
      onStepClick={handleSidebarStepClick}
    >
    <div
      className="min-h-[100dvh] bg-neutral-50 flex flex-col pt-14"
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <GlobalTimer
        startTime={timerStart}
        timestamps={{ ctRequest: ctRequestTime?.toISOString(), thrombolyticStart: thrombolyticStartTime?.toISOString() }}
        patient={patient}
        onReset={patient ? handleReset : undefined}
        progressPct={patient && step > STEP.ALERT && step < STEP.DONE
          ? (Math.min(step, STEP.THROMBECTOMY) / STEP.THROMBECTOMY) * 100
          : 0
        }
      />

      {/* Quick actions - bottom toolbar */}
      {patient && step > STEP.ALERT && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 px-3 pb-3 pt-2 shadow-elevated backdrop-blur-md md:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <QuickAddFAB
            variant="mobile-toolbar"
            onAddNihss={handleAddNihss}
            onAddVitals={handleAddVitals}
            onAddGlucose={handleAddGlucose}
            onOutOfWindow={() => setShowOutOfWindow(true)}
            latestNihss={latestNihss}
            latestVitals={latestVitals}
            latestGlucose={latestGlucose}
          />
        </div>
      )}

      {canUseProtocolNav && (
        <FloatingProtocolNav
          onBack={handleProtocolBack}
          onForward={handleProtocolForward}
          canGoBack={canGoBack}
          canGoForward={Boolean(nextMissingTarget)}
          forwardLabel={nextMissingTarget?.label ?? 'Protocolo completo'}
        />
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
      <div className={`flex-1 flex flex-col ${step === STEP.PATIENT ? 'justify-center' : ''} md:grid md:items-start ${patient ? 'md:grid-cols-[260px_minmax(0,1fr)]' : 'md:grid-cols-1'} w-full md:gap-8 md:px-6 lg:px-9 md:pt-6`}>

        {/* Desktop sidebar */}
        {patient && (
          <div className="hidden md:flex md:flex-col md:sticky md:top-[72px] md:self-start md:max-h-[calc(100vh-80px)] md:overflow-y-auto md:pr-1 gap-3">
            {/* Patient card */}
            <div className="rounded-2xl bg-white border border-neutral-100 p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-neutral-800 text-sm leading-snug">{patient.name}</p>
                {patientId && (
                  <p className="text-[10px] font-mono font-semibold text-brand-600 tracking-wider shrink-0">{patientId}</p>
                )}
              </div>
              <p className="text-xs text-neutral-400">DNI {patient.dni}</p>

              {(latestNihss !== null || latestVitals || latestGlucose !== null) && (
                <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2">
                  {latestNihss !== null && (() => {
                    const sev = getNihssSeverity(latestNihss)
                    return (
                      <div className={`rounded-lg px-2 py-1.5 text-center ${sev.bg}`}>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">NIHSS</p>
                        <p className={`text-sm font-bold tabular-nums ${sev.color}`}>{latestNihss}</p>
                      </div>
                    )
                  })()}
                  {latestVitals && (
                    <div className={`rounded-lg px-2 py-1.5 text-center ${latestVitals.systolic > 185 ? 'bg-red-50' : 'bg-blue-50/60'}`}>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">TA</p>
                      <p className={`text-xs font-bold tabular-nums ${latestVitals.systolic > 185 ? 'text-red-600' : 'text-blue-700'}`}>
                        {latestVitals.systolic}/{latestVitals.diastolic}
                      </p>
                    </div>
                  )}
                  {latestGlucose !== null && (
                    <div className={`rounded-lg px-2 py-1.5 text-center ${latestGlucose < 50 ? 'bg-red-50' : latestGlucose > 400 ? 'bg-orange-50' : 'bg-violet-50/60'}`}>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">GLC</p>
                      <p className={`text-xs font-bold tabular-nums ${latestGlucose < 50 ? 'text-red-600' : latestGlucose > 400 ? 'text-orange-600' : 'text-violet-700'}`}>
                        {latestGlucose}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {step > STEP.ALERT && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Registros rápidos</p>
                <QuickAddFAB
                  variant="sidebar"
                  onAddNihss={handleAddNihss}
                  onAddVitals={handleAddVitals}
                  onAddGlucose={handleAddGlucose}
                  onOutOfWindow={() => setShowOutOfWindow(true)}
                  latestNihss={latestNihss}
                  latestVitals={latestVitals}
                  latestGlucose={latestGlucose}
                />
              </div>
            )}

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Protocolo</p>
              <StepTimeline
                variant="desktop"
                currentStep={step}
                completedSteps={sidebarCompletedSteps}
                onStepClick={handleSidebarStepClick}
              />
            </div>

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
      <div className="relative w-full space-y-3 px-4 pt-4 md:mx-auto md:min-w-0 md:max-w-4xl md:px-0 md:pt-0 lg:space-y-4">
          {patient && (
            <div className="pointer-events-none absolute bottom-0 left-[22px] top-4 z-0 w-px bg-neutral-200 md:hidden" />
          )}
          {step >= STEP.PATIENT && (
            <div>
              <PatientStep
                onConfirm={handlePatientConfirm}
                confirmed={step > STEP.ALERT}
                isCollapsed={step >= STEP.CT_RESULT}
                patient={patient}
                patientId={patientId}
                arrivalTime={patientArrivalTime}
                vitals={vitals}
              />
            </div>
          )}

          {showAlertModal && patient && (
            <AlertModal
              patient={patient}
              onConfirm={handleAlertConfirm}
              onClose={handleAlertClose}
            />
          )}

          {protocolUnlocked && (
            <div ref={timeRef}>
              <TimeStep
                onConfirm={handleTimeConfirm}
                isCollapsed={step >= STEP.CT_RESULT}
              />
            </div>
          )}

          {protocolUnlocked && (
            <div ref={nihssRef}>
              <SymptomsNihssStep
                onConfirm={handleSymptomsNihssConfirm}
                isCollapsed={step >= STEP.CONTRAINDICATIONS}
              />
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
                    isCollapsed={step >= STEP.DOSAGE}
                  />
                )
              }
            </div>
          )}

          {step >= STEP.CONTRAINDICATIONS && thrombolysisPathActive && (
            <div ref={contraindicationsRef}>
              <ContraindicationsStep
                onConfirm={handleContraindicationsConfirm}
                isCollapsed={step >= STEP.THROMBECTOMY}
              />
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
                initialAspectScore={null}
              />
            </div>
          )}

          <VitalsModal isOpen={showVitalsModal} onConfirm={handleVitalsModalConfirm} />
          <AnticoagModal isOpen={showAnticoagModal} onConfirm={handleAnticoagConfirm} />
          <AvisoModal isOpen={showAvisoModal} onClose={handleAvisoClose} />

          {step === STEP.DONE && done && (
            <div ref={doneRef}>
              {renderDoneScreen({
              done,
              patient,
              patientId,
              eventId,
              timerStart,
              patientArrivalTime,
              ctRequestTime,
              thrombolyticStartTime,
              angioRequestTime,
              thrombectomyActivationTime,
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
              onCopy: handleCopy,
              copied,
              onReset: handleReset,
              summaryText: buildSummaryText(),
              getSelectedSymptomsSummary,
              getContraSummary,
              getDoseSummary,
              getImagingSummary,
              })}
            </div>
          )}
      </div>
      </div>
    </div>
    </StepProgressProvider>
  )
}
