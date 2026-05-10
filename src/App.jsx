import { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import GlobalTimer from './components/GlobalTimer'
import AlertModal from './components/AlertModal'
import StartStep from './steps/StartStep'
import PatientStep from './steps/PatientStep'
import SymptomsStep from './steps/SymptomsStep'
import VitalsStep from './steps/VitalsStep'
import NihssStep from './steps/NihssStep'
import InstructionsStep from './steps/InstructionsStep'
import { saveStrokeEvent } from './lib/storage'
import { sendStrokeAlert } from './lib/emailService'

const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,
  SYMPTOMS: 3,
  VITALS: 4,
  NIHSS: 5,
  INSTRUCTIONS: 6,
  DONE: 7,
}

export default function App() {
  const [step, setStep] = useState(STEP.START)
  const [timerStart, setTimerStart] = useState(null)
  const [patient, setPatient] = useState(null)
  const [symptoms, setSymptoms] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [nihss, setNihss] = useState(null)
  const [eventId] = useState(uuidv4)

  const symptomsRef = useRef(null)
  const vitalsRef = useRef(null)
  const nihssRef = useRef(null)
  const instructionsRef = useRef(null)
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

  function handlePatientConfirm(data) {
    setPatient(data)
    setStep(STEP.ALERT)
  }

  async function handleAlertConfirm() {
    const now = new Date()
    setTimerStart(now)
    setStep(STEP.SYMPTOMS)
    scrollTo(symptomsRef)

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
    setStep(STEP.DONE)
    scrollTo(doneRef)
  }

  if (step === STEP.START) {
    return <StartStep onStart={handleStart} />
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <GlobalTimer startTime={timerStart} />

      {/* Patient header bar */}
      {patient && step > STEP.ALERT && (
        <div className="bg-red-600 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <p className="text-red-200 text-xs uppercase tracking-wider">Código Stroke</p>
              <p className="text-white font-semibold text-sm">{patient.name}</p>
            </div>
            <p className="text-red-200 text-xs">DNI {patient.dni}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto pt-4 space-y-3">
        {/* Step 1: Patient */}
        {step >= STEP.PATIENT && (
          <PatientStep
            onConfirm={handlePatientConfirm}
            confirmed={step > STEP.ALERT}
            patient={patient}
          />
        )}

        {/* Alert modal */}
        {step === STEP.ALERT && patient && (
          <AlertModal
            patient={patient}
            onConfirm={handleAlertConfirm}
            onClose={() => setStep(STEP.PATIENT)}
          />
        )}

        {/* Step 2: Symptoms */}
        {step >= STEP.SYMPTOMS && (
          <div ref={symptomsRef}>
            <SymptomsStep onConfirm={handleSymptomsConfirm} />
          </div>
        )}

        {/* Step 3: Vitals */}
        {step >= STEP.VITALS && (
          <div ref={vitalsRef}>
            <VitalsStep onConfirm={handleVitalsConfirm} />
          </div>
        )}

        {/* Step 4: NIHSS */}
        {step >= STEP.NIHSS && (
          <div ref={nihssRef}>
            <NihssStep onConfirm={handleNihssConfirm} />
          </div>
        )}

        {/* Step 5: Instructions */}
        {step >= STEP.INSTRUCTIONS && (
          <div ref={instructionsRef}>
            <InstructionsStep
              nihssScore={nihss?.nihssScore ?? 0}
              onConfirm={handleInstructionsConfirm}
            />
          </div>
        )}

        {/* Done */}
        {step === STEP.DONE && (
          <div ref={doneRef} className="px-4 pb-4 animate-slide-down">
            <div className="bg-white rounded-xl border-l-4 border-emerald-500 shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-gray-800 text-xl mb-2">Fase inicial completa</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Datos registrados. Continuar con evaluación para trombolisis según NIHSS y ventana terapéutica.
              </p>
              {timerStart && (
                <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3">
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
