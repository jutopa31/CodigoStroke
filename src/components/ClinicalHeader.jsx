import { useEffect, useState } from 'react'
import { Activity, BookOpen, Moon, RotateCcw, Rows3, Sun, User } from 'lucide-react'
import { getTimerTone } from '../lib/timerTone'

function pad(value) {
  return String(value).padStart(2, '0')
}

function formatElapsed(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`
}

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

function HeaderButton({ label, onClick, children, pressed }) {
  if (!onClick) return null
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke-line bg-white text-stroke-textMuted transition-colors hover:border-stroke-iconActive/40 hover:bg-stroke-panel hover:text-stroke-iconActive md:h-9 md:w-9"
    >
      {children}
    </button>
  )
}

export default function ClinicalHeader({
  startTime,
  patient,
  stepLabel,
  progressPct = 0,
  authUser,
  onAuthClick,
  onEducationalOpen,
  onReset,
  theme,
  onToggleTheme,
  navMode,
  onToggleNavMode,
}) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) return undefined
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000)))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const tone = getTimerTone(elapsed / 60)

  return (
    <header
      className="shrink-0 border-b border-stroke-line bg-white"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex min-h-[68px] max-w-[1440px] items-center gap-3 px-4 py-2.5 md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinical-700 text-white shadow-minimal">
            <Activity size={19} strokeWidth={2.3} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-clinical-700">
                Código Stroke
              </p>
              {stepLabel && (
                <span className="rounded-md bg-stroke-panel px-2 py-0.5 text-[10px] font-semibold text-stroke-textMuted">
                  {stepLabel}
                </span>
              )}
            </div>
            <p className="truncate text-sm font-semibold text-stroke-text">
              {patient?.name || 'Evaluación clínica inicial'}
            </p>
          </div>
        </div>

        {startTime && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-stroke-line bg-stroke-surfaceMuted px-3 py-2">
            <span className={`h-2 w-2 rounded-full ${tone.dot}`} aria-hidden="true" />
            <div className="text-right">
              <p className={`font-mono text-lg font-bold leading-none tabular-nums ${tone.text}`}>
                {formatElapsed(elapsed)}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-stroke-textMuted">
                desde inicio
              </p>
            </div>
          </div>
        )}

        <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
          <HeaderButton
            label={`Cambiar navegación: ${navMode === 'scroll' ? 'scroll vertical' : 'pasos'}`}
            onClick={onToggleNavMode}
            pressed={navMode === 'scroll'}
          >
            <Rows3 size={16} />
          </HeaderButton>
          <HeaderButton label="Abrir referencia clínica" onClick={onEducationalOpen}>
            <BookOpen size={16} />
          </HeaderButton>
          <HeaderButton
            label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            onClick={onToggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </HeaderButton>
          <HeaderButton label={authUser ? 'Abrir cuenta' : 'Iniciar sesión'} onClick={onAuthClick}>
            {authUser ? <span className="text-[10px] font-bold">{getInitials(authUser)}</span> : <User size={16} />}
          </HeaderButton>
          <HeaderButton label="Reiniciar protocolo" onClick={onReset}>
            <RotateCcw size={16} />
          </HeaderButton>
        </div>
      </div>

      {progressPct > 0 && (
        <div className="h-1 bg-stroke-panel">
          <div
            className="h-full rounded-r-full bg-clinical-600 transition-[width] duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </header>
  )
}
