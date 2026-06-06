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

async function progressToSymptoms(page) {
  await startCase(page)
  // Select a symptom and proceed through anticoag modal to vitals
  await page.getByRole('button', { name: 'Debilidad unilateral' }).click()
  await page.getByRole('button', { name: 'No', exact: true }).click()
  await page.getByRole('button', { name: /^Continuar$/ }).click()
}

async function progressToCT(page) {
  await progressToSymptoms(page)
  // Vitals step — fill BP and glucose
  await page.getByPlaceholder('Sistólica').fill('140')
  await page.getByPlaceholder('Diastólica').fill('80')
  await page.getByPlaceholder('mg/dL').fill('100')
  await page.getByRole('button', { name: /Confirmar signos vitales/i }).click()
  // CT step
  await expect(page.getByRole('heading', { name: 'TAC de encéfalo' })).toBeVisible()
}

test.describe('Clinical pathway — hemorrhage detected', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  })

  test('CT with bleeding ends the thrombolysis pathway and shows hemorrhage warning', async ({ page }) => {
    await progressToCT(page)

    // Request CT scan
    await page.getByRole('button', { name: 'TAC solicitada' }).click()
    // Select "bleeding present"
    await page.getByRole('button', { name: 'Sí sangre' }).click()

    // Should display the absolute contraindication message
    await expect(page.getByText('Hemorragia intracraneal presente')).toBeVisible()
    await expect(page.getByText(/Contraindicacion absoluta para trombolisis IV/i)).toBeVisible()
  })

  test('CT without bleeding advances toward contraindications', async ({ page }) => {
    await progressToCT(page)

    await page.getByRole('button', { name: 'TAC solicitada' }).click()
    await page.getByRole('button', { name: 'No sangre' }).click()

    await expect(page.getByText(/TAC sin hemorragia/i)).toBeVisible()
  })
})

test.describe('Clinical pathway — absolute contraindication', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  })

  test('selecting an absolute (red) contraindication blocks dosage step', async ({ page }) => {
    await progressToCT(page)

    // Clear CT (no bleeding)
    await page.getByRole('button', { name: 'TAC solicitada' }).click()
    await page.getByRole('button', { name: 'No sangre' }).click()

    // Navigate to contraindications step via the tab/button
    await page.getByRole('button', { name: /Contraindicaciones/i }).click()
    await expect(page.getByText(/Contraindicaciones absolutas/i)).toBeVisible()

    // Mark a red contraindication as present (HIC previa)
    const hicRow = page.locator('text=HIC previa o actual').first()
    await expect(hicRow).toBeVisible()
    // Click the SÍ button in that row
    const contraRow = page.locator('[class*="rounded-xl"]').filter({ hasText: 'HIC previa o actual' }).first()
    await contraRow.getByRole('button', { name: 'SÍ' }).click()

    // Confirm that the absolute contraindication warning appears
    await expect(page.getByText(/contraindicación absoluta/i)).toBeVisible()
  })
})

test.describe('Clinical pathway — time window classification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  })

  test('onset within 4.5 hours shows "Ventana IV activa"', async ({ page }) => {
    await startCase(page)
    // Default time (now) is well within the IV window
    await expect(page.getByText('Ventana IV activa')).toBeVisible()
  })

  test('moving slider past 4.5h shows OGV evaluation status', async ({ page }) => {
    await startCase(page)
    // Push slider to 300 minutes (beyond 270 min IV window)
    const slider = page.getByRole('slider', { name: /Minutos desde ultima vez/i })
    await slider.fill('300')
    await expect(page.getByText('Evaluar OGV')).toBeVisible()
  })

  test('moving slider past 24h shows out-of-window status', async ({ page }) => {
    await startCase(page)
    const slider = page.getByRole('slider', { name: /Minutos desde ultima vez/i })
    await slider.fill('1441')
    await expect(page.getByText('Fuera de ventana')).toBeVisible()
  })
})

test.describe('NIHSS wizard — pre-loading fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear()
      window.sessionStorage.clear()
    })
  })

  test('tapping Consciencia chip does not pre-load NIHSS score', async ({ page }) => {
    await startCase(page)
    await page.getByRole('button', { name: 'Consciencia' }).click()
    // Banner total should be 0, not pre-loaded 3
    const nihssBanner = page.locator('[class*="rounded-xl"]').filter({ hasText: /NIHSS/ }).first()
    await expect(nihssBanner).not.toBeVisible()
    // The symptom is selected but no score banner appears (no symptoms have scores yet)
    // Verify no pre-loaded 3 appears in the NIHSS section
    await expect(page.getByText(/^3$/).first()).not.toBeVisible()
  })

  test('Guía wizard opens at item 1 with no pre-filled scores and saves', async ({ page }) => {
    await startCase(page)
    await page.getByRole('button', { name: 'Consciencia' }).click()
    await page.getByRole('button', { name: /Guía/ }).click()

    // Wizard modal is open — first item visible
    await expect(page.getByText('Escala NIHSS completa')).toBeVisible()
    await expect(page.getByText('Ítem 1 de 15')).toBeVisible()

    // Select an option on item 1 — wizard auto-advances
    await page.locator('button').filter({ hasText: /Alerta.*normal|Normal|0/ }).first().click()
    await expect(page.getByText('Ítem 2 de 15')).toBeVisible()

    // Skip through remaining items with Siguiente
    for (let i = 2; i < 15; i++) {
      await page.getByRole('button', { name: /Siguiente/ }).click()
    }

    // On last item, Guardar is visible
    await expect(page.getByText('Ítem 15 de 15')).toBeVisible()
    await page.getByRole('button', { name: /Guardar/ }).click()

    // Modal closed — wizard completed
    await expect(page.getByText('Escala NIHSS completa')).not.toBeVisible()
  })
})

test.describe('Clinical pathway — session persistence', () => {
  test('patient ID badge persists across a page reload', async ({ page }) => {
    await startCase(page)
    await expect(page.getByText(patient.id, { exact: true })).toBeVisible()

    // Reload the page — the session should be restored from localStorage
    await page.reload()
    await expect(page.getByText(patient.id, { exact: true })).toBeVisible()
  })
})
