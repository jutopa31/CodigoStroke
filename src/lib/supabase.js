// Supabase client — ready to activate when credentials are configured
// import { createClient } from '@supabase/supabase-js'
//
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
//
// export const supabase = createClient(supabaseUrl, supabaseAnonKey)
//
// Schema (run in Supabase SQL editor):
// CREATE TABLE stroke_events (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   patient_dni TEXT NOT NULL,
//   patient_name TEXT NOT NULL,
//   symptoms JSONB,
//   last_seen_normal TIMESTAMPTZ,
//   vitals JSONB,
//   nihss_score INTEGER,
//   checklist JSONB,
//   email_sent BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE stroke_events ENABLE ROW LEVEL SECURITY;

export const supabase = null // placeholder until activated
