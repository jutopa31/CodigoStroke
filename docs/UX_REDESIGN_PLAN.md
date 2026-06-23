# Plan de rediseño UX — Código Stroke

## Objetivo

Rediseñar Código Stroke como una herramienta clínica clara, progresiva y contextual,
inspirada en el modelo de interacción del checkout de Mercado Libre, sin copiar su
identidad visual.

El resultado debe transmitir:

- claridad bajo presión;
- una decisión principal por vez;
- estado clínico visible sin saturación;
- acciones que cambian según el contexto;
- revisión explícita antes de acciones clínicas importantes.

La lógica clínica, los cálculos, el almacenamiento y las bifurcaciones actuales no se
modifican durante la primera etapa del rediseño.

## Dirección estética

### Concepto: Mesa clínica clara

Una interfaz luminosa y sobria, parecida a una hoja de trabajo clínica bien organizada.
El fondo separa áreas; las superficies blancas contienen decisiones; el color aparece
solamente cuando comunica una acción o un estado clínico.

No se busca que la app “parezca Mercado Libre”. Se adopta su disciplina UX:

1. una pregunta concreta por pantalla;
2. opciones completas en filas o tarjetas tocables;
3. resumen contextual persistente;
4. acción principal estable y fácil de encontrar;
5. información secundaria visualmente silenciosa;
6. revisión antes de ejecutar;
7. posibilidad de volver y modificar cada bloque.

### Paleta propuesta

| Rol | Color inicial | Uso |
|---|---|---|
| Fondo de aplicación | `#F5F5F5` | Separación general |
| Superficie | `#FFFFFF` | Tarjetas, formularios y resúmenes |
| Superficie secundaria | `#FAFAFA` | Filas y paneles anidados |
| Texto principal | `#242424` | Títulos, valores y decisiones |
| Texto secundario | `#737373` | Explicaciones y metadatos |
| Divisor | `#E5E5E5` | Separación sin cajas pesadas |
| Acción primaria | `#2F6F62` | Continuar y confirmar pasos |
| Acción secundaria | `#3483FA` | Enlaces de edición e información |
| Éxito | `#00A650` | Completado o condición favorable |
| Advertencia | `#B7791F` | Contraindicación relativa |
| Crítico | `#D32F2F` | Hemorragia, hard stop o CI absoluta |

El verde profundo reemplaza al azul como color dominante de acción. El azul queda como
canal de navegación secundaria, evitando que toda la aplicación se sienta azul.

### Tipografía

Se mantienen las familias actuales porque ya tienen funciones clínicas claras:

- DM Sans: interfaz, títulos y acciones;
- Source Sans 3: explicaciones clínicas;
- Geist Mono: tiempo, NIHSS, TA, glucemia y dosis.

El rediseño cambia jerarquía, peso y espacio; no agrega fuentes nuevas.

## Modelo de interacción

### Anatomía de una pantalla

Cada pantalla activa tendrá cinco zonas:

1. **Barra clínica:** paciente, tiempo transcurrido y estado urgente.
2. **Título verbal:** “Cargá…”, “Elegí…”, “Revisá…”, “Administrá…”.
3. **Superficie de decisión:** una lista o formulario principal.
4. **Resumen contextual:** datos relevantes ya cargados.
5. **Barra de acción:** indica el próximo paso o exactamente qué falta.

### Barra de acción contextual

La acción inferior deja de ser una barra genérica. Su contenido deriva del estado:

| Contexto | Acción |
|---|---|
| Paciente incompleto | `Completá DNI y nombre` |
| Signos vitales incompletos | `Falta cargar glucemia` |
| Tiempo registrado | `Continuar a evaluación clínica` |
| NIHSS incompleto | `Continuar NIHSS · 6 de 15` |
| Imágenes pendientes | `Registrar resultado de TC` |
| CI sin responder | `Revisar 3 contraindicaciones` |
| Evaluación completa | `Calcular decisión` |
| Trombólisis indicada | `Preparar TNK` o `Preparar rtPA` |
| Posible OGV | `Evaluar trombectomía` |
| Fin del protocolo | `Revisar y cerrar caso` |

