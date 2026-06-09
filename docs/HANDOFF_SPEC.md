# Handoff Spec — CodigoStroke Target Design

> Basado en el screenshot del diseño objetivo compartido el 2026-06-08.
> Stack: React 19 + Tailwind CSS 3 + Geist Mono + DM Sans.

---

## Overview

Pantalla principal del protocolo activo. El usuario es un médico/residente en guardia que tiene las manos ocupadas y opera bajo presión. La pantalla guía paso a paso el protocolo ACV isquémico con un timer siempre visible que comunica urgencia.

**Filosofía del diseño:** "ICU monitor meets flight instrument panel" — fondo oscuro navy, color solo para status clínico, tipografía monoespaciada para valores numéricos.

---

## Tokens utilizados (mapeo al sistema existente)

| Token | Variable CSS / Tailwind | Valor hex | Uso en pantalla |
|-------|------------------------|-----------|-----------------|
| `stroke-bg` | `bg-stroke-bg` | `#0F1C38` | Fondo general de la app |
| `stroke-navy` | `bg-stroke-navy` | `#132B58` | Superficie de cards |
| `stroke-line` | `border-stroke-line` | `#29416D` | Bordes de cards y dividers |
| `stroke-text` | `text-stroke-text` | `#F0F4FF` | Texto primario (títulos) |
| `stroke-textMuted` | `text-stroke-textMuted` | `#A8B6D6` | Texto secundario / labels |
| `stroke-iconActive` | `text-stroke-iconActive` | `#5C7AEA` | Texto "CÓDIGO STROKE", progress bar activa, step activo |
| `status-warning` | `text-status-warning` | `#FBBF24` | Timer display, selected option anormal, badge step completado |
| `status-warning-muted` | `bg-status-warning-muted` | `rgba(245,158,11,0.12)` | Fondo warning card |
| `status-warning-border` | `border-status-warning-border` | `rgba(245,158,11,0.35)` | Borde izquierdo warning card |

**Fuentes:**
| Rol | Familia | Clase Tailwind |
|-----|---------|---------------|
| Timer principal | Geist Mono | `font-mono` |
| Label "desde inicio" | DM Sans | `font-sans` |
| "CÓDIGO STROKE" | DM Sans | `font-sans` |
| "PASO 2/5" | DM Sans | `font-sans` |
| Título de paso | DM Sans | `font-sans` |
| Subtitle | Source Sans 3 | `font-body` |
| Score number en card | Geist Mono | `font-mono` |
| Option number | Geist Mono | `font-mono` |

---

## Layout de la pantalla

```
┌──────────────────────────────────────┐
│ HEADER STRIP  (h: 40px)              │ ← bg-stroke-bg, no elevation
│  "CÓDIGO STROKE"    [PASO 2/5]       │
├──────────────────────────────────────┤
│ TIMER HERO  (h: 88px)                │ ← bg-stroke-bg, padding: 16px 20px
│  00:14:37 •  desde inicio            │
│  ████████░░░░░░░░░  (progress bar)   │
├──────────────────────────────────────┤
│ STEP STEPPER  (h: 56px)              │ ← bg-stroke-bg, padding: 0 20px
│  ①  ②  3  4  5                       │
├──────────────────────────────────────┤
│ STEP CONTENT  (flex-1, overflow-y)   │ ← bg-stroke-bg, padding: 20px
│  H2: Evaluación NIHSS                │
│  p: Subtítulo                        │
│  [Warning Card]                      │
│  [NIHSS Item Card]                   │
│  [NIHSS Item Card]                   │
│  ...                                 │
└──────────────────────────────────────┘
```

**Max width:** 480px, centrado en desktop. Mobile: 100% viewport width.

---

## Componente: Header Strip

```
CÓDIGO STROKE                    PASO 2/5
```

