import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, ChevronDown, Info, ShieldCheck, AlertTriangle, ShieldAlert, X } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'

const ANTICOAG_TYPES = [
  { id: 'doac',         label: 'DOAC' },
  { id: 'heparina',    label: 'Heparina' },
  { id: 'acenocumarol',label: 'Acenocumarol' },
]

const RED_CONTRAS = [
  { id: 'ct_hypodensity',   short: 'TC: hipodensidad extensa',    label: 'TC con hipodensidad extensa',                  sub: 'Hipodensidad clara responsable de los sintomas, mayor que la sustancia blanca contralateral' },
  { id: 'ct_hemorrhage',    short: 'TC: hemorragia intracraneal', label: 'TC con hemorragia intracraneal aguda',          sub: 'Cualquier hemorragia intracraneal aguda en neuroimagen' },
  { id: 'tce_14d',          short: 'TCE moderado-grave < 14 dias',label: 'TCE moderado a grave en los ultimos 14 dias',  sub: '> 30 min de perdida de consciencia y GCS < 13, O hemorragia/contusion/fractura en neuroimagen' },
  { id: 'neurosurgery_14d', short: 'Neurocirugia < 14 dias',      label: 'Neurocirugia o cirugia espinal en los ultimos 14 dias', sub: 'Cirugia intracraneal o raquimedular reciente' },
  { id: 'spinal_cord',      short: 'Lesion medular aguda < 3m',   label: 'Lesion medular aguda en los ultimos 3 meses',  sub: '' },
  { id: 'axial_tumor',      short: 'Neoplasia intra-axial',       label: 'Neoplasia intracraneal intra-axial',           sub: '' },
  { id: 'endocarditis',     short: 'Endocarditis infecciosa',     label: 'Endocarditis infecciosa activa',               sub: '' },
  { id: 'coagulopathy',     short: 'Coagulopatia severa',         label: 'Coagulopatia severa o trombocitopenia',        sub: 'Plaquetas < 100.000/mm³ / RIN > 1.7 / KPTT > 40s / TP > 15s' },
  { id: 'aortic_dissection',short: 'Diseccion de arco aortico',   label: 'Diseccion de arco aortico conocida o sospechada', sub: '' },
  { id: 'aria',             short: 'ARIA',                        label: 'Anomalias de imagen relacionadas con amiloide (ARIA)', sub: 'Inmunoterapia anti-amiloide o ARIA conocida. Evitar trombolisis IV.' },
]

