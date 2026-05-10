import { useState } from 'react'
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react'
import StepCard from '../components/StepCard'

const WEIGHT_PRESETS = [50, 60, 70, 80, 90, 100]

const POST_CHECKLIST = [
  {
    id: 'icu',
    label: 'Monitoreo continuo en UTI / Shockroom',
    sub: 'ECG, SatO₂, PANI cada 15 min las primeras 2h',
    emoji: '🏥',
  },
  {
    id: 'no_invasive',
    label: 'Evitar procedimientos invasivos 24h',
    sub: 'NO sonda vesical, SNG ni vía arterial',
    emoji: '🚫',
  },
  {
    id: 'no_antithrombotic',
    label: 'NO heparina ni antiagregantes 24h',
    sub: 'Iniciar antitrombóticos solo después de TC de control',
    emoji: '💊',
  },
  {
    id: 'bp_control',
    label: 'Control de TA estricto post-trombolisis',
    sub: 'c/15 min × 2h → c/30 min × 6h → c/1h × 16h  ·  Meta: < 180/105 mmHg',
    emoji: '📊',
  },
  {
    id: 'serial_nihss',
    label: 'NIHSS seriado',
    sub: 'Al inicio · 30 min · 1h · 2h · 6h · 24h',
    emoji: '🧠',
  },
  {
    id: 'ct_control',
    label: 'TC de control a las 24h',
    sub: 'Antes de iniciar anticoagulación o antiagregantes',
    emoji: '🔬',
  },
  {
    id: 'cardiology',
    label: 'Solicitar ecocardiograma y Holter',
    sub: 'Estudio de fuente embólica cardíaca',
    emoji: '❤️',
  },
]

function round1(n) {
  return Math.round(n * 10) / 10
}

function calcRtPA(kg) {
  const total = Math.min(round1(kg * 0.9), 90)
  const bolo = round1(total * 0.1)
  const infusion = round1(total * 0.9)
  return { total, bolo, infusion }
}

function calcTNK(kg) {
  const total = Math.min(round1(kg * 0.25), 25)
  return { total }
}

export default function DosageStep({ onConfirm }) {
  const [drug, setDrug] = useState('tnk')
  const [weightStr, setWeightStr] = useState('')
  const [checked, setChecked] = useState({})

  const weight = parseFloat(weightStr)
  const validWeight = !isNaN(weight) && weight > 0 && weight <= 250

  const rtpa = validWeight ? calcRtPA(weight) : null
  const tnk = validWeight ? calcTNK(weight) : null
  const dose = drug === 'tnk' ? tnk : rtpa

  const allChecked = POST_CHECKLIST.every((item) => checked[item.id])
  const canContinue = validWeight && allChecked

  function adjust(delta) {
    const current = parseFloat(weightStr) || 0
    const next = Math.max(1, Math.min(250, current + delta))
    setWeightStr(String(next))
  }

  function toggleCheck(id) {
    setChecked((c) => ({ ...c, [id]: !c[id] }))
  }

  return (
    <div className="px-4 pb-4 space-y-3">

      {/* Drug selector */}
      <StepCard step="8" title="Cálculo de dosis" accent="green">
        <p className="text-xs text-gray-400 mb-4">Seleccioná el trombolítico a utilizar.</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            onClick={() => setDrug('tnk')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              drug === 'tnk'
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            TNK
            <span className={`block text-xs font-normal mt-0.5 ${drug === 'tnk' ? 'text-green-100' : 'text-gray-400'}`}>
              Preferido AHA 2026
            </span>
          </button>
          <button
            onClick={() => setDrug('rtpa')}
            className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              drug === 'rtpa'
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50'
            }`}
          >
            rtPA
            <span className={`block text-xs font-normal mt-0.5 ${drug === 'rtpa' ? 'text-green-100' : 'text-gray-400'}`}>
              Alteplase
            </span>
          </button>
        </div>

        {/* Weight input */}
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
          Peso del paciente (kg)
        </label>

        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => adjust(-5)}  className="px-3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all">−5</button>
          <button onClick={() => adjust(-1)}  className="px-3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all">−1</button>
          <input
            type="number"
            inputMode="decimal"
            placeholder="kg"
            value={weightStr}
            onChange={(e) => setWeightStr(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-gray-800 text-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent placeholder-gray-300"
          />
          <button onClick={() => adjust(+1)}  className="px-3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all">+1</button>
          <button onClick={() => adjust(+5)}  className="px-3 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 active:scale-95 transition-all">+5</button>
        </div>

        {/* Weight presets */}
        <div className="flex gap-2 flex-wrap mb-4">
          {WEIGHT_PRESETS.map((w) => (
            <button
              key={w}
              onClick={() => setWeightStr(String(w))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                weightStr === String(w)
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-200 text-gray-500 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {w} kg
            </button>
          ))}
        </div>

        {/* Dose result */}
        {validWeight && dose && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 animate-fade-in space-y-3">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              {drug === 'tnk' ? 'Tenecteplase (TNK)' : 'Alteplase (rtPA)'} — {weight} kg
            </p>

            {drug === 'tnk' && tnk && (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-800">{tnk.total} mg</span>
                <span className="text-sm text-green-600">bolo único IV</span>
              </div>
            )}

            {drug === 'rtpa' && rtpa && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-800">{rtpa.total} mg</span>
                  <span className="text-sm text-green-600">dosis total</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                    <p className="text-xs text-gray-500 mb-0.5">Bolo IV (10%)</p>
                    <p className="text-lg font-bold text-green-800">{rtpa.bolo} mg</p>
                    <p className="text-xs text-gray-400">en 1 min</p>
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 border border-green-200">
                    <p className="text-xs text-gray-500 mb-0.5">Infusión (90%)</p>
                    <p className="text-lg font-bold text-green-800">{rtpa.infusion} mg</p>
                    <p className="text-xs text-gray-400">en 60 min</p>
                  </div>
                </div>
              </div>
            )}

            {drug === 'tnk' && weight * 0.25 >= 25 && (
              <p className="text-xs text-green-600">⚠ Dosis máxima aplicada (25 mg)</p>
            )}
            {drug === 'rtpa' && weight * 0.9 >= 90 && (
              <p className="text-xs text-green-600">⚠ Dosis máxima aplicada (90 mg)</p>
            )}
          </div>
        )}
      </StepCard>

      {/* Post-thrombolysis checklist */}
      <StepCard step="" title="Indicaciones post-trombolisis" accent="green">
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
          Confirmá cada medida antes de continuar.
        </p>
        <div className="space-y-2">
          {POST_CHECKLIST.map((item) => {
            const done = !!checked[item.id]
            return (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                  done ? 'bg-green-50 border-green-400' : 'border-gray-200 hover:border-green-300 hover:bg-green-50/40'
                }`}
              >
                <span className="text-xl shrink-0 mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${done ? 'text-green-800 line-through decoration-green-400' : 'text-gray-700'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.sub}</p>
                </div>
                <div className="shrink-0 mt-0.5">
                  {done
                    ? <CheckCircle2 size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300" />
                  }
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-3 bg-white rounded-xl border border-gray-100 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Progreso</span>
            <span className="text-xs font-semibold text-gray-600">
              {Object.values(checked).filter(Boolean).length}/{POST_CHECKLIST.length}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(Object.values(checked).filter(Boolean).length / POST_CHECKLIST.length) * 100}%` }}
            />
          </div>
        </div>
      </StepCard>

      <button
        onClick={() => onConfirm({ drug, weight, dose, checklist: checked })}
        disabled={!canContinue}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Finalizar protocolo <ChevronRight size={18} />
      </button>
    </div>
  )
}
