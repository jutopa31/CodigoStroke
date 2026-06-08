import { Moon, AlertTriangle, X } from 'lucide-react'

export default function WakeUpStrokeModal({ elapsedHours, onActivate, onDismiss }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 animate-fade-in">
      <div className="bg-stroke-navy w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-down">

        {/* Header */}
        <div className="bg-indigo-700 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon size={20} className="text-white" />
            <span className="text-white font-bold text-base tracking-wide">Evaluar OGV - {elapsedHours}h</span>
          </div>
          <button onClick={onDismiss} className="text-indigo-300 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-5 pb-4 space-y-4">
          <div className="flex items-start gap-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3">
            <AlertTriangle size={16} className="text-indigo-300 shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-300 leading-relaxed">
              El ultimo avistamiento asintomatico supera las <strong>4.5 horas</strong>, pero esta dentro de las primeras <strong>9 horas</strong>. Evaluar oclusion de gran vaso y criterios de imagen segun protocolo.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-stroke-text mb-1">Es un ACV del despertar?</p>
            <p className="text-xs text-stroke-textMuted leading-relaxed">
              Si el paciente desperto con sintomas y el momento exacto de inicio es desconocido, puede ser elegible para trombolisis mediante <strong>criterios de RMN (mismatch FLAIR-DWI)</strong> segun el protocolo WAKE-UP.
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex flex-col gap-2">
          <button
            onClick={onActivate}
            className="w-full py-3.5 bg-indigo-700 hover:bg-indigo-800 active:scale-95 text-white rounded-xl font-semibold text-sm transition-all"
          >
            Activar protocolo ACV del despertar
          </button>
          <button
            onClick={onDismiss}
            className="w-full py-3 border border-stroke-line rounded-xl text-stroke-textMuted font-medium text-sm hover:bg-stroke-bg transition-colors"
          >
            Continuar protocolo estandar
          </button>
        </div>
      </div>
    </div>
  )
}
