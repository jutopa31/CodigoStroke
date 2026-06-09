import { useState, useRef, useEffect } from 'react'
import { User, CheckCircle2, CreditCard, Lock, BookOpen, ScanLine, Heart, Droplets, Zap, ChevronRight, AlertTriangle, XCircle, Circle } from 'lucide-react'
import DniQrScanner from '../components/DniQrScanner'
import ClinicalAlert from '../components/ClinicalAlert'

// ── Severity helpers ──────────────────────────────────────────────────────────

function getSysSeverity(v) {
  if (!v) return null
  if (v > 185) return { label: 'Alta',    variant: 'critical' }
  if (v > 140) return { label: 'Elevada', variant: 'warning'  }
  return              { label: 'Normal',  variant: 'normal'   }
}

function getGlucSeverity(v) {
  if (!v) return null
  if (v < 50)  return { label: 'Crítica ↓', variant: 'critical' }
  if (v > 400) return { label: 'Crítica ↑', variant: 'critical' }
  if (v < 70)  return { label: 'Baja',      variant: 'warning'  }
  if (v > 180) return { label: 'Elevada',   variant: 'warning'  }
  return              { label: 'Normal',    variant: 'normal'   }
}

function getNihssSeverity(v) {
  if (v == null) return null
  if (v === 0)   return { label: 'Sin déficit', variant: 'normal'   }
  if (v <= 4)    return { label: 'Leve',        variant: 'normal'   }
  if (v <= 15)   return { label: 'Moderado',    variant: 'warning'  }
  if (v <= 20)   return { label: 'Grave',       variant: 'critical' }
  return               { label: 'Muy grave',   variant: 'critical' }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SeverityBadge({ label, variant }) {
  const cls = {
    normal:   'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    warning:  'bg-amber-500/15   text-amber-300   border-amber-500/25',
    critical: 'bg-red-500/15     text-red-300     border-red-500/25',
    glucose:  'bg-violet-500/15  text-violet-300  border-violet-500/25',
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls[variant] ?? cls.normal}`}>
      {label}
    </span>
  )
}

function AlertItem({ variant, Icon, title, body }) {
  const borderCls = { warning: 'border-l-amber-400', critical: 'border-l-red-400', glucose: 'border-l-violet-400' }
  const bgCls     = { warning: 'bg-amber-500/5',     critical: 'bg-red-500/5',     glucose: 'bg-violet-500/5'    }
  const titleCls  = { warning: 'text-amber-300',      critical: 'text-red-300',     glucose: 'text-violet-300'    }
  const iconCls   = { warning: 'text-amber-400',      critical: 'text-red-400',     glucose: 'text-violet-400'    }
  return (
    <div className={`border-l-2 ${borderCls[variant]} ${bgCls[variant]} rounded-r-xl px-3 py-3`}>
      <div className="flex items-start gap-2">
        <Icon size={13} className={`shrink-0 mt-0.5 ${iconCls[variant]}`} strokeWidth={2} />
        <p className="text-xs leading-snug">
          <span className={`font-semibold ${titleCls[variant]}`}>{title}</span>
          {body && <span className="text-stroke-textMuted"> — {body}</span>}
        </p>
      </div>
    </div>
  )
}

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas',                  desc: 'Sin síntomas.' },
  { score: 1, label: 'Sin discapacidad significativa', desc: 'A pesar de síntomas realiza actividades cotidianas.' },
  { score: 2, label: 'Incapacidad leve',               desc: 'Incapaz de actividades previas; capaz de algunas sin asistencia.' },
  { score: 3, label: 'Incapacidad moderada',           desc: 'Requiere alguna ayuda, pero camina sin ayuda.' },
  { score: 4, label: 'Incapacidad mod. severa',        desc: 'Incapaz de caminar sin ayuda y de atender necesidades corporales sin ayuda.' },
  { score: 5, label: 'Incapacidad severa',             desc: 'Confinado a cama, incontinente; requiere cuidado constante de enfermería.' },
]

// ── Patient section ──────────────────────────────────────────────────────────

// Flat patient card (replaces the gradient card)
function PatientCardPreview({ name, dni, arrivalTime, patientId, confirmed }) {
  const hasName = name?.trim().length >= 2
  const hasDni  = dni?.trim().length >= 7
  const now     = arrivalTime
    ? arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`rounded-2xl border p-5 space-y-4 transition-all ${
      confirmed
        ? 'bg-emerald-500/5 border-emerald-500/25'
        : 'bg-stroke-bg border-stroke-line'
    }`}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted">
          Patient Card
        </p>
        {confirmed && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} /> Registrado
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">Nombre</p>
        <p className={`text-lg font-bold leading-tight ${hasName ? 'text-stroke-text' : 'text-stroke-textMuted/30 italic text-sm font-normal'}`}>
          {hasName ? name.trim() : 'Nombre del paciente'}
        </p>
      </div>

      {/* DNI + Llegada row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-stroke-navy rounded-xl px-3 py-2.5 border border-stroke-line">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">DNI</p>
          <p className={`text-sm font-bold font-mono tabular-nums ${hasDni ? 'text-stroke-text' : 'text-stroke-textMuted/30'}`}>
            {hasDni ? dni.trim() : '——'}
          </p>
        </div>
        <div className="bg-stroke-navy rounded-xl px-3 py-2.5 border border-stroke-line">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">Llegada</p>
          <p className="text-sm font-bold font-mono tabular-nums text-stroke-text">{now}</p>
        </div>
      </div>

      {/* Case ID (only when confirmed) */}
      {patientId && (
        <div className="bg-stroke-navy rounded-xl px-3 py-2.5 border border-stroke-iconActive/25 animate-fade-in">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">ID del caso</p>
          <p className="text-sm font-bold font-mono text-stroke-iconActive tabular-nums">{patientId}</p>
        </div>
      )}
    </div>
  )
}

function PatientSection({ patient, patientId, arrivalTime, onConfirm, onOpenEducational }) {
  const [dni, setDni]               = useState(patient?.dni  ?? '')
  const [name, setName]             = useState(patient?.name ?? '')
  const [pass, setPass]             = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const nameRef = useRef(null)
  const passRef = useRef(null)
  const valid   = dni.trim().length >= 7 && name.trim().length >= 2

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

  const inputCls = (filled) =>
    'h-11 w-full rounded-xl border px-3 text-sm text-stroke-text transition-all outline-none ' +
    'placeholder-stroke-textMuted/40 ' +
    (filled
      ? 'bg-stroke-iconActive/10 border-stroke-iconActive/40 focus:ring-2 focus:ring-stroke-iconActive/20 focus:border-stroke-iconActive/60'
      : 'bg-stroke-bg border-stroke-line focus:ring-2 focus:ring-stroke-iconActive/20 focus:border-stroke-iconActive/40')

  // ── Confirmed display — single compact row, no duplication ──
  if (patient) {
    return (
      <div className="flex items-center gap-4 px-4 py-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
          <CheckCircle2 size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_auto_auto] gap-x-6 items-center">
          <p className="font-semibold text-sm text-stroke-text truncate">{patient.name}</p>
          <span className="text-xs text-stroke-textMuted font-mono tabular-nums">DNI {patient.dni}</span>
          {arrivalTime && (
            <span className="text-xs text-stroke-textMuted font-mono tabular-nums">
              {arrivalTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {patientId && (
            <span className="text-xs font-bold font-mono text-stroke-iconActive tabular-nums">{patientId}</span>
          )}
        </div>
        <span className="shrink-0 text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">
          Registrado
        </span>
      </div>
    )
  }

  // ── Edit form ──
  return (
    <>
      {showScanner && <DniQrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {/* ══ DESKTOP: 2-column ══ */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-4">

        {/* Col 1: Form Inputs */}
        <div className="bg-stroke-bg rounded-2xl border border-stroke-line p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted">Form Inputs</p>
            <button type="button" onClick={() => setShowScanner(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-stroke-iconActive bg-stroke-iconActive/10 hover:bg-stroke-iconActive/20 border border-stroke-iconActive/30 px-2.5 py-1.5 rounded-lg transition-colors">
              <ScanLine size={12} strokeWidth={2} /> Escanear DNI
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted mb-1.5">
                <CreditCard size={10} /> DNI
              </label>
              <input type="text" inputMode="numeric" placeholder="12345678"
                value={dni} onChange={(e) => setDni(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
                autoFocus
                className={inputCls(!!dni) + ' font-mono tracking-widest'} />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted mb-1.5">
                <User size={10} /> Nombre completo
              </label>
              <input ref={nameRef} type="text" placeholder="Nombre y apellido"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passRef.current?.focus() } }}
                className={inputCls(!!name)} />
            </div>

            <div>
              <button type="button" onClick={() => setShowPassphrase(v => !v)}
                className="flex items-center gap-1.5 text-[11px] text-stroke-textMuted hover:text-stroke-iconActive transition-colors">
                <Lock size={11} strokeWidth={2} />
                {showPassphrase ? 'Ocultar contraseña de turno' : 'Agregar contraseña de turno (opcional)'}
                <ChevronRight size={11} strokeWidth={2} className={`transition-transform ${showPassphrase ? 'rotate-90' : ''}`} />
              </button>
              {showPassphrase && (
                <input ref={passRef} type="password" placeholder="Frase de acceso"
                  value={pass} onChange={(e) => setPass(e.target.value)}
                  className={inputCls(false) + ' mt-2'} />
              )}
            </div>

            <button type="submit" disabled={!valid}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] mt-2 ${
                valid ? 'bg-stroke-iconActive hover:bg-[#4D6CD6] text-white' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
              }`}>
              <Zap size={14} strokeWidth={2.5} />
              Activar Código Stroke
            </button>
          </form>

          {onOpenEducational && (
            <button type="button" onClick={onOpenEducational}
              className="flex items-center gap-1.5 text-[11px] text-stroke-textMuted hover:text-amber-400 transition-colors">
              <BookOpen size={11} strokeWidth={2} /> Modo educativo
            </button>
          )}
        </div>

        {/* Col 2: Live patient card preview */}
        <PatientCardPreview name={name} dni={dni} arrivalTime={null} patientId={null} confirmed={false} />
      </div>

      {/* ══ MOBILE: stacked ══ */}
      <div className="md:hidden space-y-3">
        {/* Scan + educational row */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-stroke-iconActive bg-stroke-iconActive/10 hover:bg-stroke-iconActive/20 border border-stroke-iconActive/40 px-2.5 py-1.5 rounded-lg transition-colors">
            <ScanLine size={13} strokeWidth={2} /> Escanear DNI
          </button>
          {onOpenEducational && (
            <button type="button" onClick={onOpenEducational}
              className="flex items-center gap-1 text-[11px] text-stroke-textMuted hover:text-amber-500 transition-colors">
              <BookOpen size={11} strokeWidth={2} /> Modo educativo
            </button>
          )}
        </div>

        {/* Mobile card preview */}
        <PatientCardPreview name={name} dni={dni} arrivalTime={null} patientId={null} confirmed={false} />

        {/* Mobile form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-[1fr_1.5fr] gap-2.5">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted flex items-center gap-1 mb-1.5">
                <CreditCard size={10} /> DNI
              </label>
              <input type="text" inputMode="numeric" placeholder="12345678"
                value={dni} onChange={(e) => setDni(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
                autoFocus
                className="h-[42px] w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm font-semibold font-mono tracking-widest text-stroke-text focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted flex items-center gap-1 mb-1.5">
                <User size={10} /> Nombre
              </label>
              <input ref={nameRef} type="text" placeholder="Nombre y apellido"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); passRef.current?.focus() } }}
                className="h-[42px] w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm text-stroke-text focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none" />
            </div>
          </div>

          <div>
            <button type="button" onClick={() => setShowPassphrase(v => !v)}
              className="flex items-center gap-1.5 text-[11px] text-stroke-textMuted hover:text-stroke-textMuted transition-colors">
              <Lock size={11} strokeWidth={2} />
              <span>{showPassphrase ? 'Ocultar contraseña de turno' : 'Agregar contraseña de turno (opcional)'}</span>
              <ChevronRight size={11} strokeWidth={2} className={`transition-transform ${showPassphrase ? 'rotate-90' : ''}`} />
            </button>
            {showPassphrase && (
              <input ref={passRef} type="password" placeholder="Frase de acceso"
                value={pass} onChange={(e) => setPass(e.target.value)}
                className="mt-2 h-10 w-full bg-stroke-bg border border-stroke-line rounded-xl px-3 text-sm text-stroke-text focus:ring-2 focus:ring-stroke-iconActive/30 focus:border-stroke-iconActive/40 placeholder-stroke-textMuted/50 transition-all outline-none" />
            )}
          </div>

          <button type="submit" disabled={!valid}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
              valid ? 'bg-stroke-iconActive hover:bg-[#4D6CD6] text-white' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
            }`}>
            <Zap size={15} strokeWidth={2.5} /> Activar Código Stroke
          </button>
        </form>
      </div>
    </>
  )
}

// ── Vitals section ────────────────────────────────────────────────────────────

function VitalsSection({ vitals, onConfirm, draftVitals, onDraftChange, nihssScore }) {
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
    if (!vitals && onDraftChange) onDraftChange({ sys, dia, glucose, mrs })
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

  // ── Confirmed display ──
  if (vitals) {
    const v = vitals
    const sysSev  = getSysSeverity(v.systolic)
    const glucSev = getGlucSeverity(v.glucose)
    const nihssSev = getNihssSeverity(nihssScore)
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className={`col-span-1 rounded-xl px-3 py-2.5 bg-stroke-bg border ${sysSev?.variant === 'critical' ? 'border-red-500/30' : sysSev?.variant === 'warning' ? 'border-amber-500/30' : 'border-stroke-line'}`}>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">TA</p>
          <p className="text-sm font-bold tabular-nums leading-none text-stroke-text">{v.systolic}/{v.diastolic}</p>
          <p className="text-[9px] text-stroke-textMuted mt-1">mmHg</p>
          {sysSev && <div className="mt-1.5"><SeverityBadge label={sysSev.label} variant={sysSev.variant} /></div>}
        </div>
        <div className={`col-span-1 rounded-xl px-3 py-2.5 bg-stroke-bg border ${glucSev?.variant === 'critical' ? 'border-red-500/30' : glucSev?.variant === 'warning' ? 'border-amber-500/30' : 'border-stroke-line'}`}>
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">Glucemia</p>
          <p className="text-sm font-bold tabular-nums leading-none text-stroke-text">{v.glucose}</p>
          <p className="text-[9px] text-stroke-textMuted mt-1">mg/dL</p>
          {glucSev && <div className="mt-1.5"><SeverityBadge label={glucSev.label} variant={glucSev.variant} /></div>}
        </div>
        <div className="col-span-1 rounded-xl px-3 py-2.5 bg-stroke-bg border border-stroke-line">
          <p className="text-[9px] uppercase tracking-wider font-semibold text-stroke-textMuted mb-1">mRS basal</p>
          <p className="text-sm font-bold tabular-nums leading-none text-stroke-text">{v.modifiedRankinScale?.score ?? '—'}</p>
          <p className="text-[9px] text-stroke-textMuted mt-1 truncate">{v.modifiedRankinScale?.label ?? 'pts'}</p>
          {nihssSev && nihssScore != null && <div className="mt-1.5"><SeverityBadge label={`NIHSS ${nihssScore}`} variant={nihssSev.variant} /></div>}
        </div>
      </div>
    )
  }

  // ── Input helpers ──
  // Compact input (mobile + desktop) — 44px touch target, mono, centered
  const miniInputCls = (warn, filled, isGlu = false) =>
    'h-11 rounded-lg border text-lg font-bold font-mono tabular-nums text-center text-stroke-text ' +
    'focus:outline-none focus:ring-2 transition-all placeholder:text-stroke-textMuted/40 ' +
    (warn
      ? 'border-red-400/60 bg-red-500/10 focus:ring-red-500/20'
      : filled
        ? (isGlu ? 'border-violet-400/40 bg-violet-500/10 focus:ring-violet-500/15'
                 : 'border-stroke-iconActive/40 bg-stroke-iconActive/10 focus:ring-stroke-iconActive/20')
        : 'border-stroke-line bg-stroke-navy focus:ring-stroke-iconActive/15')

  const missing = [!sys && 'PAS', !dia && 'PAD', !glucose && 'glucemia', mrs === null && 'mRS'].filter(Boolean)

  // ── Live alerts (for desktop panel + mobile inline) ──
  const alerts = [
    taCrit  && { variant: 'critical', Icon: XCircle,       title: 'Contraindicado',  body: 'PAS >185 mmHg — no administrar tPA.' },
    diaCrit && { variant: 'critical', Icon: XCircle,       title: 'Contraindicado',  body: 'PAD >110 mmHg — no administrar tPA.' },
    (glucLow || glucHigh) && {
      variant: 'glucose', Icon: Circle,
      title:   glucLow ? 'Glucemia crítica ↓' : 'Glucemia crítica ↑',
      body:    glucLow ? 'Corregir antes de la ventana.' : 'Controlar antes de proceder.',
    },
    (sys && sysNum > 140 && sysNum <= 185) && { variant: 'warning', Icon: AlertTriangle, title: 'CI Relativa', body: 'Revisar criterios antes de proceder.' },
  ].filter(Boolean)

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP: 3-column grid
      ══════════════════════════════════════ */}
      <div className="hidden md:grid md:grid-cols-[1.4fr_1fr] md:gap-4">

        {/* ── Col 1: Form Inputs ── */}
        <div className="bg-stroke-bg rounded-2xl border border-stroke-line p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted">Form Inputs</p>

          {/* TA — PAS / PAD inline */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stroke-text">
                <Heart size={12} className="text-blue-400" /> Tensión arterial
              </label>
              {sys && (() => { const s = getSysSeverity(sysNum); return s ? <SeverityBadge label={s.label} variant={s.variant} /> : null })()}
            </div>
            <div className="flex items-center gap-2">
              <input ref={sysRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={sys}
                onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); diaRef.current?.focus() } }}
                aria-label="Presión sistólica"
                className={`${miniInputCls(taCrit, !!sys)} flex-1 min-w-0`} />
              <span className="font-bold text-stroke-textMuted">/</span>
              <input ref={diaRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={dia}
                onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
                aria-label="Presión diastólica"
                className={`${miniInputCls(diaCrit, !!dia)} flex-1 min-w-0`} />
            </div>
            <p className="text-[10px] text-stroke-textMuted mt-1.5">mmHg · ≤185/110</p>
          </div>

          {/* Glucemia */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-stroke-text">
                <Droplets size={12} className="text-violet-400" /> Glucemia
              </label>
              {glucose && (() => { const g = getGlucSeverity(glucNum); return g ? <SeverityBadge label={g.label} variant={g.variant} /> : null })()}
            </div>
            <div className="relative">
              <input ref={glucoseRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
                aria-label="Glucemia"
                className={`${miniInputCls(glucLow || glucHigh, !!glucose, true)} w-full pr-12`} />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-semibold text-stroke-textMuted">mg/dL</span>
            </div>
            <p className="text-[10px] text-stroke-textMuted mt-1.5">50–400 mg/dL</p>
          </div>

          {/* mRS basal — prominent band */}
          <div className={`rounded-xl border p-3 transition-colors ${mrs !== null ? 'border-stroke-iconActive/40 bg-stroke-iconActive/5' : 'border-stroke-iconActive/30 bg-stroke-navy'}`}>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stroke-iconActive">mRS basal</p>
              <span className="text-[10px] text-stroke-textMuted">func. previa</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {MRS_OPTIONS.map((o) => (
                <button key={o.score} type="button" onClick={() => setMrs(o.score)} title={o.label}
                  aria-pressed={mrs === o.score} aria-label={`mRS ${o.score}: ${o.label}`}
                  className={`h-10 rounded-lg border font-mono text-sm font-bold transition-all active:scale-95 ${
                    mrs === o.score
                      ? 'border-stroke-iconActive bg-stroke-iconActive text-white'
                      : 'border-stroke-line bg-stroke-bg text-stroke-textMuted hover:border-stroke-iconActive/40'
                  }`}>{o.score}</button>
              ))}
            </div>
            {mrs !== null && (
              <p className="mt-2 text-[11px] text-stroke-text animate-fade-in">
                <span className="font-semibold text-stroke-iconActive">{mrs}</span> · {MRS_OPTIONS[mrs].label}
              </p>
            )}
          </div>

          <button type="button" onClick={handleConfirm} disabled={!valid}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
              valid ? 'bg-stroke-iconActive hover:bg-[#4D6CD6] text-white' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
            }`}>
            {valid ? <><CheckCircle2 size={14}/> Registrar</> : `Falta: ${missing.join(' · ')}`}
          </button>
        </div>

        {/* ── Col 2: Alerts ── */}
        <div className="bg-stroke-bg rounded-2xl border border-stroke-line p-4 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted">Alertas</p>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 px-3 py-3 bg-emerald-500/5 border-l-2 border-l-emerald-400 rounded-r-xl">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300 font-medium">Sin alertas activas</p>
            </div>
          ) : (
            alerts.map((a, i) => <AlertItem key={i} {...a} />)
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE: compact grid + prominent mRS band (variant B)
      ══════════════════════════════════════ */}
      <div className="md:hidden space-y-3">

        {/* ── TA + Glucemia: compact 2-col grid ── */}
        <div className="grid grid-cols-2 gap-2.5">

          {/* Tensión arterial */}
          <div className={`rounded-xl border p-3 ${taCrit || diaCrit ? 'border-red-500/40 bg-red-500/5' : 'bg-stroke-bg border-stroke-line'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Heart size={12} className="text-blue-400 shrink-0" />
                <p className="text-[11px] font-semibold text-stroke-text truncate">Tensión arterial</p>
              </div>
              {sys && (() => { const s = getSysSeverity(sysNum); return s ? <SeverityBadge label={s.label} variant={s.variant} /> : null })()}
            </div>
            <div className="flex items-center gap-1.5">
              <input ref={sysRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={sys}
                onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); diaRef.current?.focus() } }}
                aria-label="Presión sistólica"
                className={`${miniInputCls(taCrit, !!sys)} flex-1 min-w-0`} />
              <span className="font-bold text-stroke-textMuted">/</span>
              <input ref={diaRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={dia}
                onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); glucoseRef.current?.focus() } }}
                aria-label="Presión diastólica"
                className={`${miniInputCls(diaCrit, !!dia)} flex-1 min-w-0`} />
            </div>
            <p className="text-[10px] text-stroke-textMuted mt-1.5">mmHg · ≤185/110</p>
          </div>

          {/* Glucemia */}
          <div className={`rounded-xl border p-3 ${glucLow || glucHigh ? 'border-red-500/40 bg-red-500/5' : 'bg-stroke-bg border-stroke-line'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Droplets size={12} className="text-violet-400 shrink-0" />
                <p className="text-[11px] font-semibold text-stroke-text truncate">Glucemia</p>
              </div>
              {glucose && (() => { const g = getGlucSeverity(glucNum); return g ? <SeverityBadge label={g.label} variant={g.variant} /> : null })()}
            </div>
            <div className="relative">
              <input ref={glucoseRef} type="text" inputMode="numeric" maxLength={3} placeholder="—"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
                aria-label="Glucemia"
                className={`${miniInputCls(glucLow || glucHigh, !!glucose, true)} w-full pr-10`} />
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] font-semibold text-stroke-textMuted">mg/dL</span>
            </div>
            <p className="text-[10px] text-stroke-textMuted mt-1.5">50–400 mg/dL</p>
          </div>
        </div>

        {/* ── mRS basal: prominent band ── */}
        <div className={`rounded-xl border p-3 transition-colors ${mrs !== null ? 'border-stroke-iconActive/40 bg-stroke-iconActive/5' : 'border-stroke-iconActive/30 bg-stroke-bg'}`}>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stroke-iconActive">mRS basal</p>
            <span className="text-[10px] text-stroke-textMuted">funcionalidad previa</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {MRS_OPTIONS.map((o) => (
              <button key={o.score} type="button" onClick={() => setMrs(o.score)} title={o.label}
                aria-pressed={mrs === o.score} aria-label={`mRS ${o.score}: ${o.label}`}
                className={`h-11 rounded-lg border font-mono text-base font-bold transition-all active:scale-95 ${
                  mrs === o.score
                    ? 'border-stroke-iconActive bg-stroke-iconActive text-white'
                    : 'border-stroke-line bg-stroke-navy text-stroke-textMuted hover:border-stroke-iconActive/40'
                }`}>{o.score}</button>
            ))}
          </div>
          {mrs !== null && (
            <p className="mt-2 text-[11px] text-stroke-text animate-fade-in">
              <span className="font-semibold text-stroke-iconActive">{mrs}</span> · {MRS_OPTIONS[mrs].label}
            </p>
          )}
        </div>

        {/* ── Critical alert (out-of-range only) ── */}
        {(taCrit || diaCrit || glucLow || glucHigh) && (
          <ClinicalAlert variant="critical" role="alert" className="animate-slide-down">
            {taCrit   && 'PAS >185 mmHg — ajustar antes de trombolisis. '}
            {diaCrit  && 'PAD >110 mmHg — ajustar antes de trombolisis. '}
            {glucLow  && 'Hipoglucemia <50 mg/dL — corregir antes de trombolisis. '}
            {glucHigh && 'Hiperglucemia >400 mg/dL — controlar antes de proceder.'}
          </ClinicalAlert>
        )}

        <button type="button" onClick={handleConfirm} disabled={!valid}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[0.98] ${
            valid ? 'bg-stroke-iconActive hover:bg-[#4D6CD6] text-white' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
          }`}>
          {valid ? <><CheckCircle2 size={14}/> Registrar signos vitales</> : `Completá: ${missing.join(' · ')}`}
        </button>
      </div>
    </>
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
  nihssScore,
}) {
  const patientDone = !!patient
  const vitalsDone  = vitals !== null

  return (
    <div className="px-4 pb-4 space-y-3 md:px-0">
      {/* Completion banner */}
      {patientDone && vitalsDone && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-300">Paciente y signos vitales registrados</p>
        </div>
      )}

      {/* Patient section */}
      <div className="bg-stroke-navy rounded-xl border border-stroke-line p-3 md:max-w-none">
        {!patient && <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted mb-2.5">Identificación del paciente</p>}
        <PatientSection
          patient={patient}
          patientId={patientId}
          arrivalTime={arrivalTime}
          onConfirm={onPatientConfirm}
          onOpenEducational={onOpenEducational}
        />
      </div>

      {/* Vitals section */}
      {patientDone ? (
        <div className="bg-stroke-navy rounded-xl border border-stroke-line p-3 md:max-w-none animate-fade-in">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stroke-textMuted mb-2.5">Signos vitales</p>
          <VitalsSection
            vitals={vitals}
            onConfirm={onVitalsConfirm}
            draftVitals={draftVitals}
            onDraftChange={onDraftVitalsChange}
            nihssScore={nihssScore}
          />
        </div>
      ) : (
        <div className="bg-stroke-bg rounded-xl border border-dashed border-stroke-line p-4">
          <div className="flex items-center gap-3 text-stroke-textMuted">
            <Lock size={16} strokeWidth={1.5} className="shrink-0" />
            <div>
              <p className="text-xs font-semibold text-stroke-textMuted">Signos vitales</p>
              <p className="text-[11px] mt-0.5">Se habilita al activar el código stroke</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
