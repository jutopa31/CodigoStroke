import { useState } from 'react'
import { ShieldCheck, Info, ChevronDown, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'
import { ORANGE_CONTRAS, ANTICOAG_TYPES } from '../lib/contraindications'

function ContraRow({ item, value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const isYes = value === true
  const isNo  = value === false

  return (
    <div className={`rounded-lg border transition-all ${
      isYes ? 'bg-amber-500/10 border-amber-300' : isNo ? 'bg-stroke-bg border-stroke-line' : 'border-stroke-line bg-stroke-navy'
    }`}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <p className={`flex-1 min-w-0 text-xs font-semibold leading-snug truncate ${isYes ? 'text-amber-300' : 'text-stroke-text'}`}>
          {item.short}
        </p>
        <button type="button" onClick={() => setExpanded(v => !v)}
          className={`shrink-0 p-1 rounded-full transition-colors ${expanded ? 'bg-stroke-panel text-stroke-textMuted' : 'text-stroke-textMuted hover:text-stroke-textMuted'}`}>
          {expanded ? <ChevronDown size={11} /> : <Info size={11} />}
        </button>
        <div className="flex shrink-0 rounded-md overflow-hidden border border-stroke-line text-[11px] font-bold">
          <button type="button" onClick={() => onChange(false)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isNo ? 'bg-slate-600 text-white' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg'}`}>
            NO
          </button>
          <div className="w-px bg-stroke-panel" />
          <button type="button" onClick={() => onChange(true)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isYes ? 'bg-amber-500 text-stroke-bg' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg'}`}>
            SÍ
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-2 border-t border-stroke-line animate-fade-in">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 mt-1.5 text-xs text-amber-300">
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="opacity-75 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CIRelativasTab
 *
 * @param {{ answers, anticoag, allAnswered, hasRelative }} initialState
 * @param {(state) => void} onUpdate
 * @param {(anticoag) => void} onAnticoagChange — for symptoms.anticoagulation sync
 */
export default function CIRelativasTab({ initialState, onUpdate, onAnticoagChange }) {
  const [answers,  setAnswers]  = useState(() => initialState?.answers  ?? {})
  const [anticoag, setAnticoag] = useState(() => initialState?.anticoag ?? { active: null, type: '' })

  const anticoagAnswered = anticoag.active === false || (anticoag.active === true && anticoag.type !== '')
  const allAnswered      = ORANGE_CONTRAS.every((c) => answers[c.id] !== undefined) && anticoagAnswered
  const hasRelative      = Object.values(answers).some(Boolean) || anticoag.active === true
  const answered         = Object.values(answers).filter((v) => v !== undefined).length + (anticoagAnswered ? 1 : 0)
  const total            = ORANGE_CONTRAS.length + 1 // +1 for anticoag

  function emit(nextAnswers, nextAnticoag) {
    const allNow = ORANGE_CONTRAS.every((c) => nextAnswers[c.id] !== undefined) &&
      (nextAnticoag.active === false || (nextAnticoag.active === true && nextAnticoag.type !== ''))
    const hasRel = Object.values(nextAnswers).some(Boolean) || nextAnticoag.active === true
    onUpdate?.({ answers: nextAnswers, anticoag: nextAnticoag, allAnswered: allNow, hasRelative: hasRel })
  }

  function set(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    emit(next, anticoag)
  }

  function setAnticoagActive(active) {
    const next = { active, type: '' }
    setAnticoag(next)
    if (!active) onAnticoagChange?.({ active: false, type: '' })
    emit(answers, next)
  }

  function setAnticoagType(typeId) {
    const next = { active: true, type: typeId }
    setAnticoag(next)
    onAnticoagChange?.(next)
    emit(answers, next)
  }

  function markAllNo() {
    const allNo     = Object.fromEntries(ORANGE_CONTRAS.map((c) => [c.id, false]))
    const noAnticoag = { active: false, type: '' }
    setAnswers(allNo)
    setAnticoag(noAnticoag)
    onAnticoagChange?.({ active: false, type: '' })
    onUpdate?.({ answers: allNo, anticoag: noAnticoag, allAnswered: true, hasRelative: false })
  }

  return (
    <div className="px-4 pb-6 space-y-2.5 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-300">Contraindicaciones relativas</p>
          <p className="text-xs text-amber-300 mt-0.5">Individualizar riesgo/beneficio — interconsulta</p>
        </div>
        {allAnswered && (
          <div className="ml-auto shrink-0">
            {hasRelative
              ? <span className="text-xs font-bold text-amber-300 bg-amber-500/15 rounded-lg px-2 py-1">Presente</span>
              : <CheckCircle2 size={18} className="text-emerald-500" />
            }
          </div>
        )}
      </div>

      {/* Batch action row — "mark all NO" shortcut */}
      <button type="button" onClick={markAllNo}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-500/15 hover:shadow-sm active:scale-[0.98] active:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:w-auto md:px-4">
        <ShieldCheck size={14} /> Ninguna presente — marcar las {ORANGE_CONTRAS.length} como NO
      </button>

      {/* Anticoagulación */}
      <div className={`rounded-lg border transition-all ${
        anticoag.active === true ? 'bg-amber-500/10 border-amber-300' :
        anticoag.active === false ? 'bg-stroke-bg border-stroke-line' : 'border-stroke-line bg-stroke-navy'
      }`}>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <ShieldAlert size={13} className={`shrink-0 ${anticoag.active === true ? 'text-amber-400' : 'text-stroke-textMuted'}`} />
          <p className={`flex-1 text-xs font-semibold ${anticoag.active === true ? 'text-amber-300' : 'text-stroke-text'}`}>
            Anticoagulación activa
          </p>
          <div className="flex shrink-0 rounded-md overflow-hidden border border-stroke-line text-[11px] font-bold">
            <button type="button" onClick={() => setAnticoagActive(false)}
              className={`px-2.5 py-1 transition-all active:scale-95 ${anticoag.active === false ? 'bg-slate-600 text-white' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg'}`}>
              NO
            </button>
            <div className="w-px bg-stroke-panel" />
            <button type="button" onClick={() => setAnticoagActive(true)}
              className={`px-2.5 py-1 transition-all active:scale-95 ${anticoag.active === true ? 'bg-amber-500 text-stroke-bg' : 'bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg'}`}>
              SÍ
            </button>
          </div>
        </div>
        {anticoag.active === true && (
          <div className="px-3 pb-3 border-t border-amber-500/30 animate-fade-in">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mt-2 mb-1.5">Tipo de anticoagulante</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ANTICOAG_TYPES.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setAnticoagType(id)}
                  className={`py-2 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                    anticoag.type === id
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {anticoag.active === false && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-emerald-400 font-medium animate-fade-in">Sin anticoagulación activa</p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {ORANGE_CONTRAS.map((item) => (
          <ContraRow key={item.id} item={item} value={answers[item.id] ?? null}
            onChange={(val) => set(item.id, val)} />
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 bg-stroke-panel rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <span className="text-[10px] text-stroke-textMuted font-medium shrink-0">{answered}/{total}</span>
      </div>

      {hasRelative && (
        <div className="px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-300 animate-fade-in">
          <p className="text-sm font-bold text-amber-300">Contraindicación relativa presente</p>
          <p className="text-xs text-amber-400 mt-0.5 leading-snug">
            Valorar riesgo/beneficio individual. Se recomienda interconsulta.
          </p>
        </div>
      )}

    </div>
  )
}
