import { useState } from 'react'
import { X, LogOut, CheckCircle, Loader2, ChevronLeft } from 'lucide-react'
import { useAuth } from './useAuth'

function getInitials(user) {
  const name = user?.user_metadata?.display_name || user?.email || '?'
  return name.split(/[\s@]/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')
}

const inputClass =
  'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-neutral-800 text-sm focus:ring-2 focus:ring-brand-200 focus:border-brand-300 placeholder-neutral-300 transition-all outline-none'

const Overlay = ({ onClose, children }) => (
  <div
    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
    onClick={onClose}
  >
    <div
      className="bg-white w-full max-w-sm rounded-2xl shadow-modal overflow-hidden animate-scale-in"
      onClick={e => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
)

const ModalHeader = ({ title, onClose }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
    <p className="font-semibold text-neutral-800">{title}</p>
    <button
      onClick={onClose}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"
    >
      <X size={16} />
    </button>
  </div>
)

const ModeToggle = ({ mode, onChange }) => (
  <div className="px-5 pt-4">
    <div className="flex rounded-xl bg-neutral-100 p-1">
      {['clinico', 'admin'].map(m => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === m
              ? 'bg-white text-neutral-800 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {m === 'clinico' ? 'Clínico' : 'Administrador'}
        </button>
      ))}
    </div>
  </div>
)

export default function LoginModal({ onClose }) {
  const { user, role, signIn, signUp, sendMagicLink, signOut } = useAuth()
  const [mode, setMode] = useState('clinico')
  const [view, setView] = useState('login')
  const [fields, setFields] = useState({ email: '', password: '', confirm: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return e => {
      setFields(f => ({ ...f, [key]: e.target.value }))
      setError(null)
    }
  }

  function switchMode(m) {
    setMode(m)
    setView('login')
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'admin') {
        await sendMagicLink(fields.email)
        setView('sent')
      } else if (view === 'register') {
        if (fields.password !== fields.confirm) throw new Error('Las contraseñas no coinciden')
        await signUp(fields.email, fields.password, fields.name)
        setView('sent')
      } else {
        await signIn(fields.email, fields.password)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    onClose()
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (user) {
    const displayName = user.user_metadata?.display_name || user.email
    const roleLabel = role === 'admin' ? 'Administrador' : 'Clínico'
    return (
      <Overlay onClose={onClose}>
        <ModalHeader title="Tu cuenta" onClose={onClose} />
        <div className="px-5 py-6 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{getInitials(user)}</span>
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-800 text-sm">{displayName}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{roleLabel}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 text-sm font-medium hover:bg-neutral-50 active:scale-[0.98] transition-all"
          >
            <LogOut size={15} strokeWidth={2} />
            Cerrar sesión
          </button>
        </div>
      </Overlay>
    )
  }

  // ── Sent (magic link / registration confirmation) ──────────────────────────
  if (view === 'sent') {
    return (
      <Overlay onClose={onClose}>
        <div className="flex items-center justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pb-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle size={28} className="text-emerald-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-base">
              {mode === 'admin' ? 'Revisá tu email' : 'Confirmá tu email'}
            </p>
            <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed max-w-[240px]">
              {mode === 'admin'
                ? `Te enviamos un link de acceso a ${fields.email}`
                : `Te enviamos un link de confirmación a ${fields.email}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 active:scale-[0.98] transition-all"
          >
            Entendido
          </button>
        </div>
      </Overlay>
    )
  }

  // ── Register form ──────────────────────────────────────────────────────────
  if (view === 'register') {
    return (
      <Overlay onClose={onClose}>
        <ModalHeader title="Crear cuenta" onClose={onClose} />
        <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nombre completo"
            value={fields.name}
            onChange={set('name')}
            required
            autoFocus
            className={inputClass}
          />
          <input
            type="email"
            placeholder="Email"
            value={fields.email}
            onChange={set('email')}
            required
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={fields.password}
            onChange={set('password')}
            required
            minLength={6}
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={fields.confirm}
            onChange={set('confirm')}
            required
            className={inputClass}
          />
          {error && <p className="text-red-500 text-xs animate-fade-in">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Crear cuenta
          </button>
          <button
            type="button"
            onClick={() => { setView('login'); setError(null) }}
            className="flex items-center justify-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ChevronLeft size={14} />
            Volver al inicio de sesión
          </button>
        </form>
      </Overlay>
    )
  }

  // ── Login form ─────────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      <ModalHeader title="Iniciar sesión" onClose={onClose} />
      <ModeToggle mode={mode} onChange={switchMode} />
      <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
        {mode === 'admin' ? (
          <>
            <input
              type="email"
              placeholder="Email"
              value={fields.email}
              onChange={set('email')}
              required
              autoFocus
              className={inputClass}
            />
            <p className="text-xs text-neutral-400 -mt-1">
              Recibirás un link de acceso en tu email
            </p>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={fields.email}
              onChange={set('email')}
              required
              autoFocus
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={fields.password}
              onChange={set('password')}
              required
              className={inputClass}
            />
          </>
        )}

        {error && <p className="text-red-500 text-xs animate-fade-in">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold text-sm active:scale-[0.98] disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-1"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {mode === 'admin' ? 'Enviar link de acceso' : 'Ingresar'}
        </button>

        {mode === 'clinico' && (
          <button
            type="button"
            onClick={() => { setView('register'); setError(null) }}
            className="text-center text-sm text-neutral-400 hover:text-brand-600 transition-colors"
          >
            ¿No tenés cuenta?{' '}
            <span className="font-medium text-brand-600">Registrarte</span>
          </button>
        )}
      </form>
    </Overlay>
  )
}
