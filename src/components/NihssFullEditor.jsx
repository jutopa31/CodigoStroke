import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

// ── Severity badge colors ────────────────────────────────────────────────────

const SEV_BADGE = {
  'Sin déficit':    'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'Leve':           'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Moderado':       'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Moderado-grave': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  'Grave':          'bg-status-critical/15 text-red-300 border-status-critical/30',
  'Muy grave':      'bg-red-200 text-red-300 border-red-400',
}

// ── Guided-inline design tokens (variant B) ──────────────────────────────────

const NIHSS_CATEGORY = {
  '1a': 'NIVEL DE CONCIENCIA', '1b': 'NIVEL DE CONCIENCIA', '1c': 'NIVEL DE CONCIENCIA',
  '2':  'MOTILIDAD OCULAR', '3': 'CAMPOS VISUALES', '4': 'PARESIA FACIAL',
  '5a': 'MOTOR · BRAZO IZQ.', '5b': 'MOTOR · BRAZO DER.',
  '6a': 'MOTOR · PIERNA IZQ.', '6b': 'MOTOR · PIERNA DER.',
  '7':  'ATAXIA DE MIEMBROS', '8': 'SENSIBILIDAD', '9': 'LENGUAJE',
  '10': 'DISARTRIA', '11': 'EXTINCIÓN / INATENCIÓN',
}

const GRID_COLS = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 5: 'grid-cols-5' }

function pillStyle(score) {
  if (score === 0) return 'border border-stroke-iconActive text-stroke-iconActive bg-stroke-iconActive/10'
  if (score <= 3)  return 'border border-amber-400 text-amber-300 bg-amber-500/10'
  return 'border border-red-500 text-red-400 bg-red-500/10'
}

function optionStyle(selected, score) {
  if (!selected) return 'border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:border-stroke-iconActive/40'
  if (score === 0) return 'border border-stroke-iconActive btn-primary text-white'
  if (score <= 3)  return 'border-2 border-amber-400 bg-amber-500/10 text-amber-300'
  return 'border-2 border-red-500 bg-red-500/10 text-red-400'
}

function scoreNumColor(score) {
  if (score === 0) return 'text-stroke-textMuted'
  if (score <= 3)  return 'text-amber-300'
  return 'text-red-400'
}

// ── Guided wizard modal ──────────────────────────────────────────────────────

