import { test, expect } from '@playwright/test'

const patient = {
  name: 'García, Juan',
  dni: '12345678',
  id: 'GJ678',
}

async function startCase(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
  await page.getByPlaceholder('Número de documento').fill(patient.dni)
  await page.getByPlaceholder('Apellido, Nombre').fill(patient.name)
  await page.getByRole('button', { name: 'Confirmar datos' }).click()
  await page.getByRole('button', { name: 'Confirmar y Notificar' }).click()
}

test.describe('CodigoStroke smoke checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  })

  test('shows the anticoagulation question, ACOD warning, and continues to vitals', async ({ page }) => {
    await startCase(page)

    await page.getByRole('button', { name: 'Debilidad unilateral' }).click()
    await page.getByRole('button', { name: 'Sí', exact: true }).click()
    await page.getByRole('button', { name: 'Apixabán' }).click()

    await expect(page.getByText('¿El paciente recibe anticoagulación?')).toBeVisible()
    await expect(
      page.getByText('Los ACOD pueden contraindicar la trombólisis. Verificar última dosis y función renal.')
    ).toBeVisible()

    await page.getByRole('button', { name: /^Continuar$/ }).click()
    await expect(page.getByRole('heading', { name: 'Signos vitales' })).toBeVisible()
  })

  test('keeps the deterministic case id visible in desktop header/badge', async ({ page }) => {
    await startCase(page)

    await expect(page.getByText('ID del caso')).toBeVisible()
    await expect(page.getByText(patient.id, { exact: true })).toBeVisible()
    await expect(page.getByText(`DNI ${patient.dni}`, { exact: true })).toBeVisible()
  })

  test('asks for confirmation before resetting the active protocol', async ({ page }) => {
    await startCase(page)

    let dialogMessage = ''
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss()
    })

    await page.getByRole('button', { name: 'Reiniciar protocolo' }).click()

    await expect.poll(() => dialogMessage).toBe('¿Reiniciar el protocolo? Se perderán todos los datos del caso actual.')
    await expect(page.getByRole('heading', { name: 'Síntomas presentes' })).toBeVisible()
  })
})
