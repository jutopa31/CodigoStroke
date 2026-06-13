// Single source of truth for thrombolysis contraindications.
//
// Consumed by:
//   - CIAbsolutasTab.jsx / CIRelativasTab.jsx  (the UI checklists)
//   - App.jsx                                   (flow + mock seeding)
//   - strokeAlgorithm.js                        (human-readable decision labels)
//
// Keep IDs here and nowhere else. Adding a contraindication = appending one
// object below; every consumer (and the decision chips) updates automatically.

export const RED_CONTRAS = [
  { id: 'ct_hypodensity',    short: 'TC: hipodensidad extensa',     label: 'TC con hipodensidad extensa',                        sub: 'Hipodensidad clara responsable de los síntomas, mayor que la sustancia blanca contralateral' },
  { id: 'ct_hemorrhage',     short: 'TC: hemorragia intracraneal',  label: 'TC con hemorragia intracraneal aguda',               sub: 'Cualquier hemorragia intracraneal aguda en neuroimagen' },
  { id: 'tce_14d',           short: 'TCE moderado-grave < 14 días', label: 'TCE moderado a grave en los últimos 14 días',        sub: '> 30 min de pérdida de consciencia y GCS < 13, O hemorragia/contusión/fractura en neuroimagen' },
  { id: 'neurosurgery_14d',  short: 'Neurocirugía < 14 días',       label: 'Neurocirugía o cirugía espinal en los últimos 14 días', sub: 'Cirugía intracraneal o raquimedular reciente' },
  { id: 'spinal_cord',       short: 'Lesión medular aguda < 3m',    label: 'Lesión medular aguda en los últimos 3 meses',        sub: '' },
  { id: 'axial_tumor',       short: 'Neoplasia intra-axial',        label: 'Neoplasia intracraneal intra-axial',                 sub: '' },
  { id: 'endocarditis',      short: 'Endocarditis infecciosa',      label: 'Endocarditis infecciosa activa',                     sub: '' },
  { id: 'coagulopathy',      short: 'Coagulopatía severa',          label: 'Coagulopatía severa o trombocitopenia',              sub: 'Plaq. < 100.000/mm³ · RIN > 1.7 · KPTT > 40s · TP > 15s' },
  { id: 'aortic_dissection', short: 'Disección de arco aórtico',    label: 'Disección de arco aórtico conocida o sospechada',   sub: '' },
  { id: 'aria',              short: 'ARIA',                         label: 'Anomalías de imagen relacionadas con amiloide (ARIA)', sub: 'Inmunoterapia anti-amiloide o ARIA conocida — evitar trombolisis IV' },
]

export const ORANGE_CONTRAS = [
  { id: 'disability',            short: 'Discapacidad preexistente',    label: 'Discapacidad preexistente o fragilidad',                           sub: 'Riesgo/beneficio incierto. Determinar en forma individual.' },
  { id: 'doac',                  short: 'DOAC < 48h',                   label: 'Exposición a DOAC en las últimas 48h',                             sub: 'Apixaban, rivaroxaban, dabigatran, edoxaban. Considerar función renal, severidad, disponibilidad de agentes revertidores.' },
  { id: 'prev_stroke',           short: 'ACV isquémico < 3 meses',      label: 'ACV isquémico en los últimos 3 meses',                             sub: 'Mayor riesgo de hemorragia intracraneal. Ponderar en función del tamaño y tiempo del ACV previo.' },
  { id: 'prior_ich',             short: 'HIC previa',                   label: 'Hemorragia intracraneal previa',                                   sub: 'Mayor riesgo de hemorragia sintomática. Angiopatía amiloide implica mayor riesgo. Determinar en forma individual.' },
  { id: 'trauma_14d_3m',         short: 'Trauma mayor no-SNC 14d–3m',  label: 'Trauma mayor no-SNC entre 14 días y 3 meses',                      sub: 'Mayor riesgo de hemorragia sistémica grave. Consultar con especialista quirúrgico.' },
  { id: 'major_surgery',         short: 'Cirugía mayor no-SNC < 10d',  label: 'Cirugía mayor no-SNC en los últimos 10 días',                      sub: 'Mayor riesgo de daño por trombolisis IV. Considerar área quirúrgica y consultar con especialista.' },
  { id: 'gi_bleed',              short: 'Sangrado GI/GU < 21 días',     label: 'Sangrado GI/GU en los últimos 21 días',                            sub: 'Considerar si el sangrado fue tratado y el riesgo modificado.' },
  { id: 'ic_dissection',         short: 'Disección arterial IC',        label: 'Disección arterial intracraneal',                                  sub: 'La seguridad de la trombolisis IV en disección intracraneal es desconocida.' },
  { id: 'vascular_malformation', short: 'Malformación vascular IC',     label: 'Malformación vascular intracraneal conocida',                      sub: 'MAV, aneurisma no tratado. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'stemi_3m',              short: 'STEMI reciente < 3 meses',     label: 'STEMI reciente en los últimos 3 meses',                            sub: 'Considerar hemopericardio en STEMI muy reciente. Consultar cardiología de urgencia.' },
  { id: 'pericarditis',          short: 'Pericarditis aguda',           label: 'Pericarditis aguda',                                               sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiología de urgencia.' },
  { id: 'cardiac_thrombus',      short: 'Trombo AI/VI izquierdo',       label: 'Trombo auricular o ventricular izquierdo conocido',                sub: 'Puede ser razonable en ACV mayor con discapacidad severa. Consultar cardiología de urgencia.' },
  { id: 'malignancy',            short: 'Neoplasia activa sistémica',   label: 'Neoplasia sistémica activa',                                       sub: 'Considerar tipo, estadio y complicaciones activas. Consultar oncología de urgencia.' },
  { id: 'pregnancy',             short: 'Embarazo / puerperio',         label: 'Embarazo o período posparto',                                      sub: 'Puede considerarse si el beneficio supera el riesgo de sangrado uterino. Consultar obstetricia de urgencia.' },
  { id: 'dural_puncture',        short: 'Punción dural < 7 días',       label: 'Punción dural en los últimos 7 días',                              sub: 'Puede considerarse incluso si hubo punción lumbar en los 7 días previos.' },
  { id: 'arterial_puncture',     short: 'Punción arterial < 7 días',    label: 'Punción arterial en vaso no compresible en los últimos 7 días',    sub: 'Ej: línea de arteria subclavia. La seguridad de la trombolisis IV es desconocida.' },
  { id: 'tbi_moderate',          short: 'TCE moderado-grave 14d–3m',    label: 'TCE moderado a grave entre 14 días y 3 meses',                     sub: 'Consultar con neurocirugía y cuidados neurocríticos.' },
  { id: 'neurosurgery_14d_3m',   short: 'Neurocirugía 14d–3m',         label: 'Neurocirugía o cirugía espinal entre 14 días y 3 meses',           sub: 'Puede considerarse en forma individual.' },
]

export const ANTICOAG_TYPES = [
  { id: 'doac',          label: 'DOAC' },
  { id: 'heparina',      label: 'Heparina' },
  { id: 'acenocumarol',  label: 'Acenocumarol' },
]

export const RED_IDS = RED_CONTRAS.map((c) => c.id)
export const ORANGE_IDS = ORANGE_CONTRAS.map((c) => c.id)

// id → concise human label, used by the decision screen (body text + chips).
// Red and orange ids are disjoint, so one flat map is unambiguous.
export const CONTRA_LABELS = Object.fromEntries(
  [...RED_CONTRAS, ...ORANGE_CONTRAS].map((c) => [c.id, c.short]),
)
