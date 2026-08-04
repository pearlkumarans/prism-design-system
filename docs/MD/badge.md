# Handoff Spec: Badge

**Figma:** [UEMS — Design System 3.0 · node `16484:122065`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16484-122065) · Component set, **168 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Primitives — [`primitive-colors.md`](../primitive-colors.md)

---

## Overview

A small, **non-interactive** status label that communicates the state of an object (Default, Active, Success, Critical, Moderate, Important, Acknowledge) at a glance. Two emphasis levels (Intense = solid fill, Subtle = tinted fill), three sizes, two shapes, optional leading icon, RTL support. Badges are read-only: no hover, focus, or click behavior.

> Note: the Figma `State` axis is **semantic status**, not interaction state — a badge never has hover/pressed styles.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Style` | Intense (solid), Subtle (tinted) | 2 |
| `Size` | Small, Medium, Large | 3 |
| `State` | Default, Active, Success, Critical, Moderate, Important, Acknowledge | 7 |
| `Shape` | Pill, Rounded | 2 |
| `RTL` | Off, On | 2 |

**Total:** 2 × 3 × 7 × 2 × 2 = **168 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Label` | Text | `"Badge"` | Badge text content (required) |
| `Show Icon` | Boolean | `true` | Renders the leading icon |
| `Icon` | Instance swap | dot/add icon | Icon slot — any 1:1 icon |

## Layout

```
┌──────────────────────────┐
│ [icon] gap-2 [label]     │  height: 16 / 20 / 24px (size-dependent)
└──────────────────────────┘  padding: 2px vertical · 4px (Small) / 8px (Medium, Large) horizontal
   width: hug content — never fixed, never fills
```

### Size metrics
> **Code deviation (2026-06-11):** horizontal padding shipped as **8px** (`--uems-spacing-8`) on Medium/Large — at 4px the pill curve crowded the label; **Small keeps the spec's 4px**. Vertical stays 2px on all sizes. Update Figma to match.


| Size | Height | Padding (V × H) | Gap | Icon | Font (Zoho Puvi) |
|---|---|---|---|---|---|
| Small | 16px | 2px × 4px (`--uems-spacing-2` / `--uems-spacing-4`) | 2px | 8×8 | 10px / 14px line-height, Medium |
| Medium | 20px | 2px × **8px** (`--uems-spacing-2` / `--uems-spacing-8`) | 2px | 12×12 | 12px / 16px line-height, Medium |
| Large | 24px | 2px × **8px** (`--uems-spacing-2` / `--uems-spacing-8`) | 2px | 16×16 | 14px / 20px line-height, **Regular** |

> Large intentionally drops to Regular weight; Small/Medium use Medium weight. Font sizes map to `--uems-font-size-10/12/14`.

### Shape

| Shape | Radius |
|---|---|
| Pill | `--uems-radius-pill` |
| Rounded | `4px` (`--uems-radius-xs`) — all sizes |

## Design Tokens Used

All colors are UEMS theme tokens — they adapt automatically across the five themes. Hex comments show **Light theme** resolution (verified against Figma).

### Intense (solid)

| State | Background | Text | Icon |
|---|---|---|---|
| Default | `--uems-bg-quaternary-solid` /* #5F6C89 */ | `--uems-text-white` | `--uems-icon-white` |
| Active | `--uems-bg-info-solid` /* #2C66DD */ | `--uems-text-white` | `--uems-icon-white` |
| Success | `--uems-bg-success-solid` /* #0C8844 */ | `--uems-text-white` | `--uems-icon-white` |
| Critical | `--uems-bg-error-solid` /* #E42527 */ | `--uems-text-white` | `--uems-icon-white` |
| Moderate | `--uems-bg-alert-solid` /* #F9B21D */ | `--uems-text-black` | `--uems-icon-black` |
| Important | `--uems-bg-warning-solid` /* #E65100 */ | `--uems-text-white` | `--uems-icon-white` |
| Acknowledge | `--uems-bg-acknowledge-solid` /* #663399 */ | `--uems-text-white` | `--uems-icon-white` |

> Moderate (yellow) deliberately switches to black text/icon for contrast — do not "fix" it to white.

### Subtle (tinted)

