import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Copy, Check, Syringe } from 'lucide-react'
import GlobalTimer from './components/GlobalTimer'
import AlertModal from './components/AlertModal'
import TabBar from './components/TabBar'
import DecisionButton from './components/DecisionButton'
import QuickAddFAB from './components/QuickAddFAB'
import TimestampPanel from './components/TimestampPanel'
import OutOfWindowModal from './components/OutOfWindowModal'
import EducationalOverlay from './components/EducationalOverlay'
import EducationalMode from './components/EducationalMode'
import StartStep from './steps/StartStep'
import PatientVitalsTab from './steps/PatientVitalsTab'
import TimeStep from './steps/TimeStep'
import ClinicalTab from './steps/ClinicalTab'
import ImagingTab from './steps/ImagingTab'
import CIAbsolutasTab from './steps/CIAbsolutasTab'
import CIRelativasTab from './steps/CIRelativasTab'
import DecisionTab from './steps/DecisionTab'
import DosageStep from './steps/DosageStep'
import ThrombectomyStep from './steps/ThrombectomyStep'
import CareTab from './steps/CareTab'
import { saveStrokeEvent, generatePatientId, saveSession, syncPendingEvents } from './lib/storage'
import { getNihssSeverity } from './content/nihss'
import { sendStrokeAlert } from './lib/emailService'
import { computeStrokeDecision } from './lib/strokeAlgorithm'
import { useAuth } from './auth/useAuth'
import LoginModal from './auth/LoginModal'

