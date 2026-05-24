import { useState } from 'react'
import { Plus, Brain, Activity, AlertTriangle, Heart, ChevronDown, ChevronRight } from 'lucide-react'
import StepCard from '../components/StepCard'

function fmtTime(date) {
  if (!date) return '--:--'
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

const BP_ALERTS = [
  {
    id: 'deterioration', label: 'Deterioro neurológico', sub: 'Caída ≥ 4 puntos en NIHSS',
    info: 'TC urgente para descartar transformación hemorrágica. Evaluar suspensión del trombolítico si aún corre.',
  },
  {
    id: 'headache', label: 'Cefalea súbita', sub: 'Especialmente post-trombolisis',
    info: 'Alta sospecha de HIC. TC urgente sin contraste. Suspender trombolítico. Avisar neurocirugía.',
  },
  {
    id: 'vomiting', label: 'Náuseas / vómitos', sub: 'Signo de HIC',
    info: 'Valorar en contexto clínico. Si se acompaña de deterioro o cefalea, solicitar TC urgente.',
  },
  {
    id: 'seizure', label: 'Convulsiones', sub: 'Nuevo déficit o empeoramiento',
    info: 'Benzodiacepinas IV. TC urgente. Sospechar transformación hemorrágica o edema cerebral.',
  },
  {
    id: 'bp_spike', label: 'TA > 180/105 mmHg', sub: 'Requiere tratamiento inmediato',
    info: 'Labetalol 10 mg IV o Nicardipino 5 mg/h. Meta: PAS < 180, PAD < 105 mmHg.',
  },
]

const ADVERSE_EFFECTS = [
  {
    id: 'angioedema', label: 'Angioedema', sub: 'Hinchazón de lengua/labios/vía aérea', tone: 'red',
    info: 'Suspender trombolítico inmediatamente. Adrenalina 0.5 mg IM. Proteger vía aérea. Antihistamínicos + corticoides IV.',
  },
  {
    id: 'major_bleed', label: 'Sangrado mayor', sub: 'Sistémico o intracraneal', tone: 'red',
    info: 'Suspender trombolítico. Crioprecipitado + plaquetas. TC urgente si sospecha HIC. Consulta Hematología y Neurocirugía.',
  },
  {
    id: 'hemorrhagic', label: 'Transformación hemorrágica', sub: 'TC control a las 24h', tone: 'orange',
    info: 'Si sintomática: revertir fibrinólisis. Soporte UCI. TC sin contraste a las 24h antes de reiniciar antitrombóticos.',
  },
  {
    id: 'reperfusion', label: 'Síndrome de reperfusión', sub: 'Edema, hiperperfusión', tone: 'orange',
    info: 'Control estricto de TA. Monitoreo neurológico frecuente. Considerar ingreso a cuidados críticos.',
  },
  {
    id: 'allergic', label: 'Reacción alérgica', sub: 'Urticaria, hipotensión', tone: 'orange',
    info: 'Suspender infusión. Adrenalina 0.5 mg IM si anafilaxia. Difenhidramina + metilprednisolona IV.',
  },
]

function NihssRow({ reading }) {
  const severity = (() => {
    const s = reading.score
    if (s === 0) return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' }
    if (s <= 4)  return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' }
    if (s <= 15) return { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    return { color: 'text-blue-900', bg: 'bg-blue-100', border: 'border-blue-300' }
  })()
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${severity.bg} ${severity.border}`}>
      <div className="flex items-center gap-2">
        <Brain size={13} className={severity.color} />
        <span className="text-xs text-neutral-500">{fmtTime(reading.timestamp)}</span>
      </div>
      <span className={`text-sm font-bold tabular-nums ${severity.color}`}>{reading.score}</span>
    </div>
  )
}

function VitalsRow({ reading }) {
  const critical = reading.systolic > 180 || reading.diastolic > 105
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${critical ? 'bg-blue-50 border-blue-200' : 'bg-neutral-50 border-neutral-200'}`}>
      <div className="flex items-center gap-2">
        <Activity size={13} className={critical ? 'text-blue-900' : 'text-neutral-400'} />
        <span className="text-xs text-neutral-500">{fmtTime(reading.timestamp)}</span>
        {critical && <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">ALTO</span>}
      </div>
      <span className={`text-sm font-bold tabular-nums ${critical ? 'text-blue-900' : 'text-neutral-700'}`}>
        {reading.systolic}/{reading.diastolic}
      </span>
    </div>
  )
}

function InfoItem({ item, accent = 'red' }) {
  const [open, setOpen] = useState(false)
  const accentColor = accent === 'red' ? 'text-red-400' : 'text-amber-400'
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      className="w-full flex flex-col px-3 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-left transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle size={13} className={`${accentColor} shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-700">{item.label}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</p>
        </div>
        <ChevronDown
          size={13}
          className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <p className="mt-2 pt-2 border-t border-neutral-100 text-xs text-neutral-600 leading-relaxed animate-fade-in text-left">
          {item.info}
        </p>
      )}
    </button>
  )
}

