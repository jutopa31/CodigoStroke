import { ChevronDown, Info } from 'lucide-react'
import { useState } from 'react'

const TONES = {
  critical: {
    selected: 'border-red-300 bg-red-50',
    title: 'text-red-800',
    detail: 'border-red-200 bg-red-50 text-red-800',
    yes: 'border-red-600 bg-red-600 text-white',
    yesIdle: 'border-red-200 bg-white text-red-700 hover:bg-red-50',
  },
  warning: {
    selected: 'border-amber-300 bg-amber-50',
    title: 'text-amber-800',
    detail: 'border-amber-200 bg-amber-50 text-amber-900',
    yes: 'border-amber-500 bg-amber-500 text-white',
    yesIdle: 'border-amber-200 bg-white text-amber-800 hover:bg-amber-50',
  },
}

export default function BinaryDecisionRow({ item, value, onChange, tone = 'warning' }) {
  const [expanded, setExpanded] = useState(false)
  const styles = TONES[tone]
  const isYes = value === true
  const isNo = value === false

  return (
    <article className={`overflow-hidden rounded-2xl border bg-white transition-colors ${isYes ? styles.selected : 'border-stroke-line'}`}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-label={`${expanded ? 'Ocultar' : 'Ver'} información: ${item.short}`}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stroke-surfaceMuted text-stroke-textMuted transition-colors hover:text-stroke-text"
        >
          {expanded ? <ChevronDown size={16} /> : <Info size={16} />}
        </button>

        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold leading-snug ${isYes ? styles.title : 'text-stroke-text'}`}>
            {item.short}
          </p>
          <p className="mt-1 text-xs text-stroke-textMuted">
            {value === undefined || value === null ? 'Seleccioná una respuesta' : isYes ? 'Presente' : 'No presente'}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => onChange(false)}
            aria-pressed={isNo}
            className={`min-h-11 min-w-14 rounded-xl border px-3 text-xs font-bold transition-colors ${
              isNo
                ? 'border-clinical-700 bg-clinical-700 text-white'
                : 'border-stroke-line bg-white text-stroke-textMuted hover:bg-stroke-panel'
            }`}
          >
            No
          </button>
          <button
            type="button"
            onClick={() => onChange(true)}
            aria-pressed={isYes}
            className={`min-h-11 min-w-14 rounded-xl border px-3 text-xs font-bold transition-colors ${
              isYes ? styles.yes : styles.yesIdle
            }`}
          >
            Sí
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stroke-line px-4 pb-4 pt-3 animate-fade-in">
          <div className={`rounded-xl border px-3 py-2.5 text-xs ${styles.detail}`}>
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="mt-1 leading-relaxed opacity-80">{item.sub}</p>}
          </div>
        </div>
      )}
    </article>
  )
}
