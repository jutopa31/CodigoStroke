import { BookOpen, X, Clock, AlertTriangle, Shield, Pill, Activity, Zap } from 'lucide-react'

const RED_CONTRAS = [
  { label: 'TC con hipodensidad extensa', sub: 'Hipodensidad clara mayor que la sustancia blanca contralateral' },
  { label: 'TC con hemorragia intracraneal aguda', sub: '' },
  { label: 'TCE moderado a grave en los últimos 14 días', sub: '> 30 min de inconsciencia y GCS < 13, O hemorragia/contusión/fractura en neuroimagen' },
  { label: 'Neurocirugía o cirugía espinal en los últimos 14 días', sub: '' },
  { label: 'Lesión medular aguda en los últimos 3 meses', sub: '' },
  { label: 'Neoplasia intracraneal intra-axial', sub: '' },
  { label: 'Endocarditis infecciosa activa', sub: '' },
  { label: 'Coagulopatía severa o trombocitopenia', sub: 'Plaquetas < 100.000/mm³ / RIN > 1.7 / KPTT > 40s / TP > 15s' },
  { label: 'Disección de arco aórtico conocida o sospechada', sub: '' },
  { label: 'ARIA (Anomalías de imagen relacionadas con amiloide)', sub: 'Inmunoterapia anti-amiloide o ARIA conocida' },
]

