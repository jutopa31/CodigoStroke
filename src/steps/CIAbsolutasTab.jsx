import { useState } from 'react'
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { RED_CONTRAS } from '../lib/contraindications'
import BinaryDecisionRow from '../components/BinaryDecisionRow'

/**
 * CIAbsolutasTab
 *
 * @param {{ answers: Record<string,boolean>, allAnswered: boolean, hasAbsolute: boolean }} initialState
 * @param {(state) => void} onUpdate  — called on every toggle (auto-save)
 */
export default function CIAbsolutasTab({ initialState, onUpdate }) {
  const [answers, setAnswers] = useState(() => initialState?.answers ?? {})

  const allAnswered = RED_CONTRAS.every((c) => answers[c.id] !== undefined)
  const hasAbsolute = Object.values(answers).some(Boolean)
  const answered    = Object.values(answers).filter((v) => v !== undefined).length

  function set(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    const allNow = RED_CONTRAS.every((c) => next[c.id] !== undefined)
    const hasAbs = Object.values(next).some(Boolean)
    onUpdate?.({ answers: next, allAnswered: allNow, hasAbsolute: hasAbs })
  }

  function markAllNo() {
    const allNo = Object.fromEntries(RED_CONTRAS.map((c) => [c.id, false]))
    setAnswers(allNo)
    onUpdate?.({ answers: allNo, allAnswered: true, hasAbsolute: false })
  }

  return (
    <div className="px-4 pb-6 space-y-2.5 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
        <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-red-800">Contraindicaciones absolutas</p>
          <p className="mt-0.5 text-xs text-red-700">Cualquier <strong>SÍ</strong> excluye trombolisis IV</p>
        </div>
        {allAnswered && (
          <div className="ml-auto shrink-0">
            {hasAbsolute
              ? <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-bold text-red-800">CI presente</span>
              : <CheckCircle2 size={18} className="text-emerald-500" />
            }
          </div>
        )}
      </div>

      {/* Batch action row — "mark all NO" shortcut */}
      <button type="button" onClick={markAllNo}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-500/15 hover:shadow-sm active:scale-[0.98] active:bg-emerald-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 md:w-auto md:px-4">
        <ShieldCheck size={14} /> Ninguna presente — marcar las {RED_CONTRAS.length} como NO
      </button>

      {/* List */}
      <div className="space-y-2">
        {RED_CONTRAS.map((item) => (
          <BinaryDecisionRow key={item.id} item={item} tone="critical" value={answers[item.id] ?? null}
            onChange={(val) => set(item.id, val)} />
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 bg-stroke-panel rounded-full h-1.5 overflow-hidden">
          <div className="bg-stroke-iconActive/100 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(answered / RED_CONTRAS.length) * 100}%` }} />
        </div>
        <span className="text-[10px] text-stroke-textMuted font-medium shrink-0">{answered}/{RED_CONTRAS.length}</span>
      </div>

      {/* Alert banner when absolute CI found */}
      {hasAbsolute && (
        <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 animate-fade-in">
          <p className="text-sm font-bold text-red-800">Contraindicación absoluta presente</p>
          <p className="mt-0.5 text-xs leading-snug text-red-700">
            No indicar trombolisis IV. Evaluar trombectomía mecánica directa.
          </p>
        </div>
      )}
    </div>
  )
}
