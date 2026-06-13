// Timer color escalates with elapsed time (HANDOFF_SPEC: amber → orange → red).
// Single source of truth shared by GlobalTimer (header) and Cronologia (sidebar).
export function getTimerTone(minutes) {
  if (minutes >= 60) return { text: 'text-status-critical', dot: 'bg-status-critical', bar: 'bg-status-critical' }
  if (minutes >= 30) return { text: 'text-orange-500',      dot: 'bg-orange-500',      bar: 'bg-orange-500' }
  return { text: 'text-status-warning', dot: 'bg-status-warning', bar: 'bg-stroke-iconActive' }
}
