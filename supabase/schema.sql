-- ============================================================
-- Código Stroke — Schema Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- Instituciones (multisite futuro)
-- ------------------------------------------------------------
create table if not exists institutions (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null,
  code  text unique not null
);

-- ------------------------------------------------------------
-- Perfiles de usuario (extiende auth.users)
-- ------------------------------------------------------------
create table if not exists profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  institution_id  uuid references institutions(id),
  role            text check (role in ('physician', 'nurse', 'admin')),
  display_name    text
);

-- Auto-crear perfil vacío al registrar usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ------------------------------------------------------------
-- Eventos de stroke (tabla principal)
-- ------------------------------------------------------------
create table if not exists stroke_events (
  id              uuid primary key,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- Contexto institucional y operador
  institution_id  uuid references institutions(id),
  created_by      uuid references auth.users(id),

  -- Datos del paciente anonimizados
  -- El DNI nunca se guarda en claro: solo SHA-256 del número
  patient_dni_hash  text,
  patient_alias     text,
  patient_mrs_score smallint check (patient_mrs_score between 0 and 6),

  -- Tiempos clave (columnas propias → indexables para métricas)
  door_time                  timestamptz,
  symptom_onset_time         timestamptz,
  alert_sent_at              timestamptz,
  ct_request_time            timestamptz,
  thrombolytic_start_at      timestamptz,
  angio_request_time         timestamptz,
  thrombectomy_activation_at timestamptz,

  -- Métricas derivadas en minutos (calculadas automáticamente al INSERT/UPDATE)
  door_to_needle_min  int generated always as (
    case when thrombolytic_start_at is not null and door_time is not null
    then (extract(epoch from (thrombolytic_start_at - door_time)) / 60)::int
    end
  ) stored,

  door_to_ct_min  int generated always as (
    case when ct_request_time is not null and door_time is not null
    then (extract(epoch from (ct_request_time - door_time)) / 60)::int
    end
  ) stored,

  -- Flags clínicos indexables (útiles para filtros y dashboards)
  is_wake_up_stroke              boolean,
  has_bleeding                   boolean,
  has_mismatch                   boolean,
  has_absolute_contraindication  boolean,
  thrombolysis_given             boolean,
  thrombectomy_activated         boolean,
  drug_used                      text check (drug_used in ('rtpa', 'tnk')),
  nihss_score                    smallint check (nihss_score between 0 and 42),
  aspects_score                  smallint check (aspects_score between 0 and 10),

  -- Datos clínicos estructurados como JSONB
  vitals            jsonb,  -- { systolic, diastolic, glucose }
  symptoms          jsonb,  -- { symptoms: {}, isWakeUpStroke, anticoagulation: {}, lastSeenNormal, modifiedRankinScale: {} }
  contraindications jsonb,  -- { red: {}, orange: {}, hasAbsolute, hasRelative, decidedNotToThrombolyze }
  dosage            jsonb,  -- { drug, weight, dose: { total, bolo, infusion } }
  thrombectomy      jsonb,  -- { aspectScore, angioRequested, hemodinamisNotified, ... }

  -- Estado del formulario (permite recuperar sesiones incompletas)
  form_status   text check (form_status in ('in_progress', 'completed', 'abandoned')) default 'in_progress',
  last_step     int,
  form_snapshot jsonb  -- snapshot completo del estado del form (sin DNI en claro)
);

-- Trigger para actualizar updated_at automáticamente
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger stroke_events_updated_at
  before update on stroke_events
  for each row execute procedure update_updated_at();

-- Índices para queries analíticas y de rendimiento
create index if not exists idx_stroke_events_created_at       on stroke_events (created_at);
create index if not exists idx_stroke_events_institution       on stroke_events (institution_id);
create index if not exists idx_stroke_events_thrombolysis      on stroke_events (thrombolysis_given);
create index if not exists idx_stroke_events_door_to_needle    on stroke_events (door_to_needle_min);
create index if not exists idx_stroke_events_dni_hash          on stroke_events (patient_dni_hash);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table stroke_events  enable row level security;
alter table profiles        enable row level security;
alter table institutions    enable row level security;

-- Cada usuario ve y modifica solo los eventos de su institución
create policy "stroke_events: acceso por institución"
  on stroke_events for all
  using (
    institution_id = (select institution_id from profiles where id = auth.uid())
    or institution_id is null  -- permite eventos sin institución (dev/onboarding)
  );

-- Cada usuario ve su propio perfil; admins ven todos los de su institución
create policy "profiles: ver propio"
  on profiles for select
  using (id = auth.uid());

create policy "profiles: editar propio"
  on profiles for update
  using (id = auth.uid());

-- Instituciones: solo lectura para usuarios autenticados
create policy "institutions: lectura autenticados"
  on institutions for select
  using (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Extensión para integración con fuentes externas (Google Sheets)
-- ------------------------------------------------------------
alter table stroke_events
  add column if not exists source text default 'app'
    check (source in ('app', 'sheets_import', 'manual')),
  add column if not exists external_id text unique;

-- Para bases ya provisionadas: el CHECK original solo permitía
-- ('app','sheets_import'). Lo recreamos para admitir 'manual' (carga
-- de ACV evolucionado / fuera de ventana desde fuera del código stroke).
alter table stroke_events drop constraint if exists stroke_events_source_check;
alter table stroke_events
  add constraint stroke_events_source_check
  check (source in ('app', 'sheets_import', 'manual'));

create index if not exists idx_stroke_events_source on stroke_events (source);

-- ============================================================
-- Ejemplos de queries analíticas
-- ============================================================
-- Door-to-needle promedio por mes:
--   select date_trunc('month', created_at), avg(door_to_needle_min)
--   from stroke_events
--   where thrombolysis_given = true
--   group by 1 order by 1;
--
-- Tasa de trombolisis:
--   select
--     count(*) filter (where thrombolysis_given) as con_trombolisis,
--     count(*) as total,
--     round(100.0 * count(*) filter (where thrombolysis_given) / count(*), 1) as porcentaje
--   from stroke_events
--   where form_status = 'completed';
