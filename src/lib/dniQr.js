export function parseDniQr(raw) {
  const parts = String(raw ?? '').split('@').filter((p) => p.trim() !== '')
  if (parts.length < 4) return null

  let apellido
  let nombre
  let dniNum
  const isNuevoFormato = /^\d{7,}$/.test(parts[0]?.trim())

  if (isNuevoFormato) {
    apellido = parts[1]?.trim()
    nombre = parts[2]?.trim()
    dniNum = parts[4]?.trim()
  } else {
    apellido = parts[0]?.trim()
    nombre = parts[1]?.trim()
    dniNum = parts[3]?.trim()
  }

  if (!apellido || !nombre || !dniNum) return null

  const fixSpecialChars = (value) =>
    value.replace(/NXX/gi, 'Ñ').replace(/UXX/gi, 'Ü')

  const toTitle = (value) =>
    fixSpecialChars(value)
      .toLowerCase()
      .split(' ')
      .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
      .join(' ')

  const dniClean = dniNum.replace(/\D/g, '')
  if (dniClean.length < 7) return null

  return {
    name: `${toTitle(nombre)} ${toTitle(apellido)}`,
    dni: dniClean,
  }
}
