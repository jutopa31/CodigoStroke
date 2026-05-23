import { useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { X, ScanLine, AlertCircle, Camera, Loader2 } from 'lucide-react'

/**
 * Parsea el PDF417 / QR del DNI argentino.
 *
 * ─── FORMATO NUEVO (DNI desde 2009, la gran mayoría) ───────────────────────
 *   @TRAMITE@APELLIDOS@NOMBRES@SEXO@DNI@EJEMPLAR@FNAC@FEMISION@CUIL_PARCIAL
 *     [0] TRAMITE  [1] APELLIDOS  [2] NOMBRES  [3] SEXO  [4] DNI  [5] EJEMPLAR
 *     [6] FNAC (DD/MM/YYYY) ← futuro: exponer en el modelo de datos
 *
 * ─── FORMATO VIEJO (DNI anterior a 2009) ───────────────────────────────────
 *   [0] APELLIDOS  [1] NOMBRES  [2] SEXO  [3] DNI
 *
 * ─── Caracteres especiales (PDF417 solo soporta ASCII 127) ─────────────────
 *   Ñ → NXX  |  Ü → UXX
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

// ─── Decode helpers ──────────────────────────────────────────────────────────

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ]],
  [DecodeHintType.TRY_HARDER, true],
])

/** Dibuja un ImageBitmap en un canvas rotado y devuelve un blob URL. */
function bitmapToRotatedUrl(bitmap, angleDeg) {
  const rad  = (angleDeg * Math.PI) / 180
  const swap = angleDeg === 90 || angleDeg === 270
  const canvas = document.createElement('canvas')
  canvas.width  = swap ? bitmap.height : bitmap.width
  canvas.height = swap ? bitmap.width  : bitmap.height
  const ctx = canvas.getContext('2d')
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(rad)
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2)
  return new Promise((res) => canvas.toBlob((b) => res(URL.createObjectURL(b)), 'image/jpeg', 0.92))
}

/**
 * Intenta decodificar con ZXing en las 4 orientaciones posibles.
 * Necesario porque el celular puede guardar la foto con orientación EXIF
 * que ZXing no respeta, haciendo que el PDF417 aparezca "de costado".
 */
async function decodeWithZXing(bitmap) {
  const reader = new BrowserMultiFormatReader(HINTS)
  for (const angle of [0, 90, 270, 180]) {
    const url = await bitmapToRotatedUrl(bitmap, angle)
    try {
      const result = await reader.decodeFromImageUrl(url)
      URL.revokeObjectURL(url)
      return result.getText()
    } catch {
      URL.revokeObjectURL(url)
    }
  }
  return null
}

/**
 * Intenta decodificar con la BarcodeDetector API nativa de Chrome/Android.
 * Maneja EXIF automáticamente y es más confiable que ZXing en este entorno.
 */
async function decodeWithNativeAPI(bitmap) {
  if (!('BarcodeDetector' in window)) return null
  try {
    const detector = new window.BarcodeDetector({
      formats: ['pdf_417', 'qr_code', 'data_matrix', 'aztec'],
    })
    const results = await detector.detect(bitmap)
    return results[0]?.rawValue ?? null
  } catch {
    return null
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

export default function DniQrScanner({ onScan, onClose }) {
  const inputRef              = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    // createImageBitmap respeta la orientación EXIF del celular
    let bitmap
    try {
      bitmap = await createImageBitmap(file)
    } catch {
      setError('No se pudo leer la imagen. Intentá de nuevo.')
      setLoading(false)
      return
    }

    try {
      // 1. Intentar con la API nativa del browser (Chrome Android — más confiable)
      let text = await decodeWithNativeAPI(bitmap)

      // 2. Fallback: ZXing con 4 rotaciones (por si EXIF no se aplicó correctamente)
      if (!text) {
        text = await decodeWithZXing(bitmap)
      }

      if (!text) {
        setError(
          'No se encontró el código de barras.\n' +
          'Asegurate de fotografiar la barra negra del frente del DNI, bien enfocada.'
        )
        return
      }

      const parsed = parseDniQr(text)
      if (!parsed) {
        // DEBUG: mostrar raw para diagnosticar formato inesperado
        setError(`Código leído pero formato no reconocido:\n"${text.slice(0, 100)}"`)
        return
      }

      onScan(parsed)
    } finally {
      bitmap.close()
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

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
            <span className="font-semibold text-sm text-neutral-800">Escaneá el DNI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-lg hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-neutral-600 text-center uppercase tracking-wider">
              Cómo hacerlo
            </p>
            <ol className="text-xs text-neutral-500 space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                Apoyá el DNI sobre una superficie plana con buena luz
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                Tocá el botón y enfocá la <strong>barra negra del frente</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                Esperá que enfoque bien y sacá la foto
              </li>
            </ol>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Procesando…</>
              : <><Camera size={16} /> Fotografiar código del DNI</>
            }
          </button>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 leading-snug whitespace-pre-line break-all">{error}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
