import { User, Clock, Activity, Scan, Shield, CheckCircle2, Syringe, Zap, Heart } from 'lucide-react'

const PHASE1_TABS = [
  { id: 'paciente',          label: 'Paciente',     Icon: User },
  { id: 'tiempo',            label: 'Tiempo',       Icon: Clock },
  { id: 'clinica',           label: 'Clínica',      Icon: Activity },
  { id: 'imagenes',          label: 'Imágenes',     Icon: Scan },
  { id: 'contraindicaciones',label: 'Contrain.',    Icon: Shield },
]

const PHASE2_TABS = [
  { id: 'decision',     label: 'Decisión',    Icon: CheckCircle2 },
  { id: 'trombolisis',  label: 'Trombolisis', Icon: Syringe },
  { id: 'trombectomia', label: 'Trombect.',   Icon: Zap },
  { id: 'cuidados',     label: 'Cuidados',    Icon: Heart },
]

function TabItem({ tab, active, completion, onClick }) {
  const { id, label, Icon } = tab

  const statusRing = completion === 'complete'
    ? 'ring-2 ring-emerald-400'
    : completion === 'partial'
      ? 'ring-2 ring-amber-400'
      : ''

  const iconBg = active
    ? 'bg-white/25 text-white'
    : completion === 'complete'
      ? 'bg-emerald-100 text-emerald-700'
      : completion === 'partial'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-neutral-100 text-neutral-400'

  const labelColor = active
    ? 'text-white font-semibold'
    : completion === 'complete'
      ? 'text-emerald-700 font-medium'
      : completion === 'partial'
        ? 'text-amber-600 font-medium'
        : 'text-neutral-400'

  const containerBg = active
    ? 'bg-white/15'
    : 'hover:bg-white/8'

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all shrink-0 ${containerBg}`}
      aria-selected={active}
    >
      <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${iconBg} ${statusRing}`}>
        <Icon size={15} strokeWidth={2} />
        {completion === 'complete' && !active && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
      <span className={`text-[9px] leading-none whitespace-nowrap transition-all ${labelColor}`}>
        {label}
      </span>
    </button>
  )
}

export default function TabBar({ phase, activeTab, onTabChange, completion = {} }) {
  const tabs = phase === 'pre' ? PHASE1_TABS : PHASE2_TABS

  // Phase 2: hide Trombolisis tab if decision says no thrombolysis
  const visibleTabs = phase === 'post'
    ? tabs.filter((t) => {
        if (t.id === 'trombolisis') return completion.showTrombolisis !== false
        return true
      })
    : tabs

  const phaseLabel = phase === 'pre' ? 'EVALUACIÓN' : 'TRATAMIENTO'
  const phaseColor = phase === 'pre' ? 'text-white/50' : 'text-emerald-200/70'

  return (
    <div className="flex flex-col shrink-0">
      {/* Phase label */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
        <div className="h-px flex-1 bg-white/15" />
        <span className={`text-[9px] font-bold tracking-widest uppercase ${phaseColor}`}>
          {phaseLabel}
        </span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      {/* Tabs row */}
      <div className="flex items-center gap-0.5 px-2 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {visibleTabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            completion={completion[tab.id] ?? 'empty'}
            onClick={onTabChange}
          />
        ))}
      </div>
    </div>
  )
}
