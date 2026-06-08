import { CheckCircle2, XCircle, AlertTriangle, Moon, Clock, Syringe, Zap } from 'lucide-react'

function DecisionIcon({ icon }) {
  if (icon === 'check')   return <CheckCircle2 size={28} className="text-emerald-400" />
  if (icon === 'error')   return <XCircle size={28} className="text-blue-300" />
  if (icon === 'warning') return <AlertTriangle size={28} className="text-amber-400" />
  if (icon === 'moon')    return <Moon size={28} className="text-indigo-300" />
  if (icon === 'pending') return <Clock size={28} className="text-stroke-textMuted" />
  return <Clock size={28} className="text-stroke-textMuted" />
}

const iconBgMap = {
  check:   'bg-emerald-500/15',
  error:   'bg-blue-500/15',
  warning: 'bg-amber-500/15',
  moon:    'bg-indigo-500/15',
  pending: 'bg-stroke-panel',
}

const borderMap = {
  check:   'border-emerald-400',
  error:   'border-blue-800',
  warning: 'border-amber-400',
  moon:    'border-indigo-400',
  pending: 'border-stroke-line',
}

function DetailChip({ label, tone }) {
  const colors = {
    red:    'bg-blue-500/10 border-blue-500/30 text-blue-300',
    orange: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    green:  'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    gray:   'bg-stroke-bg border-stroke-line text-stroke-textMuted',
  }[tone] ?? 'bg-stroke-bg border-stroke-line text-stroke-textMuted'
  return (
    <div className={`rounded-lg md:rounded-md border px-2.5 py-1.5 text-xs font-medium ${colors}`}>
      {label}
    </div>
  )
}

export default function DecisionTab({ result, onGoToThrombolysis, onGoToThrombectomy }) {
  if (!result) return (
    <div className="flex items-center justify-center min-h-[200px] text-stroke-textMuted text-sm">
      Sin resultado disponible
    </div>
  )

  const { thrombolyze, icon, title, body, drug, absoluteCI, relativeCI, absoluteDetails, relativeDetails } = result

  return (
    <div className="px-4 pb-4 animate-slide-down md:px-0">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start xl:gap-4">
        <div className="space-y-3">
          <div className={`bg-stroke-navy rounded-xl border ${borderMap[icon] ?? 'border-stroke-line'} p-4 lg:p-5`}>
            <div className={`w-11 h-11 ${iconBgMap[icon] ?? 'bg-stroke-panel'} rounded-lg flex items-center justify-center mx-auto md:mx-0 mb-3`}>
              <DecisionIcon icon={icon} />
            </div>
            <h2 className="text-stroke-text text-lg font-bold text-center md:text-left mb-1.5">{title}</h2>
            <p className="text-sm text-stroke-textMuted text-center md:text-left leading-relaxed max-w-2xl mx-auto md:mx-0">{body}</p>
          </div>

          {thrombolyze === true && drug && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2">Fármaco recomendado</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Syringe size={18} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">
                    {drug === 'tnk' ? 'TNK - Tenecteplase' : 'rtPA - Alteplase'}
                  </p>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    {drug === 'tnk' ? 'Bolo único IV · 0.25 mg/kg (máx 25 mg)' : 'Bolo + infusión · 0.9 mg/kg (máx 90 mg)'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-emerald-400 mt-2">
                Ir al tab <strong>Trombolisis</strong> para calcular la dosis por peso.
              </p>
            </div>
          )}

          {absoluteCI && absoluteDetails.length > 0 && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-2">Contraindicaciones absolutas</p>
              <div className="space-y-1.5">
                {absoluteDetails.map((d) => <DetailChip key={d} label={d} tone="red" />)}
              </div>
            </div>
          )}

          {relativeCI && relativeDetails.length > 0 && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-2">Contraindicaciones relativas</p>
              <div className="space-y-1.5">
                {relativeDetails.map((d) => <DetailChip key={d} label={d} tone="orange" />)}
              </div>
              {thrombolyze === true && (
                <p className="text-xs text-amber-300 mt-2 font-medium">
                  Requiere interconsulta. Valorar riesgo/beneficio individual.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 lg:sticky lg:top-4 md:rounded-lg md:border md:border-stroke-line md:bg-stroke-navy md:p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stroke-textMuted px-1">Próximos pasos</p>
          {thrombolyze === true && (
            <button type="button" onClick={onGoToThrombolysis}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] transition-all text-white">
              <Syringe size={18} />
              <div className="text-left">
                <p className="text-sm font-bold">Ir a Trombolisis</p>
                <p className="text-xs text-white/85">Calcular dosis y registrar administración</p>
              </div>
            </button>
          )}
          <button type="button" onClick={onGoToThrombectomy}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-stroke-iconActive hover:bg-[#4D6CD6] active:scale-[0.98] transition-all text-stroke-bg">
            <Zap size={18} />
            <div className="text-left">
              <p className="text-sm font-bold">Ir a Trombectomía</p>
              <p className="text-xs text-stroke-bg/80">
                {thrombolyze === true ? 'Evaluar OGV en paralelo' : 'Evaluar trombectomía mecánica'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
