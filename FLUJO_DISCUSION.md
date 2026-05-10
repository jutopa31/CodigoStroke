# Discusión: Flujo y Bloqueo de Secciones — CodigoStroke

Fecha: 2026-05-10

---

## 1. Estado actual del flujo

La app tiene 12 pasos (STEP 0–11). Una vez que el protocolo se activa (`protocolUnlocked = step >= STEP.SYMPTOMS`), **todas las secciones se renderizan simultáneamente** — el usuario puede hacer scroll libre por toda la pantalla sin restricciones secuenciales. El avance entre pasos se registra internamente con `advanceTo()` y controla el scroll automático, pero no bloquea la visibilidad de secciones posteriores.

### Secuencia actual completa

```
START → PATIENT → ALERT → SYMPTOMS → VITALS → NIHSS
      → INSTRUCTIONS → CT_RESULT → CONTRAINDICATIONS
      → DOSAGE → THROMBECTOMY → DONE
```

### Bifurcaciones ya implementadas

| Condición | Destino |
|---|---|
| TC con hemorragia (`ctResult.bleeding`) | → DONE directamente |
| ACV del despertar sin mismatch en RMN | → THROMBECTOMY (sin trombolisis) |
| Contraindicación absoluta presente | → THROMBECTOMY (saltando DOSAGE) |

---

## 2. Problemas identificados

### 2.1 Ausencia de bloqueo progresivo

Actualmente todas las secciones posteriores son visibles y editables desde el inicio del protocolo. Esto puede generar:
- Carga desordenada de datos (por ejemplo, registrar el resultado de TC antes de haber completado el NIHSS)
- Pérdida del sentido clínico-temporal del protocolo
- Confusión visual en guardia, donde la velocidad de lectura es crítica

### 2.2 Contraindicación relativa: comportamiento pasivo

Cuando el médico marca una contraindicación relativa como **SÍ**, la app muestra el banner de advertencia en amber pero **no facilita la acción inmediata**. El usuario debe hacer scroll manualmente hacia abajo para encontrar el botón "Registrar y continuar". En una situación de guardia esto es un obstáculo innecesario.

**Comportamiento deseado:** Al seleccionar SÍ en cualquier contraindicación relativa, la pantalla debe hacer scroll automático al pie del formulario donde está el botón de guardado, para que el médico pueda confirmar y avanzar con un mínimo de interacción.

### 2.3 No existe flujo explícito para "no candidato a trombolisis"

Actualmente, cuando un paciente no es candidato a trombolisis IV (ya sea por contraindicación absoluta, relativa confirmada, o TC con hemorragia), la lógica:
- Si hay contraindicación absoluta → salta DOSAGE y va a THROMBECTOMY ✓ (ya implementado)
- Si hay contraindicación relativa → **igual pasa por DOSAGE** antes de llegar a THROMBECTOMY ✗

El problema es que si el equipo decide **no trombolizar** (ya sea por contraindicación absoluta o por decisión clínica ante contraindicación relativa), el siguiente paso de máxima urgencia no es calcular dosis sino **descartar OGV solicitando la AngioTAC**. La ventana para trombectomía mecánica puede ser hasta 24h (con criterios DAWN/DEFUSE-3), y no debe perderse tiempo en pasos de dosificación irrelevantes.

---

## 3. Propuestas de mejora

### 3.1 Bloqueo selectivo por timestamp obligatorio

Se propone mantener el flujo libre para la mayoría de las secciones (SYMPTOMS, VITALS, NIHSS, INSTRUCTIONS), permitiendo carga rápida y paralela. El bloqueo se aplicaría únicamente a las secciones que tienen un **timestamp con significado clínico-métrico obligatorio**:

| Sección | Timestamp obligatorio | ¿Bloquear hasta completar anterior? |
|---|---|---|
| PATIENT | Llegada del paciente | Sí (ya es el primer paso) |
| CT_RESULT | Solicitud de TAC | Sí — requiere que INSTRUCTIONS esté confirmado |
| DOSAGE | Inicio de trombolíticos | Sí — requiere CT_RESULT confirmado |
| THROMBECTOMY | Solicitud AngioTAC | Sí — requiere que llegue por bifurcación válida |

El resto (SYMPTOMS, VITALS, NIHSS, INSTRUCTIONS) permanecen desbloqueados simultáneamente para permitir carga rápida en paralelo por distintos miembros del equipo o por el médico según prioridad clínica.

