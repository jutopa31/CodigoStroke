import { useEffect, useState } from 'react'
import { Clock, Activity, RotateCcw, BookOpen, User, Sun, Moon } from 'lucide-react'
import { getTimerTone } from '../lib/timerTone'

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

function fmtClock(ts) {
  const d = ts instanceof Date ? ts : new Date(ts)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function EventBadge({ label, time, badgeClass, compact = false }) {
  return (
    <span className={`flex items-center gap-1 rounded-md whitespace-nowrap ${compact ? 'px-2.5 py-1.5' : 'px-2 py-0.5'} ${badgeClass}`}>
      <span className={`${compact ? 'text-[10px]' : 'text-[9px]'} font-semibold uppercase tracking-wide opacity-75`}>{label}</span>
      <span className={`${compact ? 'text-[11px]' : 'text-[10px]'} font-mono font-bold`}>{fmtClock(time)}</span>
    </span>
  )
}

function getEventBadges(startTime, timestamps) {
  if (!startTime) return []
  return [
    { label: 'Código', time: startTime },
    timestamps.ctRequest && { label: 'TC', time: timestamps.ctRequest },
    timestamps.thrombolyticStart && { label: 'Trombolisis', time: timestamps.thrombolyticStart },
    timestamps.angioRequest && { label: 'Hemodinamia', time: timestamps.angioRequest },
  ].filter(Boolean)
}

// "CÓDIGO STROKE" eyebrow + optional PASO X/Y pill (HANDOFF_SPEC header strip)
function HeaderStrip({ stepLabel }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stroke-iconActive shrink-0">
        Código Stroke
      </span>
      {stepLabel && (
        <span className="rounded-full border border-stroke-iconActive/30 bg-stroke-iconActive/15 px-2.5 py-0.5 text-[10px] font-semibold text-stroke-iconActive shrink-0">
          {stepLabel}
        </span>
      )}
    </div>
  )
}