const ORANGE_CONTRAS = [
  { id: 'disability',         short: 'Discapacidad preexistente',  label: 'Discapacidad preexistente o fragilidad',       sub: 'Riesgo/beneficio incierto. Determinar en forma individual.' },
  { id: 'doac',               short: 'DOAC < 48h',                 label: 'Exposicion a DOAC en las ultimas 48h',         sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban. Considerar funcion renal, severidad, disponibilidad de agentes revertidores.' },
  { id: 'prev_stroke',        short: 'ACV isquemico < 3 meses',    label: 'ACV isquemico en los ultimos 3 meses',         sub: 'Mayor riesgo de hemorragia intracraneal. Ponderar en funcion del tamano y tiempo del ACV previo.' },
  { id: 'prior_ich',          short: 'HIC previa',                 label: 'Hemorragia intracraneal previa',               sub: 'Mayor riesgo de hemorragia sintomatica. Angiopatia amiloide implica mayor riesgo. Determinar en forma individual.' },
  { id: 'trauma_14d_3m',      short: 'Trauma mayor no-SNC 14d-3m', label: 'Trauma mayor no-SNC entre 14 dias y 3 meses', sub: 'Mayor riesgo de hemorragia sistemica grave. Considerar areas comprometidas y consultar con especialista quirurgico.' },
  { id: 'major_surgery',      short: 'Cirugia mayor no-SNC < 10d', label: 'Cirugia mayor no-SNC en los ultimos 10 dias',  sub: 'Mayor riesgo de dano por trombolisis IV. Considerar area quirurgica y consultar con especialista.' },
  { id: 'gi_bleed',           short: 'Sangrado GI/GU < 21 dias',   label: 'Sangrado GI/GU en los ultimos 21 dias',        sub: 'Considerar si el sangrado fue tratado y el riesgo modificado. Consultar con especialista GI/GU.' },
  { id: 'ic_dissection',      short: 'Diseccion arterial IC',       label: 'Diseccion arterial intracraneal',              sub: 'La seguridad de la trombolisis IV en diseccion intracraneal es desconocida.' },
  { id: 'vascular_malformation', short: 'Malformacion vascular IC', label: 'Malformacion vascular intracraneal conocida',  sub: 'MAV, aneurisma no tratado. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'stemi_3m',           short: 'STEMI reciente < 3 meses',   label: 'STEMI reciente en los ultimos 3 meses',        sub: 'Considerar hemopericardio en STEMI muy reciente. Consultar cardiologia de urgencia.' },
  { id: 'pericarditis',       short: 'Pericarditis aguda',         label: 'Pericarditis aguda',                           sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiologia de urgencia.' },
  { id: 'cardiac_thrombus',   short: 'Trombo AI/VI izquierdo',     label: 'Trombo auricular o ventricular izquierdo conocido', sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiologia de urgencia.' },
  { id: 'malignancy',         short: 'Neoplasia activa sistemica',  label: 'Neoplasia sistemica activa',                   sub: 'Considerar tipo, estadio y complicaciones activas. Consultar oncologia de urgencia.' },
  { id: 'pregnancy',          short: 'Embarazo / puerperio',       label: 'Embarazo o periodo posparto',                  sub: 'Puede considerarse si el beneficio supera el riesgo de sangrado uterino. Consultar obstetricia de urgencia.' },
  { id: 'dural_puncture',     short: 'Puncion dural < 7 dias',     label: 'Puncion dural en los ultimos 7 dias',          sub: 'Puede considerarse incluso si hubo puncion lumbar en los 7 dias previos.' },
  { id: 'arterial_puncture',  short: 'Puncion arterial < 7 dias',  label: 'Puncion arterial en vaso no compresible en los ultimos 7 dias', sub: 'Ej: linea de arteria subclavia. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'tbi_moderate',       short: 'TCE moderado-grave 14d-3m',  label: 'TCE moderado a grave entre 14 dias y 3 meses', sub: 'Considerar tipo y severidad del trauma. Consultar con neurocirugia y cuidados neurocriticos.' },
  { id: 'neurosurgery_14d_3m',short: 'Neurocirugia 14d-3m',        label: 'Neurocirugia o cirugia espinal entre 14 dias y 3 meses', sub: 'Puede considerarse en forma individual.' },
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
  const [showRelativeWarning, setShowRelativeWarning] = useState(false)

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
  <>
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
          {hasOrange && !hasRed ? (
            <button
              type="button"
              onClick={() => setShowRelativeWarning(true)}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              Continuar <ChevronRight size={16} />
            </button>
          ) : allOrangeAnswered ? (
            <button
              type="button"
              onClick={() => confirm(hasRed)}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm"
            >
              {hasRed ? 'Registrar — Evaluar OGV' : 'Registrar y continuar'} <ChevronRight size={16} />
            </button>
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

    {/* ── Relative contraindication warning modal ──────────────────────── */}
    {showRelativeWarning && createPortal(
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
        onClick={() => setShowRelativeWarning(false)}
      >
        <div
          className="w-full max-w-sm rounded-t-3xl bg-white shadow-modal animate-slide-up sm:rounded-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-amber-100 bg-amber-50 px-5 py-4 rounded-t-3xl sm:rounded-t-2xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle size={16} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-800">Contraindicación relativa</h2>
                <p className="mt-0.5 text-xs text-amber-600">Confirmar interconsulta antes de continuar</p>
              </div>
            </div>
            <button
              onClick={() => setShowRelativeWarning(false)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-amber-400 hover:bg-amber-100"
            >
              <X size={15} />
            </button>
          </div>

          {/* Active contraindications list */}
          <div className="px-5 py-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
              Contraindicaciones presentes
            </p>
            {anticoag.active === true && anticoag.type && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                <ShieldAlert size={13} className="text-amber-600 shrink-0" />
                <p className="text-xs font-medium text-amber-800">
                  Anticoagulación activa: {ANTICOAG_TYPES.find(t => t.id === anticoag.type)?.label ?? anticoag.type}
                </p>
              </div>
            )}
            {ORANGE_CONTRAS.filter(c => orangeAnswers[c.id] === true).map(c => (
              <div key={c.id} className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                <p className="text-xs font-medium text-amber-800">{c.label}</p>
              </div>
            ))}
            <p className="pt-2 text-xs text-neutral-500 leading-relaxed">
              Se recomienda realizar una interconsulta con el especialista correspondiente y valorar riesgo/beneficio individual antes de proceder con la trombolisis.
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-neutral-100 px-5 pb-6 pt-4 space-y-2">
            <button
              onClick={() => { setShowRelativeWarning(false); confirm(false) }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98]"
            >
              Trombolisis <ChevronRight size={16} />
            </button>
            <button
              onClick={() => { setShowRelativeWarning(false); confirm(true) }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
            >
              No Trombolisis — buscar OGV <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setShowRelativeWarning(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-[0.98]"
            >
              Atrás
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
  </>
  )
}