const ORANGE_CONTRAS = [
  { label: 'Discapacidad preexistente o fragilidad', sub: '' },
  { label: 'Exposición a DOAC en las últimas 48h', sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban' },
  { label: 'ACV isquémico en los últimos 3 meses', sub: '' },
  { label: 'Hemorragia intracraneal previa', sub: '' },
  { label: 'Trauma mayor no-SNC entre 14 días y 3 meses', sub: '' },
  { label: 'Cirugía mayor no-SNC en los últimos 10 días', sub: '' },
  { label: 'Sangrado GI/GU en los últimos 21 días', sub: '' },
  { label: 'Disección arterial intracraneal', sub: '' },
  { label: 'Malformación vascular intracraneal conocida', sub: 'MAV, aneurisma no tratado' },
  { label: 'STEMI reciente en los últimos 3 meses', sub: '' },
  { label: 'Pericarditis aguda', sub: '' },
  { label: 'Trombo auricular o ventricular izquierdo conocido', sub: '' },
  { label: 'Neoplasia sistémica activa', sub: '' },
  { label: 'Embarazo o período posparto', sub: '' },
  { label: 'Punción dural en los últimos 7 días', sub: '' },
  { label: 'Punción arterial en vaso no compresible en los últimos 7 días', sub: '' },
  { label: 'TCE moderado a grave entre 14 días y 3 meses', sub: '' },
  { label: 'Neurocirugía o cirugía espinal entre 14 días y 3 meses', sub: '' },
]

const POST_CHECKLIST = [
  'Monitoreo neurológico continuo — NIHSS cada 15 min durante infusión, luego horario × 6h',
  'Control TA cada 15 min durante infusión, luego cada 30 min × 6h. Mantener < 180/105 mmHg',
  'Sin anticoagulantes ni antiagregantes por 24h post-trombolisis',
  'Sin sondas nasogástricas, catéteres arteriales ni venopunciones no compresibles × 24h',
  'TC control a las 24–36h (o antes si deterioro neurológico)',
  'Ingreso a UCI o unidad de stroke para monitoreo post-lisis',
  'Evaluar trombectomía mecánica si hay oclusión de gran vaso (AngioTAC)',
]

function EduSection({ title, icon, children }) {
  return (
    <section>
      <h2 className="flex items-center gap-2.5 text-base font-semibold text-blue-300 pb-2 mb-4 border-b border-blue-500/30">
        {icon && (
          <span className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-300 shrink-0">
            {icon}
          </span>
        )}
        {title}
      </h2>
      <div className="text-sm text-stroke-text leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  )
}

function BulletList({ items }) {
  return (
    <ul className="space-y-1.5 ml-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function ContraList({ items, color }) {
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className={`rounded-xl px-3 py-2.5 border ${
          color === 'red'
            ? 'bg-blue-900/8 border-blue-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <p className={`text-sm font-semibold ${color === 'red' ? 'text-blue-300' : 'text-amber-300'}`}>
            {item.label}
          </p>
          {item.sub && (
            <p className="text-xs text-stroke-textMuted mt-0.5">{item.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function EducationalOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-stroke-navy flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-500/30 bg-blue-500/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-stroke-iconActive flex items-center justify-center shrink-0">
            <BookOpen size={17} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-blue-300 leading-tight">Protocolo Código Stroke</h1>
            <p className="text-xs text-blue-500 mt-0.5">Referencia educativa — AHA/ASA 2026</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-stroke-navy border border-blue-500/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 transition-colors shrink-0"
          aria-label="Cerrar referencia educativa"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-10">

          <EduSection title="1. Criterios de inclusión" icon={<Activity size={14} strokeWidth={2.5} />}>
            <BulletList items={[
              'Déficit neurológico agudo medible en la escala NIHSS',
              'Diagnóstico clínico de ACV isquémico',
              'Inicio de síntomas dentro de la ventana terapéutica (o última vez visto asintomático conocida)',
              'NIHSS ≥ 5, o NIHSS < 5 con déficit discapacitante',
              'Sin contraindicaciones absolutas identificadas',
            ]} />
          </EduSection>

          <EduSection title="2. Escala NIHSS — Severidad" icon={<Activity size={14} strokeWidth={2.5} />}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { range: '0', label: 'Normal', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
                { range: '1–4', label: 'Leve', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
                { range: '5–15', label: 'Moderado', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
                { range: '16–20', label: 'Moderado-severo', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-orange-100' },
                { range: '21–42', label: 'Severo', bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' },
              ].map((row) => (
                <div key={row.range} className={`rounded-xl px-3 py-2.5 border ${row.bg} ${row.border}`}>
                  <p className={`text-lg font-bold tabular-nums ${row.text}`}>{row.range}</p>
                  <p className={`text-xs font-medium ${row.text}`}>{row.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-stroke-textMuted mt-2">
              Nota: NIHSS &lt; 5 con déficit discapacitante (afasia, hemianopsia, etc.) puede calificar igualmente.
            </p>
          </EduSection>

          <EduSection title="3. Ventanas terapéuticas" icon={<Clock size={14} strokeWidth={2.5} />}>
            <div className="space-y-2">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                <p className="font-semibold text-blue-300">Trombolisis IV (rtPA / TNK)</p>
                <p className="text-xs text-blue-300 mt-1">Hasta <strong>4.5 horas</strong> desde el inicio de síntomas</p>
              </div>
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                <p className="font-semibold text-indigo-300">ACV del despertar / hora incierta</p>
                <p className="text-xs text-indigo-300 mt-1">Evaluar con RMN: <strong>mismatch FLAIR-DWI</strong> positivo habilita trombolisis</p>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <p className="font-semibold text-amber-300">Trombectomía mecánica (OGV)</p>
                <p className="text-xs text-amber-300 mt-1">Hasta <strong>24 horas</strong> con criterios DAWN / DEFUSE-3</p>
              </div>
            </div>
          </EduSection>

          <EduSection title="4. Criterios para trombolisis" icon={<Shield size={14} strokeWidth={2.5} />}>
            <BulletList items={[
              'NIHSS ≥ 5, o NIHSS < 5 con déficit discapacitante',
              'TC sin hemorragia (o RMN con mismatch FLAIR-DWI para wake-up)',
              'Sin contraindicaciones absolutas presentes',
              'Sin anticoagulación activa (o según criterio y última dosis)',
              'Presión arterial manejable: sistólica < 185 mmHg y diastólica < 110 mmHg antes de iniciar',
              'Glucemia entre 50 y 400 mg/dL',
            ]} />
          </EduSection>

          <EduSection title="5. Contraindicaciones absolutas" icon={<AlertTriangle size={14} strokeWidth={2.5} />}>
            <p className="text-xs text-stroke-textMuted mb-3">Cualquier SI bloquea la trombolisis IV de forma absoluta.</p>
            <ContraList items={RED_CONTRAS} color="red" />
          </EduSection>

          <EduSection title="6. Contraindicaciones relativas" icon={<AlertTriangle size={14} strokeWidth={2.5} />}>
            <p className="text-xs text-stroke-textMuted mb-3">Requieren valoración individual riesgo/beneficio. Interconsultar con coordinación.</p>
            <ContraList items={ORANGE_CONTRAS} color="orange" />
          </EduSection>

          <EduSection title="7. Dosis y administración" icon={<Pill size={14} strokeWidth={2.5} />}>
            <div className="space-y-3">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
                <p className="font-semibold text-blue-300 mb-1">Alteplase (rtPA)</p>
                <p className="text-xs text-blue-300">
                  <strong>0.9 mg/kg IV</strong> (máximo 90 mg)<br />
                  — 10% en bolo IV rápido (1–2 min)<br />
                  — 90% restante en infusión continua × 60 min
                </p>
              </div>
              <div className="rounded-xl border border-stroke-iconActive/40 bg-stroke-iconActive/10 px-4 py-3">
                <p className="font-semibold text-stroke-iconActive mb-1">Tenecteplase (TNK)</p>
                <p className="text-xs text-stroke-iconActive">
                  <strong>0.25 mg/kg IV</strong> (máximo 25 mg)<br />
                  — Bolo único en 5–10 segundos
                </p>
              </div>
            </div>
          </EduSection>

          <EduSection title="8. Protocolo post-trombolisis" icon={<Zap size={14} strokeWidth={2.5} />}>
            <div className="space-y-2">
              {POST_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-xl border border-stroke-line bg-stroke-bg px-3 py-2.5">
                  <span className="mt-0.5 w-5 h-5 rounded-md bg-stroke-iconActive flex items-center justify-center text-stroke-bg text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </EduSection>

          <EduSection title="9. Criterios para trombectomía mecánica" icon={<Activity size={14} strokeWidth={2.5} />}>
            <BulletList items={[
              'Oclusión de gran vaso (OGV) confirmada: ACI intracraneal, ACM M1, M2 proximal, basilar, ACP P1',
              'ASPECTS ≥ 6 (cambios isquémicos moderados o leves en TC)',
              'NIHSS ≥ 6 (aunque evaluar individualmente según déficit)',
              'Ventana: hasta 6h desde inicio síntomas (estándar) o hasta 24h con criterios DAWN/DEFUSE-3',
              'Puede combinarse con trombolisis IV si no hay contraindicaciones',
              'Solicitar AngioTAC de cabeza y cuello en todos los candidatos',
            ]} />
          </EduSection>

          <div className="rounded-2xl bg-blue-500/10 border border-blue-500/30 px-5 py-4 text-center">
            <p className="text-xs font-semibold text-blue-300">Referencia: AHA/ASA Guidelines 2026</p>
            <p className="text-xs text-blue-500 mt-1">Esta herramienta es un apoyo educativo. Las decisiones clínicas siempre deben individualizarse.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
