import { useState, useEffect } from 'react'
import { CheckCircle2, Scan, Clock, Droplets, Moon, Activity } from 'lucide-react'
import StepCard from '../components/StepCard'

function useInterval(ms) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms])
}

function timeSince(date) {
  if (!date) return null
  const diff = Math.floor((Date.now() - date.getTime()) / 1000)
  const m = Math.floor(diff / 60)
  const s = diff % 60
  if (m > 0) return `${m} min ${String(s).padStart(2, '0')} s`
  return `${s} s`
}

// ── CT Section ───────────────────────────────────────────────────────────────
// Stepped-cards timeline: three milestones advance left→right, each stamping a
// time. Buttons appear sequentially; the active card grows, completed cards
// collapse to a compact time + delta stamp.

function fmtClock(d) {
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function fmtDelta(a, b) {
  const s = Math.round((b.getTime() - a.getTime()) / 1000)
  const m = Math.floor(s / 60)
  return m > 0 ? `Δ ${m}m ${String(s % 60).padStart(2, '0')}s` : `Δ ${s}s`
}

const CT_MILESTONES = [
  { label: 'Solicitada', Icon: Scan },
  { label: 'Realizada', Icon: Activity },
  { label: 'Interpretada', Icon: Droplets },
]

function CTSection({
  onConfirm,
  onCtRequest,
  onCtPerformed,
  initialCtRequestTime,
  initialCtPerformedTime,
  initialInterpretTime,
  initialBleeding,
}) {
  const [requestTime, setRequestTime] = useState(initialCtRequestTime ?? null)
  const [performedTime, setPerformedTime] = useState(initialCtPerformedTime ?? null)
  const [interpretTime, setInterpretTime] = useState(initialInterpretTime ?? null)
  const [bleeding, setBleeding] = useState(initialBleeding ?? null)
  useInterval(1000)

  const interpreted = bleeding === true || bleeding === false
  const times = [requestTime, performedTime, interpretTime]
  // step = number of completed milestones (also the index of the active one)
  const step = !requestTime ? 0 : !performedTime ? 1 : !interpreted ? 2 : 3

  function handleRequest() {
    const now = new Date()
    setRequestTime(now)
    onCtRequest?.(now)
  }

  function handlePerformed() {
    if (!requestTime) return
    const now = new Date()
    setPerformedTime(now)
    onCtPerformed?.(now)
  }

  function handleInterpret(value) {
    if (!requestTime || !performedTime) return
    const now = new Date()
    setInterpretTime(now)
    setBleeding(value)
    onConfirm({
      bleeding: value,
      ctRequestTime: requestTime.toISOString(),
      ctPerformedTime: performedTime.toISOString(),
      ctInterpretTime: now.toISOString(),
      ctElapsedSeconds: Math.floor((now.getTime() - requestTime.getTime()) / 1000),
    })
  }

  const elapsedSinceLast = step === 1 ? timeSince(requestTime) : step === 2 ? timeSince(performedTime) : null

  const btnBase = 'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98]'

  return (
    <div>
      {/* progress sweep */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stroke-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-status-warning transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {/* stepped cards */}
      <div className="flex items-stretch gap-2">
        {CT_MILESTONES.map(({ label, Icon }, i) => {
          const isDone = !!times[i]
          const isActive = i === step && step < 3
          return (
            <div
              key={label}
              className={`flex min-h-[94px] flex-col items-center justify-center rounded-xl border px-2 py-3 text-center transition-all duration-300 ${
                isActive
                  ? 'flex-[1.6] -translate-y-0.5 border-stroke-iconActive bg-stroke-panel ring-2 ring-stroke-iconActive/20'
                  : isDone
                    ? 'flex-1 border-stroke-line bg-stroke-bg'
                    : 'flex-1 border-stroke-line bg-stroke-bg opacity-50'
              }`}
            >
              <span className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                isDone ? 'bg-emerald-500 text-stroke-bg animate-scale-in' : isActive ? 'bg-stroke-iconActive/20 text-stroke-iconActive' : 'bg-stroke-navy text-stroke-textMuted'
              }`}>
                {isDone ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2.4} />}
              </span>
              <span className={`font-sans text-xs font-semibold leading-tight ${isDone || isActive ? 'text-stroke-text' : 'text-stroke-textMuted'}`}>
                {label}
              </span>
              {isDone && (
                <span className="mt-1 font-mono text-[11px] font-semibold tabular-nums text-emerald-300">{fmtClock(times[i])}</span>
              )}
              {isDone && i > 0 && times[i - 1] && (
                <span className="mt-0.5 font-mono text-[10px] tabular-nums text-stroke-textMuted">{fmtDelta(times[i - 1], times[i])}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* live elapsed since last milestone */}
      {elapsedSinceLast && (
        <div className="mt-2.5 flex justify-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-stroke-line bg-stroke-bg px-2.5 py-1 text-[11px] text-stroke-textMuted">
            <Clock size={11} /> desde último hito
            <span className="font-mono font-semibold tabular-nums text-status-warning">{elapsedSinceLast}</span>
          </span>
        </div>
      )}

      {/* sequential action area */}
      <div className="mt-4">
        {step === 0 && (
          <button type="button" onClick={handleRequest}
            className={`${btnBase} animate-fade-in bg-stroke-iconActive text-stroke-bg hover:bg-[#4D6CD6]`}>
            <Scan size={17} strokeWidth={2.5} /> TAC solicitada
          </button>
        )}
        {step === 1 && (
          <button type="button" onClick={handlePerformed}
            className={`${btnBase} animate-fade-in bg-stroke-iconActive text-stroke-bg hover:bg-[#4D6CD6]`}>
            <Activity size={17} strokeWidth={2.5} /> TAC realizada
          </button>
        )}
        {step === 2 && (
          <div className="animate-fade-in">
            <p className="mb-2 text-center text-xs font-medium text-stroke-textMuted">TAC interpretada — ¿hemorragia?</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleInterpret(true)}
                className={`${btnBase} border border-status-critical/40 bg-stroke-navy text-red-300 hover:border-status-critical hover:bg-status-critical hover:text-white`}>
                <Droplets size={17} strokeWidth={2.5} /> Sí sangre
              </button>
              <button type="button" onClick={() => handleInterpret(false)}
                className={`${btnBase} border border-emerald-500/40 bg-stroke-navy text-emerald-300 hover:border-emerald-500 hover:bg-emerald-700 hover:text-white`}>
                <CheckCircle2 size={17} strokeWidth={2.5} /> No sangre
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MRI Section ──────────────────────────────────────────────────────────────

function MRISection({ onConfirm, initialMriRequestTime, initialMismatch }) {
  const [mriRequestTime, setMriRequestTime] = useState(initialMriRequestTime ?? null)
  const [mismatch, setMismatch] = useState(initialMismatch ?? null)
  useInterval(1000)

  const elapsed = timeSince(mriRequestTime)

  function handleMismatch(value) {
    setMismatch(value)
    if (mriRequestTime) {
      onConfirm({
        mismatch: value,
        mriRequestTime: mriRequestTime.toISOString(),
        mriElapsedSeconds: Math.floor((Date.now() - mriRequestTime.getTime()) / 1000),
      })
    }
  }

  return (
    <div className="rounded-xl bg-indigo-500/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-indigo-500/15">
        <Moon size={14} className="text-indigo-300 shrink-0" />
        <span className="text-xs font-semibold text-indigo-300">Protocolo WAKE-UP — evaluar mismatch FLAIR-DWI</span>
      </div>

      {!mriRequestTime ? (
        <div className="p-2.5">
          <button type="button" onClick={() => setMriRequestTime(new Date())}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-semibold rounded-lg transition-all">
            <Moon size={16} /> Solicitar RMN DWI + FLAIR
          </button>
        </div>
      ) : (
        <div className="p-2.5 space-y-2">
          <div className="flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-xl px-3 py-2">
            <Clock size={13} className="text-indigo-300 shrink-0" />
            <span className="text-xs font-medium text-indigo-300">RMN solicitada hace {elapsed}</span>
          </div>

          <div className="bg-stroke-bg rounded-lg px-3 py-2 text-xs text-stroke-textMuted space-y-1">
            <p className="font-semibold text-stroke-text">Criterio mismatch FLAIR-DWI</p>
            <p>DWI (+): restricción de difusión presente</p>
            <p>FLAIR (−) o sutil: sin cambios establecidos</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => handleMismatch(false)}
              className={`py-2.5 rounded-lg border font-bold text-sm transition-all active:scale-[0.98] ${
                mismatch === false ? 'border-stroke-iconActive bg-stroke-iconActive text-stroke-bg' : 'border-stroke-line bg-stroke-navy text-stroke-text hover:bg-stroke-bg'
              }`}>
              NO mismatch
            </button>
            <button type="button" onClick={() => handleMismatch(true)}
              className={`py-2.5 rounded-lg border font-bold text-sm transition-all active:scale-[0.98] ${
                mismatch === true ? 'border-emerald-500 bg-emerald-700 text-white' : 'border-emerald-500/30 bg-stroke-navy text-emerald-300 hover:bg-emerald-500/10'
              }`}>
              SÍ mismatch
            </button>
          </div>

          {mismatch === true && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-300">Mismatch presente — evaluar contraindicaciones</p>
            </div>
          )}
          {mismatch === false && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2 animate-fade-in">
              <p className="text-xs font-semibold text-amber-300">Sin mismatch — trombolisis IV no indicada en wake-up</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── ImagingTab (exported) ────────────────────────────────────────────────────

export default function ImagingTab({
  onCtConfirm,
  onMriConfirm,
  onCtRequest,
  onCtPerformed,
  ctResult,
  isWakeUpStroke,
  initialCtRequestTime,
}) {
  const [selectedMode, setSelectedMode] = useState(null)

  const ctConfirmed  = ctResult?.bleeding === true || ctResult?.bleeding === false
  const mriConfirmed = ctResult?.mismatch  === true || ctResult?.mismatch  === false

  // MRI toggle only appears when time window is uncertain (wake-up stroke)
  const showMriToggle = isWakeUpStroke === true
  const mode = showMriToggle ? (selectedMode ?? 'ct') : 'ct'

  return (
    <div className="px-4 pb-4 space-y-3 md:px-0">
      {/* Mode toggle — only visible for wake-up / uncertain window */}
      {showMriToggle ? (
        <div className="flex rounded-xl overflow-hidden border border-stroke-line text-sm font-semibold">
          {[
            { id: 'ct',  label: 'TC de encéfalo' },
            { id: 'mri', label: 'RMN (Wake-up)' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setSelectedMode(id)}
              className={`flex-1 py-2.5 transition-all ${
                mode === id ? 'bg-stroke-iconActive text-stroke-bg font-semibold' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-iconActive/10'
              }`}>
              {label}
              {id === 'ct' && ctConfirmed  && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />}
              {id === 'mri' && mriConfirmed && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stroke-navy border border-stroke-line">
          <Scan size={13} className="text-stroke-iconActive shrink-0" />
          <p className="text-xs text-stroke-textMuted font-medium">Ventana terapéutica conocida — solo TC de encéfalo</p>
        </div>
      )}

      {/* Banner: CT clear but MRI still pending in wake-up protocol */}
      {showMriToggle && ctConfirmed && ctResult?.bleeding === false && !mriConfirmed && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in">
          <CheckCircle2 size={14} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-amber-300">TAC sin hemorragia — ventana incierta requiere RMN para evaluar mismatch FLAIR-DWI</p>
        </div>
      )}

      {/* CT section — always shown unless wake-up mode is active on MRI tab */}
      {(!showMriToggle || mode === 'ct') && (
        <StepCard step="" title="TAC de encéfalo" accent="blue">
          <CTSection
            onConfirm={onCtConfirm}
            onCtRequest={onCtRequest}
            onCtPerformed={onCtPerformed}
            initialCtRequestTime={initialCtRequestTime}
            initialCtPerformedTime={ctResult?.ctPerformedTime ? new Date(ctResult.ctPerformedTime) : null}
            initialInterpretTime={ctResult?.ctInterpretTime ? new Date(ctResult.ctInterpretTime) : null}
            initialBleeding={ctResult?.bleeding ?? null}
          />
          {ctResult?.bleeding === true && (
          <div className="mt-3 bg-status-critical/10 border border-status-critical/40 rounded-lg px-3 py-2.5 animate-fade-in">
              <p className="text-sm font-bold text-red-300 mb-1">Hemorragia intracraneal presente</p>
              <p className="text-xs text-red-300 leading-relaxed">Contraindicación absoluta para trombolisis IV.</p>
            </div>
          )}
          {ctResult?.bleeding === false && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-300 rounded-lg px-3 py-2.5 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-300">TAC sin hemorragia — continuar evaluación.</p>
            </div>
          )}
        </StepCard>
      )}

      {/* MRI section — only for wake-up stroke / uncertain window */}
      {showMriToggle && mode === 'mri' && (
        <StepCard step="" title="RMN — ACV del despertar" accent="blue">
          <MRISection
            onConfirm={onMriConfirm}
            initialMriRequestTime={ctResult?.mriRequestTime ? new Date(ctResult.mriRequestTime) : null}
            initialMismatch={ctResult?.mismatch ?? null}
          />
        </StepCard>
      )}

      {(ctConfirmed || mriConfirmed) && !(showMriToggle && ctConfirmed && ctResult?.bleeding === false && !mriConfirmed) && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold text-emerald-300">Imagen registrada</p>
        </div>
      )}
    </div>
  )
}
