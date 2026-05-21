import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Mail, X, Send } from 'lucide-react'

const STORAGE_KEY = 'stroke_contact_recipients'

function getStoredRecipients() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '""')
  } catch {
    return ''
  }
}

export default function ContactFAB({ getSummary, patient }) {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState(() => getStoredRecipients())
  const [body, setBody] = useState('')

  if (!patient) return null

  function handleOpen() {
    setBody(getSummary())
    setOpen(true)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleToChange(e) {
    const value = e.target.value
    setTo(value)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  }

  function handleSend() {
    const subject = encodeURIComponent(
      `Interconsulta Código Stroke — ${patient.name || patient.passphrase || 'Paciente'}`
    )
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${encodeURIComponent(body)}`
  }

  const subjectPreview = `Interconsulta Código Stroke — ${patient.name || patient.passphrase || 'Paciente'}`

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-[calc(6.25rem+env(safe-area-inset-bottom,0px))] left-3 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white shadow-elevated transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:left-6"
        title="Interconsulta"
        aria-label="Enviar interconsulta por email"
      >
        <Mail size={20} />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-t-3xl bg-white shadow-modal animate-slide-up sm:rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-brand-600" />
                <h2 className="text-base font-semibold text-neutral-800">Interconsulta</h2>
              </div>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Para
                </label>
                <input
                  type="email"
                  multiple
                  value={to}
                  onChange={handleToChange}
                  placeholder="neurologia@hospital.com"
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm text-neutral-800 placeholder-neutral-300 focus:border-brand-400 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-neutral-400">
                  Se guarda automáticamente para la próxima consulta
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Asunto
                </label>
                <p className="truncate rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
                  {subjectPreview}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Mensaje
                </label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={9}
                  className="w-full resize-none rounded-xl border border-neutral-200 px-3 py-2 font-mono text-xs text-neutral-700 focus:border-brand-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-neutral-100 px-5 pb-6 pt-4">
              <button
                onClick={handleSend}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 active:scale-[0.98]"
              >
                <Send size={16} />
                Abrir en cliente de email
              </button>
              <p className="mt-2 text-center text-[11px] text-neutral-400">
                Abre tu app de email con el resumen pre-cargado
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
