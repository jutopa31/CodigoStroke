import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AlertModal({ patient, onConfirm, onClose }) {
  useEffect(() => {
    // Dismiss mobile keyboard that may be open from a previous input field
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-stroke-navy w-full max-w-sm rounded-2xl shadow-modal overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stroke-iconActive px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stroke-bg flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-tight">¿Activar Código Stroke?</p>
            <p className="text-white/70 text-sm mt-0.5">{patient.name}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-stroke-textMuted leading-relaxed">
            Se registrará el evento y el cronómetro iniciará en este momento.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-stroke-line rounded-xl text-stroke-textMuted font-medium text-sm hover:bg-stroke-bg active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-[2] py-3 btn-primary text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke-iconActive focus-visible:ring-offset-2"
          >
            Sí, activar
          </button>
        </div>
      </div>
    </div>
  )
}
