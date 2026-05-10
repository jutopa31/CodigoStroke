import { useState } from 'react'
import { X, Clock, Pill, AlertTriangle } from 'lucide-react'

const ANTECEDENTES = [
  { id: 'hta',       label: 'HTA' },
  { id: 'fa',        label: 'Fibrilación auricular' },
  { id: 'acv',       label: 'ACV / AIT previo' },
  { id: 'dm',        label: 'Diabetes mellitus' },
  { id: 'ci',        label: 'Cardiopatía isquémica' },
  { id: 'ic',        label: 'Insuficiencia cardíaca' },
  { id: 'valvular',  label: 'Valvulopatía' },
]

const ANTICOAGULANTES = [
  'Rivaroxabán', 'Apixabán', 'Dabigatrán', 'Edoxabán',
  'Warfarina', 'Acenocumarol', 'HBPM', 'HNF',
]
const ACOD = ['Rivaroxabán', 'Apixabán', 'Dabigatrán', 'Edoxabán']

const ANTIPLAQUETARIOS = ['AAS', 'Clopidogrel', 'Ticagrelor', 'Prasugrel']

const DECISIONES = [
  { id: 'trombo',     label: 'Evaluar trombectomía mecánica' },
  { id: 'conserv',   label: 'Manejo conservador' },
  { id: 'neuro',     label: 'Interconsulta Neurología' },
  { id: 'neurocx',   label: 'Interconsulta Neurocirugía' },
]

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon size={13} className="text-slate-500" />}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
    </div>
  )
}

export default function OutOfWindowModal({ patient, onClose, onSave }) {
  const [antecedentes, setAntecedentes] = useState({})
  const [antecOtro, setAntecOtro] = useState('')
  const [sintomas, setSintomas] = useState('')
  const [ultimoVisto, setUltimoVisto] = useState(toLocalInput(new Date()))
  const [llegada, setLlegada] = useState(toLocalInput(new Date()))
  const [anticoagulante, setAnticoagulante] = useState('')
  const [antiplaquetario, setAntiplaquetario] = useState('')
  const [medOtro, setMedOtro] = useState('')
  const [nihss, setNihss] = useState('')
  const [decision, setDecision] = useState(null)

  const isAcod = ACOD.includes(anticoagulante)

  function toggleAntec(id) {
    setAntecedentes((a) => ({ ...a, [id]: !a[id] }))
  }

  function handleSave() {
    onSave?.({
      antecedentes: { ...antecedentes, otro: antecOtro || undefined },
      horarios: { sintomas: sintomas || undefined, ultimoVisto, llegada },
      medicacion: {
        anticoagulante: anticoagulante || undefined,
        antiplaquetario: antiplaquetario || undefined,
        otro: medOtro || undefined,
      },
      nihss: nihss !== '' ? parseInt(nihss, 10) : undefined,
      decision,
      registeredAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md max-h-[92dvh] rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl">

        {/* Header fijo */}
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider leading-none mb-0.5">Protocolo alternativo</p>
            <h2 className="font-semibold text-base leading-tight">ACV fuera de ventana</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="overflow-y-auto px-5 py-4 space-y-6 flex-1">

          {/* Paciente */}
          {patient && (
            <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Paciente</p>
              <p className="font-semibold text-slate-800 text-sm">{patient.name}</p>
              <p className="text-xs text-slate-500">DNI {patient.dni}</p>
            </div>
          )}

          {/* Antecedentes */}
          <section>
            <SectionTitle label="Antecedentes relevantes" />
            <div className="space-y-2">
              {ANTECEDENTES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleAntec(id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-colors ${
                    antecedentes[id]
                      ? 'bg-slate-100 border-slate-400 text-slate-800 font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-slate-300'
                  }`}
                >
                  {label}
                  <span className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    antecedentes[id] ? 'bg-slate-700 border-slate-700' : 'border-gray-300'
                  }`}>
                    {antecedentes[id] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              ))}
              <input
                type="text"
                placeholder="Otro antecedente..."
                value={antecOtro}
                onChange={(e) => setAntecOtro(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300"
              />
            </div>
          </section>

          {/* Horarios */}
          <section>
            <SectionTitle icon={Clock} label="Horarios" />
            <div className="space-y-3">
              {[
                { label: 'Inicio de síntomas', value: sintomas, set: setSintomas, optional: true },
                { label: 'Última vez visto asintomático', value: ultimoVisto, set: setUltimoVisto },
                { label: 'Llegada a guardia', value: llegada, set: setLlegada },
              ].map(({ label, value, set, optional }) => (
                <div key={label}>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    {label}{optional && <span className="text-gray-400 ml-1">(si se conoce)</span>}
                  </label>
                  <input
                    type="datetime-local"
                    value={value}
                    max={toLocalInput(new Date())}
                    onChange={(e) => set(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Medicación */}
          <section>
            <SectionTitle icon={Pill} label="Medicación habitual" />
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Anticoagulante</label>
                <select
                  value={anticoagulante}
                  onChange={(e) => setAnticoagulante(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="">Sin anticoagulante</option>
                  <optgroup label="ACOD / NOAC">
                    {ACOD.map((a) => <option key={a} value={a}>{a}</option>)}
                  </optgroup>
                  <optgroup label="AVK">
                    <option value="Warfarina">Warfarina</option>
                    <option value="Acenocumarol">Acenocumarol</option>
                  </optgroup>
                  <optgroup label="Heparina">
                    <option value="HBPM">HBPM</option>
                    <option value="HNF">HNF</option>
                  </optgroup>
                </select>
                {isAcod && (
                  <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                    <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 leading-relaxed">
                      ACOD activo — contraindicación relativa para trombolisis IV. Verificar última dosis, tiempo transcurrido y función renal.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Antiplaquetario</label>
                <select
                  value={antiplaquetario}
                  onChange={(e) => setAntiplaquetario(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
                >
                  <option value="">Sin antiplaquetario</option>
                  {ANTIPLAQUETARIOS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <input
                type="text"
                placeholder="Otra medicación relevante..."
                value={medOtro}
                onChange={(e) => setMedOtro(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400 placeholder-gray-300"
              />
            </div>
          </section>

          {/* NIHSS */}
          <section>
            <SectionTitle label="NIHSS al ingreso" />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={42}
              placeholder="0 – 42"
              value={nihss}
              onChange={(e) => setNihss(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </section>

          {/* Decisión */}
          <section>
            <SectionTitle label="Decisión clínica" />
            <div className="space-y-2">
              {DECISIONES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDecision(id)}
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-sm font-medium text-left transition-all active:scale-95 ${
                    decision === id
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'border-gray-200 text-gray-700 hover:border-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Botón guardar */}
          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all"
          >
            Registrar evaluación
          </button>

          <div className="h-2" />
        </div>
      </div>
    </div>
  )
}
