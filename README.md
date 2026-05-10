# Código Stroke — App de Atención ACV Agudo

App web **mobile-first** para guiar el protocolo de atención de ACV isquémico en fase aguda (Código Stroke) en guardia hospitalaria. Basada en guías AHA/ASA 2026.

> **Directorio:** `/home/jutopa/CodigoStroke/`
> **Repo:** https://github.com/jutopa31/CodigoStroke
> **Demo en vivo:** https://codigo-stroke.vercel.app

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
| `docs/IMPLEMENTATION.md` | Stack, PWA, EmailJS, Supabase, deploy en Vercel |
| `docs/NEXT_STEPS.md` | Roadmap clínico y técnico — fases pendientes |

---

## Deploy

Cada `git push` a `main` redeploya automáticamente en Vercel.

```bash
git add .
git commit -m "feat: descripción del cambio"
git push
```

---

## Stack

- **React 19** + **Vite 8** — SPA sin router
- **Tailwind CSS 3** — mobile-first, color brand `#9b2c2c`
- **Lucide React** — iconos
- **vite-plugin-pwa** — PWA instalable, offline-first
- **EmailJS** — notificaciones email client-side
- **uuid** — IDs únicos por evento
- **localStorage** — persistencia (interfaz lista para Supabase)

---

## Flujo clínico implementado

```
[Landing]
  → [Datos Paciente]
  → [Modal Alerta + Email]
  → [Síntomas + Último visto asintomático]
  → [Signos vitales: TA + Glucemia]
  → [NIHSS + síntomas discapacitantes si NIHSS < 5]
  → [Acciones inmediatas: checklist]
  → [TC de encéfalo: solicitud (timestamp) + resultado hemorragia]
  → si sangrado → FIN (contraindicación absoluta)
  → [Contraindicaciones: semáforo rojo + amarillo AHA/ASA 2026]
  → si contraindicación absoluta → FIN
  → [Cálculo de dosis: TNK o rtPA + checklist post-trombolisis]
  → [FIN: protocolo completo]
```

Cronómetro global activo desde la confirmación del código (fixed top-right, color verde/amarillo/rojo según tiempo transcurrido).

---

## PWA — Instalación en celular

La app es instalable como app nativa:
- **Android**: Chrome → menú ⋮ → "Instalar app"
- **iOS**: Safari → compartir → "Añadir a la pantalla de inicio"

Funciona **offline** después de la primera carga.
