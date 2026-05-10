# Arquitectura — Código Stroke

## Estructura de archivos

```
CodigoStroke/
├── index.html                    # Meta tags mobile, PWA apple-touch-icon, theme-color
├── package.json
├── vite.config.js                # Vite + React + VitePWA plugin
├── tailwind.config.js            # Fuentes DM Sans / DM Serif Display, color brand, animaciones
├── postcss.config.js
├── .env.example
│
├── public/
│   ├── favicon.svg
│   ├── apple-touch-icon.png      # 180×180 — iOS "Añadir a pantalla de inicio"
│   ├── icon-192.png              # PWA icon Android
│   └── icon-512.png              # PWA icon maskable
│
└── src/
    ├── main.jsx
    ├── App.jsx                   # Orquestador: estado global, STEP enum (0–10), handlers
    ├── App.css
    ├── index.css                 # Google Fonts, @tailwind, scrollbar, number input
    │
    ├── components/
    │   ├── GlobalTimer.jsx       # Cronómetro fijo top-right con hitos clínicos
    │   ├── AlertModal.jsx        # Modal de alerta al equipo + email
    │   ├── NihssModal.jsx        # Calculadora NIHSS guiada (15 ítems)
    │   └── StepCard.jsx          # Card reutilizable con border-left color-coded
    │
    ├── steps/
    │   ├── StartStep.jsx         # Landing: logo, chips, botón "Iniciar Código Stroke"
    │   ├── PatientStep.jsx       # DNI + Nombre + Contraseña
    │   ├── SymptomsStep.jsx      # Síntomas + último visto (chips de tiempo rápido)
    │   ├── VitalsStep.jsx        # TA + Glucemia + alertas automáticas
    │   ├── NihssStep.jsx         # NIHSS + síntomas discapacitantes (SI/NO, solo si NIHSS < 5)
    │   ├── InstructionsStep.jsx  # Checklist acciones inmediatas (4 ítems)
    │   ├── CTResultStep.jsx      # Solicitud TC con timestamp + resultado hemorragia
    │   ├── ContraindicationsStep.jsx  # Semáforo rojo/amarillo AHA/ASA 2026
    │   └── DosageStep.jsx        # Selector TNK/rtPA + peso + cálculo + checklist post-trombolisis
    │
    ├── lib/
    │   ├── emailService.js
    │   ├── storage.js
    │   └── supabase.js
    │
    └── content/
        └── nihss.js
```

---

## Estado global — App.jsx

Todo el estado vive en `App.jsx`. No hay Context ni Zustand.

```js
const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,
  SYMPTOMS: 3,
  VITALS: 4,
  NIHSS: 5,
  INSTRUCTIONS: 6,
  CT_RESULT: 7,
  CONTRAINDICATIONS: 8,
  DOSAGE: 9,
  DONE: 10,
}

// Estado
step             // número del paso actual
timerStart       // Date | null
patient          // { dni, name, passphrase } | null
symptoms         // { symptoms: {…}, lastSeenNormal } | null
vitals           // { systolic, diastolic, glucose } | null
nihss            // { nihssScore, hasDisablingSymptoms } | null
ctResult         // { bleeding, ctRequestTime, ctElapsedSeconds } | null
contraindications // { red, orange, hasAbsolute, hasRelative } | null
dosage           // { drug, weight, dose, checklist } | null
eventId          // UUID
```

### Flujo de datos completo

```
PatientStep → AlertModal → sendEmail + saveEvent(básico)
           → SymptomsStep → VitalsStep → NihssStep
           → InstructionsStep → saveEvent(completo) → CTResultStep
           → si bleeding → DONE (hemorragia)
           → ContraindicationsStep
           → si hasAbsolute → DONE (contraindicación absoluta)
           → DosageStep → DONE (trombolisis indicada)
```

### DONE inteligente

El mensaje final cambia según el camino recorrido:
| Condición | Título | Color |
|---|---|---|
| `ctResult.bleeding` | Hemorragia intracraneal | Rojo |
| `contraindications.hasAbsolute` | Contraindicación absoluta | Rojo |
| `dosage` presente | Trombolisis indicada | Verde |
| `contraindications.hasRelative` (sin llegar a dosis) | Valorar riesgo/beneficio | Ámbar |

