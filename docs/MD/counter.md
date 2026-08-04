# Handoff Spec: Counter

**Figma:** [UEMS — Design System 3.0 · node `16445:468`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16445-468) · Component set, **42 variants**

**Related:** Badge handoff — [`badge.md`](./badge.md) · Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Primitives — [`primitive-colors.md`](../primitive-colors.md)

---

## Overview

A small, **non-interactive** numeric indicator — unread counts, item totals, notification numbers — rendered as a circle for 1-digit values that stretches into a pill for multi-digit values. Same semantic state palette as Badge (Default, Active, Success, Critical, Moderate, Important, Acknowledge) with Intense/Subtle emphasis. No icon, no RTL axis (numerals don't mirror), no shape axis (always pill).

> The Figma `State` axis is **semantic status**, not interaction state — a counter never has hover/pressed styles.

## Variants

| Axis | Values (default first) | Count |
|---|---|------:|
| `Style` | **Subtle**, Intense | 2 |
| `Size` | **Small**, Medium, Large | 3 |
| `State` | **Active**, Critical, Moderate, Important, Success, Default, Acknowledge | 7 |

**Total:** 2 × 3 × 7 = **42 variants** — note the defaults differ from Badge (Counter defaults: Subtle / Small / Active).

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Number` | Text | `"5"` | The displayed count |

## Layout

```
single digit            multi digit
   ┌────┐               ┌────────┐
   │ 5  │ circle        │  120   │ pill — width hugs content
   └────┘               └────────┘
height fixed per size · min-width = height (guarantees the circle)
content centered both axes · border-radius: pill
```

### Size metrics (uniform across all styles/states — verified on all 42 variants)

| Size | Height | Min-width | Padding (V × H) | Font (Zoho Puvi) |
|---|---|---|---|---|
| Small | 16px | 16px | 4px × 4px | 10px / 14px line-height, Medium |
| Medium | 20px | 20px | 4px × 4px | 12px / 16px line-height, Medium |
| Large | 24px | 24px | 4px × **8px** | 14px / 20px line-height, **Regular** |

> Large doubles the horizontal padding (8px) and drops to Regular weight — same weight rule as Badge Large. Font sizes map to `--uems-font-size-10/12/14`.

## Design Tokens Used

Hex comments show **Light theme** resolution (verified). All tokens adapt across the five themes automatically.

### Intense (solid) — identical palette to Badge Intense

| State | Background | Text |
|---|---|---|
| Default | `--uems-bg-quaternary-solid` /* #5F6C89 */ | `--uems-text-white` |
| Active | `--uems-bg-info-solid` /* #2C66DD */ | `--uems-text-white` |
| Success | `--uems-bg-success-solid` /* #0C8844 */ | `--uems-text-white` |
| Critical | `--uems-bg-error-solid` /* #E42527 */ | `--uems-text-white` |
| Moderate | `--uems-bg-alert-solid` /* #F9B21D */ | `--uems-text-black` |
| Important | `--uems-bg-warning-solid` /* #E65100 */ | `--uems-text-white` |
| Acknowledge | `--uems-bg-acknowledge-solid` /* #663399 */ | `--uems-text-white` |

> Moderate (yellow) uses black text for contrast — same rule as Badge.

### Subtle (tinted)

| State | Background | Text |
|---|---|---|
| Default | `--uems-bg-secondary` /* #F0F2F5 */ | `--uems-text-secondary` /* #2A303D */ |
| Active | `--uems-bg-info-secondary` /* #D5E0F8 */ | `--uems-text-accent-tertiary` /* #1E52BB */ |
| Success | `--uems-bg-success-primary` /* #E7F3ED */ | `--uems-text-success` /* #0A7138 */ |
| Critical | `--uems-bg-error-primary` /* #FDEBEB */ | `--uems-text-error` /* #C1181B */ |
| Moderate | `--uems-bg-alert-primary` /* #FEF8EB */ | `--uems-text-alert` /* #956B11 */ |
| Important | `--uems-bg-warning-primary` /* #FFEEE5 */ | `--uems-text-warning` /* #BC4200 */ |
| Acknowledge | `--uems-bg-acknowledge-primary` /* #F1EAF8 */ | `--uems-text-acknowledge` /* #663399 */ |

> ⚠️ **Subtle/Active intentionally differs from Badge:** Counter uses the stronger `BG-Info-Secondary` tint with `Text-Accent-Tertiary`, while Badge Subtle/Active uses `BG-Info-Primary` + `Text-Info`. Implement exactly as specified per component; don't share this pair.

## Developer Handoff

### Suggested API

```
<uems-counter
  value="5"                       (number | string — required)
  state="active | critical | moderate | important | success | default | acknowledge"
                                  (default: active)
  variant="subtle | intense"      (default: subtle)
  size="small | medium | large"   (default: small)
  max="99"                        (optional overflow cap → renders "99+")
></uems-counter>
```

### HTML structure

```html
<span class="counter counter--subtle counter--active counter--small">5</span>
```

### CSS

```css
.counter {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: var(--uems-radius-pill);
  font-family: 'Zoho Puvi', sans-serif;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  background: var(--counter-bg);
  color: var(--counter-fg);
}

/* sizes — min-width keeps single digits circular */
.counter--small  { height: 16px; min-width: 16px; padding: 4px 4px; font-size: var(--uems-font-size-10); line-height: 14px; font-weight: 500; }
.counter--medium { height: 20px; min-width: 20px; padding: 4px 4px; font-size: var(--uems-font-size-12); line-height: 16px; font-weight: 500; }
.counter--large  { height: 24px; min-width: 24px; padding: 4px 8px; font-size: var(--uems-font-size-14); line-height: 20px; font-weight: 400; }

/* intense × state */
.counter--intense { --counter-fg: var(--uems-text-white); }
.counter--intense.counter--default     { --counter-bg: var(--uems-bg-quaternary-solid); }
.counter--intense.counter--active      { --counter-bg: var(--uems-bg-info-solid); }
.counter--intense.counter--success     { --counter-bg: var(--uems-bg-success-solid); }
.counter--intense.counter--critical    { --counter-bg: var(--uems-bg-error-solid); }
.counter--intense.counter--moderate    { --counter-bg: var(--uems-bg-alert-solid); --counter-fg: var(--uems-text-black); }
.counter--intense.counter--important   { --counter-bg: var(--uems-bg-warning-solid); }
.counter--intense.counter--acknowledge { --counter-bg: var(--uems-bg-acknowledge-solid); }

/* subtle × state */
.counter--subtle.counter--default     { --counter-bg: var(--uems-bg-secondary);           --counter-fg: var(--uems-text-secondary); }
.counter--subtle.counter--active      { --counter-bg: var(--uems-bg-info-secondary);      --counter-fg: var(--uems-text-accent-tertiary); }
.counter--subtle.counter--success     { --counter-bg: var(--uems-bg-success-primary);     --counter-fg: var(--uems-text-success); }
.counter--subtle.counter--critical    { --counter-bg: var(--uems-bg-error-primary);       --counter-fg: var(--uems-text-error); }
.counter--subtle.counter--moderate    { --counter-bg: var(--uems-bg-alert-primary);       --counter-fg: var(--uems-text-alert); }
.counter--subtle.counter--important   { --counter-bg: var(--uems-bg-warning-primary);     --counter-fg: var(--uems-text-warning); }
.counter--subtle.counter--acknowledge { --counter-bg: var(--uems-bg-acknowledge-primary); --counter-fg: var(--uems-text-acknowledge); }
```

> `tabular-nums` keeps widths stable as counts tick (9 → 10 → 11) so adjacent layout doesn't jitter.

## States and Interactions

| Event | Behavior |
|---|---|
| Hover / focus / click | **None** — purely presentational. If clickable (e.g. "open notifications"), the wrapping button owns the interaction |
| Theme switch | Automatic via `--uems-*` tokens |
| RTL | No mirroring — numerals render identically; `dir` has no effect on a single number |

## Edge Cases

- **Zero:** hide the counter by default when the count is 0 (consumer decision; provide a `show-zero` escape hatch if needed).
- **Overflow:** cap at a consumer-set `max` (typically 99) and render `99+`; the pill stretches via `width: fit-content`, never truncate a number with ellipsis.
- **Very large values:** with `max` unset, the pill grows unbounded — recommend always setting `max`.
- **Non-numeric content:** not supported — use Badge for text labels.
- **Single digit:** `min-width: height` guarantees a perfect circle (matches Figma's 16/20/24 min-widths).

## Animation / Motion

None specified in Figma. If animating count changes, a 150ms scale-pulse (1 → 1.1 → 1) on value change is acceptable; respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Plain `<span>`; the number alone is meaningless to screen readers — the **consumer** must provide context, e.g. `aria-label="5 unread messages"` on the wrapping control |
| Hidden duplication | If the visible number is already announced via the wrapper's label, set `aria-hidden="true"` on the counter itself |
| Live updates | For counts that change while the user is on the page, wrap in `aria-live="polite"` (announce) or leave silent (badge-style) — decide per use case, default silent |
| Overflow | When rendering `99+`, the accessible label should state the real count if known ("142 unread messages"), not "ninety-nine plus" |
| Color | Never the sole differentiator between states — counters are usually accompanied by context (tab name, icon); verify at the consumer level |
| Contrast | Intense/Moderate is black-on-yellow (white fails on `#F9B21D`); Subtle pairs are dark-on-tint |

## Verification

All **42 variants** were programmatically asserted against this spec — height, min-width, padding, pill radius, hug sizing, background/text tokens, font size/weight/line-height, center alignment, child structure (exactly one text node), and absence of visible borders. **42/42 pass with zero deviations.**

Multi-digit behavior was verified empirically by instantiating the component and varying the `Number` prop (instance removed after measurement):

| Value | Rendered size | Confirms |
|---|---|---|
| `5` | 16 × 16 | perfect circle at min-width |
| `99` | 21 × 16 | pill begins stretching |
| `120` | 25 × 16 | width hugs content |
| `99+` | 26 × 16 | overflow string renders fine |

Height stays fixed; only width grows — exactly the `min-width` + `fit-content` model in the CSS above. Cosmetic Figma-side findings:

## Flags for design

1. **Leftover invisible border (3 variants)** — all sizes of `Subtle/Active` carry a hidden 1px `Border-Accent-Disabled` stroke (`visible: false`, renders nothing). Safe to delete; counters have no borders.
2. **Subtle/Active palette diverges from Badge** — `BG-Info-Secondary` + `Text-Accent-Tertiary` here vs Badge's `BG-Info-Primary` + `Text-Info`. Documented as intentional (stronger tint reads better at counter sizes); confirm, or align the two components.
3. **Figma token typo** — `BG-Acknowldege-*` (same as Badge); code normalizes to `--uems-bg-acknowledge-*`.

---

*Generated from UEMS Design System 3.0 · Figma node `16445:468` · 2026-06-11 · all 42 variants verified*
