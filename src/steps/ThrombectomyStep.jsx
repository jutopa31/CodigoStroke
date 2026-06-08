import { useState } from 'react'
import { ChevronRight, ChevronDown, ChevronUp, Bell, Calculator, Clock, Brain, CheckCircle2, Activity, AlertCircle, CheckCircle } from 'lucide-react'
import StepCard from '../components/StepCard'
import AspectModal from '../components/AspectModal'

function getAspectColor(score) {
  if (score >= 8) return { text: 'text-emerald-300', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
  if (score >= 6) return { text: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
  return { text: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/30' }
}

function getAspectLabel(score) {
  if (score >= 8) return 'Leve'
  if (score >= 6) return 'Moderado'
  return 'Extenso'
}

function fmtTime(date) {
  if (!date) return null
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

// Compact row: label on left, value+icon on right
function ConfirmedRow({ label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-stroke-textMuted font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-stroke-text">{value}</span>
        <CheckCircle2 size={13} className="text-emerald-500" />
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-[10px] text-stroke-iconActive underline ml-1"
          >
            editar
          </button>
        )}
      </div>
    </div>
  )
}

export default function ThrombectomyStep({
  nihssScore,
  isWakeUpStroke = false,
  onConfirm,
  confirmed = false,
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
    initialAspectScore !== null && initialAspectScore !== undefined ? String(initialAspectScore) : '10'
  )
  const [showAspectModal, setShowAspectModal] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const highNihss = nihssScore >= 6
  const angioLabel = isWakeUpStroke ? 'AngioRMN/TOF' : 'AngioTAC'
  const aspectNum = aspectScore !== '' ? parseInt(aspectScore, 10) : null
  const aspectValid = aspectNum !== null && aspectNum >= 0 && aspectNum <= 10
  const needsOGVAnswer = angioRequested === true
  const needsThrombectomyTime = angioRequested === true && ogvFound === true
  const canContinue =
    angioRequested !== null &&
    aspectValid &&
    (!needsOGVAnswer || ogvFound !== null) &&
    (!needsThrombectomyTime || thrombectomyActivationTime)

  const missingItems = []
  if (angioRequested === null) missingItems.push(`Indicar si se solicitó ${angioLabel}`)
  if (angioRequested === true && ogvFound === null) missingItems.push('Indicar resultado de OGV')
  if (needsThrombectomyTime && !thrombectomyActivationTime) missingItems.push('Registrar hora de activación de trombectomía')

  const aspectColors = aspectValid ? getAspectColor(aspectNum) : null

  function handleAngioYes() {
    const now = new Date()
    setAngioRequested(true)
    setOgvFound(null)
    setNotified(false)
    onAngioRequest?.(now)
  }

  function handleAngioNo() {
    setAngioRequested(false)
    setOgvFound(null)
    setNotified(false)
  }

  function handleThrombectomyActivation() {
    onThrombectomyActivation?.(new Date())
  }

  function adjustAspect(delta) {
    const current = aspectValid ? aspectNum : 10
    const next = Math.min(10, Math.max(0, current + delta))
    setAspectScore(String(next))
  }

  function handleSubmit() {
    if (!canContinue) {
      setShowErrors(true)
      return
    }
    onConfirm({
      angioRequested,
      angioRequestTime: angioRequested ? angioRequestTime?.toISOString() : null,
      ogvFound,
      hemodinamisNotified: notified,
      aspectScore: aspectNum,
      thrombectomyActivationTime: thrombectomyActivationTime?.toISOString(),
    })
  }

  return (
    <div className="px-4 pb-4 md:px-0">
      <StepCard step="8" title="OGV / Trombectomía" accent="blue">

        {/* NIHSS alert — compact 1-line */}
        {highNihss && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-2 rounded-lg border border-blue-500/30 bg-blue-500/10">
            <Activity size={13} className="text-blue-300 shrink-0" />
            <p className="text-xs font-semibold text-blue-300">
              NIHSS {nihssScore} — evaluar OGV{isWakeUpStroke ? ' · ACV del despertar' : ''}
            </p>
          </div>
        )}

        {/* Row 1: Angiografía */}
        {angioRequested === null ? (
          <div className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm font-medium text-stroke-text">{angioLabel}</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={handleAngioNo}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg active:scale-[0.98] transition-all"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleAngioYes}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] transition-all"
              >
                Sí, solicitar
              </button>
            </div>
          </div>
        ) : (
          <ConfirmedRow
            label={angioLabel}
            value={
              angioRequested
                ? `Sí${angioRequestTime ? ` · ${fmtTime(angioRequestTime)}` : ''}`
                : 'No solicitada'
            }
            onEdit={() => { setAngioRequested(null); setOgvFound(null) }}
          />
        )}

        {/* Row 2: OGV — solo si angio=Sí */}
        {angioRequested === true && (
          <div className="border-t border-stroke-line">
            {ogvFound === null ? (
              <div className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-medium text-stroke-text">¿OGV?</span>
                  <span className="text-[10px] text-stroke-textMuted">ICA · M1 · M2</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setOgvFound(false); setNotified(false) }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stroke-line bg-stroke-navy text-stroke-textMuted hover:bg-stroke-bg active:scale-[0.98] transition-all"
                  >
                    No OGV
                  </button>
                  <button
                    type="button"
                    onClick={() => setOgvFound(true)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-900 text-white hover:bg-blue-800 active:scale-[0.98] transition-all"
                  >
                    Sí OGV
                  </button>
                </div>
              </div>
            ) : (
              <ConfirmedRow
                label="OGV"
                value={ogvFound ? 'Confirmado' : 'No detectado'}
                onEdit={() => setOgvFound(null)}
              />
            )}
          </div>
        )}

        {/* Row 3: ASPECTS — siempre visible */}
        <div className="border-t border-stroke-line flex items-center justify-between gap-2 py-2">
          <span className="text-sm font-medium text-stroke-text">ASPECTS</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => adjustAspect(-1)}
              disabled={aspectNum <= 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stroke-line bg-stroke-navy text-stroke-textMuted font-bold hover:bg-stroke-bg active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronDown size={18} strokeWidth={2.5} />
            </button>
            <div className={`flex items-center gap-1.5 min-w-[64px] justify-center rounded-lg border px-2 py-1 ${aspectColors ? `${aspectColors.bg} ${aspectColors.border}` : 'bg-stroke-bg border-stroke-line'}`}>
              <span className={`text-lg font-bold tabular-nums leading-none ${aspectColors?.text ?? 'text-stroke-textMuted'}`}>
                {aspectValid ? aspectScore : '—'}
              </span>
              {aspectValid && (
                <span className={`text-[9px] font-semibold uppercase tracking-wider ${aspectColors?.text}`}>
                  {getAspectLabel(aspectNum)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => adjustAspect(1)}
              disabled={aspectNum >= 10}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-stroke-line bg-stroke-navy text-stroke-textMuted font-bold hover:bg-stroke-bg active:scale-[0.97] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronUp size={18} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => setShowAspectModal(true)}
              className="flex items-center gap-1 text-[10px] text-stroke-iconActive font-semibold hover:underline shrink-0"
            >
              <Calculator size={11} />
              Calc
            </button>
          </div>
        </div>

        {/* ASPECTS ≤ 5 inline warning */}
        {aspectValid && aspectNum <= 5 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/15 animate-fade-in">
            <Brain size={12} className="text-blue-300 shrink-0" />
            <p className="text-xs font-semibold text-blue-300">ASPECTS ≤ 5 — cambios extensos en TC</p>
          </div>
        )}

        {/* Row 4: Acciones OGV — solo si ogvFound=Sí */}
        {ogvFound === true && (
          <div className="border-t border-stroke-line pt-2 grid grid-cols-2 gap-2 animate-fade-in">
            <button
              type="button"
              onClick={() => setNotified(true)}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] ${
                notified
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              <Bell size={13} />
              {notified ? 'Hemodinamia ✓' : 'Notificar Hemod.'}
            </button>
            <button
              type="button"
              onClick={handleThrombectomyActivation}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-all active:scale-[0.98] ${
                thrombectomyActivationTime
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-stroke-iconActive/40 bg-stroke-navy text-stroke-iconActive hover:bg-stroke-iconActive/10'
              }`}
            >
              <Clock size={13} />
              {thrombectomyActivationTime
                ? fmtTime(thrombectomyActivationTime)
                : 'Activar Trombect.'}
            </button>
          </div>
        )}

        {/* No OGV confirmation */}
        {ogvFound === false && (
          <div className="border-t border-stroke-line pt-2 animate-fade-in">
            <p className="text-xs text-emerald-400 font-semibold text-center py-1">
              Sin OGV — no requiere trombectomía mecánica
            </p>
          </div>
        )}

      </StepCard>

      {/* Submit */}
      <div className="mt-3">
        {confirmed ? (
          <div className="flex items-center justify-center gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-4 animate-fade-in">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Protocolo finalizado</p>
              <p className="text-xs text-emerald-400">Datos del caso guardados</p>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleSubmit}
              className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all active:scale-[0.98] md:w-auto md:px-5 ${
                canContinue
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-stroke-panel text-stroke-textMuted cursor-pointer'
              }`}
            >
              Finalizar protocolo <ChevronRight size={18} />
            </button>
            {showErrors && missingItems.length > 0 && (
              <div className="mt-2 rounded-lg border border-status-critical/30 bg-status-critical/10 p-3 animate-fade-in">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertCircle size={13} className="text-red-400 shrink-0" />
                  <p className="text-xs font-semibold text-red-300">Completar antes de finalizar:</p>
                </div>
                <ul className="space-y-0.5">
                  {missingItems.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-red-400">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      {showAspectModal && (
        <AspectModal
          onLoad={(score) => { setAspectScore(String(score)); setShowAspectModal(false) }}
          onClose={() => setShowAspectModal(false)}
        />
      )}
    </div>
  )
}
