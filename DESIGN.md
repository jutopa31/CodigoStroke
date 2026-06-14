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

**Light mode:** Full system — white background, navy text, deep blue accent. Status
colors recalibrated for white backgrounds (muted versions use Tailwind semantic
swatches instead of translucent rgba, which look washed out on white).

```css
[data-theme="light"] {
  /* Backgrounds */
  --bg:           #F0F4FF;  /* subtle blue tint — softer than stark white under ER lighting */
  --surface:      #FFFFFF;  /* cards, step containers */
  --panel:        #EBF0FA;  /* inputs, nested panels, secondary surfaces */
  --line:         #C8D4EC;  /* borders, dividers */

  /* Brand / accent — the "identifying blue" */
  --accent:       #1D4ED8;  /* brand-600 — CTAs, links, active nav, step indicators */
  --accent-dim:   #1E40AF;  /* hover state */
  --accent-bg:    #EFF6FF;  /* selected/active state backgrounds */

  /* Text hierarchy */
  --text:         #0F1C38;  /* dark navy — WCAG AAA on white (contrast ~17:1) */
  --text-muted:   #3D5080;  /* secondary text — subtitles, labels */
  --text-dim:     #7089B8;  /* tertiary — placeholders, disabled */

  /* Status colors — recalibrated for white */
  /* On dark navy, rgba muted backgrounds work. On white, they look washed out.
     Use solid semantic Tailwind swatches instead. */
  --warning:        #D97706;  /* amber-600 — darker than dark-mode amber for white contrast */
  --warning-text:   #92400E;  /* amber-800 — text within warning alerts */
  --warning-muted:  #FEF3C7;  /* amber-100 — background for warning blocks */
  --warning-border: #F59E0B;  /* amber-500 */

  --critical:       #EF4444;  /* red-500 — unchanged, reads on white */
  --critical-text:  #991B1B;  /* red-800 — text within critical alerts */
  --critical-muted: #FEE2E2;  /* red-100 — background for critical blocks */

  --glucose:        #7C3AED;  /* violet-600 — unchanged */
  --glucose-text:   #4C1D95;  /* violet-900 — text within glucose alerts */
  --glucose-muted:  #F5F3FF;  /* violet-50 — background for glucose blocks */
  --glucose-border: #7C3AED;

  --success:        #10B981;  /* emerald-500 — unchanged */
  --success-text:   #065F46;  /* emerald-800 — text within success alerts */
  --success-muted:  #ECFDF5;  /* emerald-50 — background for success blocks */

  --info:           #EFF6FF;  /* blue-50 — informational bg */
  --info-border:    #3B82F6;  /* blue-500 */
  --info-text:      #1E40AF;  /* blue-800 */
}
```

**Timer in light mode:** The timer block keeps its dark navy card background
(`#0F1C38`) even in light mode. A deliberate island of darkness in a white page —
signals urgency and prevents the timer from reading as ordinary content. The amber/
orange/red text escalation, pulsing dot, and all existing timer colors remain unchanged.
The `[data-theme="light"]` override must NOT reset `--bg` on the timer's own
container (use `bg-[#0F1C38]` hardcoded, not `bg-[--bg]`, on that element).

**Implementation note:** Toggle the theme by setting `data-theme="light"` on
`<html>` or `<body>`. All CSS custom properties cascade automatically. Persist
preference to `localStorage` under `codigostroke_theme`.

```js
// Toggle pattern
const theme = localStorage.getItem('codigostroke_theme') ?? 'dark'
document.documentElement.dataset.theme = theme
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
- **Step progress:** Visual numbered stepper (8 circles) visible at all times during active code.

### Header is a flex child, never `position: fixed`

The app shell is `h-dvh flex flex-col overflow-hidden`. The header (`GlobalTimer`)
is the first flex child with `shrink-0`; the body is `flex-1` and scrolls inside.
The flex column absorbs the header's variable height (timer hero, event-timeline
strip, progress bar), so the body can never be clipped underneath it.

**Banned:** a `fixed` header paired with a hardcoded `pt-[calc(...)]` on the body.
That padding is a guess at the header's height; when the real height changes (font
size, event strip wrap, safe-area inset) it desyncs and clips whatever sits first
in the body (this was the cut-off-stepper-dots bug, fixed 2026-06-13).

### Border radius — role-based scale (single source: `tailwind.config.js`)

Wired into Tailwind so the token names below ARE the values. Apply by role; the
**same role uses the same token on mobile and desktop**.

| Token | Value | Role |
|-------|-------|------|
| `rounded-md`   | 6px  | badges, chips, small status tags |
| `rounded-lg`   | 8px  | inputs, nested panels, list rows |
| `rounded-xl`   | 12px | cards, buttons, primary containers (dominant) |
| `rounded-2xl`  | 16px | large surfaces, FABs, modals |
| `rounded-full` | —    | circles, pills, avatars, icon-toggle buttons |

Icon buttons (header actions) use `rounded-xl` on both breakpoints; only the
touch-target *size* scales down on desktop (`w-10 h-10` → `w-7 h-7`), never the
radius.

### Mobile / desktop parity

One visual language per element. Layout dimensions may change across breakpoints
(a stack becomes a row, a hero becomes a compact bar), but **color, radius, font
weight, and semantic meaning stay identical**. Never let the same clinical state
read as a different color depending on screen width. When a component needs two
layout branches (e.g. `GlobalTimer` mobile hero vs desktop bar), both branches
must pull the same tokens; only spacing and dimensions differ.

---

## Motion

- **Approach:** Intentional. Finer over flashier — transition only what changes.

### Tokens (single source: `tailwind.config.js`)

The app's signature curve and base duration are wired as Tailwind defaults, so
**every `transition-*` without an explicit value already uses them** — no
per-component easing needed.

| Token | Value | Use |
|-------|-------|-----|
| easing `DEFAULT` / `ease-expo-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | enters, state changes (the signature feel) |
| easing `ease-snappy` | `cubic-bezier(0.4, 0, 0.2, 1)` | exits, quick toggles |
| `duration-fast` | 150ms | micro feedback (hover, press) |
| `duration` (DEFAULT) | 200ms | most state changes |
| `duration-base` | 250ms | step / panel transitions |
| `duration-slow` | 350ms | large entrances |