function GuidedWizard({ onSave, onClose }) {
  const [scores, setScores] = useState({})
  const [currentIdx, setCurrentIdx] = useState(0)

  const item = nihssItems[currentIdx]
  const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
  const isLast = currentIdx === nihssItems.length - 1
  const dirty = Object.keys(scores).length > 0
  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const badgeClass = SEV_BADGE[severity.label] ?? 'bg-stroke-panel text-stroke-textMuted border-stroke-line'
  const progress = ((currentIdx + 1) / nihssItems.length) * 100

  function select(score) {
    const newScores = { ...scores, [item.id]: score }
    setScores(newScores)
    if (!isLast) setTimeout(() => setCurrentIdx((c) => c + 1), 240)
  }

  function handleClose() {
    if (dirty && !window.confirm('¿Descartar el NIHSS en progreso?')) return
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 animate-fade-in">
      <div className="bg-stroke-navy w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-stroke-panel">
          <div
            className="h-1 bg-stroke-iconActive transition duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-stroke-textMuted uppercase tracking-widest">{item.id}</span>
              <span className="text-[10px] text-stroke-textMuted">·</span>
              <span className="text-[10px] text-stroke-textMuted tabular-nums">{currentIdx + 1} / {nihssItems.length}</span>
            </div>
            <p className="text-base font-bold text-stroke-text mt-0.5 leading-snug">{label}</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stroke-panel text-stroke-textMuted hover:bg-stroke-panel hover:text-stroke-textMuted transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Prompt */}
        {item.prompt && (
          <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-[11px] text-blue-300 leading-relaxed">{item.prompt}</p>
          </div>
        )}

        {/* Options */}
        <div className="flex-1 overflow-y-auto px-5 pb-3">
          <div className="space-y-2">
            {item.options.map((opt) => {
              const active = item.id in scores && scores[item.id] === opt.score
              return (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => select(opt.score)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition duration-150 active:scale-[0.99] ${
                    active
                      ? 'border-stroke-iconActive btn-primary text-white shadow-sm'
                      : 'border-stroke-line bg-stroke-navy text-stroke-text hover:border-stroke-iconActive/40 hover:bg-stroke-iconActive/10'
                  }`}
                >
                  <span className={`font-mono text-xs font-black mr-3 ${active ? 'text-white/60' : 'text-stroke-textMuted'}`}>
                    {opt.score}
                  </span>
                  <span className="font-medium">{opt.text}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Score preview on last item */}
        {isLast && dirty && (
          <div className="mx-5 mb-3 px-4 py-3 rounded-xl bg-stroke-bg border border-stroke-line flex items-center gap-3 animate-fade-in">
            <span className="text-2xl font-black tabular-nums text-stroke-text">{total}</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${badgeClass}`}>{severity.label}</span>
          </div>
        )}

        {/* Navigation */}
        <div className="px-5 pb-5 pt-2 border-t border-stroke-line flex gap-2">
          <button
            onClick={() => setCurrentIdx((c) => Math.max(0, c - 1))}
            disabled={currentIdx === 0}
            className="w-11 h-11 flex items-center justify-center rounded-xl border-2 border-stroke-line text-stroke-textMuted hover:bg-stroke-bg disabled:opacity-25 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {!isLast ? (
            <button
              onClick={() => setCurrentIdx((c) => c + 1)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border-2 border-stroke-line text-stroke-textMuted text-sm font-semibold hover:bg-stroke-bg transition-colors"
            >
              Siguiente <ChevronRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSave(scores)}
              className="flex-1 py-2.5 btn-primary text-white rounded-xl font-bold text-sm active:scale-[0.98] transition shadow-sm"
            >
              Guardar · {total} pts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline guided — one item at a time, embedded (variant B) ──────────────────

function InlineScroll({ scores: initialScores, onClose, current: initialCurrent, onCurrentChange, onScoresChange, onComplete }) {
  const [scores, setScores] = useState(() => ({ ...(initialScores ?? {}) }))
  const [current, setCurrentState] = useState(() => Math.min(Math.max(0, initialCurrent ?? 0), nihssItems.length - 1))

  // Navigate + report to the parent draft. Resolved here (event/timeout scope),
  // not inside a setState updater — calling the parent setState in the updater
  // ran during render and triggered React's "Cannot update a component while
  // rendering a different component" warning. setCurrent is only ever called
  // from click handlers / timeouts, so the closed-over `current` is committed.
  const setCurrent = (updater) => {
    const raw = typeof updater === 'function' ? updater(current) : updater
    const clamped = Math.max(0, Math.min(raw, nihssItems.length - 1))
    setCurrentState(clamped)
    onCurrentChange?.(clamped)
  }

  const item = nihssItems[current]
  const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
  const isLast = current === nihssItems.length - 1
  const answered = Object.keys(scores).length
  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const colsClass = GRID_COLS[Math.min(item.options.length, 5)] ?? 'grid-cols-4'
  const completedItems = nihssItems.filter((i, idx) => idx < current && i.id in scores)
  const allAnswered = nihssItems.every((i) => i.id in scores)

  function select(score) {
    const next = { ...scores, [item.id]: score }
    setScores(next)
    onScoresChange?.(next)
    const allNow = nihssItems.every((i) => i.id in next)
    if (allNow && onComplete) {
      // Completing the whole scale (in any order) registers the score
      // automatically — no extra "Guardar" / "Confirmar" tap.
      setTimeout(() => onComplete(next), 200)
    } else if (!isLast) {
      setTimeout(() => setCurrent((c) => c + 1), 220)
    }
  }

  return (
    <div className="rounded-2xl border-2 border-stroke-line bg-stroke-navy animate-fade-in flex flex-col gap-3 p-4">

      {/* Progress header */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-stroke-textMuted whitespace-nowrap">
          Ítem {current + 1}/{nihssItems.length}
        </span>
        <div className="flex-1 flex gap-0.5">
          {nihssItems.map((i, idx) => (
            <div
              key={i.id}
              className={`flex-1 h-1.5 rounded-full transition-colors duration-200 ${
                i.id in scores ? 'bg-amber-400' : idx === current ? 'bg-stroke-iconActive' : 'bg-stroke-line'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">{total} pts</span>
      </div>

      {/* Completed pills */}
      {completedItems.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {completedItems.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => setCurrent(nihssItems.indexOf(i))}
              className={`inline-flex items-center min-h-[44px] text-xs font-mono px-3 rounded-full transition-transform active:scale-95 ${pillStyle(scores[i.id])}`}
            >
              {i.id}:{scores[i.id]}
            </button>
          ))}
        </div>
      )}

      {/* Item card */}
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] font-semibold text-stroke-textMuted tracking-widest uppercase mb-1">
            {NIHSS_CATEGORY[item.id]}
          </p>
          <p className="font-sans text-lg font-bold text-stroke-text leading-snug">{label}</p>
          {item.prompt && (
            <p className="text-[11px] text-blue-300 mt-1.5 leading-relaxed bg-blue-500/10 rounded-lg px-2.5 py-1.5 border border-blue-500/30">
              {item.prompt}
            </p>
          )}
        </div>

        {/* Scoring guide */}
        <div className="bg-stroke-bg/60 rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
          {item.options.map((opt) => (
            <div key={opt.score} className="flex items-start gap-2.5 text-xs">
              <span className={`font-mono font-bold shrink-0 w-3 ${scoreNumColor(opt.score)}`}>{opt.score}</span>
              <span className="text-stroke-textMuted leading-snug">{opt.text}</span>
            </div>
          ))}
        </div>

        {/* Option grid */}
        <div className={`grid ${colsClass} gap-2`}>
          {item.options.map((opt) => {
            const selected = scores[item.id] === opt.score
            return (
              <button
                key={opt.score}
                type="button"
                onClick={() => select(opt.score)}
                className={`flex flex-col items-center justify-center rounded-xl py-3 gap-1 transition duration-150 active:scale-95 ${optionStyle(selected, opt.score)}`}
              >
                <span className="font-mono text-xl font-bold leading-none">{opt.score}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation + save */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-stroke-line text-stroke-textMuted disabled:opacity-30 transition-colors hover:border-stroke-iconActive/40 shrink-0"
        >
          <ChevronLeft size={16} />
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-stroke-line text-stroke-textMuted text-sm font-semibold hover:bg-stroke-bg transition-colors"
          >
            Siguiente <ChevronRight size={15} />
          </button>
        ) : (
          // No "Guardar" button: answering the last item auto-registers the score
          // (handled in select() → onComplete). On the last item we only show a
          // hint with the running progress so the gesture stays single-step.
          <div className={`flex-1 h-10 flex items-center justify-center rounded-xl text-xs font-semibold text-center px-2 ${severity.bg} ${severity.color} border-2 ${severity.border}`}>
            {allAnswered
              ? `Registrado automáticamente · ${total} pts`
              : `Completá los ${nihssItems.length} ítems (${answered}/${nihssItems.length})`}
          </div>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-stroke-textMuted hover:bg-stroke-bg transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Inline adjust (compact pill buttons — for post-score corrections) ─────────

function InlineAdjust({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  return (
    <div className="rounded-xl border-2 border-stroke-line overflow-hidden bg-stroke-navy animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2.5 bg-stroke-bg border-b border-stroke-line">
        <p className="text-xs font-bold uppercase tracking-wider text-stroke-textMuted">Ajuste por ítem</p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-stroke-textMuted hover:bg-stroke-panel hover:text-stroke-textMuted transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto divide-y divide-stroke-line/50">
        {nihssItems.map((item) => {
          const shortLabel = item.label
            .replace(/^\d+[abc]?\.\s*/i, '')
            .replace('NC –', '')
            .replace('Motor brazo –', 'Brazo')
            .replace('Motor pierna –', 'Pierna')
            .trim()
          const score = scores[item.id] ?? 0
          return (
            <div key={item.id} className="flex items-center gap-2.5 px-3 py-2">
              <span className="text-[10px] font-mono font-bold text-stroke-textMuted w-5 shrink-0 text-right">{item.id}</span>
              <span className="text-xs text-stroke-textMuted flex-1 leading-tight truncate">{shortLabel}</span>
              <div className="flex gap-1 shrink-0">
                {item.options.map((opt) => (
                  <button
                    key={opt.score}
                    type="button"
                    title={opt.text}
                    onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                    className={`min-w-[44px] h-11 px-1 rounded-lg font-mono text-sm font-black transition active:scale-90 ${
                      score === opt.score
                        ? 'btn-primary text-white shadow-sm'
                        : 'bg-stroke-panel text-stroke-textMuted hover:bg-stroke-panel'
                    }`}
                  >
                    {opt.score}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className={`flex items-center gap-3 px-4 py-3 border-t-2 ${severity.bg} ${severity.border}`}>
        <div className="flex items-baseline gap-2 flex-1">
          <span className={`text-xl font-black tabular-nums ${severity.color}`}>{total}</span>
          <span className={`text-xs font-bold ${severity.color} opacity-70`}>{severity.label}</span>
        </div>
        <button
          type="button"
          onClick={() => onSave(scores)}
          className="px-4 py-2 btn-primary text-white rounded-xl font-bold text-xs active:scale-95 transition"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ── Public API ───────────────────────────────────────────────────────────────

export default function NihssFullEditor({ scores, onSave, onClose, guided, inlineScroll, inline, current, onCurrentChange, onScoresChange, onComplete }) {
  if (guided)       return <GuidedWizard onSave={onSave} onClose={onClose} />
  if (inlineScroll) return <InlineScroll scores={scores} onClose={onClose} current={current} onCurrentChange={onCurrentChange} onScoresChange={onScoresChange} onComplete={onComplete} />
  if (inline)       return <InlineAdjust scores={scores} onSave={onSave} onClose={onClose} />
  return <ScrollModal scores={scores} onSave={onSave} onClose={onClose} />
}

// ── Scroll modal (used by DosageStep and other steps) ────────────────────────

function ScrollModal({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/60 animate-fade-in">
      <div className="bg-stroke-navy w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] animate-slide-down overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-line shrink-0">
          <div>
            <p className="font-bold text-stroke-text text-sm">Escala NIHSS completa</p>
            <p className="text-[11px] text-stroke-textMuted mt-0.5">15 ítems · máximo 42 pts</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stroke-panel text-stroke-textMuted hover:bg-stroke-panel transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {nihssItems.map((item) => {
            const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
            const itemScore = scores[item.id] ?? 0
            return (
              <div key={item.id}>
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-stroke-textMuted mt-0.5 shrink-0 w-6">{item.id}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stroke-text leading-snug">{label}</p>
                    {item.prompt && <p className="text-[11px] text-stroke-textMuted italic mt-0.5 leading-snug">{item.prompt}</p>}
                  </div>
                  <span className={`text-sm font-black tabular-nums shrink-0 ${itemScore > 0 ? 'text-amber-400' : 'text-stroke-textMuted'}`}>
                    {itemScore}
                  </span>
                </div>
                <div className="space-y-1.5 pl-8">
                  {item.options.map((opt) => {
                    const active = scores[item.id] === opt.score
                    return (
                      <button
                        key={opt.score}
                        type="button"
                        onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition active:scale-[0.99] ${
                          active
                            ? 'border-stroke-iconActive btn-primary text-white'
                            : 'border-stroke-line text-stroke-text hover:border-stroke-iconActive/40 hover:bg-stroke-iconActive/10'
                        }`}
                      >
                        <span className={`font-mono text-xs font-black w-4 shrink-0 ${active ? 'text-white/50' : 'text-stroke-textMuted'}`}>
                          {opt.score}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className={`shrink-0 border-t-2 px-5 py-4 flex items-center gap-3 ${severity.bg} ${severity.border}`}>
          <div className="flex-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black tabular-nums ${severity.color}`}>{total}</span>
            <span className={`text-sm font-semibold ${severity.color} opacity-70`}>{severity.label}</span>
          </div>
          <button
            type="button"
            onClick={() => onSave(scores)}
            className="px-5 py-2.5 btn-primary text-white rounded-xl font-bold text-sm active:scale-95 transition"
          >
            Guardar · {total} pts
          </button>
        </div>
      </div>
    </div>
  )
}
