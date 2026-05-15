import { useState, useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import StepCard from '../components/StepCard'
import { SectionPrompt, SelectableButton } from '../components/GuidedControls'

const RED_CONTRAS = [
  { id: 'prior_ich', label: 'Hemorragia intracraneal previa o actual', sub: 'Cualquier antecedente de HIC' },
  { id: 'large_infarct', label: 'Infarto extenso en TC', sub: 'ASPECTS < 3 o mas de 1/3 del territorio de ACM' },
  { id: 'tce', label: 'TCE grave o cirugia intracraneal reciente', sub: 'En los ultimos 3 meses' },
  { id: 'axial_tumor', label: 'Tumor intra-axial', sub: 'Neoplasia cerebral intraparenquimatosa' },
  { id: 'coagulopathy', label: 'Coagulopatia severa', sub: 'RIN > 1.7 / KPTT > 40 / Plaquetas < 100.000' },
  { id: 'aortic_dissection', label: 'Diseccion aortica', sub: 'Sospecha o confirmada' },
  { id: 'endocarditis', label: 'Endocarditis infecciosa activa', sub: '' },
]

const ORANGE_CONTRAS = [
  { id: 'prev_stroke', label: 'ACV isquemico en los ultimos 3 meses', sub: '' },
  { id: 'major_surgery', label: 'Cirugia mayor o trauma grave reciente', sub: 'En las ultimas 2 semanas' },
  { id: 'acod', label: 'ACODs en las ultimas 48h', sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban' },
  { id: 'gi_bleed', label: 'Sangrado GI/GU reciente', sub: 'En los ultimos 21 dias' },
  { id: 'arterial_puncture', label: 'Puncion arterial reciente en sitio no compresible', sub: '' },
  { id: 'avm', label: 'MAV conocida', sub: 'Malformacion arteriovenosa' },
  { id: 'aneurysm', label: 'Aneurisma no roto conocido > 10 mm', sub: '' },
  { id: 'ic_dissection', label: 'Diseccion arterial intracraneal', sub: '' },
]

function ContraRow({ item, value, onChange, color }) {
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
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all ${rowBg}`}>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold leading-snug ${
          isYes ? (color === 'red' ? 'text-red-800' : 'text-amber-800') : 'text-gray-700'
        }`}>
          {item.label}
        </p>
        {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
      </div>
      <div className="flex gap-1.5 shrink-0">
        <SelectableButton
          onClick={() => onChange(false)}
          active={isNo}
          tone="gray"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold"
        >
          NO
        </SelectableButton>
        <SelectableButton
          onClick={() => onChange(true)}
          active={isYes}
          tone={tone}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold"
        >
          SI
        </SelectableButton>
      </div>
    </div>
  )
}

export default function ContraindicationsStep({ onConfirm }) {
  const [redAnswers, setRedAnswers] = useState({})
  const [orangeAnswers, setOrangeAnswers] = useState({})
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

  function confirm(decidedNotToThrombolyze) {
    onConfirm({
      red: redAnswers,
      orange: orangeAnswers,
      hasAbsolute: hasRed,
      hasRelative: hasOrange,
      decidedNotToThrombolyze,
    })
  }

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="7" title="Contraindicaciones absolutas" accent="red">
        <SectionPrompt
          tone="red"
          title="Descarta contraindicaciones absolutas"
          helper="Marca SI solo si esta presente. Cualquier SI bloquea trombolisis IV."
          complete
          status={hasRed ? 'Alerta' : 'Revisar'}
        />
        <div className="space-y-2">
          {RED_CONTRAS.map((item) => (
            <ContraRow
              key={item.id}
              item={item}
              value={redAnswers[item.id] ?? null}
              onChange={(val) => setRed(item.id, val)}
              color="red"
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

      <StepCard step="" title="Contraindicaciones relativas" accent="orange" rail railStep="7">
        <SectionPrompt
          tone="orange"
          title="Revisa contraindicaciones relativas"
          helper="Si alguna esta presente, individualizar riesgo/beneficio."
          complete
          status={hasOrange ? 'Alerta' : 'Revisar'}
        />
        <div className="space-y-2">
          {ORANGE_CONTRAS.map((item) => (
            <ContraRow
              key={item.id}
              item={item}
              value={orangeAnswers[item.id] ?? null}
              onChange={(val) => setOrange(item.id, val)}
              color="orange"
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
