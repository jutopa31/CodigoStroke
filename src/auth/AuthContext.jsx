import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AuthContext from './AuthContextValue'

async function fetchRole(userId) {
  if (!supabase) return 'clinico'
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role ?? 'clinico'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setRole(await fetchRole(u.id))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setRole(await fetchRole(u.id))
      else setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    if (!supabase) throw new Error('Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, displayName) {
    if (!supabase) throw new Error('Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
  }

  async function sendMagicLink(email) {
    if (!supabase) throw new Error('Configurá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) throw error
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, sendMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
