import { describe, expect, it } from 'vitest'
import { parseDniQr } from './dniQr'

describe('parseDniQr', () => {
  it('parses the new DNI format with tramite first', () => {
    expect(parseDniQr('@0739476098@ALONSO@JULIAN MARTIN@M@37835412@C@13/09/1993@28/08/2025@23-9')).toEqual({
      name: 'Julian Martin Alonso',
      dni: '37835412',
    })
  })

  it('parses the decoded text from the provided DNI photo', () => {
    expect(parseDniQr('00739476098@ALONSO@JULIAN MARTIN@M@37835412@C@13/09/1993@28/08/2025@239')).toEqual({
      name: 'Julian Martin Alonso',
      dni: '37835412',
    })
  })

  it('parses compound surnames', () => {
    expect(parseDniQr('@0739476098@GARCIA LOPEZ@ANA MARIA@F@30123456@A@01/01/1990@01/01/2020@27-1')).toEqual({
      name: 'Ana Maria Garcia Lopez',
      dni: '30123456',
    })
  })

  it('normalizes DNI PDF417 special character encodings', () => {
    expect(parseDniQr('@0739476098@MUNXXOZ GUXXEMES@MARIA@F@30123456@A@01/01/1990@01/01/2020@27-1')).toEqual({
      name: 'Maria Muñoz Güemes',
      dni: '30123456',
    })
  })

  it('parses the old DNI format without tramite first', () => {
    expect(parseDniQr('@PEREZ@JUAN CARLOS@M@12345678@A@01/01/1980')).toEqual({
      name: 'Juan Carlos Perez',
      dni: '12345678',
    })
  })

  it('removes punctuation from DNI numbers', () => {
    expect(parseDniQr('@0739476098@ALONSO@JULIAN@M@37.835.412@C@13/09/1993@28/08/2025@23-9')).toEqual({
      name: 'Julian Alonso',
      dni: '37835412',
    })
  })

  it('rejects empty or unrelated values', () => {
    expect(parseDniQr('')).toBeNull()
    expect(parseDniQr('https://example.com')).toBeNull()
  })
})