---

## Paleta de color

| Uso | Clase Tailwind | Hex |
|---|---|---|
| Acciones primarias (botones, badges) | `brand-600` | `#9b2c2c` |
| Hover | `brand-700` | `#7f2424` |
| Pulse ring logo | `brand-600` | `#9b2c2c` |
| Alarma timer ≥60 min | `red-600` | `#DC2626` (intencional) |
| Background | `gray-50` | `#F9FAFB` |
| Timer OK | `emerald-600` | |
| Timer warning | `yellow-500` | |
| Acento síntomas | `orange-500` | |
| Acento vitales | `blue-500` | |
| Acento acciones | `green-500` | |
| Alerta clínica (VitalAlert) | `red-50/200/500/600` | (alarma, no brand) |

---

## Componentes clave

### CTResultStep (`steps/CTResultStep.jsx`)

Dos fases en el mismo componente:
1. **Fase solicitud** — botón "Solicitar TC de encéfalo" → guarda `ctRequestTime = new Date()`
2. **Fase resultado** — muestra "TC solicitada hace X min" (contador vivo) + botones SÍ/NO para hemorragia

Pasa al padre: `{ bleeding, ctRequestTime (ISO), ctElapsedSeconds }`.

### ContraindicationsStep (`steps/ContraindicationsStep.jsx`)

- `RED_CONTRAS` (7 ítems): hemorragia previa, infarto extenso, TCE, tumor intra-axial, coagulopatía severa, disección aórtica, endocarditis
- `ORANGE_CONTRAS` (8 ítems): ACV previo 3m, cirugía reciente, ACODs, sangrado GI/GU, punción arterial, MAV, aneurisma >10mm, disección IC
- Cada ítem tiene botones NO/SÍ (default NO)
- Alert rojo si `hasRed`, amber si `hasOrange && !hasRed`

### DosageStep (`steps/DosageStep.jsx`)

- Selector TNK (default, preferido AHA 2026) / rtPA
- Input peso + botones −5/−1/+1/+5 + presets 50–100 kg
- Cálculo en tiempo real:
  - **TNK:** `min(kg × 0.25, 25)` mg bolo único
  - **rtPA:** `min(kg × 0.9, 90)` mg total → bolo 10% (1 min) + infusión 90% (60 min)
- Checklist post-trombolisis de 7 ítems (todos requeridos)

### NihssStep (`steps/NihssStep.jsx`)

- Input directo + calculadora modal
- **Síntomas discapacitantes** (condicional): aparece solo si NIHSS < 5
  - SI/NO simple + lista expandible de referencia
  - Si SI → alerta ámbar sobre trombolisis independiente del puntaje
- `canContinue = valid && (!showDisablingBlock || hasDisabling !== null)`

### SymptomsStep (`steps/SymptomsStep.jsx`)

- `lastSeen` inicializa con `toLocalInput(new Date())` → hora actual por defecto
- Chips de acceso rápido: Ahora / 15 min / 30 min / 1 hora / 2 horas / 3 horas
- "Otro" no requiere texto adicional

---

## PWA

Configurado con `vite-plugin-pwa` en `vite.config.js`:

```js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Código Stroke',
    short_name: 'Stroke',
    theme_color: '#9b2c2c',
    display: 'standalone',
    orientation: 'portrait',
    icons: [192, 512, 180 (apple)]
  },
  workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] }
})
```

- Service Worker precachea todos los assets → **funciona offline**
- En Chrome Android: banner "Agregar a pantalla de inicio"
- En iOS Safari: "Añadir a la pantalla de inicio" (icono `apple-touch-icon.png`)

---

## Storage (`lib/storage.js`)

`saveStrokeEvent` se llama dos veces:
1. Al confirmar la alerta → datos básicos + `emailSent: true`
2. Al completar el checklist de acciones (InstructionsStep) → evento completo con síntomas, vitales, NIHSS y checklist