| Propiedad | Valor |
|-----------|-------|
| Height | 40px |
| Padding | 0 20px |
| Background | `#0F1C38` (`stroke-bg`) |
| "CÓDIGO STROKE" font | DM Sans, 11px, semibold (600), tracking: 0.12em, uppercase |
| "CÓDIGO STROKE" color | `#5C7AEA` (`stroke-iconActive`) |
| [PASO X/Y] — pill background | `rgba(92,122,234,0.15)` |
| [PASO X/Y] — pill border | `rgba(92,122,234,0.30)` |
| [PASO X/Y] — pill border-radius | 999px (pill) |
| [PASO X/Y] — padding | 4px 10px |
| [PASO X/Y] — font | DM Sans, 11px, semibold, color `#5C7AEA` |

---

## Componente: Timer Hero

```
00:14:37 •    desde inicio
████████████░░░░░░░░░░░
```

| Propiedad | Valor |
|-----------|-------|
| Timer font | Geist Mono, 48px (text-4xl bumped), weight 700 |
| Timer color | `#FBBF24` (status-warning / amber-400) — **la única vez que se usa este size** |
| Timer letter-spacing | `-0.02em` (tight, tabular-nums) |
| Pulsing dot | 8px circle, `#FBBF24`, animation: `pulse-subtle 2s ease-in-out infinite` |
| Dot position | inline después del tiempo, vertically centered |
| "desde inicio" font | DM Sans, 12px, color `#A8B6D6` (textMuted), leading: 1.2 |
| "desde inicio" position | debajo del timer, alineado izquierda |
| Progress bar height | 4px |
| Progress bar track | `rgba(92,122,234,0.15)` |
| Progress bar fill | `#5C7AEA` (stroke-iconActive) |
| Progress bar border-radius | 9999px |
| Progress bar width | % basado en (elapsed / targetWindow * 100) — se satura al 100% |
| Padding total de la sección | 16px top, 20px sides, 8px bottom |

**Fases del timer (color del texto):**
| Minutos | Color timer | Semántica |
|---------|------------|-----------|
| 0–30 min | `#FBBF24` amber | Ventana activa |
| 30–60 min | `#F97316` orange-500 | Urgencia alta |
| >60 min | `#EF4444` red-500 | Fuera de ventana óptima |

---

## Componente: Step Stepper

```
  ①   ②   3   4   5
 [══════════════════] (línea conectora)
```

### Variantes de cada círculo:

| Estado | Descripción visual | Implementación |
|--------|-------------------|---------------|
| **Completado** (1) | Círculo relleno amber `#FBBF24`, número blanco, sin borde | `bg-status-warning text-stroke-bg rounded-full` |
| **Activo** (2) | Círculo con borde accent `#5C7AEA` 2px, fondo `rgba(92,122,234,0.15)`, número `#5C7AEA` | `border-2 border-stroke-iconActive bg-stroke-iconActive/15 text-stroke-iconActive rounded-full` |
| **Pendiente** (3-5) | Círculo con borde `#29416D`, fondo `#132B58`, número `#A8B6D6` muted | `border border-stroke-line bg-stroke-navy text-stroke-textMuted rounded-full` |

| Propiedad | Valor |
|-----------|-------|
| Tamaño círculo | 32px × 32px (w-8 h-8) |
| Font número | Geist Mono, 13px, semibold |
| Línea conectora | 1px, `#29416D` (stroke-line), centrada verticalmente detrás de los círculos |
| Gap entre círculos | flex + justify-between, ancho 100% |
| Padding sección | 8px 20px 12px |

---

## Componente: Warning Card

```
┌──────────────────────────────────────┐
│ ⚠  TA 188/104 mmHg — sobre umbral   │ ← amber left-border, dark bg
│    para tPA. Registrar y reevaluar   │
│    post-labetalol.                   │
└──────────────────────────────────────┘
```

| Propiedad | Valor |
|-----------|-------|
| Background | `rgba(245,158,11,0.08)` |
| Border | 1px `rgba(245,158,11,0.20)` |
| Left border | 3px solid `#FBBF24` |
| Border-radius | 10px |
| Padding | 12px 14px |
| Icon (⚠) | Lucide `AlertTriangle`, 16px, color `#FBBF24` |
| Icon position | Top-left, alineado con primera línea de texto |
| Texto bold inicial (valor TA) | DM Sans, 14px, semibold, color `#FBBF24` |
| Resto del texto | DM Sans, 14px, regular, color `#A8B6D6` |
| Margin | 0 0 12px 0 (entre cards) |

