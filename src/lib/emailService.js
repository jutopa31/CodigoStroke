import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export async function sendStrokeAlert({ patient, startTime }) {
  const params = {
    patient_name: patient.name,
    patient_dni: patient.dni,
    start_time: startTime.toLocaleString('es-AR'),
    hospital: 'Guardia — Código Stroke',
  }

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.info('[EmailJS] Variables de entorno no configuradas — simulando envío:', params)
    return { mock: true }
  }

  return emailjs.send(SERVICE_ID, TEMPLATE_ID, params, PUBLIC_KEY)
}
