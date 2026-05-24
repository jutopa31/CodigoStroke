import { User, Clock, Activity, Scan, ShieldAlert, Shield, CheckCircle2, Syringe, Zap, Heart } from 'lucide-react'

const PHASE1_TABS = [
  { id: 'paciente',  label: 'Paciente',   Icon: User },
  { id: 'tiempo',    label: 'Tiempo',     Icon: Clock },
  { id: 'clinica',   label: 'NIHSS',      Icon: Activity },
  { id: 'imagenes',  label: 'Imagen',     Icon: Scan },
  { id: 'ci_abs',    label: 'CI Abs.',    Icon: ShieldAlert },
  { id: 'ci_rel',    label: 'CI Rel.',    Icon: Shield },
]

const PHASE2_TABS = [
  { id: 'decision',      label: 'Decisión',    Icon: CheckCircle2 },
  { id: 'trombolisis',   label: 'Trombolisis', Icon: Syringe },
  { id: 'cuidados',      label: 'Cuidados',    Icon: Heart },
  { id: 'trombectomia',  label: 'Trombect.',   Icon: Zap },
]

function TabItem({ tab, active, completion, onClick }) {
  const { id, label, Icon } = tab

  const iconBg = active
    ? 'bg-white/25 text-white md:bg-neutral-950 md:text-white'
    : completion === 'complete'
      ? 'bg-emerald-100 text-emerald-700 md:bg-emerald-50 md:text-emerald-700'
      : completion === 'partial'
        ? 'bg-amber-100 text-amber-600 md:bg-amber-50 md:text-amber-700'
        : 'bg-white/10 text-white/40 md:bg-neutral-100 md:text-neutral-400'

  const ring = completion === 'complete' && !active
    ? 'ring-2 ring-emerald-400 md:ring-0'
    : completion === 'partial' && !active
      ? 'ring-2 ring-amber-400 md:ring-0'
      : ''

  const labelColor = active
    ? 'text-white font-semibold md:text-neutral-950'
    : completion === 'complete'
      ? 'text-emerald-200 font-medium md:text-neutral-700'
      : completion === 'partial'
        ? 'text-amber-200 md:text-neutral-700'
        : 'text-white/40 md:text-neutral-400'

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-selected={active}
      className={`flex min-w-[4.4rem] flex-col items-center gap-1.5 px-2.5 py-2.5 rounded-xl transition-all shrink-0
        md:min-w-0 md:flex-row md:gap-2 md:rounded-lg md:border md:px-3 md:py-2 ${
          active
            ? 'bg-white/15 md:border-neutral-300 md:bg-white'
            : 'hover:bg-white/8 md:border-transparent md:hover:border-neutral-200 md:hover:bg-white'
        }`}
    >
      <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all md:h-7 md:w-7 md:rounded-md ${iconBg} ${ring}`}>
        <Icon size={16} strokeWidth={2} />
        {completion === 'complete' && !active && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm md:h-2 md:w-2 md:top-0 md:right-0 md:translate-x-1/2 md:-translate-y-1/2">
            <svg className="md:hidden" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
      <span className={`text-[10px] leading-none whitespace-nowrap md:text-xs md:leading-4 ${labelColor}`}>{label}</span>
    </button>
  )
}

export default function TabBar({ phase, activeTab, onTabChange, completion = {} }) {
  const tabs = phase === 'pre' ? PHASE1_TABS : PHASE2_TABS

  const visibleTabs = phase === 'post'
    ? tabs.filter((t) => !(t.id === 'trombolisis' && completion.showTrombolisis === false))
    : tabs

  const phaseLabel = phase === 'pre' ? 'Evaluación' : 'Tratamiento'
  const phaseColor = phase === 'pre' ? 'text-white/50' : 'text-emerald-200/70'

  return (
    <div className="relative flex flex-col shrink-0 md:flex-row md:items-center md:justify-between md:gap-4">
      <div className="flex items-center gap-2 px-4 pt-2 pb-0.5 md:px-0 md:py-0">
        <div className="h-px flex-1 bg-white/15 md:hidden" />
        <span className={`text-[8px] font-bold tracking-[0.18em] uppercase md:text-[10px] md:tracking-[0.14em] md:text-neutral-400 ${phaseColor}`}>
          {phaseLabel}
        </span>
        <div className="h-px flex-1 bg-white/15 md:hidden" />
      </div>

      <div
        className="flex items-center gap-1 px-2 pb-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0,black_0.75rem,black_85%,transparent_100%)]
          md:gap-1.5 md:px-0 md:pb-0 md:[mask-image:none]"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
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
