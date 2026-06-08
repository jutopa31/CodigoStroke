import { useRef, useState } from 'react'
import { User, CreditCard, Lock, ChevronRight, CheckCircle2, BookOpen, ScanLine } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import DniQrScanner from '../components/DniQrScanner'

function fmtTime(date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function PatientStep({ onConfirm, confirmed = false, patient = null, patientId = null, arrivalTime = null, vitals = null, isCollapsed = false, onOpenEducational }) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const nameRef = useRef(null)
  const passphraseRef = useRef(null)

  const valid = dni.trim().length >= 7 && name.trim().length >= 2
  const showHint = !valid && (dni.length > 0 || name.length > 0)

  function handleScan({ name: scannedName, dni: scannedDni }) {
    setName(scannedName)
    setDni(scannedDni)
    setShowScanner(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({
      dni: dni.trim(),
      name: name.trim(),
      passphrase: passphrase.trim(),
    })
  }

  function focusNext(event, ref) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    ref.current?.focus()
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
          {/* Top row: name + meta badges + checkmark */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="font-semibold text-stroke-text leading-snug">{patient.name}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="text-xs text-stroke-textMuted">DNI {patient.dni}</span>
                {patientId && (
                  <span className="text-xs font-mono font-bold text-stroke-iconActive tracking-wider">{patientId}</span>
                )}
                {arrivalTime && (
                  <span className="text-xs text-stroke-textMuted tabular-nums">
                    Llegada {arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          </div>

          {/* Vitals row — horizontal pills */}
          {v && (
            <div className="grid grid-cols-3 gap-1.5">
              <div className={`rounded-lg px-2.5 py-2 ${v.systolic > 185 || v.diastolic > 110 ? 'bg-blue-900/10' : 'bg-stroke-bg'}`}>
                <p className="text-[9px] text-stroke-textMuted uppercase tracking-wider font-semibold mb-1">TA</p>
                <p className={`text-base font-bold tabular-nums leading-none ${v.systolic > 185 || v.diastolic > 110 ? 'text-blue-300' : 'text-stroke-text'}`}>
                  {v.systolic}/{v.diastolic}
                </p>
                <p className="text-[9px] text-stroke-textMuted mt-0.5">mmHg</p>
              </div>
              <div className={`rounded-lg px-2.5 py-2 ${v.glucose < 50 || v.glucose > 400 ? 'bg-blue-900/10' : 'bg-stroke-bg'}`}>
                <p className="text-[9px] text-stroke-textMuted uppercase tracking-wider font-semibold mb-1">Glucemia</p>
                <p className={`text-base font-bold tabular-nums leading-none ${v.glucose < 50 || v.glucose > 400 ? 'text-blue-300' : 'text-stroke-text'}`}>
                  {v.glucose}
                </p>
                <p className="text-[9px] text-stroke-textMuted mt-0.5">mg/dL</p>
              </div>
              <div className="bg-stroke-bg rounded-lg px-2.5 py-2">
                <p className="text-[9px] text-stroke-textMuted uppercase tracking-wider font-semibold mb-1">mRS basal</p>
                <p className="text-base font-bold text-stroke-text tabular-nums leading-none">
                  {v.modifiedRankinScale?.score ?? '—'}
                </p>
                <p className="text-[9px] text-stroke-textMuted mt-0.5">pts</p>
              </div>
            </div>
          )}
        </StepCard>
      </div>
    )
  }

  if (confirmed) return null

  const hasName = name.trim().length >= 2
  const hasDni = dni.trim().length >= 7

  return (
    <div className="pb-4">
      {showScanner && (
        <DniQrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
      <StepCard step="1" title="Datos del paciente" accent="blue">

        {/* Header row: scan button + educational mode */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stroke-iconActive bg-stroke-iconActive/10 hover:bg-stroke-iconActive/20 border border-stroke-iconActive/40 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ScanLine size={13} strokeWidth={2} />
            Escanear DNI
          </button>
          {onOpenEducational && (
            <button
              type="button"
              onClick={onOpenEducational}
              className="flex items-center gap-1.5 text-xs text-stroke-textMuted hover:text-amber-400 transition-colors"
            >
              <BookOpen size={13} strokeWidth={2} />
              Modo educativo
            </button>
          )}
        </div>

        {/* Live identity card preview */}
        <div
          className="rounded-2xl p-4 mb-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)' }}
        >
          {/* decorative circles */}
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-stroke-bg pointer-events-none" />
          <div className="absolute -bottom-8 -left-2 w-20 h-20 rounded-full bg-white/[0.04] pointer-events-none" />

          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/50 mb-2.5">
            Código Stroke · Paciente
          </p>
          <p className={`text-[17px] font-black leading-tight ${hasName ? 'text-white' : 'text-white/25 font-normal italic text-sm'}`}>
            {hasName ? name.trim() : 'Nombre del paciente'}
          </p>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.08em]">DNI</p>
              <p className={`text-[13px] font-bold font-mono ${hasDni ? 'text-white' : 'text-white/20'}`}>
                {hasDni ? dni.trim() : '——'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-white/40 uppercase tracking-[0.08em]">Llegada</p>
              <p className="text-[13px] font-bold font-mono text-white/70">
                {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* DNI + Nombre en dos columnas */}
          <div className="grid grid-cols-[1fr_1.5fr] gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-stroke-textMuted uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <CreditCard size={11} strokeWidth={2} /> DNI
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="12345678"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                onKeyDown={(event) => focusNext(event, nameRef)}
                autoFocus
                className="h-[42px] w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm font-semibold text-stroke-text focus:bg-stroke-navy focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-stroke-textMuted uppercase tracking-wider flex items-center gap-1 mb-1.5">
                <User size={11} strokeWidth={2} /> Nombre
              </label>
              <input
                ref={nameRef}
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(event) => focusNext(event, passphraseRef)}
                className="h-[42px] w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm text-stroke-text focus:bg-stroke-navy focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Passphrase — collapsed por defecto */}
          <div>
            <button
              type="button"
              onClick={() => setShowPassphrase((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-stroke-textMuted hover:text-stroke-textMuted transition-colors"
            >
              <Lock size={11} strokeWidth={2} />
              <span>{showPassphrase ? 'Ocultar contraseña de turno' : 'Agregar contraseña de turno (opcional)'}</span>
              <ChevronRight
                size={11}
                strokeWidth={2}
                className={`transition-transform ${showPassphrase ? 'rotate-90' : ''}`}
              />
            </button>
            {showPassphrase && (
              <input
                ref={passphraseRef}
                type="password"
                placeholder="Frase de acceso"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="mt-2 h-10 w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm text-stroke-text focus:bg-stroke-navy focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stroke-panel disabled:text-stroke-textMuted"
          >
            Confirmar y activar código <ChevronRight size={16} strokeWidth={2} />
          </button>

          {showHint && (
            <p className="text-xs text-stroke-textMuted text-center animate-fade-in">
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
