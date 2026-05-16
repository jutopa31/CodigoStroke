import { AlertTriangle } from 'lucide-react'

export default function AlertModal({ patient, onConfirm, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-600 px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Activar Codigo Stroke?</p>
            <p className="text-white/70 text-sm mt-0.5">{patient.name} - DNI {patient.dni}</p>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Se registrara el evento y el cronometro iniciara en este momento.
          </p>
        </div>

            <p className="text-white font-bold text-lg leading-tight">¿Activar Código Stroke?</p>
            <p className="text-white/70 text-sm mt-0.5">{patient.name} · DNI {patient.dni}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 leading-relaxed">
            Se registrará el evento y el cronómetro iniciará en este momento.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            No
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-[2] py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
          >
            Si, activar
            Sí, activar
          </button>
        </div>
      </div>
    </div>
  )
}
