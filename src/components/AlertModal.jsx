import { useState } from 'react'
import { AlertTriangle, Bell, X, CheckCircle, Brain, Hospital, Stethoscope } from 'lucide-react'

const TEAM = [
  { name: 'Neurología', Icon: Brain },
  { name: 'Terapia Intensiva', Icon: Hospital },
  { name: 'Neurocirugía', Icon: Stethoscope },
]

export default function AlertModal({ patient, onConfirm, onClose }) {
  const [sending, setSending] = useState(false)

  async function handleConfirm() {
    setSending(true)
    await onConfirm()
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-down">
        {/* Header */}
        <div className="bg-brand-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-white" />
            <span className="text-white font-bold text-base tracking-wide">CÓDIGO STROKE</span>
          </div>
          <button onClick={onClose} className="text-red-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Patient info */}
        <div className="px-5 pt-5 pb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paciente</p>
          <p className="font-semibold text-gray-800 text-lg">{patient.name}</p>
          <p className="text-sm text-gray-500">DNI: {patient.dni}</p>
        </div>

        {/* Divider */}
        <div className="mx-5 border-t border-gray-100" />

        {/* Team notification */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} className="text-gray-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wider">Se notificará a</p>
          </div>
          <div className="space-y-2">
            {TEAM.map((t) => (
              <div key={t.name} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                <t.Icon size={16} className="text-brand-600 shrink-0" />
                <span className="font-medium text-gray-700 text-sm">{t.name}</span>
                <CheckCircle size={16} className="text-emerald-500 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div className="mx-5 mb-4 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
          <p className="text-xs text-amber-700 leading-relaxed">
            Al confirmar se registrará el evento y se enviará notificación al equipo. El cronómetro iniciará ahora.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={sending}
            className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-60"
          >
            {sending ? 'Notificando…' : 'Confirmar y Notificar'}
          </button>
        </div>
      </div>
    </div>
  )
}
