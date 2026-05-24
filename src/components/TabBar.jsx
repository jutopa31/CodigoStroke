import { User, Clock, Activity, Scan, ShieldAlert, Shield, CheckCircle2, Syringe, Zap, Heart } from 'lucide-react'

// ─── Phase 1: 6 tabs ────────────────────────────────────────────────────────
const PHASE1_TABS = [
  { id: 'paciente',  label: 'Paciente',   Icon: User },
  { id: 'tiempo',    label: 'Tiempo',     Icon: Clock },
  { id: 'clinica',   label: 'NIHSS',      Icon: Activity },
  { id: 'imagenes',  label: 'Imagen',     Icon: Scan },
  { id: 'ci_abs',    label: 'CI Abs.',    Icon: ShieldAlert },
  { id: 'ci_rel',    label: 'CI Rel.',    Icon: Shield },
]

// ─── Phase 2: 4 tabs ────────────────────────────────────────────────────────
const PHASE2_TABS = [
  { id: 'decision',      label: 'Decisión',   Icon: CheckCircle2 },
  { id: 'trombolisis',   label: 'Trombolisis', Icon: Syringe },
  { id: 'cuidados',      label: 'Cuidados',   Icon: Heart },
  { id: 'trombectomia',  label: 'Trombect.',  Icon: Zap },
]

// ─── Single tab item ─────────────────────────────────────────────────────────

function TabItem({ tab, active, completion, onClick }) {
  const { id, label, Icon } = tab

  // icon container
  const iconBg = active
    ? 'bg-white/25 text-white'
    : completion === 'complete'
      ? 'bg-emerald-100 text-emerald-700'
      : completion === 'partial'
        ? 'bg-amber-100 text-amber-600'
        : 'bg-white/10 text-white/40'

  // ring
  const ring = completion === 'complete' && !active
    ? 'ring-2 ring-emerald-400'
    : completion === 'partial' && !active
      ? 'ring-2 ring-amber-400'
      : ''

  // label
  const labelColor = active
    ? 'text-white font-semibold'
    : completion === 'complete'
      ? 'text-emerald-200 font-medium'
      : completion === 'partial'
        ? 'text-amber-200'
        : 'text-white/40'

  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      aria-selected={active}
      className={`flex min-w-[4.4rem] flex-col items-center gap-1.5 px-2.5 py-2.5 rounded-xl transition-all shrink-0 ${
        active ? 'bg-white/15' : 'hover:bg-white/8'
      }`}
    >
      <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all ${iconBg} ${ring}`}>
        <Icon size={16} strokeWidth={2} />
        {/* Green checkmark badge */}
        {completion === 'complete' && !active && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
      </div>
      <span className={`text-[10px] leading-none whitespace-nowrap ${labelColor}`}>{label}</span>
    </button>
  )
}

// ─── TabBar (exported) ───────────────────────────────────────────────────────

export default function TabBar({ phase, activeTab, onTabChange, completion = {} }) {
  const tabs = phase === 'pre' ? PHASE1_TABS : PHASE2_TABS

  const visibleTabs = phase === 'post'
    ? tabs.filter((t) => !(t.id === 'trombolisis' && completion.showTrombolisis === false))
    : tabs

  const phaseLabel = phase === 'pre' ? 'EVALUACIÓN' : 'TRATAMIENTO'
  const phaseColor = phase === 'pre' ? 'text-white/50' : 'text-emerald-200/70'

  return (
    <div className="relative flex flex-col shrink-0">
      {/* Phase label */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-0.5">
        <div className="h-px flex-1 bg-white/15" />
        <span className={`text-[8px] font-bold tracking-[0.18em] uppercase ${phaseColor}`}>{phaseLabel}</span>
        <div className="h-px flex-1 bg-white/15" />
      </div>

      {/* Scrollable tabs row */}
      <div
        className="flex items-center justify-center gap-1 px-2 pb-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent_0,black_0.75rem,black_85%,transparent_100%)]"
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
