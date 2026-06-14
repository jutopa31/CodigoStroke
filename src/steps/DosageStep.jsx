import { useRef, useState } from 'react'
import { ChevronRight, CheckCircle2, Circle, Hospital, Ban, Pill, BarChart2, Brain, Microscope, Heart, Clock, Plus, AlertTriangle, Droplets, ShieldCheck } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'
import { calcRtPA, calcTNK } from '../lib/calculations'

const WEIGHT_PRESETS = [50, 60, 70, 80, 90, 100]

const POST_CHECKLIST = [
  { id: 'bp_control',       label: 'Control TA',         sub: '< 180/105 · c/15 min × 2h',           Icon: BarChart2 },
  { id: 'serial_nihss',     label: 'NIHSS seriado',      sub: '30 min · 1h · 2h · 6h · 24h',         Icon: Brain },
  { id: 'icu',              label: 'UCI / Shockroom',    sub: 'ECG + SatO₂ + PANI c/15 min',          Icon: Hospital },
  { id: 'no_invasive',      label: 'Sin procedimientos', sub: 'NO sonda, SNG ni vía arterial 24h',    Icon: Ban },
  { id: 'no_antithrombotic',label: 'Sin antitrombóticos',sub: 'Solo post TC control a las 24h',       Icon: Pill },
  { id: 'ct_control',       label: 'TC a las 24h',       sub: 'Antes de anticoag/antiagregantes',      Icon: Microscope },
  { id: 'cardiology',       label: 'Eco + Holter',       sub: 'Estudio de fuente embólica',            Icon: Heart },
]


function fmtTime(date) {
  return date?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) ?? null
}

// Pre-thrombolysis BP/glucose check. Reads the most recent readings and flags
// anything outside the safe-to-treat window (PAS ≤185, PAD ≤110, gluc 50–400).
function evalVitalsGate(latestVitals, latestGlucose) {
  const pas = latestVitals?.systolic
  const pad = latestVitals?.diastolic
  const flags = {
    pasHigh:   pas != null && pas > 185,
    padHigh:   pad != null && pad > 110,
    glucLow:   latestGlucose != null && latestGlucose < 50,
    glucHigh:  latestGlucose != null && latestGlucose > 400,
    noData:    latestVitals == null && latestGlucose == null,
  }
  flags.blocked = flags.pasHigh || flags.padHigh || flags.glucLow || flags.glucHigh || flags.noData
  return flags
}

// Mini numeric input used inside the correction gate.
function GateInput({ value, onChange, placeholder, warn, ariaLabel, suffix }) {
  return (
    <div className="relative flex-1 min-w-0">
      <input
        type="text" inputMode="numeric" maxLength={3} placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
        aria-label={ariaLabel}
        className={`h-10 w-full rounded-lg border text-center text-base font-mono font-bold tabular-nums text-stroke-text ${suffix ? 'pr-9' : ''} focus:outline-none focus:ring-2 transition-all placeholder:text-stroke-textMuted/40 ${
          warn
            ? 'border-red-400/60 bg-red-500/10 focus:ring-red-500/20'
            : value
              ? 'border-emerald-400/50 bg-emerald-500/10 focus:ring-emerald-500/20'
              : 'border-stroke-line bg-stroke-navy focus:ring-stroke-iconActive/20'
        }`}
      />
      {suffix && <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] font-semibold text-stroke-textMuted">{suffix}</span>}
    </div>
  )
}

