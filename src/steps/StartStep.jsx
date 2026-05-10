import { Activity, Zap } from 'lucide-react'

export default function StartStep({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring opacity-30 scale-110" />
        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-lg relative">
          <Activity size={44} className="text-white" />
        </div>
      </div>

      <h1 className="font-display text-4xl text-gray-800 text-center leading-tight mb-2">
        Código Stroke
      </h1>
      <p className="text-gray-400 text-center text-sm mb-10 max-w-xs leading-relaxed">
        Protocolo de atención para ACV isquémico en fase aguda — AHA/ASA 2026
      </p>

      {/* Info chips */}
      <div className="flex gap-2 mb-10 flex-wrap justify-center">
        {['Ventana 4.5h', 'NIHSS', 'rtPA / TNK'].map((label) => (
          <span
            key={label}
            className="text-xs bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full shadow-sm"
          >
            {label}
          </span>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-lg py-5 px-8 rounded-2xl shadow-xl transition-all duration-150"
      >
        <Zap size={22} />
        Iniciar Código Stroke
      </button>

      <p className="mt-6 text-xs text-gray-300 text-center">
        Cada minuto importa · 1.9M neuronas/min
      </p>
    </div>
  )
}
