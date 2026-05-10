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
npm run build        # Build de producción → /dist
npm run preview      # Preview del build en local
```

## Configurar EmailJS

1. Crear cuenta en [emailjs.com](https://www.emailjs.com) (plan gratuito: 200 emails/mes)
2. Crear un **Service** (Gmail, Outlook, etc.) → copiar el `Service ID`
3. Crear un **Template** con las variables:
   ```
   Asunto: CÓDIGO STROKE — {{patient_name}} (DNI {{patient_dni}})
   Cuerpo: 
   CÓDIGO STROKE ACTIVADO
   Paciente: {{patient_name}}
   DNI: {{patient_dni}}
   Hora de inicio: {{start_time}}
   Servicio: {{hospital}}
   
   Por favor presentarse en Shockroom de inmediato.
   ```
4. Copiar `Template ID` y `Public Key`
5. Crear `/home/jutopa/CodigoStroke/.env`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
   ```
6. Reiniciar el servidor de dev

**Para agregar destinatarios múltiples** (neurología, terapia, neurocirugía por separado), EmailJS permite usar `to_email` como variable en el template y pasarla como lista. Alternativa: crear un template que envíe CC a múltiples direcciones configuradas en el service.

## Configurar Supabase (próxima fase)

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a SQL Editor y ejecutar:
   ```sql
   CREATE TABLE stroke_events (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     patient_dni TEXT NOT NULL,
     patient_name TEXT NOT NULL,
     symptoms JSONB,
     last_seen_normal TIMESTAMPTZ,
     vitals JSONB,
     nihss_score INTEGER,
     checklist JSONB,
     email_sent BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ALTER TABLE stroke_events ENABLE ROW LEVEL SECURITY;
   ```
3. Descomentar el cliente en `src/lib/supabase.js`
4. Reemplazar `storage.js` para usar el cliente Supabase
5. Agregar al `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxx
   ```

## Deploy en Vercel

El proyecto ya está conectado. Cada `git push` a `main` redeploya automáticamente.

```bash
git add .
git commit -m "feat: descripción"
git push   # Vercel CI/CD redeploya solo
```

Para redeploy manual desde CLI:
```bash
vercel --prod
```

**Variables de entorno en producción:** configurarlas en el dashboard de Vercel:
https://vercel.com/julianmartinalonso-1393s-projects/codigo-stroke/settings/environment-variables

**Sin variables de entorno configuradas**, la app funciona igual — el email se simula en consola y el storage usa localStorage.

## Agregar como PWA (instalable en celular)

Instalar el plugin:
```bash
npm install -D vite-plugin-pwa
```

En `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Código Stroke',
        short_name: 'Stroke',
        theme_color: '#DC2626',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

Esto permite "Agregar a pantalla de inicio" en iOS y Android → app funciona como nativa.

## Convenciones de código

- **Sin TypeScript** por ahora — migrar si el proyecto crece con más desarrolladores
- **Sin Context / Redux** — el estado vive en `App.jsx` (una sesión = un código stroke)
- **Sin React Router** — la navegación es lineal/secuencial, no necesita URLs
- **Props hacia abajo, callbacks hacia arriba** — patrón clásico de React
- **Tailwind exclusivamente** — no agregar CSS custom salvo animaciones que no puede hacer Tailwind
- **Componentes en `steps/`** = un archivo por paso del protocolo clínico
- **Componentes en `components/`** = reutilizables entre pasos
- **`content/nihss.js`** = datos clínicos separados de la UI

## Variables de entorno

| Variable | Requerida | Descripción |
|---|---|---|
| `VITE_EMAILJS_SERVICE_ID` | Para email real | ID del service de EmailJS |
| `VITE_EMAILJS_TEMPLATE_ID` | Para email real | ID del template de EmailJS |
| `VITE_EMAILJS_PUBLIC_KEY` | Para email real | Clave pública de EmailJS |
| `VITE_SUPABASE_URL` | Futura fase | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Futura fase | Clave anon de Supabase |

Sin ninguna de estas variables la app funciona completa en modo mock.
