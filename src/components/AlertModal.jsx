import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function AlertModal({ patient, onConfirm, onClose }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    // Move focus off the previous text input (closes the mobile keyboard) and into
    // the dialog container — a non-text, non-button element, so no keyboard reopens
    // on mobile and Enter below can't double-fire against a focused button.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    dialogRef.current?.focus()

    const handleKeyDown = (e) => {
      // Ignore key repeats so an Enter held down from the activation form submit
      // can't instantly confirm and skip this safety prompt.
      if (e.repeat) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'Enter') { e.preventDefault(); onConfirm() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onConfirm, onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
        className="bg-stroke-navy w-full max-w-sm rounded-2xl shadow-modal overflow-hidden animate-scale-in focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-stroke-line">
          <div className="w-10 h-10 rounded-xl bg-stroke-iconActive/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-stroke-iconActive" strokeWidth={2} />
          </div>
          <div>
            <p id="alert-modal-title" className="text-stroke-text font-semibold text-base leading-tight">¿Activar Código Stroke?</p>
            <p className="text-stroke-textMuted text-sm mt-0.5">{patient.name}</p>
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
            className="flex-1 py-3 border border-stroke-line rounded-xl text-stroke-textMuted font-medium text-sm hover:bg-stroke-bg active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-[2] py-3 btn-primary text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke-iconActive focus-visible:ring-offset-2"
          >
            Sí, activar
          </button>
        </div>
      </div>
    </div>
  )
}
