import { test, expect } from '@playwright/test'

// Smoke tests for the current tab-based architecture (phase: start | pre | post).
// These exercise the real UI entry points without driving the full clinical flow.
//
// The app renders both a mobile and a desktop layout in the DOM, so inputs are
// targeted by ":visible" to avoid strict-mode matches across the two copies.

const patient = { name: 'García, Juan', dni: '12345678' }

const dniInput  = (page) => page.locator('input[placeholder="12345678"]:visible')
const nameInput = (page) => page.locator('input[placeholder="Nombre y apellido"]:visible')

async function activateCode(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
  await dniInput(page).fill(patient.dni)
  await nameInput(page).fill(patient.name)
  await page.getByRole('button', { name: 'Activar Código Stroke' }).click()
  await page.getByRole('button', { name: 'Sí, activar' }).click()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
})

test.describe('CodigoStroke smoke checks', () => {
  test('landing page loads with the start CTA and no console errors', async ({ page }) => {
    const errors = []
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Iniciar Código Stroke' })).toBeVisible()
    expect(errors).toEqual([])
  })

  test('starting a code opens the patient identification form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
    await expect(dniInput(page)).toBeVisible()
    await expect(nameInput(page)).toBeVisible()
    // Activation stays disabled until both fields are filled.
    await expect(page.getByRole('button', { name: 'Activar Código Stroke' })).toBeDisabled()
  })

  test('activating a code asks for confirmation before notifying', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
    await dniInput(page).fill(patient.dni)
    await nameInput(page).fill(patient.name)
    await page.getByRole('button', { name: 'Activar Código Stroke' }).click()
    // Confirmation modal before the EmailJS alert fires.
    await expect(page.getByRole('button', { name: 'Sí, activar' })).toBeVisible()
    await page.getByRole('button', { name: 'Sí, activar' }).click()
    // Lands on the vitals section of the first protocol tab.
    await expect(page.locator('input[aria-label="Presión sistólica"]:visible')).toBeVisible()
  })

  test('the activation alert confirms with Enter', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
    await dniInput(page).fill(patient.dni)
    await nameInput(page).fill(patient.name)
    await page.getByRole('button', { name: 'Activar Código Stroke' }).click()
    await expect(page.getByRole('button', { name: 'Sí, activar' })).toBeVisible()
    // Enter confirms without touching the mouse (no keyboard reopens on mobile
    // because focus is on the dialog container, not a text field).
    await page.keyboard.press('Enter')
    await expect(page.locator('input[aria-label="Presión sistólica"]:visible')).toBeVisible()
  })

  test('reset asks for confirmation and can be cancelled', async ({ page }) => {
    await activateCode(page)

    // Reset uses a native confirm() dialog; dismissing it keeps the active protocol.
    let dialogMessage = ''
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message()
      await dialog.dismiss()
    })
    await page.getByRole('button', { name: 'Reiniciar protocolo' }).click()

    await expect.poll(() => dialogMessage).toBe('¿Reiniciar el protocolo? Se perderán todos los datos del caso actual.')
    await expect(page.getByRole('button', { name: 'Reiniciar protocolo' })).toBeVisible()
  })
})
