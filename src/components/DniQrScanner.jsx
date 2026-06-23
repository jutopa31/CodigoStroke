import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { AlertCircle, Camera, ImageUp, Loader2, X } from 'lucide-react'
import { parseDniQr } from '../lib/dniQr'
import { createDniScannerConstructorConfig } from '../lib/dniQrScannerConfig'

const CONTAINER_ID = 'dni-qr-reader'

function canvasToFile(canvas, name) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], name, { type: 'image/png' }))
    }, 'image/png')
  })
}

function rotateCanvas(source, degrees) {
  const radians = degrees * Math.PI / 180
  const swapDimensions = degrees % 180 !== 0
  const canvas = document.createElement('canvas')
  canvas.width = swapDimensions ? source.height : source.width
  canvas.height = swapDimensions ? source.width : source.height

  const context = canvas.getContext('2d')
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate(radians)
  context.drawImage(source, -source.width / 2, -source.height / 2)
  return canvas
}

async function createRotatedImageFiles(file) {
  const imageUrl = URL.createObjectURL(file)
  const image = new Image()

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
      image.src = imageUrl
    })

    const source = document.createElement('canvas')
    source.width = image.naturalWidth
    source.height = image.naturalHeight
    source.getContext('2d').drawImage(image, 0, 0)

    const files = []
    for (const degrees of [270, 90, 180]) {
      files.push(await canvasToFile(rotateCanvas(source, degrees), `dni-${degrees}.png`))
    }
    return files
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

async function scanFileWithRotations(scanner, file) {
  const candidates = [file, ...(await createRotatedImageFiles(file))]

  for (const candidate of candidates) {
    try {
      return await scanner.scanFileV2(candidate, false)
    } catch {
      // Try the next orientation.
    }
  }

  throw new Error('No se pudo detectar un QR o PDF417 en la foto.')
}

function clearScanner(scanner) {
  try {
    scanner?.clear()
  } catch {
    // The scanner can throw if html5-qrcode already cleaned its internal DOM.
  }
}

export default function DniQrScanner({ onScan, onClose }) {
  const [error, setError] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)
  const scannedRef = useRef(false)
  const onScanRef = useRef(onScan)
  const fileInputRef = useRef(null)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    const scanner = new Html5Qrcode(CONTAINER_ID, createDniScannerConstructorConfig())
    scannerRef.current = scanner

    return () => {
      clearScanner(scannerRef.current)
    }
  }, [])

  async function handleImageSelected(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || scannedRef.current) return

    setError(null)
    setIsScanning(true)

    try {
      const decoded = await scanFileWithRotations(scannerRef.current, file)
      const result = parseDniQr(decoded.decodedText)

      if (!result) {
        setError('El código se leyó, pero el formato del DNI no fue reconocido.')
        return
      }

      scannedRef.current = true
      onScanRef.current(result)
    } catch {
      setError('No pude leer el código. Sacá la foto con el frente completo del DNI, sin recortar y con buena luz.')
    } finally {
      setIsScanning(false)
      clearScanner(scannerRef.current)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="bg-stroke-navy rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stroke-line">
          <div className="flex items-center gap-2">
            <ImageUp size={16} className="text-stroke-iconActive" />
            <span className="font-semibold text-sm text-stroke-text">Leer DNI desde foto</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stroke-textMuted hover:text-stroke-textMuted transition-colors p-1 rounded-lg hover:bg-stroke-panel"
            aria-label="Cerrar escáner"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div id={CONTAINER_ID} className="hidden" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageSelected}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="w-full flex items-center justify-center gap-2 btn-primary active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition disabled:bg-stroke-panel disabled:text-stroke-textMuted disabled:cursor-wait"
          >
            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {isScanning ? 'Leyendo código...' : 'Sacar foto del DNI'}
          </button>

          {error ? (
            <div className="flex items-start gap-2 bg-status-critical/10 border border-status-critical/30 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-400 leading-snug">{error}</p>
            </div>
          ) : (
            <p className="text-xs text-stroke-textMuted text-center">
              Sacá una foto del <strong>frente completo</strong> del DNI
              <br />
              <span className="text-stroke-textMuted">Puede estar horizontal o vertical; intento rotarlo automáticamente</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
