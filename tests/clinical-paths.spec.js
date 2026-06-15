import { test, expect } from '@playwright/test'

const patient = { name: 'García, Juan', dni: '12345678' }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
})

// ── Helpers for the real tab-based flow ──────────────────────────────────────
//
// The app renders both a mobile and a desktop layout in the DOM, so inputs are
// targeted by ":visible" to avoid strict-mode matches across the two copies.

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

// Jump to a protocol step via the numbered StepStepper (aria-label "Paso N: …").
function step(page, n) {
  return page.getByRole('button', { name: new RegExp(`^Paso ${n}:`) })
}

// Drive the 15-item inline NIHSS wizard: pick the "1" option on each item
// (→ total = 15, comfortably ≥ 5). Selecting an option auto-advances to the next
// item, so no "Siguiente" tap is needed; answering the last item auto-registers
// the score (no Guardar/Confirmar tap). The flow then waits on screen showing the
// registered score until the user taps "Continuar a Imagen".
async function completeNihss(page) {
  const ITEMS = 15
  for (let k = 1; k <= ITEMS; k++) {
    await page.getByRole('button', { name: /^1$/ }).first().click()
    if (k < ITEMS) {
      // Wait for the auto-advance to render the next item before selecting again.
      await expect(page.getByText(`Ítem ${k + 1}/${ITEMS}`)).toBeVisible()
    }
  }
  // Score registers automatically and stays on screen; advance is user-paced.
  await expect(page.getByText(/NIHSS registrado/).first()).toBeVisible()
  await page.getByRole('button', { name: /Continuar a Imagen/ }).click()
  await expect(page.getByRole('button', { name: 'TAC solicitada' })).toBeVisible()
}

// Walk the full pre-phase flow up to (but not clicking) the decision CTA.
// `bleeding` selects the CT result branch.
async function fillProtocol(page, { bleeding = false } = {}) {
  await activateCode(page)

  // Step 1 — vitals (inputs are labelled via aria-label; placeholder is "—").
  // The basal mRS is also required before the confirm button enables.
  await page.locator('input[aria-label="Presión sistólica"]:visible').fill('140')
  await page.locator('input[aria-label="Presión diastólica"]:visible').fill('80')
  await page.locator('input[aria-label="Glucemia"]:visible').fill('100')
  await page.getByRole('button', { name: 'mRS 0: Sin síntomas' }).first().click()
  // Visible confirm button reads "Registrar" (desktop col) or "Registrar signos vitales" (mobile).
  await page.getByRole('button', { name: /^Registrar( signos vitales)?$/ }).click()

  // Step 2 — time window (defaults: now, slider at 0 → inside IV window)
  await step(page, 2).click()
  await page.getByRole('button', { name: 'Registrar tiempo' }).click()

  // Step 3 — NIHSS
  await step(page, 3).click()
  await completeNihss(page)

  // Step 4 — imaging (auto-advances to CI after the CT result)
  await step(page, 4).click()
  await page.getByRole('button', { name: 'TAC solicitada' }).click()
  await page.getByRole('button', { name: 'TAC realizada' }).click()
  await page.getByRole('button', { name: bleeding ? 'Sí sangre' : 'No sangre' }).click()

  // Step 5 — contraindications: mark all NO on both sub-tabs
  await step(page, 5).click()
  await page.getByRole('button', { name: /marcar las 10 como NO/ }).click()
  await page.getByRole('button', { name: 'CI Relativas' }).click()
  await page.getByRole('button', { name: /marcar las 18 como NO/ }).click()
}

// ── Full real-UI happy path ──────────────────────────────────────────────────

test.describe('Clinical pathway — full flow (real UI)', () => {
  // These drive the entire protocol (incl. the 15-item NIHSS wizard); allow extra
  // time on slower hardware (e.g. Raspberry Pi) where parallel runs contend for CPU.
  test.slow()

  test('clean eligible patient reaches a thrombolysis-indicated decision', async ({ page }) => {
    await fillProtocol(page, { bleeding: false })

    const cta = page.getByRole('button', { name: 'Calcular decisión de trombolisis' })
    await expect(cta).toBeVisible()
    await cta.click()

    await expect(page.getByText('Trombolisis indicada', { exact: false })).toBeVisible()
    await expect(page.getByText(/TNK \(Tenecteplase\)/)).toBeVisible()
  })

  test('hemorrhage on CT blocks thrombolysis', async ({ page }) => {
    await fillProtocol(page, { bleeding: true })

    const cta = page.getByRole('button', { name: 'Calcular decisión de trombolisis' })
    await expect(cta).toBeVisible()
    await cta.click()

    await expect(page.getByText('Hemorragia intracraneal', { exact: false })).toBeVisible()
    await expect(page.getByText(/Derivar a Neurocirugía/)).toBeVisible()
  })

  test('NIHSS in-progress answers survive switching tabs', async ({ page }) => {
    await activateCode(page)
    await step(page, 3).click() // NIHSS

    // Answer the first 3 items (each selection auto-advances to the next).
    for (let k = 1; k <= 3; k++) {
      await page.getByRole('button', { name: /^1$/ }).first().click()
      await expect(page.getByText(`Ítem ${k + 1}/15`)).toBeVisible()
    }

    // Leave the NIHSS tab and come back.
    await step(page, 2).click() // Tiempo
    await expect(page.getByRole('button', { name: 'Registrar tiempo' })).toBeVisible()
    await step(page, 3).click() // back to NIHSS

    // Progress is preserved: still on item 4 with 3 points, not reset to item 1.
    await expect(page.getByText('Ítem 4/15')).toBeVisible()
    await expect(page.getByText('3 pts')).toBeVisible()
  })
})

