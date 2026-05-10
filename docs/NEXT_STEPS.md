# Próximos pasos — Código Stroke

## Estado de implementación

| Fase | Estado | Descripción |
|---|---|---|
| 1 | ✅ Completa | Flujo inicial: paciente, síntomas, vitales, NIHSS, acciones inmediatas |
| 2 | ✅ Completa | TC de encéfalo + contraindicaciones semáforo rojo/amarillo AHA/ASA 2026 |
| 3 | ✅ Completa | Cálculo de dosis rtPA / TNK + checklist post-trombolisis |
| 8 | ✅ Completa | PWA instalable (offline, pantalla completa, íconos) |
| 4 | 🔲 Pendiente | Algoritmo manejo de TA |
| 5 | 🔲 Pendiente | Criterios y derivación para trombectomía |
| 6 | 🔲 Pendiente | Historial de eventos del turno |
| 7 | 🔲 Pendiente | Autenticación con Supabase |

---

## Fase 4 — Manejo de Tensión Arterial

**Disparador:** En paralelo con la decisión de trombolisis y durante el tratamiento.

### `steps/BPManagementStep.jsx`

Mostrar algoritmo de manejo de TA según el contexto:

**Pre-trombolisis (meta ≤ 185/110 mmHg):**
| TA | Conducta |
|---|---|
| < 185/110 | Proceder a trombolisis |
| 185-220/110-120 | Labetalol 10-20mg IV en 1-2min (repetir hasta 3 dosis) |
| > 220/110 | Nicardipina 5mg/h IV, titular hasta meta |

**Post-trombolisis (meta < 180/105 mmHg primeras 24h):**
| TA | Conducta |
|---|---|
| < 180/105 | Observar |
| 180-230/105-120 | Labetalol 10mg IV, luego infusión 2-8mg/min |
| > 230/120 | Nicardipina 5mg/h IV, máx 15mg/h |

**Sin trombolisis:**
- Tratar solo si TA > 220/120 mmHg (primeras 48-72h)
- Meta: reducción del 15% en 24h

Implementar como tabla interactiva con selector de contexto (pre/post/sin trombolisis) y calculadora de dosis por peso.

---

## Fase 5 — Evaluación para Trombectomía

**Disparador:** Si NIHSS ≥ 6 o sospecha de oclusión de gran vaso.

### `steps/ThrombectomyStep.jsx`

1. **Criterios de elegibilidad**
   - Oclusión de ICA, M1 o M2 en angio-TC
   - NIHSS ≥ 6 (pre-cargado desde el estado)
   - ASPECTS ≥ 3 en TC (input manual)
   - mRS pre-evento 0-1 (preguntar al paciente/familiar)

2. **Ventana terapéutica**
   ```
   Estándar (0-6h): criterios radiológicos básicos
   Extendida (6-24h): perfusión favorable (DAWN/DEFUSE-3)
   Arteria basilar (0-24h): PC-ASPECTS ≥ 6, NIHSS ≥ 10
   ```

3. **Derivación**
   - Botón "Solicitar traslado a centro con angiógrafo"
   - Checklist pre-traslado

---

## Fase 6 — Historial de eventos

**Propósito:** Ver todos los códigos stroke del turno/guardia.

### `steps/HistoryStep.jsx` o pantalla separada

- Lista de eventos del `localStorage` (o Supabase)
- Por cada evento: paciente, hora de inicio, NIHSS, decisión de trombolisis, droga y dosis
- Exportar como PDF o JSON

---

## Fase 7 — Autenticación con Supabase

**Propósito:** Que solo médicos de guardia puedan iniciar un código stroke.

1. Activar Supabase Auth
2. Login con email/password o magic link
3. Frase de contraseña de turno → validar contra tabla `shift_keys`
4. Row Level Security por médico

---

## Estado global al finalizar Fase 3

```js
patient          = { dni, name, passphrase }
timerStart       = Date
symptoms         = { symptoms: { weakness, speech, vision, ataxia, other },
                     lastSeenNormal }
vitals           = { systolic, diastolic, glucose }
nihss            = { nihssScore, hasDisablingSymptoms }
ctResult         = { bleeding, ctRequestTime, ctElapsedSeconds }
contraindications = { red: {…}, orange: {…}, hasAbsolute, hasRelative }
dosage           = { drug: 'tnk'|'rtpa', weight, dose: {total, bolo?, infusion?},
                     checklist: {…} }
```

---

## Plantilla para agregar un paso nuevo

```jsx
// 1. App.jsx — agregar al STEP enum
const STEP = {
  ...
  BP_MANAGEMENT: 11,  // nuevo
  DONE: 12,           // mover
}

// 2. App.jsx — agregar ref, estado y handler
const bpRef = useRef(null)
const [bp, setBp] = useState(null)

function handleBpConfirm(data) {
  setBp(data)
  setStep(STEP.DONE)
  scrollTo(doneRef)
}

// 3. App.jsx — agregar render condicional
{step >= STEP.BP_MANAGEMENT && (
  <div ref={bpRef}>
    <BPManagementStep vitals={vitals} onConfirm={handleBpConfirm} />
  </div>
)}

// 4. Crear src/steps/BPManagementStep.jsx
export default function BPManagementStep({ vitals, onConfirm }) { … }
```
