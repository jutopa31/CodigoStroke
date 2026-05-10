# Nuevas features — CodigoStroke

Backlog de mejoras pendientes. Cada ítem incluye qué hay que cambiar y qué archivos toca.

---

## 1. ID del caso: iniciales + últimos 3 dígitos del DNI

**Qué hace:** Reemplazar el ID aleatorio actual por un código legible y predecible.
Ejemplo: "García, Juan" + DNI 12345678 → **GJ678**

**Por qué:** El médico puede leerlo en voz alta o dictarlo fácilmente para reanudar un caso.

**Archivos a tocar:**
- `src/lib/storage.js` — cambiar firma de `generatePatientId()` a `generatePatientId(name, dni)`
- `src/App.jsx` — mover la generación del ID a `handlePatientConfirm(data)`, reemplazar `useState(generatePatientId)` por `useState('')` + `setPatientId(generatePatientId(data.name, data.dni))`

**Lógica del ID:**
```js
export function generatePatientId(name, dni) {
  const initials = name
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase())
    .filter(Boolean)
    .join('')
  const last3 = String(dni).replace(/\D/g, '').slice(-3)
  return `${initials}${last3}`
}
```

---

## ~~2. Pregunta de anticoagulación en paso de Síntomas~~ ✅ IMPLEMENTADA

**Qué hace:** Agregar después de "Última vez visto asintomático" la pregunta:
`¿El paciente recibe anticoagulación?` → SÍ / NO

Si SÍ, sub-selección:
- **ACOD/NOAC:** Dabigatrán · Rivaroxabán · Apixabán · Edoxabán
- **AVK:** Warfarina / Acenocumarol
- **HBPM**
- **HNF**

Si ACOD → alerta roja: *"Los ACOD pueden contraindicar la trombolisis. Verificar última dosis y función renal."*

**Archivos a tocar:**
- `src/steps/SymptomsStep.jsx` — agregar bloque de anticoagulación entre el input de tiempo y el botón "Continuar"; incluir resultado en `onConfirm({..., anticoagulation: { active, type }})`
- `src/App.jsx` — el dato ya pasa por `symptoms` hacia `saveStrokeEvent`, no requiere cambio de interfaz

---

## 3. Botón flotante "ACV fuera de ventana"

**Qué hace:** Botón siempre visible que abre un flujo alternativo para pacientes con ventana terapéutica superada (>4.5h o desconocida). Orientado a antecedentes y toma de decisiones de trombectomía.

**Campos del flujo:**
- Antecedentes relevantes (HTA, FA, ACV previo, DM, cardiopatía)
- Ingreso manual de horarios: inicio de síntomas / última vez visto / llegada a guardia
- Medicación habitual (campo de texto libre + ítems guiados: anticoagulantes, antiplaquetarios, antihipertensivos)
- Escala NIHSS (entrada directa)
- Decisión: derivar a trombectomía / manejo conservador / interconsulta

**Archivos a tocar:**
- `src/components/OutOfWindowModal.jsx` — nuevo componente (modal de pantalla completa o panel deslizante)
- `src/App.jsx` — agregar estado `showOutOfWindow` y botón flotante fijo (p.ej. `fixed bottom-4 left-1/2 -translate-x-1/2 z-40` o `fixed left-14 bottom-6`)

---

## 4. Botón de reinicio de ingreso de datos

**Qué hace:** Un botón visible en algún punto del protocolo activo que permite descartar todo y volver al inicio (nuevo código stroke), con confirmación previa para evitar toques accidentales.

**UX sugerida:**
- Ícono de reset/trash en el header o como botón secundario en la pantalla de inicio
- Modal de confirmación: *"¿Reiniciar el protocolo? Se perderán todos los datos del caso actual."* → Cancelar / Confirmar
- Al confirmar: `window.location.reload()` o reset de todo el estado de App

**Archivos a tocar:**
- `src/App.jsx` — agregar función `handleReset()` que vuelve `step` a `STEP.START` y limpia todos los estados; agregar botón en el header sticky (ícono de refresh pequeño)
- Opcionalmente: `src/components/ResetConfirmModal.jsx`

---

## 5. Nombres de pasos visibles al hacer hover en el sidebar

**Qué hace:** Al posicionar el cursor (hover) sobre cada círculo del sidebar izquierdo, mostrar el nombre completo del paso como tooltip o label emergente a la derecha del círculo.

**Comportamiento:**
- Desktop: tooltip que aparece a la derecha del círculo al hacer hover
- Mobile: el `title="..."` ya está implementado (tooltip nativo del navegador al mantener presionado)
- El tooltip debe mostrarse dentro del viewport, sin corte

**Implementación sugerida (Tailwind puro, sin librería):**
```jsx
// En StepTimeline.jsx, dentro del map de círculos:
<div className="relative group flex items-center">
  <button ...>  {/* el círculo */} </button>
  <span className="
    absolute left-full ml-2 px-2 py-1 
    bg-gray-800 text-white text-xs rounded whitespace-nowrap
    opacity-0 group-hover:opacity-100 pointer-events-none
    transition-opacity duration-150 z-50
  ">
    {step.long}
  </span>
</div>
```

**Archivos a tocar:**
- `src/components/StepTimeline.jsx` — envolver cada botón en un div con `group`, agregar `<span>` de tooltip

---

## 6. ID siempre visible al scrollear en desktop

**Problema:** En pantallas grandes (desktop/tablet), cuando el usuario hace scroll hacia abajo, el header sticky muestra el nombre y DNI pero el ID puede quedar cortado o invisible porque el espacio disponible en el header es limitado y el layout prioriza otros elementos.

**Diagnóstico:** El header usa `flex items-center justify-between`. En viewports anchos el ID (`text-xs font-mono`) puede quedar empujado o invisible si el nombre es largo.

**Solución sugerida:**
- Garantizar que la sección derecha del header (`div.text-right`) tenga `flex-shrink-0` y `min-w-fit`
- Si el ID no entra en el header, considerar mostrarlo como un pequeño badge/chip fijo separado (p.ej. `fixed top-[header-height] right-4` en desktop)
- Alternativa: mostrar el ID solo en la card confirmada del paso 1 (que queda visible en el scroll) y no en el header, reduciendo el ruido visual

**Archivos a tocar:**
- `src/App.jsx` — revisar clases del div derecho del header; posiblemente separar el ID a un badge independiente
- `src/steps/PatientStep.jsx` — el ID ya se muestra en la card confirmada; puede ser suficiente si el header queda limpio

---

*Última actualización: 10/05/2026*
