import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Info, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'

const ANTICOAG_TYPES = [
  { id: 'doac',         label: 'DOAC' },
  { id: 'heparina',    label: 'Heparina' },
  { id: 'acenocumarol',label: 'Acenocumarol' },
]

const RED_CONTRAS = [
  { id: 'prior_ich',         short: 'HIC previa o actual',        label: 'Hemorragia intracraneal previa o actual',       sub: 'Cualquier antecedente de HIC' },
  { id: 'large_infarct',    short: 'Infarto extenso TC',          label: 'Infarto extenso en TC',                        sub: 'ASPECTS < 3 o mas de 1/3 del territorio de ACM' },
  { id: 'tce',              short: 'TCE / cirugía reciente',      label: 'TCE grave o cirugia intracraneal reciente',    sub: 'En los ultimos 3 meses' },
  { id: 'axial_tumor',      short: 'Tumor intra-axial',           label: 'Tumor intra-axial',                            sub: 'Neoplasia cerebral intraparenquimatosa' },
  { id: 'coagulopathy',     short: 'Coagulopatia severa',         label: 'Coagulopatia severa',                          sub: 'RIN > 1.7 / KPTT > 40 / Plaquetas < 100.000' },
  { id: 'aortic_dissection',short: 'Diseccion aortica',           label: 'Diseccion aortica',                            sub: 'Sospecha o confirmada' },
  { id: 'endocarditis',     short: 'Endocarditis activa',         label: 'Endocarditis infecciosa activa',               sub: '' },
]

