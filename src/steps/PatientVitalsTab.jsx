import { useState, useRef, useEffect } from 'react'
import { User, CheckCircle2, AlertTriangle, CreditCard, Lock, BookOpen, ScanLine, Heart, Droplets, Zap, ChevronRight } from 'lucide-react'
import DniQrScanner from '../components/DniQrScanner'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas',                  desc: 'Sin síntomas.' },
  { score: 1, label: 'Sin discapacidad significativa', desc: 'A pesar de síntomas realiza actividades cotidianas.' },
  { score: 2, label: 'Incapacidad leve',               desc: 'Incapaz de actividades previas; capaz de algunas sin asistencia.' },
  { score: 3, label: 'Incapacidad moderada',           desc: 'Requiere alguna ayuda, pero camina sin ayuda.' },
  { score: 4, label: 'Incapacidad mod. severa',        desc: 'Incapaz de caminar sin ayuda y de atender necesidades corporales sin ayuda.' },
  { score: 5, label: 'Incapacidad severa',             desc: 'Confinado a cama, incontinente; requiere cuidado constante de enfermería.' },
]

// ── Patient section ──────────────────────────────────────────────────────────

function PatientSection({ patient, patientId, arrivalTime, onConfirm, onOpenEducational }) {
  const [dni, setDni]               = useState('')
  const [name, setName]             = useState('')
  const [pass, setPass]             = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const nameRef = useRef(null)
  const passRef = useRef(null)
  const valid   = dni.trim().length >= 7 && name.trim().length >= 2
  const hasName = name.trim().length >= 2
  const hasDni  = dni.trim().length >= 7

  function handleScan({ name: scannedName, dni: scannedDni }) {
    setName(scannedName)
    setDni(scannedDni)
    setShowScanner(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({ dni: dni.trim(), name: name.trim(), passphrase: pass.trim() })
  }

  if (patient) {
    return (
      <div className="flex items-center gap-3 px-3 py-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <User size={16} className="text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-800 truncate">{patient.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            DNI {patient.dni}
            {arrivalTime && ` · ${arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
            {patientId && <span className="ml-1.5"><span className="text-neutral-400 font-normal">ID </span><span className="font-mono font-bold text-brand-600">{patientId}</span></span>}
          </p>
        </div>
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
      </div>
    )
  }

  return (
    <>
      {showScanner && <DniQrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {/* Header: scan badge + educational mode */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setShowScanner(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1.5 rounded-lg transition-colors">
          <ScanLine size={13} strokeWidth={2} />
          Escanear DNI
        </button>
        {onOpenEducational && (
          <button type="button" onClick={onOpenEducational}
            className="flex items-center gap-1 text-[11px] text-neutral-300 hover:text-amber-500 transition-colors">
            <BookOpen size={11} strokeWidth={2} /> Modo educativo
          </button>
        )}
      </div>

      {/* Live identity card preview */}
      <div className="rounded-2xl p-4 mb-3 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)' }}>
        <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
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
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1.5">
              <CreditCard size={10} /> DNI
            </label>
            <input
              type="text" inputMode="numeric" pattern="[0-9]*" placeholder="12345678"
              value={dni} onChange={(e) => setDni(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
              autoFocus
              className="h-[42px] w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm font-semibold text-neutral-800 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder-neutral-300 transition-all outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1.5">
              <User size={10} /> Nombre
            </label>
            <input
              ref={nameRef} type="text" placeholder="Nombre y apellido"
              value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passRef.current?.focus() } }}
              className="h-[42px] w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm text-neutral-800 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder-neutral-300 transition-all outline-none"
            />
          </div>
        </div>

        {/* Passphrase — colapsada por defecto */}
        <div>
          <button type="button" onClick={() => setShowPassphrase(v => !v)}
            className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors">
            <Lock size={11} strokeWidth={2} />
            <span>{showPassphrase ? 'Ocultar contraseña de turno' : 'Agregar contraseña de turno (opcional)'}</span>
            <ChevronRight size={11} strokeWidth={2} className={`transition-transform ${showPassphrase ? 'rotate-90' : ''}`} />
          </button>
          {showPassphrase && (
            <input
              ref={passRef} type="password" placeholder="Frase de acceso"
              value={pass} onChange={(e) => setPass(e.target.value)}
              className="mt-2 h-10 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm text-neutral-800 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder-neutral-300 transition-all outline-none"
            />
          )}
        </div>

        <button type="submit" disabled={!valid}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98]
            ${valid ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>
          <Zap size={15} strokeWidth={2.5} />
          Activar Código Stroke
        </button>
      </form>
    </>
  )
}

// ── Vitals section ────────────────────────────────────────────────────────────

function VitalsSection({ vitals, onConfirm, draftVitals, onDraftChange }) {
  const [sys,     setSys]     = useState(vitals ? String(vitals.systolic)  : (draftVitals?.sys ?? ''))
  const [dia,     setDia]     = useState(vitals ? String(vitals.diastolic) : (draftVitals?.dia ?? ''))
  const [glucose, setGlucose] = useState(vitals ? String(vitals.glucose)  : (draftVitals?.glucose ?? ''))
  const [mrs,     setMrs]     = useState(vitals?.modifiedRankinScale?.score ?? draftVitals?.mrs ?? null)
  const sysRef     = useRef(null)
  const diaRef     = useRef(null)
  const glucoseRef = useRef(null)

  useEffect(() => {
    if (!vitals) {
      const t = setTimeout(() => sysRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!vitals && onDraftChange) {
      onDraftChange({ sys, dia, glucose, mrs })
    }
  }, [sys, dia, glucose, mrs])

  const sysNum  = parseFloat(sys)
  const diaNum  = parseFloat(dia)
  const glucNum = parseFloat(glucose)
  const taCrit  = sys && sysNum > 185
  const diaCrit = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh= glucose && glucNum > 400
  const valid   = sys && dia && glucose && mrs !== null

  function handleConfirm() {
    if (!valid) return
    onConfirm({
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
      modifiedRankinScale: { score: mrs, label: MRS_OPTIONS[mrs].label },
    })
  }

  if (vitals) {
    const v = vitals
    const taWarn  = v.systolic > 185 || v.diastolic > 110
    const glucWarn = v.glucose < 50 || v.glucose > 400
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className={`col-span-1 rounded-xl px-3 py-2.5 ${taWarn ? 'bg-blue-50 border border-blue-200' : 'bg-neutral-50 border border-neutral-100'}`}>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">TA</p>
          <p className={`text-sm font-bold tabular-nums leading-none ${taWarn ? 'text-blue-900' : 'text-neutral-800'}`}>{v.systolic}/{v.diastolic}</p>
          <p className="text-[9px] text-neutral-400 mt-0.5">mmHg</p>
        </div>
        <div className={`col-span-1 rounded-xl px-3 py-2.5 ${glucWarn ? 'bg-amber-50 border border-amber-200' : 'bg-neutral-50 border border-neutral-100'}`}>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">Glucemia</p>
          <p className={`text-sm font-bold tabular-nums leading-none ${glucWarn ? 'text-amber-700' : 'text-neutral-800'}`}>{v.glucose}</p>
          <p className="text-[9px] text-neutral-400 mt-0.5">mg/dL</p>
        </div>
        <div className="col-span-1 rounded-xl px-3 py-2.5 bg-neutral-50 border border-neutral-100">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">mRS basal</p>
          <p className="text-sm font-bold tabular-nums leading-none text-neutral-800">{v.modifiedRankinScale?.score ?? '—'}</p>
          <p className="text-[9px] text-neutral-400 mt-0.5 truncate">{v.modifiedRankinScale?.label ?? 'pts'}</p>
        </div>
      </div>
    )
  }

  const numInputCls = (warn, filled) =>
    'w-full rounded-xl border py-3 text-2xl font-bold text-center text-neutral-800 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-neutral-200 ' +
    (warn
      ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
      : filled
        ? 'border-blue-300 bg-blue-50/30 focus:border-blue-400 focus:ring-blue-100'
        : 'border-neutral-200 bg-white focus:border-blue-300 focus:ring-blue-100')

  const glucInputCls =
    'w-full rounded-xl border py-3 text-2xl font-bold text-center text-neutral-800 pr-14 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-neutral-200 ' +
    (glucLow || glucHigh
      ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
      : glucose
        ? 'border-violet-300 bg-violet-50/20 focus:border-violet-400 focus:ring-violet-100'
        : 'border-neutral-200 bg-white focus:border-violet-300 focus:ring-violet-100')

  const missing = [!sys && 'PAS', !dia && 'PAD', !glucose && 'glucemia', mrs === null && 'mRS'].filter(Boolean)

  return (
    <div className="space-y-4">

      {/* ── Tensión arterial ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Heart size={12} className="text-blue-600" />
            <p className="text-xs font-semibold text-neutral-700">Tensión arterial</p>
          </div>
          <span className="text-[10px] font-medium text-neutral-400">mmHg · meta ≤185/110</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              ref={sysRef}
              type="text" inputMode="numeric" maxLength={3} placeholder="—"
              value={sys}
              onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); diaRef.current?.focus() } }}
              className={numInputCls(taCrit, !!sys)}
            />
            <p className={`text-[10px] text-center mt-1 font-medium ${taCrit ? 'text-red-500' : 'text-neutral-400'}`}>
              Sistólica
            </p>
          </div>
          <div>
            <input
              ref={diaRef}
              type="text" inputMode="numeric" maxLength={3} placeholder="—"
              value={dia}
              onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); glucoseRef.current?.focus() } }}
              className={numInputCls(diaCrit, !!dia)}
            />
            <p className={`text-[10px] text-center mt-1 font-medium ${diaCrit ? 'text-red-500' : 'text-neutral-400'}`}>
              Diastólica
            </p>
          </div>
        </div>

        {(taCrit || diaCrit) && (
          <div className="flex items-start gap-2 mt-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
            <AlertTriangle size={11} className="shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs text-red-600">
              {taCrit && 'PAS >185 mmHg — ajustar antes de trombolisis. '}
              {diaCrit && 'PAD >110 mmHg — ajustar antes de trombolisis.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── Glucemia ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Droplets size={12} className="text-violet-600" />
            <p className="text-xs font-semibold text-neutral-700">Glucemia</p>
          </div>
          <span className="text-[10px] font-medium text-neutral-400">rango 50–400 mg/dL</span>
        </div>

        <div className="relative">
          <input
            ref={glucoseRef}
            type="text" inputMode="numeric" maxLength={3} placeholder="—"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
            className={glucInputCls}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-neutral-400">
            mg/dL
          </span>
        </div>

        {(glucLow || glucHigh) && (
          <div className="flex items-start gap-2 mt-2 rounded-lg border border-red-100 bg-red-50/60 px-3 py-2">
            <AlertTriangle size={11} className="shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs text-red-600">
              {glucLow  && 'Hipoglucemia <50 mg/dL — corregir antes de trombolisis. '}
              {glucHigh && 'Hiperglucemia >400 mg/dL — controlar antes de proceder.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── mRS ── */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
          mRS basal (funcionalidad previa)
        </p>
        <div className="grid grid-cols-6 gap-1">
          {MRS_OPTIONS.map((o) => (
            <button key={o.score} type="button" onClick={() => setMrs(o.score)}
              title={o.label}
              className={`rounded-lg border py-2 text-sm font-bold transition-all active:scale-95 ${
                mrs === o.score
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                  : 'border-neutral-200 text-neutral-500 hover:border-brand-300 hover:bg-brand-50/40'
              }`}>
              {o.score}
            </button>
          ))}
        </div>
        {mrs !== null && (
          <div className="mt-1.5 px-2.5 py-1.5 bg-brand-50 rounded-lg border border-brand-100 animate-fade-in">
            <p className="text-[11px] font-semibold text-brand-700 leading-tight">{MRS_OPTIONS[mrs].label}</p>
            <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{MRS_OPTIONS[mrs].desc}</p>
          </div>
        )}
      </div>

      {/* ── Botón confirmar al pie ── */}
      <button type="button" onClick={handleConfirm} disabled={!valid}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
          valid ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
        }`}>
        {valid ? <><CheckCircle2 size={14}/> Registrar signos vitales</> : `Completá: ${missing.join(' · ')}`}
      </button>

    </div>
  )
}

// ── PatientVitalsTab (exported) ──────────────────────────────────────────────

export default function PatientVitalsTab({
  patient,
  patientId,
  arrivalTime,
  vitals,
  onPatientConfirm,
  onVitalsConfirm,
  onOpenEducational,
  draftVitals,
  onDraftVitalsChange,
}) {
  const patientDone = !!patient
  const vitalsDone  = vitals !== null

  return (
      <div className="px-4 pb-4 space-y-3 md:px-0">
      {/* Completion banner */}
      {patientDone && vitalsDone && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Paciente y signos vitales registrados</p>
        </div>
      )}

      {/* Patient section */}
      <div className="bg-white rounded-xl border border-neutral-100 p-3 md:max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2.5">Identificación del paciente</p>
        <PatientSection
          patient={patient}
          patientId={patientId}
          arrivalTime={arrivalTime}
          onConfirm={onPatientConfirm}
          onOpenEducational={onOpenEducational}
        />
      </div>

      {/* Vitals section — only shown after patient is registered */}
      {patientDone ? (
        <div className="bg-white rounded-xl border border-neutral-100 p-3 transition-all md:max-w-3xl animate-fade-in">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2.5 md:text-xs md:text-neutral-500">Signos vitales</p>
          <VitalsSection vitals={vitals} onConfirm={onVitalsConfirm} draftVitals={draftVitals} onDraftChange={onDraftVitalsChange} />
        </div>
      ) : (
        <div className="bg-neutral-50 rounded-xl border border-dashed border-neutral-200 p-4 md:max-w-3xl">
          <div className="flex items-center gap-3 text-neutral-400">
            <Lock size={16} strokeWidth={1.5} className="shrink-0" />
            <div>
              <p className="text-xs font-semibold text-neutral-500">Signos vitales</p>
              <p className="text-[11px] mt-0.5">Se habilita al activar el código stroke</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
