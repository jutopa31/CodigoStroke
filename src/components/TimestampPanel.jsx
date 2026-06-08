import { Activity, Scan, Syringe, Radio } from 'lucide-react'

const ITEMS = [
  { key: 'codeStart',    label: 'Código activado',      Icon: Activity },
  { key: 'ct',           label: 'TC solicitada',         Icon: Scan },
  { key: 'thrombolytic', label: 'Trombolisis iniciada',  Icon: Syringe },
  { key: 'hemo',         label: 'Hemodinamia',           Icon: Radio },
]

function fmt(date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TimestampPanel({ codeStart, ct, thrombolytic, hemo, variant = 'desktop' }) {
  const values = { codeStart, ct, thrombolytic, hemo }
  const hasAny = Object.values(values).some(Boolean)

  if (variant === 'mobile') {
    if (!hasAny) return null
    return (
      <div className="flex gap-2 overflow-x-auto px-12 pb-2.5" style={{ scrollbarWidth: 'none' }}>
        {ITEMS.map(({ key, label, Icon }) => {
          const time = values[key]
          if (!time) return null
          return (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stroke-bg border border-white/20 whitespace-nowrap flex-shrink-0"
            >
              <Icon size={10} className="text-brand-200" strokeWidth={2} />
              <span className="text-[10px] font-medium text-brand-100">{label}</span>
              <span className="text-[10px] font-mono font-semibold text-white">{fmt(time)}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-stroke-line bg-stroke-navy overflow-hidden">
      <div className="px-3 py-2 border-b border-stroke-line">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stroke-textMuted">Tiempos registrados</p>
      </div>
      <div className="p-2 space-y-1">
        {ITEMS.map(({ key, label, Icon }) => {
          const time = values[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${time ? 'bg-stroke-bg' : ''}`}
            >
              <Icon size={13} className={`flex-shrink-0 ${time ? 'text-stroke-text' : 'text-stroke-textMuted'}`} strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium leading-none mb-0.5 ${time ? 'text-stroke-textMuted' : 'text-stroke-textMuted'}`}>
                  {label}
                </p>
                <p className={`text-xs font-mono font-semibold leading-none ${time ? 'text-neutral-950' : 'text-stroke-textMuted'}`}>
                  {time ? fmt(time) : '-'}
                </p>
              </div>
              {time && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
