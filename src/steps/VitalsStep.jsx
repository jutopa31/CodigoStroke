import { useEffect, useRef, useState } from 'react'
import { Activity, AlertTriangle, ChevronRight, Droplets, Heart, UserCheck } from 'lucide-react'
import StepCard, { CollapsedStep } from '../components/StepCard'
import { PrimaryAction } from '../components/GuidedControls'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin síntomas',                   desc: 'Sin síntomas.' },
  { score: 1, label: 'Sin discapacidad significativa',  desc: 'A pesar de síntomas realiza actividades cotidianas.' },
  { score: 2, label: 'Incapacidad leve',                desc: 'Incapaz de actividades previas; capaz de algunas sin asistencia.' },
  { score: 3, label: 'Incapacidad moderada',            desc: 'Requiere alguna ayuda, pero camina sin ayuda.' },
  { score: 4, label: 'Incapacidad mod. severa',         desc: 'Incapaz de caminar sin ayuda y de atender necesidades corporales sin ayuda.' },
  { score: 5, label: 'Incapacidad severa',              desc: 'Confinado a cama, incontinente; requiere cuidado constante de enfermería.' },
]

function VitalAlert({ message, color = 'red' }) {
  const styles = {
    red:    { wrap: 'border-status-critical/30 bg-status-critical/10',       icon: 'text-red-400',    text: 'text-red-400'    },
    orange: { wrap: 'border-orange-100 bg-amber-500/15', icon: 'text-orange-500', text: 'text-amber-400' },
  }
  const s = styles[color] ?? styles.red
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${s.wrap}`}>
      <AlertTriangle size={12} className={`mt-0.5 shrink-0 ${s.icon}`} strokeWidth={2} />
      <p className={`text-xs leading-relaxed ${s.text}`}>{message}</p>
    </div>
  )
}

function InfoBanner({ icon: Icon, iconClass, bgClass, borderClass, textClass, title, subtitle }) {
  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 mb-3 rounded-xl border ${bgClass} ${borderClass}`}>
      <Icon size={13} className={`${iconClass} shrink-0 mt-0.5`} />
      <div className={`text-xs ${textClass}`}>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 opacity-80">{subtitle}</p>
      </div>
    </div>
  )
}

