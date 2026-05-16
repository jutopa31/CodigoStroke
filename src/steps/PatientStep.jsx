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
      <div className="pb-2">
        <StepCard step="1" title="Datos del paciente" accent="green">
          <div className="flex items-start gap-4">
            {/* Left: patient info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-800 leading-snug">{patient.name}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">DNI {patient.dni}</p>
                </div>
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              </div>
              {patientId && (
                <div className="mt-3">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">ID del caso</p>
                  <p className="text-sm font-mono font-bold text-brand-600 tracking-wider mt-0.5">{patientId}</p>
                </div>
              )}
              {arrivalTime && (
                <div className="mt-2">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">Llegada</p>
                  <p className="text-sm font-mono font-semibold text-neutral-700 mt-0.5">
                    {arrivalTime.toLocaleTimeString('es-AR')}
                  </p>
                </div>
              )}
            </div>

            {/* Right: vitals */}
            {v && (
              <div className="flex flex-col gap-2 shrink-0 text-right">
                <div className="bg-neutral-50 rounded-lg px-3 py-1.5">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">TA</p>
                  <p className={`text-sm font-bold tabular-nums ${v.systolic > 185 || v.diastolic > 110 ? 'text-red-600' : 'text-neutral-800'}`}>
                    {v.systolic}/{v.diastolic}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-3 py-1.5">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">GLC</p>
                  <p className={`text-sm font-bold tabular-nums ${v.glucose < 50 || v.glucose > 400 ? 'text-red-600' : 'text-neutral-800'}`}>
                    {v.glucose}
                  </p>
                </div>
                <div className="bg-neutral-50 rounded-lg px-3 py-1.5">
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-medium">mRS</p>
                  <p className="text-sm font-bold text-neutral-800 tabular-nums">{v.modifiedRankinScale?.score ?? '—'}</p>
                </div>
              </div>
            )}
          </div>
        </StepCard>
      </div>
    )
  }

  if (confirmed) return null

  return (
    <div className="pb-4">
      <StepCard step="1" title="Datos del paciente" accent="red">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identificación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <CreditCard size={12} strokeWidth={2} /> DNI
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Número de documento"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-base focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <User size={12} strokeWidth={2} /> Nombre
              </label>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-base focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Lock size={12} strokeWidth={2} /> Contraseña de turno
            </label>
            <input
              type="password"
              placeholder="Frase de acceso (opcional)"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-base focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            Confirmar y activar código <ChevronRight size={16} strokeWidth={2} />
          </button>

          {showHint && (
            <p className="text-xs text-neutral-400 text-center animate-fade-in">
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
