# Próximos pasos — Código Stroke

Este documento describe todas las fases pendientes de implementación, en orden de prioridad clínica.

---

## Fase 2 — Decisión de Trombolisis

**Disparador:** Después del paso 5 (InstructionsStep), antes de administrar rtPA/TNK.

### Componentes a crear

**`steps/ThrombolysisStep.jsx`**

Evaluar elegibilidad para trombolisis IV basada en:

1. **Ventana terapéutica**
   - Calcular automáticamente desde `lastSeenNormal` (ya disponible en el estado)
   - Mostrar tiempo transcurrido en tiempo real
   - Verde si < 4.5h, amarillo si 4-4.5h, rojo si > 4.5h
   - Mostrar slider visual tipo VentanasClock (referencia: StrokeAhaclaseClinica)

2. **Criterios de inclusión rápidos** (checklist binario sí/no)
   - [ ] Diagnóstico clínico de ACV isquémico
   - [ ] NIHSS entre 4 y 25 (o con síntomas discapacitantes aunque NIHSS < 4)
   - [ ] TC sin hemorragia ni lesión extensa
   - [ ] TA ≤ 185/110 mmHg (ya confirmado en vitales, mostrar valor cargado)

3. **Contraindicaciones — sistema semáforo AHA/ASA 2026**

   **Rojo (Riesgo > Beneficio — NO trombolizar):**
   - [ ] Hemorragia intracraneal previa o actual
   - [ ] Infarto extenso (ASPECTS < 3 o más de 1/3 del territorio de ACM)
   - [ ] TCE grave reciente (< 3 meses) o cirugía intracraneal
   - [ ] Tumor intra-axial
   - [ ] Coagulopatía severa (RIN > 1.7, KPTT > 40, plaquetas < 100.000)
   - [ ] Disección aórtica
   - [ ] Endocarditis infecciosa activa

   **Naranja (Individualizar — evaluar riesgo/beneficio):**
   - [ ] ACV isquémico en los 3 meses previos
   - [ ] Cirugía mayor o trauma grave en últimas 2 semanas
   - [ ] ACODs en las últimas 48h
   - [ ] Sangrado GI/GU reciente (< 21 días)
   - [ ] Punción arterial reciente en sitio no compresible
   - [ ] Malformación arteriovenosa conocida
   - [ ] Aneurisma no roto conocido > 10mm
   - [ ] Disección arterial intracraneal

   **Verde (Beneficio > Riesgo — tratar):**
   - [ ] Disección arterial extracraneal
   - [ ] Neoplasia extra-axial (meningioma, etc.)
   - [ ] Aneurisma pequeño no roto (< 10mm)
   - [ ] Stroke mimic sospechado (tratar si hay duda)

4. **Decisión final**
   - Botón "INDICAR TROMBOLISIS" (verde) + "NO INDICADA" (gray)
   - Si se indica: avanzar a Fase 3 (cálculo de dosis)

---

## Fase 3 — Cálculo de Dosis rtPA / TNK

**Disparador:** Cuando se decide indicar trombolisis.

### `steps/DosageStep.jsx`

1. **Peso del paciente**
   - Input numérico grande (kg)
   - Botones rápidos: -5 / -1 / +1 / +5
   - Presets: 60 / 70 / 80 / 90 / 100 kg

2. **Cálculo automático al ingresar peso**

   **rtPA (Alteplase):**
   ```
   Dosis total = 0.9 mg/kg (máximo 90 mg)
   Bolo IV (10%): X mg en 1 min
   Infusión (90%): Y mg en 60 min
   ```

   **TNK (Tenecteplase) — preferido AHA 2026:**
   ```
   Dosis total = 0.25 mg/kg (máximo 25 mg)
   Bolo único IV: X mg
   ```

3. **Instrucciones post-trombolisis** (checklist marcable)
   - [ ] Ingresar a UTI/Shockroom con monitoreo continuo
   - [ ] NO colocar sonda vesical, SNG ni vía arterial en las próximas 24h
   - [ ] NO heparina ni antiagregantes en las próximas 24h
   - [ ] Control de TA cada 15 min x 2h → cada 30 min x 6h → cada 1h x 16h
   - [ ] NIHSS seriado: al inicio, a los 30 min, 1h, 2h, 6h, 24h
   - [ ] TC de control a las 24h antes de anticoagulación
   - [ ] Solicitar ecocardiograma y Holter

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

**Disparador:** Si NIHSS ≥ 6 (ya detectado en NihssStep) o si hay sospecha de oclusión de gran vaso.

### `steps/ThrombectomyStep.jsx`

1. **Criterios de elegibilidad**
   - [ ] Oclusión de ICA, M1 o M2 en angio-TC (a completar después de TC)
   - [ ] NIHSS ≥ 6 (pre-cargado desde el estado)
   - [ ] ASPECTS ≥ 3 en TC (input manual)
   - [ ] mRS pre-evento 0-1 (preguntar al paciente/familiar)

