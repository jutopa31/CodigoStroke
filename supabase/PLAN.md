# Plan de producción — Código Stroke + Supabase

## Estado actual

- [x] **Prioridad 1 — Activar Supabase + offline-first** *(completado)*
  - Cliente Supabase activado vía variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
  - `storage.js` con upsert por id + sync fire-and-forget + `syncPendingEvents()` al reconectar
  - DNI hasheado (SHA-256) antes de cualquier escritura remota
  - Schema SQL con RLS, columnas generadas `door_to_needle_min` / `door_to_ct_min`

---

## Próximos pasos

### Prioridad 2 — Autenticación (estimado: 2-3 días)

**Objetivo:** solo el personal autorizado puede iniciar un código stroke y ver los datos.

- [ ] Login con Supabase Auth (email + password)
- [ ] Pantalla de login previa al `StartStep`
- [ ] Completar el campo `profiles.institution_id` al registrar usuarios
- [ ] Poblar `stroke_events.created_by` con `supabase.auth.getUser()` al guardar
- [ ] Logout en la pantalla de resumen final (DONE)

**Decisiones pendientes:**
- ¿Registro libre o invitación por institución? (recomendado: invitación)
- ¿Sesión persistente entre recargas o login por turno?

---

### Prioridad 3 — Multisite / instituciones (estimado: 1-2 días)

**Objetivo:** que cada institución vea solo sus propios casos.

- [ ] Crear al menos una institución en la tabla `institutions`
- [ ] Asignar `institution_id` en el perfil del usuario al registrarse
- [ ] Poblar `stroke_events.institution_id` al guardar el evento
- [ ] Verificar que las políticas RLS filtren correctamente por institución

---

### Prioridad 4 — Dashboard analítico (estimado: 3-5 días)

**Objetivo:** métricas de calidad asistencial en tiempo real.

- [ ] Ruta `/dashboard` (solo rol `admin`)
- [ ] Métricas clave:
  - Door-to-needle promedio (columna `door_to_needle_min` ya calculada)
  - Tasa de trombolisis (% casos `thrombolysis_given = true`)
  - Distribución NIHSS al ingreso
  - Casos por mes / institución
- [ ] Filtros por rango de fechas e institución
- [ ] Exportar a CSV

**Query de referencia (ya funciona con el schema actual):**
```sql
select
  date_trunc('month', created_at)       as mes,
  count(*)                              as total_casos,
  count(*) filter (where thrombolysis_given) as con_trombolisis,
  round(avg(door_to_needle_min))        as dtn_promedio_min
from stroke_events
where form_status = 'completed'
group by 1
order by 1 desc;
```

---

### Prioridad 5 — Hardening para producción (estimado: 1-2 días)

- [ ] Agregar `.env.local` al `.gitignore` (verificar que ya esté)
- [ ] Configurar dominio personalizado en Supabase
- [ ] Habilitar confirmación de email en Supabase Auth
- [ ] Rate limiting en las políticas RLS (evitar scraping masivo)
- [ ] Revisar que `form_snapshot` no filtre datos sensibles adicionales
- [ ] Tests de integración con Supabase (vitest + supabase local CLI)

---

## Activar el proyecto ahora (checklist)

1. Crear proyecto en [supabase.com](https://supabase.com) → copiar URL y anon key
2. Ejecutar `supabase/schema.sql` en el SQL Editor del proyecto
3. Crear `.env.local` en la raíz con:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. `npm run dev` → la app ya sincroniza eventos a Supabase
