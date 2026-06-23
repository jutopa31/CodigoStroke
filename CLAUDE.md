# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**Always use `pnpm` — never `npm`.** Using npm causes Vercel/CI build failures.

```bash
pnpm install              # Install dependencies
pnpm run dev              # Dev server → http://localhost:5173
pnpm run build            # Production build → dist/
pnpm run lint             # ESLint
pnpm run test:unit        # Vitest unit tests
pnpm run test:unit:watch  # Vitest watch mode
pnpm test                 # Playwright E2E tests
pnpm test -- --grep "pattern"  # Run filtered E2E tests
```

## Architecture Overview

**Código Stroke** is a mobile-first React SPA (no router) that guides emergency physicians through an acute ischemic stroke (ACV isquémico) treatment protocol following AHA/ASA 2026 guidelines.

**Stack:** React 19 + Vite 4 + Tailwind CSS 3 + vite-plugin-pwa. Data persists in localStorage (Supabase stub ready in `src/lib/supabase.js`).

### Step-Based Clinical Flow

The entire app state lives in `App.jsx` — no Context or Zustand. A single `step` integer drives which step is active. `advanceTo(n)` uses `Math.max` to ensure steps only move forward.

```js
const STEP = {
  START: 0,
  PATIENT: 1,
  ALERT: 2,          // sends EmailJS alert + saves event
  TIME: 3,
  VITALS: 4,
  NIHSS_SYMPTOMS: 5,
  CT_RESULT: 6,
  CONTRAINDICATIONS: 7,
  DOSAGE: 8,
  THROMBECTOMY: 9,
  DONE: 10,
}
```

**Clinical branching logic:**
- `CTResultStep`: if hemorrhage → jump to DONE (no thrombolysis)
- `ContraindicationsStep`: if any red (absolute) contraindication → skip DOSAGE, jump to THROMBECTOMY
- `ContraindicationsStep`: if orange (relative) contraindications only → warn but allow DOSAGE

### Step Component Pattern

Every step in `src/steps/` follows the same contract:
- Props: `onConfirm(data)`, `confirmed`, `<fieldData>`, `isCollapsed`
- Derives a local `canContinue` boolean for form validation
- Renders a collapsed summary when `confirmed && isCollapsed`
- Calls `onConfirm(data)` on submit

### Key Library Modules (`src/lib/`)

- **calculations.js** — Pure functions for dose math and time windows:
  - `calcTNK(kg)` → `{ total }` — `min(kg × 0.25, 25)` mg bolus
  - `calcRtPA(kg)` → `{ total, bolo, infusion }` — `min(kg × 0.9, 90)` mg
  - `getWindowStatus(minutes)` → `'iv' | 'ogv' | 'out'` (IV window = 270 min, OGV = 1440 min)

- **storage.js** — localStorage wrapper; all functions are try-catch safe and designed for a future Supabase swap. `generatePatientId(name, dni)` produces readable IDs like "GJ678".

- **emailService.js** — Wraps EmailJS; falls back to `console.info` if env vars are missing (useful in dev).

### Key Components (`src/components/`)

- **GlobalTimer** — Persistent countdown header (a `shrink-0` flex child, not `position: fixed`). Color phases escalate via `getTimerTone()` (`src/lib/timerTone.js`, single source of truth): amber (0–30 min) → orange (30–60 min) → red (>60 min).
- **NihssModal** — 15-item guided NIHSS calculator. Item definitions and severity thresholds live in `src/content/nihss.js`.
- **StepProgressProvider / StepProgressContext** — Drives sidebar step highlighting via `DISPLAY_TO_STEP` map.
- **EducationalMode / EducationalOverlay** — Toggleable clinical rationale panels; toggled via info icons on each step.

### Contraindications Data

Red and orange contraindication lists are arrays of `{ id, label, description }` defined directly in `src/steps/ContraindicationsStep.jsx`. To add one, append to `RED_CONTRAS` or `ORANGE_CONTRAS`.

## Testing

**Unit tests** (Vitest) cover pure functions only — `calculations.test.js`, `storage.test.js`, `nihss.test.js`. No mocking needed.

**E2E tests** (Playwright) in `tests/`:
- Clears localStorage before each test
- Starts dev server automatically (configured in `playwright.config.js`)
- `app-smoke.spec.js` — basic navigation
- `clinical-paths.spec.js` — full protocol paths (hemorrhage, contraindications, dosage)

## Design System

Custom Tailwind palette in `tailwind.config.js`:
- Brand blue: `#1D4ED8` (`brand-600`) — buttons, borders, active states. Full scale in `tailwind.config.js` (`brand-50` → `brand-800`, all blue). Header uses `stroke-navy: #132B58`.
- Mobile-first; pinch-zoom is **enabled** (WCAG 1.4.4 — low-vision users must be able to zoom). Do not re-add `user-scalable=no`/`maximum-scale=1.0`; PWAs do not require it. Notch handled via `viewport-fit=cover` + safe-area CSS env vars
- Touch targets ≥44px; safe-area CSS env vars used for notch devices

Custom animations: `slide-down`, `slide-up`, `fade-in`, `pulse-subtle`, `scale-in`.

## Environment Variables

```bash
# .env.local — all optional; missing vars fall back gracefully
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=pk_xxxxx
# VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY reserved for future use
```

## PWA

Built with `vite-plugin-pwa` + Workbox. Precaches all static assets on first load → fully offline after that. Manifest locks portrait orientation and uses `standalone` display. Icons in `public/`.

## gstack

Use the `/browse` skill from gstack for **all web browsing**. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills:
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/document-generate`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`

## Design System

Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Key points:
- Primary font: **DM Sans** (UI/headers) — replaces Inter
- Body font: **Source Sans 3** (clinical descriptions)
- Timer/numbers: **Geist Mono** (always tabular-nums)
- Default theme: light "mesa clínica" — warm-neutral (`#F5F5F5` bg, `#FFFFFF` cards, `#242424` text, `#737373` secondary, `#E5E5E5` lines). Dark navy `#0F1C38` is the alternate "ER glare mode" toggle.
- Primary action + active states: graphite `#242424` (light) — NOT blue. Blue (`#1D4ED8`) is links/informational only.
- Clinical color channels are the only saturated color: amber (CI relativa / elevated values), red `#EF4444` (CI absoluta / hard stop), violet (glucemia), green (completed/favorable — never a generic action color).
- The timer is the most important UI element — large, amber, always visible. Keeps its dark navy card even in light mode (deliberate island of urgency).
- The contextual bottom action bar mutates its label/action by `(phase, activeTab, completion)` — the signature interaction.

## Further Reading

- `FLUJO_DISCUSION.md` — in-depth proposals for step-blocking UX and relative contraindication flow
- `docs/ARCHITECTURE.md` — component structure detail
- `docs/NEXT_STEPS.md` — clinical and tech roadmap
- `docs/IMPLEMENTATION.md` — Vercel + EmailJS setup
