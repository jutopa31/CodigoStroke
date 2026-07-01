import { useState, useEffect } from 'react'
import { CheckCircle2, Scan, Clock, Droplets, Moon, Activity } from 'lucide-react'
import StepCard from '../components/StepCard'

function useInterval(ms, active = true) {
  const [, setTick] = useState(0)
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setTick((t) => t + 1), ms)
    return () => clearInterval(id)
  }, [ms, active])
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

function withClock(baseDate, clockValue) {
  if (!baseDate || !clockValue) return baseDate
  const [hours, minutes] = clockValue.split(':').map(Number)
  const next = new Date(baseDate)
  next.setHours(hours, minutes, 0, 0)
  return next
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
  onProgress,
  onCtRequest,
  onCtPerformed,
  initialCtRequestTime,
  initialCtPerformedTime,
  initialInterpretTime,
  initialBleeding,
  isActive = true,
}) {
  const [requestTime, setRequestTime] = useState(initialCtRequestTime ?? null)
  const [performedTime, setPerformedTime] = useState(initialCtPerformedTime ?? null)
  const [interpretTime, setInterpretTime] = useState(initialInterpretTime ?? null)
  const [bleeding, setBleeding] = useState(initialBleeding ?? null)
  useInterval(1000, isActive)

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

  function updateRequestTime(next) {
    setRequestTime(next)
    onCtRequest?.(next)
    onProgress?.({
      ctRequestTime: next.toISOString(),
      ...(interpretTime ? { ctElapsedSeconds: Math.max(0, Math.floor((interpretTime.getTime() - next.getTime()) / 1000)) } : {}),
    })
  }

  function updatePerformedTime(next) {
    setPerformedTime(next)
    onCtPerformed?.(next)
    onProgress?.({ ctPerformedTime: next.toISOString() })
  }

  function updateInterpretTime(next) {
    setInterpretTime(next)
    onProgress?.({
      ctInterpretTime: next.toISOString(),
      ...(requestTime ? { ctElapsedSeconds: Math.max(0, Math.floor((next.getTime() - requestTime.getTime()) / 1000)) } : {}),
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

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {CT_MILESTONES.map(({ label, Icon }, index) => {
          const handlers = [updateRequestTime, updatePerformedTime, updateInterpretTime]
          return (
            <MilestoneCard
              key={label}
              label={label}
              Icon={Icon}
              time={times[index]}
              previousTime={index > 0 ? times[index - 1] : null}
              active={index === step && step < 3}
              onTimeChange={handlers[index]}
            />
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
            className={`${btnBase} animate-fade-in btn-primary text-white`}>
            <Scan size={17} strokeWidth={2.5} /> TAC solicitada
          </button>
        )}
        {step === 1 && (
          <button type="button" onClick={handlePerformed}
            className={`${btnBase} animate-fade-in btn-primary text-white`}>
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

const MRI_MILESTONES = [
  { label: 'Solicitada', Icon: Moon },
  { label: 'Realizada', Icon: Activity },
  { label: 'Interpretada', Icon: Scan },
]

function MilestoneCard({ label, Icon, time, previousTime, active, onTimeChange, tone = 'clinical' }) {
  const done = !!time
  const invalidOrder = !!previousTime && !!time && time.getTime() < previousTime.getTime()
  const activeStyles = tone === 'indigo'
    ? 'border-indigo-400 bg-indigo-50 ring-indigo-200'
    : 'border-clinical-600 bg-clinical-50 ring-clinical-100'
  const iconStyles = tone === 'indigo' ? 'bg-indigo-600 text-white' : 'bg-clinical-700 text-white'

  return (
    <div className={`min-w-0 rounded-2xl border px-3 py-3 transition-colors ${
      invalidOrder
        ? 'border-status-critical bg-red-50'
        : active
          ? `${activeStyles} ring-2`
          : done
            ? 'border-stroke-line bg-white'
            : 'border-stroke-line bg-stroke-surfaceMuted opacity-60'
    }`}>
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          done ? 'bg-emerald-100 text-emerald-700' : active ? iconStyles : 'bg-white text-stroke-textMuted'
        }`}>
          {done ? <CheckCircle2 size={16} strokeWidth={2.5} /> : <Icon size={16} strokeWidth={2.3} />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-stroke-text">{label}</p>
          {!done && <p className="text-[10px] text-stroke-textMuted">{active ? 'Hito actual' : 'Pendiente'}</p>}
        </div>
      </div>
      {done && (
        <div className="mt-3">
          <label className="text-[9px] font-semibold uppercase tracking-wider text-stroke-textMuted">Hora registrada</label>
          <input
            type="time"
            value={fmtClock(time)}
            onChange={(event) => onTimeChange?.(withClock(time, event.target.value))}
            className="mt-1 h-10 w-full rounded-xl border border-stroke-line bg-white px-2 font-mono text-sm font-bold tabular-nums text-stroke-text focus:border-stroke-iconActive focus:outline-none focus:ring-2 focus:ring-stroke-iconActive/15"
            style={{ colorScheme: 'light' }}
            aria-label={`Hora de ${label.toLowerCase()}`}
          />
          {invalidOrder ? (
            <p className="mt-1 text-center text-[10px] font-bold text-status-critical">Revisar orden horario</p>
          ) : (
            previousTime && <p className="mt-1 text-center font-mono text-[10px] text-stroke-textMuted">{fmtDelta(previousTime, time)}</p>
          )}
        </div>
      )}
    </div>
  )
}

function MRISection({
  onConfirm,
  onProgress,
  initialMriRequestTime,
  initialMriPerformedTime,
  initialMriInterpretTime,
  initialBleeding,
  initialMismatch,
  isActive = true,
}) {
  const [mriRequestTime, setMriRequestTime] = useState(initialMriRequestTime ?? null)
  const [mriPerformedTime, setMriPerformedTime] = useState(initialMriPerformedTime ?? null)
  const [mriInterpretTime, setMriInterpretTime] = useState(initialMriInterpretTime ?? null)
  const [bleeding, setBleeding] = useState(initialBleeding ?? null)
  const [mismatch, setMismatch] = useState(initialMismatch ?? null)
  useInterval(1000, isActive)

  const interpreted = bleeding === true || (bleeding === false && (mismatch === true || mismatch === false))
  const times = [mriRequestTime, mriPerformedTime, mriInterpretTime]
  const step = !mriRequestTime ? 0 : !mriPerformedTime ? 1 : !interpreted ? 2 : 3
  const elapsedSinceLast = step === 1 ? timeSince(mriRequestTime) : step === 2 ? timeSince(mriPerformedTime) : null
  const btnBase = 'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98]'

  function handleRequest() {
    const now = new Date()
    setMriRequestTime(now)
    onProgress?.({ mriRequestTime: now.toISOString() })
  }

  function handlePerformed() {
    if (!mriRequestTime) return
    const now = new Date()
    setMriPerformedTime(now)
    onProgress?.({ mriPerformedTime: now.toISOString() })
  }

  function finishInterpretation(nextBleeding, nextMismatch) {
    const now = new Date()
    setMriInterpretTime(now)
    onConfirm({
      bleeding: nextBleeding,
      mismatch: nextMismatch,
      mriRequestTime: mriRequestTime.toISOString(),
      mriPerformedTime: mriPerformedTime.toISOString(),
      mriInterpretTime: now.toISOString(),
      mriElapsedSeconds: Math.floor((now.getTime() - mriRequestTime.getTime()) / 1000),
    })
  }

  function handleBleeding(value) {
    setBleeding(value)
    if (value) {
      finishInterpretation(true, null)
    } else {
      onProgress?.({ bleeding: false })
    }
  }

  function handleMismatch(value) {
    setMismatch(value)
    if (mriRequestTime && mriPerformedTime && bleeding === false) finishInterpretation(false, value)
  }

  function updateMriTime(field, setter, next) {
    setter(next)
    const data = { [field]: next.toISOString() }
    if (field === 'mriRequestTime' && mriInterpretTime) {
      data.mriElapsedSeconds = Math.max(0, Math.floor((mriInterpretTime.getTime() - next.getTime()) / 1000))
    }
    if (field === 'mriInterpretTime' && mriRequestTime) {
      data.mriElapsedSeconds = Math.max(0, Math.floor((next.getTime() - mriRequestTime.getTime()) / 1000))
    }
    onProgress?.(data)
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 bg-indigo-500/15">
        <Moon size={14} className="text-indigo-300 shrink-0" />
        <span className="text-xs font-semibold text-indigo-300">Protocolo WAKE-UP — descartar sangrado y evaluar mismatch FLAIR-DWI</span>
      </div>

      <div className="mb-3 mt-3 h-1.5 overflow-hidden rounded-full bg-stroke-line">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {MRI_MILESTONES.map(({ label, Icon }, index) => {
          const fields = ['mriRequestTime', 'mriPerformedTime', 'mriInterpretTime']
          const setters = [setMriRequestTime, setMriPerformedTime, setMriInterpretTime]
          return (
            <MilestoneCard
              key={label}
              label={label}
              Icon={Icon}
              time={times[index]}
              previousTime={index > 0 ? times[index - 1] : null}
              active={index === step && step < 3}
              tone="indigo"
              onTimeChange={(next) => updateMriTime(fields[index], setters[index], next)}
            />
          )
        })}
      </div>

      {elapsedSinceLast && (
        <div className="mt-2.5 flex justify-center animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-stroke-line bg-stroke-bg px-2.5 py-1 text-[11px] text-stroke-textMuted">
            <Clock size={11} /> desde último hito
            <span className="font-mono font-semibold tabular-nums text-indigo-300">{elapsedSinceLast}</span>
          </span>
        </div>
      )}

      <div className="mt-4">
        {step === 0 && <button type="button" onClick={handleRequest} className={`${btnBase} animate-fade-in bg-indigo-700 text-white hover:bg-indigo-800`}><Moon size={17} /> RMN solicitada</button>}
        {step === 1 && <button type="button" onClick={handlePerformed} className={`${btnBase} animate-fade-in bg-indigo-700 text-white hover:bg-indigo-800`}><Activity size={17} /> RMN realizada</button>}
        {step === 2 && bleeding === null && (
          <div className="animate-fade-in">
            <p className="mb-2 text-center text-xs font-medium text-stroke-textMuted">RMN interpretada — ¿hemorragia intracraneal?</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleBleeding(true)} className={`${btnBase} border border-status-critical/40 bg-stroke-navy text-red-300 hover:bg-status-critical hover:text-white`}><Droplets size={17} /> Sí sangre</button>
              <button type="button" onClick={() => handleBleeding(false)} className={`${btnBase} border border-emerald-500/40 bg-stroke-navy text-emerald-300 hover:bg-emerald-700 hover:text-white`}><CheckCircle2 size={17} /> No sangre</button>
            </div>
          </div>
        )}
        {step === 2 && bleeding === false && (
          <div className="animate-fade-in space-y-3">
            <div className="rounded-lg bg-stroke-bg px-3 py-2 text-xs text-stroke-textMuted">
              <p className="font-semibold text-stroke-text">Criterio mismatch FLAIR-DWI</p>
              <p>DWI (+) con FLAIR (−) o sutil.</p>
            </div>
            <p className="text-center text-xs font-medium text-stroke-textMuted">¿Presenta mismatch DWI-FLAIR?</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => handleMismatch(false)} className={`${btnBase} border border-amber-500/40 bg-stroke-navy text-amber-300 hover:bg-amber-700 hover:text-white`}>No mismatch</button>
              <button type="button" onClick={() => handleMismatch(true)} className={`${btnBase} border border-emerald-500/40 bg-stroke-navy text-emerald-300 hover:bg-emerald-700 hover:text-white`}>Sí mismatch</button>
            </div>
          </div>
        )}
      </div>

      {interpreted && (
        <div className={`mt-3 rounded-xl border px-3 py-2 animate-fade-in ${bleeding ? 'border-status-critical/40 bg-status-critical/10' : mismatch ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`}>
          <p className={`text-xs font-semibold ${bleeding ? 'text-red-300' : mismatch ? 'text-emerald-300' : 'text-amber-300'}`}>
            {bleeding ? 'Hemorragia presente — trombólisis contraindicada' : mismatch ? 'Sin sangrado y con mismatch — evaluar contraindicaciones' : 'Sin sangrado y sin mismatch — trombólisis IV no indicada'}
          </p>
        </div>
      )}
    </div>
  )
}

// ── ImagingTab (exported) ────────────────────────────────────────────────────

export default function ImagingTab({
  onCtConfirm,
  onMriConfirm,
  onMriProgress,
  onCtRequest,
  onCtPerformed,
  onCtProgress,
  ctResult,
  isWakeUpStroke,
  initialCtRequestTime,
  isActive = true,
}) {
  const [selectedMode, setSelectedMode] = useState(null)

  const ctConfirmed  = !!ctResult?.ctRequestTime && !!ctResult?.ctPerformedTime && !!ctResult?.ctInterpretTime
    && (ctResult?.bleeding === true || ctResult?.bleeding === false)
  const mriConfirmed = !!ctResult?.mriRequestTime && !!ctResult?.mriPerformedTime && !!ctResult?.mriInterpretTime && (
    ctResult?.bleeding === true || ctResult?.mismatch === true || ctResult?.mismatch === false
  )

  // MRI toggle only appears when time window is uncertain (wake-up stroke)
  const showMriToggle = isWakeUpStroke === true
  const mode = showMriToggle ? (selectedMode ?? 'mri') : 'ct'

  function handleCtResult(data) {
    if (showMriToggle && data.bleeding === false) {
      setSelectedMode('mri')
    }
    onCtConfirm(data)
  }

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
                mode === id ? 'btn-primary text-white font-semibold' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-iconActive/10'
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
            onConfirm={handleCtResult}
            onProgress={onCtProgress}
            onCtRequest={onCtRequest}
            onCtPerformed={onCtPerformed}
            initialCtRequestTime={initialCtRequestTime}
            initialCtPerformedTime={ctResult?.ctPerformedTime ? new Date(ctResult.ctPerformedTime) : null}
            initialInterpretTime={ctResult?.ctInterpretTime ? new Date(ctResult.ctInterpretTime) : null}
            initialBleeding={ctResult?.bleeding ?? null}
            isActive={isActive}
          />
          {ctConfirmed && ctResult?.bleeding === true && (
          <div className="mt-3 bg-status-critical/10 border border-status-critical/40 rounded-lg px-3 py-2.5 animate-fade-in">
              <p className="text-sm font-bold text-red-300 mb-1">Hemorragia intracraneal presente</p>
              <p className="text-xs text-red-300 leading-relaxed">Contraindicación absoluta para trombolisis IV.</p>
            </div>
          )}
          {ctConfirmed && ctResult?.bleeding === false && (
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
            onProgress={onMriProgress}
            initialMriRequestTime={ctResult?.mriRequestTime ? new Date(ctResult.mriRequestTime) : null}
            initialMriPerformedTime={ctResult?.mriPerformedTime ? new Date(ctResult.mriPerformedTime) : null}
            initialMriInterpretTime={ctResult?.mriInterpretTime ? new Date(ctResult.mriInterpretTime) : null}
            initialBleeding={ctResult?.mriRequestTime ? (ctResult?.bleeding ?? null) : null}
            initialMismatch={ctResult?.mismatch ?? null}
            isActive={isActive}
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
