import { useState } from 'react'
import { ChevronRight, Bell, Calculator } from 'lucide-react'
import StepCard from '../components/StepCard'
import AspectModal from '../components/AspectModal'

function getAspectColor(score) {
  if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
  if (score >= 6) return 'text-amber-600 bg-amber-50 border-amber-200'
  return 'text-red-600 bg-red-50 border-red-200'
}

function getAspectLabel(score) {
  if (score >= 8) return 'Cambios leves'
  if (score >= 6) return 'Cambios moderados'
  return 'Cambios extensos'
}

export default function ThrombectomyStep({ nihssScore, onConfirm }) {
  const [angioRequested, setAngioRequested] = useState(null)
  const [notified, setNotified] = useState(false)
  const [aspectScore, setAspectScore] = useState('')
  const [showAspectModal, setShowAspectModal] = useState(false)

  const highNihss = nihssScore >= 6
  const aspectNum = aspectScore !== '' ? parseInt(aspectScore, 10) : null
  const aspectValid = aspectNum !== null && aspectNum >= 0 && aspectNum <= 10

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="9" title="Trombectomía mecánica — Evaluación" accent="blue">

        {highNihss && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              NIHSS {nihssScore} — considerar oclusión de gran vaso (OGV)
            </p>
          </div>
        )}

        {/* ASPECTS */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            ASPECTS — Puntaje de TC precoz
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              placeholder="0–10"
              min={0}
              max={10}
              value={aspectScore}
              onChange={(e) => setAspectScore(e.target.value)}
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder-gray-300"
            />
            <button
              onClick={() => setShowAspectModal(true)}
              className="flex items-center gap-2 px-4 py-3.5 border border-indigo-300 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-medium text-sm transition-colors whitespace-nowrap"
            >
              <Calculator size={16} /> Calcular
            </button>
          </div>
          {aspectValid && (
            <div className={`mt-2 flex items-center gap-2 border rounded-xl px-3 py-2.5 animate-fade-in ${getAspectColor(aspectNum)}`}>
              <span className="text-xl font-bold font-mono">{aspectNum}</span>
              <span className="text-xs font-semibold">{getAspectLabel(aspectNum)}</span>
              {aspectNum <= 5 && (
                <span className="ml-auto text-xs font-semibold">⚠ Trombectomía discutible</span>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-4">
            ¿Se solicitó AngioTAC de encéfalo y cuello para descartar OGV?
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setAngioRequested(false); setNotified(false) }}
              className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                angioRequested === false
                  ? 'bg-gray-300 border-gray-300 text-gray-700'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              NO
            </button>
            <button
              onClick={() => setAngioRequested(true)}
              className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                angioRequested === true
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              SÍ
            </button>
          </div>

          {angioRequested === false && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                {highNihss ? '⚠ NIHSS ≥ 6 — considerar solicitar AngioTAC' : '⚠ Considerar AngioTAC si hay sospecha clínica de OGV'}
              </p>
              <p className="text-xs text-amber-600 leading-relaxed">
                Ventana para trombectomía: hasta 6h (estándar) · hasta 24h con perfusión favorable (DAWN/DEFUSE-3).
              </p>
            </div>
          )}

          {angioRequested === true && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">
                  AngioTAC solicitada — pendiente resultado
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  Si confirma oclusión de ICA, M1 o M2 → notificar a hemodinamia.
                </p>
              </div>

              <button
                onClick={() => setNotified(true)}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                  notified
                    ? 'bg-emerald-600 border-2 border-emerald-600 text-white'
                    : 'bg-brand-600 hover:bg-brand-700 text-white'
                }`}
              >
                <Bell size={17} />
                {notified ? '✓ Hemodinamia notificada' : 'Notificar al servicio de Hemodinamia'}
              </button>
            </div>
          )}
        </div>
      </StepCard>

      <button
        onClick={() => onConfirm({ angioRequested, hemodinamisNotified: notified, aspectScore: aspectNum })}
        disabled={angioRequested === null}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Finalizar protocolo <ChevronRight size={18} />
      </button>

      {showAspectModal && (
        <AspectModal
          onLoad={(score) => { setAspectScore(String(score)); setShowAspectModal(false) }}
          onClose={() => setShowAspectModal(false)}
        />
      )}
    </div>
  )
}
