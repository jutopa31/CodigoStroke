import { useState, useRef } from 'react'
import { ChevronRight, ChevronDown, Info, ShieldCheck } from 'lucide-react'
import StepCard from '../components/StepCard'
import { SectionPrompt, SelectableButton } from '../components/GuidedControls'

const RED_CONTRAS = [
  {
    id: 'prior_ich',
    short: 'HIC previa o actual',
    label: 'Hemorragia intracraneal previa o actual',
    sub: 'Cualquier antecedente de HIC',
  },
  {
    id: 'large_infarct',
    short: 'Infarto extenso TC',
    label: 'Infarto extenso en TC',
    sub: 'ASPECTS < 3 o mas de 1/3 del territorio de ACM',
  },
  {
    id: 'tce',
    short: 'TCE / cirugía reciente',
    label: 'TCE grave o cirugia intracraneal reciente',
    sub: 'En los ultimos 3 meses',
  },
  {
    id: 'axial_tumor',
    short: 'Tumor intra-axial',
    label: 'Tumor intra-axial',
    sub: 'Neoplasia cerebral intraparenquimatosa',
  },
  {
    id: 'coagulopathy',
    short: 'Coagulopatia severa',
    label: 'Coagulopatia severa',
    sub: 'RIN > 1.7 / KPTT > 40 / Plaquetas < 100.000',
  },
  {
    id: 'aortic_dissection',
    short: 'Diseccion aortica',
    label: 'Diseccion aortica',
    sub: 'Sospecha o confirmada',
  },
  {
    id: 'endocarditis',
    short: 'Endocarditis activa',
    label: 'Endocarditis infecciosa activa',
    sub: '',
  },
]

const ORANGE_CONTRAS = [
  {
    id: 'prev_stroke',
    short: 'ACV isquemico < 3 meses',
    label: 'ACV isquemico en los ultimos 3 meses',
    sub: '',
  },
  {
    id: 'major_surgery',
    short: 'Cirugia mayor < 2 semanas',
    label: 'Cirugia mayor o trauma grave reciente',
    sub: 'En las ultimas 2 semanas',
  },
  {
    id: 'acod',
    short: 'ACODs < 48h',
    label: 'ACODs en las ultimas 48h',
    sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban',
  },
  {
    id: 'gi_bleed',
    short: 'Sangrado GI/GU < 21 dias',
    label: 'Sangrado GI/GU reciente',
    sub: 'En los ultimos 21 dias',
  },
  {
    id: 'arterial_puncture',
    short: 'Puncion arterial',
    label: 'Puncion arterial reciente en sitio no compresible',
    sub: '',
  },
  {
    id: 'avm',
    short: 'MAV conocida',
    label: 'MAV conocida',
    sub: 'Malformacion arteriovenosa',
  },
  {
    id: 'aneurysm',
    short: 'Aneurisma > 10 mm',
    label: 'Aneurisma no roto conocido > 10 mm',
    sub: '',
  },
  {
    id: 'ic_dissection',
    short: 'Diseccion IC',
    label: 'Diseccion arterial intracraneal',
    sub: '',
  },
]