Nunca debe haber dos acciones primarias compitiendo en el mismo viewport.

### Estados de una sección

Cada paso utiliza cuatro estados visuales:

- **Pendiente:** tarjeta blanca, texto neutro.
- **En curso:** borde o indicador de acción primaria.
- **Completo:** resumen compacto con check verde y enlace `Modificar`.
- **Alerta:** superficie ámbar o roja sólo en el bloque afectado.

Las secciones completadas se comprimen, como ocurre en un checkout: conservan el dato
importante y ofrecen modificarlo sin mantener abierto todo el formulario.

## Traducción del checkout al protocolo

| Patrón observado | Aplicación en Código Stroke |
|---|---|
| Elegir forma de entrega | Elegir/registrar una condición clínica |
| Elegir cuándo llega | Registrar ventana terapéutica |
| Elegir cómo pagar | Elegir tratamiento disponible |
| Elegir cuotas | Configurar dosis y administración |
| Resumen de compra fijo | Resumen clínico dinámico |
| Revisá y confirmá | Revisar decisión y tratamiento |
| Modificar cada sección | Volver al bloque clínico correspondiente |
| Confirmar compra | Confirmar administración/activación, con protección |

## Arquitectura visual propuesta

### Mobile

- Flujo de una sola columna.
- Barra clínica compacta y persistente.
- Contenido con fondo gris y tarjetas blancas.
- Acción contextual fija en la parte inferior.
- Resumen clínico como panel desplegable, no sidebar.
- Progreso textual: `Paso 3 de 8 · Evaluación clínica`.

### Desktop

- Columna principal de decisión, máximo aproximado de 760 px.
- Columna derecha de 300–340 px para resumen clínico.
- El resumen se mantiene visible mientras se completa el paso.
- Se elimina la sensación de “tablero oscuro” y se evita llenar toda la pantalla.

### Temporizador

El temporizador sigue siendo persistente, pero deja de ocupar una gran isla oscura:

- texto mono de alto contraste;
- fondo blanco o gris muy claro;
- indicador lateral que cambia de verde a ámbar y rojo;
- hitos clínicos mostrados sólo cuando son pertinentes;
- color rojo reservado para una urgencia real, no para decoración.

## Fases de implementación

### Fase 0 — Línea base y protección

Objetivo: garantizar que el rediseño no altere decisiones clínicas.

Tareas:

- ejecutar `pnpm run test:unit`, `pnpm test` y `pnpm run build`;
- guardar capturas de los caminos clínicos principales;
- registrar estados mobile y desktop;
- definir una lista de invariantes clínicas;
- corregir textos con problemas de codificación visibles antes de comparar capturas.

Criterio de salida:

- pruebas actuales en verde;
- capturas de referencia disponibles;
- caminos de hemorragia, CI absoluta, CI relativa y dosificación documentados.

### Fase 1 — Tokens y tema claro por defecto

Objetivo: reemplazar la dependencia visual azul/oscura sin modificar layouts complejos.

Archivos principales:

- `src/index.css`
- `tailwind.config.js`
- `src/App.jsx`
- `DESIGN.md`

Tareas:

- crear tokens semánticos de superficie, texto, acción y estados;
- hacer `light` el tema predeterminado;
- reemplazar `stroke-navy`, `stroke-bg` y azul de marca en superficies estructurales;
- introducir clases compartidas para tarjeta, fila seleccionable y enlace de edición;
- conservar el modo oscuro temporalmente como opción secundaria, sin optimizarlo aún;
- eliminar usos de color que no transmitan significado.

Criterio de salida:

- toda la aplicación es utilizable en tema claro;
- contraste WCAG AA en texto y controles;
- ninguna alerta clínica depende únicamente del color;
- no hay cambios en comportamiento.

### Fase 2 — Shell y navegación progresiva

Objetivo: establecer la anatomía común de pantalla.

Archivos principales:

