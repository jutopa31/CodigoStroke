import { useRef, useState } from 'react'
import { ChevronRight, CheckCircle2, Circle, Hospital, Ban, Pill, BarChart2, Brain, Microscope, Heart, Clock, Plus } from 'lucide-react'
import StepCard from '../components/StepCard'
import NihssModal from '../components/NihssModal'

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

function round1(n) { return Math.round(n * 10) / 10 }

function calcRtPA(kg) {
  const total    = Math.min(round1(kg * 0.9), 90)
  const bolo     = round1(total * 0.1)
  const infusion = round1(total * 0.9)
  return { total, bolo, infusion }
}

function calcTNK(kg) {
  return { total: Math.min(round1(kg * 0.25), 25) }
}

function fmtTime(date) {
  return date?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) ?? null
}

export default function DosageStep({ onConfirm, thrombolyticStartTime = null, onThrombolyticStart, onAddNihss }) {
  const [view, setView]           = useState('dose')   // 'dose' | 'post'
  const [drug, setDrug]           = useState('tnk')
  const [weightStr, setWeightStr] = useState('')
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

  function adjust(delta) {
    const current = parseFloat(weightStr) || 0
    setWeightStr(String(Math.max(1, Math.min(250, current + delta))))
  }

  function handleThrombolyticStart() {
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
      <div className="px-4 pb-4">
        <StepCard step="7" title="Trombolítico — dosis" accent="green">

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-emerald-500" />
              <div className="h-1.5 w-8 rounded-full bg-neutral-200" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">1 de 2</span>
          </div>

          {/* Drug: compact segmented toggle */}
          <div className="flex rounded-xl overflow-hidden border border-neutral-200 mb-4 text-sm font-semibold">
            {[
              { id: 'tnk',  label: 'TNK',  sub: 'Tenecteplase' },
              { id: 'rtpa', label: 'rtPA', sub: 'Alteplase' },
            ].map(({ id, label, sub }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDrug(id)}
                className={`flex-1 py-2.5 transition-all ${
                  drug === id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-neutral-500 hover:bg-emerald-50'
                }`}
              >
                {label}
                <span className={`block text-[10px] font-normal ${drug === id ? 'text-emerald-100' : 'text-neutral-400'}`}>
                  {sub}
                </span>
              </button>
            ))}
          </div>

          {/* Weight stepper */}
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">Peso (kg)</p>
          <div className="grid grid-cols-[2.2rem_2.2rem_minmax(0,1fr)_2.2rem_2.2rem] items-center gap-1.5 mb-3">
            {[-5, -1].map((d) => (
              <button key={d} type="button" onClick={() => adjust(d)}
                className="h-10 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-xs hover:bg-neutral-50 active:scale-95 transition-all">
                {d}
              </button>
            ))}
            <input
              type="number" inputMode="decimal" placeholder="70"
              value={weightStr} onChange={(e) => setWeightStr(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && validWeight) startButtonRef.current?.focus() }}
              autoFocus
              className="w-full min-w-0 border border-neutral-200 rounded-xl px-2 py-2.5 text-neutral-800 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-neutral-300"
            />
            {[1, 5].map((d) => (
              <button key={d} type="button" onClick={() => adjust(d)}
                className="h-10 rounded-xl border border-neutral-200 text-neutral-600 font-semibold text-xs hover:bg-neutral-50 active:scale-95 transition-all">
                +{d}
              </button>
            ))}
          </div>

          {/* Preset chips */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {WEIGHT_PRESETS.map((w) => (
              <button key={w} type="button" onClick={() => setWeightStr(String(w))}
                className={`px-2.5 py-1 rounded-full text-xs font-bold border-2 transition-all ${
                  weightStr === String(w)
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-neutral-200 text-neutral-500 hover:border-emerald-300 hover:bg-emerald-50'
                }`}>
                {w} kg
              </button>
            ))}
          </div>

          {/* Dose result */}
          <div className={`rounded-xl px-4 py-3 transition-all duration-200 ${
            validWeight && dose
              ? 'bg-emerald-50 border-2 border-emerald-300'
              : 'bg-neutral-50 border-2 border-dashed border-neutral-200'
          }`}>
            {validWeight && dose ? (
              drug === 'tnk' ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-mono font-bold text-emerald-800">{tnk.total} mg</span>
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">Tenecteplase</p>
                    <p className="text-xs text-emerald-600">bolo único IV</p>
                    {weight * 0.25 >= 25 && <p className="text-[10px] text-emerald-500 mt-0.5">⚠ Dosis máxima</p>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-mono font-bold text-emerald-800">{rtpa.total} mg</span>
                    <p className="text-xs text-emerald-600">Alteplase — dosis total</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                      <p className="text-[10px] text-neutral-500">Bolo IV (10%)</p>
                      <p className="text-base font-mono font-bold text-emerald-800">{rtpa.bolo} mg</p>
                      <p className="text-[10px] text-neutral-400">en 1 min</p>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 border border-emerald-200">
                      <p className="text-[10px] text-neutral-500">Infusión (90%)</p>
                      <p className="text-base font-mono font-bold text-emerald-800">{rtpa.infusion} mg</p>
                      <p className="text-[10px] text-neutral-400">en 60 min</p>
                    </div>
                  </div>
                </div>
              )
            ) : (
              <span className="text-2xl font-mono font-bold text-neutral-300">— mg</span>
            )}
          </div>

          {/* Start time button */}
          {validWeight && dose && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <Clock size={16} className="text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-emerald-800">Inicio del trombolítico</p>
                {thrombolyticStartTime && (
                  <p className="text-sm font-mono font-bold text-emerald-900">{fmtTime(thrombolyticStartTime)}</p>
                )}
              </div>
              <button
                type="button" ref={startButtonRef} onClick={handleThrombolyticStart}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  thrombolyticStartTime
                    ? 'border border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Continuar — post-trombolisis <ChevronRight size={16} />
          </button>
          {!thrombolyticStartTime && validWeight && (
            <p className="text-center text-[11px] text-neutral-400 mt-2">Registrá el inicio del trombolítico para continuar</p>
          )}
        </div>
      </div>
    )
  }

  // ── VIEW 2: Post-trombolisis ───────────────────────────────────────────────
  return (
    <div className="px-4 pb-4">
      <StepCard step="" title="Indicaciones post-trombolisis" accent="green">

        {/* Progress + back */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-8 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">2 de 2</span>
          </div>
          <button type="button" onClick={() => setView('dose')}
            className="text-[10px] text-brand-500 font-semibold hover:underline">
            ← Dosis
          </button>
        </div>

        {/* Dose summary chip */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <p className="text-xs font-semibold text-emerald-800">
            {drug === 'tnk' ? `TNK ${tnk?.total ?? '—'} mg` : `rtPA ${rtpa?.total ?? '—'} mg`}
            {thrombolyticStartTime ? ` · ${fmtTime(thrombolyticStartTime)}` : ''}
          </p>
        </div>

        {/* Compact 2-col checklist grid */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {POST_CHECKLIST.map((item) => {
            const done = !!checked[item.id]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))}
                className={`flex flex-col items-start gap-1.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all active:scale-[0.97] ${
                  done
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : 'border-neutral-200 hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <item.Icon size={14} className={done ? 'text-emerald-600' : 'text-neutral-400'} />
                  {done
                    ? <CheckCircle2 size={14} className="text-emerald-500" />
                    : <Circle size={14} className="text-neutral-200" />
                  }
                </div>
                <p className={`text-xs font-semibold leading-snug ${done ? 'text-emerald-800' : 'text-neutral-700'}`}>
                  {item.label}
                </p>
                <p className="text-[9px] text-neutral-400 leading-snug">{item.sub}</p>
              </button>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-1.5 bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / POST_CHECKLIST.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 shrink-0">{checkedCount}/{POST_CHECKLIST.length}</span>
        </div>

        {/* NIHSS intra-infusion — compact collapsible */}
        {thrombolyticStartTime && (
          <div className="border-t border-neutral-100 pt-3">
            {nihssRecords.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {nihssRecords.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    <Brain size={10} />
                    {r.score} · {r.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
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
                  className="flex-1 border border-emerald-300 rounded-xl px-3 py-2 text-neutral-800 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button type="button" onClick={() => setShowNihssCalc(true)}
                  className="px-3 py-2 border border-neutral-200 rounded-xl text-xs text-brand-600 font-medium">
                  Guía
                </button>
                <button type="button" onClick={() => handleSaveNihss()} disabled={!nihssValid}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-40">
                  ✓
                </button>
                <button type="button" onClick={() => { setShowNihssInput(false); setNihssEntry('') }}
                  className="px-3 py-2 border border-neutral-200 rounded-xl text-neutral-500 text-sm">
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setShowNihssInput(true)}
                className="flex items-center gap-2 text-xs text-emerald-600 font-semibold hover:underline">
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
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Finalizar protocolo <ChevronRight size={18} />
        </button>
      </div>

      {showNihssCalc && (
        <NihssModal onLoad={handleNihssCalcResult} onClose={() => setShowNihssCalc(false)} />
      )}
    </div>
  )
}
