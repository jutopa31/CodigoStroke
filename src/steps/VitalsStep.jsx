import { useState, useEffect } from 'react'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import StepCard from '../components/StepCard'
import { PrimaryAction, SectionPrompt } from '../components/GuidedControls'

function VitalAlert({ message }) {
  return (
    <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
      <p className="text-xs text-red-600 leading-relaxed">{message}</p>
    </div>
  )
}

export default function VitalsStep({ onConfirm }) {
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)

  const taCritical = sys && dia && sysNum > 185
  const taDia = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400

  const valid = sys && dia && glucose

  function handleSubmit() {
    if (!valid) return
    onConfirm({ systolic: sysNum, diastolic: diaNum, glucose: glucNum })
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Enter' && valid) handleSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [valid])

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="2" title="SV y Status previo" accent="blue">
        <SectionPrompt
          tone="blue"
          title="Completa tension arterial y glucemia"
          helper="Los campos completos quedan marcados; los valores criticos se destacan en rojo."
          complete={Boolean(valid)}
        />
        {/* TA */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Tensión arterial (mmHg)
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Sistólica"
                value={sys}
                onChange={(e) => setSys(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 placeholder-gray-300 ${
                  taCritical ? 'border-red-400 bg-red-50/40 focus:ring-red-400' : sys ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100 focus:ring-blue-400' : 'border-gray-200 focus:ring-blue-400'
                }`}
              />
            </div>
            <span className="text-gray-300 font-light text-2xl">/</span>
            <div className="flex-1">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Diastólica"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 placeholder-gray-300 ${
                  taDia ? 'border-red-400 bg-red-50/40 focus:ring-red-400' : dia ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100 focus:ring-blue-400' : 'border-gray-200 focus:ring-blue-400'
                }`}
              />
            </div>
          </div>
          {taCritical && <VitalAlert message="TA sistólica >185 mmHg — ajustar antes de trombolisis (meta: ≤185/110)" />}
          {!taCritical && taDia && <VitalAlert message="TA diastólica >110 mmHg — ajustar antes de trombolisis" />}
        </div>

        {/* Glucemia */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
            Glucemia (mg/dL)
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ej: 120"
            value={glucose}
            onChange={(e) => setGlucose(e.target.value)}
            className={`w-full border rounded-xl px-4 py-3.5 text-gray-800 text-base focus:outline-none focus:ring-2 placeholder-gray-300 ${
              glucLow || glucHigh ? 'border-red-400 bg-red-50/40 focus:ring-red-400' : glucose ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-100 focus:ring-blue-400' : 'border-gray-200 focus:ring-blue-400'
            }`}
          />
          {glucLow && <VitalAlert message="Hipoglucemia (<50 mg/dL) — corregir antes de proceder. Puede mimetizar ACV." />}
          {glucHigh && <VitalAlert message="Hiperglucemia severa (>400 mg/dL) — controlar. Empeora pronóstico neurológico." />}
        </div>
      </StepCard>

      <PrimaryAction
        onClick={handleSubmit}
        valid={Boolean(valid)}
        disabledLabel="Completa signos vitales para continuar"
      >
        Continuar <ChevronRight size={18} />
      </PrimaryAction>
    </div>
  )
}
