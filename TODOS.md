# TODOS

Items deferred during engineering review. Each has context enough to pick up cold.

---

## T-1: Wizard "Next without selecting" allows implicit zero

**What:** Block the Next button (or at minimum Guardar) when the current wizard item has no explicit selection.

**Why:** A physician under pressure can tap Next on every NIHSS item without selecting anything, resulting in NIHSS=0. In a life-critical context, NIHSS=0 means "fully normal" — a dangerously incorrect read if the physician simply rushed through the wizard.

**Pros:** Eliminates silent-zero contamination from incomplete wizard sessions; clear, auditable evidence that every item was consciously evaluated.

**Cons:** Extra friction in emergency workflow; a hard block on Next may frustrate physicians who want to come back to an item later. Back navigation already exists but may not be obvious under stress.

**Context:** The pre-loading bug fix (PR on branch a11y/font-size-accessibility) removes implicit defaults from symptom shortcuts. This TODO is the complementary guard on the wizard side. The wizard forces each item to be *seen* (sequential), but not necessarily *touched*. Verified: this gap was not present in the original NihssModal (which returns total only — can't verify subcores), but is introduced by the new guided mode. Start in `src/components/NihssFullEditor.jsx` (guided mode Next button handler).

**Depends on:** The guided wizard implementation (T1 in the eng review tasks) must ship first.

---

## T-2: Reopen after save wipes prior NIHSS

**What:** When a physician has already completed and saved the NIHSS wizard, tapping "Guía" again starts the wizard from zero — discarding the prior saved scores.

**Why:** Current plan always passes `scores={{}} guided={true}`. There's no "edit mode" for the guided wizard. The `Ajustar` button (non-guided scroll mode) provides partial coverage, but a physician who instinctively taps "Guía" again loses their completed NIHSS silently.

**Pros:** An edit mode prevents accidental data loss; consistent with clinical workflow where the physician may need to correct a single item after completing the scale.

**Cons:** More complex state management in ClinicalTab (need to distinguish "first open" vs "reopen after save"); `useFullScores` boolean already tracks whether NIHSS was completed, so the fork condition is known.

**Context:** `ClinicalTab.jsx` has `handleGuidedSave(scores)` which sets `useFullScores=true`. The fix would pass `subscaleScores` (not `{}`) as `scores` prop when `useFullScores=true`, and the guided wizard would start from those saved scores instead of zero. The `Ajustar` button is a separate non-guided instance of NihssFullEditor that already handles this use case — confirm the intended behavior before implementing.

**Depends on:** Guided wizard implementation (T1).

---

## T-3: Banner shows 0 when symptoms selected but NIHSS not yet scored

**What:** After the pre-loading bug fix, tapping a symptom chip no longer pre-populates `subscaleScores`. The NIHSS banner will show 0 (or the old `flashPts` estimate) whenever symptoms are marked but the wizard hasn't been completed yet.

**Why:** A physician glancing at the banner after tapping "Consciencia" will see 0, which is misleading — it looks like the NIHSS was scored as normal when it hasn't been scored at all.

**Pros:** A "NIHSS pendiente" state makes the unscored condition explicit; prevents misread of 0 as "normal" by other team members looking at the banner.

**Cons:** Adds a third display state to the banner (unscored / estimated / confirmed); minor implementation complexity.

**Context:** The design doc proposed a `nihssConfirmed` boolean and a `~N pts (estimado)` banner for the intermediate state. This TODO tracks the "unscored" state, which is distinct from the "estimated" state. Current implementation: ClinicalTab.jsx around lines 272-298 (NIHSS banner section). `useFullScores` boolean can serve as the "confirmed" gate; absence of any `subscaleScores` + `useFullScores=false` is the "unscored" state.

**Depends on:** Pre-loading removal (T2 in eng review tasks). Does not block the core bug fix.

---

## T-D1: "Retomar otro caso" looks like a passive divider (design, POLISH)

**What:** On the start screen, the "Retomar otro caso" toggle is styled identically to a section divider (gray text between two `<hr>` lines), so its clickability is not obvious.

**Why:** Discoverability — a user who wants to resume a prior case may not realize the text is a button.

**Context:** `src/steps/StartStep.jsx:115-125`. Deferred from /design-review on `a11y/font-size-accessibility` (2026-06-07). Low risk; the divider-with-label pattern is recognizable, so left as-is.

## Design review 2026-06-14 — deferred findings (not in quick-win scope)

Quick wins F3/F4/F5/F6/F7 were fixed and committed this session. Remaining:

- **F1 (HIGH, hierarchy):** Start screen's big amber "04:29" reads as a running timer; it's the static IV window. Reframe ("Ventana IV: 4.5 h") or restyle so it doesn't impersonate the live countdown. `src/steps/StartStep.jsx`.
- ~~F2 (NIHSS)~~ — **Not a defect.** The guided "variante B" (descriptions + number entry) is the deliberate design, already addressed in the merged PR `fix(nihss): setState-in-render + design polish on NIHSS editor` (#136/#137). Removed from scope.
- **F8 (MEDIUM, hierarchy):** "desde síntomas" timer competes with the hero "desde inicio" timer (two large amber/orange clocks). Differentiate weight/label so time-since-onset is unmistakable. `src/steps/TimeStep.jsx`.
- **Modal headers (MEDIUM):** Saturated periwinkle header bands are inconsistent across modals; `VitalsModal.jsx:89` puts low-contrast `text-stroke-iconActive` on the band. Unify to a neutral header (cf. `QuickAddFAB.jsx:49`). Files: `VitalsModal.jsx`, `AlertModal.jsx`, `RestoreCaseModal.jsx`, `ThrombectomyStep.jsx:352`.
- **F9 (POLISH):** Centered clinical body text hurts scanning. `DecisionTab.jsx:59-60`, `ImagingTab.jsx:165`.
- **F10 (POLISH):** Source Sans 3 is loaded/declared but unused (only DM Sans + Geist Mono render). Wire it into clinical body copy or remove from the system. `src/index.css:200`, `tailwind.config.js`.
- **F13 (POLISH, clinical copy):** TA "Elevada" badge fires for 150/90 while the shown threshold is ≤185/110 — possible user confusion. Clinical-copy review.
- **Stepper/sub-pill touch targets (MEDIUM):** Stepper circles are 32px (`StepStepper.jsx:99`), sub-step pills `py-1` (`:119`), thrombectomy steppers `w-8 h-8`. Below the 44px hit-area rule. (Header icons fixed in F7.)

## T-D2: ~2344 pre-existing ESLint errors across the branch (chore)

**What:** `pnpm run lint` fails with ~2344 errors in files unrelated to the a11y work (e.g. `SummaryTab.jsx` unused `Zap`, `TimeStep.jsx` unused `isCandidate`, plus a large bulk that looks like an ESLint config/rule mismatch).

**Why:** Lint failures hide real regressions and block any lint-gated CI.

**Context:** Surfaced (not caused) by /design-review on 2026-06-07. The 4 design fixes from that review lint clean.

## QA pass 2026-06-14 — diff-aware (branch design/quick-wins-20260614)

Tested all F1–F8 design changes end-to-end at 375px mobile. All verified working
(StartStep F1 static IV window, TimeStep F8 green "desde síntomas" timer,
NIHSS editor F1/F3/F4, neutral modal headers on Alert/Vitals/Restore, F6 patient
row no overlap, QuickAddFAB + VitalsModal register correctly). 95/95 unit tests pass.

- **ISSUE-001 (MEDIUM) — FIXED by /qa on 2026-06-14 (commit 6f3a204):** F7's 44px
  header icons crowded the timer-hero strip; the "PASO X/8" step pill overflowed
  ~28px and rendered behind the theme-toggle button at 375px. Fix: eyebrow truncates,
  strip gets `flex-1 min-w-0`, step pill stays fully visible. `src/components/GlobalTimer.jsx:47`.
  Tradeoff: the "Código Stroke" eyebrow truncates to "CÓDIGO …" on the narrowest
  phones. Alternative if undesired: drop the redundant eyebrow in the timer-hero
  (the giant clock + PASO pill already establish context) — design call, deferred.
- **ContactFAB is dead code (LOW / decision needed):** `src/components/ContactFAB.jsx`
  (floating "Enviar interconsulta por email") is defined but never imported or rendered
  anywhere in `src/`. F5 (commit d9cc515) restyled its inputs to dark theme — wasted
  effort, zero user-visible effect. It has never been wired up (not on main either,
  since the original "Add ContactFAB" commit d6941e5). Decision: wire it up (it's a
  useful interconsulta feature) or delete it. Same dead-component class as
  NihssStep/SymptomsStep.

  - **UPDATE 2026-06-14:** Wired up by /qa (commit d8025da). ContactFAB now mounts
    when a case is active; modal pre-fills `buildSummaryText()`. Decision was "wire it up".
    Regression test deferred: project convention is unit tests for pure functions only;
    a full-App render assertion is off-convention and an E2E exceeds the fix-loop budget.
    Suggest adding an E2E "interconsulta FAB visible after activation" in a later pass.

## T-HUB1: Candado central de auth en el dashboard (cuando haya datos reales)

**Qué:** Al pasar el hub de pacientes (`dashboard/`) de modo demo a datos reales,
agregar un `middleware.ts` único que controle permisos para todas las rutas
`/dashboard/*` y `/api/*`, en vez de que cada página/ruta se proteja sola.

**Por qué:** El patrón actual (cada superficie se gatea sola) ya falló una vez:
`dashboard/src/app/api/export/route.ts` quedó SIN control de auth mientras
`/api/sync` y el `layout.tsx` sí lo tenían. Es un CSV de todos los casos
(edad, sexo, fecha, NIHSS, evolución, mortalidad). Un candado central evita que
una ruta futura se olvide.

**Contexto:** Detectado en /plan-ceo-review 2026-06-15 (modo HOLD SCOPE,
demo-hardening). El agujero de `/api/export` se cerró copiándole el gate de admin
de `/api/sync` (commit 13e40da, rama `fix/dashboard-export-auth`); esta tarea es la
solución sistémica para la fase de datos reales. Relacionado con `supabase/PLAN.md`
(Prioridad 2 — Autenticación).

**Esfuerzo:** S (humano ~2-3h / CC ~20min). **Prioridad:** P1 al flipear a real.
**Depende de:** activar `NEXT_PUBLIC_USE_MOCK=false` + Supabase Auth.
