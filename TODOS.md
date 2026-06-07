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
