# Handoff Spec: Progress Bar

**Figma:** [UEMS — Design System 3.0 · node `17012:973360`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17012-973360) · Component set, **126 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Typography — [`typography-tokens.md`](../typography-tokens.md)

---

## Overview

A linear determinate/indeterminate progress indicator with an optional label row (label left, percentage right). Three track heights, four semantic colorways plus an Indeterminate mode, and a Disabled state. Purely presentational — no pointer interaction.

## Variants

| Axis | Values | Count |
|---|---|---:|
| `Size` | Small (default, 4px track), Medium (6px), Large (8px) | 3 |
| `Variant` | Default (default), Success, Warning, Error, Indeterminate | 5 |
| `State` | Default, Disabled | 2 |
| `Fill%` | 0 (default), 25, 50, 75, 100 — `N/A` for Indeterminate | 5 / 1 |

**Total:** 3 × (4 × 2 × 5 + 1 × 2) = **126 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Label` | Text | "Progress" | Label text (left) |
| `Progress` | Text | "25%" | Percentage text (right); hardcoded `—` in Indeterminate |
| `Show Label` | Boolean | ON | Toggles the entire label row |

## Layout

```
Progress                       25%   ← label row: 14px tall, label left / % right
▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱       ← track: full width, pill radius
```

| | Small | Medium | Large |
|---|---|---|---|
| Track / fill height | 4px | 6px | 8px |
| Gap label row → track | 4px (`--uems-spacing-4`) | 6px | 8px (`--uems-spacing-8`) |
| Radius (track & fill) | pill (`--uems-radius-pill`) | pill | pill |
| Label row text (both texts) | 10/14 `Text/xsmall/Medium` (`--uems-type-body-xsmall-default-*`) | 12/16 `Text/small/Medium` (`--uems-type-body-small-medium-*`) | 14/20 `Text/Default/Medium` (`--uems-type-body-default-medium-*`) |

- Reference width in Figma is 280px; in code the track is **width: 100%** of its container, fill is percentage-driven
- Label row typography **scales with size** (10/12/14px) — always **Medium weight (500)**, always token-bound
- Vertical auto-layout; the label-row gap scales with size (4/6/8)

### Fill% → width mapping (verified)

| Fill% | Fill width | Note |
|---|---|---|
| 0 | 2px sliver in Figma ⚠ | flag 2 — code renders **0** (nothing) |
| 25 / 50 / 75 / 100 | exactly 25% / 50% / 75% / 100% | left-anchored (x:0) |
| Indeterminate | segment at **x 15%, width ~33%** of track | static keyframe of the animation |

## Design Tokens Used

Hex comments = Light theme. All fills are token-bound — one exact signature per Variant × State across all 126 variants (zero drift).

| Variant | State | Track | Fill | Label | Progress % |
|---|---|---|---|---|---|
| **Default** | Default | `--uems-bg-info-secondary` /* #D5E0F8 */ | `--uems-bg-button-primary` /* #006AFF */ | `--uems-text-primary` | `--uems-text-accent-primary` /* #0E2553 */ |
| **Success** | Default | `--uems-bg-success-secondary` /* #CEE7DA */ | `--uems-bg-success-solid` /* #0C8844 */ | `--uems-text-primary` | `--uems-text-success` |
| **Warning** | Default | `--uems-bg-warning-secondary` /* #FFDECC */ | `--uems-bg-warning-solid` /* #E65100 */ | `--uems-text-primary` | `--uems-text-warning` |
| **Error** | Default | `--uems-bg-error-secondary` /* #FAD7D8 */ | `--uems-bg-error-solid` /* #E42527 */ | `--uems-text-primary` | `--uems-text-error` |
| **Indeterminate** | Default | as Default variant | as Default variant | `--uems-text-primary` | `—` literal, `--uems-text-accent-primary` |
| **Any** | Disabled | `--uems-bg-disabled-subtle` | `--uems-bg-disabled` | `--uems-text-disabled` | `--uems-text-disabled` |

> ⚠ Disabled variants also carry **50% layer opacity on top of the disabled tokens** in Figma (all 63 disabled variants) — same double-dimming pattern flagged on Breadcrumb (flag 1). Code uses tokens only.

## Developer Handoff

### Suggested API

```
<uems-progress-bar
  value="0–100"                       (omit → indeterminate)
  size="small | medium | large"       (default: small)
  variant="default | success | warning | error"  (default: default)
  label="Progress"                    (omit → no label row)
  show-value                          (boolean — shows % / —)
  disabled
></uems-progress-bar>
```

### HTML structure

```html
<div class="progress progress--small progress--default">
  <div class="progress__row">
    <span class="progress__label" id="pb-label">Progress</span>
    <span class="progress__value">25%</span>
  </div>
  <div class="progress__track" role="progressbar" aria-labelledby="pb-label"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="25">
    <div class="progress__fill" style="width: 25%"></div>
  </div>
</div>
```

### CSS

```css
.progress { display: flex; flex-direction: column; width: 100%; }
.progress--small  { gap: var(--uems-spacing-4); --pb-h: 4px; }
.progress--medium { gap: 6px;                   --pb-h: 6px; }
.progress--large  { gap: var(--uems-spacing-8); --pb-h: 8px; }

.progress__row { display: flex; justify-content: space-between; align-items: center;
  font-family: var(--uems-font-family);
  font-weight: var(--uems-font-weight-medium);   /* 500 — all sizes */
}
/* label text scales with size */
.progress--small  .progress__row { font-size: var(--uems-type-body-xsmall-default-size);  line-height: var(--uems-type-body-xsmall-default-line-height); }  /* 10/14 */
.progress--medium .progress__row { font-size: var(--uems-type-body-small-medium-size);    line-height: var(--uems-type-body-small-medium-line-height); }    /* 12/16 */
.progress--large  .progress__row { font-size: var(--uems-type-body-default-medium-size);  line-height: var(--uems-type-body-default-medium-line-height); }  /* 14/20 */
.progress__label { color: var(--uems-text-primary); }

