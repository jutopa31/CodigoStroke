import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 bg-brand-700 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-sm text-white font-medium truncate">Nueva versión disponible</p>
      </div>
      <button
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-700 active:scale-95 transition-transform"
      >
        Actualizar
      </button>
    </div>
  )
}
