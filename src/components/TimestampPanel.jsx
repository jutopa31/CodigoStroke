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
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 border border-white/20 whitespace-nowrap flex-shrink-0"
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
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      <div className="px-3 py-2 border-b border-neutral-100">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Tiempos registrados</p>
      </div>
      <div className="p-2 space-y-1">
        {ITEMS.map(({ key, label, Icon }) => {
          const time = values[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${time ? 'bg-neutral-50' : ''}`}
            >
              <Icon size={13} className={`flex-shrink-0 ${time ? 'text-neutral-700' : 'text-neutral-300'}`} strokeWidth={2} />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium leading-none mb-0.5 ${time ? 'text-neutral-600' : 'text-neutral-300'}`}>
                  {label}
                </p>
                <p className={`text-xs font-mono font-semibold leading-none ${time ? 'text-neutral-950' : 'text-neutral-300'}`}>
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
