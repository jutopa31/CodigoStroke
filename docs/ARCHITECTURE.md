# Arquitectura — Código Stroke

## Estructura de archivos

```
CodigoStroke/
├── index.html                    # Meta tags mobile (viewport, theme-color, PWA)
├── package.json
├── vite.config.js
├── tailwind.config.js            # Fuentes DM Sans / DM Serif Display, animaciones custom
├── postcss.config.js
├── .env.example                  # Variables de entorno necesarias (EmailJS, Supabase)
│
├── public/
│   └── favicon.svg
│
└── src/
    ├── main.jsx                  # Entry point — ReactDOM.createRoot
    ├── App.jsx                   # Orquestador principal: estado global + render secuencial
    ├── App.css                   # Vacío (Tailwind maneja todo)
    ├── index.css                 # Google Fonts import, @tailwind directives, scrollbar, number input
    │
    ├── components/               # Componentes reutilizables
    │   ├── GlobalTimer.jsx       # Cronómetro fijo top-right con hitos clínicos
    │   ├── AlertModal.jsx        # Modal de alerta al equipo (preview + confirm + email)
    │   ├── NihssModal.jsx        # Calculadora NIHSS guiada (15 ítems, progreso, resultado)
    │   └── StepCard.jsx          # Card reutilizable con border-left color-coded y badge de paso
    │
    ├── steps/                    # Un componente por paso del protocolo
    │   ├── StartStep.jsx         # Landing: logo, chips, botón "Iniciar Código Stroke"
    │   ├── PatientStep.jsx       # Formulario DNI + Nombre + Contraseña / Vista confirmada
    │   ├── SymptomsStep.jsx      # Síntomas (multi-select) + último visto asintomático + timer
    │   ├── VitalsStep.jsx        # TA (sistólica/diastólica) + Glucemia + alertas automáticas
    │   ├── NihssStep.jsx         # Input NIHSS + botón abrir calculadora modal
    │   └── InstructionsStep.jsx  # Checklist 5 acciones + barra de progreso
    │
    ├── lib/
    │   ├── emailService.js       # EmailJS wrapper con fallback mock si no hay .env
    │   ├── storage.js            # Interface localStorage (save/get) lista para swap a Supabase
    │   └── supabase.js           # Cliente Supabase preparado (comentado, listo para activar)
    │
    └── content/
        └── nihss.js              # 15 ítems NIHSS con opciones/puntajes + función getNihssSeverity()
```

---

## Estado global — App.jsx

Todo el estado vive en `App.jsx`. No hay Context ni Zustand — la app es de sesión única por código stroke.

```js
// Enum de pasos
const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,
  SYMPTOMS: 3,
  VITALS: 4,
  NIHSS: 5,
  INSTRUCTIONS: 6,
  DONE: 7,
}

// Estado
step          // número del paso actual (STEP enum)
timerStart    // Date | null — null hasta confirmar el código
patient       // { dni, name, passphrase } | null
symptoms      // { weakness, speech, vision, ataxia, other, otherText, lastSeenNormal } | null
vitals        // { systolic, diastolic, glucose } | null
nihss         // { nihssScore } | null
eventId       // UUID generado al montar — identifica el evento en storage
```

### Flujo de datos

```
PatientStep → handlePatientConfirm(data) → setPatient(data) → setStep(ALERT)
           → AlertModal → handleAlertConfirm()
                       → sendStrokeAlert() [EmailJS]
                       → saveStrokeEvent() [localStorage]
                       → setTimerStart(new Date())
                       → setStep(SYMPTOMS)
                       → scrollTo(symptomsRef)

SymptomsStep → handleSymptomsConfirm(data) → setSymptoms(data) → setStep(VITALS) → scrollTo(vitalsRef)
VitalsStep   → handleVitalsConfirm(data)   → setVitals(data)   → setStep(NIHSS)  → scrollTo(nihssRef)
NihssStep    → handleNihssConfirm(data)    → setNihss(data)    → setStep(INSTRUCTIONS) → scrollTo(instructionsRef)
InstructionsStep → handleInstructionsConfirm(data)
                → saveStrokeEvent() [localStorage — evento completo]
                → setStep(DONE)
```

