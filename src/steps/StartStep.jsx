import { useState, useEffect } from 'react'
import { Activity, Zap, RotateCcw, Clock, ChevronRight } from 'lucide-react'
import { loadSession, getSessions } from '../lib/storage'

function getRecentSession() {
  const sessions = getSessions()
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000
  let best = null
  for (const [id, s] of Object.entries(sessions)) {
    const updated = new Date(s.updatedAt || s.startTime || 0).getTime()
    if (updated > fourHoursAgo && (!best || updated > best.updated)) {
      best = { id, ...s, updated }
    }
  }
  return best
}

function formatElapsed(ms) {
  const min = Math.floor(ms / 60000)
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  return `${h}h ${min % 60}min`
}

export default function StartStep({ onStart, onResume }) {
  const [resumeId, setResumeId] = useState('')
  const [error, setError] = useState(false)
  const [showManualResume, setShowManualResume] = useState(false)
  const [recentSession, setRecentSession] = useState(null)

  useEffect(() => {
    setRecentSession(getRecentSession())
  }, [])

  function handleResume() {
    const session = loadSession(resumeId)
    if (session) {
      setError(false)
      onResume(resumeId, session)
    } else {
      setError(true)
    }
  }

  function handleRecentResume() {
    if (!recentSession) return
    const session = loadSession(recentSession.id)
    if (session) onResume(recentSession.id, session)
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-gray-50">
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

      {/* Quick resume card — active case from localStorage */}
      {recentSession && (
        <button
          onClick={handleRecentResume}
          className="w-full max-w-xs mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3.5 text-left transition-all hover:bg-amber-100 active:scale-[0.98] shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Caso activo</p>
              <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">
                {recentSession.patientName || 'Paciente'}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {recentSession.id} · hace {formatElapsed(Date.now() - recentSession.updated)}
              </p>
            </div>
            <ChevronRight size={18} className="text-amber-500 shrink-0 mt-2" />
          </div>
        </button>
      )}

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
        <button
          type="button"
          onClick={() => setShowManualResume((v) => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showManualResume ? 'Ocultar' : 'Retomar otro caso'}
        </button>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Manual resume — accordion */}
      {showManualResume && (
        <div className="w-full max-w-xs mt-4 flex flex-col items-center gap-2 animate-fade-in">
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
              disabled={resumeId.length < 3}
              className="border-2 border-brand-600 text-brand-600 rounded-xl py-3 px-6 font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <RotateCcw size={16} />
              Reanudar
            </button>
          </div>
          <p className="text-xs text-gray-400 self-start">Ingresá el ID del caso anterior</p>
          {error && (
            <p className="text-red-500 text-xs self-start animate-fade-in">Caso no encontrado</p>
          )}
        </div>
      )}

      <p className="mt-8 text-xs text-gray-300 text-center">
        Cada minuto importa · 1.9M neuronas/min
      </p>
    </div>
  )
}
