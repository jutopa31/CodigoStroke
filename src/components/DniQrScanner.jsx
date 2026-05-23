import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { X, ScanLine, AlertCircle, Loader2 } from 'lucide-react'

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
 * ─── Caracteres especiales en PDF417 modo texto (ASCII 127) ────────────────
 *   Ñ se codifica como "NXX"  →  normalizamos a Ñ
 *   Ü se codifica como "UXX"  →  normalizamos a Ü
 */
function parseDniQr(raw) {
  const parts = raw.split('@').filter((p) => p.trim() !== '')
  if (parts.length < 4) return null

  let apellido, nombre, dniNum

  const isNuevoFormato = /^\d{7,}$/.test(parts[0]?.trim())

  if (isNuevoFormato) {
    apellido = parts[1]?.trim()
    nombre   = parts[2]?.trim()
    dniNum   = parts[4]?.trim()
  } else {
    apellido = parts[0]?.trim()
    nombre   = parts[1]?.trim()
    dniNum   = parts[3]?.trim()
  }

  if (!apellido || !nombre || !dniNum) return null

  const fixSpecialChars = (s) =>
    s.replace(/NXX/gi, 'Ñ').replace(/UXX/gi, 'Ü')

  // split+map en vez de \b\w — \b solo reconoce ASCII y rompe con ñ/ü
  const toTitle = (s) =>
    fixSpecialChars(s)
      .toLowerCase()
      .split(' ')
      .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' ')

  const dniClean = dniNum.replace(/\D/g, '')
  if (dniClean.length < 7) return null

  return {
    name: `${toTitle(nombre)} ${toTitle(apellido)}`,
    dni:  dniClean,
  }
}

// Configuración ZXing: PDF417 + formatos alternativos, TRY_HARDER para imágenes difíciles
const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ]],
  [DecodeHintType.TRY_HARDER, true],
])

const VIDEO_CONSTRAINTS = {
  video: {
    facingMode: { ideal: 'environment' },
    width:  { ideal: 1920 },
    height: { ideal: 1080 },
  },
}

export default function DniQrScanner({ onScan, onClose }) {
  const videoRef  = useRef(null)
  const doneRef   = useRef(false)
  const onScanRef = useRef(onScan)
  const [error,   setError]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { onScanRef.current = onScan }, [onScan])

  useEffect(() => {
    const reader = new BrowserMultiFormatReader(HINTS)
    let controls = null

    reader
      .decodeFromConstraints(VIDEO_CONSTRAINTS, videoRef.current, (result, err, ctrl) => {
        controls = ctrl
        setLoading(false)

        if (!result) return   // frame sin código — ignorar

        if (doneRef.current) return
        const text = result.getText()
        const parsed = parseDniQr(text)

        if (!parsed) {
          // DEBUG: muestra raw para diagnosticar formato inesperado
          setError(`Formato no reconocido: "${text.slice(0, 80)}"`)
          return
        }

        doneRef.current = true
        ctrl?.stop()
        onScanRef.current(parsed)
      })
      .catch(() => {
        setLoading(false)
        setError('No se pudo acceder a la cámara. Verificá los permisos del navegador.')
      })

    return () => {
      doneRef.current = true
      controls?.stop()
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

        {/* Video */}
        <div className="p-4 space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-neutral-900" style={{ minHeight: 300 }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 size={28} className="text-white/60 animate-spin" />
              </div>
            )}
          </div>

          {error ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 leading-snug break-all">{error}</p>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 text-center">
              Apuntá la <strong>barra del costado</strong> del DNI a la cámara
              <br />
              <span className="text-neutral-300">Mantené el DNI a ~20 cm de distancia</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
