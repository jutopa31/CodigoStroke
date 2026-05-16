import { useState } from 'react'
import { User, CreditCard, Lock, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react'
import StepCard from '../components/StepCard'

const MRS_OPTIONS = [
  { score: 0, label: 'Sin sintomas' },
  { score: 1, label: 'Sin discapacidad significativa' },
  { score: 2, label: 'Discapacidad leve' },
  { score: 3, label: 'Discapacidad moderada' },
  { score: 4, label: 'Moderadamente severa' },
  { score: 5, label: 'Discapacidad severa' },
]

function VitalAlert({ message }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-500" />
      <p className="text-xs leading-relaxed text-red-600">{message}</p>
    </div>
  )
}

export default function PatientStep({ onConfirm, confirmed = false, patient = null, patientId = null, arrivalTime = null, vitals = null }) {
  const [dni, setDni] = useState('')
  const [name, setName] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [sys, setSys] = useState('')
  const [dia, setDia] = useState('')
  const [glucose, setGlucose] = useState('')
  const [mrs, setMrs] = useState('')
  const [showMrsHelp, setShowMrsHelp] = useState(false)

  const sysNum = parseFloat(sys)
  const diaNum = parseFloat(dia)
  const glucNum = parseFloat(glucose)
  const mrsNum = parseInt(mrs, 10)

  const taCritical = sys && sysNum > 185
  const taDiaCritical = dia && diaNum > 110
  const glucLow = glucose && glucNum < 50
  const glucHigh = glucose && glucNum > 400
  const mrsValid = mrs !== '' && mrsNum >= 0 && mrsNum <= 5

  const valid =
    dni.trim().length >= 7 &&
    name.trim().length >= 2 &&
    sys && dia && glucose && mrsValid

  const showHint = !valid && (dni.length > 0 || name.length > 0)

  function handleMrsChange(value) {
    const digit = value.replace(/\D/g, '').slice(0, 1)
    if (digit === '' || Number(digit) <= 5) setMrs(digit)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onConfirm({
      dni: dni.trim(),
      name: name.trim(),
      passphrase: passphrase.trim(),
      systolic: sysNum,
      diastolic: diaNum,
      glucose: glucNum,
      modifiedRankinScale: { score: mrsNum, label: MRS_OPTIONS.find(o => o.score === mrsNum)?.label ?? '' },
    })
  }

  // Confirmed / locked state
  if (confirmed && patient) {
    const v = vitals
    return (
      <div className="px-4 pb-2">
        <StepCard step="1" title="Datos del paciente" accent="green">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800">{patient.name}</p>
              <p className="text-sm text-gray-400 mt-0.5">DNI {patient.dni}</p>
            </div>
            <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
          </div>
          {patientId && (
            <div className="pt-2 border-t border-gray-100 mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider">ID del caso</p>
              <p className="text-base font-mono font-bold text-brand-600 tracking-widest">{patientId}</p>
            </div>
          )}
          {v && (
            <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">TA</p>
                <p className={`text-sm font-bold ${v.systolic > 185 || v.diastolic > 110 ? 'text-red-600' : 'text-gray-800'}`}>
                  {v.systolic}/{v.diastolic}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">GLC</p>
                <p className={`text-sm font-bold ${v.glucose < 50 || v.glucose > 400 ? 'text-red-600' : 'text-gray-800'}`}>
                  {v.glucose} <span className="text-[10px] font-normal">mg/dL</span>
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-2 py-1.5">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">mRS</p>
                <p className="text-sm font-bold text-gray-800">{v.modifiedRankinScale?.score ?? '—'}</p>
              </div>
            </div>
          )}
          {arrivalTime && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Llegada</p>
              <p className="text-sm font-mono font-semibold text-gray-700">
                {arrivalTime.toLocaleTimeString('es-AR')}
              </p>
            </div>
          )}
        </StepCard>
      </div>
    )
  }

  return (
    <div className="px-4 pb-4">
      <StepCard step="1" title="Datos del paciente" accent="red">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Identificación */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <CreditCard size={13} /> DNI
              </label>
              <input
                type="number"
                inputMode="numeric"
                placeholder="Número de documento"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <User size={13} /> Nombre y apellido
              </label>
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Lock size={13} /> Contraseña de turno
            </label>
            <input
              type="password"
              placeholder="Frase de acceso"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-gray-300"
            />
          </div>

          {/* Separador signos vitales */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Signos vitales y funcionalidad previa</p>

            <div className="space-y-2">
              {/* TAS */}
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600 w-36 shrink-0">
                  TA sistólica <span className="text-xs font-normal text-slate-400">mmHg</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="185"
                  value={sys}
                  onChange={(e) => setSys(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={`h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
                    taCritical
                      ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : sys
                      ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </label>

              {/* TAD */}
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600 w-36 shrink-0">
                  TA diastólica <span className="text-xs font-normal text-slate-400">mmHg</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="110"
                  value={dia}
                  onChange={(e) => setDia(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={`h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
                    taDiaCritical
                      ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : dia
                      ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </label>

              {/* Glucemia */}
              <label className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600 w-36 shrink-0">
                  Glucemia <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="120"
                  value={glucose}
                  onChange={(e) => setGlucose(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  className={`h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
                    glucLow || glucHigh
                      ? 'border-red-400 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                      : glucose
                      ? 'border-blue-400 bg-blue-50/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                      : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </label>

              {/* mRS */}
              <div className="flex items-center justify-between gap-3 relative">
                <span className="text-sm font-semibold text-slate-600 w-36 shrink-0 flex items-center gap-1">
                  mRS previo
                  <button
                    type="button"
                    onMouseEnter={() => setShowMrsHelp(true)}
                    onMouseLeave={() => setShowMrsHelp(false)}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    <HelpCircle size={12} />
                  </button>
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  placeholder="0-5"
                  value={mrs}
                  onChange={(e) => handleMrsChange(e.target.value)}
                  className={`h-10 w-24 rounded-lg border-2 bg-slate-50 px-2 text-center text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-300 ${
                    mrsValid
                      ? 'border-slate-500 bg-slate-50 focus:border-slate-600 focus:ring-2 focus:ring-slate-100'
                      : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'
                  }`}
                />
                {showMrsHelp && (
                  <div className="absolute right-0 top-[46px] z-30 w-56 rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-xl">
                    {MRS_OPTIONS.map((o) => (
                      <div key={o.score} className="grid grid-cols-[18px_1fr] gap-1.5 py-0.5">
                        <span className="font-bold text-slate-900">{o.score}</span>
                        <span className="text-slate-600">{o.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {(taCritical || taDiaCritical || glucLow || glucHigh) && (
              <div className="mt-2 space-y-1.5">
                {taCritical && <VitalAlert message="TA sistólica >185 mmHg: ajustar antes de trombolisis." />}
                {!taCritical && taDiaCritical && <VitalAlert message="TA diastólica >110 mmHg: ajustar antes de trombolisis." />}
                {glucLow && <VitalAlert message="Hipoglucemia <50 mg/dL: corregir; puede mimetizar ACV." />}
                {glucHigh && <VitalAlert message="Hiperglucemia >400 mg/dL: controlar antes de proceder." />}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-semibold py-4 rounded-xl transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Confirmar datos <ChevronRight size={18} />
          </button>

          {showHint && (
            <p className="text-xs text-gray-400 text-center animate-fade-in">
              {dni.length < 7 && name.trim().length < 2
                ? 'Completá el DNI (mín. 7 dígitos) y el nombre'
                : dni.length < 7
                ? 'El DNI debe tener al menos 7 dígitos'
                : !sys || !dia || !glucose
                ? 'Completá los signos vitales'
                : !mrsValid
                ? 'Ingresá el mRS (0-5)'
                : 'El nombre debe tener al menos 2 caracteres'}
            </p>
          )}
        </form>
      </StepCard>
    </div>
  )
}
