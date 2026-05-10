import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { RotateCcw, Clock } from 'lucide-react'
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

export default function App() {
  const [step, setStep] = useState(STEP.START)
  const [timerStart, setTimerStart] = useState(null)
  const [patient, setPatient] = useState(null)
  const [patientId, setPatientId] = useState('')
  const [symptoms, setSymptoms] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [nihss, setNihss] = useState(null)
  const [ctResult, setCtResult] = useState(null)
  const [contraindications, setContraindications] = useState(null)
  const [dosage, setDosage] = useState(null)
  const [thrombectomy, setThrombectomy] = useState(null)
  const [eventId] = useState(uuidv4)
  const [nihssReadings, setNihssReadings] = useState([])
  const [vitalsReadings, setVitalsReadings] = useState([])
  const [glucoseReadings, setGlucoseReadings] = useState([])
  const [showOutOfWindow, setShowOutOfWindow] = useState(false)

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

  function handleStart() {
    setStep(STEP.PATIENT)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleResume(id, session) {
    setPatientId(id)
    setPatient({ name: session.patientName, dni: session.patientDNI })
    if (session.startTime) setTimerStart(new Date(session.startTime))
    setStep(STEP.SYMPTOMS)
  }

  function handlePatientConfirm(data) {
    setPatient(data)
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
      startTime: now.toISOString(),
      emailSent: true,
    })
  }

  function handleSymptomsConfirm(data) {
    setSymptoms(data)
    setStep(STEP.VITALS)
    scrollTo(vitalsRef)
  }

  function handleVitalsConfirm(data) {
    setVitals(data)
    setStep(STEP.NIHSS)
    scrollTo(nihssRef)
  }

  function handleNihssConfirm(data) {
    setNihss(data)
    setStep(STEP.INSTRUCTIONS)
    scrollTo(instructionsRef)
  }

  function handleInstructionsConfirm(data) {
    saveStrokeEvent({
      id: eventId,
      patientDNI: patient.dni,
      patientName: patient.name,
      startTime: timerStart?.toISOString(),
      symptoms,
      vitals,
      nihss,
      checklist: data.checklist,
    })
    setStep(STEP.CT_RESULT)
    scrollTo(ctResultRef)
  }

  function handleCtResultConfirm(data) {
    setCtResult(data)
    if (data.bleeding) {
      setStep(STEP.DONE)
      scrollTo(doneRef)
    } else {
      setStep(STEP.CONTRAINDICATIONS)
      scrollTo(contraindicationsRef)
    }
  }

  function handleMRIResultConfirm(data) {
    setCtResult(data)
    if (data.mismatch) {
      setStep(STEP.CONTRAINDICATIONS)
      scrollTo(contraindicationsRef)
    } else {
      setStep(STEP.THROMBECTOMY)
      scrollTo(thrombectomyRef)
    }
  }

  function handleContraindicationsConfirm(data) {
    setContraindications(data)
    if (data.hasAbsolute) {
      setStep(STEP.THROMBECTOMY)
      scrollTo(thrombectomyRef)
    } else {
      setStep(STEP.DOSAGE)
      scrollTo(dosageRef)
    }
  }

  function handleDosageConfirm(data) {
    setDosage(data)
    setStep(STEP.THROMBECTOMY)
    scrollTo(thrombectomyRef)
  }

  function handleThrombectomyConfirm(data) {
    setThrombectomy(data)
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

  function handleReset() {
    const confirmed = window.confirm('¿Reiniciar el protocolo? Se perderán todos los datos del caso actual.')
    if (!confirmed) return
    window.location.reload()
  }

  const sidebarCompletedSteps = step === STEP.DONE
    ? SIDEBAR_VALUES
    : SIDEBAR_VALUES.filter((v) => v < step)

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
      return {
        icon: 'error',
        iconBg: 'bg-red-100',
        borderColor: 'border-red-400',
        title: 'Contraindicación absoluta presente',
        body: 'No indicar trombolisis IV. Registrar motivo y continuar manejo de soporte.',
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

  if (step === STEP.START) {
    return <StartStep onStart={handleStart} onResume={handleResume} />
  }

  const done = step === STEP.DONE ? getDoneContent() : null

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <GlobalTimer startTime={timerStart} />

      {/* Sticky header — ancho completo, z-50 cubre el sidebar */}
      {patient && (
        <div className="bg-brand-600 sticky top-0 z-50">
          <div className="pl-12 pr-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-brand-300 text-xs uppercase tracking-wider leading-none mb-0.5">Código Stroke</p>
              <p className="text-white font-semibold text-sm truncate leading-tight">{patient.name}</p>
            </div>
            <div className="text-right flex-shrink-0 min-w-fit">
              <p className="text-brand-300 text-xs leading-tight">DNI {patient.dni}</p>
              <p className="text-white/60 text-xs font-mono tracking-widest leading-tight md:hidden">{patientId}</p>
            </div>
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
        </div>
      )}

      {patient && patientId && (
        <div className="pointer-events-none fixed top-20 right-4 z-40 hidden md:block">
          <div className="rounded-full border border-brand-200 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-500">ID del caso</p>
            <p className="text-sm font-mono font-bold tracking-[0.25em] text-brand-700">{patientId}</p>
          </div>
        </div>
      )}

      {/* Sidebar de pasos (z-30, el header z-50 lo tapa en el top) */}
      {patient && (
        <StepTimeline
          currentStep={step}
          completedSteps={sidebarCompletedSteps}
          onStepClick={handleSidebarStepClick}
        />
      )}

      {/* Botones de registros rápidos — fijos en el costado derecho */}
      {patient && step > STEP.ALERT && (
        <div className="fixed right-3 top-1/3 z-40">
          <QuickAddFAB
            onAddNihss={handleAddNihss}
            onAddVitals={handleAddVitals}
            onAddGlucose={handleAddGlucose}
          />
        </div>
      )}

      {/* Botón flotante — ACV fuera de ventana */}
      {step > STEP.START && (
        <button
          type="button"
          onClick={() => setShowOutOfWindow(true)}
          className="fixed bottom-6 left-14 z-40 flex items-center gap-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all"
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

      <div className="ml-11 mr-14 pt-4 space-y-3">
          {step >= STEP.PATIENT && (
            <PatientStep
              onConfirm={handlePatientConfirm}
              confirmed={step > STEP.ALERT}
              patient={patient}
              patientId={patientId}
            />
          )}

          {step === STEP.ALERT && patient && (
            <AlertModal
              patient={patient}
              onConfirm={handleAlertConfirm}
              onClose={() => setStep(STEP.PATIENT)}
            />
          )}

          {step >= STEP.SYMPTOMS && (
            <div ref={symptomsRef}>
              <SymptomsStep onConfirm={handleSymptomsConfirm} />
            </div>
          )}

          {step >= STEP.VITALS && (
            <div ref={vitalsRef}>
              <VitalsStep onConfirm={handleVitalsConfirm} />
            </div>
          )}

          {step >= STEP.NIHSS && (
            <div ref={nihssRef}>
              <NihssStep onConfirm={handleNihssConfirm} />
            </div>
          )}

          {step >= STEP.INSTRUCTIONS && (
            <div ref={instructionsRef}>
              <InstructionsStep onConfirm={handleInstructionsConfirm} />
            </div>
          )}

          {step >= STEP.CT_RESULT && (
            <div ref={ctResultRef}>
              {symptoms?.isWakeUpStroke
                ? <MRIResultStep onConfirm={handleMRIResultConfirm} />
                : <CTResultStep onConfirm={handleCtResultConfirm} />
              }
            </div>
          )}

          {step >= STEP.CONTRAINDICATIONS && (
            <div ref={contraindicationsRef}>
              <ContraindicationsStep onConfirm={handleContraindicationsConfirm} />
            </div>
          )}

          {step >= STEP.DOSAGE && (
            <div ref={dosageRef}>
              <DosageStep onConfirm={handleDosageConfirm} />
            </div>
          )}

          {step >= STEP.THROMBECTOMY && (
            <div ref={thrombectomyRef}>
              <ThrombectomyStep
                nihssScore={nihss?.nihssScore ?? 0}
                onConfirm={handleThrombectomyConfirm}
              />
            </div>
          )}

          {step === STEP.DONE && done && (
            <div ref={doneRef} className="px-4 pb-4 animate-slide-down">
              <div className={`bg-white rounded-xl border-l-4 ${done.borderColor} shadow-sm p-6`}>
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
            </div>
          )}
      </div>
    </div>
  )
}
