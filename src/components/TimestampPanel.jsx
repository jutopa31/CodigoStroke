import { Clock, Scan, Syringe, Radio } from 'lucide-react'

const ITEMS = [
  { key: 'arrival',      label: 'Ingreso',      Icon: Clock },
  { key: 'ct',           label: 'TC',           Icon: Scan },
  { key: 'thrombolytic', label: 'Trombolítico', Icon: Syringe },
  { key: 'angio',        label: 'AngioTAC',     Icon: Radio },
]

function fmt(date) {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TimestampPanel({ arrival, ct, thrombolytic, angio, variant = 'desktop' }) {
  const values = { arrival, ct, thrombolytic, angio }
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
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 whitespace-nowrap flex-shrink-0"
            >
              <Icon size={10} className="text-brand-200" />
              <span className="text-[10px] font-medium text-brand-100">{label}</span>
              <span className="text-[10px] font-mono font-bold text-white">{fmt(time)}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tiempos clave</p>
      </div>
      <div className="p-2 space-y-1">
        {ITEMS.map(({ key, label, Icon }) => {
          const time = values[key]
          return (
            <div
              key={key}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${time ? 'bg-brand-50' : ''}`}
            >
              <Icon size={13} className={`flex-shrink-0 ${time ? 'text-brand-500' : 'text-gray-200'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium leading-none mb-0.5 ${time ? 'text-brand-500' : 'text-gray-300'}`}>
                  {label}
                </p>
                <p className={`text-xs font-mono font-bold leading-none ${time ? 'text-brand-800' : 'text-gray-300'}`}>
                  {time ? fmt(time) : '—'}
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