.progress__track {
  height: var(--pb-h);
  background: var(--pb-track);
  border-radius: var(--uems-radius-pill);
  overflow: hidden;                  /* keeps the fill's leading edge pill-clipped */
}
.progress__fill {
  height: 100%;
  background: var(--pb-fill);
  border-radius: var(--uems-radius-pill);
  transition: width 200ms ease-out;
}

/* variants */
.progress--default { --pb-track: var(--uems-bg-info-secondary);    --pb-fill: var(--uems-bg-button-primary);  }
.progress--default .progress__value { color: var(--uems-text-accent-primary); }
.progress--success { --pb-track: var(--uems-bg-success-secondary); --pb-fill: var(--uems-bg-success-solid); }
.progress--success .progress__value { color: var(--uems-text-success); }
.progress--warning { --pb-track: var(--uems-bg-warning-secondary); --pb-fill: var(--uems-bg-warning-solid); }
.progress--warning .progress__value { color: var(--uems-text-warning); }
.progress--error   { --pb-track: var(--uems-bg-error-secondary);   --pb-fill: var(--uems-bg-error-solid);   }
.progress--error   .progress__value { color: var(--uems-text-error); }

/* disabled — token swap only, no opacity (flag 1) */
.progress--disabled { --pb-track: var(--uems-bg-disabled-subtle); --pb-fill: var(--uems-bg-disabled); }
.progress--disabled .progress__label, .progress--disabled .progress__value { color: var(--uems-text-disabled); }

/* indeterminate — 33%-wide segment sliding; Figma's static frame = x 15% */
.progress--indeterminate .progress__fill { width: 33%; animation: pb-slide 1.2s linear infinite; }
@keyframes pb-slide {
  from { transform: translateX(-100%); }
  to   { transform: translateX(303%); }   /* 100/33 ≈ off the right edge */
}
@media (prefers-reduced-motion: reduce) {
  .progress--indeterminate .progress__fill { animation-duration: 3s; }
}
```

## States and Interactions

| State | Behavior |
|---|---|
| Determinate | `width` follows `value`; animate width changes 200ms ease-out (suggested) |
| Indeterminate | Sliding segment loop; percentage text shows `—` |
| Disabled | Token swap to disabled colors; animation paused for indeterminate |
| Hover/Focus | None — non-interactive; never focusable |

## Responsive Behavior

| Constraint | Behavior |
|---|---|
| Any width | Track fills container (Figma's 280px is a reference, not a constraint) |
| Very narrow | Label row may collide — truncate the label with ellipsis, never the value |

## Edge Cases

- **value = 0** — render no fill (Figma's 2px sliver is a tooling artifact, flag 2)
- **value out of range** — clamp to [0, 100]; never overflow the pill
- **1–2%** — fill narrower than its pill radius renders as a dot; acceptable, `overflow: hidden` on the track keeps it clean
- **Unknown duration** — use indeterminate rather than faking progress
- **Label without value** — `show-value` off: label row keeps the label only

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Fill width | `value` change | width transition | 200ms (suggested — not in Figma) | ease-out |
| Indeterminate segment | continuous | 33% segment slides left→right, loops | 1.2s (suggested) | linear |

Respect `prefers-reduced-motion`: slow the indeterminate loop (or swap to a pulsing opacity); skip the width transition.

## Accessibility

| Concern | Guidance |
|---|---|
| Role | `role="progressbar"` on the track |
| Values | `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow={value}`; **omit `aria-valuenow` entirely when indeterminate** |
| Name | `aria-labelledby` the visible label, or `aria-label` when the row is hidden |
| Announcements | For long operations, pair with a polite live region announcing milestones — don't announce every 1% |
| Color | Variant color is supplementary — the label/value text carries meaning; don't rely on track color alone |
| Contrast | Track-vs-fill is a non-text contrast pair (WCAG 1.4.11 ≥ 3:1): #006AFF on #D5E0F8 ✓ |
| Disabled | `aria-disabled="true"` if the underlying task is paused/blocked |

## Verification

All **126 variants** were programmatically scanned (Desktop Bridge): token bindings on track/fill/label/value per variant, geometry (track heights 4/6/8, pill radii, label-row gap 4/6/8, 280px reference width), Fill%→width ratios (exact 25/50/75/100, left-anchored), indeterminate segment placement (x 15%, ~33% width), per-size typography, and layer opacity. **One signature per Variant × State — zero token drift.** The two flags below are systematic, not scattered.

Re-verified 2026-06-12 against every claim per variant: the original spec wrongly stated 10/14 typography for all sizes (sampled from a Small variant); corrected to the per-size scale 10/14 / 12/16 / 14/20 above. All other claims confirmed exact on all 126 variants.

## Flags for design

1. **Disabled double-dimming (63 variants)** — disabled tokens (`BG-Disabled_subtle`/`BG-Disabled`/`Text-Disabled`) *plus* 50% layer opacity. Same pattern as Breadcrumb flag 2; Icon Button (the system reference) uses token-swap only. Code uses tokens only — pick one mechanism in Figma.
2. **Fill%=0 draws a 2px sliver** — Figma can't render a 0-width frame; code treats 0 as no fill.

---

*Generated from UEMS Design System 3.0 · Figma node `17012:973360` · 2026-06-12 · all 126 variants programmatically verified*
