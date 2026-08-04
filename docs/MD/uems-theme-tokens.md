---
name: UEMS Theme Tokens
description: The semantic-token layer that drives all five UEMS themes (Light, Dark, Night, Green light, Green dark) — colors, surfaces, borders, icons, charts, plus spacing and radius primitives.
type: foundation
status: stable
category: Foundation / Tokens
figma:
  file: UEMS — Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  collectionId: "VariableCollectionId:69:22"
  url: https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=0-1
tokens:
  collection: UEMS Theme Tokens
  totalVariables: 223
  themes:
    - { name: Light theme,       data-theme: light,       modeId: "69:1" }
    - { name: Dark theme,        data-theme: dark,        modeId: "136:0" }
    - { name: Night theme,       data-theme: night,       modeId: "15213:0" }
    - { name: Green light theme, data-theme: green-light, modeId: "19798:0" }
    - { name: Green dark theme,  data-theme: green-dark,  modeId: "8218:0" }
output:
  css: uems-theme-tokens.css
---

# UEMS Theme Tokens

> The **semantic** token layer for the UEMS Design System. Components never bind to a hex value or a primitive (`Cobalt-500`, `Grey-Modern-700`) — they bind to a semantic token (`--uems-bg-button-primary`, `--uems-text-secondary`) whose value swaps per theme. Five themes ship in the box: Light, Dark, Night, Green light, Green dark.

| Meta | Value |
|---|---|
| Figma collection | `UEMS Theme Tokens` |
| Collection ID | `VariableCollectionId:69:22` |
| Total variables | **223** |
| Themes (modes) | 5 — Light, Dark, Night, Green light, Green dark |
| Default theme | Light |
| CSS output | [`uems-theme-tokens.css`](./uems-theme-tokens.css) |
| Source file | [`tokens.json`](./tokens.json) (primitives + scale) |

---

## Architecture

```
┌──────────────────────────── PRIMITIVES ────────────────────────────┐
│  Cobalt / Fern / Cardinal / Sunshine / Persimmon / Charoite /       │
│  Grey / Grey-Modern / Spurge / White / Black                        │
│  Each ramp has 21 steps (25, 50, 100, 150, …, 1000)                 │
│  Source collections: "Primitive colors", "style Primitivies"        │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────── SEMANTIC ──────────────────────────────┐
│  UEMS Theme Tokens — 223 variables × 5 modes                        │
│  text/* · background/* · border/* · icon/* · chart/* · spacing/* · radius/*│
│  Each variable aliases a primitive that differs per theme           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌──────────────────────────── CONSUMERS ─────────────────────────────┐
│  Components, screens, dashboards                                     │
│  Bind via var(--uems-bg-primary) — never via hex                     │
└─────────────────────────────────────────────────────────────────────┘
```

The golden rule:

> **Components reference semantic tokens. Semantic tokens reference primitives. Never skip a level.**

If a component needs a color that isn't in the semantic layer, **add the semantic token first**, then use it. Don't reach into the primitive layer directly.

---

## Themes

| Theme | `data-theme` | Surface family | Accent | Notes |
|---|---|---|---|---|
| **Light theme** | `light` (default) | Grey Modern lights | Cobalt blue (`#006AFF`) | The canonical theme. `:root` falls back to Light values so apps work without setting `data-theme`. |
| **Dark theme** | `dark` | Grey Modern darks | Cobalt blue (`#00A6FF` — lifted for legibility) | Mirrors Light with inverted surfaces. |
| **Night theme** | `night` | Neutral greys (not Modern) | Cobalt blue with **Charoite purple** as the "error" accent | Used for high-contrast OLED experiences. Error / danger surfaces use purple instead of red because saturated reds bloom too harshly on Night surfaces. |
| **Green light theme** | `green-light` | Grey Modern lights | **Fern green** (`#0C8844`) | Same neutrals as Light, brand accent swapped from blue to green. |
| **Green dark theme** | `green-dark` | Grey Modern darks | Fern green | Same neutrals as Dark, accent swapped. |

### Switching themes

```html
<!-- Set on <html> (or any ancestor) -->
<html data-theme="dark">
```

```js
document.documentElement.setAttribute('data-theme', userPref); // 'light' | 'dark' | 'night' | 'green-light' | 'green-dark'
```

A `prefers-color-scheme: dark` media query inside `uems-theme-tokens.css` also applies the Dark palette to `:root:not([data-theme])` so unconfigured apps still respect OS preference.

---

## Token categories

### 1. Spacing (`--uems-spacing-*`)

A 4-pixel-step scale, identical across all themes. Use these for padding, margin, and gap.

