import { Brain, ChevronRight, CheckCircle2 } from 'lucide-react'

/**
 * DecisionButton is presentational; positioning is handled by App.jsx.
 */
export default function DecisionButton({ allComplete, onClick, executed }) {
  if (executed) return null

  return allComplete ? (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm
        bg-white text-brand-700 shadow-elevated transition-all active:scale-[0.98] hover:bg-white/90
        animate-pulse-subtle md:animate-none md:rounded-lg md:bg-neutral-950 md:py-3 md:text-white md:shadow-none md:hover:bg-neutral-800"
    >
      <Brain size={18} strokeWidth={2} />
      Calcular decisión de trombolisis
      <ChevronRight size={16} strokeWidth={2.5} />
    </button>
  ) : (
    <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
      bg-white/10 border border-white/20 text-white/40 text-sm font-medium cursor-not-allowed select-none
      md:rounded-lg md:border-neutral-200 md:bg-neutral-50 md:py-3 md:text-neutral-400">
      <CheckCircle2 size={15} strokeWidth={2} />
      Completá los 6 tabs para calcular
    </div>
  )
}