2. **Ventana terapéutica para trombectomía**
   ```
   Estándar (0-6h): Si criterios radiológicos básicos
   Extendida (6-24h): Si perfusión favorable (DAWN/DEFUSE-3)
   Arteria basilar (0-24h): PC-ASPECTS ≥ 6, NIHSS ≥ 10
   ```
   Mostrar automáticamente basado en `lastSeenNormal`.

3. **Derivación**
   - Botón "Solicitar traslado a centro con angiógrafo"
   - Checklist pre-traslado:
     - [ ] Comunicar con centro receptor
     - [ ] Estabilizar vía aérea
     - [ ] Continuación de rtPA durante traslado si corresponde
     - [ ] Documentar hora de último aviso al equipo

---

## Fase 6 — Historial de eventos

**Propósito:** Ver todos los códigos stroke del turno/guardia.

### Ruta: pantalla separada o tab

**`steps/HistoryStep.jsx`** o pantalla accesible desde un botón en el header

- Lista de eventos del `localStorage` (o Supabase cuando esté activo)
- Por cada evento: paciente, hora de inicio, NIHSS, decisión de trombolisis
- Exportar como PDF o JSON

---

## Fase 7 — Autenticación con Supabase

**Propósito:** Que solo médicos de guardia puedan iniciar un código stroke.

### Implementación

1. Activar Supabase Auth (ver `docs/IMPLEMENTATION.md`)
2. Login con email/password o magic link (Supabase Auth UI)
3. Frase de contraseña de turno → validar contra tabla `shift_keys` en Supabase
4. Row Level Security: cada médico solo ve sus propios eventos

### `src/lib/auth.js` (nuevo)
```js
export async function signIn(email, password) { ... }
export async function signOut() { ... }
export function getCurrentUser() { ... }
```

### Flujo de auth
```
App mount → checkSession()
         → si sesión activa → mostrar StartStep
         → si no hay sesión → mostrar LoginStep (antes del StartStep)
```

---

## Fase 8 — PWA instalable

Agregar `vite-plugin-pwa` para que la app se pueda instalar como app nativa en el celular de la guardia. Ver instrucciones en `docs/IMPLEMENTATION.md`.

Beneficios:
- Funciona offline (Service Worker cachea los assets)
- Icono en pantalla de inicio
- Sin barra de browser → pantalla completa
- Push notifications (futuro)

---

## Resumen de prioridades

| Fase | Prioridad | Complejidad | Descripción |
|---|---|---|---|
| 2 | **Alta** | Media | Decisión de trombolisis + semáforo contraindicaciones |
| 3 | **Alta** | Baja | Cálculo de dosis rtPA/TNK |
| 4 | **Alta** | Baja | Algoritmo manejo TA |
| 5 | **Alta** | Media | Criterios y derivación para trombectomía |
| 8 | **Media** | Baja | PWA instalable |
| 6 | **Media** | Media | Historial de eventos |
| 7 | **Baja** | Alta | Autenticación Supabase completa |

---

## Estado actual del estado global al terminar Fase 1

Al completar el flujo actual, `App.jsx` tiene disponible:

```js
patient = { dni, name, passphrase }
timerStart = Date              // hora exacta de inicio del código
symptoms = {
  weakness, speech, vision, ataxia, other,
  otherText,
  lastSeenNormal               // ISO string → calcular ventana terapéutica
}
vitals = { systolic, diastolic, glucose }
nihss = { nihssScore }         // 0-42 → determinar elegibilidad y trombectomía
```

Todos estos datos están disponibles para las fases siguientes sin necesidad de volver a pedirlos. Los pasos futuros solo necesitan agregar su `ref`, su componente en `steps/`, y su `handler` en `App.jsx`.

---

## Plantilla para agregar un paso nuevo

```jsx
// 1. Agregar al STEP enum en App.jsx
const STEP = {
  ...
  THROMBOLYSIS: 7,   // nuevo
  DONE: 8,           // mover
}

// 2. Agregar ref y handler en App.jsx
const thrombolysisRef = useRef(null)

function handleThrombolysisConfirm(data) {
  setThrombolysis(data)
  setStep(STEP.DONE)
  scrollTo(doneRef)
}

// 3. Agregar render condicional en App.jsx
{step >= STEP.THROMBOLYSIS && (
  <div ref={thrombolysisRef}>
    <ThrombolysisStep
      vitals={vitals}
      nihss={nihss}
      symptoms={symptoms}
      onConfirm={handleThrombolysisConfirm}
    />
  </div>
)}

// 4. Crear src/steps/ThrombolysisStep.jsx
export default function ThrombolysisStep({ vitals, nihss, symptoms, onConfirm }) {
  // ...
}
```
