# Handoff Spec: Icon Button

**Figma:** [UEMS — Design System 3.0 · node `16456:29077`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16456-29077) · Component set, **240 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Primitives — [`primitive-colors.md`](../primitive-colors.md) · Consumed by — [`tag.md`](./tag.md) (close button)

---

## Overview

A compact, icon-only button for toolbars, table rows, card headers, and embedded controls (the Tag's close button is this component at `Tertiary Grey / XSmall`). Six visual types from high-emphasis (Primary, Danger) to ghost (Tertiary, Tertiary Grey), two shapes, four sizes, five real interaction states. Icon-only means an accessible name is **mandatory**.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Shape` | Square (default), Circle | 2 |
| `Type` | Primary (default), Secondary, Tertiary, Outline, Danger, Tertiary Grey | 6 |
| `Size` | XL (default), Large, Small, XSmall | 4 |
| `State` | Default, Hover, Active, Focus, Disabled | 5 |

**Total:** 2 × 6 × 4 × 5 = **240 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Icon` | Instance swap | add icon | The icon — slot/prop in code; instance is FIXED-size so swaps can't change button dimensions |

## Layout

```
┌──────────┐
│   icon   │   button: 28 / 24 / 20 / 16px square (HUG with min floor — effectively fixed)
└──────────┘   padding: 4px all sides · icon: 20 / 16 / 12 / 8px FIXED
```

Geometry is exact in Figma (verified: 4 + icon + 4 = dimension on every size — no declared-vs-effective drift):

| Size | Button | Icon | Padding | Square radius | Circle radius |
|---|---|---|---|---|---|
| XL | 28×28 | 20×20 | 4px | 4px (`--uems-radius-xs`) | `--uems-radius-pill` |
| Large | 24×24 | 16×16 | 4px | 4px | pill |
| Small | 20×20 | 12×12 | 4px | 4px | pill |
| XSmall | 16×16 | 8×8 | 4px | 4px | pill |

> ⚠️ XSmall (16px) and Small (20px) are below the 24×24 WCAG 2.2 pointer-target minimum — when used standalone, extend the hit area (e.g. `::before` overlay or margin-compensated padding). Inside dense composites (Tag close, table rows) the parent provides context.

## Design Tokens Used

Hex comments = Light theme. All icons are **stroke-drawn** — color applies to `stroke`. Disabled is a full token swap at 100% opacity (no opacity dimming).

### Type × State matrix

| Type | State | Background | Border | Icon |
|---|---|---|---|---|
| **Primary** | Default | `--uems-bg-button-primary` /* #006AFF */ | — | `--uems-icon-white` |
| | Hover | `--uems-bg-button-primary-hover` /* #1E52BB */ | — | `--uems-icon-white` |
| | Active | `--uems-bg-button-primary-pressed` /* #184091 */ | — | `--uems-icon-white` |
| | Disabled | `--uems-bg-disabled` /* #E1E4EB */ | — | `--uems-icon-disabled` |
| **Secondary** | Default | `--uems-bg-accent-primary-alt` /* #EAF0FC */ | — | `--uems-icon-accent` |
| | Hover | `--uems-bg-accent-primary-hover` /* #D5E0F8 */ | — | `--uems-icon-accent` |
| | Active | `--uems-bg-accent-secondary` /* #D5E0F8 */ | — | `--uems-icon-accent` |
| | Disabled | `--uems-bg-disabled` | — | `--uems-icon-disabled` |
| **Tertiary** | Default | transparent | — | `--uems-icon-accent` |
| | Hover | `--uems-bg-accent-primary-hover` | — | `--uems-icon-accent` |
| | Active | `--uems-bg-accent-secondary` | — | `--uems-icon-accent` |
| | Disabled | transparent | — | `--uems-icon-disabled` |
| **Outline** | Default | `--uems-bg-primary-alt` /* #FFFFFF */ | `--uems-border-secondary` 1px | `--uems-icon-secondary` |
| | Hover | `--uems-bg-accent-primary-hover` | `--uems-border-accent-subtle` 1px | `--uems-icon-accent` |
| | Active | `--uems-bg-accent-secondary` | `--uems-border-accent-secondary` 1px | `--uems-icon-accent` |
| | Disabled | `--uems-bg-disabled` | — (border dropped) | `--uems-icon-disabled` |
| **Danger** | Default | `--uems-bg-error-solid` /* #E42527 */ | — | `--uems-icon-white` |
| | Hover | `--uems-bg-error-solid-hover` /* #C1181B */ | — | `--uems-icon-white` |
| | Active | `--uems-bg-error-solid-pressed` /* #811012 */ | — | `--uems-icon-white` |
| | Disabled | `--uems-bg-disabled` | — | `--uems-icon-disabled` |
| **Tertiary Grey** | Default | transparent | — | `--uems-icon-secondary` |
| | Hover | `--uems-bg-primary-hover` /* #F0F2F5 */ | — | `--uems-icon-secondary` |
| | Active | `--uems-bg-secondary` /* #F0F2F5 */ | — | `--uems-icon-accent-button` /* #006AFF */ |
| | Disabled | transparent | — | `--uems-icon-disabled` |

### Focus (all types)
> **Code deviation (2026-06-11):** focus ring ships with `outline-offset: 2px` (not 0) — design review standardized a 2px gap on every focusable component. Update the Figma focus wrappers to match.


Ring wrapper in Figma: 2px `--uems-border-accent` border, 2px padding, +4px envelope; the button inside keeps its **Default** colors. Ring radius: 6px for Square, pill for Circle. In CSS:

```css
outline: 2px solid var(--uems-border-accent-focus);
outline-offset: 2px;          /* common DS focus ring — 2px gap on every focusable component */
```

## Developer Handoff

### Suggested API

```
<uems-icon-button
  type="primary | secondary | tertiary | outline | danger | tertiary-grey"  (default: primary)
  shape="square | circle"                                                   (default: square)
  size="xl | large | small | xsmall"                                        (default: xl)
  disabled                                                                   (boolean)
  label="..."                                                                (REQUIRED — aria-label)
>
  <svg slot="icon">…</svg>
</uems-icon-button>
```

### HTML structure

```html
<button class="icon-btn icon-btn--primary icon-btn--xl icon-btn--square"
        type="button" aria-label="Add item">
  <svg aria-hidden="true"><!-- stroke icon --></svg>
</button>
```

### CSS

```css
.icon-btn {
  display: inline-grid;
  place-items: center;
  box-sizing: border-box;
  padding: 4px;
  border: none;
  background: var(--ib-bg, transparent);
  color: var(--ib-icon);
  border-radius: var(--uems-radius-xs, 4px);
  cursor: pointer;
}
.icon-btn--circle { border-radius: var(--uems-radius-pill); }
.icon-btn svg { stroke: currentColor; fill: none; display: block; }

/* sizes — fixed dimensions; icon size via SVG width/height attributes */
.icon-btn--xl     { width: 28px; height: 28px; } .icon-btn--xl svg     { width: 20px; height: 20px; }
.icon-btn--large  { width: 24px; height: 24px; } .icon-btn--large svg  { width: 16px; height: 16px; }
.icon-btn--small  { width: 20px; height: 20px; } .icon-btn--small svg  { width: 12px; height: 12px; }
.icon-btn--xsmall { width: 16px; height: 16px; } .icon-btn--xsmall svg { width: 8px;  height: 8px;  }

/* types */
.icon-btn--primary       { --ib-bg: var(--uems-bg-button-primary);     --ib-icon: var(--uems-icon-white); }
.icon-btn--primary:hover { --ib-bg: var(--uems-bg-button-primary-hover); }
.icon-btn--primary:active{ --ib-bg: var(--uems-bg-button-primary-pressed); }

.icon-btn--secondary       { --ib-bg: var(--uems-bg-accent-primary-alt); --ib-icon: var(--uems-icon-accent); }
.icon-btn--secondary:hover { --ib-bg: var(--uems-bg-accent-primary-hover); }
.icon-btn--secondary:active{ --ib-bg: var(--uems-bg-accent-secondary); }

.icon-btn--tertiary       { --ib-icon: var(--uems-icon-accent); }
.icon-btn--tertiary:hover { --ib-bg: var(--uems-bg-accent-primary-hover); }
.icon-btn--tertiary:active{ --ib-bg: var(--uems-bg-accent-secondary); }

.icon-btn--outline        { --ib-bg: var(--uems-bg-primary-alt); --ib-icon: var(--uems-icon-secondary);
                            border: 1px solid var(--uems-border-secondary); }
.icon-btn--outline:hover  { --ib-bg: var(--uems-bg-accent-primary-hover); --ib-icon: var(--uems-icon-accent);
                            border-color: var(--uems-border-accent-subtle); }
.icon-btn--outline:active { --ib-bg: var(--uems-bg-accent-secondary); --ib-icon: var(--uems-icon-accent);
                            border-color: var(--uems-border-accent-secondary); }

.icon-btn--danger        { --ib-bg: var(--uems-bg-error-solid); --ib-icon: var(--uems-icon-white); }
.icon-btn--danger:hover  { --ib-bg: var(--uems-bg-error-solid-hover); }
.icon-btn--danger:active { --ib-bg: var(--uems-bg-error-solid-pressed); }

.icon-btn--tertiary-grey        { --ib-icon: var(--uems-icon-secondary); }
.icon-btn--tertiary-grey:hover  { --ib-bg: var(--uems-bg-primary-hover); }
.icon-btn--tertiary-grey:active { --ib-bg: var(--uems-bg-secondary); --ib-icon: var(--uems-icon-accent-button); }

/* focus — ring, button colors unchanged */
.icon-btn:focus-visible { outline: 2px solid var(--uems-border-accent-focus); outline-offset: 2px; }

/* disabled — token swap, full opacity */
.icon-btn:disabled { --ib-icon: var(--uems-icon-disabled); cursor: not-allowed; pointer-events: none; }
.icon-btn--primary:disabled, .icon-btn--secondary:disabled,
.icon-btn--outline:disabled, .icon-btn--danger:disabled { --ib-bg: var(--uems-bg-disabled); border: none; }
.icon-btn--tertiary:disabled, .icon-btn--tertiary-grey:disabled { --ib-bg: transparent; }
```

## States and Interactions

| State | Trigger | Behavior |
|---|---|---|
| Hover | `:hover` | Background per matrix; Outline also shifts border + icon to accent |
| Active | `:active` | Pressed background one step deeper; Tertiary Grey flips icon to accent |
| Focus | `:focus-visible` | 2px accent ring at the button edge; colors stay Default |
| Disabled | `disabled` attr | Token swap (no opacity), no pointer events, stays in DOM flow |

No loading state exists in Figma — if needed, follow the Button component's loading pattern at the consumer level.

## Edge Cases

- **Icon swap:** icon box is fixed per size — clamp any supplied SVG to the size table; never let the icon resize the button.
- **Missing label:** refuse to render (dev error) or fall back to the icon name — an icon-only button without an accessible name is a defect.
- **Touch targets:** Small/XSmall below 24px — extend hit area when standalone (see Layout note).
- **In composites (Tag, inputs):** parent manages tab order (e.g. Tag uses `tabindex="-1"` + roving focus).

## Animation / Motion

Not specified in Figma. Suggested: 100–150ms ease-out on background/border; none on press (instant feedback). Respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Native `<button type="button">` — never a div |
| Name | `aria-label` required (icon is `aria-hidden="true"`) |
| Keyboard | `Enter`/`Space` activate (native); `:focus-visible` ring as specced |
| Disabled | Native `disabled`; use `aria-disabled="true"` instead when the button must stay focusable for tooltip discovery |
| Toggle use | If it toggles (e.g. favorite), add `aria-pressed` and swap `aria-label` accordingly |
| Contrast | Primary/Danger icon-on-solid pass AA; ghost types rely on icon contrast — `icon-secondary` on white passes; verify on tinted surfaces |
| Targets | WCAG 2.2 2.5.8: extend XSmall/Small hit areas when standalone |

## Verification

All **240 variants** were programmatically checked: geometry (dimensions, 4px padding, fixed icon sizes 20/16/12/8, HUG + min floors — declared padding validated against arithmetic, exact on every size), full Type × State token matrix (bg/border/icon), focus-ring structure (2px accent, 2px pad, +4px envelope, Default colors inside), radius per shape, opacity, and `Icon` swap binding on every variant.

**2026-06-11: 240/240 conform.** The original audit found 224/240, with 20 token deviations + 2 radius oddities (the flags below, plus 4 Tertiary Grey Square Focus icons on `Icon-Tertiary` found on re-verification). All were fixed in Figma and re-verified — the matrix above is now exact on every variant.

## Flags for design — all resolved in Figma (2026-06-11)

1. ~~**Outline loses its border on Focus (8 variants)**~~ — all 8 Outline Focus inners had dropped the 1px `Border-Secondary`. **Fixed:** border restored (1px `Border-Secondary`, inside), matching the spec and the code.
2. ~~**Tertiary Grey icon color differs by shape (8+4 variants)**~~ — Circle Default/Hover used `Icon-Tertiary` (and Square/Circle Focus had drifted too). **Fixed:** all non-Active, non-Disabled states now use `Icon-Secondary` on both shapes, matching the code's standardization. Note: the Tag's close button embeds Circle — its icon shifts from `Icon-Tertiary` to `Icon-Secondary`; tag.md's rendering note may need a refresh.
3. ~~**Primary/XL radius drift (2 variants)**~~ — Square Primary XL Active and Focus-inner used radius 6. **Fixed:** radius 4; all 120 Square variants verified at 4.
4. ~~**Description vs drawing**~~ — **Fixed:** component description updated from "Square (radius 4/6)" to "Square (radius 4)".

---

*Generated from UEMS Design System 3.0 · Figma node `16456:29077` · 2026-06-11 · all 240 variants + property wiring verified*
