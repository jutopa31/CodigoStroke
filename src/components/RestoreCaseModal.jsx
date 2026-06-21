import { useEffect } from 'react'
import { History } from 'lucide-react'

// Etiqueta legible del paso donde quedó el caso.
const TAB_LABELS = {
  paciente: 'Paciente / signos vitales',
  tiempo: 'Tiempo de inicio',
  clinica: 'NIHSS',
  imagenes: 'Imágenes (TC/RM)',
  contraindicaciones: 'Contraindicaciones',
  decision: 'Decisión',
  tratamiento: 'Tratamiento',
  trombectomia: 'Trombectomía',
  cuidados: 'Cuidados post',
}

function timeAgo(iso) {
  if (!iso) return ''
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'hace instantes'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.round(mins / 60)
  return `hace ${hrs} h`
}

export default function RestoreCaseModal({ draft, onResume, onDiscard }) {
  useEffect(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }, [])

  const name = draft.patient?.name || 'Paciente sin nombre'
  const dni = draft.patient?.dni
  const stepLabel = TAB_LABELS[draft.activeTab] || 'En progreso'

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-stroke-navy w-full max-w-sm rounded-2xl shadow-modal overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-stroke-line">
          <div className="w-10 h-10 rounded-xl bg-stroke-iconActive/15 flex items-center justify-center shrink-0">
            <History size={20} className="text-stroke-iconActive" strokeWidth={2} />
          </div>
          <div>
            <p className="text-stroke-text font-semibold text-base leading-tight">Caso sin terminar</p>
            <p className="text-stroke-textMuted text-sm mt-0.5">{timeAgo(draft._savedAt)}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-stroke-textMuted leading-relaxed">
            Quedó un Código Stroke a medio cargar. ¿Retomarlo o empezar de cero?
          </p>
          <div className="mt-4 rounded-xl border border-stroke-line bg-stroke-bg px-4 py-3">
            <p className="text-stroke-text font-semibold text-sm leading-tight">{name}</p>
            {dni && <p className="text-stroke-textMuted text-xs mt-0.5">DNI {dni}</p>}
            <p className="text-stroke-textMuted text-xs mt-1.5">Último paso: {stepLabel}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            type="button"
            onClick={onDiscard}
            className="flex-1 py-3 border border-stroke-line rounded-xl text-stroke-textMuted font-medium text-sm hover:bg-stroke-bg active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          >
            Descartar
          </button>
          <button
            type="button"
            onClick={onResume}
            className="flex-[2] py-3 btn-primary text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-stroke-iconActive focus-visible:ring-offset-2"
          >
            Retomar caso
          </button>
        </div>
      </div>
    </div>
  )
}
