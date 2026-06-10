import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { nihssItems } from '../content/nihss'

const CATEGORIES = {
  '1a': 'NIVEL DE CONCIENCIA',
  '1b': 'NIVEL DE CONCIENCIA',
  '1c': 'NIVEL DE CONCIENCIA',
  '2':  'MOTILIDAD OCULAR',
  '3':  'CAMPOS VISUALES',
  '4':  'PARESIA FACIAL',
  '5a': 'MOTOR — BRAZO IZQ.',
  '5b': 'MOTOR — BRAZO DER.',
  '6a': 'MOTOR — PIERNA IZQ.',
  '6b': 'MOTOR — PIERNA DER.',
  '7':  'ATAXIA DE MIEMBROS',
  '8':  'SENSIBILIDAD',
  '9':  'LENGUAJE',
  '10': 'DISARTRIA',
  '11': 'EXTINCIÓN / INATENCIÓN',
}

const GRID_COLS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }

function pillStyle(score) {
  if (score === 0) return 'border border-stroke-iconActive text-stroke-iconActive bg-stroke-iconActive/10'
  if (score <= 3)  return 'border border-status-warning text-status-warning bg-status-warning/10'
  return 'border border-red-500 text-red-400 bg-red-500/10'
}

function optionStyle(selected, score) {
  if (!selected) return 'border border-stroke-line bg-stroke-navy/50 text-stroke-textMuted'
  if (score === 0) return 'border border-stroke-iconActive bg-stroke-iconActive text-white'
  if (score <= 3)  return 'border-2 border-status-warning bg-transparent text-status-warning'
  return 'border-2 border-red-500 bg-transparent text-red-400'
}

function scoreNumColor(score) {
  if (score === 0) return 'text-stroke-textMuted'
  if (score === 1) return 'text-status-warning'
  return 'text-red-400'
}

export default function NihssGuided({ onLoad, onClose }) {
  const [scores, setScores] = useState({})
  const [current, setCurrent] = useState(0)

  const item = nihssItems[current]
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const answered = Object.keys(scores).length
  const colsClass = GRID_COLS[Math.min(item.options.length, 4)] ?? 'grid-cols-4'
  const completedItems = nihssItems.slice(0, current).filter(i => scores[i.id] !== undefined)

  function select(score) {
    const next = { ...scores, [item.id]: score }
    setScores(next)
    const nextAnswered = Object.keys(next).length
    if (nextAnswered === nihssItems.length) {
      const nextTotal = Object.values(next).reduce((a, b) => a + b, 0)
      setTimeout(() => onLoad(nextTotal), 280)
    } else if (current < nihssItems.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 280)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stroke-bg overflow-hidden">
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-3">
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-stroke-textMuted whitespace-nowrap">
          NIHSS — Ítem {current + 1}/{nihssItems.length}
        </span>
        <div className="flex-1 flex gap-0.5">
          {nihssItems.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${
                i < answered ? 'bg-status-warning' : i === current ? 'bg-stroke-iconActive' : 'bg-stroke-line'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-sm font-semibold text-status-warning">
          {total} pts
        </span>
      </div>

      {/* Completed pills strip */}
      {completedItems.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {completedItems.map(i => (
            <span
              key={i.id}
              className={`text-xs font-mono px-2 py-0.5 rounded-full ${pillStyle(scores[i.id])}`}
            >
              {i.id}:{scores[i.id]}
            </span>
          ))}
        </div>
      )}

      {/* Item card */}
      <div className="bg-stroke-navy border border-stroke-line rounded-2xl p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs font-semibold text-stroke-textMuted tracking-widest uppercase mb-1">
            {CATEGORIES[item.id]}
          </p>
          <p className="font-sans text-xl font-semibold text-stroke-text leading-snug">
            {item.label}
          </p>
          <p className="text-sm text-stroke-textMuted mt-1 leading-relaxed">
            {item.prompt}
          </p>
        </div>

        {/* Scoring guide */}
        <div className="bg-stroke-bg/60 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
          {item.options.map(opt => (
            <div key={opt.score} className="flex items-start gap-2.5 text-sm">
              <span className={`font-mono font-semibold shrink-0 w-4 ${scoreNumColor(opt.score)}`}>
                {opt.score}
              </span>
              <span className="text-stroke-textMuted leading-snug">{opt.text}</span>
            </div>
          ))}
        </div>

        {/* Option grid */}
        <div className={`grid ${colsClass} gap-2`}>
          {item.options.map(opt => {
            const selected = scores[item.id] === opt.score
            return (
              <button
                key={opt.score}
                onClick={() => select(opt.score)}
                className={`flex flex-col items-center justify-center rounded-xl py-3 gap-1 transition-all duration-150 active:scale-95 ${optionStyle(selected, opt.score)}`}
              >
                <span className="font-mono text-lg font-semibold leading-none">{opt.score}</span>
                <span className="text-[10px] leading-tight text-center px-1 opacity-80">
                  {opt.text.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        <p className="text-center text-[10px] tracking-widest text-stroke-textMuted/50 uppercase">
          ••• toque para seleccionar y avanzar •••
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 px-3 py-2 border border-stroke-line rounded-xl text-stroke-textMuted text-sm disabled:opacity-30 transition-colors hover:border-stroke-iconActive/40"
        >
          <ChevronLeft size={15} /> Anterior
        </button>
        <button
          onClick={onClose}
          className="text-xs text-stroke-textMuted/60 hover:text-stroke-textMuted transition-colors"
        >
          Entrada manual
        </button>
      </div>
    </div>
    </div>
  )
}
