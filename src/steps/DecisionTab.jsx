import { CheckCircle2, XCircle, AlertTriangle, Moon, Clock, Syringe, Zap } from 'lucide-react'

function DecisionIcon({ icon }) {
  if (icon === 'check')   return <CheckCircle2 size={22} className="text-emerald-600" />
  if (icon === 'error')   return <XCircle size={22} className="text-blue-900" />
  if (icon === 'warning') return <AlertTriangle size={22} className="text-amber-600" />
  if (icon === 'moon')    return <Moon size={22} className="text-indigo-600" />
  if (icon === 'pending') return <Clock size={22} className="text-neutral-400" />
  return <Clock size={22} className="text-neutral-400" />
}

const iconBgMap = {
  check:   'bg-emerald-100',
  error:   'bg-blue-100',
  warning: 'bg-amber-100',
  moon:    'bg-indigo-100',
  pending: 'bg-neutral-100',
}

const borderMap = {
  check:   'border-emerald-400',
  error:   'border-blue-800',
  warning: 'border-amber-400',
  moon:    'border-indigo-400',
  pending: 'border-neutral-200',
}

function DetailChip({ label, tone }) {
  const colors = {
    red:    'bg-blue-50 border-blue-200 text-blue-900',
    orange: 'bg-amber-50 border-amber-200 text-amber-800',
    green:  'bg-emerald-50 border-emerald-200 text-emerald-700',
    gray:   'bg-neutral-50 border-neutral-200 text-neutral-600',
  }[tone] ?? 'bg-neutral-50 border-neutral-200 text-neutral-600'
  return (
    <div className={`rounded-lg md:rounded-md border px-2.5 py-1.5 text-xs font-medium ${colors}`}>
      {label}
    </div>
  )
}

export default function DecisionTab({ result, onGoToThrombolysis, onGoToThrombectomy }) {
  if (!result) return (
    <div className="flex items-center justify-center min-h-[200px] text-neutral-400 text-sm">
      Sin resultado disponible
    </div>
  )

  const { thrombolyze, icon, title, body, drug, absoluteCI, relativeCI, absoluteDetails, relativeDetails } = result

  return (
    <div className="px-4 pb-4 animate-slide-down md:px-0">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start xl:gap-5">
        <div className="space-y-4">
          <div className={`bg-white rounded-2xl border-2 md:rounded-lg md:border ${borderMap[icon] ?? 'border-neutral-200'} p-4 md:p-4 lg:p-5`}>
            <div className={`w-11 h-11 md:w-9 md:h-9 ${iconBgMap[icon] ?? 'bg-neutral-100'} rounded-xl md:rounded-lg flex items-center justify-center mx-auto md:mx-0 mb-2.5`}>
              <DecisionIcon icon={icon} />
            </div>
            <h2 className="text-neutral-800 text-base lg:text-lg font-bold text-center md:text-left mb-1.5">{title}</h2>
            <p className="text-sm text-neutral-500 text-center md:text-left leading-relaxed max-w-2xl mx-auto md:mx-0">{body}</p>
          </div>

          {thrombolyze === true && drug && (
            <div className="rounded-2xl md:rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-2">Fármaco recomendado</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl md:rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <Syringe size={18} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800">
                    {drug === 'tnk' ? 'TNK - Tenecteplase' : 'rtPA - Alteplase'}
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {drug === 'tnk' ? 'Bolo único IV · 0.25 mg/kg (máx 25 mg)' : 'Bolo + infusión · 0.9 mg/kg (máx 90 mg)'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-3">
                Ir al tab <strong>Trombolisis</strong> para calcular la dosis por peso.
              </p>
            </div>
          )}

          {absoluteCI && absoluteDetails.length > 0 && (
            <div className="rounded-2xl md:rounded-lg bg-blue-50 border border-blue-200 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-2">Contraindicaciones absolutas</p>
              <div className="space-y-1.5">
                {absoluteDetails.map((d) => <DetailChip key={d} label={d} tone="red" />)}
              </div>
            </div>
          )}

          {relativeCI && relativeDetails.length > 0 && (
            <div className="rounded-2xl md:rounded-lg bg-amber-50 border border-amber-200 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">Contraindicaciones relativas</p>
              <div className="space-y-1.5">
                {relativeDetails.map((d) => <DetailChip key={d} label={d} tone="orange" />)}
              </div>
              {thrombolyze === true && (
                <p className="text-xs text-amber-700 mt-3 font-medium">
                  Requiere interconsulta. Valorar riesgo/beneficio individual.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 lg:sticky lg:top-4 md:rounded-lg md:border md:border-neutral-200 md:bg-white md:p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1">Próximos pasos</p>
          {thrombolyze === true && (
            <button type="button" onClick={onGoToThrombolysis}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl md:rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white">
              <Syringe size={18} />
              <div className="text-left">
                <p className="text-sm font-bold">Ir a Trombolisis</p>
                <p className="text-xs text-emerald-200">Calcular dosis y registrar administración</p>
              </div>
            </button>
          )}
          <button type="button" onClick={onGoToThrombectomy}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl md:rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all text-white">
            <Zap size={18} />
            <div className="text-left">
              <p className="text-sm font-bold">Ir a Trombectomía</p>
              <p className="text-xs text-blue-200">
                {thrombolyze === true ? 'Evaluar OGV en paralelo' : 'Evaluar trombectomía mecánica'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
