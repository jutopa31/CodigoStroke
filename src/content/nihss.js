export const nihssItems = [
  {
    id: '1a',
    label: '1a. Nivel de conciencia',
    prompt: 'Observe el nivel de alerta. Use el peor criterio observado. No puntúe por intubación, barrera idiomática o trauma.',
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
    prompt: 'Pregunte: "¿Qué mes es?" y "¿Cuántos años tiene?" Solo vale respuesta verbal exacta. No se acepta aproximación ni gestos.',
    options: [
      { score: 0, text: 'Responde ambas correctamente' },
      { score: 1, text: 'Responde una correctamente' },
      { score: 2, text: 'Ninguna correcta (afasia, estupor, intubado)' },
    ],
  },
  {
    id: '1c',
    label: '1c. NC – Órdenes (abrir/cerrar ojos y mano)',
    prompt: 'Ordene: "Abra y cierre los ojos" y "Abra y cierre la mano" (lado no parético). Solo vale ejecución completa.',
    options: [
      { score: 0, text: 'Realiza ambas tareas' },
      { score: 1, text: 'Realiza una tarea' },
      { score: 2, text: 'No realiza ninguna' },
    ],
  },
  {
    id: '2',
    label: '2. Mirada conjugada',
    prompt: 'Pida que siga su dedo con la mirada horizontal. Evalúe también posición de reposo. Si hay ptosis u oclusión, valore por movimiento voluntario.',
    options: [
      { score: 0, text: 'Normal' },
      { score: 1, text: 'Paresia parcial de la mirada' },
      { score: 2, text: 'Desviación forzada / paresia total' },
    ],
  },
  {
    id: '3',
    label: '3. Campos visuales',
    prompt: 'Confrontación de campos: muestre los dedos simultáneamente en cuadrantes. Evalúe cada ojo por separado. Incluya amenaza visual si no puede colaborar.',
    options: [
      { score: 0, text: 'Sin pérdida visual' },
      { score: 1, text: 'Hemianopsia parcial' },
      { score: 2, text: 'Hemianopsia completa' },
      { score: 3, text: 'Hemianopsia bilateral / ceguera cortical' },
    ],
  },
  {
    id: '4',
    label: '4. Paresia facial',
    prompt: 'Pida: "Enseñe los dientes / sonría / cierre los ojos fuerte." Observe asimetría en cara superior e inferior. En paciente poco colaborador, evalúe respuesta a estímulos nociceptivos.',
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
    prompt: 'Extienda el brazo a 90° (sentado) o 45° (acostado), palmas abajo. Cuente 10 seg en voz alta. Score 9 si hay amputación o artrodesis.',
    options: [
      { score: 0, text: 'Sin caída en 10 seg' },
      { score: 1, text: 'Cae antes de 10 seg, no toca la cama' },
      { score: 2, text: 'Algún esfuerzo contra gravedad, toca la cama' },
      { score: 3, text: 'Sin esfuerzo contra gravedad, cae' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '5b',
    label: '5b. Motor brazo – Derecho',
    prompt: 'Extienda el brazo a 90° (sentado) o 45° (acostado), palmas abajo. Cuente 10 seg en voz alta. Score 9 si hay amputación o artrodesis.',
    options: [
      { score: 0, text: 'Sin caída en 10 seg' },
      { score: 1, text: 'Cae antes de 10 seg, no toca la cama' },
      { score: 2, text: 'Algún esfuerzo contra gravedad, toca la cama' },
      { score: 3, text: 'Sin esfuerzo contra gravedad, cae' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '6a',
    label: '6a. Motor pierna – Izquierda',
    prompt: 'Paciente acostado boca arriba. Eleve la pierna a 30°. Cuente 5 seg en voz alta. Score 9 si hay amputación o artrodesis.',
    options: [
      { score: 0, text: 'Sin caída en 5 seg' },
      { score: 1, text: 'Cae antes de 5 seg, no toca la cama' },
      { score: 2, text: 'Algún esfuerzo contra gravedad, toca la cama' },
      { score: 3, text: 'Sin esfuerzo contra gravedad, cae' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '6b',
    label: '6b. Motor pierna – Derecha',
    prompt: 'Paciente acostado boca arriba. Eleve la pierna a 30°. Cuente 5 seg en voz alta. Score 9 si hay amputación o artrodesis.',
    options: [
      { score: 0, text: 'Sin caída en 5 seg' },
      { score: 1, text: 'Cae antes de 5 seg, no toca la cama' },
      { score: 2, text: 'Algún esfuerzo contra gravedad, toca la cama' },
      { score: 3, text: 'Sin esfuerzo contra gravedad, cae' },
      { score: 4, text: 'Sin movimiento' },
    ],
  },
  {
    id: '7',
    label: '7. Ataxia de miembros',
    prompt: 'Prueba dedo-nariz y talón-rodilla con ojos abiertos. Puntúe SOLO si la ataxia es desproporcionada a la debilidad. Score 9 si hay amputación.',
    options: [
      { score: 0, text: 'Ausente' },
      { score: 1, text: 'Presente en un miembro' },
      { score: 2, text: 'Presente en dos miembros' },
    ],
  },
  {
    id: '8',
    label: '8. Sensibilidad',
    prompt: 'Pinchazo con alfiler roto o palillo en cara, brazos, tronco y piernas. Compare lado afectado vs. normal. Puntúe solo pérdida relacionada al ACV.',
    options: [
      { score: 0, text: 'Normal, sin pérdida' },
      { score: 1, text: 'Leve a moderada, siente el pinchazo' },
      { score: 2, text: 'Severa o total, no siente el toque' },
    ],
  },
  {
    id: '9',
    label: '9. Mejor lenguaje',
    prompt: 'Pida que nombre objetos de una lámina, describa una escena o lea oraciones. Evalúe fluidez, comprensión y denominación. Use el mejor rendimiento observado.',
    options: [
      { score: 0, text: 'Sin afasia' },
      { score: 1, text: 'Afasia leve-moderada' },
      { score: 2, text: 'Afasia severa' },
      { score: 3, text: 'Mudo / afasia global / coma' },
    ],
  },
  {
    id: '10',
    label: '10. Disartria',
    prompt: 'Pida que lea: "mamá", "béisbol", "tip-top", "gracias". Si hay afasia severa, evalúe claridad del habla espontánea. No puntúe si está intubado.',
    options: [
      { score: 0, text: 'Normal' },
      { score: 1, text: 'Leve a moderada, inteligible con dificultad' },
      { score: 2, text: 'Severa, ininteligible o anártrico' },
    ],
  },
  {
    id: '11',
    label: '11. Extinción / Inatención',
    prompt: 'Estimulación bilateral simultánea: táctil (pinchazo en ambas manos) y visual (dedos en campo periférico bilateral). Evalúe también inatención personal.',
    options: [
      { score: 0, text: 'Sin anormalidad' },
      { score: 1, text: 'Inatención a una modalidad' },
      { score: 2, text: 'Hemi-inatención profunda a más de una modalidad' },
    ],
  },
]

export function getNihssSeverity(score) {
  if (score === 0) return { label: 'Sin déficit', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' }
  if (score <= 4) return { label: 'Leve', color: 'text-blue-300', bg: 'bg-blue-500/15', border: 'border-blue-500/40' }
  if (score <= 15) return { label: 'Moderado', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/40' }
  if (score <= 20) return { label: 'Moderado-severo', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/40' }
  return { label: 'Severo', color: 'text-red-300', bg: 'bg-status-critical/15', border: 'border-status-critical/40' }
}
