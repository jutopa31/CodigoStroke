import { test, expect } from '@playwright/test'

// Flag A/B de navegación: stepper horizontal (default) vs scroll vertical (Dirección B).
// El modo scroll renderiza una card full-bleed por paso (secciones [data-step-key])
// con un riel de dots al borde y una píldora "N · Nombre" del paso activo.

const patient = { name: 'García, Juan', dni: '12345678' }

const dniInput = (page) => page.locator('input[placeholder="12345678"]:visible')
const nameInput = (page) => page.locator('input[placeholder="Nombre y apellido"]:visible')

async function activateCode(page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar Código Stroke' }).click()
  await dniInput(page).fill(patient.dni)
  await nameInput(page).fill(patient.name)
  await page.getByRole('button', { name: 'Activar Código Stroke' }).click()
  await page.getByRole('button', { name: 'Sí, activar' }).click()
}

// Playwright aísla el storage por test, así que no hace falta limpiar. Sólo
// sembramos el navMode cuando el test lo pide. No usamos clear() en initScript
// porque correría en cada reload y borraría lo que el toggle persiste.
function seedNavMode(page, mode) {
  if (!mode) return Promise.resolve()
  return page.addInitScript((m) => {
    window.localStorage.setItem('codigo_stroke_nav_mode', m)
  }, mode)
}

test.describe('navegación stepper (default)', () => {
  test.beforeEach(async ({ page }) => { await seedNavMode(page, null) })

  test('por defecto usa el stepper, sin secciones de scroll', async ({ page }) => {
    await activateCode(page)
    // No hay stream de scroll en modo stepper.
    await expect(page.locator('[data-step-key]')).toHaveCount(0)
    // El stepper numerado sí está (Paso 1 visible).
    await expect(page.getByRole('button', { name: /^Paso 1:/ }).first()).toBeVisible()
  })

  test('el toggle del header conmuta a scroll y persiste tras reload', async ({ page }) => {
    await activateCode(page)
    // Toggle (en modo stepper su aria-label dice "...: pasos").
    await page.getByRole('button', { name: 'Cambiar navegación: pasos' }).first().click()
    // Ahora hay secciones de scroll.
    await expect(page.locator('[data-step-key]').first()).toBeVisible()
    await page.reload()
    // Tras recargar aparece el prompt de restaurar el caso activo: lo retomamos.
    await page.getByRole('button', { name: 'Retomar caso' }).click()
    // Persistió: sigue en modo scroll tras recargar.
    await expect(page.locator('[data-step-key]').first()).toBeVisible()
  })
})

test.describe('navegación scroll vertical', () => {
  test.beforeEach(async ({ page }) => { await seedNavMode(page, 'scroll') })

  test('renderiza el stream de 5 secciones pre-fase y la píldora del paso activo', async ({ page }) => {
    await activateCode(page)
    await expect(page.locator('[data-step-key]')).toHaveCount(5)
    await expect(page.getByTestId('step-pill')).toContainText('Paciente')
  })

  test('tap en un dot del riel salta al paso y actualiza la píldora', async ({ page }) => {
    await activateCode(page)
    await page.getByRole('button', { name: 'Paso 2: Tiempo' }).first().click()
    await expect(page.getByTestId('step-pill')).toContainText('Tiempo')
    // El dot activo es el paso 2.
    await expect(page.locator('[aria-current="step"]')).toHaveAttribute('aria-label', 'Paso 2: Tiempo')
  })
})