| Token | Value | Common use |
|---|---|---|
| `--uems-spacing-0` | `0` | reset |
| `--uems-spacing-2` | `2px` | hairline gap, focus offset |
| `--uems-spacing-4` | `4px` | tight inline gap (badge padding) |
| `--uems-spacing-8` | `8px` | default inline gap |
| `--uems-spacing-12` | `12px` | small block gap |
| `--uems-spacing-16` | `16px` | card padding (compact) |
| `--uems-spacing-20` | `20px` | header/footer vertical padding |
| `--uems-spacing-24` | `24px` | modal padding, section gap |
| `--uems-spacing-32` | `32px` | section vertical rhythm |
| `--uems-spacing-40` | `40px` | hero / dashboard rhythm |
| `--uems-spacing-48` … `--uems-spacing-80` | 48 / 52 / … / 80px | page-level rhythm |

### 2. Radius (`--uems-radius-*`)

Identical across all themes. Token names match the Figma `border-radius/radius-N` collection — **the number is the px value**, no t-shirt sizes.

| Token | Value | Common use |
|---|---|---|
| `--uems-radius-none` | `0` | flush edges |
| `--uems-radius-2` | `2px` | hairline rounding (sparkbars, tag pills) |
| `--uems-radius-4` | `4px` | small inputs, dense tab items |
| `--uems-radius-6` | `6px` | most components (chips, segmented controls, tab-filter track) |
| `--uems-radius-8` | `8px` | buttons, cards, KPI tiles |
| `--uems-radius-12` | `12px` | modal dialogs |
| `--uems-radius-16` | `16px` | popovers, large cards |
| `--uems-radius-20` | `20px` | sheets, marketing surfaces |
| `--uems-radius-pill` | `9999px` | full-pill buttons, avatars, badges |

### 3. Font size (`--uems-font-size-*`)

Pixel literals that match the typography scale. The full type-scale (line-height + family + weight) lives in a separate **Typography** collection — these are the size primitives only.

`8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80`

### 4. Text (`--uems-text-*`)

Text color tokens. The leading ones every component needs:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--uems-text-primary` | `#15181E` | `#E1E4EB` | Body & headings — the default text color |
| `--uems-text-secondary` | `#2A303D` | `#C3C9D6` | Slightly de-emphasized text, sub-headings |
| `--uems-text-tertiary` | `#40485B` | `#A5AEC1` | Captions, descriptions |
| `--uems-text-quaternary` | `#55607A` | `#8893AD` | Meta / timestamps |
| `--uems-text-disabled` | `#8893AD` | `#55607A` | Disabled controls |
| `--uems-text-placeholder` | `#8893AD` | `#55607A` | Input placeholders |
| `--uems-text-white` | `#FFFFFF` | `#FFFFFF` | Text on solid colored fills (buttons, alerts) |
| `--uems-text-error` | `#C1181B` | `#E94D4F` | Error messages, destructive labels |
| `--uems-text-alert` | `#956B11` | `#E0A01A` | Warning / caution text |
| `--uems-text-warning` | `#BC4200` | `#FF6A1A` | Higher-severity warning (persimmon orange) |
| `--uems-text-success` | `#0A7138` | `#55AC7C` | Success messages |
| `--uems-text-info` | `#006AFF` | `#00A6FF` | Informational |
| `--uems-text-acknowledge` | `#663399` | `#9471B8` | Acknowledged-status copy (charoite purple) |
| `--uems-text-accent-link` | `#006AFF` | `#00A6FF` | Hyperlinks — **theme-driven** (green in green-* themes) |
| `--uems-text-accent-primary` | `#0E2553` | `#96B3EE` | Accent text on accent backgrounds |
| `--uems-text-accent-secondary` | `#1E52BB` | `#4276E0` | Accent text — lower contrast variant |

> **Severity ladder:** `info → success → alert (yellow) → warning (orange) → error (red)`. Pick the lowest level that still communicates the issue. Reserve **error** for blocking failures.

### 5. Background (`--uems-bg-*`)

Surface tokens. The hierarchy stacks "primary on top, deeper levels behind":

| Token | Light | Dark | Use |
|---|---|---|---|
| `--uems-bg-base` | `#FAFBFC` | `#0A0B0F` | Page background (deepest) |
| `--uems-bg-primary` | `#FFFFFF` | `#15181E` | Card / sheet surface (top of stack) |
| `--uems-bg-primary-hover` | `#F0F2F5` | `#2A303D` | Hover state for primary surfaces |
| `--uems-bg-secondary` | `#F0F2F5` | `#20242E` | Sidebar, secondary panels |
| `--uems-bg-tertiary` | `#E1E4EB` | `#2A303D` | Inset surfaces (code blocks, well content) |
| `--uems-bg-quaternary` | `#D2D7E0` | `#40485B` | Deeply inset / segmented track |
| `--uems-bg-disabled` | `#E1E4EB` | `#2A303D` | Disabled fill |
| `--uems-bg-overlay` | `#0A0B0F` (with 70% opacity) | `#15181E` | Modal scrim |
| `--uems-bg-active` | `#EAF0FC` | `#071229` | Selected / active state |
| `--uems-bg-icon-fill` | `#FFFFFF` | `#2A303D` | Tinted icon background (modal header circle) |

