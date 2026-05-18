import { useState } from 'react'
import { ChevronRight, Bell, Calculator, Clock, Radio, Target, Brain } from 'lucide-react'
import StepCard from '../components/StepCard'
import AspectModal from '../components/AspectModal'
import { SelectionCheck } from '../components/GuidedControls'

function getAspectColor(score) {
  if (score >= 8) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (score >= 6) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
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
  initialAspectScore = null,
}) {
  const [angioRequested, setAngioRequested] = useState(null)
  const [ogvFound, setOgvFound] = useState(null)
  const [notified, setNotified] = useState(false)
  const [aspectScore, setAspectScore] = useState(
    initialAspectScore !== null && initialAspectScore !== undefined ? String(initialAspectScore) : ''
  )
  const [showAspectModal, setShowAspectModal] = useState(false)

  const highNihss = nihssScore >= 6
  const aspectFromCT = initialAspectScore !== null && initialAspectScore !== undefined
  const aspectNum = aspectScore !== '' ? parseInt(aspectScore, 10) : null
  const aspectValid = aspectNum !== null && aspectNum >= 0 && aspectNum <= 10
  const needsOGVAnswer = angioRequested === true
  const needsThrombectomyTime = angioRequested === true && ogvFound === true
  const canContinue = angioRequested !== null && aspectValid &&
    (!needsOGVAnswer || ogvFound !== null) &&
    (!needsThrombectomyTime || thrombectomyActivationTime)

  const angioLabel = isWakeUpStroke ? 'AngioRMN/TOF' : 'AngioTAC'
  const aspectScores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

  function handleAngioRequest() {
    const now = new Date()
    setAngioRequested(true)
    setOgvFound(null)
    setNotified(false)
    onAngioRequest?.(now)
  }

  function handleNoAngio() {
    setAngioRequested(false)
    setOgvFound(null)
    setNotified(false)
  }

  function handleThrombectomyActivation() {
    onThrombectomyActivation?.(new Date())
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="8" title="Trombectomía mecánica" accent="blue">
        {highNihss && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              NIHSS {nihssScore} — considerar oclusión de gran vaso (OGV)
            </p>
          </div>
        )}

        <div className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
          ogvFound === true
            ? 'border-blue-200 bg-blue-50/70 shadow-card'
            : ogvFound === false || angioRequested === false
              ? 'border-emerald-200 bg-emerald-50/70 shadow-card'
              : 'border-blue-100 bg-white shadow-card'
        }`}>
          <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-colors ${
              angioRequested === null ? 'bg-blue-600' : angioRequested ? 'bg-blue-600' : 'bg-slate-500'
            }`}>
              <Radio size={21} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-sm font-bold leading-tight text-blue-900">
                  ¿Se solicitó {angioLabel}?
                </p>
                {angioRequested === true && angioRequestTime && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/75 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
                    <Clock size={11} />
                    {angioRequestTime.toLocaleTimeString('es-AR')}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-blue-700">
                Tocá una opción y el resultado de OGV aparece en este mismo campo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-blue-100 bg-white/70 p-3">
            <button
              type="button"
              onClick={handleNoAngio}
              className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                angioRequested === false
                  ? 'border-slate-500 bg-slate-700 text-white shadow-elevated'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <SelectionCheck active={angioRequested === false} tone="gray" />
              No
            </button>
            <button
              type="button"
              onClick={handleAngioRequest}
              className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                angioRequested === true
                  ? 'border-blue-600 bg-blue-600 text-white shadow-elevated'
                  : 'border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <SelectionCheck active={angioRequested === true} tone="blue" />
              Sí, {angioLabel}
            </button>
          </div>

          {angioRequested === false && (
            <div className="border-t border-amber-100 bg-amber-50 px-4 py-3 animate-fade-in">
              <p className="text-xs font-semibold text-amber-800">
                {highNihss
                  ? `NIHSS ≥ 6 — considerar solicitar ${angioLabel}`
                  : `Considerar ${angioLabel} si hay sospecha clínica de OGV`}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                Ventana para trombectomía: hasta 6h estándar, hasta 24h con perfusión favorable.
              </p>
            </div>
          )}

          {angioRequested === true && (
            <div className="border-t border-blue-100 bg-white/80 p-3 animate-scale-in">
              <div className="mb-3 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                <Target size={16} className="mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs font-bold text-blue-800">¿Tiene OGV?</p>
                  <p className="text-xs leading-relaxed text-blue-700">
                    ICA, M1 o M2 positiva → activar circuito de trombectomía.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setOgvFound(false); setNotified(false) }}
                  className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                    ogvFound === false
                      ? 'border-emerald-500 bg-emerald-600 text-white shadow-elevated'
                      : 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <SelectionCheck active={ogvFound === false} tone="green" />
                  No OGV
                </button>
                <button
                  type="button"
                  onClick={() => setOgvFound(true)}
                  className={`flex min-h-[58px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                    ogvFound === true
                      ? 'border-blue-600 bg-blue-600 text-white shadow-elevated'
                      : 'border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <SelectionCheck active={ogvFound === true} tone="blue" />
                  Sí OGV
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card">
          <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${
              aspectValid ? 'bg-emerald-500' : 'bg-blue-600'
            }`}>
              <Brain size={21} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold leading-tight text-neutral-900">Puntaje ASPECTS</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    Elegí 0-10 sin abrir el teclado, o calculalo por regiones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAspectModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <Calculator size={14} />
                  Calcular
                </button>
              </div>
            </div>
          </div>

          {aspectFromCT ? (
            <div className={`mx-3 mb-3 flex items-center gap-2 rounded-xl border px-3 py-3 ${getAspectColor(aspectNum)}`}>
              <span className="font-mono text-xl font-bold">{aspectNum}</span>
              <span className="text-xs font-semibold">{getAspectLabel(aspectNum)}</span>
              <span className="ml-auto text-[11px] font-medium opacity-70">Evaluado en TAC</span>
            </div>
          ) : (
            <div className="border-t border-neutral-100 bg-neutral-50/60 p-3">
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {aspectScores.map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setAspectScore(String(score))}
                    className={`flex h-11 items-center justify-center rounded-xl border text-sm font-bold transition-all active:scale-[0.96] ${
                      aspectNum === score
                        ? `${getAspectColor(score)} shadow-card`
                        : 'border-neutral-200 bg-white text-neutral-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>

              {aspectValid && (
                <div className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-3 animate-fade-in ${getAspectColor(aspectNum)}`}>
                  <span className="font-mono text-xl font-bold">{aspectNum}</span>
                  <span className="text-xs font-semibold">{getAspectLabel(aspectNum)}</span>
                  {aspectNum <= 5 && (
                    <span className="ml-auto text-xs font-semibold">Cambios extensos</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {ogvFound === false && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 animate-fade-in">
            <p className="text-xs font-semibold text-emerald-700">
              Sin OGV — no requiere trombectomía mecánica.
            </p>
          </div>
        )}

        {ogvFound === true && (
          <div className="mt-3 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs font-semibold text-blue-700">OGV confirmado — notificar a hemodinamia</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-600">
                Oclusión de ICA, M1 o M2 → activar circuito de trombectomía mecánica.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotified(true)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold transition-all active:scale-[0.98] ${
                notified
                  ? 'border-2 border-emerald-600 bg-emerald-600 text-white'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              <Bell size={17} />
              {notified ? 'Hemodinamia notificada' : 'Notificar al servicio de Hemodinamia'}
            </button>

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-blue-800">Activación de trombectomía mecánica</p>
                  <p className="mt-0.5 text-xs text-blue-700">
                    Registrar cuando se activa o inicia el circuito.
                  </p>
                  {thrombectomyActivationTime && (
                    <p className="mt-2 font-mono text-sm font-semibold text-blue-900">
                      {thrombectomyActivationTime.toLocaleTimeString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleThrombectomyActivation}
                className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98]"
              >
                {thrombectomyActivationTime ? 'Actualizar activación' : 'Registrar activación'}
              </button>
            </div>
          </div>
        )}
      </StepCard>

      {!canContinue && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">Para finalizar el protocolo falta:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {angioRequested === null && <li>Indicar si se solicitó {angioLabel}</li>}
            {needsOGVAnswer && ogvFound === null && <li>Indicar si tiene OGV</li>}
            {!aspectValid && <li>Registrar el puntaje ASPECTS (0-10)</li>}
            {needsThrombectomyTime && !thrombectomyActivationTime && <li>Registrar la activación de trombectomía</li>}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => onConfirm({
          angioRequested,
          angioRequestTime: angioRequested ? angioRequestTime?.toISOString() : null,
          ogvFound,
          hemodinamisNotified: notified,
          aspectScore: aspectNum,
          thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
        })}
        disabled={!canContinue}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
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
