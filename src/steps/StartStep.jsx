import { useState } from 'react'
import { Activity, Zap, RotateCcw } from 'lucide-react'
import { loadSession } from '../lib/storage'

export default function StartStep({ onStart, onResume }) {
  const [resumeId, setResumeId] = useState('')
  const [error, setError] = useState(false)

  function handleResume() {
    const session = loadSession(resumeId)
    if (session) {
      setError(false)
      onResume(resumeId, session)
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-brand-600 animate-pulse-ring opacity-30 scale-110" />
        <div className="w-24 h-24 rounded-full bg-brand-600 flex items-center justify-center shadow-lg relative">
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
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold text-lg py-5 px-8 rounded-2xl shadow-xl transition-all duration-150"
      >
        <Zap size={22} />
        Iniciar Código Stroke
      </button>

      {/* Separador */}
      <div className="flex items-center gap-3 w-full max-w-xs mt-6">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400">o bien</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Reanudar caso */}
      <div className="w-full max-w-xs mt-4 flex flex-col items-center gap-2">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="XXXXXX"
            maxLength={6}
            value={resumeId}
            onChange={(e) => {
              setResumeId(e.target.value.toUpperCase())
              setError(false)
            }}
            className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300 uppercase"
          />
          <button
            onClick={handleResume}
            disabled={resumeId.length < 6}
            className="border-2 border-brand-600 text-brand-600 rounded-xl py-3 px-6 font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            <RotateCcw size={16} />
            Reanudar
          </button>
        </div>
        <p className="text-xs text-gray-400 self-start">Ingresá el ID del caso anterior</p>
        {error && (
          <p className="text-red-500 text-xs self-start">Caso no encontrado</p>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-300 text-center">
        Cada minuto importa · 1.9M neuronas/min
      </p>
    </div>
  )
}
