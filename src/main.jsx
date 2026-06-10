import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthContext'

// Apply saved theme before React renders to prevent flash (try/catch: Safari private mode throws on localStorage)
try {
  document.documentElement.dataset.theme = localStorage.getItem('codigostroke_theme') ?? 'dark'
} catch {
  document.documentElement.dataset.theme = 'dark'
}

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
