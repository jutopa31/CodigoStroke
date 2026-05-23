import { describe, expect, it } from 'vitest'
import { Html5QrcodeSupportedFormats } from 'html5-qrcode'
import {
  createDniScannerConstructorConfig,
  createDniScannerStartConfig,
  DNI_QR_FORMATS,
} from './dniQrScannerConfig'

describe('DNI QR scanner configuration', () => {
  it('enables PDF417 in the Html5Qrcode constructor config', () => {
    expect(createDniScannerConstructorConfig()).toEqual({
      formatsToSupport: DNI_QR_FORMATS,
    })
    expect(DNI_QR_FORMATS).toContain(Html5QrcodeSupportedFormats.PDF_417)
  })

  it('keeps camera-only options in start config', () => {
    const startConfig = createDniScannerStartConfig()

    expect(startConfig).not.toHaveProperty('formatsToSupport')
    expect(startConfig.videoConstraints.facingMode).toEqual({ ideal: 'environment' })
    expect(startConfig.qrbox(1000, 800)).toEqual({ width: 880, height: 416 })
  })

  it('never returns a qrbox below the html5-qrcode minimum size', () => {
    const startConfig = createDniScannerStartConfig()

    expect(startConfig.qrbox(0, 0)).toEqual({ width: 50, height: 50 })
    expect(startConfig.qrbox(40, 40)).toEqual({ width: 50, height: 50 })
  })
})
