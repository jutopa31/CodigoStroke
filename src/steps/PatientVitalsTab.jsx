import { useState, useRef, useEffect } from 'react'
import { User, CheckCircle2, AlertTriangle, CreditCard, Lock, BookOpen, ScanLine, Heart, Activity, Droplets } from 'lucide-react'
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
  const [dni, setDni]           = useState('')
  const [name, setName]         = useState('')
  const [pass, setPass]         = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const nameRef                 = useRef(null)
  const passRef                 = useRef(null)
  const valid                   = dni.trim().length >= 7 && name.trim().length >= 2

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
    <form onSubmit={handleSubmit} className="space-y-2.5 md:space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={() => setShowScanner(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors">
          <ScanLine size={13} strokeWidth={2} />
          Escanear QR del DNI
        </button>
        {onOpenEducational && (
          <button type="button" onClick={onOpenEducational}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-amber-600 transition-colors">
            <BookOpen size={12} strokeWidth={2} /> Modo educativo
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-[12rem]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1 md:text-xs md:text-neutral-500 md:mb-1.5">
            <CreditCard size={10} /> DNI
          </label>
          <input
            type="number" inputMode="numeric" placeholder="38999123"
            value={dni} onChange={(e) => setDni(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
            autoFocus
            className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
          />
        </div>
        <div className="w-full sm:w-[18rem]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1 md:text-xs md:text-neutral-500 md:mb-1.5">
            <User size={10} /> Nombre
          </label>
          <input
            ref={nameRef} type="text" placeholder="Nombre y apellido"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passRef.current?.focus() } }}
            className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={passRef} type="password" placeholder="Contraseña de turno (opcional)"
          value={pass} onChange={(e) => setPass(e.target.value)}
          className="h-10 w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all sm:w-[18rem]"
        />
        <button type="submit" disabled={!valid}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed sm:w-auto
            bg-brand-600 hover:bg-brand-700 text-white disabled:bg-neutral-100 disabled:text-neutral-400">
          <Lock size={14} /> Activar Código Stroke
        </button>
      </div>
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
    return (
      <div className="grid grid-cols-4 gap-2 md:gap-3">
        {[
          { label: 'TA',       value: `${v.systolic}/${v.diastolic}`, unit: 'mmHg', warn: v.systolic > 185 || v.diastolic > 110 },
          { label: 'Glucemia', value: v.glucose,                       unit: 'mg/dL', warn: v.glucose < 50 || v.glucose > 400 },
          { label: 'mRS',      value: v.modifiedRankinScale?.score ?? '—', unit: 'pts', warn: false },
        ].map(({ label, value, unit, warn }) => (
          <div key={label}
            className={`rounded-xl px-2 py-2 col-span-${label === 'TA' ? 2 : 1} md:px-4 md:py-4 ${warn ? 'bg-blue-900/8 border border-blue-800/20' : 'bg-neutral-50 border border-neutral-100'}`}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5 md:text-xs md:text-neutral-500">{label}</p>
            <p className={`text-sm font-bold tabular-nums leading-none md:text-xl ${warn ? 'text-blue-900' : 'text-neutral-800'}`}>{value}</p>
            <p className="text-[9px] text-neutral-400 mt-0.5 md:text-xs">{unit}</p>
          </div>
        ))}
        <div className="col-span-1 rounded-xl px-2 py-2 bg-emerald-50 border border-emerald-100 flex items-center justify-center md:px-4 md:py-4">
          <CheckCircle2 size={14} className="text-emerald-500" />
        </div>
      </div>
    )
  }

  const taInputCls = (warn, filled) =>
    'flex-1 rounded-xl border py-2.5 text-xl font-bold text-center text-neutral-800 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-neutral-300 ' +
    (warn
      ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
      : filled
        ? 'border-blue-300 bg-blue-50/30 focus:border-blue-400 focus:ring-blue-100'
        : 'border-neutral-200 bg-white focus:border-blue-300 focus:ring-blue-100')

  const glucInputCls =
    'w-full rounded-xl border py-2.5 text-xl font-bold text-center text-neutral-800 pr-16 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-neutral-300 ' +
    (glucLow || glucHigh
      ? 'border-red-300 bg-red-50/40 focus:border-red-400 focus:ring-red-100'
      : glucose
        ? 'border-violet-300 bg-violet-50/20 focus:border-violet-400 focus:ring-violet-100'
        : 'border-neutral-200 bg-white focus:border-violet-300 focus:ring-violet-100')

  return (
    <div className="space-y-4">

      {/* ── Tensión arterial ── */}
      <div>
        <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-xl bg-blue-50 border border-blue-200">
          <Heart size={13} className="text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold">Tensión arterial</p>
            <p className="mt-0.5 opacity-80">Meta pre-trombolisis: PAS ≤ 185 · PAD ≤ 110 mmHg</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={sysRef}
            type="text" inputMode="numeric" maxLength={3} placeholder="PAS"
            value={sys}
            onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); diaRef.current?.focus() } }}
            className={taInputCls(taCrit, !!sys)}
          />
          <span className="text-neutral-300 font-bold text-xl select-none">/</span>
          <input
            ref={diaRef}
            type="text" inputMode="numeric" maxLength={3} placeholder="PAD"
            value={dia}
            onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); glucoseRef.current?.focus() } }}
            className={taInputCls(diaCrit, !!dia)}
          />
          <div className="flex items-center gap-1 shrink-0">
            <Activity size={11} className="text-neutral-400" />
            <span className="text-xs text-neutral-400 font-medium">mmHg</span>
          </div>
        </div>

        {(taCrit || diaCrit) && (
          <div className="flex items-start gap-2 mt-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2">
            <AlertTriangle size={11} className="shrink-0 text-red-500 mt-0.5" />
            <p className="text-xs text-red-600">
              {taCrit && 'TA sistólica >185 mmHg — ajustar antes de trombolisis. '}
              {diaCrit && 'PAD >110 mmHg — ajustar antes de trombolisis.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100" />

      {/* ── Glucemia ── */}
      <div>
        <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-xl bg-violet-50 border border-violet-200">
          <Droplets size={13} className="text-violet-700 shrink-0 mt-0.5" />
          <div className="text-xs text-violet-800">
            <p className="font-semibold">Glucemia</p>
            <p className="mt-0.5 opacity-80">Rango aceptable: 50 – 400 mg/dL</p>
          </div>
        </div>

        <div className="relative">
          <input
            ref={glucoseRef}
            type="text" inputMode="numeric" maxLength={3} placeholder="mg/dL"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
            className={glucInputCls}
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-neutral-400">
            mg/dL
          </span>
        </div>

        {(glucLow || glucHigh) && (
          <div className="flex items-start gap-2 mt-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2">
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
        <div className="grid grid-cols-6 gap-1 md:max-w-lg">
          {MRS_OPTIONS.map((o) => (
            <button key={o.score} type="button" onClick={() => setMrs(o.score)}
              title={o.label}
              className={`rounded-lg border py-1.5 text-sm font-bold transition-all active:scale-95 ${
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
        {valid ? <><CheckCircle2 size={14}/> Registrar signos vitales</> : 'Completá TA, glucemia y mRS'}
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

      {/* Vitals section */}
      <div className={`bg-white rounded-xl border p-3 transition-all md:max-w-3xl ${patientDone ? 'border-neutral-100' : 'border-neutral-100 opacity-70'}`}>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 md:text-xs md:text-neutral-500">Signos vitales</p>
          {!patientDone && (
            <span className="text-[10px] text-neutral-400 italic md:text-xs">Registrar paciente primero</span>
          )}
        </div>
        {patientDone ? (
          <VitalsSection vitals={vitals} onConfirm={onVitalsConfirm} draftVitals={draftVitals} onDraftChange={onDraftVitalsChange} />
        ) : (
          <div className="grid grid-cols-3 gap-2 opacity-40 pointer-events-none select-none">
            {['TA', 'Glucemia', 'mRS'].map(l => (
              <div key={l} className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-3 text-center">
                <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold md:text-xs">{l}</p>
                <p className="text-xl font-bold text-neutral-200 mt-1">—</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