---

## Componente: NIHSS Item Card

```
┌──────────────────────────────────────┐
│ 1a. Nivel de conciencia          [0] │ ← título + score badge right
├──────────────────────────────────────┤
│  [0]    [1]    [2]    [3]            │
│ Alerta Somnol. Estupor Coma         │
└──────────────────────────────────────┘
```

| Propiedad | Valor |
|-----------|-------|
| Background | `#132B58` (stroke-navy) |
| Border | 1px `#29416D` (stroke-line) |
| Border-radius | 12px |
| Padding | 14px 16px |
| Margin bottom | 10px |

**Header de la card:**
| Propiedad | Valor |
|-----------|-------|
| Título "1a. Nivel de conciencia" | DM Sans, 14px, semibold, color `#F0F4FF` |
| Score badge (número derecha) | Geist Mono, 14px, semibold |
| Score badge — valor 0 | color `#A8B6D6` muted |
| Score badge — valor 1 | color `#FBBF24` amber |
| Score badge — valor ≥2 | color `#EF4444` red |

**Grid de opciones (4 columnas):**
| Propiedad | Valor |
|-----------|-------|
| Layout | CSS grid, 4 columnas equidistantes |
| Gap | 8px |
| Margin top | 10px |

**Botón de opción — UNSELECTED:**
| Propiedad | Valor |
|-----------|-------|
| Background | `rgba(41,65,109,0.5)` |
| Border | 1px `#29416D` |
| Border-radius | 8px |
| Padding | 10px 4px |
| Número font | Geist Mono, 16px, semibold, color `#A8B6D6` |
| Label font | DM Sans, 10px, color `#7089B8` (text-dim) |
| Label margin-top | 4px |

**Botón de opción — SELECTED (score normal / 0):**
| Propiedad | Valor |
|-----------|-------|
| Background | `#5C7AEA` (stroke-iconActive) |
| Border | 1px `#5C7AEA` |
| Número color | `#F0F4FF` white |
| Label color | `rgba(240,244,255,0.8)` |
| Transition | `background 150ms ease-out, border-color 150ms ease-out` |

**Botón de opción — SELECTED (score anormal / ≥2):**
| Propiedad | Valor |
|-----------|-------|
| Background | `transparent` |
| Border | 1.5px solid `#FBBF24` |
| Número color | `#FBBF24` amber |
| Label color | `rgba(251,191,36,0.75)` |
| (Para score ≥4 cambiar a red) | border `#EF4444`, número `#EF4444` |

---

## Estados e Interacciones

| Elemento | Estado | Comportamiento |
|----------|--------|---------------|
| Botón opción | Tap | Scale 0.96 en 80ms, luego vuelta a 1 en 120ms |
| Botón opción | Selected | Transición de color 150ms ease-out |
| Step completado | Transición | Scale 1→1.05→1 en 300ms, color animado de blue a amber |
| Timer dot | Idle | pulse-subtle 2s infinite ease-in-out (opacity 1→0.5→1) |
| Card nuevo score | Aparece | Fade-in 200ms |
| Warning card | Mount | Slide-down 250ms cubic-bezier(0.16,1,0.3,1) |

---

## Responsive

| Breakpoint | Comportamiento |
|-----------|--------------|
| Mobile (<768px) | Diseño principal. Max-width: 100%. Safe-area top/bottom. |
| Desktop (≥768px) | Max-width 480px centrado. Timer puede reducirse a 40px. Sidebar opcional con timeline de tiempos. |

---

## Edge Cases