### Reveal secuencial

Cada paso se renderiza solo cuando `step >= STEP.X`. El scroll automático se logra con `useRef` + `scrollIntoView({ behavior: 'smooth' })` con 80ms de delay para dar tiempo al DOM.

```jsx
{step >= STEP.VITALS && (
  <div ref={vitalsRef}>
    <VitalsStep onConfirm={handleVitalsConfirm} />
  </div>
)}
```

---

## Componentes clave

### GlobalTimer (`components/GlobalTimer.jsx`)

- `useEffect` con `setInterval(1000ms)` desde `startTime` prop
- Formato: `MM:SS` → `HH:MM:SS` si supera 1 hora
- Color: `bg-emerald-600` (0-29min) → `bg-yellow-500` (30-59min) → `bg-red-600` (≥60min)
- Hitos clínicos: array `MILESTONES = [{minutes: 25, label: 'TC'}, {minutes: 45, label: 'NIHSS'}, {minutes: 60, label: 'Aguja'}]`
- Muestra tiempo restante al próximo hito (e.g., "→ TC 18'")
- Fixed z-50 top-right, visible en todos los pasos

### AlertModal (`components/AlertModal.jsx`)

- Recibe `{ patient, onConfirm, onClose }`
- Overlay `fixed inset-0` con `bg-black/50`
- Header rojo con "CÓDIGO STROKE"
- Lista de equipo hardcodeada: Neurología 🧠, Terapia Intensiva 🏥, Neurocirugía ⚕️
- Aviso en amber antes de confirmar
- `onConfirm` es async (espera `sendStrokeAlert`)
- Estado `sending` durante el envío para deshabilitar el botón

### NihssModal (`components/NihssModal.jsx`)

- 15 ítems en `nihssItems` (de `content/nihss.js`)
- Estado local: `scores = {}`, `current = 0` (índice del ítem activo)
- Al seleccionar una opción: guarda el score + avanza al siguiente ítem (280ms delay)
- Barra de progreso: `(answered / nihssItems.length) * 100%`
- `allDone` = todos los 15 ítems respondidos → muestra puntaje + badge de severidad + botón "Cargar resultado"
- `onLoad(total)` pasa el puntaje al componente padre y cierra el modal

### StepCard (`components/StepCard.jsx`)

Props: `step` (número/string), `title`, `children`, `accent` (red/blue/orange/green/gray)

```jsx
// Uso
<StepCard step="3" title="Signos vitales" accent="blue">
  ...
</StepCard>
```

El badge circular con el número de paso es siempre `bg-red-600`.

### PatientStep (`steps/PatientStep.jsx`)

Dos modos controlados por props:
- `confirmed={false}` → muestra formulario editable
- `confirmed={true} patient={...}` → muestra vista compacta con nombre/DNI + checkmark verde

### SymptomsStep (`steps/SymptomsStep.jsx`)

- `selected` = objeto `{ weakness: bool, speech: bool, vision: bool, ataxia: bool, other: bool }`
- `lastSeen` = string ISO datetime (del input `type="datetime-local"`)
- `timeSince(dateStr)` = calcula diferencia con `Date.now()` cada segundo via `useEffect` con `setInterval`
- Validación: `valid = hasSymptom && lastSeen && (!selected.other || otherText.trim())`

### VitalsStep (`steps/VitalsStep.jsx`)

Alertas automáticas:
- `sysNum > 185` → "TA sistólica >185 mmHg — ajustar antes de trombolisis (meta: ≤185/110)"
- `diaNum > 110` → "TA diastólica >110 mmHg"
- `glucNum < 50` → "Hipoglucemia — corregir antes de proceder. Puede mimetizar ACV."
- `glucNum > 400` → "Hiperglucemia severa — empeora pronóstico neurológico."

