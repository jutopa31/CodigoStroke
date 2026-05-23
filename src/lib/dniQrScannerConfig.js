import { Html5QrcodeSupportedFormats } from 'html5-qrcode'

const MIN_QRBOX_SIZE = 50

export const DNI_QR_FORMATS = [
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.PDF_417,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.AZTEC,
]

export function createDniScannerConstructorConfig() {
  return {
    formatsToSupport: DNI_QR_FORMATS,
  }
}

export function createDniScannerStartConfig() {
  return {
    fps: 8,
    qrbox: (width, height) => ({
      width: Math.max(MIN_QRBOX_SIZE, Math.floor(width * 0.88)),
      height: Math.max(MIN_QRBOX_SIZE, Math.floor(height * 0.52)),
    }),
    videoConstraints: {
      facingMode: { ideal: 'environment' },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      advanced: [{ focusMode: 'continuous' }],
    },
  }
}
