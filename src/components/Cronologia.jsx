import { Fragment, useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { getTimerTone } from '../lib/timerTone'

// ── Formatters ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0')

function fmtClock(value) {
  if (!value) return '--:--'
  const d = value instanceof Date ? value : new Date(value)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// Live running counters → H:MM:SS once past an hour, else MM:SS
function fmtTimer(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`
}

// Gap between two milestones → "1 h 18 m" / "18 m"
function fmtDelta(minutes) {
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h > 0 && mm > 0) return `${h} h ${mm} m`
  if (h > 0) return `${h} h`
  return `${mm} m`
}

function ms(value) {
  if (!value) return null
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

const IV_WINDOW_MS = 270 * 60 * 1000 // 4.5 h

const DOT = {
  symptom: 'bg-orange-500',
  done: 'bg-emerald-500',
  pending: 'bg-stroke-panel border border-stroke-line',
}

/**
 * Único panel de tiempos del protocolo (reemplaza al TimestampPanel + badges del
 * header). Timer hero "desde código" + línea de tiempo con deltas clínicos +
 * gauge de ventana IV. Al hacer hover sobre "Inicio de síntomas" aparece un
 * segundo cronómetro corriendo desde el inicio de síntomas.
 */
export default function Cronologia({ codeStart, symptomOnset, ct, thrombolytic, hemo }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const codeMs = ms(codeStart)
  const symptomMs = ms(symptomOnset)

  const codeElapsedSec = codeMs ? (now - codeMs) / 1000 : 0
  const tone = getTimerTone(codeElapsedSec / 60)

  // ── Ventana IV gauge ──
  const ivEndMs = symptomMs ? symptomMs + IV_WINDOW_MS : null
  const symptomElapsedMin = symptomMs ? (now - symptomMs) / 60000 : 0
  const remainingMin = ivEndMs ? Math.max(0, (ivEndMs - now) / 60000) : 0
  const inWindow = remainingMin > 0
  const fillPct = Math.min(Math.max(symptomElapsedMin / 270, 0), 1) * 100

  // ── Línea de tiempo ──
  const rows = [
    { key: 'symptom', label: 'Inicio de síntomas', sub: 'último visto asintomático', time: symptomMs, dot: 'symptom', live: true },
    { key: 'code', label: 'Código activado', time: codeMs, dot: 'done' },
    { key: 'ct', label: 'TC solicitada', time: ms(ct), dot: 'done' },
    { key: 'thrombolytic', label: 'Trombolisis', time: ms(thrombolytic), dot: 'pending' },
    { key: 'hemo', label: 'Hemodinamia', time: ms(hemo), dot: 'pending' },
  ]
  const timeByKey = Object.fromEntries(rows.map((r) => [r.key, r.time]))

  // Deltas que se muestran bajo una fila, hacia el siguiente hito
  const deltas = {
    symptom: { to: 'code', render: (d) => `+ ${fmtDelta(d)}` },
    code: { to: 'ct', render: (d) => `puerta–TC ${fmtDelta(d)}` },
  }

  return (
    <div className="rounded-lg border border-stroke-line bg-stroke-navy p-3">
      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-stroke-textMuted">
        Cronología
      </p>

      {/* Timer hero — desde inicio de código */}
      <div className="flex items-baseline gap-2 pb-2.5 mb-2.5 border-b border-stroke-line">
        <span className={`font-mono font-bold text-[2rem] leading-none tabular-nums tracking-tight transition-colors duration-500 ${tone.text}`}>
          {codeMs ? fmtTimer(codeElapsedSec) : '--:--'}
        </span>
        <span className={`w-2 h-2 rounded-full self-center animate-pulse-subtle ${tone.dot}`} aria-hidden="true" />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-stroke-textMuted leading-tight">
          desde<br />código
        </span>
      </div>

      {/* Línea de tiempo vertical con deltas */}
      <div className="relative pl-[18px]">
        <span className="absolute left-[5px] top-2 bottom-2 w-[2px] rounded bg-stroke-line" aria-hidden="true" />
        {rows.map((row) => {
          const isPending = !row.time
          const delta = deltas[row.key]
          const nextTime = delta && timeByKey[delta.to]
          const showDelta = delta && row.time && nextTime
          return (
            <Fragment key={row.key}>
              {row.live ? (
                <div className="group relative -mx-1.5 flex items-baseline justify-between gap-2 rounded-md px-1.5 py-1.5 transition-colors hover:bg-indigo-500/15">
                  <span className={`absolute -left-[12.5px] top-[11px] w-[9px] h-[9px] rounded-full border-2 border-stroke-navy ${DOT[row.dot]}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold leading-tight text-stroke-text">{row.label}</span>
                    {row.sub && (
                      <span className="block text-[9px] font-semibold uppercase tracking-wide text-stroke-textMuted/70">{row.sub}</span>
                    )}
                  </span>
                  {/* Hora fija → se oculta en hover */}
                  <span className="font-mono text-[13px] font-semibold text-stroke-text group-hover:hidden">
                    {fmtClock(row.time)}
                  </span>
                  {/* Cronómetro vivo desde síntomas → aparece en hover */}
                  <span className="hidden items-baseline gap-1 group-hover:flex">
                    <span className="font-mono text-[15px] font-bold tabular-nums leading-none text-indigo-300">
                      {fmtTimer(symptomElapsedMin * 60)}
                    </span>
                    <ArrowUp size={11} strokeWidth={2.5} className="text-indigo-300" />
                  </span>
                </div>
              ) : (
                <div className="relative flex items-baseline justify-between gap-2 py-1.5">
                  <span className={`absolute -left-[12.5px] top-[11px] w-[9px] h-[9px] rounded-full border-2 border-stroke-navy ${DOT[row.dot]}`} aria-hidden="true" />
                  <span className={`text-xs font-semibold ${isPending ? 'text-stroke-textMuted/60' : 'text-stroke-text'}`}>
                    {row.label}
                  </span>
                  <span className={`font-mono text-[13px] font-semibold ${isPending ? 'text-stroke-textMuted/60' : 'text-stroke-text'}`}>
                    {row.time ? fmtClock(row.time) : '—'}
                  </span>
                </div>
              )}
              {showDelta && (
                <div className="pl-1.5 pb-0.5 text-[9px] font-semibold text-stroke-textMuted/70">
                  {delta.render((nextTime - row.time) / 60000)}
                </div>
              )}
            </Fragment>
          )
        })}
      </div>

      {/* Gauge — ventana IV (4.5 h desde síntomas) */}
      {symptomMs && (
        <div className="mt-3 pt-2.5 border-t border-stroke-line">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-stroke-textMuted">
              Ventana IV · 4.5 h
            </span>
            <span className="text-[10px] text-stroke-textMuted">
              {inWindow ? (
                <>quedan <b className="font-mono font-bold text-[13px] text-emerald-400">{`${Math.floor(remainingMin / 60)}:${pad(Math.round(remainingMin % 60))}`}</b></>
              ) : (
                <b className="font-mono font-bold text-[12px] text-status-critical">fuera de ventana</b>
              )}
            </span>
          </div>
          <div className="relative h-2 rounded-full bg-stroke-panel">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ${inWindow ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-status-critical'}`}
              style={{ width: `${fillPct}%` }}
            />
            <div
              className="absolute -top-[3px] w-[3px] h-[14px] -translate-x-1/2 rounded bg-white shadow transition-[left] duration-500"
              style={{ left: `${fillPct}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="flex justify-between mt-1 text-[9px] font-semibold text-stroke-textMuted/70">
            <span>{fmtClock(symptomMs)}</span>
            <span className="text-amber-300">{fmtClock(ivEndMs)} límite</span>
          </div>
        </div>
      )}
    </div>
  )
}
