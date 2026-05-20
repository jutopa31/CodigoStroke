import { useRef, useState } from 'react'
import { User, CreditCard, Lock, ChevronRight, CheckCircle2, Plus } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'

function fmtTime(date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function PatientStep({ onConfirm, confirmed = false, patient = null, patientId = null, arrivalTime = null, vitals = null, isCollapsed = false }) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const nameRef = useRef(null)
  const passphraseRef = useRef(null)

  const valid = dni.trim().length >= 7 && name.trim().length >= 2
  const showHint = !valid && (dni.length > 0 || name.length > 0)

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({ dni: dni.trim(), name: name.trim(), passphrase: passphrase.trim() })
  }

  // Collapsed one-liner
  if (isCollapsed && confirmed && patient) {
    return (
      <CollapsedStep title="Datos del paciente">
        {patient.name} · DNI {patient.dni}
        {arrivalTime ? ` · ${fmtTime(arrivalTime)}` : ''}
      </CollapsedStep>
    )
  }

  // Confirmed / locked state
  if (confirmed && patient) {
    const v = vitals
    return (
      <div className="pb-2">
        <StepCard step="1" title="Datos del paciente" accent="green">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="font-semibold text-neutral-800 leading-snug">{patient.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="text-xs text-neutral-400">DNI {patient.dni}</span>
                {patientId && (
                  <span className="text-xs font-mono font-bold text-brand-600 tracking-wider">{patientId}</span>
                )}
                {arrivalTime && (
                  <span className="text-xs text-neutral-400 tabular-nums">
                    Llegada {arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          </div>

          {v && (
            <div className="grid grid-cols-3 gap-2">
              <div className={`rounded-xl px-3 py-2.5 ${v.systolic > 185 || v.diastolic > 110 ? 'bg-blue-900/10' : 'bg-neutral-50'}`}>
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">TA</p>
                <p className={`text-base font-bold tabular-nums leading-none ${v.systolic > 185 || v.diastolic > 110 ? 'text-blue-900' : 'text-neutral-800'}`}>
                  {v.systolic}/{v.diastolic}
                </p>
                <p className="text-[9px] text-neutral-400 mt-0.5">mmHg</p>
              </div>
              <div className={`rounded-xl px-3 py-2.5 ${v.glucose < 50 || v.glucose > 400 ? 'bg-blue-900/10' : 'bg-neutral-50'}`}>
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">Glucemia</p>
                <p className={`text-base font-bold tabular-nums leading-none ${v.glucose < 50 || v.glucose > 400 ? 'text-blue-900' : 'text-neutral-800'}`}>
                  {v.glucose}
                </p>
                <p className="text-[9px] text-neutral-400 mt-0.5">mg/dL</p>
              </div>
              <div className="bg-neutral-50 rounded-xl px-3 py-2.5">
                <p className="text-[9px] text-neutral-400 uppercase tracking-wider font-semibold mb-1">mRS basal</p>
                <p className="text-base font-bold text-neutral-800 tabular-nums leading-none">
                  {v.modifiedRankinScale?.score ?? '—'}
                </p>
                <p className="text-[9px] text-neutral-400 mt-0.5">pts</p>
              </div>
            </div>
          )}
        </StepCard>
      </div>
    )
  }

  if (confirmed) return null

  return (
    <div className="pb-4">
      <StepCard step="1" title="Datos del paciente" accent="red">
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* DNI — full width, teclado numérico */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1.5">
              <CreditCard size={11} strokeWidth={2} /> DNI
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Número de documento"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
              autoFocus
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-lg font-semibold tabular-nums focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
            />
          </div>

          {/* Nombre — full width */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1.5">
              <User size={11} strokeWidth={2} /> Nombre y apellido
            </label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (showPassphrase) passphraseRef.current?.focus()
                  else if (valid) handleSubmit(e)
                }
              }}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-base focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
            />
          </div>

          {/* Contraseña — oculta por defecto */}
          {showPassphrase ? (
            <div className="animate-fade-in">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-1.5">
                <Lock size={11} strokeWidth={2} /> Contraseña de turno
              </label>
              <input
                ref={passphraseRef}
                type="password"
                placeholder="Frase de acceso"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-neutral-800 text-base focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setShowPassphrase(true); setTimeout(() => passphraseRef.current?.focus(), 50) }}
              className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors py-0.5"
            >
              <Plus size={11} />
              Agregar contraseña de turno
            </button>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed"
          >
            Activar código <ChevronRight size={16} strokeWidth={2} />
          </button>

          {showHint && (
            <p className="text-xs text-neutral-400 text-center animate-fade-in">
              {dni.length < 7 && name.trim().length < 2
                ? 'Completá el DNI y el nombre'
                : dni.length < 7
                ? 'DNI mínimo 7 dígitos'
                : 'Nombre mínimo 2 caracteres'}
            </p>
          )}
        </form>
      </StepCard>
    </div>
  )
}