export default function VitalsStep({ onConfirm, isCollapsed = false }) {
  const [sys, setSys]         = useState('')
  const [dia, setDia]         = useState('')
  const [glucose, setGlucose] = useState('')
  const [mrs, setMrs]         = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const sysRef     = useRef(null)
  const diaRef     = useRef(null)
  const glucoseRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => sysRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const sysNum  = parseInt(sys, 10)
  const diaNum  = parseInt(dia, 10)
  const glucNum = parseInt(glucose, 10)

  const taCritical    = sys     && sysNum  > 185
  const taDiaCritical = dia     && diaNum  > 110
  const glucLow       = glucose && glucNum < 50
  const glucHigh      = glucose && glucNum > 400

  const valid = !!(sys && dia && glucose && mrs !== null)

  function handleConfirm() {
    if (!valid) return
    setConfirmed(true)
    onConfirm({
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
      modifiedRankinScale: { score: mrs, label: MRS_OPTIONS[mrs].label },
    })
  }

  function jumpOnEnter(e, ref) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    ref?.current?.focus()
  }

  const taInput = (isCritical, isFilled) =>
    'flex-1 rounded-xl border py-2.5 text-xl font-bold text-center text-stroke-text ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-stroke-textMuted ' +
    (isCritical
      ? 'border-red-300 bg-status-critical/10 focus:border-red-400 focus:ring-status-critical/30'
      : isFilled
        ? 'border-blue-300 bg-blue-500/10 focus:border-blue-400 focus:ring-blue-500/30'
        : 'border-stroke-line bg-stroke-navy focus:border-blue-300 focus:ring-blue-500/30')

  const glucInput =
    'w-full rounded-xl border py-2.5 text-xl font-bold text-center text-stroke-text pr-16 ' +
    'focus:outline-none focus:ring-2 transition placeholder:text-stroke-textMuted ' +
    (glucLow || glucHigh
      ? 'border-red-300 bg-status-critical/10 focus:border-red-400 focus:ring-status-critical/30'
      : glucose
        ? 'border-status-glucose/40 bg-status-glucose/15 focus:border-violet-400 focus:ring-status-glucose/30'
        : 'border-stroke-line bg-stroke-navy focus:border-status-glucose/40 focus:ring-status-glucose/30')

  if (isCollapsed && confirmed) {
    return (
      <CollapsedStep title="Signos vitales">
        TA {sys}/{dia} mmHg · Glucemia {glucose} mg/dL · mRS {mrs}
      </CollapsedStep>
    )
  }

  return (
    <div className="space-y-3">
      <StepCard step="3" title="Signos vitales" accent="blue">
        <div className="space-y-5">

          {/* ── Tensión arterial ── */}
          <div>
            <InfoBanner
              icon={Heart}
              iconClass="text-blue-300"
              bgClass="bg-blue-500/10"
              borderClass="border-blue-500/30"
              textClass="text-blue-300"
              title="Tensión arterial"
              subtitle="Meta pre-trombolisis: PAS ≤ 185 · PAD ≤ 110 mmHg"
            />

            <div className="flex items-center gap-2">
              <input
                ref={sysRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={300}
                placeholder="PAS"
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                onKeyDown={(e) => jumpOnEnter(e, diaRef)}
                className={taInput(taCritical, !!sys)}
              />

              <span className="text-stroke-textMuted font-bold text-xl select-none">/</span>

              <input
                ref={diaRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={200}
                placeholder="PAD"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                onKeyDown={(e) => jumpOnEnter(e, glucoseRef)}
                className={taInput(taDiaCritical, !!dia)}
              />

              <div className="flex items-center gap-1 shrink-0">
                <Activity size={11} className="text-stroke-textMuted" />
                <span className="text-xs text-stroke-textMuted font-medium">mmHg</span>
              </div>
            </div>

            {(taCritical || taDiaCritical) && (
              <div className="space-y-1.5 mt-2">
                {taCritical    && <VitalAlert message="TA sistólica >185 mmHg — ajustar antes de trombolisis." />}
                {taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg — ajustar antes de trombolisis." />}
              </div>
            )}
          </div>

          <div className="border-t border-stroke-line" />

          {/* ── Glucemia ── */}
          <div>
            <InfoBanner
              icon={Droplets}
              iconClass="text-violet-300"
              bgClass="bg-status-glucose/15"
              borderClass="border-status-glucose/30"
              textClass="text-violet-300"
              title="Glucemia"
              subtitle="Rango aceptable: 50 – 400 mg/dL"
            />

            <div className="relative">
              <input
                ref={glucoseRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={900}
                placeholder="mg/dL"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && valid) { e.preventDefault(); handleConfirm() } }}
                className={glucInput}
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-stroke-textMuted">
                mg/dL
              </span>
            </div>

            {(glucLow || glucHigh) && (
              <div className="space-y-1.5 mt-2">
                {glucLow  && <VitalAlert message="Hipoglucemia <50 mg/dL — corregir; puede mimetizar ACV." />}
                {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL — controlar antes de proceder." color="orange" />}
              </div>
            )}
          </div>

          <div className="border-t border-stroke-line" />

          {/* ── mRS basal ── */}
          <div>
            <InfoBanner
              icon={UserCheck}
              iconClass="text-stroke-iconActive"
              bgClass="bg-stroke-iconActive/10"
              borderClass="border-stroke-iconActive/40"
              textClass="text-stroke-iconActive"
              title="mRS basal (funcionalidad previa al ACV)"
              subtitle="mRS ≥ 4 pre-stroke es contraindicación relativa para rtPA"
            />

            <div className="grid grid-cols-6 gap-1.5">
              {MRS_OPTIONS.map((o) => (
                <button
                  key={o.score}
                  type="button"
                  onClick={() => setMrs(o.score)}
                  title={o.label}
                  className={`rounded-xl border py-2.5 text-lg font-bold transition-all active:scale-95 ${
                    mrs === o.score
                      ? 'border-stroke-iconActive/40 bg-stroke-iconActive/10 text-stroke-iconActive ring-2 ring-stroke-iconActive/30'
                      : 'border-stroke-line text-stroke-textMuted hover:border-stroke-iconActive/40 hover:bg-stroke-iconActive/10'
                  }`}
                >
                  {o.score}
                </button>
              ))}
            </div>

            {mrs !== null && (
              <div className="mt-2 px-2.5 py-2 bg-stroke-iconActive/10 rounded-xl border border-stroke-iconActive/40 animate-fade-in">
                <p className="text-[11px] font-semibold text-stroke-iconActive leading-tight">{MRS_OPTIONS[mrs].label}</p>
                <p className="text-[10px] text-stroke-textMuted mt-0.5 leading-snug">{MRS_OPTIONS[mrs].desc}</p>
              </div>
            )}

            {mrs !== null && mrs >= 4 && (
              <div className="mt-2">
                <VitalAlert message={`mRS ${mrs} pre-stroke — discutir riesgo/beneficio de trombolisis con el equipo.`} color="orange" />
              </div>
            )}
          </div>

        </div>
      </StepCard>

      <PrimaryAction onClick={handleConfirm} valid={valid} disabledLabel="Completá TA, glucemia y mRS">
        Continuar <ChevronRight size={16} strokeWidth={2} />
      </PrimaryAction>
    </div>
  )
}