const MOCK_PATIENT = {
  name: 'Paciente Test',
  dni: '38999123',
  passphrase: 'mock',
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

// ── Tab completion logic (6 Phase-1 tabs) ───────────────────────────────────

function getTabCompletion({ patient, vitals, symptoms, nihss, ctResult, contraAbsolutes, contraRelatives }) {
  const paciente = !!(patient?.name && vitals !== null)
  const tiempo   = !!(symptoms?.lastSeenNormal || symptoms?.isWakeUpStroke === true)
  const clinica  = !!(nihss !== null)
  const imagenes = !!(
    ctResult?.bleeding === true || ctResult?.bleeding === false ||
    ctResult?.mismatch  === true || ctResult?.mismatch  === false
  )
  const ci_abs = !!(contraAbsolutes?.allAnswered)
  const ci_rel = !!(contraRelatives?.allAnswered)

  return {
    paciente: paciente ? 'complete' : patient?.name || vitals ? 'partial' : 'empty',
    tiempo:   tiempo   ? 'complete' : 'empty',
    clinica:  clinica  ? 'complete' : 'empty',
    imagenes: imagenes ? 'complete' : 'empty',
    ci_abs:   ci_abs   ? 'complete' : contraAbsolutes ? 'partial' : 'empty',
    ci_rel:   ci_rel   ? 'complete' : contraRelatives ? 'partial' : 'empty',
    allComplete: paciente && tiempo && clinica && imagenes && ci_abs && ci_rel,
  }
}

// ── Summary helpers ──────────────────────────────────────────────────────────

const SYMPTOM_LABELS = {
  consciousness: 'Consciencia',
  weakness: 'Debilidad unilateral',
  speech: 'Trastorno del habla',
  vision: 'Alteracion visual',
  ataxia: 'Ataxia / Inestabilidad',
  other: 'Otro',
}

// ── Phase-1 tab order (module-level so handlers can reference it) ─────────────
const PHASE1_TAB_IDS = ['paciente', 'tiempo', 'clinica', 'imagenes', 'ci_abs', 'ci_rel']

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  // Phase management
  const [phase, setPhase] = useState('start') // 'start' | 'pre' | 'post'
  const [activeTab, setActiveTab] = useState('paciente')

  // Modal state
  const [showEducationalOverlay, setShowEducationalOverlay] = useState(false)
  const [showEducationalMode, setShowEducationalMode] = useState(false)
  const [educationalSection, setEducationalSection] = useState('intro')
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [showOutOfWindow, setShowOutOfWindow] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [copied, setCopied] = useState(false)

  // Timestamps
  const [timerStart, setTimerStart] = useState(null)
  const [patientArrivalTime, setPatientArrivalTime] = useState(null)
  const [ctRequestTime, setCtRequestTime] = useState(null)
  const [angioRequestTime, setAngioRequestTime] = useState(null)
  const [thrombolyticStartTime, setThrombolyticStartTime] = useState(null)
  const [thrombectomyActivationTime, setThrombectomyActivationTime] = useState(null)

  // Clinical data
  const [patient, setPatient] = useState(null)
  const [patientId, setPatientId] = useState('')
  const [symptoms, setSymptoms] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [draftVitals, setDraftVitals] = useState({ sys: '', dia: '', glucose: '', mrs: null })
  const [nihss, setNihss] = useState(null)
  const [ctResult, setCtResult] = useState(null)
  const [dosage, setDosage] = useState(null)
  const [thrombectomy, setThrombectomy] = useState(null)
  const [decisionResult, setDecisionResult] = useState(null)
  // Split CI state (auto-saved per toggle)
  const [contraAbsolutes, setContraAbsolutes] = useState(null)
  const [contraRelatives, setContraRelatives] = useState(null)

  // Serial readings
  const [nihssReadings, setNihssReadings] = useState([])
  const [vitalsReadings, setVitalsReadings] = useState([])
  const [glucoseReadings, setGlucoseReadings] = useState([])

  const [eventId] = useState(uuidv4)
  const { user } = useAuth()

  // ── Sync + mock ─────────────────────────────────────────────────────────────

  useEffect(() => {
    syncPendingEvents()
    const handleOnline = () => syncPendingEvents()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  useEffect(() => {
    function activateMockComplete() {
      const now = new Date()
      const mockPatientId = generatePatientId(MOCK_PATIENT.name, MOCK_PATIENT.dni)
      const ago = (mins) => new Date(now.getTime() - mins * 60000)
      const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
      const scenario = Math.floor(Math.random() * 5)
      const arrivalTime = ago(45 + Math.floor(Math.random() * 20))
      const startTime   = ago(40 + Math.floor(Math.random() * 15))
      const symptomKeys = ['weakness', 'speech', 'vision', 'ataxia', 'other']
      const numSymp = 1 + Math.floor(Math.random() * 3)
      const shuffled = [...symptomKeys].sort(() => Math.random() - 0.5)
      const selectedSymptoms = Object.fromEntries(shuffled.slice(0, numSymp).map((k) => [k, true]))
      const isWakeUp = scenario === 3 || scenario === 4
      const lastSeenMins = isWakeUp ? 330 + Math.floor(Math.random() * 150) : 60 + Math.floor(Math.random() * 120)
      const lastSeenDate = ago(lastSeenMins)
      const pad = (n) => String(n).padStart(2, '0')
      const lastSeenNormal = `${lastSeenDate.getFullYear()}-${pad(lastSeenDate.getMonth() + 1)}-${pad(lastSeenDate.getDate())}T${pad(lastSeenDate.getHours())}:${pad(lastSeenDate.getMinutes())}`
      const symptomsData = {
        symptoms: selectedSymptoms, lastSeenNormal, isWakeUpStroke: isWakeUp,
        anticoagulation: { active: false, type: '' },
        modifiedRankinScale: { score: Math.floor(Math.random() * 4), label: 'Mock mRS' },
      }
      const vitalsData = { systolic: 130 + Math.floor(Math.random() * 50), diastolic: 80 + Math.floor(Math.random() * 30), glucose: 90 + Math.floor(Math.random() * 60) }
      const nihssScore = scenario === 1 ? 1 + Math.floor(Math.random() * 3) : 6 + Math.floor(Math.random() * 14)
      const nihssData = { nihssScore, hasDisablingSymptoms: nihssScore < 5 && Math.random() > 0.5 }
      const weight = 60 + Math.floor(Math.random() * 31)
      const ctReqTime = ago(22 + Math.floor(Math.random() * 10))

      const RED_IDS   = ['ct_hypodensity','ct_hemorrhage','tce_14d','neurosurgery_14d','spinal_cord','axial_tumor','endocarditis','coagulopathy','aortic_dissection','aria']
      const ORANGE_IDS = ['disability','doac','prev_stroke','prior_ich','trauma_14d_3m','major_surgery','gi_bleed','ic_dissection','vascular_malformation','stemi_3m','pericarditis','cardiac_thrombus','malignancy','pregnancy','dural_puncture','arterial_puncture','tbi_moderate','neurosurgery_14d_3m']
      const allNo = (ids) => Object.fromEntries(ids.map((k) => [k, false]))
      const rtpaDose = (w) => { const total = Math.round(w * 0.9 * 10) / 10; const bolo = Math.round(total * 0.1 * 10) / 10; return { total, bolo, infusion: Math.round((total - bolo) * 10) / 10 } }

      let ctResultData, contraindicationsData = null, dosageData = null
      let thrombolyticStart = null, angioReqTime = null, thrombectomyActTime = null, thrombectomyData = null

      if (scenario === 0) {
        ctResultData = { bleeding: false, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }
        contraindicationsData = { red: allNo(RED_IDS), orange: allNo(ORANGE_IDS), hasAbsolute: false, hasRelative: false, decidedNotToThrombolyze: false }
        thrombolyticStart = ago(10)
        dosageData = { drug: 'rtpa', weight, dose: rtpaDose(weight), checklist: {}, thrombolyticStartTime: thrombolyticStart.toISOString() }
        angioReqTime = ago(8); thrombectomyActTime = ago(5)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 7 + Math.floor(Math.random() * 3), thrombectomyActivationTime: thrombectomyActTime.toISOString() }
      } else if (scenario === 1) {
        ctResultData = { bleeding: true, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }
      } else if (scenario === 2) {
        ctResultData = { bleeding: false, ctRequestTime: ctReqTime.toISOString(), ctElapsedSeconds: 600 }
        const redAnswers = { ...allNo(RED_IDS), ct_hemorrhage: true }
        contraindicationsData = { red: redAnswers, orange: allNo(ORANGE_IDS), hasAbsolute: true, hasRelative: false, decidedNotToThrombolyze: false }
        angioReqTime = ago(8)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 8, thrombectomyActivationTime: null }
      } else if (scenario === 3) {
        ctResultData = { mismatch: true, mriRequestTime: ctReqTime.toISOString(), mriElapsedSeconds: 900 }
        contraindicationsData = { red: allNo(RED_IDS), orange: allNo(ORANGE_IDS), hasAbsolute: false, hasRelative: false, decidedNotToThrombolyze: false }
        thrombolyticStart = ago(10)
        dosageData = { drug: pick(['rtpa','tnk']), weight, dose: rtpaDose(weight), checklist: {}, thrombolyticStartTime: thrombolyticStart.toISOString() }
        angioReqTime = ago(8); thrombectomyActTime = ago(5)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 7 + Math.floor(Math.random() * 3), thrombectomyActivationTime: thrombectomyActTime.toISOString() }
      } else {
        ctResultData = { mismatch: false, mriRequestTime: ctReqTime.toISOString(), mriElapsedSeconds: 900 }
        angioReqTime = ago(8)
        thrombectomyData = { angioRequested: true, angioRequestTime: angioReqTime.toISOString(), hemodinamisNotified: true, aspectScore: 6 + Math.floor(Math.random() * 4), thrombectomyActivationTime: ago(5).toISOString() }
      }

      const mockDecision = computeStrokeDecision({ symptoms: symptomsData, nihss: nihssData, ctResult: ctResultData, contraindications: contraindicationsData })

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
      // Sync split CI state for mock
      if (contraindicationsData) {
        const RED_IDS_LIST   = ['ct_hypodensity','ct_hemorrhage','tce_14d','neurosurgery_14d','spinal_cord','axial_tumor','endocarditis','coagulopathy','aortic_dissection','aria']
        const ORANGE_IDS_LIST = ['disability','doac','prev_stroke','prior_ich','trauma_14d_3m','major_surgery','gi_bleed','ic_dissection','vascular_malformation','stemi_3m','pericarditis','cardiac_thrombus','malignancy','pregnancy','dural_puncture','arterial_puncture','tbi_moderate','neurosurgery_14d_3m']
        setContraAbsolutes({
          answers: contraindicationsData.red,
          allAnswered: RED_IDS_LIST.every((k) => contraindicationsData.red[k] !== undefined),
          hasAbsolute: contraindicationsData.hasAbsolute,
        })
        setContraRelatives({
          answers: contraindicationsData.orange,
          anticoag: { active: false, type: '' },
          allAnswered: ORANGE_IDS_LIST.every((k) => contraindicationsData.orange[k] !== undefined),
          hasRelative: contraindicationsData.hasRelative,
        })
      }
      setDosage(dosageData)
      setThrombectomy(thrombectomyData)
      setDecisionResult(mockDecision)
      setPhase('post')
      setActiveTab('decision')
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('mock') === 'evaluacion') activateMockComplete()

    function handleDevShortcut(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        activateMockComplete()
      }
    }
    window.addEventListener('keydown', handleDevShortcut)
    return () => window.removeEventListener('keydown', handleDevShortcut)
  }, [])

  // ── Session resume ──────────────────────────────────────────────────────────

  function handleResume(id, session) {
    setPatientId(id)
    setPatient({ name: session.patientName, dni: session.patientDNI })
    if (session.startTime) setTimerStart(new Date(session.startTime))
    if (session.patientArrivalTime) setPatientArrivalTime(new Date(session.patientArrivalTime))
    if (session.ctRequestTime) setCtRequestTime(new Date(session.ctRequestTime))
    if (session.angioRequestTime) setAngioRequestTime(new Date(session.angioRequestTime))
    if (session.thrombolyticStartTime) setThrombolyticStartTime(new Date(session.thrombolyticStartTime))
    if (session.thrombectomyActivationTime) setThrombectomyActivationTime(new Date(session.thrombectomyActivationTime))
    setPhase('pre')
    setActiveTab('paciente')
  }

  // ── Patient + alert ─────────────────────────────────────────────────────────

  function handleStart() {
    setPhase('pre')
    setActiveTab('paciente')
  }

  function handlePatientConfirm(data) {
    const now = new Date()
    setPatient(data)
    setPatientArrivalTime(now)
    setPatientId(generatePatientId(data.name, data.dni))
    setShowAlertModal(true)
  }

  async function handleAlertConfirm() {
    const now = new Date()
    setShowAlertModal(false)
    setTimerStart(now)

    saveSession(patientId, {
      patientName: patient.name,
      patientDNI: patient.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: now.toISOString(),
    })

    try { await sendStrokeAlert({ patient, startTime: now }) } catch { /* silent */ }

    saveStrokeEvent({
      id: eventId,
      patientDNI: patient.dni,
      patientName: patient.name,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: now.toISOString(),
      emailSent: true,
    })
  }

  function handleAlertClose() {
    setShowAlertModal(false)
  }

  // ── Clinical data handlers ──────────────────────────────────────────────────

  function handleTimeConfirm(data) {
    setSymptoms((prev) => ({ ...prev, ...data }))
    advanceToNext('tiempo')
  }

  function handleVitalsConfirm(vitalsData) {
    setVitals(vitalsData)
    advanceToNext('paciente')
  }

  function handleNihssConfirm(data) {
    const nihssData = { nihssScore: data.nihssScore, hasDisablingSymptoms: data.hasDisablingSymptoms }
    setNihss(nihssData)
    setSymptoms((prev) => ({ ...prev, symptoms: data.symptoms, modifiedRankinScale: data.modifiedRankinScale }))
    advanceToNext('clinica')
  }

  function handleCtConfirm(data) {
    setCtResult(data)
    setCtRequestTime(new Date(data.ctRequestTime))
    saveSession(patientId || '', {
      patientName: patient?.name, patientDNI: patient?.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      ctRequestTime: data.ctRequestTime,
    })
    advanceToNext('imagenes')
  }

  function handleMriConfirm(data) {
    setCtResult(data)
    advanceToNext('imagenes')
  }

  function handleCtRequest(time) {
    setCtRequestTime(time)
  }

  // CI tabs auto-save on each toggle
  function handleContraAbsUpdate(state) {
    setContraAbsolutes(state)
    if (state.allAnswered) advanceToNext('ci_abs')
  }

  function handleContraRelUpdate(state) {
    setContraRelatives(state)
  }

  function handleAnticoagChange(anticoag) {
    setSymptoms((prev) => ({ ...prev, anticoagulation: anticoag }))
  }

  // ── Auto-advance to next tab on completion ────────────────────────────────────

  function advanceToNext(currentTab) {
    if (phase !== 'pre' || activeTab !== currentTab) return
    const idx = PHASE1_TAB_IDS.indexOf(currentTab)
    if (idx >= 0 && idx < PHASE1_TAB_IDS.length - 1) setActiveTab(PHASE1_TAB_IDS[idx + 1])
  }

  // ── Decision trigger ────────────────────────────────────────────────────────

  function handleComputeDecision() {
    // Combine the two independent CI tabs into the format the algorithm expects
    const combinedContra = {
      red:   contraAbsolutes?.answers ?? {},
      orange: contraRelatives?.answers ?? {},
      hasAbsolute: !!(contraAbsolutes?.hasAbsolute),
      hasRelative: !!(contraRelatives?.hasRelative),
      decidedNotToThrombolyze: false,
      anticoagulation: contraRelatives?.anticoag ?? null,
    }
    const result = computeStrokeDecision({ symptoms, nihss, ctResult, contraindications: combinedContra })
    setDecisionResult(result)
    setPhase('post')
    setActiveTab('decision')
    // Show floating trombolisis hint if indicated

    saveStrokeEvent({
      id: eventId,
      patientId,
      patient,
      timerStart: timerStart?.toISOString(),
      patientArrivalTime: patientArrivalTime?.toISOString(),
      ctRequestTime: ctRequestTime?.toISOString(),
      symptoms,
      vitals,
      nihss,
      ctResult,
      contraindications: combinedContra,
      decisionResult: result,
    })
  }

  // ── Dosage + thrombectomy ───────────────────────────────────────────────────

  function handleDosageConfirm(data) {
    setDosage(data)
    setThrombolyticStartTime(new Date(data.thrombolyticStartTime))
    saveSession(patientId || '', {
      patientName: patient?.name, patientDNI: patient?.dni,
      patientArrivalTime: patientArrivalTime?.toISOString(),
      startTime: timerStart?.toISOString(),
      thrombolyticStartTime: data.thrombolyticStartTime,
    })
    setActiveTab('cuidados')
  }

  function handleThrombolyticStart(time) {
    setThrombolyticStartTime(time)
  }

  function handleAngioRequest(time) {
    setAngioRequestTime(time)
  }

  function handleThrombectomyActivation(time) {
    setThrombectomyActivationTime(time)
  }

  function handleThrombectomyConfirm(data) {
    setThrombectomy(data)
    if (data.thrombectomyActivationTime) setThrombectomyActivationTime(new Date(data.thrombectomyActivationTime))
  }

  // ── Quick-add handlers ──────────────────────────────────────────────────────

  function handleAddNihss(score) {
    setNihssReadings((prev) => [...prev, { score, timestamp: new Date() }])
  }

  function handleAddVitals({ systolic, diastolic }) {
    setVitalsReadings((prev) => [...prev, { systolic, diastolic, timestamp: new Date() }])
  }

  function handleAddGlucose(value) {
    setGlucoseReadings((prev) => [...prev, { value, timestamp: new Date() }])
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  function handleReset() {
    const confirmed = window.confirm('¿Reiniciar el protocolo? Se perderán todos los datos del caso actual.')
    if (!confirmed) return
    window.location.reload()
  }

  // ── Summary ─────────────────────────────────────────────────────────────────

  function getSelectedSymptomsSummary() {
    const selectedSymptoms = symptoms?.symptoms
      ? Object.entries(symptoms.symptoms).filter(([, v]) => v).map(([k]) => SYMPTOM_LABELS[k] ?? k)
      : []
    return selectedSymptoms.length ? selectedSymptoms.join(', ') : 'No registrado'
  }

  function getImagingSummary() {
    if (!ctResult) return 'No registrado'
    if (ctResult.bleeding === true) return 'TC con hemorragia intracraneal'
    if (ctResult.bleeding === false) return 'TC sin hemorragia'
    if (ctResult.mismatch === true) return 'RMN con mismatch FLAIR-DWI'
    if (ctResult.mismatch === false) return 'RMN sin mismatch'
    return 'Imagen registrada'
  }

  function getDoseSummary() {
    if (!dosage) return 'No administrada / no registrada'
    if (dosage.drug === 'tnk') return `Tenecteplase ${dosage.dose?.total ?? '-'} mg bolo IV`
    return `Alteplase ${dosage.dose?.total ?? '-'} mg total: bolo ${dosage.dose?.bolo ?? '-'} mg + infusion ${dosage.dose?.infusion ?? '-'} mg`
  }

  function buildSummaryText() {
    return [
      `CÓDIGO STROKE — Resumen del caso`,
      `Paciente: ${patient?.name ?? '-'}  |  DNI: ${patient?.dni ?? '-'}  |  ID: ${patientId || '-'}`,
      `Decisión: ${decisionResult?.title ?? '-'}`,
      ``,
      `--- TIEMPOS ---`,
      `Ingreso: ${fmtDateTime(patientArrivalTime)}`,
      `Inicio código: ${fmtDateTime(timerStart)}`,
      `Última vez asintomático: ${fmtDateTime(symptoms?.lastSeenNormal)}`,
      `Solicitud TC: ${fmtDateTime(ctRequestTime)}`,
      `Inicio trombolítico: ${fmtDateTime(thrombolyticStartTime)}`,
      `Angio / trombectomía: ${fmtDateTime(angioRequestTime || thrombectomyActivationTime)}`,
      ``,
      `--- EVALUACIÓN INICIAL ---`,
      `Síntomas: ${getSelectedSymptomsSummary()}`,
      `TA: ${vitals ? `${vitals.systolic}/${vitals.diastolic} mmHg` : 'No registrado'}`,
      `Glucemia: ${vitals ? `${vitals.glucose} mg/dL` : 'No registrado'}`,
      `NIHSS: ${nihss ? `${nihss.nihssScore}pts${nihss.hasDisablingSymptoms ? ' + déficit discapacitante' : ''}` : 'No registrado'}`,
      ``,
      `--- IMAGEN Y DECISIONES ---`,
      `Imagen: ${getImagingSummary()}`,
      `Trombolisis: ${getDoseSummary()}`,
      `AngioTAC: ${thrombectomy?.angioRequested === true ? 'Solicitada' : thrombectomy?.angioRequested === false ? 'No solicitada' : 'No registrado'}`,
      `ASPECTS: ${thrombectomy?.aspectScore ?? 'No registrado'}`,
    ].join('\n')
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildSummaryText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Tab completion ──────────────────────────────────────────────────────────

  const tabCompletion = getTabCompletion({ patient, vitals, symptoms, nihss, ctResult, contraAbsolutes, contraRelatives })

  // Phase 2: show Trombolisis tab only if thrombolysis indicated
  const phase2TabCompletion = {
    ...tabCompletion,
    showTrombolisis: decisionResult?.thrombolyze === true,
  }

  // ── Derived latest readings ─────────────────────────────────────────────────

  const latestNihss = nihssReadings.length > 0
    ? nihssReadings[nihssReadings.length - 1].score
    : nihss?.nihssScore ?? null
  const latestVitals = vitalsReadings.length > 0
    ? vitalsReadings[vitalsReadings.length - 1]
    : vitals ? { systolic: vitals.systolic, diastolic: vitals.diastolic } : null
  const latestGlucose = glucoseReadings.length > 0
    ? glucoseReadings[glucoseReadings.length - 1].value
    : vitals?.glucose ?? null

  // ── Render: StartStep ───────────────────────────────────────────────────────

  if (phase === 'start') {
    return (
      <>
        <StartStep
          onStart={handleStart}
          onResume={handleResume}
          onOpenEducational={() => { setEducationalSection('intro'); setShowEducationalMode(true) }}
          authUser={user}
          onAuthClick={() => setShowLoginModal(true)}
        />
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
        {showEducationalMode && (
          <EducationalMode initialSection={educationalSection} onClose={() => setShowEducationalMode(false)} />
        )}
      </>
    )
  }

  // ── Render: tab content ─────────────────────────────────────────────────────

  function renderTabContent() {
    if (phase === 'pre') {
      switch (activeTab) {
        case 'paciente':
          return (
            <PatientVitalsTab
              patient={patient}
              patientId={patientId}
              arrivalTime={patientArrivalTime}
              vitals={vitals}
              onPatientConfirm={handlePatientConfirm}
              onVitalsConfirm={handleVitalsConfirm}
              onOpenEducational={() => { setEducationalSection('intro'); setShowEducationalMode(true) }}
              draftVitals={draftVitals}
              onDraftVitalsChange={setDraftVitals}
            />
          )
        case 'tiempo':
          return <TimeStep onConfirm={handleTimeConfirm} isCollapsed={false} />
        case 'clinica':
          return (
            <ClinicalTab
              onNihssConfirm={handleNihssConfirm}
              nihss={nihss}
              symptoms={symptoms}
            />
          )
        case 'imagenes':
          return (
            <ImagingTab
              onCtConfirm={handleCtConfirm}
              onMriConfirm={handleMriConfirm}
              onCtRequest={handleCtRequest}
              ctResult={ctResult}
              isWakeUpStroke={symptoms?.isWakeUpStroke}
              initialCtRequestTime={ctRequestTime}
            />
          )
        case 'ci_abs':
          return (
            <CIAbsolutasTab
              initialState={contraAbsolutes}
              onUpdate={handleContraAbsUpdate}
            />
          )
        case 'ci_rel':
          return (
            <CIRelativasTab
              initialState={contraRelatives}
              onUpdate={handleContraRelUpdate}
              onAnticoagChange={handleAnticoagChange}
            />
          )
        default:
          return null
      }
    }

    // ── Phase 2 ──────────────────────────────────────────────────────────────
    switch (activeTab) {
      case 'decision':
        return (
          <DecisionTab
            result={decisionResult}
            onGoToThrombolysis={() => setActiveTab('trombolisis')}
            onGoToThrombectomy={() => setActiveTab('trombectomia')}
          />
        )
      case 'trombolisis':
        return (
          <DosageStep
            onConfirm={handleDosageConfirm}
            thrombolyticStartTime={thrombolyticStartTime}
            onThrombolyticStart={handleThrombolyticStart}
            onAddNihss={handleAddNihss}
          />
        )
      case 'trombectomia':
        return (
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
        )
      case 'cuidados':
        return (
          <CareTab
            nihssReadings={nihssReadings}
            vitalsReadings={vitalsReadings}
            onAddNihss={handleAddNihss}
            onAddVitals={handleAddVitals}
            onContinue={() => setActiveTab('trombectomia')}
          />
        )
      default:
        return null
    }
  }

  // ── Main render ─────────────────────────────────────────────────────────────

  const progressPct = phase === 'pre'
    ? (PHASE1_TAB_IDS.filter((k) => tabCompletion[k] === 'complete').length / PHASE1_TAB_IDS.length) * 100
    : 100

  // Floating trombolisis button: visible in Phase 2 when indicated, not already on that tab
  const showTrombolisisFAB = phase === 'post'
    && decisionResult?.thrombolyze === true
    && activeTab !== 'trombolisis'

  const headerOffsetClass = timerStart
    ? 'pt-[calc(6.85rem+env(safe-area-inset-top,0px))] md:pt-[calc(2.75rem+env(safe-area-inset-top,0px))]'
    : 'pt-[calc(3.75rem+env(safe-area-inset-top,0px))] md:pt-[calc(2.75rem+env(safe-area-inset-top,0px))]'

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-neutral-50 md:bg-[#f6f6f4]">

      {/* Fixed header */}
      <GlobalTimer
        startTime={timerStart}
        timestamps={{
          ctRequest: ctRequestTime?.toISOString(),
          thrombolyticStart: thrombolyticStartTime?.toISOString(),
          angioRequest: angioRequestTime?.toISOString(),
        }}
        patient={patient}
        onReset={patient ? handleReset : undefined}
        onEducationalOpen={() => setShowEducationalOverlay(true)}
        progressPct={progressPct}
        authUser={user}
        onAuthClick={() => setShowLoginModal(true)}
      />

      {/* Body below header */}
      <div className={`flex-1 flex flex-col overflow-hidden ${headerOffsetClass}`}>

        {/* TabBar — colored band */}
        <div className="shrink-0 bg-brand-600 md:border-b md:border-stroke-line md:bg-stroke-navy md:px-5 md:py-1">
          <TabBar
            phase={phase}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            completion={phase === 'pre' ? tabCompletion : phase2TabCompletion}
          />
        </div>

        {/* Two-column layout: sidebar (desktop) + main content */}
        <div className="flex-1 flex overflow-hidden md:px-4 md:pb-3">

          {/* Desktop sidebar */}
          {(patient || phase === 'pre') && (
            <aside className="hidden md:flex md:flex-col md:gap-2.5 w-[270px] shrink-0 overflow-y-auto border-r border-neutral-200 pr-3 pt-3">
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                {patient ? (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-neutral-900 text-sm leading-snug">{patient.name}</p>
                      {patientId && <p className="text-[10px] font-mono font-bold text-neutral-500 tracking-wider shrink-0">{patientId}</p>}
                    </div>
                    <p className="text-xs text-neutral-500">DNI {patient.dni}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-neutral-900 text-sm leading-snug">Evaluación inicial</p>
                    <p className="text-xs text-neutral-500">Cargar paciente y signos vitales</p>
                  </>
                )}

                {(latestNihss !== null || latestVitals || latestGlucose !== null) && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-1.5">
                    {latestNihss !== null && (() => {
                      const sev = getNihssSeverity(latestNihss)
                      return (
                        <div className={`rounded-md px-2 py-2 text-center ${sev.bg}`}>
                          <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">NIHSS</p>
                          <p className={`text-sm font-bold tabular-nums ${sev.color}`}>{latestNihss}</p>
                        </div>
                      )
                    })()}
                    {latestVitals && (
                      <div className={`rounded-md px-2 py-2 text-center ${latestVitals.systolic > 185 ? 'bg-blue-900/10' : 'bg-neutral-50'}`}>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">TA</p>
                        <p className={`text-xs font-bold tabular-nums ${latestVitals.systolic > 185 ? 'text-blue-900' : 'text-blue-700'}`}>{latestVitals.systolic}/{latestVitals.diastolic}</p>
                      </div>
                    )}
                    {latestGlucose !== null && (
                      <div className={`rounded-md px-2 py-2 text-center ${latestGlucose < 50 ? 'bg-blue-900/10' : latestGlucose > 400 ? 'bg-orange-50' : 'bg-neutral-50'}`}>
                        <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-0.5">GLC</p>
                        <p className={`text-xs font-bold tabular-nums ${latestGlucose < 50 ? 'text-blue-900' : latestGlucose > 400 ? 'text-orange-600' : 'text-violet-700'}`}>{latestGlucose}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {timerStart && (
                <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
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
                <TimestampPanel
                  variant="desktop"
                  codeStart={timerStart}
                  ct={ctRequestTime}
                  thrombolytic={thrombolyticStartTime}
                  hemo={angioRequestTime}
                />
              </div>

              {phase === 'pre' && (
                <div className="rounded-lg border border-neutral-200 bg-white p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Decisión</p>
                  <DecisionButton
                    allComplete={tabCompletion.allComplete}
                    onClick={handleComputeDecision}
                    executed={false}
                  />
                </div>
              )}

              {/* Trombolisis shortcut (desktop sidebar, Phase 2) */}
              {showTrombolisisFAB && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <button type="button" onClick={() => setActiveTab('trombolisis')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.98]">
                    <Syringe size={13} /> Ir a Trombolisis
                  </button>
                </div>
              )}

              {/* Summary copy (Phase 2 only) */}
              {phase === 'post' && (
                <div className="rounded-lg border border-neutral-200 bg-white p-3">
                  <button type="button" onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                      copied ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}>
                    {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar resumen</>}
                  </button>
                  <button type="button" onClick={() => {
                    const url = `https://wa.me/?text=${encodeURIComponent(buildSummaryText())}`
                    window.open(url, '_blank')
                  }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 mt-1 rounded-lg text-xs font-medium border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all">
                    WhatsApp
                  </button>
                </div>
              )}
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              <div className="w-full max-w-5xl mx-auto px-0 py-3 pb-20 md:px-5 md:py-3 md:pb-5">
                {renderTabContent()}
              </div>
            </main>
          </div>
        </div>

        {/* ── Fixed bottom: DecisionButton (Phase 1) ── */}
        {phase === 'pre' && (
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-brand-700/95 backdrop-blur-sm border-t border-brand-500/30 px-4 py-3 md:hidden"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="max-w-3xl mx-auto">
              <DecisionButton
                allComplete={tabCompletion.allComplete}
                onClick={handleComputeDecision}
                executed={false}
              />
            </div>
          </div>
        )}

        {/* ── Fixed bottom: QuickAddFAB toolbar (Phase 2, mobile only) ── */}
        {phase === 'post' && timerStart && (
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

        {/* ── Floating Trombolisis FAB (mobile — appears above toolbar) ── */}
        {showTrombolisisFAB && (
          <button
            type="button"
            onClick={() => setActiveTab('trombolisis')}
            className="fixed z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl
              bg-emerald-600 hover:bg-emerald-700 active:scale-[0.97] text-white font-bold text-sm
              transition-all animate-fade-in md:hidden"
            style={{
              bottom: timerStart
                ? 'calc(5rem + env(safe-area-inset-bottom, 0px))'
                : 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
              right: '1rem',
            }}
          >
            <Syringe size={16} strokeWidth={2} />
            Trombolisis
          </button>
        )}
      </div>

      {/* Modals */}
      {showAlertModal && patient && (
        <AlertModal
          patient={patient}
          onConfirm={handleAlertConfirm}
          onClose={handleAlertClose}
        />
      )}

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {showOutOfWindow && (
        <OutOfWindowModal
          patient={patient}
          onClose={() => setShowOutOfWindow(false)}
          onSave={(data) => console.info('OutOfWindow:', data)}
        />
      )}

      {showEducationalOverlay && (
        <EducationalOverlay onClose={() => setShowEducationalOverlay(false)} />
      )}

      {showEducationalMode && (
        <EducationalMode
          initialSection={educationalSection}
          onClose={() => setShowEducationalMode(false)}
        />
      )}
    </div>
  )
}
