import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Schema — run in Supabase SQL editor once:
//
// create table public.profiles (
//   id uuid references auth.users on delete cascade primary key,
//   display_name text,
//   role text check (role in ('clinico', 'admin')) default 'clinico',
//   active boolean default true,
//   created_at timestamptz default now()
// );
//
// create or replace function public.handle_new_user()
// returns trigger as $$
// begin
//   insert into public.profiles (id, display_name, role)
//   values (new.id, new.raw_user_meta_data->>'display_name', 'clinico');
//   return new;
// end;
// $$ language plpgsql security definer;
//
// create trigger on_auth_user_created
//   after insert on auth.users
//   for each row execute procedure public.handle_new_user();
//
// alter table public.profiles enable row level security;
//
// create policy "ver propio perfil" on profiles
//   for select using (auth.uid() = id);
//
// create policy "admin ve todos" on profiles
//   for select using (
//     exists (select 1 from profiles where id = auth.uid() and role = 'admin')
//   );
