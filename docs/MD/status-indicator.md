# Handoff Spec: Status Indicator

**Figma:** [UEMS — Design System 3.0 · node `16447:1049`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16447-1049) · Component set, **45 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Primitives — [`primitive-colors.md`](../primitive-colors.md) · Sibling — [`badge.md`](./badge.md)

---

## Overview

A compact dot-plus-label indicator for system states, health conditions, and operational statuses — table cells, device lists, monitoring dashboards, activity timelines. Unlike Badge (a filled label), the Status Indicator is a colored **dot** with neutral-colored text beside it. It has a real **hover** state (tinted background) for use in interactive rows, and a **disabled** state via token swaps.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Status` | Neutral (default), Success, Warning, Critical, Info | 5 |
| `Size` | Small (default), Medium, Large | 3 |
| `State` | Default, Hover, Disabled | 3 |

**Total:** 5 × 3 × 3 = **45 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Label` | Text | `"Status"` | Label text |
| `Show Label` | Boolean | `true` | `false` → dot-only indicator |
| `Show Icon` | Boolean | `false` | `true` → an icon **replaces** the dot (intent — but see flag 6: Figma only shows the icon, it doesn't hide the dot; code must enforce the swap) |
| `Icon` | Instance swap | check icon | Icon slot (stroke-drawn, colored `--uems-icon-primary` — not status-colored) |

## Layout

```
┌────────────────────┐
│ ● gap-4 Label      │   padding: 4px all sides (--uems-spacing-4)
└────────────────────┘   radius: 6px (--uems-radius-default)
  width/height: hug content
```

Container hugs on both axes — declared padding is effective (verified: 14+8=22, 16+8=24, 20+8=28). Dot and label are vertically centered.

### Size metrics

| Size | Container height | Padding | Gap | Dot | Icon (when shown) | Font (Zoho Puvi) |
|---|---|---|---|---|---|---|
| Small | 22px | 4px | 4px | **6×6** | 12×12 | 10px / 14px line-height, **Medium** |
| Medium | 24px | 4px | 4px | **6×6** | 14×14 | 12px / 16px line-height, Regular |
| Large | 28px | 4px | 4px | **8×8** | 16×16 | 14px / 20px line-height, Regular |

> ⚠️ The Figma description claims 8/10/12px dots — the actual drawn dots are **6/6/8px** (Small and Medium share the same dot). Spec follows the drawn values; see flag 1.

## Design Tokens Used

Label is `--uems-text-secondary` for **all** statuses (the dot carries the color, not the text). Hex comments = Light theme.

### Dot fill per Status × State

| Status | Default & Hover dot | Disabled dot |
|---|---|---|
| Neutral | `--uems-bg-quaternary-solid` /* #5F6C89 */ | `--uems-bg-disabled` /* #E1E4EB */ |
| Success | `--uems-bg-success-solid` /* #0C8844 */ | `--uems-bg-success-secondary` /* #CEE7DA */ |
| Warning | `--uems-bg-warning-solid` /* #E65100 */ | `--uems-bg-warning-secondary` /* #FFDECC */ |
| Critical | `--uems-text-error` /* #C1181B — see flag 3 */ | `--uems-bg-error-secondary` /* #FAD7D8 */ |
| Info | `--uems-bg-info-solid` /* #2C66DD */ | `--uems-bg-info-secondary` /* #D5E0F8 */ |

### Container background (Hover only; Default/Disabled have no fill)

| Status | Hover background |
|---|---|
| Neutral | `--uems-bg-secondary` /* #F0F2F5 */ |
| Success | `--uems-bg-success-primary` /* #E7F3ED */ |
| Warning | `--uems-bg-warning-primary` /* #FFEEE5 */ |
| Critical | `--uems-bg-error-primary` /* #FDEBEB */ |
| Info | `--uems-bg-accent-primary` /* #EAF0FC — see flag 4 */ |

### Label

| State | Color |
|---|---|
| Default, Hover | `--uems-text-secondary` /* #2A303D */ |
| Disabled | `--uems-text-disabled` /* #8893AD */ |

> Disabled is a **token swap**, not an opacity change — the Figma description's "50% opacity" is stale (see flag 2).

## Developer Handoff

### Suggested API

```
<uems-status-indicator
  status="neutral | success | warning | critical | info"   (default: neutral)
  size="small | medium | large"                            (default: small)
  disabled                                                  (boolean)
  show-label                                                (default: true)
  hoverable                                                 (opt-in hover tint)
>Online</uems-status-indicator>
<!-- optional icon slot replaces the dot -->
```

### HTML structure

```html
<span class="status-indicator status-indicator--success status-indicator--medium">
  <span class="status-indicator__dot" aria-hidden="true"></span>
  <span class="status-indicator__label">Healthy</span>
</span>
```

### CSS

```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  width: fit-content;
  border-radius: var(--uems-radius-default, 6px);
  font-family: 'Zoho Puvi', sans-serif;
  color: var(--uems-text-secondary);
  white-space: nowrap;
}
.status-indicator__dot {
  border-radius: var(--uems-radius-pill);
  background: var(--si-dot);
  flex-shrink: 0;
}

/* sizes */
.status-indicator--small  { font-size: var(--uems-font-size-10); line-height: 14px; font-weight: 500; }
.status-indicator--small  .status-indicator__dot { width: 6px; height: 6px; }
.status-indicator--medium { font-size: var(--uems-font-size-12); line-height: 16px; font-weight: 400; }
.status-indicator--medium .status-indicator__dot { width: 6px; height: 6px; }
.status-indicator--large  { font-size: var(--uems-font-size-14); line-height: 20px; font-weight: 400; }
.status-indicator--large  .status-indicator__dot { width: 8px; height: 8px; }

/* status (dot + hover tint) */
.status-indicator--neutral  { --si-dot: var(--uems-bg-quaternary-solid); --si-hover: var(--uems-bg-secondary); }
.status-indicator--success  { --si-dot: var(--uems-bg-success-solid);    --si-hover: var(--uems-bg-success-primary); }
.status-indicator--warning  { --si-dot: var(--uems-bg-warning-solid);    --si-hover: var(--uems-bg-warning-primary); }
.status-indicator--critical { --si-dot: var(--uems-text-error);          --si-hover: var(--uems-bg-error-primary); }
.status-indicator--info     { --si-dot: var(--uems-bg-info-solid);       --si-hover: var(--uems-bg-accent-primary); }

/* hover — only when the consumer opts in (interactive contexts) */
.status-indicator--hoverable:hover { background: var(--si-hover); }

/* disabled — token swap, NOT opacity */
.status-indicator--disabled { color: var(--uems-text-disabled); }
.status-indicator--disabled.status-indicator--neutral  { --si-dot: var(--uems-bg-disabled); }
.status-indicator--disabled.status-indicator--success  { --si-dot: var(--uems-bg-success-secondary); }
.status-indicator--disabled.status-indicator--warning  { --si-dot: var(--uems-bg-warning-secondary); }
.status-indicator--disabled.status-indicator--critical { --si-dot: var(--uems-bg-error-secondary); }
.status-indicator--disabled.status-indicator--info     { --si-dot: var(--uems-bg-info-secondary); }

/* icon mode — icon replaces the dot */
.status-indicator__icon { stroke: var(--uems-icon-primary); fill: none; flex-shrink: 0; }
.status-indicator--small  .status-indicator__icon { width: 12px; height: 12px; }
.status-indicator--medium .status-indicator__icon { width: 14px; height: 14px; }
.status-indicator--large  .status-indicator__icon { width: 16px; height: 16px; }
```

## States and Interactions

| State | Trigger | Behavior |
|---|---|---|
| Default | — | Dot + label, transparent container |
| Hover | Pointer over an **interactive** indicator (or its row) | Status-tinted container background, 6px radius; dot/label colors unchanged |
| Disabled | `disabled` prop | Dot drops to the status Secondary tint, label to `--uems-text-disabled`; no opacity, no hover |
| Dot-only | `show-label=false` | Dot alone — must carry an accessible label (see Accessibility) |
| Icon mode | icon slot provided | Icon replaces the dot at 12/14/16px, colored `--uems-icon-primary` |

The indicator itself is **not** focusable or clickable; the hover tint exists for list/table rows where the row is the interactive element. Apply `--hoverable` only in those contexts.

## Edge Cases

- **Long label:** single line, `white-space: nowrap`; truncate with ellipsis if the consumer constrains width.
- **Dot-only:** container still keeps 4px padding (14/14/16px total) — comfortable hit area for tooltips.
- **Theme switch:** automatic via tokens; all five statuses verified in the generated token files.
- **Live status flips:** see Accessibility (`aria-live`).

## Animation / Motion

None specified in Figma. If status changes animate, a 150ms background/color transition is acceptable; respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Plain `<span>`; label text conveys meaning |
| Dot/icon | `aria-hidden="true"` — decorative |
| Dot-only mode | Required: `aria-label` (or visually-hidden text) on the container, plus a tooltip for sighted users |
| Color | Never the sole indicator when label is shown; in dot-only mode the accessible name carries the status |
| Disabled | Communicate via text/`aria-disabled` at the consumer level — the indicator is not a control |
| Live updates | Wrap dynamic status regions in `aria-live="polite"` |
| Contrast | The dot is a non-text indicator (3:1 target): all Default dots pass on white; disabled dots are intentionally faint and rely on the label |

## Verification

All **45 variants** were programmatically checked against this spec — geometry (4px padding/gap, 6px radius, HUG axes, container heights 22/24/28), dot size and fill token per Status × State, hover container background, label color/size/weight/line-height/family, icon child sizing and default visibility, absence of borders, and full opacity. **45/45 conform — zero deviations.** Property wiring was also inspected: `Show Label` → label visibility, `Show Icon` → icon visibility, `Label` → text, `Icon` → instance swap; the dot has **no** visibility binding (flag 6). Declared padding was validated against hug-axis arithmetic (no Badge-style fixed-height conflict).

## Flags for design

1. **Stale description — dot sizes:** Figma description says 8/10/12px dots; the drawn components use **6/6/8px**. Either update the drawing or the description; code follows the drawing.
2. **Stale description — disabled:** description says "50% opacity"; the components actually swap to Secondary-tint dot + `Text-Disabled` label with full opacity. Code follows the components.
3. **Critical dot token:** bound to `Text/Text-Error` (#C1181B) — a text token used as a fill, and a darker red than Badge's critical `BG-Error-Solid` (#E42527). Consider rebinding to a BG token for consistency.
4. **Info hover tint:** uses `BG-Accent-Primary` while every other status uses its own `*-Primary`. Identical in Light theme (both cobalt-25), but in the Green themes accent goes **fern/green** while `BG-Info-Primary` stays cobalt — Info's hover would turn green. Likely unintended; code follows Figma, flag for a decision.
5. **Small label weight:** drawn as Medium (500), description says Regular — code follows the drawing.
6. **`Show Icon` doesn't hide the dot:** the dot's visibility is bound to nothing, so enabling `Show Icon` in Figma renders dot + icon side by side — contradicting the documented "replace dot with icon" behavior. **Code enforces the swap** (icon present → dot not rendered); Figma should bind the dot's visibility or document the dual rendering.

---

*Generated from UEMS Design System 3.0 · Figma node `16447:1049` · 2026-06-11 · all 45 variants + property wiring verified*
