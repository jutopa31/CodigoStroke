import { useEffect, useState } from 'react'
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react'

const AVISO_ITEMS = [
  'Traslado a Shock Room',
  '2 vias IV perifericas',
  'Laboratorios: hemograma, coagulacion, glucemia, funcion renal, electrolitos',
  'TAC de encefalo sin contraste — solicitar',
]

const COUNTDOWN_SECONDS = 5

export default function AvisoModal({ isOpen, onClose }) {
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const reset = setTimeout(() => {
      setRemaining(COUNTDOWN_SECONDS)
      setDone(false)
    }, 0)

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setDone(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(reset)
      clearInterval(interval)
    }
  }, [isOpen])

  useEffect(() => {
    if (done && isOpen) {
      const timeout = setTimeout(onClose, 400)
      return () => clearTimeout(timeout)
    }
  }, [done, isOpen, onClose])

  if (!isOpen) return null

  const progress = ((COUNTDOWN_SECONDS - remaining) / COUNTDOWN_SECONDS) * 100

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className={`w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all ${done ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Header urgente */}
        <div className="bg-brand-600 px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-200">Activación</p>
              <h2 className="text-white font-bold text-xl leading-tight">Código Stroke</h2>
            </div>
          </div>
          <p className="text-brand-200 text-xs mt-2 leading-snug">
            Trombolisis indicada. Ejecutar acciones inmediatas.
          </p>
        </div>

        {/* Checklist de acciones */}
        <div className="px-6 py-5 space-y-3">
          {AVISO_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
            >
              <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 font-bold text-sm">
                {i + 1}
              </div>
              <p className="text-sm font-medium text-gray-700 leading-snug pt-0.5">{item}</p>
            </div>
          ))}
        </div>

        {/* Footer — countdown + botón */}
        <div className="px-6 pb-6 space-y-3">
          {/* Barra de progreso */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-400 font-medium">Avanzando automáticamente</span>
              <span className={`text-sm font-bold tabular-nums ${remaining <= 2 ? 'text-brand-600' : 'text-gray-500'}`}>
                {remaining}s
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-xl transition-all text-sm"
          >
            <CheckCircle2 size={16} />
            Avanzar ahora
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
