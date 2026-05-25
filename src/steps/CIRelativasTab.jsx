import { useState } from 'react'
import { ShieldCheck, Info, ChevronDown, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react'

const ORANGE_CONTRAS = [
  { id: 'disability',            short: 'Discapacidad preexistente',    label: 'Discapacidad preexistente o fragilidad',                           sub: 'Riesgo/beneficio incierto. Determinar en forma individual.' },
  { id: 'doac',                  short: 'DOAC < 48h',                   label: 'Exposición a DOAC en las últimas 48h',                             sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban. Considerar función renal, severidad, disponibilidad de agentes revertidores.' },
  { id: 'prev_stroke',           short: 'ACV isquémico < 3 meses',      label: 'ACV isquémico en los últimos 3 meses',                             sub: 'Mayor riesgo de hemorragia intracraneal. Ponderar en función del tamaño y tiempo del ACV previo.' },
  { id: 'prior_ich',             short: 'HIC previa',                   label: 'Hemorragia intracraneal previa',                                   sub: 'Mayor riesgo de hemorragia sintomática. Angiopatía amiloide implica mayor riesgo. Determinar en forma individual.' },
  { id: 'trauma_14d_3m',         short: 'Trauma mayor no-SNC 14d–3m',  label: 'Trauma mayor no-SNC entre 14 días y 3 meses',                      sub: 'Mayor riesgo de hemorragia sistémica grave. Consultar con especialista quirúrgico.' },
  { id: 'major_surgery',         short: 'Cirugía mayor no-SNC < 10d',  label: 'Cirugía mayor no-SNC en los últimos 10 días',                      sub: 'Mayor riesgo de daño por trombolisis IV. Considerar área quirúrgica y consultar con especialista.' },
  { id: 'gi_bleed',              short: 'Sangrado GI/GU < 21 días',     label: 'Sangrado GI/GU en los últimos 21 días',                            sub: 'Considerar si el sangrado fue tratado y el riesgo modificado.' },
  { id: 'ic_dissection',         short: 'Disección arterial IC',        label: 'Disección arterial intracraneal',                                  sub: 'La seguridad de la trombolisis IV en disección intracraneal es desconocida.' },
  { id: 'vascular_malformation', short: 'Malformación vascular IC',     label: 'Malformación vascular intracraneal conocida',                      sub: 'MAV, aneurisma no tratado. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'stemi_3m',              short: 'STEMI reciente < 3 meses',     label: 'STEMI reciente en los últimos 3 meses',                            sub: 'Considerar hemopericardio en STEMI muy reciente. Consultar cardiología de urgencia.' },
  { id: 'pericarditis',          short: 'Pericarditis aguda',           label: 'Pericarditis aguda',                                               sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiología de urgencia.' },
  { id: 'cardiac_thrombus',      short: 'Trombo AI/VI izquierdo',       label: 'Trombo auricular o ventricular izquierdo conocido',                sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiología de urgencia.' },
  { id: 'malignancy',            short: 'Neoplasia activa sistémica',   label: 'Neoplasia sistémica activa',                                       sub: 'Considerar tipo, estadio y complicaciones activas. Consultar oncología de urgencia.' },
  { id: 'pregnancy',             short: 'Embarazo / puerperio',         label: 'Embarazo o período posparto',                                      sub: 'Puede considerarse si el beneficio supera el riesgo de sangrado uterino. Consultar obstetricia de urgencia.' },
  { id: 'dural_puncture',        short: 'Punción dural < 7 días',       label: 'Punción dural en los últimos 7 días',                              sub: 'Puede considerarse incluso si hubo punción lumbar en los 7 días previos.' },
  { id: 'arterial_puncture',     short: 'Punción arterial < 7 días',    label: 'Punción arterial en vaso no compresible en los últimos 7 días',    sub: 'Ej: línea de arteria subclavia. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'tbi_moderate',          short: 'TCE moderado-grave 14d–3m',    label: 'TCE moderado a grave entre 14 días y 3 meses',                     sub: 'Consultar con neurocirugía y cuidados neurocríticos.' },
  { id: 'neurosurgery_14d_3m',   short: 'Neurocirugía 14d–3m',         label: 'Neurocirugía o cirugía espinal entre 14 días y 3 meses',           sub: 'Puede considerarse en forma individual.' },
]

const ANTICOAG_TYPES = [
  { id: 'doac',          label: 'DOAC' },
  { id: 'heparina',      label: 'Heparina' },
  { id: 'acenocumarol',  label: 'Acenocumarol' },
]

function ContraRow({ item, value, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const isYes = value === true
  const isNo  = value === false

  return (
    <div className={`rounded-lg border transition-all ${
      isYes ? 'bg-amber-50 border-amber-300' : isNo ? 'bg-slate-50 border-slate-200' : 'border-neutral-150 bg-white'
    }`}>
      <div className="flex items-center gap-2 px-3 py-1.5">
        <p className={`flex-1 min-w-0 text-xs font-semibold leading-snug truncate ${isYes ? 'text-amber-800' : 'text-neutral-700'}`}>
          {item.short}
        </p>
        <button type="button" onClick={() => setExpanded(v => !v)}
          className={`shrink-0 p-1 rounded-full transition-colors ${expanded ? 'bg-neutral-100 text-neutral-600' : 'text-neutral-300 hover:text-neutral-500'}`}>
          {expanded ? <ChevronDown size={11} /> : <Info size={11} />}
        </button>
        <div className="flex shrink-0 rounded-md overflow-hidden border border-neutral-200 text-[11px] font-bold">
          <button type="button" onClick={() => onChange(false)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isNo ? 'bg-slate-600 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
            NO
          </button>
          <div className="w-px bg-neutral-200" />
          <button type="button" onClick={() => onChange(true)}
            className={`px-2.5 py-1 transition-all active:scale-95 ${isYes ? 'bg-amber-500 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
            SÍ
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-2 border-t border-neutral-100 animate-fade-in">
          <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 mt-1.5 text-xs text-amber-800">
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="opacity-75 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * CIRelativasTab
 *
 * @param {{ answers, anticoag, allAnswered, hasRelative }} initialState
 * @param {(state) => void} onUpdate
 * @param {(anticoag) => void} onAnticoagChange — for symptoms.anticoagulation sync
 */
export default function CIRelativasTab({ initialState, onUpdate, onAnticoagChange }) {
  const [answers,  setAnswers]  = useState(() => initialState?.answers  ?? {})
  const [anticoag, setAnticoag] = useState(() => initialState?.anticoag ?? { active: null, type: '' })

  const anticoagAnswered = anticoag.active === false || (anticoag.active === true && anticoag.type !== '')
  const allAnswered      = ORANGE_CONTRAS.every((c) => answers[c.id] !== undefined) && anticoagAnswered
  const hasRelative      = Object.values(answers).some(Boolean) || anticoag.active === true
  const answered         = Object.values(answers).filter((v) => v !== undefined).length + (anticoagAnswered ? 1 : 0)
  const total            = ORANGE_CONTRAS.length + 1 // +1 for anticoag

  function emit(nextAnswers, nextAnticoag) {
    const allNow = ORANGE_CONTRAS.every((c) => nextAnswers[c.id] !== undefined) &&
      (nextAnticoag.active === false || (nextAnticoag.active === true && nextAnticoag.type !== ''))
    const hasRel = Object.values(nextAnswers).some(Boolean) || nextAnticoag.active === true
    onUpdate?.({ answers: nextAnswers, anticoag: nextAnticoag, allAnswered: allNow, hasRelative: hasRel })
  }

  function set(id, val) {
    const next = { ...answers, [id]: val }
    setAnswers(next)
    emit(next, anticoag)
  }

  function setAnticoagActive(active) {
    const next = { active, type: '' }
    setAnticoag(next)
    if (!active) onAnticoagChange?.({ active: false, type: '' })
    emit(answers, next)
  }

  function setAnticoagType(typeId) {
    const next = { active: true, type: typeId }
    setAnticoag(next)
    onAnticoagChange?.(next)
    emit(answers, next)
  }

  function markAllNo() {
    const allNo     = Object.fromEntries(ORANGE_CONTRAS.map((c) => [c.id, false]))
    const noAnticoag = { active: false, type: '' }
    setAnswers(allNo)
    setAnticoag(noAnticoag)
    onAnticoagChange?.({ active: false, type: '' })
    onUpdate?.({ answers: allNo, anticoag: noAnticoag, allAnswered: true, hasRelative: false })
  }

  return (
    <div className="px-4 pb-6 space-y-2.5 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-amber-800">Contraindicaciones relativas</p>
          <p className="text-xs text-amber-700 mt-0.5">Individualizar riesgo/beneficio — interconsulta</p>
        </div>
        {allAnswered && (
          <div className="ml-auto shrink-0">
            {hasRelative
              ? <span className="text-xs font-bold text-amber-800 bg-amber-100 rounded-lg px-2 py-1">Presente</span>
              : <CheckCircle2 size={18} className="text-emerald-500" />
            }
          </div>
        )}
      </div>

      {/* Mark all NO shortcut */}
      <button type="button" onClick={markAllNo}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-200 py-2 text-xs font-semibold text-neutral-500 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-600 active:scale-[0.98] md:w-auto md:px-4">
        <ShieldCheck size={14} /> Ninguna presente — marcar las {ORANGE_CONTRAS.length} como NO
      </button>

      {/* Anticoagulación */}
      <div className={`rounded-lg border transition-all ${
        anticoag.active === true ? 'bg-amber-50 border-amber-300' :
        anticoag.active === false ? 'bg-slate-50 border-slate-200' : 'border-neutral-150 bg-white'
      }`}>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <ShieldAlert size={13} className={`shrink-0 ${anticoag.active === true ? 'text-amber-600' : 'text-neutral-400'}`} />
          <p className={`flex-1 text-xs font-semibold ${anticoag.active === true ? 'text-amber-800' : 'text-neutral-700'}`}>
            Anticoagulación activa
          </p>
          <div className="flex shrink-0 rounded-md overflow-hidden border border-neutral-200 text-[11px] font-bold">
            <button type="button" onClick={() => setAnticoagActive(false)}
              className={`px-2.5 py-1 transition-all active:scale-95 ${anticoag.active === false ? 'bg-slate-600 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
              NO
            </button>
            <div className="w-px bg-neutral-200" />
            <button type="button" onClick={() => setAnticoagActive(true)}
              className={`px-2.5 py-1 transition-all active:scale-95 ${anticoag.active === true ? 'bg-amber-500 text-white' : 'bg-white text-neutral-400 hover:bg-neutral-50'}`}>
              SÍ
            </button>
          </div>
        </div>
        {anticoag.active === true && (
          <div className="px-3 pb-3 border-t border-amber-100 animate-fade-in">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mt-2 mb-1.5">Tipo de anticoagulante</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ANTICOAG_TYPES.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setAnticoagType(id)}
                  className={`py-2 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
                    anticoag.type === id
                      ? 'border-amber-400 bg-amber-100 text-amber-800'
                      : 'border-amber-200 bg-amber-50/60 text-amber-700 hover:bg-amber-100'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        {anticoag.active === false && (
          <div className="px-3 pb-2">
            <p className="text-[10px] text-emerald-600 font-medium animate-fade-in">Sin anticoagulación activa</p>
          </div>
        )}
      </div>

      {/* List */}
      <div className="grid gap-1.5 xl:grid-cols-2">
        {ORANGE_CONTRAS.map((item) => (
          <ContraRow key={item.id} item={item} value={answers[item.id] ?? null}
            onChange={(val) => set(item.id, val)} />
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
          <div className="bg-amber-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <span className="text-[10px] text-neutral-400 font-medium shrink-0">{answered}/{total}</span>
      </div>

      {hasRelative && (
        <div className="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-300 animate-fade-in">
          <p className="text-sm font-bold text-amber-700">Contraindicación relativa presente</p>
          <p className="text-xs text-amber-600 mt-0.5 leading-snug">
            Valorar riesgo/beneficio individual. Se recomienda interconsulta.
          </p>
        </div>
      )}
    </div>
  )
}
