export const nihssItems = [
  {
    id: '1a',
    label: '1a. Nivel de conciencia',
    options: [
      { score: 0, text: 'Alerta, responde bien' },
      { score: 1, text: 'Somnoliento, despertable con estímulo leve' },
      { score: 2, text: 'Estuporoso, requiere estimulación repetida' },
      { score: 3, text: 'Coma, respuestas reflejas o ninguna' },
    ],
  },
  {
    id: '1b',
    label: '1b. NC – Preguntas (mes y edad)',
    options: [
      { score: 0, text: 'Responde ambas correctamente' },
      { score: 1, text: 'Responde una correctamente' },
      { score: 2, text: 'Ninguna correcta' },
    ],
  },
  {
    id: '1c',
    label: '1c. NC – Órdenes (abrir/cerrar ojos y mano)',
    options: [
      { score: 0, text: 'Realiza ambas tareas' },
      { score: 1, text: 'Realiza una tarea' },
      { score: 2, text: 'No realiza ninguna' },
    ],
  },
  {
    id: '2',
    label: '2. Mirada conjugada',
    options: [
      { score: 0, text: 'Normal' },
      { score: 1, text: 'Paresia parcial de la mirada' },
      { score: 2, text: 'Desviación forzada / paresia total' },
    ],
  },
  {
    id: '3',
    label: '3. Campos visuales',
    options: [
      { score: 0, text: 'Sin pérdida visual' },
      { score: 1, text: 'Hemianopsia parcial' },
      { score: 2, text: 'Hemianopsia completa' },
      { score: 3, text: 'Hemianopsia bilateral / ceguera' },
    ],
  },
  {
    id: '4',
    label: '4. Paresia facial',
    options: [
      { score: 0, text: 'Movimiento normal, simétrico' },
      { score: 1, text: 'Paresia leve (asimetría al sonreír)' },
      { score: 2, text: 'Paresia parcial (cara inferior)' },
      { score: 3, text: 'Parálisis completa uni o bilateral' },
    ],
  },
  {
    id: '5a',
    label: '5a. Motor brazo – Izquierdo',
    options: [
      { score: 0, text: 'Sin caída en 10 seg' },
      { score: 1, text: 'Cae antes de 10 seg' },
      { score: 2, text: 'Algún esfuerzo contra gravedad' },
      { score: 3, text: 'Sin esfuerzo contra gravedad' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '5b',
    label: '5b. Motor brazo – Derecho',
    options: [
      { score: 0, text: 'Sin caída en 10 seg' },
      { score: 1, text: 'Cae antes de 10 seg' },
      { score: 2, text: 'Algún esfuerzo contra gravedad' },
      { score: 3, text: 'Sin esfuerzo contra gravedad' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '6a',
    label: '6a. Motor pierna – Izquierda',
    options: [
      { score: 0, text: 'Sin caída en 5 seg' },
      { score: 1, text: 'Cae antes de 5 seg' },
      { score: 2, text: 'Algún esfuerzo contra gravedad' },
      { score: 3, text: 'Sin esfuerzo contra gravedad' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '6b',
    label: '6b. Motor pierna – Derecha',
    options: [
      { score: 0, text: 'Sin caída en 5 seg' },
      { score: 1, text: 'Cae antes de 5 seg' },
      { score: 2, text: 'Algún esfuerzo contra gravedad' },
      { score: 3, text: 'Sin esfuerzo contra gravedad' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '7',
    label: '7. Ataxia de miembros',
    options: [
      { score: 0, text: 'Ausente' },
      { score: 1, text: 'Presente en un miembro' },
      { score: 2, text: 'Presente en dos miembros' },
    ],
  },
  {
    id: '8',
    label: '8. Sensibilidad',
    options: [
      { score: 0, text: 'Normal, sin pérdida' },
      { score: 1, text: 'Leve a moderada, siente el pinchazo' },
      { score: 2, text: 'Severa o total, no siente el toque' },
    ],
  },
  {
    id: '9',
    label: '9. Mejor lenguaje',
    options: [
      { score: 0, text: 'Sin afasia' },
      { score: 1, text: 'Afasia leve-moderada' },
      { score: 2, text: 'Afasia severa' },
      { score: 3, text: 'Mudo, afasia global' },
    ],
  },
  {
    id: '10',
    label: '10. Disartria',
    options: [
      { score: 0, text: 'Normal' },
      { score: 1, text: 'Leve a moderada, inteligible' },
      { score: 2, text: 'Severa, ininteligible o anártrico' },
    ],
  },
  {
    id: '11',
    label: '11. Extinción / Inatención',
    options: [
      { score: 0, text: 'Sin anormalidad' },
      { score: 1, text: 'Inatención a una modalidad' },
      { score: 2, text: 'Hemi-inatención profunda' },
    ],
  },
]

export function getNihssSeverity(score) {
  if (score === 0) return { label: 'Sin déficit', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-400' }
  if (score <= 4) return { label: 'Leve', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-400' }
  if (score <= 15) return { label: 'Moderado', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-400' }
  if (score <= 20) return { label: 'Moderado-severo', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-400' }
  return { label: 'Severo', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-500' }
}
