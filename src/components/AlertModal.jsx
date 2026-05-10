import { useState, useEffect } from 'react'
import { AlertTriangle, Bell, X, CheckCircle, Brain, Hospital, Stethoscope } from 'lucide-react'

const TEAM = [
  { name: 'Neurología',        Icon: Brain,        color: 'text-violet-600', bg: 'bg-violet-50',  ring: 'ring-violet-100' },
  { name: 'Terapia Intensiva', Icon: Hospital,      color: 'text-sky-600',    bg: 'bg-sky-50',     ring: 'ring-sky-100'    },
  { name: 'Neurocirugía',      Icon: Stethoscope,  color: 'text-teal-600',   bg: 'bg-teal-50',    ring: 'ring-teal-100'   },
]

export default function AlertModal({ patient, onConfirm, onClose }) {
  const [sending, setSending] = useState(false)

  async function handleConfirm() {
    setSending(true)
    await onConfirm()
    setSending(false)
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && !sending) handleConfirm()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sending])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-0 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 pt-5 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <p className="text-white/65 text-[11px] uppercase tracking-[0.15em] font-semibold leading-none mb-1">
                  Activar
                </p>
                <p className="text-white font-display text-2xl leading-tight">Código Stroke</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors shrink-0 mt-1"
              aria-label="Cerrar"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Patient — inside header for visual weight */}
          <div className="mt-5 bg-white/10 rounded-2xl px-4 py-3.5">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Paciente</p>
            <p className="text-white font-semibold text-lg leading-snug">{patient.name}</p>
            <p className="text-white/70 text-sm mt-0.5">DNI {patient.dni}</p>
          </div>
        </div>

        {/* Team notification */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-4">
            <Bell size={13} className="text-gray-400" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Equipo a notificar
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {TEAM.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col items-center gap-2.5 rounded-2xl p-3.5 ring-1 ${t.bg} ${t.ring} text-center`}
              >
                <div className={`w-10 h-10 rounded-full bg-white ring-1 ${t.ring} flex items-center justify-center shadow-sm`}>
                  <t.Icon size={18} className={t.color} />
                </div>
                <p className="text-[11px] font-semibold text-gray-700 leading-tight">{t.name}</p>
                <CheckCircle size={14} className="text-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Warning strip */}
        <div className="mx-6 mb-5 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            Al confirmar se registra el evento y se notifica al equipo.{' '}
            <strong className="font-semibold">El cronómetro inicia en este momento.</strong>
          </p>
        </div>

        {/* Actions — safe-area-aware */}
        <div
          className="px-6 pt-1 flex gap-3"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-4 border-2 border-gray-200 rounded-2xl text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={sending}
            className="flex-[2] py-4 bg-brand-600 text-white rounded-2xl font-bold text-sm hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Bell size={15} className={sending ? 'animate-pulse' : ''} />
            {sending ? 'Notificando…' : 'Confirmar y Notificar'}
          </button>
        </div>
      </div>
    </div>
  )
}
