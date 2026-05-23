import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, ScanLine, AlertCircle } from 'lucide-react'

const CONTAINER_ID = 'dni-qr-reader'

/**
 * Parsea el QR del DNI argentino.
 *
 * Formato: @APELLIDO@NOMBRE@SEXO@DNI@EJEMPLAR@NACIMIENTO@TRAMITE@VENCIMIENTO
 * Al hacer split('@') y filtrar vacíos queda:
 *   [0] APELLIDO  [1] NOMBRE  [2] SEXO  [3] DNI  [4] EJEMPLAR  [5] FNac  [6] TRAMITE  [7] VTO
 *
 * Nota (futuro): parts[5] contiene la fecha de nacimiento en formato dd/mm/yyyy.
 */
function parseDniQr(raw) {
  const parts = raw.split('@').filter(Boolean)
  if (parts.length < 4) return null

  const apellido = parts[0]?.trim()
  const nombre   = parts[1]?.trim()
  const dniNum   = parts[3]?.trim()

  if (!apellido || !nombre || !dniNum) return null

  const toTitle = (s) =>
    s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    name: `${toTitle(nombre)} ${toTitle(apellido)}`,
    dni:  dniNum.replace(/\D/g, ''),
  }
}

export default function DniQrScanner({ onScan, onClose }) {
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const scannedRef = useRef(false)    // evita callbacks dobles
  const onScanRef  = useRef(onScan)
  useEffect(() => { onScanRef.current = onScan }, [onScan])

  useEffect(() => {
    let scanner

    async function start() {
      scanner = new Html5Qrcode(CONTAINER_ID)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 12, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (scannedRef.current) return
            const result = parseDniQr(decodedText)
            if (!result) {
              setError('QR no reconocido. Escaneá el código del dorso del DNI.')
              return
            }
            scannedRef.current = true
            scanner.stop()
              .catch(() => {})
              .finally(() => onScanRef.current(result))
          },
          () => {} // frames sin QR — ignorar
        )
      } catch {
        setError('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
      }
    }

    start()

    return () => {
      scannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ScanLine size={16} className="text-brand-600" />
            <span className="font-semibold text-sm text-neutral-800">Escaneá el QR del DNI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
            aria-label="Cerrar escáner"
          >
            <X size={18} />
          </button>
        </div>

        {/* Camera area */}
        <div className="p-4 space-y-3">
          <div
            id={CONTAINER_ID}
            className="rounded-xl overflow-hidden bg-neutral-900"
            style={{ minHeight: 280 }}
          />

          {error ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 leading-snug">{error}</p>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center">
              Apuntá al código QR en el <strong>dorso</strong> del DNI
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