// ── Decision-screen branches (deterministic via the mock seed) ───────────────
//
// `?mock=evaluacion` seeds a complete case and jumps straight to the decision
// screen. The scenario is `Math.floor(Math.random() * 5)`, so stubbing
// Math.random to a constant makes each clinical branch deterministic:
//   0.1→0 clean · 0.3→1 hemorrhage · 0.5→2 absolute CI · 0.7→3 wake-up mismatch · 0.9→4 wake-up no-mismatch

async function seedScenario(page, randomValue) {
  await page.addInitScript((v) => { Math.random = () => v }, randomValue)
  await page.goto('/?mock=evaluacion')
}

test.describe('Decision screen — clinical branches', () => {
  test('clean case → TNK recommended', async ({ page }) => {
    await seedScenario(page, 0.1)
    await expect(page.getByText('Trombolisis indicada', { exact: false })).toBeVisible()
    await expect(page.getByText(/TNK \(Tenecteplase\)/)).toBeVisible()
  })

  test('hemorrhage scenario → contraindicated', async ({ page }) => {
    await seedScenario(page, 0.3)
    await expect(page.getByText('Hemorragia intracraneal', { exact: false })).toBeVisible()
  })

  test('absolute contraindication shows a human-readable reason, not a raw key', async ({ page }) => {
    await seedScenario(page, 0.5)
    await expect(page.getByText('Contraindicación absoluta', { exact: false }).first()).toBeVisible()
    // Regression guard for the stale-label bug: the reason must read the label,
    // never the raw id "ct_hemorrhage". (Shown in both the body and a chip.)
    await expect(page.getByText('TC: hemorragia intracraneal', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('ct_hemorrhage')).toHaveCount(0)
  })

  test('wake-up stroke with FLAIR-DWI mismatch → rtPA', async ({ page }) => {
    await seedScenario(page, 0.7)
    await expect(page.getByText('Trombolisis indicada', { exact: false })).toBeVisible()
    await expect(page.getByText(/rtPA \(Alteplase\)/)).toBeVisible()
  })

  test('wake-up stroke without mismatch → not eligible for IV', async ({ page }) => {
    await seedScenario(page, 0.9)
    await expect(page.getByText('sin mismatch', { exact: false })).toBeVisible()
  })
})

// ── Treatment step — AngioTAC optional + warning popup ───────────────────────

test.describe('Treatment step — AngioTAC request', () => {
  test.slow() // reaches the treatment step through the full real flow

  // The mock seed pre-confirms the thrombectomy step, so drive the real flow to
  // land on an unconfirmed treatment step (angio not yet requested).
  async function gotoThrombectomy(page) {
    await fillProtocol(page, { bleeding: false })
    await page.getByRole('button', { name: 'Calcular decisión de trombolisis' }).click()
    await expect(page.getByText('Trombolisis indicada', { exact: false })).toBeVisible()
    await page.getByRole('button', { name: /^Paso 7:/ }).click()      // Tratamiento
    await page.getByRole('button', { name: 'Trombectomía' }).click()   // sub-tab
  }

  test('offers a single request button (no explicit "No")', async ({ page }) => {
    await gotoThrombectomy(page)
    await expect(page.getByRole('button', { name: /^Solicitar Angio/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'No', exact: true })).toHaveCount(0)
  })

  test('finalizing without requesting AngioTAC warns via popup but allows advancing', async ({ page }) => {
    await gotoThrombectomy(page)
    await page.getByRole('button', { name: /Finalizar protocolo/ }).click()
    // Popup warns instead of silently finishing...
    await expect(page.getByText(/No se solicitó Angio/)).toBeVisible()
    // ...but lets the user finish anyway: finalizing lands on the summary tab.
    await page.getByRole('button', { name: 'Finalizar igual' }).click()
    await expect(page.getByText('Tiempos clave')).toBeVisible()
  })
})
