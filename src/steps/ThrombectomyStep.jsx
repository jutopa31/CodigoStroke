import { useState } from 'react'
import { ChevronRight, Bell } from 'lucide-react'
import StepCard from '../components/StepCard'

export default function ThrombectomyStep({ nihssScore, onConfirm }) {
  const [angioRequested, setAngioRequested] = useState(null)
  const [notified, setNotified] = useState(false)

  const highNihss = nihssScore >= 6

  return (
    <div className="px-4 pb-4 space-y-3">
      <StepCard step="9" title="Trombectomía mecánica — Evaluación" accent="blue">

        {highNihss && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700">
              NIHSS {nihssScore} — considerar oclusión de gran vaso (OGV)
            </p>
          </div>
        )}

        <p className="text-sm font-medium text-gray-700 mb-4">
          ¿Se solicitó AngioTAC de encéfalo y cuello para descartar OGV?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setAngioRequested(false); setNotified(false) }}
            className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
              angioRequested === false
                ? 'bg-gray-300 border-gray-300 text-gray-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            NO
          </button>
          <button
            onClick={() => setAngioRequested(true)}
            className={`py-5 rounded-xl border-2 font-bold text-xl transition-all active:scale-95 ${
              angioRequested === true
                ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                : 'border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            SÍ
          </button>
        </div>

        {angioRequested === false && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 animate-fade-in">
            <p className="text-xs font-semibold text-amber-700 mb-1">
              {highNihss ? '⚠ NIHSS ≥ 6 — considerar solicitar AngioTAC' : '⚠ Considerar AngioTAC si hay sospecha clínica de OGV'}
            </p>
            <p className="text-xs text-amber-600 leading-relaxed">
              Ventana para trombectomía: hasta 6h (estándar) · hasta 24h con perfusión favorable (DAWN/DEFUSE-3).
            </p>
          </div>
        )}

        {angioRequested === true && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-blue-700 mb-1">
                AngioTAC solicitada — pendiente resultado
              </p>
              <p className="text-xs text-blue-600 leading-relaxed">
                Si confirma oclusión de ICA, M1 o M2 → derivar a centro con angiógrafo.
              </p>
            </div>

            <button
              onClick={() => setNotified(true)}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                notified
                  ? 'bg-emerald-600 border-2 border-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white'
              }`}
            >
              <Bell size={17} />
              {notified ? '✓ Hemodinamia notificada' : 'Notificar al servicio de Hemodinamia'}
            </button>
          </div>
        )}
      </StepCard>

      <button
        onClick={() => onConfirm({ angioRequested, hemodinamisNotified: notified })}
        disabled={angioRequested === null}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Finalizar protocolo <ChevronRight size={18} />
      </button>
    </div>
  )
}
