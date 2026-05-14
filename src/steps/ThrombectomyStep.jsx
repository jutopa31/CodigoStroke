import { useState } from 'react'
import { ChevronRight, Bell, Calculator, Clock } from 'lucide-react'
import StepCard from '../components/StepCard'
import AspectModal from '../components/AspectModal'
import { SelectionCheck } from '../components/GuidedControls'

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

export default function ThrombectomyStep({
  nihssScore,
  isWakeUpStroke = false,
  onConfirm,
  angioRequestTime = null,
  onAngioRequest,
  thrombectomyActivationTime = null,
  onThrombectomyActivation,
}) {
  const [angioRequested, setAngioRequested] = useState(null)
  const [notified, setNotified] = useState(false)
  const [aspectScore, setAspectScore] = useState('')
  const [showAspectModal, setShowAspectModal] = useState(false)

  const highNihss = nihssScore >= 6
  const aspectNum = aspectScore !== '' ? parseInt(aspectScore, 10) : null
  const aspectValid = aspectNum !== null && aspectNum >= 0 && aspectNum <= 10
  const needsThrombectomyTime = angioRequested === true
  const canContinue = angioRequested !== null && aspectValid && (!needsThrombectomyTime || thrombectomyActivationTime)

  function handleAngioRequest() {
    const now = new Date()
    setAngioRequested(true)
    onAngioRequest?.(now)
  }

  function handleThrombectomyActivation() {
    onThrombectomyActivation?.(new Date())
  }

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
                <span className="ml-auto text-xs font-semibold text-red-600">Cambios extensos</span>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-4">
            {isWakeUpStroke
              ? '¿Se solicitó AngioRMN / TOF-MRA de encéfalo y cuello para descartar OGV?'
              : '¿Se solicitó AngioTAC de encéfalo y cuello para descartar OGV?'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setAngioRequested(false); setNotified(false) }}
              className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                angioRequested === false
                  ? 'bg-slate-100 border-slate-500 text-slate-800 shadow-sm ring-2 ring-slate-100'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <SelectionCheck active={angioRequested === false} tone="gray" />
                NO
              </span>
            </button>
            <button
              onClick={handleAngioRequest}
              className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
                angioRequested === true
                  ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm ring-2 ring-blue-100'
                  : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              SÍ
            </button>
          </div>
          {angioRequested === true && angioRequestTime && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 animate-fade-in">
              <Clock size={13} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 font-medium">
                {isWakeUpStroke ? 'AngioRMN/TOF' : 'AngioTAC'} solicitada a las {angioRequestTime.toLocaleTimeString('es-AR')}
              </span>
            </div>
          )}

          {angioRequested === false && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-amber-700 mb-1">
                {highNihss
                  ? `⚠ NIHSS ≥ 6 — considerar solicitar ${isWakeUpStroke ? 'AngioRMN/TOF-MRA' : 'AngioTAC'}`
                  : `⚠ Considerar ${isWakeUpStroke ? 'AngioRMN/TOF-MRA' : 'AngioTAC'} si hay sospecha clínica de OGV`}
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
                  {isWakeUpStroke ? 'AngioRMN/TOF-MRA solicitada — pendiente resultado' : 'AngioTAC solicitada — pendiente resultado'}
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

              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-800">Activación de trombectomía mecánica</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Registrar cuando se activa/inicia el circuito de trombectomía.
                    </p>
                    {thrombectomyActivationTime && (
                      <p className="text-sm font-mono font-semibold text-blue-900 mt-2">
                        {thrombectomyActivationTime.toLocaleTimeString('es-AR')}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleThrombectomyActivation}
                  className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
                >
                  {thrombectomyActivationTime ? 'Actualizar activación' : 'Registrar activación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </StepCard>

      {!canContinue && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 space-y-1">
          <p className="font-semibold text-amber-900">Para finalizar el protocolo falta:</p>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            {angioRequested === null && <li>Indicar si se solicitó AngioTAC</li>}
            {!aspectValid && <li>Registrar el puntaje ASPECTS (0–10)</li>}
            {needsThrombectomyTime && !thrombectomyActivationTime && <li>Registrar la activación de trombectomía</li>}
          </ul>
        </div>
      )}

      <button
        onClick={() => onConfirm({
          angioRequested,
          angioRequestTime: angioRequestTime?.toISOString(),
          hemodinamisNotified: notified,
          aspectScore: aspectNum,
          thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
        })}
        disabled={!canContinue}
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