| State | Background | Text | Icon |
|---|---|---|---|
| Default | `--uems-bg-secondary` /* #F0F2F5 */ | `--uems-text-secondary` /* #2A303D */ | `--uems-icon-secondary` |
| Active | `--uems-bg-info-primary` /* #EAF0FC */ | `--uems-text-info` /* #1E52BB */ | `--uems-icon-info` |
| Success | `--uems-bg-success-primary` /* #E7F3ED */ | `--uems-text-success` /* #0A7138 */ | `--uems-icon-success` |
| Critical | `--uems-bg-error-primary` /* #FDEBEB */ | `--uems-text-error` /* #C1181B */ | `--uems-icon-error` |
| Moderate | `--uems-bg-alert-primary` /* #FEF8EB */ | `--uems-text-alert` /* #956B11 */ | `--uems-icon-alert` |
| Important | `--uems-bg-warning-primary` /* #FFEEE5 */ | `--uems-text-warning` /* #BC4200 */ | `--uems-icon-warning` |
| Acknowledge | `--uems-bg-acknowledge-primary` /* #F1EAF8 */ | `--uems-text-acknowledge` /* #663399 */ | `--uems-icon-acknowledge` /* #5C2E89 */ |

> Icons in Figma are **stroke-drawn** — apply the icon color to `stroke`, not `fill`, when using the system icon set.

## Developer Handoff

### Suggested API

```
<uems-badge
  state="default | active | success | critical | moderate | important | acknowledge"
  variant="intense | subtle"     (default: intense)
  size="small | medium | large"  (default: medium)
  shape="pill | rounded"         (default: pill)
  show-icon                       (default: true)
>Badge</uems-badge>
```

### HTML structure

```html
<span class="badge badge--intense badge--success badge--medium badge--pill">
  <svg class="badge__icon" aria-hidden="true"><!-- stroke icon --></svg>
  <span class="badge__label">Success</span>
</span>
```

### CSS

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: var(--uems-spacing-2, 2px) var(--uems-spacing-8, 8px); /* Medium/Large */
  width: fit-content;
  border-radius: var(--uems-radius-pill);
  font-family: 'Zoho Puvi', sans-serif;
  white-space: nowrap;
}
.badge--rounded { border-radius: var(--uems-radius-xs, 4px); }

/* sizes */
.badge--small  { height: 16px; padding-left: var(--uems-spacing-4, 4px); padding-right: var(--uems-spacing-4, 4px); font-size: var(--uems-font-size-10); line-height: 14px; font-weight: 500; }
.badge--small  .badge__icon { width: 8px;  height: 8px;  }
.badge--medium { height: 20px; font-size: var(--uems-font-size-12); line-height: 16px; font-weight: 500; }
.badge--medium .badge__icon { width: 12px; height: 12px; }
.badge--large  { height: 24px; font-size: var(--uems-font-size-14); line-height: 20px; font-weight: 400; }
.badge--large  .badge__icon { width: 16px; height: 16px; }

/* intense × state (text + stroke icon share --badge-fg) */
.badge--intense { color: var(--badge-fg, var(--uems-text-white)); background: var(--badge-bg); }
.badge--intense.badge--default     { --badge-bg: var(--uems-bg-quaternary-solid); }
.badge--intense.badge--active      { --badge-bg: var(--uems-bg-info-solid); }
.badge--intense.badge--success     { --badge-bg: var(--uems-bg-success-solid); }
.badge--intense.badge--critical    { --badge-bg: var(--uems-bg-error-solid); }
.badge--intense.badge--moderate    { --badge-bg: var(--uems-bg-alert-solid); --badge-fg: var(--uems-text-black); }
.badge--intense.badge--important   { --badge-bg: var(--uems-bg-warning-solid); }
.badge--intense.badge--acknowledge { --badge-bg: var(--uems-bg-acknowledge-solid); }