function ContraRow({ item, value, onChange, color, expanded, onToggleExpand }) {
  const isYes = value === true
  const isNo = value === false
  const tone = color === 'red' ? 'red' : 'orange'
  const rowBg = isYes
    ? color === 'red'
      ? 'bg-red-50 border-red-300'
      : 'bg-amber-50 border-amber-300'
    : isNo
    ? 'bg-slate-50 border-slate-200'
    : 'border-gray-100'

  return (
    <div className={`rounded-xl border-2 transition-all ${rowBg}`}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <p className={`text-sm font-semibold leading-snug truncate ${
            isYes ? (color === 'red' ? 'text-red-800' : 'text-amber-800') : 'text-gray-700'
          }`}>
            {item.short}
          </p>
          <button
            type="button"
            onClick={onToggleExpand}
            className={`shrink-0 p-0.5 rounded-full transition-colors ${
              expanded
                ? (color === 'red' ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-amber-500')
                : 'text-gray-300 hover:text-gray-500 active:bg-gray-100'
            }`}
          >
            {expanded ? <ChevronDown size={13} /> : <Info size={13} />}
          </button>
        </div>

        <div className="flex gap-1.5 shrink-0">
          <SelectableButton
            onClick={() => onChange(false)}
            active={isNo}
            tone="gray"
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold"
          >
            NO
          </SelectableButton>
          <SelectableButton
            onClick={() => onChange(true)}
            active={isYes}
            tone={tone}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 text-xs font-bold"
          >
            SI
          </SelectableButton>
        </div>
      </div>

      {expanded && (
        <div className={`px-3 pb-2.5 animate-fade-in ${
          color === 'red' ? 'border-t border-red-100' : 'border-t border-amber-100'
        }`}>
          <div className={`rounded-lg px-3 py-2 mt-1 text-xs leading-snug ${
            color === 'red' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            <p className="font-semibold">{item.label}</p>
            {item.sub && <p className="opacity-75 mt-0.5">{item.sub}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContraindicationsStep({ onConfirm }) {
  const [redAnswers, setRedAnswers] = useState({})
  const [orangeAnswers, setOrangeAnswers] = useState({})
  const [expandedRow, setExpandedRow] = useState(null)
  const confirmRef = useRef(null)

  const hasRed = Object.values(redAnswers).some(Boolean)
  const hasOrange = Object.values(orangeAnswers).some(Boolean)

  function scrollToConfirm() {
    setTimeout(() => {
      confirmRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 150)
  }

  function setRed(id, val) {
    setRedAnswers((a) => ({ ...a, [id]: val }))
    if (val) scrollToConfirm()
  }

  function setOrange(id, val) {
    setOrangeAnswers((a) => ({ ...a, [id]: val }))
    if (val) scrollToConfirm()
  }

  function markAllNo(contras, setter) {
    const allNo = {}
    contras.forEach((c) => { allNo[c.id] = false })
    setter(allNo)
    scrollToConfirm()
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

  const allRedAnswered = RED_CONTRAS.every((c) => redAnswers[c.id] !== undefined)
  const allOrangeAnswered = ORANGE_CONTRAS.every((c) => orangeAnswers[c.id] !== undefined)

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="6" title="Contraindicaciones absolutas" accent="red">
        <SectionPrompt
          tone="red"
          title="Descarta contraindicaciones absolutas"
          helper="Tocá ⓘ para ver detalle. Cualquier SI bloquea trombolisis."
          complete
          status={hasRed ? 'Alerta' : 'Revisar'}
        />

        {!allRedAnswered && (
          <button
            type="button"
            onClick={() => markAllNo(RED_CONTRAS, setRedAnswers)}
            className="w-full flex items-center justify-center gap-2 mb-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 active:scale-[0.98] transition-all"
          >
            <ShieldCheck size={14} />
            Ninguna presente — marcar todas NO
          </button>
        )}

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
          <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-sm font-bold text-red-700">Contraindicacion absoluta presente</p>
            <p className="text-xs text-red-600 mt-1 leading-relaxed">No indicar trombolisis IV con rtPA ni TNK.</p>
          </div>
        )}
      </StepCard>

      <StepCard step="" title="Contraindicaciones relativas" accent="orange" rail railStep="6">
        <SectionPrompt
          tone="orange"
          title="Revisa contraindicaciones relativas"
          helper="Tocá ⓘ para ver detalle. Si hay alguna, individualizar riesgo/beneficio."
          complete
          status={hasOrange ? 'Alerta' : 'Revisar'}
        />

        {!allOrangeAnswered && (
          <button
            type="button"
            onClick={() => markAllNo(ORANGE_CONTRAS, setOrangeAnswers)}
            className="w-full flex items-center justify-center gap-2 mb-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 text-xs font-semibold hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/40 active:scale-[0.98] transition-all"
          >
            <ShieldCheck size={14} />
            Ninguna presente — marcar todas NO
          </button>
        )}

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
            <p className="text-sm font-bold text-amber-700">Contraindicacion relativa presente</p>
            <p className="text-xs text-amber-600 mt-1 leading-relaxed">
              Valorar riesgo/beneficio. Interconsulta con coordinacion antes de proceder.
            </p>
          </div>
        )}
      </StepCard>

      <div ref={confirmRef} className="space-y-2">
        {hasOrange && !hasRed ? (
          <>
            <button
              type="button"
              onClick={() => confirm(false)}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all"
            >
              Trombolizar con precaucion <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => confirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all"
            >
              No trombolizar - Evaluar OGV <ChevronRight size={18} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => confirm(hasRed)}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all"
          >
            {hasRed ? 'Registrar - Evaluar OGV' : 'Registrar y continuar'} <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
