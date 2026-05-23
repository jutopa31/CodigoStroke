import { useState, useRef } from 'react'
import { User, CheckCircle2, AlertTriangle, CreditCard, Lock, BookOpen, ScanLine } from 'lucide-react'
import DniQrScanner from '../components/DniQrScanner'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas' },
  { score: 1, label: 'Sin discapacidad' },
  { score: 2, label: 'Leve' },
  { score: 3, label: 'Moderada' },
  { score: 4, label: 'Mod. severa' },
  { score: 5, label: 'Severa' },
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
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-200">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <User size={16} className="text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-neutral-800 truncate">{patient.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">
            DNI {patient.dni}
            {arrivalTime && ` · ${arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
            {patientId && <span className="font-mono font-bold text-brand-600 ml-1.5">{patientId}</span>}
          </p>
        </div>
        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
      </div>
    )
  }

  return (
    <>
    {showScanner && <DniQrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex items-center justify-between">
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1">
            <CreditCard size={10} /> DNI
          </label>
          <input
            type="number" inputMode="numeric" placeholder="38999123"
            value={dni} onChange={(e) => setDni(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
            autoFocus
            className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1 mb-1">
            <User size={10} /> Nombre
          </label>
          <input
            ref={nameRef} type="text" placeholder="Nombre y apellido"
            value={name} onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passRef.current?.focus() } }}
            className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
          />
        </div>
      </div>
      <input
        ref={passRef} type="password" placeholder="Contraseña de turno (opcional)"
        value={pass} onChange={(e) => setPass(e.target.value)}
        className="w-full h-10 bg-neutral-50 border border-neutral-200 rounded-xl px-3 text-sm focus:bg-white focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
      />
      <button type="submit" disabled={!valid}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:cursor-not-allowed
          bg-brand-600 hover:bg-brand-700 text-white disabled:bg-neutral-100 disabled:text-neutral-400">
        <Lock size={14} /> Activar Código Stroke
      </button>
    </form>
    </>
  )
}

// ── Vitals section ────────────────────────────────────────────────────────────

function VitalsSection({ vitals, onConfirm }) {
  const [sys,     setSys]     = useState(vitals ? String(vitals.systolic)  : '')
  const [dia,     setDia]     = useState(vitals ? String(vitals.diastolic) : '')
  const [glucose, setGlucose] = useState(vitals ? String(vitals.glucose)  : '')
  const [mrs,     setMrs]     = useState(vitals?.modifiedRankinScale?.score ?? null)
  const diaRef     = useRef(null)
  const glucoseRef = useRef(null)

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
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'TA',       value: `${v.systolic}/${v.diastolic}`, unit: 'mmHg', warn: v.systolic > 185 || v.diastolic > 110 },
          { label: 'Glucemia', value: v.glucose,                       unit: 'mg/dL', warn: v.glucose < 50 || v.glucose > 400 },
          { label: 'mRS',      value: v.modifiedRankinScale?.score ?? '—', unit: 'pts', warn: false },
        ].map(({ label, value, unit, warn }) => (
          <div key={label}
            className={`rounded-xl px-2 py-2 col-span-${label === 'TA' ? 2 : 1} ${warn ? 'bg-blue-900/8 border border-blue-800/20' : 'bg-neutral-50 border border-neutral-100'}`}>
            <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-400 mb-0.5">{label}</p>
            <p className={`text-sm font-bold tabular-nums leading-none ${warn ? 'text-blue-900' : 'text-neutral-800'}`}>{value}</p>
            <p className="text-[9px] text-neutral-400 mt-0.5">{unit}</p>
          </div>
        ))}
        <div className="col-span-1 rounded-xl px-2 py-2 bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={14} className="text-emerald-500" />
        </div>
      </div>
    )
  }

  function fieldCls(warn, filled) {
    return `h-10 rounded-xl border bg-neutral-50 px-2 text-center text-sm font-semibold focus:outline-none transition placeholder:text-neutral-300 ${
      warn   ? 'border-red-300 bg-red-50/40 focus:ring-2 focus:ring-red-100' :
      filled ? 'border-blue-300 bg-blue-50/30 focus:ring-2 focus:ring-blue-100' :
               'border-neutral-200 focus:border-brand-300 focus:ring-2 focus:ring-brand-100'
    }`
  }

  return (
    <div className="space-y-3">
      {/* Sticky confirm — always visible at top while filling fields */}
      <div className="sticky top-0 z-10 bg-white pb-1">
        <button type="button" onClick={handleConfirm} disabled={!valid}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
            valid ? 'bg-brand-600 hover:bg-brand-700 text-white' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
          }`}>
          {valid ? <><CheckCircle2 size={14}/> Registrar signos vitales</> : 'Completar TA, glucemia y mRS'}
        </button>
      </div>

      {/* TA + Glucemia */}
      <div className="grid grid-cols-[1fr_auto_1fr_1fr] items-center gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">TA Sistólica</p>
          <input type="text" inputMode="numeric" maxLength={3} placeholder="120"
            value={sys} onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); diaRef.current?.focus() } }}
            className={fieldCls(taCrit, !!sys)} />
        </div>
        <span className="text-neutral-300 font-bold mt-5">/</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Diastólica</p>
          <input ref={diaRef} type="text" inputMode="numeric" maxLength={3} placeholder="80"
            value={dia} onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); glucoseRef.current?.focus() } }}
            className={fieldCls(diaCrit, !!dia)} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Glucemia</p>
          <input ref={glucoseRef} type="text" inputMode="numeric" maxLength={3} placeholder="120"
            value={glucose} onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
            className={fieldCls(glucLow || glucHigh, !!glucose)} />
        </div>
      </div>

      {/* Alerts */}
      {(taCrit || diaCrit || glucLow || glucHigh) && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2">
          <AlertTriangle size={11} className="shrink-0 text-red-500 mt-0.5" />
          <p className="text-xs text-red-600">
            {taCrit && 'TA >185 mmHg. '}
            {diaCrit && 'PAD >110 mmHg. '}
            {glucLow && 'Hipoglucemia <50 mg/dL — corregir antes de trombolisis. '}
            {glucHigh && 'Hiperglucemia >400 mg/dL. '}
          </p>
        </div>
      )}

      {/* mRS */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
          mRS basal (funcionalidad previa)
        </p>
        <div className="grid grid-cols-6 gap-1">
          {MRS_OPTIONS.map((o) => (
            <button key={o.score} type="button" onClick={() => setMrs(o.score)}
              title={o.label}
              className={`py-2 rounded-xl border-2 text-sm font-bold transition-all active:scale-95 ${
                mrs === o.score
                  ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                  : 'border-neutral-200 text-neutral-500 hover:border-brand-300 hover:bg-brand-50/40'
              }`}>
              {o.score}
            </button>
          ))}
        </div>
        {mrs !== null && (
          <p className="mt-1 text-xs text-brand-600 font-medium animate-fade-in">{MRS_OPTIONS[mrs].label}</p>
        )}
      </div>

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
}) {
  const patientDone = !!patient
  const vitalsDone  = vitals !== null

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Completion banner */}
      {patientDone && vitalsDone && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Paciente y signos vitales registrados</p>
        </div>
      )}

      {/* Patient section */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Identificación del paciente</p>
        <PatientSection
          patient={patient}
          patientId={patientId}
          arrivalTime={arrivalTime}
          onConfirm={onPatientConfirm}
          onOpenEducational={onOpenEducational}
        />
      </div>

      {/* Vitals section */}
      <div className={`bg-white rounded-2xl border p-4 transition-all ${patientDone ? 'border-neutral-100' : 'border-neutral-100 opacity-70'}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Signos vitales</p>
          {!patientDone && (
            <span className="text-[10px] text-neutral-400 italic">Registrar paciente primero</span>
          )}
        </div>
        {patientDone ? (
          <VitalsSection vitals={vitals} onConfirm={onVitalsConfirm} />
        ) : (
          <div className="grid grid-cols-3 gap-2 opacity-40 pointer-events-none select-none">
            {['TA', 'Glucemia', 'mRS'].map(l => (
              <div key={l} className="rounded-xl bg-neutral-50 border border-neutral-100 px-3 py-4 text-center">
                <p className="text-[9px] uppercase tracking-wider text-neutral-300 font-semibold">{l}</p>
                <p className="text-xl font-bold text-neutral-200 mt-1">—</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