**Implementación técnica sugerida:** Cambiar la condición de renderizado de cada sección bloqueada de `protocolUnlocked` a `step >= STEP.X` donde X es el paso mínimo requerido. Ejemplo:
- `CTResultStep` se muestra solo si `step >= STEP.INSTRUCTIONS` (es decir, INSTRUCTIONS fue confirmado)
- `DosageStep` se muestra solo si `step >= STEP.CT_RESULT`
- `ThrombectomyStep` se muestra solo si `step >= STEP.CONTRAINDICATIONS`

### 3.2 Scroll automático al confirmar contraindicación relativa

En `ContraindicationsStep`, cuando `setOrange(id, true)` se invoca (el médico marca SÍ en cualquier contraindicación relativa), debe dispararse un scroll suave hacia el botón "Registrar y continuar" al pie del componente.

**Implementación técnica sugerida:**
```jsx
// Agregar ref al botón de confirmación
const confirmButtonRef = useRef(null)

function setOrange(id, val) {
  setOrangeAnswers((a) => ({ ...a, [id]: val }))
  if (val === true) {
    setTimeout(() => {
      confirmButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 150)
  }
}
```

Lo mismo aplicaría si se marca una contraindicación absoluta como SÍ, dado que también conviene facilitar el avance rápido.

### 3.3 Flujo directo para paciente no candidato a trombolisis

Se propone agregar una decisión explícita en `ContraindicationsStep` cuando hay contraindicación relativa:

**Nuevo flujo propuesto para contraindicación relativa:**

```
CONTRAINDICATIONS (relativa = SÍ)
        ↓
  ¿Decisión clínica?
   [Trombolizar]  →  DOSAGE → THROMBECTOMY
   [No trombolizar]  →  THROMBECTOMY directamente
```

Para implementar esto, el botón de confirmación en `ContraindicationsStep` debería transformarse cuando hay contraindicación relativa:

- **Sin contraindicaciones:** botón único "Registrar y continuar"
- **Con contraindicación absoluta:** botón único "Registrar — No trombolizar → Evaluar OGV" (ya redirige a THROMBECTOMY)
- **Con contraindicación relativa:** dos botones diferenciados:
  - "Trombolizar con precaución" → flujo normal → DOSAGE
  - "No trombolizar → Evaluar OGV" → salta DOSAGE → va directo a THROMBECTOMY

Esto también requiere que `handleContraindicationsConfirm` en `App.jsx` reciba un campo adicional como `{ hasAbsolute, hasRelative, decidedNotToThrombolyze }` y bifurque en consecuencia.

**Actualización en `getDoneContent()`:** El caso de `contraindications.hasRelative` (sin dosage) debería mostrar:
> "Paciente no candidato a trombolisis IV por contraindicación relativa. Se descartó OGV. Continuar con manejo de soporte."

---

## 4. Resumen de cambios requeridos

| # | Archivo | Cambio |
|---|---|---|
| 1 | `App.jsx` | Cambiar condición de renderizado de `CTResultStep`, `DosageStep`, `ThrombectomyStep` de `protocolUnlocked` a `step >= STEP.X` |
| 2 | `App.jsx` | En `handleContraindicationsConfirm`: bifurcar según `decidedNotToThrombolyze` para saltar DOSAGE |
| 3 | `App.jsx` | En `getDoneContent()`: contemplar nuevo caso `hasRelative && !dosage` |
| 4 | `ContraindicationsStep.jsx` | Agregar scroll automático al confirmar SÍ en cualquier contraindicación |
| 5 | `ContraindicationsStep.jsx` | Dividir botón de confirmación cuando `hasOrange`: opción "trombolizar" vs "no trombolizar → OGV" |

---

## 5. Consideraciones clínicas adicionales

- La solicitud de AngioTAC para descartar OGV es independiente de la decisión sobre trombolisis. Incluso un paciente con contraindicación absoluta puede beneficiarse de trombectomía mecánica (especialmente en oclusión de ICA/M1 con NIHSS alto).
- El bloqueo propuesto en la sección 3.1 no debería impedir que el médico complete signos vitales o NIHSS mientras espera el resultado de la TC — estos pasos deben permanecer libres.
- El timestamp de "Solicitud de AngioTAC" dentro de `ThrombectomyStep` debería registrarse con la misma fidelidad que el de "Solicitud de TAC" en `CTResultStep`, dado que ambos son indicadores de calidad asistencial (door-to-CT, door-to-angio).

---

## 6. Próximos pasos

1. Revisar y aprobar este documento con el equipo
2. Implementar cambio 3.3 primero (bifurcación en contraindicaciones) — mayor impacto clínico
3. Implementar cambio 3.2 (scroll automático) — mejora de UX inmediata
4. Implementar cambio 3.1 (bloqueo selectivo) — requiere más testing para no romper flujos de carga rápida
5. Actualizar `getDoneContent()` para reflejar nuevos estados