function HeaderActions({ authUser, onAuthClick, onEducationalOpen, onReset, onToggleTheme, theme, size = 'mobile' }) {
  const base = size === 'mobile'
    ? 'w-10 h-10 rounded-xl'
    : 'w-7 h-7 rounded-lg'
  // Timer bar is always dark — buttons use hardcoded dark styles
  const cls = `${base} border border-[#29416D] bg-[#0F1C38] flex items-center justify-center text-white hover:bg-[#1E3356] transition-colors shrink-0`
  return (
    <div className="flex items-center gap-2 shrink-0">
      {onToggleTheme && (
        <button type="button" onClick={onToggleTheme} className={cls}
          title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'} aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}>
          {theme === 'light'
            ? <Moon size={14} strokeWidth={2} />
            : <Sun size={14} strokeWidth={2} />}
        </button>
      )}
      {onAuthClick && (
        <button type="button" onClick={onAuthClick} className={cls}
          title={authUser ? 'Tu cuenta' : 'Iniciar sesión'} aria-label={authUser ? 'Tu cuenta' : 'Iniciar sesión'}>
          {authUser
            ? <span className="text-[10px] font-bold leading-none">{getInitials(authUser)}</span>
            : <User size={14} strokeWidth={2} />}
        </button>
      )}
      {onEducationalOpen && (
        <button type="button" onClick={onEducationalOpen} className={cls}
          title="Referencia educativa del protocolo" aria-label="Abrir referencia educativa">
          <BookOpen size={14} strokeWidth={2} />
        </button>
      )}
      {onReset && (
        <button type="button" onClick={onReset} className={cls}
          title="Reiniciar protocolo" aria-label="Reiniciar protocolo">
          <RotateCcw size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

export default function GlobalTimer({ startTime, timestamps = {}, patient, onReset, progressPct, stepLabel, onEducationalOpen, authUser, onAuthClick, theme, onToggleTheme }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return
    const tick = () => setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const minutes = elapsed / 60
  const tone = getTimerTone(minutes)
  const eventBadges = getEventBadges(startTime, timestamps)

  return (
    <div
      data-theme="dark"
      className="fixed top-0 left-0 right-0 z-50 md:border-b"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', backgroundColor: '#0F1C38', borderColor: '#29416D' }}
    >
      {/* ───────── MOBILE: Timer Hero ───────── */}
      <div className="md:hidden">
        {startTime ? (
          <div className="px-4 pt-2 pb-1.5">
            {/* Header strip: brand + step pill ........ actions */}
            <div className="flex items-center justify-between gap-2">
              <HeaderStrip stepLabel={stepLabel} />
              <HeaderActions
                authUser={authUser} onAuthClick={onAuthClick}
                onEducationalOpen={onEducationalOpen} onReset={onReset}
                onToggleTheme={onToggleTheme} theme={theme} size="mobile"
              />
            </div>
            {/* Timer row */}
            <div className="mt-0.5 flex items-baseline gap-2.5">
              <span className={`font-mono font-bold text-[2rem] leading-none tabular-nums tracking-tight transition-colors duration-500 ${tone.text}`}>
                {formatElapsed(elapsed)}
              </span>
              <span className={`w-2 h-2 rounded-full self-center animate-pulse-subtle ${tone.dot}`} aria-hidden="true" />
              <span className="text-[11px] text-stroke-textMuted leading-tight">desde inicio</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-stroke-navy flex items-center justify-center shrink-0">
                <Activity size={16} className="text-stroke-iconActive" strokeWidth={2} />
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">Código Stroke</span>
            </div>
            <HeaderActions
              authUser={authUser} onAuthClick={onAuthClick}
              onEducationalOpen={onEducationalOpen} onReset={onReset}
              onToggleTheme={onToggleTheme} theme={theme} size="mobile"
            />
          </div>
        )}

        {/* Event timeline strip (mobile, when >1 event) */}
        {startTime && eventBadges.length > 1 && (
          <div className="border-t border-stroke-line px-4 pb-2">
            <div
              className="flex gap-1.5 overflow-x-auto pt-2 pr-8 [mask-image:linear-gradient(to_right,black_0%,black_86%,transparent_100%)]"
              style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {eventBadges.map((event) => (
                <EventBadge key={event.label} label={event.label} time={event.time}
                  badgeClass="bg-stroke-navy text-stroke-textMuted" compact />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ───────── DESKTOP: compact bar ───────── */}
      <div className="hidden md:flex items-center justify-between gap-3 h-11 px-5">
        <div className="flex items-center gap-3 min-w-0 shrink">
          <div className="w-7 h-7 rounded-lg bg-stroke-panel flex items-center justify-center shrink-0">
            {startTime
              ? <Clock size={16} className="text-white" strokeWidth={2} />
              : <Activity size={16} className="text-white" strokeWidth={2} />}
          </div>
          {startTime ? (
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span className={`font-mono font-bold text-lg leading-none tabular-nums tracking-tight transition-colors duration-500 ${tone.text}`}>
                {formatElapsed(elapsed)}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full self-center animate-pulse-subtle ${tone.dot}`} aria-hidden="true" />
              {stepLabel && (
                <span className="rounded-full border border-stroke-iconActive/30 bg-stroke-iconActive/15 px-2 py-0.5 text-[10px] font-semibold text-stroke-iconActive shrink-0">
                  {stepLabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-white font-semibold text-sm tracking-wide">Código Stroke</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {startTime && patient && (
            <span className="text-xs font-medium text-white truncate max-w-[140px]">{patient.name}</span>
          )}
          <HeaderActions
            authUser={authUser} onAuthClick={onAuthClick}
            onEducationalOpen={onEducationalOpen} onReset={onReset}
            onToggleTheme={onToggleTheme} theme={theme} size="desktop"
          />
        </div>
      </div>

      {/* Progress bar (protocol completion; color tracks time phase) */}
      {progressPct > 0 && (
        <div className="h-1.5" style={{ backgroundColor: '#132B58' }}>
          <div
            className={`h-full rounded-r-full transition-all duration-500 ${tone.bar}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </div>
  )
}
