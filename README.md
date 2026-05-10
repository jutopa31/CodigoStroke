# Código Stroke — App de Atención ACV Agudo

App web **mobile-first** para guiar el protocolo de atención de ACV isquémico en fase aguda (Código Stroke) en guardia hospitalaria. Basada en guías AHA/ASA 2026.

> **Directorio:** `/home/jutopa/CodigoStroke/`

---

## Inicio rápido

```bash
cd /home/jutopa/CodigoStroke
npm install         # solo primera vez
npm run dev         # http://localhost:5174
```

Acceso desde celular en la red local:

```bash
npm run dev -- --host 0.0.0.0
# → http://192.168.0.168:5174
```

---

## Documentación

| Archivo | Contenido |
|---|---|
| `docs/ARCHITECTURE.md` | Estructura de archivos, componentes, estado global, flujo de datos |
| `docs/IMPLEMENTATION.md` | Stack, configuración de EmailJS, Supabase, deploy en Vercel |
| `docs/NEXT_STEPS.md` | Roadmap clínico y técnico — todas las fases pendientes |

---

## Stack

- **React 19** + **Vite 8** — SPA, sin router (estado en memoria por sesión)
- **Tailwind CSS 3** — mobile-first utility classes
- **Lucide React** — iconos
- **EmailJS** (`@emailjs/browser`) — notificaciones email client-side sin backend
- **uuid** — IDs únicos por evento de stroke
- **localStorage** — persistencia mock (interfaz lista para Supabase)

---

## Flujo clínico implementado (Fase 1)

```
[Landing] → [Datos Paciente] → [Modal Alerta + Email]
         → [Síntomas + Último visto asintomático]
         → [Signos vitales: TA + Glucemia]
         → [NIHSS: directo o calculadora modal]
         → [Acciones inmediatas: checklist]
         → [Fase inicial completa]
```

Cronómetro global activo desde la confirmación del código (fixed top-right, color verde/amarillo/rojo según tiempo transcurrido).
