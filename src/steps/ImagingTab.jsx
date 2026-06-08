import { useState, useEffect } from 'react'
import { CheckCircle2, Scan, Clock, Droplets, Moon } from 'lucide-react'
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

function CTSection({ onConfirm, initialCtRequestTime, onCtRequest, initialBleeding }) {
  const [ctRequestTime, setCtRequestTime] = useState(initialCtRequestTime)
  const [bleeding, setBleeding] = useState(initialBleeding ?? null)
  useInterval(1000)

  const elapsed = timeSince(ctRequestTime)

  function handleCtRequest() {
    const now = new Date()
    setCtRequestTime(now)
    onCtRequest?.(now)
  }

  function handleBleedingSelect(value) {
    if (!ctRequestTime) return
    setBleeding(value)
    onConfirm({
      bleeding: value,
      ctRequestTime: ctRequestTime.toISOString(),
      ctElapsedSeconds: Math.floor((Date.now() - ctRequestTime.getTime()) / 1000),
    })
  }

  return (
    <div className={`overflow-hidden rounded-xl transition-colors duration-200 ${
      bleeding === true ? 'bg-status-critical/10' : bleeding === false ? 'bg-emerald-500/10' : ''
    }`}>
      <div className="flex items-start gap-3 px-3 py-3">
        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${ctRequestTime ? 'bg-emerald-500 text-stroke-bg' : 'bg-stroke-iconActive text-stroke-bg'}`}>
          {ctRequestTime ? <CheckCircle2 size={17} strokeWidth={2.4} /> : <Scan size={17} strokeWidth={2.4} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold leading-tight ${ctRequestTime ? 'text-emerald-300' : 'text-stroke-text'}`}>
            {ctRequestTime ? 'TAC solicitada' : 'TAC de encéfalo'}
          </p>
          {ctRequestTime && (
            <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-stroke-bg px-2 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              <Clock size={11} />
              <span className="tabular-nums">{elapsed}</span>
            </span>
          )}
        </div>
      </div>

      {!ctRequestTime ? (
        <div className="border-t border-stroke-line bg-stroke-bg p-2.5">
          <button type="button" onClick={handleCtRequest}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-stroke-iconActive text-stroke-bg px-4 py-2.5 text-sm font-bold transition-all hover:bg-[#4D6CD6] active:scale-[0.98]">
            <Scan size={17} strokeWidth={2.5} /> TAC solicitada
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 border-t border-stroke-line bg-stroke-bg p-2.5 animate-fade-in">
          <button type="button" onClick={() => handleBleedingSelect(true)}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
              bleeding === true ? 'border-status-critical bg-status-critical text-white' : 'border-stroke-line bg-stroke-navy text-stroke-textMuted hover:border-status-critical/50 hover:bg-status-critical/10'
            }`}>
            <Droplets size={17} strokeWidth={2.5} /> Sí sangre
          </button>
          <button type="button" onClick={() => handleBleedingSelect(false)}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
              bleeding === false ? 'border-emerald-500 bg-emerald-700 text-white' : 'border-emerald-500/30 bg-stroke-navy text-emerald-300 hover:border-emerald-300 hover:bg-emerald-500/10'
            }`}>
            <CheckCircle2 size={17} strokeWidth={2.5} /> No sangre
          </button>
        </div>
      )}
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
            initialCtRequestTime={initialCtRequestTime}
            initialBleeding={ctResult?.bleeding ?? null}
            onCtRequest={onCtRequest}
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
