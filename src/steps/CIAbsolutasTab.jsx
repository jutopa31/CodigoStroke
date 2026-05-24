import { useState } from 'react'
import { ShieldCheck, Info, ChevronDown, CheckCircle2, AlertTriangle } from 'lucide-react'

const RED_CONTRAS = [
  { id: 'ct_hypodensity',    short: 'TC: hipodensidad extensa',     label: 'TC con hipodensidad extensa',                        sub: 'Hipodensidad clara responsable de los síntomas, mayor que la sustancia blanca contralateral' },
  { id: 'ct_hemorrhage',     short: 'TC: hemorragia intracraneal',  label: 'TC con hemorragia intracraneal aguda',               sub: 'Cualquier hemorragia intracraneal aguda en neuroimagen' },
  { id: 'tce_14d',           short: 'TCE moderado-grave < 14 días', label: 'TCE moderado a grave en los últimos 14 días',        sub: '> 30 min de pérdida de consciencia y GCS < 13, O hemorragia/contusión/fractura en neuroimagen' },
  { id: 'neurosurgery_14d',  short: 'Neurocirugía < 14 días',       label: 'Neurocirugía o cirugía espinal en los últimos 14 días', sub: 'Cirugía intracraneal o raquimedular reciente' },
  { id: 'spinal_cord',       short: 'Lesión medular aguda < 3m',    label: 'Lesión medular aguda en los últimos 3 meses',        sub: '' },
  { id: 'axial_tumor',       short: 'Neoplasia intra-axial',        label: 'Neoplasia intracraneal intra-axial',                 sub: '' },
  { id: 'endocarditis',      short: 'Endocarditis infecciosa',      label: 'Endocarditis infecciosa activa',                     sub: '' },
  { id: 'coagulopathy',      short: 'Coagulopatía severa',          label: 'Coagulopatía severa o trombocitopenia',              sub: 'Plaq. < 100.000/mm³ · RIN > 1.7 · KPTT > 40s · TP > 15s' },
  { id: 'aortic_dissection', short: 'Disección de arco aórtico',    label: 'Disección de arco aórtico conocida o sospechada',   sub: '' },
  { id: 'aria',              short: 'ARIA',                         label: 'Anomalías de imagen relacionadas con amiloide (ARIA)', sub: 'Inmunoterapia anti-amiloide o ARIA conocida — evitar trombolisis IV' },
]

function ContraRow({ item, value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const isYes = value === true
  const isNo  = value === false

  return (
    <div className={`rounded-lg border transition-all ${
      isYes ? 'bg-blue-900/8 border-blue-700/40' : isNo ? 'bg-slate-50 border-slate-200' : 'border-neutral-150 bg-white'
    }`}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Label */}
        <p className={`flex-1 min-w-0 text-xs font-semibold leading-snug truncate ${isYes ? 'text-blue-900' : 'text-neutral-700'}`}>
          {item.short}
        </p>

        {/* Info toggle */}
        <button type="button" onClick={() => setExpanded(v => !v)}
          className={`shrink-0 p-1 rounded-full transition-colors ${expanded ? 'bg-neutral-100 text-neutral-600' : 'text-neutral-300 hover:text-neutral-500'}`}>
          {expanded ? <ChevronDown size={11} /> : <Info size={11} />}
        </button>

        {/* NO | SÍ toggle */}
        <div className="flex shrink-0 rounded-md overflow-hidden border border-neutral-200 text-[11px] font-bold">
          <button type="button" onClick={() => onChange(false)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isNo ? 'bg-slate-600 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
            NO
          </button>
          <div className="w-px bg-neutral-200" />
          <button type="button" onClick={() => onChange(true)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isYes ? 'bg-blue-900 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
            SÍ
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-2 border-t border-neutral-100 animate-fade-in">
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 mt-1.5 text-xs text-blue-900">
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="opacity-75 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CIAbsolutasTab
 *
 * @param {{ answers: Record<string,boolean>, allAnswered: boolean, hasAbsolute: boolean }} initialState
 * @param {(state) => void} onUpdate  — called on every toggle (auto-save)
 */
export default function CIAbsolutasTab({ initialState, onUpdate }) {
  const [answers, setAnswers] = useState(() => initialState?.answers ?? {})

  const allAnswered = RED_CONTRAS.every((c) => answers[c.id] !== undefined)
  const hasAbsolute = Object.values(answers).some(Boolean)
  const answered    = Object.values(answers).filter((v) => v !== undefined).length

  function set(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    const allNow = RED_CONTRAS.every((c) => next[c.id] !== undefined)
    const hasAbs = Object.values(next).some(Boolean)
    onUpdate?.({ answers: next, allAnswered: allNow, hasAbsolute: hasAbs })
  }

  function markAllNo() {
    const allNo = Object.fromEntries(RED_CONTRAS.map((c) => [c.id, false]))
    setAnswers(allNo)
    onUpdate?.({ answers: allNo, allAnswered: true, hasAbsolute: false })
  }

  return (
    <div className="px-4 pb-6 space-y-2.5 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
        <AlertTriangle size={16} className="text-blue-900 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-900">Contraindicaciones absolutas</p>
          <p className="text-xs text-blue-700 mt-0.5">Cualquier <strong>SÍ</strong> excluye trombolisis IV</p>
        </div>
        {allAnswered && (
          <div className="ml-auto shrink-0">
            {hasAbsolute
              ? <span className="text-xs font-bold text-blue-900 bg-blue-100 rounded-lg px-2 py-1">CI presente</span>
              : <CheckCircle2 size={18} className="text-emerald-500" />
            }
          </div>
        )}
      </div>

      {/* Mark all NO shortcut */}
      <button type="button" onClick={markAllNo}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-200 py-2 text-xs font-semibold text-neutral-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-600 active:scale-[0.98] md:w-auto md:px-4">
        <ShieldCheck size={14} /> Ninguna presente — marcar las {RED_CONTRAS.length} como NO
      </button>

      {/* List */}
      <div className="grid gap-1.5 xl:grid-cols-2">
        {RED_CONTRAS.map((item) => (
          <ContraRow key={item.id} item={item} value={answers[item.id] ?? null}
            onChange={(val) => set(item.id, val)} />
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(answered / RED_CONTRAS.length) * 100}%` }} />
        </div>
        <span className="text-[10px] text-neutral-400 font-medium shrink-0">{answered}/{RED_CONTRAS.length}</span>
      </div>

      {/* Alert banner when absolute CI found */}
      {hasAbsolute && (
        <div className="px-3 py-2.5 rounded-xl bg-blue-900/10 border border-blue-800/50 animate-fade-in">
          <p className="text-sm font-bold text-blue-900">Contraindicación absoluta presente</p>
          <p className="text-xs text-blue-800 mt-0.5 leading-snug">
            No indicar trombolisis IV. Evaluar trombectomía mecánica directa.
          </p>
        </div>
      )}
    </div>
  )
}
