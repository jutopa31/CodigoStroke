# Estado del rediseño oscuro — CodigoStroke

> Documento de proceso y estado real de la implementación del rediseño visual.
> Última actualización: 2026-06-07

---

## 1. Dónde estamos parados

| Cosa | Valor |
|------|-------|
| **Proyecto** | `/home/jutopa/CodigoStroke/` |
| **Repo** | https://github.com/jutopa31/CodigoStroke |
| **Producción** | https://codigo-stroke.vercel.app (sirve la rama `main`) |
| **Rama del rediseño** | `design/patient-vitals-identity-card` (pusheada) |
| **Preview Vercel** | https://codigo-stroke-2tah3in4m-julianmartinalonso-1393s-projects.vercel.app |

## 2. Cómo empezó esto

1. `/design-consultation` (skill de gstack) → creó **`DESIGN.md`** (el sistema de
   diseño: "Clinical Command Center", navy oscuro, DM Sans + Geist Mono, un acento)
   y un **mock en HTML** (`/tmp/codigostroke-design-preview-*.html`).
2. `/design-review` → auditó la app contra DESIGN.md y **implementó** la migración
   a oscuro en 7 commits.

## 3. La distinción clave (importante)

**El mock HTML NO es lo que se implementó.** Son dos cosas distintas:

- **El mock HTML** fue una *dirección de diseño aspiracional*: pantallas idealizadas
  inventadas desde cero para mostrar el "feeling" (timer hero, grid NIHSS, etc.).
  Es bonito porque es un diseño limpio sin las restricciones de la app real.
- **Lo implementado** es el *sistema de diseño* (tokens de color, fuentes, tema
  oscuro) **aplicado a la app existente**. Es decir: se recoloreó y re-tipografió la
  app real, manteniendo su estructura, layouts y arquitectura de información actuales.

**Resultado:** el lenguaje visual (colores, fuentes, oscuridad, acento) ahora coincide
con el spec. Pero los **layouts de cada pantalla siguen siendo los de la app original**,
no una copia pixel a pixel del mock. Por eso "no se parece" al mock: el mock mostraba
composiciones ideales que nunca fueron un plano de implementación.

## 4. Qué SÍ está hecho (en código, en la rama, pusheado)

7 commits sobre `main` (06d2c10):

| Commit | Qué |
|--------|-----|
| `c5d9429` | Fundación: fuentes (DM Sans/Source Sans 3/Geist Mono), tokens, crítico rojo |
| `e4d0788` | Landing (StartStep) a oscuro |
| `c069f69` | Flujo interno a oscuro (shell + StepCard + ~19 pantallas/modales) |
| `f02ff06` | Polish: bordes blancos, gradiente, líneas de acento, Imaging |
| `5e44f4a` | Unificación de azules → navy + un solo accent #5C7AEA (header incluido) |
| `61b1e20` | Limpieza de bordes/rings royal-blue restantes |
| `c01ba64` | Tokens de estado a oscuro (bordes TA/glucosa/F.Ventana) |

Verificado visualmente en mobile: Paciente, Tiempo, NIHSS, CI Relativas, Imaging,
header con timer corriendo. Build pasa, eslint limpio (solo warnings pre-existentes).

## 5. Qué FALTA / estado real

### Bloqueante para que lo veas en vivo
- [ ] **No está en `main`** → producción (`codigo-stroke.vercel.app`) sigue mostrando
  el diseño VIEJO (claro, Inter). Para que vaya en vivo: mergear la rama a main.
  Mientras tanto, solo se ve en la **preview** o en localhost.

### Calidad / pendiente de verificación
- [ ] **QA visual de pantallas secundarias** (migradas por sed, no eyeballeadas):
  modales (OutOfWindow, WakeUp, Anticoag, Aspect), Modo Educativo, NihssFullEditor,
  pantallas fase-2 (CT/MRI/Dosage/Thrombectomy). Mismos patrones, deberían estar bien.

### Si querés que se parezca MÁS al mock (trabajo adicional, NO hecho)
Esto sería rediseñar **layouts** pantalla por pantalla para igualar las composiciones
del mock (no solo recolorear). Es trabajo nuevo y más grande:
- [ ] Rehacer la composición de cada pantalla para igualar el mock
- [ ] Decidir qué partes del mock son "ideal alcanzable" vs "solo inspiración"

## 6. Próximos pasos sugeridos

1. **Abrir la preview en el celular** y comparar con el mock → decidir si el sistema
   de diseño aplicado es suficiente, o si querés perseguir el layout del mock.
2. Si está OK → **mergear a main** para deployar a producción.
3. Si querés más fidelidad al mock → abrir una sesión de rediseño de layouts
   (pantalla por pantalla), que es un esfuerzo separado.

## 7. Artefactos

- `DESIGN.md` — el sistema de diseño (fuente de verdad)
- Mock HTML — `/tmp/codigostroke-design-preview-1780872972.html` (efímero, en /tmp)
- Reportes — `~/.gstack/projects/jutopa31-CodigoStroke/designs/design-audit-20260607/`
  - `gap-analysis-vs-designmd.md` (el análisis de brecha + progreso)
