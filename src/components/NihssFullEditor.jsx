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
            className="h-1 bg-stroke-iconActive transition-all duration-300 ease-out"
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
          <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-[11px] text-amber-300 leading-relaxed">{item.prompt}</p>
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
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150 active:scale-[0.99] ${
                    active
                      ? 'border-stroke-iconActive bg-stroke-iconActive text-stroke-bg shadow-sm'
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
              className="flex-1 py-2.5 bg-stroke-iconActive text-stroke-bg rounded-xl font-bold text-sm hover:bg-[#4D6CD6] active:scale-[0.98] transition-all shadow-sm"
            >
              Guardar · {total} pts
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Inline scroll — full NIHSS editor embedded (no modal overlay) ─────────────

function InlineScroll({ scores: initialScores, onSave, onClose }) {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(nihssItems.map((i) => [i.id, initialScores?.[i.id] ?? 0]))
  )

  const total = nihssItems.reduce((s, i) => s + (scores[i.id] ?? 0), 0)
  const severity = getNihssSeverity(total)
  const badgeClass = SEV_BADGE[severity.label] ?? 'bg-stroke-panel text-stroke-textMuted border-stroke-line'

  return (
    <div className="rounded-2xl border-2 border-stroke-line overflow-hidden bg-stroke-navy animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stroke-bg border-b border-stroke-line">
        <div>
          <p className="text-xs font-bold text-stroke-text">Escala NIHSS — ingreso manual</p>
          <p className="text-[10px] text-stroke-textMuted mt-0.5">15 ítems · seleccioná una opción por ítem</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-stroke-panel text-stroke-textMuted hover:bg-stroke-panel transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="max-h-[60vh] overflow-y-auto px-4 py-3 space-y-5">
        {nihssItems.map((item) => {
          const label = item.label.replace(/^\d+[abc]?\.\s*/i, '').trim()
          const itemScore = scores[item.id] ?? 0
          return (
            <div key={item.id}>
              {/* Item label + score */}
              <div className="flex items-start gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-stroke-textMuted mt-0.5 shrink-0 w-6 text-right">{item.id}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stroke-text leading-snug">{label}</p>
                  {item.prompt && (
                    <p className="text-[11px] text-amber-300 mt-1 leading-relaxed bg-amber-500/10 rounded-lg px-2.5 py-1.5 border border-amber-500/30">
                      {item.prompt}
                    </p>
                  )}
                </div>
                <span className={`text-sm font-black tabular-nums shrink-0 min-w-[1.5rem] text-right ${itemScore > 0 ? 'text-amber-400' : 'text-stroke-textMuted'}`}>
                  {itemScore}
                </span>
              </div>

              {/* Options */}
              <div className="space-y-1.5 pl-8">
                {item.options.map((opt) => {
                  const active = scores[item.id] === opt.score
                  return (
                    <button
                      key={opt.score}
                      type="button"
                      onClick={() => setScores((prev) => ({ ...prev, [item.id]: opt.score }))}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                        active
                          ? 'border-stroke-iconActive bg-stroke-iconActive text-stroke-bg'
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

      {/* Sticky footer with total */}
      <div className={`border-t-2 px-4 py-3 flex items-center gap-3 ${severity.bg} ${severity.border}`}>
        <div className="flex items-baseline gap-2 flex-1">
          <span className={`text-2xl font-black tabular-nums ${severity.color}`}>{total}</span>
          <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${badgeClass}`}>
            {severity.label}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSave(scores)}
          className="px-5 py-2.5 bg-stroke-iconActive text-stroke-bg rounded-xl font-bold text-sm hover:bg-[#4D6CD6] active:scale-95 transition-all shadow-sm"
        >
          Guardar · {total} pts
        </button>
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
                    className={`min-w-[26px] h-6 px-1 rounded-lg text-[11px] font-black transition-all active:scale-90 ${
                      score === opt.score
                        ? 'bg-stroke-iconActive text-stroke-bg shadow-sm'
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
          className="px-4 py-2 bg-stroke-iconActive text-stroke-bg rounded-xl font-bold text-xs hover:bg-[#4D6CD6] active:scale-95 transition-all"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

// ── Public API ───────────────────────────────────────────────────────────────

export default function NihssFullEditor({ scores, onSave, onClose, guided, inlineScroll, inline }) {
  if (guided)       return <GuidedWizard onSave={onSave} onClose={onClose} />
  if (inlineScroll) return <InlineScroll scores={scores} onSave={onSave} onClose={onClose} />
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
                        className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center gap-3 transition-all active:scale-[0.99] ${
                          active
                            ? 'border-stroke-iconActive bg-stroke-iconActive text-stroke-bg'
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
            className="px-5 py-2.5 bg-stroke-iconActive text-stroke-bg rounded-xl font-bold text-sm hover:bg-[#4D6CD6] active:scale-95 transition-all"
          >
            Guardar · {total} pts
          </button>
        </div>
      </div>
    </div>
  )
}
