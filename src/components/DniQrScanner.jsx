import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { X, ScanLine, AlertCircle } from 'lucide-react'

const CONTAINER_ID = 'dni-qr-reader'

/**
 * Parsea el PDF417 / QR del DNI argentino.
 *
 * ─── FORMATO NUEVO (DNI desde 2009, la gran mayoría) ───────────────────────
 *   @TRAMITE@APELLIDOS@NOMBRES@SEXO@DNI@EJEMPLAR@FNAC@FEMISION@CUIL_PARCIAL
 *   Tras split('@').filter(Boolean):
 *     [0] TRAMITE (numérico, 10-11 dígitos)
 *     [1] APELLIDOS
 *     [2] NOMBRES
 *     [3] SEXO (M/F)
 *     [4] DNI
 *     [5] EJEMPLAR (A/B/C)
 *     [6] FECHA NACIMIENTO (DD/MM/YYYY)  ← futuro: exponer en el modelo
 *     [7] FECHA EMISION (DD/MM/YYYY)
 *     [8] CUIL parcial
 *
 * ─── FORMATO VIEJO (DNI anterior a 2009, poco frecuente) ───────────────────
 *   Sin TRAMITE al inicio, más campos (16-17):
 *     [0] APELLIDOS  [1] NOMBRES  [2] SEXO  [3] DNI  …
 *
 * ─── Detección de formato ──────────────────────────────────────────────────
 *   Si parts[0] es todo dígitos (≥7) → formato nuevo (tramite primero).
 *
 * ─── Caracteres especiales en PDF417 modo texto (ASCII 127) ────────────────
 *   Ñ se codifica como "NXX"  →  normalizamos a Ñ
 *   Ü se codifica como "UXX"  →  normalizamos a Ü
 *   Acentos (á é í ó ú) a veces se omiten; los dejamos como vienen.
 */
function parseDniQr(raw) {
  const parts = raw.split('@').filter((p) => p.trim() !== '')
  if (parts.length < 4) return null

  let apellido, nombre, dniNum

  // Si el primer campo es solo dígitos → formato nuevo (tramite primero)
  const isNuevoFormato = /^\d{7,}$/.test(parts[0]?.trim())

  if (isNuevoFormato) {
    apellido = parts[1]?.trim()
    nombre   = parts[2]?.trim()
    dniNum   = parts[4]?.trim()
  } else {
    // Formato viejo: apellido primero, DNI en índice 3
    apellido = parts[0]?.trim()
    nombre   = parts[1]?.trim()
    dniNum   = parts[3]?.trim()
  }

  if (!apellido || !nombre || !dniNum) return null

  // Reemplaza NXX → Ñ y UXX → Ü (limitación de PDF417 con ASCII extendido)
  const fixSpecialChars = (s) =>
    s.replace(/NXX/gi, 'Ñ').replace(/UXX/gi, 'Ü')

  const toTitle = (s) =>
    fixSpecialChars(s)
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())

  const dniClean = dniNum.replace(/\D/g, '')
  if (dniClean.length < 7) return null   // sanity check

  return {
    name: `${toTitle(nombre)} ${toTitle(apellido)}`,
    dni:  dniClean,
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
          {
            fps: 12,
            qrbox: { width: 280, height: 180 },   // más ancho para PDF417
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.PDF_417,
              Html5QrcodeSupportedFormats.DATA_MATRIX,
              Html5QrcodeSupportedFormats.AZTEC,
            ],
          },
          (decodedText) => {
            if (scannedRef.current) return
            const result = parseDniQr(decodedText)
            if (!result) {
              setError('Código no reconocido como DNI. Escaneá el PDF417 o QR del frente.')
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
            <span className="font-semibold text-sm text-neutral-800">Escaneá el código del DNI</span>
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
              Apuntá al <strong>QR o al código de barras</strong> del frente del DNI
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
