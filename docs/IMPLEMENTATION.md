# Implementación — Código Stroke

## URLs

| Recurso | URL |
|---|---|
| Repositorio GitHub | https://github.com/jutopa31/CodigoStroke |
| App en producción | https://codigo-stroke.vercel.app |
| Dashboard Vercel | https://vercel.com/julianmartinalonso-1393s-projects/codigo-stroke |

## Comandos

```bash
npm run dev          # Servidor de desarrollo (localhost:5174)
npm run build        # Build de producción → /dist  (incluye SW + manifest)
npm run preview      # Preview del build en local
```

Acceso desde celular en red local:
```bash
npm run dev -- --host 0.0.0.0
# → http://192.168.0.168:5174
```

---

## PWA — Instalación mobile

El PWA está activo. Al abrir la app en el celular:

**Android (Chrome):**
- Aparece banner "Agregar a pantalla de inicio"
- O desde el menú ⋮ → "Instalar app"
- Funciona offline después de la primera carga

**iOS (Safari):**
- Botón compartir → "Añadir a la pantalla de inicio"
- El icono `apple-touch-icon.png` (180×180) aparece en la pantalla de inicio
- `display: standalone` → se abre sin barra del browser

**Íconos generados** (en `/public/`):
- `icon-192.png` — Android PWA
- `icon-512.png` — Android PWA maskable
- `apple-touch-icon.png` — iOS

Para regenerar los íconos con un diseño distinto:
```bash
python3 - << 'EOF'
from PIL import Image, ImageDraw
# ... ver script en historial de conversación
EOF
```

---

## Configurar EmailJS

1. Crear cuenta en [emailjs.com](https://www.emailjs.com) (plan gratuito: 200 emails/mes)
2. Crear un **Service** (Gmail, Outlook, etc.) → copiar `Service ID`
3. Crear un **Template**:
   ```
   Asunto: CÓDIGO STROKE — {{patient_name}} (DNI {{patient_dni}})
   Cuerpo:
   CÓDIGO STROKE ACTIVADO
   Paciente: {{patient_name}} — DNI: {{patient_dni}}
   Hora de inicio: {{start_time}}
   Servicio: {{hospital}}
   ```
4. Copiar `Template ID` y `Public Key`
5. Crear `.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
   ```

---

## Configurar Supabase (Fase 7 — pendiente)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. SQL Editor:
   ```sql
   CREATE TABLE stroke_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     patient_dni TEXT NOT NULL,
     patient_name TEXT NOT NULL,
     symptoms JSONB,
     last_seen_normal TIMESTAMPTZ,
     vitals JSONB,
     nihss_score INTEGER,
     has_disabling_symptoms BOOLEAN,
     ct_request_time TIMESTAMPTZ,
     ct_elapsed_seconds INTEGER,
     ct_bleeding BOOLEAN,
     contraindications JSONB,
     drug TEXT,
     weight_kg NUMERIC,
     dose JSONB,
     checklist JSONB,
     email_sent BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ALTER TABLE stroke_events ENABLE ROW LEVEL SECURITY;
   ```
3. Agregar al `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxx
   ```

---

## Deploy en Vercel

Cada `git push` a `main` redeploya automáticamente.

```bash
git add .
git commit -m "feat: descripción"
git push
```

Variables de entorno en producción:
https://vercel.com/julianmartinalonso-1393s-projects/codigo-stroke/settings/environment-variables

**Sin variables de entorno**, la app funciona completa en modo mock (email simulado en consola, storage en localStorage).

---

## Convenciones de código

- Sin TypeScript por ahora
- Sin Context / Redux — estado en `App.jsx`
- Sin React Router — navegación lineal secuencial
- Props hacia abajo, callbacks hacia arriba
- Tailwind exclusivamente (color brand en `tailwind.config.js`)
- `steps/` = un archivo por paso clínico
- `components/` = reutilizables entre pasos
- `content/` = datos clínicos separados de la UI

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_EMAILJS_SERVICE_ID` | Para email real | ID del service de EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | Para email real | ID del template de EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | Para email real | Clave pública de EmailJS |
| `VITE_SUPABASE_URL` | Fase 7 | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Fase 7 | Clave anon de Supabase |