export default function CareTab({
  nihssReadings = [],
  vitalsReadings = [],
  onAddNihss,
  onAddVitals,
  onContinue,
}) {
  const [nihssEntry, setNihssEntry] = useState('')
  const [showNihssInput, setShowNihssInput] = useState(false)
  const [vitalsEntry, setVitalsEntry] = useState({ sys: '', dia: '' })
  const [showVitalsInput, setShowVitalsInput] = useState(false)
  const [notes, setNotes] = useState('')

  const nihssNum = parseInt(nihssEntry, 10)
  const nihssValid = nihssEntry !== '' && !isNaN(nihssNum) && nihssNum >= 0 && nihssNum <= 42
  const vitalsValid = vitalsEntry.sys && vitalsEntry.dia

  function handleSaveNihss() {
    if (!nihssValid) return
    onAddNihss?.(nihssNum)
    setNihssEntry('')
    setShowNihssInput(false)
  }

  function handleSaveVitals() {
    if (!vitalsValid) return
    onAddVitals?.({ systolic: parseInt(vitalsEntry.sys), diastolic: parseInt(vitalsEntry.dia) })
    setVitalsEntry({ sys: '', dia: '' })
    setShowVitalsInput(false)
  }

  return (
    <div className="px-4 pb-4 space-y-4">

      {/* Serial NIHSS */}
      <StepCard step="" title="NIHSS seriado" accent="orange">
        <p className="text-xs text-neutral-500 mb-3">Registrar a los 15, 30, 60 min y a las 2h, 6h, 24h post-trombolisis.</p>

        {nihssReadings.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {nihssReadings.map((r, i) => <NihssRow key={i} reading={r} />)}
          </div>
        )}

        {showNihssInput ? (
          <div className="flex gap-2">
            <input
              type="number" inputMode="numeric" min={0} max={42} placeholder="0–42"
              value={nihssEntry}
              onChange={(e) => setNihssEntry(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && nihssValid) handleSaveNihss() }}
              autoFocus
              className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-neutral-800 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button type="button" onClick={handleSaveNihss} disabled={!nihssValid}
              className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm disabled:opacity-40">
              ✓
            </button>
            <button type="button" onClick={() => { setShowNihssInput(false); setNihssEntry('') }}
              className="px-3 py-2 border border-neutral-200 rounded-xl text-neutral-500 text-sm">
              ✕
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowNihssInput(true)}
            className="flex items-center gap-2 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
            <Plus size={14} /><Brain size={14} /> Registrar NIHSS
          </button>
        )}
      </StepCard>

      {/* BP monitoring */}
      <StepCard step="" title="Control de presión arterial" accent="blue">
        <div className="flex items-start gap-2 px-3 py-2.5 mb-3 rounded-xl bg-blue-50 border border-blue-200">
          <Activity size={13} className="text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold">Metas post-trombolisis</p>
            <p>PAS &lt; 180 mmHg · PAD &lt; 105 mmHg</p>
            <p className="text-blue-600 mt-0.5">Medir c/15 min × 2h, luego c/30 min × 6h</p>
          </div>
        </div>

        {vitalsReadings.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {vitalsReadings.map((r, i) => <VitalsRow key={i} reading={r} />)}
          </div>
        )}

        {showVitalsInput ? (
          <div className="flex gap-2 items-center">
            <input
              type="number" inputMode="numeric" placeholder="PAS" min={50} max={300}
              value={vitalsEntry.sys}
              onChange={(e) => setVitalsEntry((v) => ({ ...v, sys: e.target.value }))}
              className="w-20 border border-blue-300 rounded-xl px-2 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-neutral-400 font-bold">/</span>
            <input
              type="number" inputMode="numeric" placeholder="PAD" min={30} max={200}
              value={vitalsEntry.dia}
              onChange={(e) => setVitalsEntry((v) => ({ ...v, dia: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter' && vitalsValid) handleSaveVitals() }}
              className="w-20 border border-blue-300 rounded-xl px-2 py-2 text-base font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="text-xs text-neutral-400">mmHg</span>
            <button type="button" onClick={handleSaveVitals} disabled={!vitalsValid}
              className="px-3 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-40">
              ✓
            </button>
            <button type="button" onClick={() => { setShowVitalsInput(false); setVitalsEntry({ sys: '', dia: '' }) }}
              className="px-3 py-2 border border-neutral-200 rounded-xl text-neutral-500 text-sm">
              ✕
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowVitalsInput(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <Plus size={14} /><Activity size={14} /> Registrar TA
          </button>
        )}
      </StepCard>

      {/* Alarm signs — informational, expandable */}
      <StepCard step="" title="Signos de alarma" accent="red">
        <p className="text-xs text-neutral-500 mb-3">Tocá cada ítem para ver qué hacer si se presenta.</p>
        <div className="space-y-2">
          {BP_ALERTS.map((item) => (
            <InfoItem key={item.id} item={item} accent="red" />
          ))}
        </div>
      </StepCard>

      {/* Adverse effects — informational, expandable */}
      <StepCard step="" title="Efectos adversos / Complicaciones" accent="red">
        <p className="text-xs text-neutral-500 mb-3">Tocá cada ítem para ver el manejo correspondiente.</p>
        <div className="space-y-2">
          {ADVERSE_EFFECTS.map((item) => (
            <InfoItem key={item.id} item={item} accent={item.tone} />
          ))}
        </div>
      </StepCard>

      {/* Free notes */}
      <StepCard step="" title="Observaciones del equipo" accent="gray">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas clínicas, interconsultas, evolución..."
          rows={4}
          className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 resize-none focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-300 placeholder-neutral-300 transition-all"
        />
        {notes && (
          <div className="flex items-center gap-2 mt-2">
            <Heart size={11} className="text-neutral-400" />
            <span className="text-[10px] text-neutral-400">{notes.length} caracteres</span>
          </div>
        )}
      </StepCard>

      {/* Navigation to next section */}
      {onContinue && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-700 text-white transition-all active:scale-[0.98]"
        >
          Continuar → Trombectomía <ChevronRight size={16} />
        </button>
      )}

    </div>
  )
}