- `src/App.jsx`
- `src/components/GlobalTimer.jsx`
- `src/components/StepStepper.jsx`
- `src/components/StepPill.jsx`
- nuevo `src/components/ClinicalHeader.jsx`
- nuevo `src/components/ContextualActionBar.jsx`
- nuevo `src/components/ClinicalSummary.jsx`

Tareas:

- convertir el header en una barra clínica clara y compacta;
- simplificar el stepper a progreso legible y no dominante;
- crear resumen contextual responsive;
- centralizar toda acción inferior en `ContextualActionBar`;
- remover FABs cuando dupliquen acciones visibles;
- mantener herramientas secundarias dentro de un menú `Más`.

Criterio de salida:

- una única acción primaria por pantalla;
- paciente, tiempo y próximo paso identificables en menos de tres segundos;
- la barra inferior explica por qué una acción está bloqueada;
- paridad funcional entre mobile y desktop.

### Fase 3 — Patrón de tarjeta de decisión

Objetivo: unificar cómo se elige, completa, revisa y modifica información.

Archivos principales:

- `src/components/StepCard.jsx`
- nuevo `src/components/DecisionCard.jsx`
- nuevo `src/components/CompletedSection.jsx`
- nuevo `src/components/ReviewRow.jsx`
- pasos en `src/steps/`

Tareas:

- hacer tocable la superficie completa de opciones radio/checkbox;
- sustituir bordes intensos por divisores y estado seleccionado;
- colapsar pasos completos a un resumen con `Modificar`;
- revelar explicaciones sólo cuando la respuesta lo requiera;
- mantener touch targets de al menos 44 px;
- normalizar estados vacío, seleccionado, completo, warning y critical.

Criterio de salida:

- todos los pasos comparten la misma gramática visual;
- la selección se entiende sin depender de íconos pequeños;
- no se muestran explicaciones irrelevantes;
- editar un bloque no borra información de otros pasos.

### Fase 4 — Rediseño por dominio clínico

Objetivo: adaptar la jerarquía a la naturaleza de cada paso.

Orden recomendado:

1. Paciente y vitales.
2. Tiempo y síntomas.
3. NIHSS.
4. Imágenes.
5. Contraindicaciones.
6. Decisión.
7. Dosificación y tratamiento.
8. Resumen.

Reglas específicas:

- **Paciente/vitales:** formulario corto con valores recientes visibles.
- **Tiempo:** opciones de inicio conocido/wake-up antes del detalle horario.
- **NIHSS:** modo guiado de una pregunta por vez y progreso persistente.
- **Imágenes:** resultado principal primero; detalles sólo después.
- **Contraindicaciones:** una fila por condición; positivos expanden descripción.
- **Decisión:** resultado dominante, razones visibles y siguiente conducta.
- **Dosis:** peso, droga, cálculo y checklist en ese orden.
- **Resumen:** agrupado por paciente, tiempo, imágenes, decisión y tratamiento.

Criterio de salida:

- cada paso empieza con una pregunta o tarea inequívoca;
- la información crítica aparece antes que la educativa;
- el flujo puede completarse sin abrir paneles educativos.

### Fase 5 — Revisión clínica antes de ejecutar

Objetivo: crear el equivalente de “Revisá y confirmá”.

Componentes:

- nuevo `src/steps/ClinicalReviewStep.jsx`
- nuevo `src/components/ConfirmationGuard.jsx`

Contenido:

- paciente e identificación;
- última vez normal y ventana;
- NIHSS y síntomas incapacitantes;
- TC/RM;
- contraindicaciones positivas;
- decisión calculada y razones;
- droga, peso y dosis;
- destino de trombectomía;
- enlaces `Modificar` por sección.

Las acciones irreversibles o clínicamente sensibles deben usar verbos explícitos:

- `Registrar inicio de TNK`;
- `Registrar inicio de rtPA`;
- `Activar equipo de trombectomía`;
- `Cerrar caso sin trombólisis`.

No usar un ambiguo `Confirmar`.

Criterio de salida:

- ningún registro de administración ocurre desde una pantalla sin resumen;
- el usuario entiende qué acción quedará registrada;
- cada dato relevante puede modificarse antes de ejecutar.

### Fase 6 — Movimiento, accesibilidad y pulido