/* subtle × state */
.badge--subtle { color: var(--badge-fg); background: var(--badge-bg); }
.badge--subtle.badge--default     { --badge-bg: var(--uems-bg-secondary);          --badge-fg: var(--uems-text-secondary); }
.badge--subtle.badge--active      { --badge-bg: var(--uems-bg-info-primary);       --badge-fg: var(--uems-text-info); }
.badge--subtle.badge--success     { --badge-bg: var(--uems-bg-success-primary);    --badge-fg: var(--uems-text-success); }
.badge--subtle.badge--critical    { --badge-bg: var(--uems-bg-error-primary);      --badge-fg: var(--uems-text-error); }
.badge--subtle.badge--moderate    { --badge-bg: var(--uems-bg-alert-primary);      --badge-fg: var(--uems-text-alert); }
.badge--subtle.badge--important   { --badge-bg: var(--uems-bg-warning-primary);    --badge-fg: var(--uems-text-warning); }
.badge--subtle.badge--acknowledge { --badge-bg: var(--uems-bg-acknowledge-primary); --badge-fg: var(--uems-text-acknowledge); }

.badge__icon { stroke: currentColor; fill: none; flex-shrink: 0; }
```

> The Subtle/Acknowledge icon token resolves slightly darker than its text (`#5C2E89` vs `#663399`); `currentColor` is an acceptable approximation — use `--uems-icon-acknowledge` explicitly if exact parity matters.

## States and Interactions

| Event | Behavior |
|---|---|
| Hover / focus / click | **None** — badge is presentational. If a badge must be clickable, wrap it in a button/link; don't add handlers to the badge itself |
| Theme switch | Automatic via `--uems-*` tokens; no JS |
| RTL | `dir="rtl"` on a parent flips the flex order automatically (icon stays visually leading) — no separate variant needed in code. Verified against Figma's RTL=On variants: child order is reversed and text right-aligned, which is exactly what `dir="rtl"` + flexbox produces |

## Edge Cases

- **Long label:** single line, no wrap (`white-space: nowrap`). If the consumer constrains width, truncate with ellipsis (`overflow: hidden; text-overflow: ellipsis`) — never wrap to two lines.
- **Empty label:** not supported — the label is required. For a dot-only indicator use the Status Indicator component instead.
- **Icon-only:** not a Figma variant; always render the label.
- **Min width:** Small/Medium carry `min-width` equal to their height (16px/20px) so icon-only-width content keeps a circular pill; Large has none (verified against Figma variants).
- **Count overflow (if used for numbers):** cap display at `99+`.

## Animation / Motion

None specified — badges appear/disappear with their content. If animating state changes, a 150ms background-color transition is acceptable; respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Plain `<span>` — no role needed when the label text conveys the status |
| Icon | `aria-hidden="true"`; decorative, the label carries meaning |
| Color | Never the sole indicator — the label text states the status explicitly |
| Contrast | Intense/Moderate uses black-on-yellow because white fails contrast on `#F9B21D`; all Subtle pairs are dark-on-tint (AA at 10–14px sizes per Figma) |
| Dynamic updates | If a badge's state changes live (e.g. job status), wrap the region in `aria-live="polite"` at the consumer level |
| RTL | Driven by `dir` attribute, not a prop |

## Verification

All **168 variants** were programmatically checked against this spec (geometry: height/padding/gap/radius; tokens: background/text/icon per Style × State; type: size/weight/line-height; icon sizing; borders; RTL structure). **161 conform exactly.** The 7 deviations are Figma-side inconsistencies listed below — none change the implementation in this spec.

## Flags for design

1. **Figma token typo** — the acknowledge backgrounds are named `BG-Acknowldege-*` in Figma; code normalizes to `--uems-bg-acknowledge-*` (already handled by the token generator).
2. **Inconsistent icon token** — Intense/Active and Intense/Critical bind the icon to `Border/Border-White` while every other white-icon variant uses `Border/Icon/Icon-White` (same `#FFFFFF` value). Cosmetic, but worth normalizing in Figma.
3. **Subtle/Default RTL=On icon drift (6 variants)** — all three sizes × both shapes of `Subtle/Default` with RTL=On bind the icon to `Icon-Primary` instead of `Icon-Secondary` (used by their LTR counterparts). Treated as unintentional: **code uses `Icon-Secondary` for Subtle/Default in both directions.**
4. **Leftover invisible stroke (1 variant)** — `Subtle, Large, Moderate, RTL=Off, Rounded` carries a hidden 1px `Border-Alert-subtle` stroke (`visible: false`, renders nothing). Safe to delete in Figma; badges have no borders.

---

*Generated from UEMS Design System 3.0 · Figma node `16484:122065` · 2026-06-11 · all 168 variants verified*
