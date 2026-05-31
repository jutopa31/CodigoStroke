# Component Inventory

## 1. NO/SÍ Toggle (`ContraRow`)

**File:** `src/steps/ContraindicationsStep.jsx`

The toggle is a segmented button pair (`NO | SÍ`) rendered once per contraindication row. Two variants exist: **red** (absolute CI) and **orange** (relative CI). They share the same state structure but differ in their "SÍ selected" colors.

---

### State matrix

| State | Row container | Row border | Label text | NO button | SÍ button |
|---|---|---|---|---|---|
| **Idle** (unanswered) | — | `border-gray-100` (#f3f4f6) | `text-gray-700` (#374151) | `bg-white text-neutral-400` (#707070) | `bg-white text-neutral-400` |
| **NO selected** | `bg-slate-50` (#f8fafc) | `border-slate-200` (#e2e8f0) | `text-gray-700` | `bg-slate-600 text-white` (#475569) | `bg-white text-neutral-400` |
| **SÍ — absolute CI** (red) | `bg-blue-900/10` | `border-blue-800/40` (#1e40af @ 40%) | `text-blue-900` (#1e3a8a) | `bg-white text-neutral-400` | `bg-blue-900 text-white` (#1e3a8a) |
| **SÍ — relative CI** (orange) | `bg-amber-50` (#fffbeb) | `border-amber-300` (#fcd34d) | `text-amber-800` (#92400e) | `bg-white text-neutral-400` | `bg-amber-500 text-white` (#f59e0b) |

All buttons include `active:scale-95` for press feedback.

---

### Info / expand button (per row)

| State | Style |
|---|---|
| Collapsed | `text-gray-300 hover:text-gray-500` — shows `<Info size={12}>` |
| Expanded (absolute CI) | `bg-blue-100 text-blue-700` — shows `<ChevronDown size={12}>` |
| Expanded (relative CI) | `bg-amber-100 text-amber-500` — shows `<ChevronDown size={12}>` |

---

### Expanded detail panel

| Variant | Border-top | Inner panel |
|---|---|---|
| Absolute CI | `border-blue-100` | `bg-blue-50 text-blue-900` |
| Relative CI | `border-amber-100` | `bg-amber-50 text-amber-700` |

---

### Summary banner (bottom of each view)

| Condition | Banner |
|---|---|
| ≥1 absolute CI = SÍ | `bg-blue-900/10 border-2 border-blue-800/50` — text `text-blue-900` |
| ≥1 relative CI = SÍ, no absolute | `bg-amber-50 border-2 border-amber-300` — text `text-amber-700` |

---

### Anticoagulation toggle (top of absolute CI view)

Separate `NO | SÍ` pair, larger (`px-4 py-2`), same state logic as ContraRow:

| State | NO button | SÍ button |
|---|---|---|
| Idle | `bg-white text-neutral-400` | `bg-white text-neutral-400` |
| NO selected | `bg-slate-600 text-white` (#475569) | `bg-white text-neutral-400` |
| SÍ selected | `bg-white text-neutral-400` | `bg-amber-500 text-white` (#f59e0b) |

When SÍ, a 3-column drug type picker appears:
- Unselected pill: `border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100`
- Selected pill: `border-amber-400 bg-amber-100 text-amber-800`

---

### Clinical color rationale

| Color family | Meaning |
|---|---|
| `blue-900` (#1e3a8a) | Absolute contraindication — hard stop, blocks thrombolysis |
| `amber-500` (#f59e0b) | Relative contraindication / anticoagulation — proceed with caution |
| `slate-600` (#475569) | Negative answer — neutral confirmation, no clinical significance |
| `emerald-*` | Absence of contraindication — safe to proceed |

> Note: absolute contraindications use **blue-900** (dark navy), not red, to avoid visual conflict with the emergency red (`brand-600 = #1D4ED8`) used for primary actions. The `red` prop name is a code-level tag only; rendered color is blue.

---

---

## 2. Tab Navigation (`TabBar`)

**File:** `src/components/TabBar.jsx`

---

### State matrix — `TabItem`

| State | Icon bg (mobile) | Icon bg (desktop) | Icon ring (mobile) | Label (mobile) | Label (desktop) |
|---|---|---|---|---|---|
| **Active** | `bg-white/25 text-white` | `bg-stroke-iconActive text-white` (#5C7AEA) | — | `text-white font-semibold` | `text-white font-semibold` |
| **Complete** (not active) | `bg-emerald-100 text-emerald-700` | `bg-stroke-icon text-white` (#244B99) | `ring-2 ring-emerald-400` | `text-emerald-200 font-medium` | `text-stroke-textMuted` (#A8B6D6) |
| **Partial** (not active) | `bg-amber-100 text-amber-600` | `bg-amber-500/90 text-white` | `ring-2 ring-amber-400` | `text-amber-200` | `text-stroke-textMuted` (#A8B6D6) |
| **Empty** / not visited | `bg-white/10 text-white/40` | `bg-stroke-icon text-stroke-textMuted` | — | `text-white/40` | `text-stroke-textMuted` (#A8B6D6) |

Active tab container: mobile `bg-white/15`, desktop `bg-stroke-panel border-white/10` (#3B4D73).

---

### Known gaps

**Active state rule (partially documented)**
All tabs use the same active color regardless of phase or tab id. The perceived amber tint on CI Rel. is the `partial` state (amber ring + icon), not the active state. There is no tab-specific active color rule. This should be made explicit to prevent future divergence.

**Visited/completed state missing on desktop**
On mobile, a completed tab shows `ring-2 ring-emerald-400` and a green checkmark badge (`bg-emerald-500`). On desktop both `complete` and `empty` tabs use `bg-stroke-icon` for the icon background — no visible distinction. The emerald ring and the badge are suppressed with `md:ring-0` and `md:hidden` respectively.

**Mobile vs desktop background**
Mobile: dark navy bar (`bg-stroke-navy` = #132B58, set in the parent `AppShell`).  
Desktop: same dark navy sidebar. The visual difference reported is contrast — mobile is a horizontal bar with the full dark bg visible, desktop embeds tabs inside a sidebar that may render at a different width — same colors, different layout context.

---

### `completion` prop contract

Passed as `completion[tabId]` from `App.jsx`. Valid values:

| Value | Meaning |
|---|---|
| `'complete'` | All required fields answered |
| `'partial'` | Some fields answered, not all |
| `'empty'` | Tab not yet interacted with (default) |

`showTrombolisis` key is also accepted on the Phase 2 object to conditionally hide the Trombolisis tab when thrombolysis is contraindicated.