### Rules

- **Never `transition-all`.** It animates layout (width/height/margin) and causes
  jank. Use `transition` (curated visual props, no layout), or be specific
  (`transition-colors`, `transition-transform`).
- **Keep** the named keyframes: `slide-down`, `slide-up` (step/panel entrances),
  `fade-in` (content appears), `pulse-subtle` (timer dot).
- **Step completion:** `step-pop` — one-shot scale 1→1.18→1 over 300ms on the
  stepper circle as it transitions into the completed (amber) state. Color tweens
  via `transition duration-base`.
- **Dynamic alerts:** `ClinicalAlert` (TA/glucemia out of range) enters with
  `animate-slide-down`.

---

## Component Conventions

### Buttons

**Primary action → `.btn-primary`** (defined in `src/index.css`). Solid royal blue
(`brand-600` → `brand-700` on hover) with **white** label, identical in both themes
(~6.6:1 contrast). This is the single source for the filled-blue CTA; the element
keeps its own layout/size classes, the class owns only color + hover.

> Do **not** use `bg-stroke-iconActive` + `text-stroke-bg` for buttons. That
> paints dark page-bg text on the mid-tone accent (~4.3:1 in dark mode, muddy) —
> the bug fixed 2026-06-13. `stroke-iconActive` stays a **foreground** color
> (icons, active text, rings on dark surfaces), not a button background.

**Status-colored buttons keep dark text:** `bg-amber-500`/`bg-status-warning` and
`bg-emerald-500` pair with `text-stroke-bg` (dark) on purpose — dark-on-amber and
dark-on-green are the high-contrast direction. Only the blue CTA flips to white.

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

### Step Stepper (`src/components/StepStepper.jsx`)
Primary navigation: 7 numbered circles (numbers only) + connector line, replacing the
icon TabBar. Maps the protocol across both phases:
1 Paciente · 2 Tiempo · 3 NIHSS · 4 Imagen · 5 Contraindicaciones · 6 Decisión · 7 Tratamiento.
Circle states: **completed** = amber fill (`bg-status-warning`, navy number); **active** =
2px accent ring (`border-stroke-iconActive`, accent bg/text); **pending** = navy fill, line
border, muted number. Grouped steps (5 CI, 7 Tratamiento) reveal a thin pill sub-nav when
active so no sub-tab is lost. Post steps (6, 7) are gated until the decision is computed.

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
| 2026-06-09 | Light mode system completed | White (#F0F4FF bg, #FFFFFF surface) + deep blue accent (#1D4ED8). Status colors recalibrated from rgba to solid semantic swatches (rgba looks washed on white). Timer keeps dark navy card even in light mode — preserves urgency signal. |
| 2026-06-13 | Coherence pass: wired the system into Tailwind | Radius scale and motion tokens (easing + duration) defined in `tailwind.config.js`. The doc's rules existed only on paper; now they're code. Radius scale corrected to match de-facto usage (xl=12 is the real card/button token, not the doc's aspirational 20). |
| 2026-06-13 | Header `fixed` → flex child | Removed `position: fixed` + the magic `pt-[calc(...)]` body offset. Header is now a `shrink-0` flex child; body is `flex-1`. Fixes the cut-off stepper dots (esp. mobile) and makes header height changes self-correcting. |
| 2026-06-13 | Mobile/desktop parity rule established | Same role = same color/radius/weight on both breakpoints; only layout dimensions scale. Unified header icon-button radius (`rounded-xl` both). |
| 2026-06-13 | Banned `transition-all`; deleted dead `TabBar.jsx` | `transition-all` animates layout (jank) → use `transition`/specific. `TabBar` was unused since the numbered `StepStepper` replaced it. |
| 2026-06-13 | Primary buttons → `.btn-primary` (white on royal blue) | The `bg-stroke-iconActive text-stroke-bg` pattern painted dark text on the mid-tone accent (~4.3:1, muddy in dark mode). Swept ~49 button instances across 26 files to a single `.btn-primary` class (brand-600 + white, 6.6:1, both themes). Amber/green buttons keep dark text (correct direction). |