| Caso | Comportamiento |
|------|---------------|
| Timer > 60 min | Texto timer cambia a red-500 (#EF4444) |
| Sin steps anteriores | Step 1 aparece como activo, sin completados |
| Todos los items NIHSS = 0 | Score badge usa color muted, no alarma |
| Score total NIHSS ≥ 21 | Badge total en rojo crítico (#EF4444) |
| Texto largo en warning card | Wraps, sin truncar — el contexto clínico es crítico |
| Un solo paso en el protocolo | Stepper oculto, no tiene sentido mostrarlo |
| Modo landscape | Timer se reduce a 36px, stepper comprime |

---

## Accesibilidad

| Elemento | Requerimiento |
|----------|-------------|
| Botones de opción | `aria-pressed="true/false"`, `aria-label="Score 2: Parcial"` |
| Timer | `aria-live="polite"` para actualización cada 60s (no cada segundo — muy ruidoso) |
| Paso activo | `aria-current="step"` en el círculo activo del stepper |
| Warning card | `role="alert"`, `aria-live="assertive"` si aparece dinámicamente |
| Score badge | `aria-label="Score actual: 2"` |
| Touch targets | Mínimo 44×44px para todos los botones de opción |

---

## Plan de Implementación

### Fase 0 — Cero código nuevo (1 día)
Actualizar `DESIGN.md` con las fases del timer (amber→orange→red) y documentar el patrón de step stepper.

### Fase 1 — Timer Hero + Header Strip (2–3 días)
1. Crear `StepHeader.jsx` — componente con "CÓDIGO STROKE" + "PASO X/Y"
2. Modificar `GlobalTimer.jsx`:
   - Sacar el timer del header strip del nav actual
   - Crear sección autónoma con el timer grande como hero
   - Agregar progress bar debajo del timer
   - Implementar fases de color (amber → orange → red)
3. Actualizar `App.jsx` para que `GlobalTimer` ocupe la sección hero, no el sticky top-bar

### Fase 2 — Step Stepper (2 días)
1. Crear `StepStepper.jsx` con los 3 estados visuales (completado, activo, pendiente)
2. Conectar con el estado `step` de `App.jsx`
3. Reemplazar el `TabBar` en la pantalla de evaluación pre-TC con el stepper numérico
4. El TabBar de tratamiento (post-CT) puede quedar o migrarse también

### Fase 3 — Warning Cards (1 día)
1. Crear `ClinicalAlert.jsx` — wrapper con left-border, icon, amber typography
2. Integrar en `VitalsStep` (TA) y `ContraindicationsStep`
3. Reemplazar banners inline actuales con este componente

### Fase 4 — NIHSS Item Card rediseñada (2–3 días)
1. Rediseñar `NihssModal.jsx` / `NihssStep.jsx` para usar el grid de 4 botones
2. Implementar los 3 estados del botón de opción (unselected, selected-normal, selected-abnormal)
3. Score badge dinámico con colores semánticos
4. Eliminar el modal y volverlo inline scroll

### Fase 5 — Polish y animaciones (1–2 días)
1. Agregar transiciones de step completion (scale flash verde)
2. Pulsing dot en el timer
3. Slide-down para warning cards dinámicas
4. Verificar safe-area en iOS (notch) con viewport-fit=cover

### Estimado total: 8–11 días de trabajo
Orden sugerido de PR: Fase 1 → Fase 3 → Fase 2 → Fase 4 → Fase 5

---

## Comparación con implementación actual

| Aspecto | Estado actual | Target (mockup) | Brecha |
|---------|--------------|-----------------|--------|
| Timer tamaño | ~22px en header bar | 48px hero section | 🔴 Rediseño de layout |
| Timer color | Blanco en navy | Amber en navy | 🟡 Solo color token |
| Header color fase | Siempre navy | Amber después de 30min (mobile) | 🟡 Quitar md: prefix |
| Navegación pasos | TabBar con íconos | Stepper numérico | 🔴 Nuevo componente |
| Indicador "PASO X/Y" | No existe | Pill top-right | 🟢 Fácil de agregar |
| Warning cards | Banners inline básicos | Card con left-border | 🟡 Refactor visual |
| NIHSS options | 4 pills horizontales | Grid con estado abnormal | 🟡 Agregar estado amber/red |
| Progress bar | No existe | Debajo del timer | 🟢 Fácil de agregar |
| Fondo general | dark navy ✅ | dark navy ✅ | ✅ Ya implementado |
| Fuentes | DM Sans + Geist Mono ✅ | DM Sans + Geist Mono ✅ | ✅ Ya implementado |

---

*Generado por design-handoff skill · CodigoStroke · 2026-06-08*
