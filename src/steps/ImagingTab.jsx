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

function CTSection({ onConfirm, initialCtRequestTime, onCtRequest }) {
  const [ctRequestTime, setCtRequestTime] = useState(initialCtRequestTime)
  const [bleeding, setBleeding] = useState(null)
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
    <div className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
      !ctRequestTime ? 'border-blue-200 bg-blue-50/70' : bleeding === true ? 'border-blue-800/40 bg-blue-900/8' : bleeding === false ? 'border-emerald-200 bg-emerald-50/80' : 'border-blue-100 bg-white'
    }`}>
      <div className="flex items-start gap-3 px-4 py-4">
        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${ctRequestTime ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
          {ctRequestTime ? <CheckCircle2 size={21} strokeWidth={2.4} /> : <Scan size={21} strokeWidth={2.4} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold leading-tight ${ctRequestTime ? 'text-emerald-800' : 'text-blue-800'}`}>
            {ctRequestTime ? 'TAC solicitada' : 'TAC de encéfalo'}
          </p>
          {ctRequestTime && (
            <span className="inline-flex items-center gap-1 mt-1 rounded-md bg-white/75 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
              <Clock size={11} />
              <span className="tabular-nums">{elapsed}</span>
            </span>
          )}
        </div>
      </div>

      {!ctRequestTime ? (
        <div className="border-t border-blue-100 bg-white/60 p-3">
          <button type="button" onClick={handleCtRequest}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 active:scale-[0.98]">
            <Scan size={17} strokeWidth={2.5} /> TAC solicitada
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 border-t border-blue-100 bg-white/70 p-3 animate-fade-in">
          <button type="button" onClick={() => handleBleedingSelect(true)}
            className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              bleeding === true ? 'border-blue-900 bg-blue-900 text-white' : 'border-blue-200 bg-white text-blue-900 hover:border-blue-300 hover:bg-blue-50'
            }`}>
            <Droplets size={17} strokeWidth={2.5} /> Sí sangre
          </button>
          <button type="button" onClick={() => handleBleedingSelect(false)}
            className={`flex min-h-[46px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
              bleeding === false ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
            }`}>
            <CheckCircle2 size={17} strokeWidth={2.5} /> No sangre
          </button>
        </div>
      )}
    </div>
  )
}

// ── MRI Section ──────────────────────────────────────────────────────────────

function MRISection({ onConfirm }) {
  const [mriRequestTime, setMriRequestTime] = useState(null)
  const [mismatch, setMismatch] = useState(null)
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
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-indigo-100/50">
        <Moon size={14} className="text-indigo-600 shrink-0" />
        <span className="text-xs font-semibold text-indigo-700">Protocolo WAKE-UP — evaluar mismatch FLAIR-DWI</span>
      </div>

      {!mriRequestTime ? (
        <div className="p-3">
          <button type="button" onClick={() => setMriRequestTime(new Date())}
            className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white font-semibold rounded-xl transition-all">
            <Moon size={16} /> Solicitar RMN DWI + FLAIR
          </button>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 bg-indigo-100/60 border border-indigo-200 rounded-xl px-3 py-2">
            <Clock size={13} className="text-indigo-600 shrink-0" />
            <span className="text-xs font-medium text-indigo-700">RMN solicitada hace {elapsed}</span>
          </div>

          <div className="bg-white/60 rounded-xl px-3 py-2.5 text-xs text-neutral-500 space-y-1">
            <p className="font-semibold text-neutral-700">Criterio mismatch FLAIR-DWI</p>
            <p>DWI (+): restricción de difusión presente</p>
            <p>FLAIR (−) o sutil: sin cambios establecidos</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => handleMismatch(false)}
              className={`py-2.5 rounded-xl border font-bold text-sm transition-all active:scale-[0.98] ${
                mismatch === false ? 'border-neutral-400 bg-neutral-700 text-white' : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}>
              NO mismatch
            </button>
            <button type="button" onClick={() => handleMismatch(true)}
              className={`py-2.5 rounded-xl border font-bold text-sm transition-all active:scale-[0.98] ${
                mismatch === true ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
              }`}>
              SÍ mismatch
            </button>
          </div>

          {mismatch === true && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-700">Mismatch presente — evaluar contraindicaciones</p>
            </div>
          )}
          {mismatch === false && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 animate-fade-in">
              <p className="text-xs font-semibold text-amber-700">Sin mismatch — trombolisis IV no indicada en wake-up</p>
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
  const mode = showMriToggle ? (selectedMode ?? 'mri') : 'ct'

  return (
    <div className="px-4 pb-4 space-y-3">
      {/* Mode toggle — only visible for wake-up / uncertain window */}
      {showMriToggle ? (
        <div className="flex rounded-xl overflow-hidden border border-neutral-200 text-sm font-semibold">
          {[
            { id: 'ct',  label: 'TC de encéfalo' },
            { id: 'mri', label: 'RMN (Wake-up)' },
          ].map(({ id, label }) => (
            <button key={id} type="button" onClick={() => setSelectedMode(id)}
              className={`flex-1 py-2.5 transition-all ${
                mode === id ? 'bg-blue-600 text-white' : 'bg-white text-neutral-500 hover:bg-blue-50'
              }`}>
              {label}
              {id === 'ct' && ctConfirmed  && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />}
              {id === 'mri' && mriConfirmed && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <Scan size={13} className="text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 font-medium">Ventana terapéutica conocida — solo TC de encéfalo</p>
        </div>
      )}

      {/* CT section — always shown unless wake-up mode is active on MRI tab */}
      {(!showMriToggle || mode === 'ct') && (
        <StepCard step="" title="TAC de encéfalo" accent="blue">
          <CTSection
            onConfirm={onCtConfirm}
            initialCtRequestTime={initialCtRequestTime}
            onCtRequest={onCtRequest}
          />
          {ctResult?.bleeding === true && (
            <div className="mt-3 bg-blue-900/10 border-2 border-blue-800/50 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-sm font-bold text-blue-900 mb-1">Hemorragia intracraneal presente</p>
              <p className="text-xs text-blue-800 leading-relaxed">Contraindicación absoluta para trombolisis IV.</p>
            </div>
          )}
          {ctResult?.bleeding === false && (
            <div className="mt-3 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-emerald-700">TAC sin hemorragia — continuar evaluación.</p>
            </div>
          )}
        </StepCard>
      )}

      {/* MRI section — only for wake-up stroke / uncertain window */}
      {showMriToggle && mode === 'mri' && (
        <StepCard step="" title="RMN — ACV del despertar" accent="blue">
          <MRISection
            onConfirm={onMriConfirm}
          />
        </StepCard>
      )}

      {(ctConfirmed || mriConfirmed) && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <p className="text-xs font-semibold text-emerald-700">Imagen registrada</p>
        </div>
      )}
    </div>
  )
}