// Pre-thrombolysis control gate — blocks "Registrar inicio" until the most
// recent TA/glucemia are within the safe-to-treat window. Corrections are saved
// as new serial readings (original out-of-range value stays in the trace).
function PreThrombolysisGate({ latestVitals, latestGlucose, gate, onAddVitals, onAddGlucose }) {
  const [sys, setSys]         = useState('')
  const [dia, setDia]         = useState('')
  const [glucose, setGlucose] = useState('')

  const sysNum  = parseInt(sys, 10)
  const diaNum  = parseInt(dia, 10)
  const glucNum = parseInt(glucose, 10)

  const taValid   = sys && dia && sysNum <= 185 && diaNum <= 110
  const glucValid = glucose && glucNum >= 50 && glucNum <= 400
  const taWarn    = (sys && sysNum > 185) || (dia && diaNum > 110)
  const glucWarn  = glucose && (glucNum < 50 || glucNum > 400)

  const needTa   = gate.pasHigh || gate.padHigh
  const needGluc = gate.glucLow || gate.glucHigh

  function saveTa() {
    if (!taValid) return
    onAddVitals?.({ systolic: sysNum, diastolic: diaNum })
    setSys(''); setDia('')
  }
  function saveGluc() {
    if (!glucValid) return
    onAddGlucose?.(glucNum)
    setGlucose('')
  }

  // ── In meta → green confirmation ──
  if (!gate.blocked) {
    return (
      <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-300">TA y glucemia en meta</p>
          <p className="text-[11px] text-emerald-400/90 font-mono tabular-nums">
            {latestVitals ? `${latestVitals.systolic}/${latestVitals.diastolic} mmHg` : '—'}
            {latestGlucose != null ? ` · ${latestGlucose} mg/dL` : ''}
          </p>
        </div>
      </div>
    )
  }

  // ── Out of range / missing → red blocking gate ──
  return (
    <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3.5 space-y-3">
      <div className="flex items-start gap-2">
        <AlertTriangle size={15} className="text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="text-xs font-bold text-red-300">Corregir antes de iniciar el trombolítico</p>
          <p className="text-[11px] text-stroke-textMuted mt-0.5">
            {gate.noData
              ? 'Sin registro de signos vitales. Cargá TA y glucemia para habilitar el inicio.'
              : 'Registrá la medición corregida en rango para habilitar “Registrar inicio”.'}
          </p>
        </div>
      </div>

      {/* TA correction */}
      {(needTa || gate.noData) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stroke-text">
              <Heart size={12} className="text-blue-400" /> TA corregida
            </span>
            <span className="text-[10px] text-stroke-textMuted font-mono tabular-nums">
              {latestVitals ? `actual ${latestVitals.systolic}/${latestVitals.diastolic}` : 'sin dato'} · meta ≤185/110
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GateInput value={sys} onChange={setSys} placeholder="PAS" warn={sys && sysNum > 185} ariaLabel="PAS corregida" />
            <span className="font-bold text-stroke-textMuted">/</span>
            <GateInput value={dia} onChange={setDia} placeholder="PAD" warn={dia && diaNum > 110} ariaLabel="PAD corregida" />
            <button type="button" onClick={saveTa} disabled={!taValid}
              className={`shrink-0 h-10 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                taValid ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
              }`}>
              Guardar
            </button>
          </div>
          {taWarn && <p className="text-[10px] text-red-400 mt-1">Valor aún fuera de meta — no habilita el inicio.</p>}
        </div>
      )}

      {/* Glucose correction */}
      {(needGluc || gate.noData) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-stroke-text">
              <Droplets size={12} className="text-violet-400" /> Glucemia corregida
            </span>
            <span className="text-[10px] text-stroke-textMuted font-mono tabular-nums">
              {latestGlucose != null ? `actual ${latestGlucose}` : 'sin dato'} · meta 50–400
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <GateInput value={glucose} onChange={setGlucose} placeholder="mg/dL" warn={glucWarn} ariaLabel="Glucemia corregida" suffix="mg/dL" />
            <button type="button" onClick={saveGluc} disabled={!glucValid}
              className={`shrink-0 h-10 px-3 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                glucValid ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-stroke-panel text-stroke-textMuted cursor-not-allowed'
              }`}>
              Guardar
            </button>
          </div>
          {glucWarn && <p className="text-[10px] text-red-400 mt-1">Valor aún fuera de rango — no habilita el inicio.</p>}
        </div>
      )}
    </div>
  )
}

