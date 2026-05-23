import { useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import { X, ScanLine, AlertCircle, Camera, Loader2, CheckCircle2 } from 'lucide-react'

/**
 * Parsea el PDF417 / QR del DNI argentino.
 *
 * ─── FORMATO NUEVO (DNI desde 2009, la gran mayoría) ───────────────────────
 *   @TRAMITE@APELLIDOS@NOMBRES@SEXO@DNI@EJEMPLAR@FNAC@FEMISION@CUIL_PARCIAL
 *     [0] TRAMITE  [1] APELLIDOS  [2] NOMBRES  [3] SEXO  [4] DNI  [5] EJEMPLAR
 *     [6] FNAC (DD/MM/YYYY) ← futuro: exponer en el modelo de datos
 *
 * ─── FORMATO VIEJO (DNI anterior a 2009, poco frecuente) ───────────────────
 *   Sin TRAMITE: [0] APELLIDOS  [1] NOMBRES  [2] SEXO  [3] DNI
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

const HINTS = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.PDF_417,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.AZTEC,
  ]],
  [DecodeHintType.TRY_HARDER, true],
])

/**
 * Estrategia: foto estática en vez de video continuo.
 *
 * El celular no puede enfocar bien a corta distancia en video continuo.
 * Al usar `<input capture="environment">` se abre la cámara nativa del
 * teléfono — que tiene mucho mejor autofocus — y el usuario puede tomarse
 * el tiempo para enfocar bien antes de confirmar la foto.
 * ZXing luego decodifica la imagen estática, que es mucho más confiable.
 */
export default function DniQrScanner({ onScan, onClose }) {
  const inputRef            = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    const url = URL.createObjectURL(file)
    try {
      const reader = new BrowserMultiFormatReader(HINTS)
      const result = await reader.decodeFromImageUrl(url)
      const parsed = parseDniQr(result.getText())

      if (!parsed) {
        // DEBUG: mostrar raw si el código se leyó pero el parser no lo reconoció
        setError(`Código leído pero formato no reconocido:\n"${result.getText().slice(0, 100)}"`)
        return
      }

      onScan(parsed)
    } catch {
      setError(
        'No se encontró el código de barras en la foto.\n' +
        'Intentá nuevamente: enfocá bien la barra del costado y tomá la foto a ~20 cm.'
      )
    } finally {
      URL.revokeObjectURL(url)
      setLoading(false)
      // Reset input para poder intentar de nuevo con otra foto
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

          {/* Ilustración / instrucción */}
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
                Tocá el botón y apuntá al <strong>código de barras del frente</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-brand-100 text-brand-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                Esperá que la cámara enfoque y sacá la foto
              </li>
            </ol>
          </div>

          {/* Botón principal */}
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

          {/* Error */}
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