const ORANGE_CONTRAS = [
  { id: 'prev_stroke',       short: 'ACV isquemico < 3 meses',    label: 'ACV isquemico en los ultimos 3 meses',         sub: '' },
  { id: 'major_surgery',    short: 'Cirugia mayor < 2 semanas',   label: 'Cirugia mayor o trauma grave reciente',        sub: 'En las ultimas 2 semanas' },
  { id: 'acod',             short: 'ACODs < 48h',                 label: 'ACODs en las ultimas 48h',                    sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban' },
  { id: 'gi_bleed',         short: 'Sangrado GI/GU < 21 dias',    label: 'Sangrado GI/GU reciente',                     sub: 'En los ultimos 21 dias' },
  { id: 'arterial_puncture',short: 'Puncion arterial',            label: 'Puncion arterial reciente en sitio no compresible', sub: '' },
  { id: 'avm',              short: 'MAV conocida',                label: 'MAV conocida',                                sub: 'Malformacion arteriovenosa' },
  { id: 'aneurysm',         short: 'Aneurisma > 10 mm',           label: 'Aneurisma no roto conocido > 10 mm',          sub: '' },
  { id: 'ic_dissection',    short: 'Diseccion IC',                label: 'Diseccion arterial intracraneal',             sub: '' },
]

// Compact segmented NO|SÍ toggle
function ContraRow({ item, value, onChange, color, expanded, onToggleExpand }) {
  const isYes = value === true
  const isNo  = value === false
  const rowBg = isYes
    ? color === 'red' ? 'bg-blue-900/10 border-blue-800/40' : 'bg-amber-50 border-amber-300'
    : isNo ? 'bg-slate-50 border-slate-200' : 'border-gray-100'

  return (
    <div className={`rounded-xl border-2 transition-all ${rowBg}`}>
      <div className="flex items-center gap-2 px-3 py-2">
        <p className={`text-xs font-semibold leading-snug flex-1 min-w-0 ${
          isYes ? (color === 'red' ? 'text-blue-900' : 'text-amber-800') : 'text-gray-700'
        }`}>
          {item.short}
        </p>

        <button
          type="button"
          onClick={onToggleExpand}
          className={`shrink-0 p-0.5 rounded-full transition-colors ${
            expanded
              ? (color === 'red' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-500')
              : 'text-gray-300 hover:text-gray-500'
          }`}
        >
          {expanded ? <ChevronDown size={12} /> : <Info size={12} />}
        </button>

        <div className="flex shrink-0 rounded-lg overflow-hidden border border-neutral-200 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-2.5 py-1.5 transition-all active:scale-95 ${
              isNo ? 'bg-slate-600 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            NO
          </button>
          <div className="w-px bg-neutral-200 shrink-0" />
          <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-2.5 py-1.5 transition-all active:scale-95 ${
              isYes
                ? color === 'red' ? 'bg-blue-900 text-white' : 'bg-amber-500 text-white'
                : 'bg-white text-neutral-400 hover:bg-neutral-50'
            }`}
          >
            SÍ
          </button>
        </div>
      </div>

      {expanded && (
        <div className={`px-3 pb-2.5 animate-fade-in ${
          color === 'red' ? 'border-t border-blue-100' : 'border-t border-amber-100'
        }`}>
          <div className={`rounded-lg px-3 py-2 mt-1 text-xs leading-snug ${
            color === 'red' ? 'bg-blue-50 text-blue-900' : 'bg-amber-50 text-amber-700'
          }`}>
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="opacity-75 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContraindicationsStep({ onConfirm, onAnticoagChange, isCollapsed = false, initialAnticoag = null }) {
  const [redAnswers, setRedAnswers]       = useState({})
  const [orangeAnswers, setOrangeAnswers] = useState({})
  const [expandedRow, setExpandedRow]     = useState(null)
  // 'red' = absolute view, 'orange' = relative view
  const [view, setView] = useState('red')
  const [anticoag, setAnticoag] = useState(initialAnticoag ?? { active: null, type: '' })

  const hasRed    = Object.values(redAnswers).some(Boolean)
  // anticoag activa cuenta como contraindicación relativa
  const hasOrange = Object.values(orangeAnswers).some(Boolean) || anticoag.active === true

  const anticoagAnswered = anticoag.active === false || (anticoag.active === true && anticoag.type !== '')
  const allRedAnswered    = RED_CONTRAS.every((c) => redAnswers[c.id]    !== undefined)
  const allOrangeAnswered = ORANGE_CONTRAS.every((c) => orangeAnswers[c.id] !== undefined)
  const allAnswered       = allRedAnswered && allOrangeAnswered && anticoagAnswered

  function handleAnticoagAnswer(active) {
    const next = { active, type: '' }
    setAnticoag(next)
    if (!active) onAnticoagChange?.({ active: false, type: '' })
  }

  function handleAnticoagType(typeId) {
    const next = { active: true, type: typeId }
    setAnticoag(next)
    onAnticoagChange?.(next)
  }

  // Auto-advance red→orange when all red answered with NO and anticoag answered
  useEffect(() => {
    if (view === 'red' && allRedAnswered && !hasRed && anticoagAnswered) {
      const t = setTimeout(() => setView('orange'), 350)
      return () => clearTimeout(t)
    }
  }, [view, allRedAnswered, hasRed, anticoagAnswered])

  // Auto-confirm on orange when all NO, no red, and no anticoag active
  useEffect(() => {
    if (view === 'orange' && allOrangeAnswered && !hasOrange && !hasRed) {
      const t = setTimeout(() => confirm(false), 350)
      return () => clearTimeout(t)
    }
  }, [view, allOrangeAnswered, hasOrange, hasRed])

  if (isCollapsed && allAnswered) {
    const summary = hasRed
      ? `Contraindicación absoluta: ${RED_CONTRAS.find((c) => redAnswers[c.id])?.short ?? '—'}`
      : hasOrange ? 'Contraindicación relativa presente' : 'Sin contraindicaciones'
    return <CollapsedStep title="Contraindicaciones">{summary}</CollapsedStep>
  }

  function setRed(id, val) {
    setRedAnswers((a) => ({ ...a, [id]: val }))
    // If YES found, still advance to orange so user can complete relatives
    if (val && view === 'red') setTimeout(() => setView('orange'), 400)
  }

  function setOrange(id, val) {
    setOrangeAnswers((a) => ({ ...a, [id]: val }))
  }

  function markAllNoRed() {
    const allNo = Object.fromEntries(RED_CONTRAS.map((c) => [c.id, false]))
    setRedAnswers(allNo)
    // useEffect will auto-advance to orange
  }

  function markAllNoOrange() {
    const allNo = Object.fromEntries(ORANGE_CONTRAS.map((c) => [c.id, false]))
    setOrangeAnswers(allNo)
    // useEffect will auto-confirm if no red either
  }

  function confirm(decidedNotToThrombolyze) {
    onConfirm({
      red: redAnswers,
      orange: orangeAnswers,
      hasAbsolute: hasRed,
      hasRelative: hasOrange,
      decidedNotToThrombolyze,
    })
  }

  // ── VIEW: Absolute contraindications ──────────────────────────────────────
  if (view === 'red') {
    return (
      <div className="px-4 pb-4">
        <StepCard step="6" title="Contraindicaciones absolutas" accent="blue">

          {/* ── Anticoagulación — arriba, separada ───────────────────────── */}
          <div className="mb-4 pb-4 border-b-2 border-dashed border-neutral-200">
            <div className="flex items-center gap-2 mb-2.5">
              <ShieldAlert size={14} className="text-brand-600 shrink-0" />
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wide">Anticoagulación</p>
            </div>
            <p className="text-xs text-neutral-600 mb-2.5">¿El paciente recibe anticoagulación?</p>

            <div className="flex shrink-0 rounded-lg overflow-hidden border border-neutral-200 text-[11px] font-bold w-fit mb-2.5">
              <button
                type="button"
                onClick={() => handleAnticoagAnswer(false)}
                className={`px-4 py-2 transition-all active:scale-95 ${
                  anticoag.active === false ? 'bg-slate-600 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'
                }`}
              >
                NO
              </button>
              <div className="w-px bg-neutral-200 shrink-0" />
              <button
                type="button"
                onClick={() => handleAnticoagAnswer(true)}
                className={`px-4 py-2 transition-all active:scale-95 ${
                  anticoag.active === true ? 'bg-amber-500 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'
                }`}
              >
                SÍ
              </button>
            </div>

            {anticoag.active === true && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Tipo — toca para confirmar</p>
                <div className="grid grid-cols-3 gap-2">
                  {ANTICOAG_TYPES.map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleAnticoagType(id)}
                      className={`flex items-center justify-center rounded-xl border py-2.5 text-xs font-semibold transition-all active:scale-[0.97] ${
                        anticoag.type === id
                          ? 'border-amber-400 bg-amber-100 text-amber-800'
                          : 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {anticoag.type && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex items-start gap-2 animate-fade-in">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                    <p className="text-xs text-amber-700 leading-snug">
                      Contraindicación relativa. Esperar laboratorio según droga.
                    </p>
                  </div>
                )}
              </div>
            )}

            {anticoag.active === false && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 animate-fade-in">
                <p className="text-xs text-emerald-600">Sin anticoagulación activa.</p>
              </div>
            )}
          </div>
          {/* ─────────────────────────────────────────────────────────────── */}

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-blue-900" />
              <div className="h-1.5 w-8 rounded-full bg-neutral-200" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">1 de 2</span>
          </div>

          {/* Continuar button — top so no scroll needed */}
          <button
            type="button"
            onClick={() => setView('orange')}
            disabled={!allRedAnswered || !anticoagAnswered}
            className="w-full flex items-center justify-center gap-2 mb-3 py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 hover:bg-brand-700 text-white"
          >
            Continuar — relativas <ChevronRight size={16} />
          </button>

          <p className="text-xs text-neutral-500 mb-3">
            Cualquier <strong className="text-blue-900">SÍ</strong> bloquea la trombolisis IV. Tocá ⓘ para detalles.
          </p>

          <button
            type="button"
            onClick={markAllNoRed}
            className="w-full flex items-center justify-center gap-2 mb-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 active:scale-[0.98] transition-all"
          >
            <ShieldCheck size={14} />
            Ninguna presente — marcar todas NO →
          </button>

          <div className="space-y-1.5">
            {RED_CONTRAS.map((item) => (
              <ContraRow
                key={item.id}
                item={item}
                value={redAnswers[item.id] ?? null}
                onChange={(val) => setRed(item.id, val)}
                color="red"
                expanded={expandedRow === item.id}
                onToggleExpand={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
              />
            ))}
          </div>

          {hasRed && (
            <div className="mt-3 bg-blue-900/10 border-2 border-blue-800/50 rounded-xl px-4 py-3 animate-fade-in">
              <p className="text-sm font-bold text-blue-900">Contraindicación absoluta presente</p>
              <p className="text-xs text-blue-800 mt-1">No indicar trombolisis IV con rtPA ni TNK.</p>
            </div>
          )}
        </StepCard>
      </div>
    )
  }

  // ── VIEW: Relative contraindications ──────────────────────────────────────
  return (
    <div className="px-4 pb-4">
      <StepCard step="" title="Contraindicaciones relativas" accent="orange">
        {/* Progress + back */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-neutral-200" />
              <div className="h-1.5 w-8 rounded-full bg-amber-400" />
            </div>
            <span className="text-[10px] text-neutral-400 font-medium">2 de 2</span>
          </div>
          <button
            type="button"
            onClick={() => setView('red')}
            className="text-[10px] text-brand-500 font-semibold hover:underline"
          >
            ← Absolutas
          </button>
        </div>

        {/* Submit actions — top so no scroll needed */}
        <div className="mb-3 space-y-2">
          {allOrangeAnswered ? (
            <>
              {hasOrange && !hasRed ? (
                <>
                  <button
                    type="button"
                    onClick={() => confirm(false)}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                  >
                    Trombolizar con precaución <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => confirm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                  >
                    No trombolizar — Evaluar OGV <ChevronRight size={16} />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => confirm(hasRed)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
                >
                  {hasRed ? 'Registrar — Evaluar OGV' : 'Registrar y continuar'} <ChevronRight size={16} />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              disabled
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-neutral-100 text-neutral-400 cursor-not-allowed"
            >
              Responde todas las contraindicaciones relativas
            </button>
          )}
        </div>

        {/* Anticoag summary chip */}
        {anticoag.active === true && anticoag.type && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
            <ShieldAlert size={13} className="text-amber-600 shrink-0" />
            <p className="text-xs font-semibold text-amber-700">
              Anticoagulación activa: {ANTICOAG_TYPES.find(t => t.id === anticoag.type)?.label ?? anticoag.type}
            </p>
          </div>
        )}

        {hasRed && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-blue-900/10 border border-blue-800/30">
            <AlertTriangle size={13} className="text-blue-900 shrink-0" />
            <p className="text-xs font-semibold text-blue-900">Contraindicación absoluta ya registrada</p>
          </div>
        )}

        <p className="text-xs text-neutral-500 mb-3">
          Individualizar riesgo/beneficio. Tocá ⓘ para detalles.
        </p>

        <button
          type="button"
          onClick={markAllNoOrange}
          className="w-full flex items-center justify-center gap-2 mb-3 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 active:scale-[0.98] transition-all"
        >
          <ShieldCheck size={14} />
          Ninguna presente — marcar todas NO
        </button>

        <div className="space-y-1.5">
          {ORANGE_CONTRAS.map((item) => (
            <ContraRow
              key={item.id}
              item={item}
              value={orangeAnswers[item.id] ?? null}
              onChange={(val) => setOrange(item.id, val)}
              color="orange"
              expanded={expandedRow === item.id}
              onToggleExpand={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
            />
          ))}
        </div>

        {hasOrange && !hasRed && (
          <div className="mt-3 bg-amber-50 border-2 border-amber-300 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-sm font-bold text-amber-700">Contraindicación relativa presente</p>
            <p className="text-xs text-amber-600 mt-1">Valorar riesgo/beneficio. Interconsulta antes de proceder.</p>
          </div>
        )}
      </StepCard>
    </div>
  )
}