**Semantic surface families** — each has Primary (subtlest), Secondary, Solid, Solid-Hover, Solid-Pressed, Disabled variants:

| Family | Color | Light primary | Dark primary | Used for |
|---|---|---|---|---|
| Success | Fern green | `#E7F3ED` | `#02170B` | Banners, toasts, success badges |
| Error | Cardinal red | `#FDEBEB` | `#150303` | Destructive surfaces, error banners |
| Alert | Sunshine yellow | `#FEF8EB` | `#181103` | Caution surfaces |
| Warning | Persimmon orange | `#FFEEE5` | `#150700` | Higher-severity warning |
| Info | Cobalt blue | `#EAF0FC` | `#071229` | Informational banners |
| Acknowledge | Charoite purple | `#F1EAF8` | `#140A1F` | "I have seen this" status |

**Button & accent** (theme-driven brand color):

| Token | Light (Cobalt) | Green light (Fern) | Use |
|---|---|---|---|
| `--uems-bg-button-primary` | `#006AFF` | `#0C8844` | Primary CTA fill |
| `--uems-bg-button-primary-hover` | `#1E52BB` | `#0A7138` | Hover |
| `--uems-bg-button-primary-pressed` | `#184091` | `#085B2D` | Pressed |
| `--uems-bg-accent-primary` | `#EAF0FC` | `#E7F3ED` | Tinted accent surface |
| `--uems-bg-accent-primary-action` | `#006AFF` | `#0C8844` | Solid accent action |

### 6. Border (`--uems-border-*`)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--uems-border-primary` | `#B4BBCC` | `#40485B` | Strong dividing line |
| `--uems-border-secondary` | `#C3C9D6` | `#2A303D` | Card / input border |
| `--uems-border-tertiary` | `#E1E4EB` | `#2A303D` | **Default divider** — use this most of the time |
| `--uems-border-quaternary` | `#F0F2F5` | `#20242E` | Subtlest separator |
| `--uems-border-success` | `#0C8844` | `#249457` | Success card outline |
| `--uems-border-error` | `#E42527` | `#C1181B` | Invalid input outline |
| `--uems-border-alert` | `#F9B21D` | `#FAC248` | Warning card outline |
| `--uems-border-warning` | `#E65100` | `#FF6A1A` | Persimmon warning outline |
| `--uems-border-accent` | `#006AFF` | `#00A6FF` | Selected / brand outline |
| `--uems-border-accent-focus` | `#006AFF` | `#00A6FF` | **Focus ring** — keep contrast ≥ 3:1 |

Each semantic also exposes `-secondary` (mid step) and `-subtle` (faintest) variants for layered states.

### 7. Icon (`--uems-icon-*`)

Mirror the text scale most of the time, with distinct values where the icon needs more weight than the corresponding text (e.g., `--uems-icon-alert` reads bolder than `--uems-text-alert`).

`--uems-icon-primary · -secondary · -tertiary · -subtle · -disabled · -white · -black · -success · -error · -alert · -warning · -info · -acknowledge · -accent · -accent-button · -accent-disabled`

### 8. Chart (`--uems-chart-*`)

Six-step palettes per hue. Each color has Primary (most saturated) through Senary (lightest). Pair with the page surface to make sure the chart contrasts against its container.

Available hues: `blue · red · orange · yellow · green · charoite · grey`

Pattern: `--uems-chart-{hue}-{primary | secondary | tertiary | quaternary | quinary | senary}`

| Use case | Hue suggestion |
|---|---|
| Default trend / brand line | `blue` (Light/Dark) or `green` (Green-*) |
| Comparison series A vs B | `blue` + `orange` (high-contrast pair) |
| Sequential heatmap (low → high) | Single hue, `senary → primary` |
| Diverging (negative ↔ positive) | `red ↔ green` (or `red ↔ blue` for color-blind safety) |
| Categorical buckets up to 6 | Use all 7 hues' Primary steps |

---

## How tokens differ across themes

| Difference | Why |
|---|---|
| **Light vs Dark** — entire neutral scale flips | Standard inversion |
| **Dark vs Night** — Grey Modern → Grey | Night uses a *cooler* neutral that pairs better with the purple-error accent |
| **Night error = purple, not red** | Saturated red blooms on Night surfaces; charoite is calmer and still reads as "stop" |
| **Green light/dark vs default** — accent swapped from cobalt → fern | Brand alternates per product line; neutrals unchanged so layouts stay identical |
| **`-link` colors brighten in Dark/Night** | A pure `#006AFF` link fails AA on dark surfaces — Dark uses `#00A6FF`, the "Hyperlink dark theme" primitive |

