import { useState } from 'react'
import { BookOpen, X, Clock, AlertTriangle, Shield, Pill, Activity, ChevronLeft, ChevronRight, Calculator } from 'lucide-react'
import { nihssItems, getNihssSeverity } from '../content/nihss'

// ─── mRS data ───────────────────────────────────────────────────────────────
const MRS_LEVELS = [
  { score: 0, label: 'Sin síntomas', desc: 'Ausencia completa de síntomas neurológicos.', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { score: 1, label: 'Sin discapacidad significativa', desc: 'Puede realizar todas las actividades habituales a pesar de síntomas.', bg: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', badge: 'bg-lime-100 text-lime-700' },
  { score: 2, label: 'Discapacidad leve', desc: 'Puede atender sus propios asuntos sin asistencia; incapaz de realizar todas las actividades previas.', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  { score: 3, label: 'Discapacidad moderada', desc: 'Requiere alguna ayuda; puede caminar sin asistencia.', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  { score: 4, label: 'Discapacidad moderada-severa', desc: 'Incapaz de caminar sin asistencia. Necesita ayuda para atender sus necesidades básicas.', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  { score: 5, label: 'Discapacidad severa', desc: 'Requiere cuidado de enfermería constante; confinado en cama, incontinente.', bg: 'bg-blue-900/10', border: 'border-blue-800/30', text: 'text-blue-900', badge: 'bg-blue-900/20 text-blue-900' },
  { score: 6, label: 'Muerte', desc: '', bg: 'bg-neutral-100', border: 'border-neutral-300', text: 'text-neutral-700', badge: 'bg-neutral-200 text-neutral-700' },
]

// ─── Contraindications data ──────────────────────────────────────────────────
const RED_CONTRAS = [
  { label: 'Hemorragia intracraneal previa o actual', sub: 'Cualquier antecedente de HIC', detail: 'Incluye HIC espontánea, hemorrágica por transformación, y trauma. Contraindicación absoluta sin excepciones.' },
  { label: 'Infarto extenso en TC', sub: 'ASPECTS < 3 o más de 1/3 del territorio de ACM', detail: 'El ASPECTS evalúa 10 regiones del territorio de ACM. Puntaje < 3 indica infarto muy extenso con alto riesgo de transformación hemorrágica.' },
  { label: 'TCE grave o cirugía intracraneal reciente', sub: 'En los últimos 3 meses', detail: 'Incluye cirugía craneal, raquimedular o trauma cefálico grave en las últimas 12 semanas.' },
  { label: 'Tumor intra-axial', sub: 'Neoplasia cerebral intraparenquimatosa', detail: 'Los tumores extra-axiales (meningiomas) requieren evaluación individual; los intra-axiales son contraindicación absoluta.' },
  { label: 'Coagulopatía severa', sub: 'RIN > 1.7 / KPTT > 40 / Plaquetas < 100.000', detail: 'Cualquiera de estos valores por sí solo es suficiente para contraindicar. Verificar resultados recientes (< 1h si es posible).' },
  { label: 'Disección aórtica', sub: 'Sospecha o confirmada', detail: 'La trombolisis sistémica puede extender una disección aórtica y ser fatal. Ante sospecha clínica (dolor torácico/dorsal + déficit neurológico), contraindicar.' },
  { label: 'Endocarditis infecciosa activa', sub: '', detail: 'Alto riesgo de embolias sépticas y transformación hemorrágica. Evaluar trombectomía mecánica como alternativa.' },
]

const ORANGE_CONTRAS = [
  { label: 'ACV isquémico en los últimos 3 meses', sub: '', detail: 'Riesgo aumentado de transformación hemorrágica del infarto previo. Evaluar extensión del infarto antiguo vs beneficio.' },
  { label: 'Cirugía mayor o trauma grave reciente', sub: 'En las últimas 2 semanas', detail: 'El riesgo de sangrado en el sitio quirúrgico debe sopesarse contra el beneficio de la trombolisis.' },
  { label: 'ACODs en las últimas 48h', sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban', detail: 'Si hay niveles terapéuticos detectables, contraindicación relativa. Si < 48h y función renal normal, evaluar con laboratorio. Idarucizumab puede revertir dabigatran.' },
  { label: 'Sangrado GI/GU reciente', sub: 'En los últimos 21 días', detail: 'Consultar endoscopía/urología para evaluar riesgo activo de resangrado.' },
  { label: 'Punción arterial reciente en sitio no compresible', sub: '', detail: 'Ej: arteria subclavia o femoral proximal. El sitio femoral estándar es compresible y no es contraindicación.' },
  { label: 'MAV conocida', sub: 'Malformación arteriovenosa', detail: 'Riesgo de ruptura de la MAV con la trombolisis. Evaluar individualmente según localización y morfología.' },
  { label: 'Aneurisma no roto conocido > 10 mm', sub: '', detail: 'Los aneurismas pequeños (< 10 mm) tienen evidencia más permisiva. Los grandes requieren evaluación neuroquirúrgica si el tiempo lo permite.' },
  { label: 'Disección arterial intracraneal', sub: '', detail: 'Riesgo de extensión y transformación hemorrágica. Preferir anticoagulación o trombectomía según anatomía.' },
]

// ─── Sections config ─────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'intro',       label: 'Inicio',            icon: <Activity size={14} /> },
  { id: 'tiempo',      label: 'Tiempo',             icon: <Clock size={14} /> },
  { id: 'nihss',       label: 'NIHSS',              icon: <Activity size={14} /> },
  { id: 'mrs',         label: 'mRS',                icon: <Shield size={14} /> },
  { id: 'contras',     label: 'Contraindicaciones', icon: <AlertTriangle size={14} /> },
  { id: 'dosis',       label: 'Dosis',              icon: <Pill size={14} /> },
  { id: 'trombectomia',label: 'Trombectomía',       icon: <Activity size={14} /> },
]

// ─── Section components ───────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return (
    <h2 className="text-lg font-semibold text-neutral-800 mb-5 flex items-center gap-2">
      {children}
    </h2>
  )
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-100 bg-white p-4 ${className}`}>
      {children}
    </div>
  )
}

function IntroSection() {
  return (
    <div className="space-y-6">
      <SectionHeader>Bienvenido al Modo Educativo</SectionHeader>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong>Este modo es solo de consulta.</strong> Podés navegar el algoritmo completo, interactuar con las escalas y explorar los criterios clínicos. Ningún dato se guarda ni afecta un caso real.
        </p>
      </Card>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Criterios de inclusión para trombolisis IV</p>
        {[
          'Déficit neurológico agudo medible en la escala NIHSS',
          'Diagnóstico clínico de ACV isquémico',
          'Inicio de síntomas dentro de la ventana terapéutica (o última vez visto asintomático conocida)',
          'NIHSS ≥ 5, o NIHSS < 5 con déficit discapacitante (ej. afasia aislada, hemianopsia)',
          'Sin contraindicaciones absolutas identificadas',
          'TA manejable: sistólica < 185 mmHg y diastólica < 110 mmHg',
          'Glucemia entre 50 y 400 mg/dL',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl bg-white border border-neutral-100 px-4 py-3">
            <span className="w-5 h-5 rounded-md bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
            <p className="text-sm text-neutral-700 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Severidad NIHSS — resumen rápido</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { range: '0', label: 'Normal', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
            { range: '1–4', label: 'Leve', bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-100' },
            { range: '5–15', label: 'Moderado', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
            { range: '16–20', label: 'Mod-severo', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
            { range: '21–42', label: 'Severo', bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-200' },
          ].map((row) => (
            <div key={row.range} className={`rounded-xl px-3 py-2.5 border ${row.bg} ${row.border}`}>
              <p className={`text-lg font-bold tabular-nums ${row.text}`}>{row.range}</p>
              <p className={`text-xs font-medium ${row.text}`}>{row.label}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function TiempoSection() {
  const [onsetTime, setOnsetTime] = useState('')
  const [now] = useState(() => new Date())

  const minutesElapsed = onsetTime
    ? Math.max(0, Math.round((now - new Date(`${now.toISOString().split('T')[0]}T${onsetTime}`)) / 60000))
    : null

  const inWindow = minutesElapsed !== null && minutesElapsed <= 270
  const inThrombectomyWindow = minutesElapsed !== null && minutesElapsed <= 1440

  return (
    <div className="space-y-6">
      <SectionHeader><Clock size={18} className="text-amber-500" /> Ventanas terapéuticas</SectionHeader>

      {/* Calculator */}
      <Card className="bg-amber-50 border-amber-200">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calculator size={12} /> Calculadora de ventana
        </p>
        <label className="text-sm text-amber-800 block mb-2">Hora de inicio de síntomas</label>
        <input
          type="time"
          value={onsetTime}
          onChange={(e) => setOnsetTime(e.target.value)}
          className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-neutral-800 text-lg font-mono focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
        />
        {minutesElapsed !== null && (
          <div className="mt-4 space-y-2">
            <div className={`rounded-xl px-4 py-3 border ${inWindow ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-900/10 border-blue-800/20'}`}>
              <p className={`text-2xl font-bold tabular-nums ${inWindow ? 'text-emerald-700' : 'text-blue-900'}`}>
                {minutesElapsed < 60 ? `${minutesElapsed} min` : `${Math.floor(minutesElapsed / 60)}h ${minutesElapsed % 60}min`}
              </p>
              <p className={`text-xs font-semibold mt-1 ${inWindow ? 'text-emerald-600' : 'text-blue-800'}`}>
                {inWindow ? 'Dentro de ventana para trombolisis IV (4.5h)' : 'Fuera de ventana para trombolisis IV'}
              </p>
            </div>
            {!inWindow && inThrombectomyWindow && (
              <div className="rounded-xl px-4 py-3 border bg-amber-50 border-amber-200">
                <p className="text-sm font-semibold text-amber-800">Evaluar trombectomía mecánica (hasta 24h con criterios DAWN/DEFUSE-3)</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Ventanas */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-blue-900">Trombolisis IV (rtPA / TNK)</p>
              <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                Desde inicio de síntomas hasta <strong>4.5 horas</strong> (270 min). La ventana más estrecha y de mayor beneficio.
              </p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-blue-300 tabular-nums">4.5h</span>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-100">
            <p className="text-xs text-blue-700 font-medium">Tiempo puerta-aguja objetivo: &lt; 60 min</p>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-indigo-900">ACV del despertar / hora incierta</p>
              <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
                Evaluar con RMN: <strong>mismatch FLAIR-DWI positivo</strong> habilita trombolisis. Criterio DWI-FLAIR: lesión visible en DWI pero no en FLAIR sugiere evento &lt; 4.5h.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium">Estudio WAKE-UP (2018): NNT ≈ 14 para buen outcome funcional</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">Trombectomía mecánica (OGV)</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Hasta <strong>6h estándar</strong>, o hasta <strong>24h</strong> con criterios DAWN / DEFUSE-3 (penumbra isquémica preservada en perfusión-TC o RMN).
              </p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-amber-300 tabular-nums">24h</span>
          </div>
          <div className="mt-3 pt-3 border-t border-amber-100">
            <p className="text-xs text-amber-700 font-medium">Tiempo puerta-punción objetivo: &lt; 90 min</p>
          </div>
        </div>
      </div>

      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Nota sobre última vez visto asintomático (LVSA)</p>
        <p className="text-sm text-neutral-600 leading-relaxed">
          Cuando el paciente no puede informar el inicio exacto (dormía, afasia, etc.), se usa la LVSA como inicio estimado. En ACV del despertar, la LVSA es la hora de dormir.
        </p>
      </Card>
    </div>
  )
}

function NihssSection() {
  const [scores, setScores] = useState({})

  const total = Object.values(scores).reduce((sum, v) => sum + (v ?? 0), 0)
  const severity = getNihssSeverity(total)
  const allAnswered = nihssItems.every(item => scores[item.id] !== undefined)

  return (
    <div className="space-y-6">
      <SectionHeader><Activity size={18} className="text-blue-600" /> Escala NIHSS — completa</SectionHeader>

      {/* Score display */}
      <div className={`rounded-2xl border ${severity.border} ${severity.bg} px-5 py-4 flex items-center justify-between`}>
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Puntaje total</p>
          <p className={`text-4xl font-bold tabular-nums ${severity.color}`}>{total}</p>
          <p className={`text-sm font-semibold mt-1 ${severity.color}`}>{severity.label}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400">{Object.keys(scores).length}/{nihssItems.length} ítems</p>
          {allAnswered && (
            <p className="text-xs font-semibold text-emerald-600 mt-1">Escala completa</p>
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        Modo educativo — las selecciones no se guardan ni afectan ningún caso.
      </p>

      {/* All NIHSS items */}
      <div className="space-y-4">
        {nihssItems.map((item) => {
          const selected = scores[item.id]
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-neutral-800 leading-snug">{item.label}</p>
                {selected !== undefined && (
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-lg ${getNihssSeverity(selected).bg} ${getNihssSeverity(selected).color} border ${getNihssSeverity(selected).border}`}>
                    {selected}
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                {item.options.map((opt) => (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => setScores(prev => ({ ...prev, [item.id]: opt.score }))}
                    className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.98] ${
                      selected === opt.score
                        ? 'bg-blue-700 border-blue-700 text-white'
                        : 'bg-neutral-50 border-neutral-100 text-neutral-700 hover:bg-blue-50 hover:border-blue-200'
                    }`}
                  >
                    <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selected === opt.score ? 'bg-white/20 text-white' : 'bg-white text-neutral-500 border border-neutral-200'
                    }`}>
                      {opt.score}
                    </span>
                    <span className="text-sm leading-snug">{opt.text}</span>
                  </button>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setScores({})}
        className="w-full py-3 rounded-xl border border-neutral-200 text-neutral-500 text-sm font-medium hover:bg-neutral-50 transition-colors"
      >
        Resetear escala
      </button>
    </div>
  )
}

function MrsSection() {
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-6">
      <SectionHeader><Shield size={18} className="text-emerald-600" /> Escala de Rankin Modificada (mRS)</SectionHeader>

      <Card className="bg-neutral-50">
        <p className="text-xs text-neutral-500 leading-relaxed">
          La mRS evalúa el grado de discapacidad o dependencia en las actividades diarias después de un ACV. Se usa para clasificar el estado funcional basal (pre-ACV) y el desenlace a los 90 días.
        </p>
      </Card>

      <p className="text-xs text-neutral-400 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        Modo educativo — la selección no se guarda.
      </p>

      <div className="space-y-2">
        {MRS_LEVELS.map((level) => (
          <button
            key={level.score}
            type="button"
            onClick={() => setSelected(selected === level.score ? null : level.score)}
            className={`w-full rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.99] ${
              selected === level.score
                ? `${level.bg} ${level.border}`
                : 'bg-white border-neutral-100 hover:border-neutral-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xl font-bold ${
                selected === level.score ? `${level.badge}` : 'bg-neutral-100 text-neutral-600'
              }`}>
                {level.score}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-semibold leading-snug ${selected === level.score ? level.text : 'text-neutral-800'}`}>
                  {level.label}
                </p>
                {level.desc && (
                  <p className={`text-xs mt-1 leading-relaxed ${selected === level.score ? level.text + '/70' : 'text-neutral-500'}`}>
                    {level.desc}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Relevancia clínica</p>
        <div className="space-y-2 text-sm text-neutral-600">
          <p><strong>mRS basal ≤ 1:</strong> Candidato ideal para trombolisis (vida independiente previa).</p>
          <p><strong>mRS basal 2–3:</strong> Evaluar individualmente; el beneficio puede ser menor.</p>
          <p><strong>mRS basal ≥ 4:</strong> Raramente se beneficia; discutir con familia y especialista.</p>
        </div>
      </Card>
    </div>
  )
}

function ContrasSection() {
  const [expanded, setExpanded] = useState({})
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="space-y-6">
      <SectionHeader><AlertTriangle size={18} className="text-blue-800" /> Contraindicaciones tPA</SectionHeader>

      <Card className="bg-blue-900/8 border-blue-200">
        <p className="text-sm text-blue-900 font-semibold mb-1">Contraindicaciones absolutas</p>
        <p className="text-xs text-blue-700">Cualquier SÍ bloquea la trombolisis IV de forma absoluta.</p>
      </Card>

      <div className="space-y-2">
        {RED_CONTRAS.map((item, i) => (
          <div key={i} className="rounded-2xl border border-blue-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(`red-${i}`)}
              className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-blue-50/50 transition-colors"
            >
              <span className="shrink-0 w-5 h-5 rounded-md bg-blue-900 flex items-center justify-center text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-900 leading-snug">{item.label}</p>
                {item.sub && <p className="text-xs text-blue-600 mt-0.5">{item.sub}</p>}
              </div>
              <ChevronRight size={14} className={`shrink-0 text-blue-300 mt-1 transition-transform ${expanded[`red-${i}`] ? 'rotate-90' : ''}`} />
            </button>
            {expanded[`red-${i}`] && (
              <div className="px-4 pb-4 pt-0 border-t border-blue-100 bg-blue-50">
                <p className="text-sm text-blue-800 leading-relaxed pt-3">{item.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <Card className="bg-amber-50 border-amber-200 mt-2">
        <p className="text-sm text-amber-800 font-semibold mb-1">Contraindicaciones relativas</p>
        <p className="text-xs text-amber-700">Requieren valoración individual riesgo/beneficio. Interconsultar con coordinación.</p>
      </Card>

      <div className="space-y-2">
        {ORANGE_CONTRAS.map((item, i) => (
          <div key={i} className="rounded-2xl border border-amber-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(`orange-${i}`)}
              className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-amber-50/50 transition-colors"
            >
              <span className="shrink-0 w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800 leading-snug">{item.label}</p>
                {item.sub && <p className="text-xs text-amber-600 mt-0.5">{item.sub}</p>}
              </div>
              <ChevronRight size={14} className={`shrink-0 text-amber-300 mt-1 transition-transform ${expanded[`orange-${i}`] ? 'rotate-90' : ''}`} />
            </button>
            {expanded[`orange-${i}`] && (
              <div className="px-4 pb-4 pt-0 border-t border-amber-100 bg-amber-50">
                <p className="text-sm text-amber-800 leading-relaxed pt-3">{item.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function DosisSection() {
  const [weight, setWeight] = useState('')

  const kg = parseFloat(weight)
  const validWeight = !isNaN(kg) && kg > 0 && kg <= 300

  const rtpaDose = validWeight ? Math.min(kg * 0.9, 90) : null
  const rtpaBolus = rtpaDose ? (rtpaDose * 0.1).toFixed(1) : null
  const rtpaInfusion = rtpaDose ? (rtpaDose * 0.9).toFixed(1) : null

  const tnkDose = validWeight ? Math.min(kg * 0.25, 25) : null

  return (
    <div className="space-y-6">
      <SectionHeader><Pill size={18} className="text-brand-600" /> Dosis y administración</SectionHeader>

      {/* Weight calculator */}
      <Card className="bg-blue-50 border-blue-200">
        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Calculator size={12} /> Calculadora de dosis
        </p>
        <label className="text-sm text-blue-800 block mb-2">Peso del paciente (kg)</label>
        <input
          type="number"
          inputMode="decimal"
          placeholder="ej. 75"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-neutral-800 text-lg font-mono focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all"
        />
      </Card>

      {/* rtPA */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-blue-900">Alteplase (rtPA)</p>
            <p className="text-xs text-blue-600 mt-0.5">0.9 mg/kg IV — máximo 90 mg</p>
          </div>
          {rtpaDose && (
            <span className="shrink-0 text-2xl font-bold text-blue-400 tabular-nums">{rtpaDose.toFixed(1)} mg</span>
          )}
        </div>
        <div className="space-y-2 pt-2 border-t border-blue-100">
          <div className="flex items-center justify-between rounded-xl bg-white border border-blue-100 px-3 py-2.5">
            <p className="text-xs font-semibold text-blue-800">Bolo IV (10%) — en 1–2 min</p>
            <span className="text-sm font-bold text-blue-900 tabular-nums">{rtpaBolus ? `${rtpaBolus} mg` : '—'}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white border border-blue-100 px-3 py-2.5">
            <p className="text-xs font-semibold text-blue-800">Infusión (90%) — en 60 min</p>
            <span className="text-sm font-bold text-blue-900 tabular-nums">{rtpaInfusion ? `${rtpaInfusion} mg` : '—'}</span>
          </div>
        </div>
      </div>

      {/* TNK */}
      <div className="rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-brand-800">Tenecteplase (TNK)</p>
            <p className="text-xs text-brand-600 mt-0.5">0.25 mg/kg IV — máximo 25 mg</p>
          </div>
          {tnkDose && (
            <span className="shrink-0 text-2xl font-bold text-brand-300 tabular-nums">{tnkDose.toFixed(1)} mg</span>
          )}
        </div>
        <div className="pt-2 border-t border-brand-100">
          <div className="flex items-center justify-between rounded-xl bg-white border border-brand-100 px-3 py-2.5">
            <p className="text-xs font-semibold text-brand-700">Bolo único en 5–10 segundos</p>
            <span className="text-sm font-bold text-brand-800 tabular-nums">{tnkDose ? `${tnkDose.toFixed(1)} mg` : '—'}</span>
          </div>
        </div>
        <p className="text-xs text-brand-600">Ventaja: bolo único facilita administración antes de la trombectomía (protocolo drip-and-ship).</p>
      </div>

      {/* Post-thrombolysis */}
      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Protocolo post-trombolisis</p>
        <div className="space-y-2">
          {[
            'NIHSS cada 15 min durante infusión, luego horario × 6h',
            'TA cada 15 min durante infusión, luego cada 30 min × 6h. Mantener < 180/105 mmHg',
            'Sin anticoagulantes ni antiagregantes por 24h post-trombolisis',
            'Sin SNG, catéteres arteriales ni venopunciones no compresibles × 24h',
            'TC control a las 24–36h (o antes si deterioro)',
            'Ingreso a UCI o unidad de stroke',
            'Evaluar trombectomía mecánica si hay oclusión de gran vaso (AngioTAC)',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 px-3 py-2.5">
              <span className="mt-0.5 w-5 h-5 rounded-md bg-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">{i + 1}</span>
              <p className="text-xs leading-relaxed text-neutral-700">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function TrombectomiaSection() {
  return (
    <div className="space-y-6">
      <SectionHeader><Activity size={18} className="text-amber-600" /> Trombectomía mecánica</SectionHeader>

      <Card className="bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800 font-semibold mb-2">Indicada en oclusión de gran vaso (OGV)</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          La trombectomía mecánica es el estándar de cuidado para OGV. Puede combinarse con trombolisis IV si no hay contraindicaciones (paradigma "bridging").
        </p>
      </Card>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Criterios de elegibilidad</p>
        {[
          { label: 'Localización del trombo', desc: 'ACI intracraneal, ACM M1 o M2 proximal, basilar, ACP P1. Solicitar AngioTAC de cabeza y cuello.' },
          { label: 'ASPECTS ≥ 6', desc: 'Cambios isquémicos moderados o leves en TC. ASPECTS < 6 puede considerarse con criterio de penumbra en perfusión-TC.' },
          { label: 'NIHSS ≥ 6', desc: 'Aunque evaluar individualmente según déficit. Pacientes con NIHSS < 6 y OGV pueden beneficiarse.' },
          { label: 'Ventana 0–6h (estándar)', desc: 'Desde inicio de síntomas o LVSA. Todos los ensayos pivotales primarios (MR CLEAN, ESCAPE, SWIFT PRIME, etc.).' },
          { label: 'Ventana 6–24h (extendida)', desc: 'Con criterios DAWN (déficit clínico/volumen de infarto) o DEFUSE-3 (penumbra por perfusión). Solo centros con perfusión-TC o RMN disponible.' },
        ].map((item, i) => (
          <div key={i} className="rounded-2xl border border-neutral-100 bg-white px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold mt-0.5">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-neutral-800">{item.label}</p>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Vasos objetivo</p>
        <div className="grid grid-cols-2 gap-2">
          {['ACI intracraneal', 'ACM M1', 'ACM M2 proximal', 'Arteria basilar', 'ACP P1', 'ACA A1 (casos seleccionados)'].map(v => (
            <div key={v} className="rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs font-semibold text-amber-800 text-center">
              {v}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Referencias clave</p>
        <div className="space-y-1.5 text-xs text-neutral-600">
          <p><strong>MR CLEAN (2015):</strong> Primer RCT positivo de trombectomía, N=500, ventana 6h.</p>
          <p><strong>ESCAPE (2015):</strong> Incluyó criterios de colaterales en AngioTAC.</p>
          <p><strong>DAWN (2018):</strong> Extendió ventana a 24h con mismatch clínico-imagen.</p>
          <p><strong>DEFUSE-3 (2018):</strong> Extendió ventana a 16h con perfusión-TC/RMN.</p>
        </div>
      </Card>
    </div>
  )
}

// ─── Main EducationalMode component ─────────────────────────────────────────
export default function EducationalMode({ onClose, initialSection = 'intro' }) {
  const [activeSection, setActiveSection] = useState(initialSection)
  const currentIdx = SECTIONS.findIndex(s => s.id === activeSection)

  function goNext() {
    if (currentIdx < SECTIONS.length - 1) setActiveSection(SECTIONS[currentIdx + 1].id)
  }
  function goPrev() {
    if (currentIdx > 0) setActiveSection(SECTIONS[currentIdx - 1].id)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':        return <IntroSection />
      case 'tiempo':       return <TiempoSection />
      case 'nihss':        return <NihssSection />
      case 'mrs':          return <MrsSection />
      case 'contras':      return <ContrasSection />
      case 'dosis':        return <DosisSection />
      case 'trombectomia': return <TrombectomiaSection />
      default:             return <IntroSection />
    }
  }

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col overflow-hidden animate-fade-in">
      {/* Amber "MODO EDUCATIVO" banner */}
      <div className="flex items-center justify-between px-4 py-3 bg-amber-400 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center shrink-0">
            <BookOpen size={15} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-widest leading-none">Modo Educativo</p>
            <p className="text-[10px] text-amber-800 mt-0.5">Solo consulta · Sin persistencia · AHA/ASA 2026</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white hover:bg-amber-700 transition-colors shrink-0"
          aria-label="Cerrar modo educativo"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex overflow-x-auto gap-1 px-3 py-2 border-b border-neutral-100 bg-neutral-50 shrink-0 scrollbar-hide">
        {SECTIONS.map((section, idx) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeSection === section.id
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
            }`}
          >
            <span className={activeSection === section.id ? 'text-white' : 'text-neutral-400'}>
              {section.icon}
            </span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {renderContent()}

          {/* Prev / Next nav */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
              {currentIdx > 0 ? SECTIONS[currentIdx - 1].label : 'Anterior'}
            </button>

            <span className="text-xs text-neutral-400 tabular-nums">
              {currentIdx + 1} / {SECTIONS.length}
            </span>

            <button
              type="button"
              onClick={goNext}
              disabled={currentIdx === SECTIONS.length - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {currentIdx < SECTIONS.length - 1 ? SECTIONS[currentIdx + 1].label : 'Fin'}
              <ChevronRight size={15} />
            </button>
          </div>

          <p className="text-center text-xs text-neutral-300 mt-6 mb-2">
            Esta herramienta es un apoyo educativo. Las decisiones clínicas siempre deben individualizarse.
          </p>
        </div>
      </div>
    </div>
  )
}
