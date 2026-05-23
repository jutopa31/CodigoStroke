import { Brain, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function DecisionButton({ allComplete, onClick, executed }) {
  if (executed) return null

  return (
    <div
      className="shrink-0 px-4 py-3 border-t border-white/15"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {allComplete ? (
        <button
          type="button"
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-sm
            bg-white text-brand-700 shadow-elevated transition-all active:scale-[0.98] hover:bg-white/90
            animate-pulse-subtle"
        >
          <Brain size={18} strokeWidth={2} />
          Calcular decisión de trombolisis
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
          bg-white/10 border border-white/20 text-white/40 text-sm font-medium cursor-not-allowed">
          <CheckCircle2 size={15} strokeWidth={2} />
          Completá los 5 tabs para calcular
        </div>
      )}
    </div>
  )
}