### NihssStep (`steps/NihssStep.jsx`)

- Input directo + botón "Calcular" que abre `NihssModal`
- `getNihssSeverity(score)` retorna `{ label, color, bg, border }` para el badge
- Si `score >= 6`: aviso adicional sobre angio-TC y oclusión de gran vaso

### InstructionsStep (`steps/InstructionsStep.jsx`)

- `CHECKLIST` = array de 5 items con id, label, sub, emoji
- `checked = {}` → toggle por id
- `allChecked = CHECKLIST.every(item => checked[item.id])`
- Barra de progreso verde
- Si `nihssScore >= 6`: warning box sobre thrombectomía

---

## Diseño visual

**Tipografía:** DM Sans (body 300-600) + DM Serif Display (headings) — Google Fonts

**Paleta:**
| Uso | Clase Tailwind |
|---|---|
| Urgencia / stroke | `red-600` (#DC2626) |
| Background | `gray-50` (#F9FAFB) |
| Cards | `white` + shadow-sm |
| Border-left síntomas | `orange-500` |
| Border-left vitales | `blue-500` |
| Border-left acciones | `green-500` |
| Border-left paciente OK | `green-500` |
| Timer OK | `emerald-600` |
| Timer warning | `yellow-500` |
| Timer crítico | `red-600` |

**Animaciones custom** (en `tailwind.config.js`):
- `animate-slide-down` → `slideDown 0.45s ease-out` (cada paso nuevo)
- `animate-fade-in` → `fadeIn 0.3s ease-out` (modales, badges)
- `animate-pulse-ring` → anillo pulsante en el logo del landing

**Mobile-first:** Tap targets mínimo 48px, `max-w-md mx-auto` en todos los pasos, sin padding lateral >16px.

---

## Storage (`lib/storage.js`)

Interface uniforme para swap futuro a Supabase:

```js
saveStrokeEvent(data)      // guarda/actualiza en localStorage
getStrokeEvents()          // retorna array de todos los eventos
getStrokeEventById(id)     // retorna evento por UUID
```

**Estructura de un evento guardado:**
```json
{
  "id": "uuid-v4",
  "patientDNI": "12345678",
  "patientName": "García, Juan",
  "startTime": "2026-05-10T10:35:34.000Z",
  "symptoms": {
    "weakness": true,
    "speech": false,
    "vision": false,
    "ataxia": false,
    "other": false,
    "otherText": "",
    "lastSeenNormal": "2026-05-10T08:00"
  },
  "vitals": { "systolic": 200, "diastolic": 115, "glucose": 140 },
  "nihss": { "nihssScore": 8 },
  "checklist": {
    "shockroom": true,
    "ivAccess": true,
    "labs": true,
    "ct": true,
    "ecg": true
  },
  "emailSent": true,
  "savedAt": "2026-05-10T10:35:34.000Z"
}
```

`saveStrokeEvent` se llama **dos veces**:
1. Al confirmar la alerta → guarda datos básicos + `emailSent: true`
2. Al completar el checklist → guarda evento completo

---

## EmailJS (`lib/emailService.js`)

Usa `@emailjs/browser`. Si no hay variables de entorno → `console.info()` + retorna `{ mock: true }`. La app **nunca crashea** por falta de configuración de email.

Variables requeridas (en `.env`):
```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

Template params enviados:
```js
{
  patient_name: "García, Juan",
  patient_dni: "12345678",
  start_time: "10/05/2026, 10:35:34",
  hospital: "Guardia — Código Stroke"
}
```

---

## Supabase (`lib/supabase.js`)

El archivo está preparado con el schema SQL comentado. Para activar:
1. Crear proyecto en supabase.com
2. Ejecutar el SQL del schema en el SQL Editor
3. Descomentar el cliente en `supabase.js`
4. Reemplazar `saveStrokeEvent` en `storage.js` para usar el cliente Supabase
5. Agregar variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` al `.env`