---

## Usage

### Drop-in CSS

```html
<link rel="stylesheet" href="/design-system/uems-theme-tokens.css" />
<html data-theme="dark">
```

### Apply to a component

```css
.card {
  background: var(--uems-bg-primary);
  color:      var(--uems-text-primary);
  border:     1px solid var(--uems-border-tertiary);
  border-radius: var(--uems-radius-8);
  padding:    var(--uems-spacing-16);
}

.card[data-state="error"] {
  background: var(--uems-bg-error-primary);
  border-color: var(--uems-border-error-subtle);
  color: var(--uems-text-error);
}
```

The same component now works correctly in all five themes without writing theme-specific CSS — the consumed tokens swap underneath.

### Tailwind v4

```css
/* tokens.css (your global stylesheet) */
@import "./uems-theme-tokens.css";

@theme inline {
  --color-bg-primary: var(--uems-bg-primary);
  --color-bg-secondary: var(--uems-bg-secondary);
  --color-text-primary: var(--uems-text-primary);
  --color-border-default: var(--uems-border-tertiary);
  --color-accent: var(--uems-bg-button-primary);
  --radius-card: var(--uems-radius-8);
  --spacing-4: var(--uems-spacing-16);
  /* …etc */
}
```

Then write `bg-bg-primary text-text-primary rounded-m p-4` — and theme switching at the `<html>` level just works.

### JS access (when you need a value at runtime — e.g., for a Canvas / WebGL renderer)

```js
const cs = getComputedStyle(document.documentElement);
const fg = cs.getPropertyValue('--uems-text-primary').trim();
```

---

## Best practices

| ✓ Do | ✗ Don't |
|---|---|
| Bind components to **semantic tokens** (`--uems-bg-primary`). | Hardcode hex values or reach into the primitive ramps. |
| Add a new semantic token when none of the existing ones fits the intent — propose it in Figma first, then re-export. | Inline an unbranded color in a component and call it "close enough". |
| Use `--uems-border-tertiary` as the default divider. | Default to the strongest border for every separator. |
| Use the lowest severity that reads correctly (info → success → alert → warning → error). | Default to error / red for every "something happened" message. |
| Test all five themes when adding a new screen — visual changes that look fine in Light can fail in Night. | Ship with only Light verified. |
| For focus rings, use `--uems-border-accent-focus` at 2px width with 2px offset. | Remove the focus ring on `:hover` or `:active`. |
| Keep custom theme overrides in a tiny scoped block (`[data-theme="custom-x"] { … }`); never edit `uems-theme-tokens.css`. | Fork the token file per product. |
| Drive theme from a user preference + `prefers-color-scheme` fallback. | Hardcode `data-theme="light"`. |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Body text contrast** | `--uems-text-primary` on `--uems-bg-primary` is ≥ 12:1 in Light and Dark, ≥ 7:1 in Night. AA ✓ |
| **Secondary text** | `--uems-text-secondary/-tertiary/-quaternary` all ≥ 4.5:1 on their typical surfaces — verify against `--uems-bg-secondary` if you nest them. |
| **State colors (text)** | Success / Error / Alert / Warning / Info text tokens meet AA against white surfaces in Light themes and against dark surfaces in Dark / Night themes. The `-secondary` variants don't always — they're intended for non-text uses (chart fills, decorative borders). |
| **Focus ring** | `--uems-border-accent-focus` is engineered for ≥ 3:1 against every surface in every theme. Don't substitute another token. |
| **Color is never the only channel** | A red border must always be paired with an icon or text label. Charts must always include legends or direct labels. |
| **Night-theme red** | Night uses charoite purple instead of red — pair with an explicit icon (`exclamation-triangle`) so the meaning is preserved when red is gone. |

---

## Source files

| File | Contents |
|---|---|
| [`uems-theme-tokens.css`](./uems-theme-tokens.css) | The runtime token stylesheet. Import once at the app entry. |
| [`tokens.json`](./tokens.json) | Project-level primitives (spacing, radius, icon size, font scale). Useful for build-time generation (Style Dictionary, Tailwind config). |
| Figma — `UEMS Theme Tokens` collection | Source of truth. Re-export via `figma_export_tokens` to regenerate the CSS file. |

### Round-trip

```bash
# Re-export from Figma → CSS (uses figma-console-mcp)
figma_export_tokens \
  --collection "VariableCollectionId:69:22" \
  --format css-vars \
  --prefix uems- \
  --colorFormat hex \
  --resolveAliases true \
  --output design-system/uems-theme-tokens.css
```

---

## Changelog

| Date | Change |
|---|---|
| 2026-06-04 | Initial extraction from Figma collection `VariableCollectionId:69:22` (223 variables × 5 themes). |
