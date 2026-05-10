import { useState } from 'react'
import { User, CreditCard, Lock, ChevronRight, CheckCircle2 } from 'lucide-react'
import StepCard from '../components/StepCard'

export default function PatientStep({ onConfirm, confirmed = false, patient = null, patientId = null, arrivalTime = null }) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const valid = dni.trim().length >= 7 && name.trim().length >= 2

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({ dni: dni.trim(), name: name.trim(), passphrase: passphrase.trim() })
  }

  // Confirmed / locked state
  if (confirmed && patient) {
    return (
      <div className="px-4 pt-6 pb-2">
        <StepCard step="1" title="Datos del paciente" accent="green">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{patient.name}</p>
              <p className="text-sm text-gray-400 mt-0.5">DNI {patient.dni}</p>
            </div>
            <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
          </div>
          {patientId && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">ID del caso</p>
              <p className="text-base font-mono font-bold text-brand-600 tracking-widest">{patientId}</p>
            </div>
          )}
          {arrivalTime && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Llegada / carga de datos</p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {arrivalTime.toLocaleTimeString('es-AR')}
              </p>
            </div>
          )}
        </StepCard>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <StepCard step="1" title="Datos del paciente" accent="red">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <CreditCard size={13} /> DNI
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Número de documento"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <User size={13} /> Nombre y apellido
            </label>
            <input
              type="text"
              placeholder="Apellido, Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Lock size={13} /> Contraseña de turno
            </label>
            <input
              type="password"
              placeholder="Frase de acceso"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
            />
            <p className="text-xs text-gray-400 mt-1">Requerida para registro completo (próximamente)</p>
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            Confirmar datos <ChevronRight size={18} />
          </button>
        </form>
      </StepCard>
    </div>
  )
}
