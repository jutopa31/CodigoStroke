# Design System — CodigoStroke

## Product Context
- **What this is:** Mobile-first web app guiding acute ischemic stroke (Código Stroke) protocol in the ER, step by step, with a live countdown timer.
- **Who it's for:** ER staff — doctors, nurses, residents — during code stroke events.
- **Space/industry:** Clinical emergency medicine. AHA/ASA 2026 protocol.
- **Project type:** PWA (Progressive Web App), mobile-first, offline-capable.
- **Memorable thing:** "Urgent but under control." The app communicates that time matters without inducing panic. Calm authority.

---

## Aesthetic Direction
- **Direction:** Clinical Command Center
- **Decoration level:** Minimal — the status token colors (amber, violet, red, green) are the only decoration. No gradients, no decorative blobs, no icon grids.
- **Mood:** An ICU monitor or flight instrument panel. Every element earns its place. Color means something specific. Used under fluorescent ER lighting with gloved hands — clarity is the aesthetic.
- **Reference:** NOT Epic, Doximity, or Medscape (white portal aesthetic). This is a crisis tool, not a hospital information system.

---

## Typography

Three fonts. Each with a specific clinical role.

- **Display/UI/Headers:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) — replaces Inter. Nearly as clean, distinctly not overused. Excellent at the bumped font sizes the app uses. Use for: step headers, navigation labels, button text, section titles.
- **Body/Clinical descriptions:** [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) — for longer clinical text: contraindication descriptions, step instructions, explanatory notes. Authoritative and legible.
- **Timer/Numbers/Scores:** [Geist Mono](https://fonts.google.com/specimen/Geist+Mono) — reserved for anything that must be read instantly under pressure. Timer display, NIHSS score, blood pressure, glucose values. Must use `font-variant-numeric: tabular-nums`.

**Loading:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Source+Sans+3:wght@300;400;500;600&family=Geist+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Font scale (keep existing bumped sizes):**
| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 14px | Labels, secondary metadata |
| `text-sm` | 16px | Body text, list items |
| `text-base` | 18px | Default body (important for gloved-hand legibility) |
| `text-lg` | 20px | Step sub-headers |
| `text-xl` | 24px | Step headers |
| `text-2xl` | 28px | Section titles |
| `text-3xl` | 32px | — |
| `text-4xl` | 40px | Timer display (Geist Mono) |

**Tailwind config:**
```js
fontFamily: {
  sans: ['DM Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  body: ['Source Sans 3', '-apple-system', 'sans-serif'],
  mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
},
```

---

## Color

**Approach:** Restrained — dark navy system with precisely-scoped status colors. The navy is the identity; accent blue is for actions only.

### Core palette (CSS custom properties)
```css
:root {
  --bg:           #0F1C38;  /* primary background — darker than navyDeep */
  --surface:      #132B58;  /* card/panel surfaces — stroke.navy */
  --panel:        #1E3356;  /* nested panels, inputs */
  --line:         #29416D;  /* borders, dividers — stroke.line */
  --accent:       #5C7AEA;  /* CTA, active states — stroke.iconActive */
  --accent-dim:   #3D57B8;  /* hover state for accent */
  --text:         #F0F4FF;  /* primary text */
  --text-muted:   #A8B6D6;  /* secondary text — stroke.textMuted */
  --text-dim:     #7089B8;  /* tertiary text, placeholders */
}
```

### Status colors (clinical channels — each maps to a specific clinical meaning)
```css
:root {
  --warning:        #D97706;  /* amber — CI relativa, elevated BP/glucose */
  --warning-muted:  rgba(217,119,6,0.12);
  --warning-border: #FCD34D;

  --critical:       #EF4444;  /* red — absolute contraindication (changed from navy) */
  --critical-muted: rgba(239,68,68,0.12);

  --glucose:        #7C3AED;  /* violet — dedicated channel for glycemia */
  --glucose-muted:  rgba(124,58,237,0.12);
  --glucose-border: #A78BFA;

  --success:        #10B981;  /* green — normal values, step completion */
  --success-muted:  rgba(16,185,129,0.10);

  --info:           rgba(92,122,234,0.1);  /* blue-tinted — informational hints */
}
```

**Rationale for dark backgrounds:** ER fluorescent overhead lighting washes out white screens. Dark navy backgrounds reduce glare and make status color indicators pop with maximum contrast — amber on dark navy reads faster than amber on white in bright ambient light.

**Rationale for red critical (changed from dark navy `#1E3A8A`):** On a dark background, navy-on-navy critical alerts have insufficient contrast. Red (`#EF4444`) is unambiguous and immediately readable. Clinical note: verify with ER staff that red reads as "hard stop / contraindication" not "patient crashing."

**Light mode:** When a light-mode variant is needed, invert:
```css
[data-theme="light"] {
  --bg:      #F5F7FF;
  --surface: #FFFFFF;
  --panel:   #EEF1FA;
  --line:    #D0D7EE;
  --accent:  #244B99;
  --text:    #0F1C38;
  --text-muted: #4A5C7A;
}
```

---

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable — generous padding for gloved-hand touch targets
- **Keep existing font-size bumps** — they serve accessibility and gloved-hand readability
- **Minimum touch target:** 44px height (kept from existing implementation)

Scale: `2(2px) 4(4px) 8(8px) 12(12px) 16(16px) 20(20px) 24(24px) 32(32px) 40(40px) 48(48px) 64(64px)`

---

## Layout

- **Approach:** Mobile-first single column, linear step progression
- **Timer is the hero element:** The countdown timer must be persistently visible at the top of every active step screen. Large (40px+, Geist Mono), amber color, with a subtle pulsing dot. Not a widget — a vital sign.
- **Max content width:** 480px (phone-optimized, centered on larger screens)
- **Border radius scale:** sm(6px) md(10px) lg(14px) xl(20px) full(9999px)
- **Step progress:** Visual 5-dot progress indicator visible at all times during active code

---

## Motion

- **Approach:** Intentional — existing animations are well-calibrated, keep them
- **Keep:** `slide-down`, `slide-up` (step transitions), `fade-in` (content appears), `pulse-subtle` (timer dot)
- **Add:** 50ms ease-out green flash on step completion (scale 1→1.02→1, success color)
- **Easing:** enter `cubic-bezier(0.16, 1, 0.3, 1)` / exit `ease-in` / move `ease-in-out`
- **Duration:** micro 50-100ms / short 150-250ms / medium 250-400ms (step transitions)

---

## Component Conventions

### Timer display (Hero)
The timer is a hero block, not a widget. Mobile: `CÓDIGO STROKE` eyebrow (accent
`#5C7AEA`, uppercase, tracking 0.14em) + `PASO X/Y` pill above a 32px Geist Mono
timer with a pulsing dot and a `desde inicio` muted label. Geist Mono, tabular-nums.

**Color escalates with elapsed time** (single source of truth — `getTimerTone()` in `GlobalTimer.jsx`):
| Elapsed | Timer text | Token |
|---------|-----------|-------|
| 0–30 min | amber | `text-status-warning` (`#FBBF24`) |
| 30–60 min | orange | `text-orange-500` (`#F97316`) |
| >60 min | red | `text-status-critical` (`#EF4444`) |

The pulsing dot and progress-bar fill follow the same phase color.

```jsx
const tone = getTimerTone(minutes)
<span className={`font-mono text-[2rem] font-bold tabular-nums ${tone.text}`}>
  {formatElapsed(elapsed)}
</span>
```

### ClinicalAlert (`src/components/ClinicalAlert.jsx`)
Single component for all clinical alert banners. 3px left-border in the status color,
muted translucent background, 10px radius, icon + bold lead + muted body. Variants map
to the clinical channels: `warning` (amber), `critical` (red), `info` (accent blue),
`glucose` (violet), `success` (green). Prefer this over ad-hoc inline `AlertTriangle`
banners.

### Status badges
Each badge maps to exactly one clinical channel. Never mix semantics.
- **Amber** → CI relativa (relative contraindication)
- **Red** → CI absoluta (absolute contraindication — hard stop)
- **Violet** → glucose-specific alerts
- **Green** → normal values, step completed
- **Blue** → informational only (TA readings, general clinical info)

### Alert banners
Left-border accent matching status color, muted background, icon + bold lead + muted body.

### NIHSS option grid
4-column grid, Geist Mono for score numbers. Selected state: accent/warning/critical background depending on score severity.

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-07 | Switched primary background from white to dark navy `#0F1C38` | ER fluorescent lighting washes out white; dark backgrounds make status colors pop under ambient light |
| 2026-06-07 | Replaced Inter with DM Sans for UI | Inter is overused; DM Sans is equivalent readability with distinct identity |
| 2026-06-07 | Added Geist Mono as timer/numbers font | Clinical readability under pressure — tabular nums essential for time and vital stats |
| 2026-06-07 | Added Source Sans 3 for body text | Clinical authority for longer protocol descriptions |
| 2026-06-07 | Changed critical status from dark navy to red `#EF4444` | Insufficient contrast for navy-on-navy on dark backgrounds |
| 2026-06-07 | Established timer as persistent hero element | Timer is the most important UI element during a code stroke — visibility must be unambiguous |
| 2026-06-07 | Initial design system created | Created by /design-consultation based on codebase audit + clinical context |
| 2026-06-08 | Timer Hero: amber→orange→red text phases + CÓDIGO STROKE eyebrow + PASO X/Y pill + "desde inicio" | Implemented HANDOFF_SPEC Phase 1 adapted to the tab architecture (no stepper migration) |
| 2026-06-08 | Added `ClinicalAlert` component | Consolidates scattered inline warning banners into one channel-aware component (HANDOFF_SPEC Phase 3) |
