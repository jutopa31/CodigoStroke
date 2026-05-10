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
import CTResultStep from './steps/CTResultStep'
import ContraindicationsStep from './steps/ContraindicationsStep'
import DosageStep from './steps/DosageStep'
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
  CT_RESULT: 7,
  CONTRAINDICATIONS: 8,
  DOSAGE: 9,
  DONE: 10,
}

export default function App() {
  const [step, setStep] = useState(STEP.START)
  const [timerStart, setTimerStart] = useState(null)
  const [patient, setPatient] = useState(null)
  const [symptoms, setSymptoms] = useState(null)
  const [vitals, setVitals] = useState(null)
  const [nihss, setNihss] = useState(null)
  const [ctResult, setCtResult] = useState(null)
  const [contraindications, setContraindications] = useState(null)
  const [dosage, setDosage] = useState(null)
  const [eventId] = useState(uuidv4)

  const symptomsRef = useRef(null)
  const vitalsRef = useRef(null)
  const nihssRef = useRef(null)
  const instructionsRef = useRef(null)
  const ctResultRef = useRef(null)
  const contraindicationsRef = useRef(null)
  const dosageRef = useRef(null)
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

  function handleContraindicationsConfirm(data) {
    setContraindications(data)
    if (data.hasAbsolute) {
      setStep(STEP.DONE)
      scrollTo(doneRef)
    } else {
      setStep(STEP.DOSAGE)
      scrollTo(dosageRef)
    }
  }

  function handleDosageConfirm(data) {
    setDosage(data)
    setStep(STEP.DONE)
    scrollTo(doneRef)
  }

  function getDoneContent() {
    if (ctResult?.bleeding) {
      return {
        icon: '🔴',
        iconBg: 'bg-red-100',
        borderColor: 'border-red-400',
        title: 'Hemorragia intracraneal',
        body: 'La TC evidencia hemorragia. Trombolisis contraindicada. Derivar a Neurocirugía.',
      }
    }
    if (contraindications?.hasAbsolute) {
      return {
        icon: '🔴',
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
        icon: '✓',
        iconBg: 'bg-emerald-100',
        borderColor: 'border-emerald-500',
        title: 'Trombolisis indicada',
        body: `${drugName} — ${doseStr}. Protocolo completo registrado.`,
      }
    }
    if (contraindications?.hasRelative) {
      return {
        icon: '🟡',
        iconBg: 'bg-amber-100',
        borderColor: 'border-amber-400',
        title: 'Contraindicación relativa — valorar riesgo/beneficio',
        body: 'Interconsulta con coordinación antes de proceder. Decisión individualizada.',
      }
    }
    return {
      icon: '✓',
      iconBg: 'bg-emerald-100',
      borderColor: 'border-emerald-500',
      title: 'Fase inicial completa',
      body: 'Datos registrados. Continuar con evaluación para trombolisis.',
    }
  }

  if (step === STEP.START) {
    return <StartStep onStart={handleStart} />
  }

  const done = step === STEP.DONE ? getDoneContent() : null

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <GlobalTimer startTime={timerStart} />

      {patient && step > STEP.ALERT && (
        <div className="bg-brand-600 px-4 py-3 sticky top-0 z-40">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <p className="text-brand-300 text-xs uppercase tracking-wider">Código Stroke</p>
              <p className="text-white font-semibold text-sm">{patient.name}</p>
            </div>
            <p className="text-brand-300 text-xs">DNI {patient.dni}</p>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto pt-4 space-y-3">
        {step >= STEP.PATIENT && (
          <PatientStep
            onConfirm={handlePatientConfirm}
            confirmed={step > STEP.ALERT}
            patient={patient}
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
            <CTResultStep onConfirm={handleCtResultConfirm} />
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

        {step === STEP.DONE && done && (
          <div ref={doneRef} className="px-4 pb-4 animate-slide-down">
            <div className={`bg-white rounded-xl border-l-4 ${done.borderColor} shadow-sm p-6`}>
              <div className={`w-14 h-14 ${done.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl`}>
                {done.icon === '✓'
                  ? <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  : <span>{done.icon}</span>
                }
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