export default function DosageStep({ onConfirm, thrombolyticStartTime = null, onThrombolyticStart, onAddNihss, latestVitals = null, latestGlucose = null, onAddVitals, onAddGlucose, initialDosage = null }) {
  const [view, setView]           = useState('dose')   // 'dose' | 'post'
  const [drug, setDrug]           = useState(initialDosage?.drug ?? 'tnk')
  const [drugLocked, setDrugLocked]     = useState(false)
  const [weightStr, setWeightStr] = useState(initialDosage?.weight ? String(initialDosage.weight) : '')
  const [weightLocked, setWeightLocked] = useState(false)
  const [checked, setChecked]     = useState({})
  const [nihssEntry, setNihssEntry]   = useState('')
  const [nihssRecords, setNihssRecords] = useState([])
  const [showNihssInput, setShowNihssInput] = useState(false)
  const [showNihssCalc, setShowNihssCalc]   = useState(false)
  const [nihssEntrySource, setNihssEntrySource] = useState('manual')
  const startButtonRef = useRef(null)

  const weight      = parseFloat(weightStr)
  const validWeight = !isNaN(weight) && weight > 0 && weight <= 250
  const rtpa = validWeight ? calcRtPA(weight) : null
  const tnk  = validWeight ? calcTNK(weight)  : null
  const dose = drug === 'tnk' ? tnk : rtpa

  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked   = checkedCount === POST_CHECKLIST.length
  const canContinue  = validWeight && allChecked && thrombolyticStartTime

  // Pre-thrombolysis BP/glucose gate — blocks start until vitals are in meta.
  const gate = evalVitalsGate(latestVitals, latestGlucose)

  function adjust(delta) {
    const current = parseFloat(weightStr) || 0
    setWeightStr(String(Math.max(1, Math.min(250, current + delta))))
  }

  function handleThrombolyticStart() {
    if (gate.blocked) return
    onThrombolyticStart?.(new Date())
    setTimeout(() => setView('post'), 300)
  }

  const nihssNum   = parseInt(nihssEntry, 10)
  const nihssValid = nihssEntry !== '' && !isNaN(nihssNum) && nihssNum >= 0 && nihssNum <= 42

  function handleSaveNihss(source = nihssEntrySource) {
    if (!nihssValid) return
    setNihssRecords((r) => [...r, { id: `${Date.now()}`, score: nihssNum, timestamp: new Date(), source }])
    onAddNihss?.(nihssNum)
    setNihssEntry('')
    setNihssEntrySource('manual')
    setShowNihssInput(false)
  }

  function handleNihssCalcResult(score) {
    setNihssEntry(String(score))
    setShowNihssCalc(false)
    setShowNihssInput(true)
    setNihssEntrySource('calculadora')
  }

  // ── VIEW 1: Dosis ──────────────────────────────────────────────────────────
  if (view === 'dose') {
    return (
      <div className="px-4 pb-4 md:px-0">
        <StepCard step="7" title="Trombolítico — dosis" accent="green">

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-emerald-500/100" />
              <div className="h-1.5 w-8 rounded-full bg-stroke-panel" />
            </div>
            <span className="text-[10px] text-stroke-textMuted font-medium">1 de 2</span>
          </div>

          {/* Drug: toggle o fila colapsada */}
          {drugLocked ? (
            <div className="flex items-center justify-between py-2 border-b border-stroke-line mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-stroke-text">
                  {drug === 'tnk' ? 'TNK · Tenecteplase' : 'rtPA · Alteplase'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrugLocked(false)}
                className="text-[10px] text-stroke-iconActive font-semibold hover:underline ml-2 shrink-0"
              >
                editar
              </button>
            </div>
          ) : (
            <div className="flex rounded-lg overflow-hidden border border-stroke-line mb-3 text-sm font-semibold">
              {[
                { id: 'tnk',  label: 'TNK',  sub: 'Tenecteplase' },
                { id: 'rtpa', label: 'rtPA', sub: 'Alteplase' },
              ].map(({ id, label, sub }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setDrug(id); setDrugLocked(true) }}
                  className={`flex-1 py-2 transition-all ${
                    drug === id
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stroke-navy text-stroke-textMuted hover:bg-emerald-500/10'
                  }`}
                >
                  {label}
                  <span className={`block text-[10px] font-normal ${drug === id ? 'text-emerald-100' : 'text-stroke-textMuted'}`}>
                    {sub}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Weight: stepper+chips o fila colapsada */}
          {weightLocked ? (
            <div className="flex items-center justify-between py-2 border-b border-stroke-line mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-stroke-text">{weight} kg</span>
              </div>
              <button
                type="button"
                onClick={() => setWeightLocked(false)}
                className="text-[10px] text-stroke-iconActive font-semibold hover:underline ml-2 shrink-0"
              >
                editar
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stroke-textMuted mb-2">Peso (kg)</p>
              <div className="grid max-w-md grid-cols-[2.2rem_2.2rem_8rem_2.2rem_2.2rem] items-center gap-1.5 mb-3">
                {[-5, -1].map((d) => (
                  <button key={d} type="button" onClick={() => adjust(d)}
                    className="h-10 rounded-xl border border-stroke-line text-stroke-textMuted font-semibold text-xs hover:bg-stroke-bg active:scale-95 transition-all">
                    {d}
                  </button>
                ))}
                <input
                  type="number" inputMode="decimal" placeholder="70"
                  value={weightStr} onChange={(e) => setWeightStr(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && validWeight) setWeightLocked(true) }}
                  autoFocus
                  className="w-full min-w-0 border border-stroke-line bg-stroke-navy rounded-xl px-2 py-2 text-stroke-text text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-stroke-textMuted/50"
                />
                {[1, 5].map((d) => (
                  <button key={d} type="button" onClick={() => adjust(d)}
                    className="h-10 rounded-xl border border-stroke-line text-stroke-textMuted font-semibold text-xs hover:bg-stroke-bg active:scale-95 transition-all">
                    +{d}
                  </button>
                ))}
              </div>

              {/* Preset chips */}
              <div className="flex gap-1.5 flex-wrap mb-4">
                {WEIGHT_PRESETS.map((w) => (
                  <button key={w} type="button"
                    onClick={() => { setWeightStr(String(w)); setWeightLocked(true) }}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                      weightStr === String(w)
                        ? 'bg-emerald-700 border-emerald-600 text-white'
                        : 'border-stroke-line text-stroke-textMuted hover:border-emerald-300 hover:bg-emerald-500/10'
                    }`}>
                    {w} kg
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Dose result */}
          <div className={`rounded-xl px-3 py-2.5 transition-all duration-200 ${
            validWeight && dose
              ? 'bg-emerald-500/10 border-2 border-emerald-300'
              : 'bg-stroke-bg border-2 border-dashed border-stroke-line'
          }`}>
            {validWeight && dose ? (
              drug === 'tnk' ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold text-emerald-300">{tnk.total} mg</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-300">Tenecteplase</p>
                    <p className="text-xs text-emerald-400">bolo único IV</p>
                    {weight * 0.25 >= 25 && <p className="text-[10px] text-emerald-500 mt-0.5">⚠ Dosis máxima</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-mono font-bold text-emerald-300">{rtpa.total} mg</span>
                    <p className="text-xs text-emerald-400">Alteplase — dosis total</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stroke-navy rounded-lg px-3 py-2 border border-emerald-500/30">
                      <p className="text-[10px] text-stroke-textMuted">Bolo IV (10%)</p>
                      <p className="text-base font-mono font-bold text-emerald-300">{rtpa.bolo} mg</p>
                      <p className="text-[10px] text-stroke-textMuted">en 1 min</p>
                    </div>
                    <div className="bg-stroke-navy rounded-lg px-3 py-2 border border-emerald-500/30">
                      <p className="text-[10px] text-stroke-textMuted">Infusión (90%)</p>
                      <p className="text-base font-mono font-bold text-emerald-300">{rtpa.infusion} mg</p>
                      <p className="text-[10px] text-stroke-textMuted">en 60 min</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <span className="text-2xl font-mono font-bold text-stroke-textMuted">— mg</span>
            )}
          </div>

          {/* Pre-thrombolysis vitals gate */}
          {validWeight && dose && !thrombolyticStartTime && (
            <PreThrombolysisGate
              latestVitals={latestVitals}
              latestGlucose={latestGlucose}
              gate={gate}
              onAddVitals={onAddVitals}
              onAddGlucose={onAddGlucose}
            />
          )}

          {/* Start time button */}
          {validWeight && dose && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <Clock size={16} className="text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-300">Inicio del trombolítico</p>
                {thrombolyticStartTime && (
                  <p className="text-sm font-mono font-bold text-emerald-300">{fmtTime(thrombolyticStartTime)}</p>
                )}
              </div>
              <button
                type="button" ref={startButtonRef} onClick={handleThrombolyticStart}
                disabled={!thrombolyticStartTime && gate.blocked}
                title={!thrombolyticStartTime && gate.blocked ? 'Corregí TA/glucemia antes de iniciar' : undefined}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                  thrombolyticStartTime
                    ? 'border border-emerald-300 bg-stroke-navy text-emerald-300 hover:bg-emerald-500/15'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {thrombolyticStartTime ? 'Actualizar' : 'Registrar inicio'}
              </button>
            </div>
          )}
        </StepCard>

        <div className="mt-3">
          <button
            type="button" onClick={() => setView('post')}
            disabled={!validWeight || !thrombolyticStartTime}
            className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:px-5"
          >
            Continuar — post-trombolisis <ChevronRight size={16} />
          </button>
          {!thrombolyticStartTime && validWeight && (
            <p className="text-center text-[11px] text-stroke-textMuted mt-2">Registrá el inicio del trombolítico para continuar</p>
          )}
        </div>
      </div>
    )
  }

  // ── VIEW 2: Post-trombolisis ───────────────────────────────────────────────
  return (
    <div className="px-4 pb-4 md:px-0">
      <StepCard step="" title="Indicaciones post-trombolisis" accent="green">

        {/* Progress + back */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-stroke-panel" />
              <div className="h-1.5 w-8 rounded-full bg-emerald-500/100" />
            </div>
            <span className="text-[10px] text-stroke-textMuted font-medium">2 de 2</span>
          </div>
          <button type="button" onClick={() => setView('dose')}
            className="text-[10px] text-stroke-iconActive font-semibold hover:underline">
            ← Dosis
          </button>
        </div>

        {/* Dose summary chip */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-300">
            {drug === 'tnk' ? `TNK ${tnk?.total ?? '—'} mg` : `rtPA ${rtpa?.total ?? '—'} mg`}
            {thrombolyticStartTime ? ` · ${fmtTime(thrombolyticStartTime)}` : ''}
          </p>
        </div>

        {/* Compact 2-col checklist grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-3 lg:grid-cols-4">
          {POST_CHECKLIST.map((item) => {
            const done = !!checked[item.id]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
                className={`flex flex-col items-start gap-1.5 rounded-lg border px-3 py-2 text-left transition-all active:scale-[0.97] ${
                  done
                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                    : 'border-stroke-line hover:border-emerald-500/30 hover:bg-emerald-500/10'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <item.Icon size={14} className={done ? 'text-emerald-400' : 'text-stroke-textMuted'} />
                  {done
                    ? <CheckCircle2 size={14} className="text-emerald-500" />
                    : <Circle size={14} className="text-stroke-textMuted" />
                  }
                </div>
                <p className={`text-xs font-semibold leading-snug ${done ? 'text-emerald-300' : 'text-stroke-text'}`}>
                  {item.label}
                </p>
                <p className="text-[9px] text-stroke-textMuted leading-snug">{item.sub}</p>
              </button>
            )
          })}

          {/* Todas realizadas — dark blue, same size as other cells */}
          <button
            type="button"
            onClick={() => {
              const allDone = Object.fromEntries(POST_CHECKLIST.map((i) => [i.id, true]))
              setChecked(allDone)
              onConfirm({ drug, weight, dose, checklist: allDone, thrombolyticStartTime: thrombolyticStartTime?.toISOString() })
            }}
            className="flex flex-col items-start gap-1.5 rounded-lg border border-blue-900 bg-blue-900 px-3 py-2 text-left transition-all hover:bg-[#4D6CD6] active:scale-[0.97]"
          >
            <div className="flex items-center justify-between w-full">
              <CheckCircle2 size={14} className="text-blue-200" />
              <ChevronRight size={14} className="text-blue-300" />
            </div>
            <p className="text-xs font-semibold leading-snug text-white">Todas realizadas</p>
            <p className="text-[9px] text-blue-300 leading-snug">Continuar → Cuidados</p>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-stroke-panel rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-emerald-500/100 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / POST_CHECKLIST.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-stroke-textMuted shrink-0">{checkedCount}/{POST_CHECKLIST.length}</span>
        </div>

        {/* NIHSS intra-infusion — compact collapsible */}
        {thrombolyticStartTime && (
          <div className="border-t border-stroke-line pt-3">
            {nihssRecords.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {nihssRecords.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                    <Brain size={10} />
                    {r.score} · {r.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                ))}
              </div>
            )}
            {showNihssInput ? (
              <div className="flex gap-2">
                <input
                  type="number" inputMode="numeric" min={0} max={42} placeholder="0–42"
                  value={nihssEntry}
                  onChange={(e) => { setNihssEntry(e.target.value); setNihssEntrySource('manual') }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && nihssValid) handleSaveNihss() }}
                  autoFocus
                  className="flex-1 border border-emerald-300 bg-stroke-navy rounded-xl px-3 py-2 text-stroke-text text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button type="button" onClick={() => setShowNihssCalc(true)}
                  className="px-3 py-2 border border-stroke-line rounded-xl text-xs text-stroke-iconActive font-medium">
                  Guía
                </button>
                <button type="button" onClick={() => handleSaveNihss()} disabled={!nihssValid}
                  className="px-3 py-2 bg-emerald-700 text-white rounded-xl font-bold text-sm disabled:opacity-40">
                  ✓
                </button>
                <button type="button" onClick={() => { setShowNihssInput(false); setNihssEntry('') }}
                  className="px-3 py-2 border border-stroke-line rounded-xl text-stroke-textMuted text-sm">
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowNihssInput(true)}
                className="flex items-center gap-2 text-xs text-emerald-400 font-semibold hover:underline">
                <Plus size={12} /><Brain size={12} />
                NIHSS intra-infusión
              </button>
            )}
          </div>
        )}
      </StepCard>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => onConfirm({ drug, weight, dose, checklist: checked, thrombolyticStartTime: thrombolyticStartTime?.toISOString() })}
          disabled={!canContinue}
          className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 text-sm font-semibold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 md:w-auto md:px-5"
        >
          Continuar → Cuidados <ChevronRight size={18} />
        </button>
      </div>

      {showNihssCalc && (
        <NihssModal onLoad={handleNihssCalcResult} onClose={() => setShowNihssCalc(false)} />
      )}
    </div>
  )
}