Objetivo: hacer que el sistema se sienta rápido y estable.

Tareas:

- transición breve al completar o colapsar una sección;
- evitar animaciones continuas salvo el temporizador cuando sea necesario;
- soporte de `prefers-reduced-motion`;
- orden de foco y navegación con teclado;
- mensajes de error junto al campo;
- estados de carga y guardado discretos;
- revisión con zoom, modo PWA y safe areas;
- auditar etiquetas accesibles y contraste.

Criterio de salida:

- no hay saltos de layout en el flujo principal;
- el foco avanza al título del nuevo paso;
- el flujo completo funciona con teclado;
- las animaciones no retrasan decisiones.

### Fase 7 — Validación clínica y lanzamiento

Objetivo: comprobar que la claridad visual mejora el uso real.

Prueba con al menos tres escenarios:

1. TC con hemorragia.
2. ACV isquémico con CI absoluta.
3. Candidato a trombólisis y evaluación de trombectomía.

Métricas:

- tiempo para identificar el próximo paso;
- errores u omisiones;
- retrocesos innecesarios;
- tiempo para completar el protocolo;
- comprensión de alertas;
- confianza antes de registrar tratamiento.

El modo anterior debe conservarse detrás de un flag durante la validación inicial.

## Orden técnico recomendado

1. Tokens claros.
2. Componentes base.
3. Shell y barra contextual.
4. Pasos de fase predecisión.
5. Decisión y tratamiento.
6. Revisión final.
7. QA visual y clínico.
8. Eliminar estilos y componentes obsoletos.

No conviene rediseñar todos los pasos simultáneamente. Primero se implementa el sistema
en Paciente, Tiempo y Contraindicaciones; si la gramática funciona, se extiende al resto.

## Estrategia de pruebas

### Unitarias

Los cálculos y algoritmos existentes deben continuar pasando sin modificaciones.

```bash
pnpm run test:unit
```

### E2E

Agregar aserciones para:

- acción contextual correcta según datos faltantes;
- edición de una sección completada;
- colapso y expansión;
- navegación hasta revisión final;
- bloqueo de confirmación cuando faltan datos;
- caminos de hemorragia, CI absoluta y CI relativa.

```bash
pnpm test
```

### Visuales

Capturar, como mínimo:

- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Comparar:

- inicio;
- vitales incompletos;
- NIHSS;
- contraindicación positiva;
- decisión;
- revisión final.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| La estética comercial reduce seriedad clínica | Mantener lenguaje, tipografía y semántica clínica propias |
| Demasiado blanco produce fatiga | Fondo gris cálido, superficies delimitadas y contraste controlado |
| Barra fija tapa contenido | Mantener shell flex y reservar safe area |
| El resumen distrae en mobile | Panel plegable con sólo valores críticos |
| Color insuficiente para alertas | Ícono, título, texto y estructura además de color |
| Refactor visual altera lógica | Cambios por capas y pruebas clínicas después de cada fase |
| Demasiadas acciones contextuales confunden | Una acción primaria y máximo una secundaria visible |

## Definición de terminado

El rediseño estará terminado cuando:

- el tema claro sea la experiencia predeterminada;
- ninguna pantalla parezca un tablero azul oscuro;
- exista una sola acción primaria contextual;
- todos los pasos tengan estados pendiente, activo, completo y alerta coherentes;
- el usuario pueda revisar y modificar antes de registrar tratamiento;
- los caminos clínicos existentes mantengan sus resultados;
- unit tests, E2E, build y revisión visual estén en verde;
- la interfaz haya sido validada por usuarios clínicos en escenarios simulados.

## Primer incremento implementable

El primer incremento debe incluir únicamente:

1. nuevos tokens claros;
2. `ClinicalHeader`;
3. `ContextualActionBar`;
4. `ClinicalSummary`;
5. nuevo patrón aplicado a Paciente, Tiempo y Contraindicaciones;
6. capturas y E2E de esos tres pasos.

Este corte permite validar la dirección antes de migrar NIHSS, imágenes, decisión y
tratamiento.
