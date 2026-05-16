import { useState } from 'react'
import { User, CreditCard, Lock, ChevronRight, CheckCircle2 } from 'lucide-react'
import StepCard from '../components/StepCard'

export default function PatientStep({ onConfirm, confirmed = false, patient = null, patientId = null, arrivalTime = null, vitals = null }) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')

  const valid = dni.trim().length >= 7 && name.trim().length >= 2
  const showHint = !valid && (dni.length > 0 || name.length > 0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({
      dni: dni.trim(),
      name: name.trim(),
      passphrase: passphrase.trim(),
    })
  }

  // Confirmed / locked state
  if (confirmed && patient) {
    const v = vitals
    return (
      <div className="px-4 pb-2">
        <StepCard step="1" title="Datos del paciente" accent="green">
          <div className="flex items-start gap-3">
            {/* Left: patient info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800 leading-snug">{patient.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">DNI {patient.dni}</p>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              </div>
              {patientId && (
                <div className="mt-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">ID del caso</p>
                  <p className="text-sm font-mono font-bold text-brand-600 tracking-widest">{patientId}</p>
                </div>
              )}
              {arrivalTime && (
                <div className="mt-1.5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">Llegada</p>
                  <p className="text-sm font-mono font-semibold text-gray-700">
                    {arrivalTime.toLocaleTimeString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            {/* Right: vitals vertical */}
            {v && (
              <div className="flex flex-col gap-1 shrink-0 text-right">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">TA</p>
                  <p className={`text-sm font-bold tabular-nums ${v.systolic > 185 || v.diastolic > 110 ? 'text-red-600' : 'text-gray-800'}`}>
                    {v.systolic}/{v.diastolic}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">GLC</p>
                  <p className={`text-sm font-bold tabular-nums ${v.glucose < 50 || v.glucose > 400 ? 'text-red-600' : 'text-gray-800'}`}>
                    {v.glucose} <span className="text-[9px] font-normal">mg/dL</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">mRS</p>
                  <p className="text-sm font-bold text-gray-800 tabular-nums">{v.modifiedRankinScale?.score ?? '—'}</p>
                </div>
              </div>
            )}
          </div>
        </StepCard>
      </div>
    )
  }

  // fallback if confirmed but no patient yet
  if (confirmed) return null

  return (
    <div className="px-4 pb-4">
      <StepCard step="1" title="Datos del paciente" accent="red">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Identificación */}
          <div className="grid grid-cols-2 gap-3">
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
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <User size={13} /> Nombre y apellido
              </label>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
                required
              />
            </div>
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
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Confirmar datos <ChevronRight size={18} />
          </button>

          {showHint && (
            <p className="text-xs text-gray-400 text-center animate-fade-in">
              {dni.length < 7 && name.trim().length < 2
                ? 'Completá el DNI (mín. 7 dígitos) y el nombre'
                : dni.length < 7
                ? 'El DNI debe tener al menos 7 dígitos'
                : 'El nombre debe tener al menos 2 caracteres'}
            </p>
          )}
        </form>
      </StepCard>
    </div>
  )
}
