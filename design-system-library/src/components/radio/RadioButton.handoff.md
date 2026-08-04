# Handoff Spec: Radio Button

> Source: Figma — UEMS Design System 3.0 · [Radio Button component set](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=15771-12260)
> Node: `15771:12260` · **80 variants** = Size (4) × State (5) × Selected (2) × RTL (2)
> Target: framework-agnostic custom element `<ds-radio>` + group wrapper `<ds-radio-group>`.

---

## Overview

A **Radio Button** is a single selectable option in a mutually-exclusive set: a circular control + a text label on one baseline row. Exactly one option in a group may be selected. It is **stateful + interactive** — selection is driven by the user (click on control or label) and coordinated by its group (only one selected at a time, arrow-key roving focus).

**Figma variant axes**

- **Size**: `S | M | L | Mobile`
- **State**: `Default | Hover | Focused | Disabled | Error`
- **Selected**: `Unselected | Selected`
- **RTL**: `False | True`

---

## Anatomy

```
LTR:  (◯) Radio label            Selected:  (⦿) Radio label
       └ control  └ label                    └ filled control + inner dot
       └─ gap 8 (Mobile: 12) ─┘

RTL:  Radio label (◯)            — control on the right, row reversed
```

| # | Part | Notes |
|---|------|-------|
| 1 | **root** | Horizontal row, `items: center`, gap between control & label. Whole row is the hit area. |
| 2 | **Radio-Control** | The circle. Unselected = ring only; Selected = solid fill + centered white inner dot. Size varies by `Size`. |
| 3 | **Label** | `Radio label` text. `Text-Primary`; single line (`white-space: nowrap`, `word-break: break-word`). |
| 4 | **Help Icon** *(optional)* | 16/20/24px info icon after the label — instance prop `Show Help Icon`, off by default. |

---

## Layout & Sizing (per Size)

| Size | Control | Label type | Gap (control↔label) | Row | Focus footprint |
|------|---------|------------|---------------------|-----|-----------------|
| **S** | **16 × 16** | `body/Default/Regular` 14 / 20 | `spacing/8` = 8 | hug (20) | control grows 16 → ~24 |
| **M** | **20 × 20** | `body/Default/Regular` 14 / 20 | `spacing/8` = 8 | hug (20) | control grows 20 → ~28 |
| **L** | **24 × 24** | `body/Large/Regular` 16 / 24 | `spacing/8` = 8 | hug (24) | control grows 24 → ~32 |
| **Mobile** | **20 × 20** | `body/Large/Regular` 16 / 24 | `spacing/12` = 12 | **min-height 44** (touch target) | width grows +8 |

- Control is a **circle** (`border-radius: 50%`). Inner selected dot is a centered filled circle (~⅓ of the control).
- **Mobile** keeps a 20px control but reserves a **44px min-height** row and a larger 12px gap so the whole row is a comfortable touch target.
- Row width **hugs** content; in product the group lays them out (stacked or inline).

---

## Design Tokens Used

### Control — by State × Selected

| State | Unselected control | Selected control | Label text |
|-------|--------------------|--------------------|------------|
| **Default** | 1px `Border/Border-Primary` `#b4bbcc` ring on `BG-Primary-alt` `#ffffff` | fill `BG-Button-Primary` `#006aff`, 1px `Border-Accent` `#006aff`, white inner dot | `Text/Text-Primary` `#15181e` |
| **Hover** | ring on `BG-Primary-hover` `#f0f2f5` wash | fill `BG-Button-Primary-Hover` `#1e52bb` | `Text-Primary` |
| **Focused** | **2px** `Border/Border-Accent-Focus` `#006aff` ring, rendered **outside** (no layout shift) | same + selected fill | `Text-Primary` |
| **Disabled** | 1px `Border/Border-Disabled` `#e1e4eb` on `BG-Disabled_subtle` `#f0f2f5` | fill `BG-Accent-Disabled` `#abc2f1`, border `Border-Accent-Disabled` `#abc2f1` | `Text/Text-Disabled` `#8893ad` |
| **Error** | 1px `Border/Border-Error` `#e42527` ring | fill `BG-Error-Solid` `#e42527` | `Text/Text-Error` `#c1181b` |

> Hex = Light theme; all bound to `UEMS Theme Tokens` — resolve per theme, never hardcode. Map to `--uems-*` (`border-primary`, `border-accent`, `bg-button-primary`, `bg-button-primary-hover`, `border-accent-focus`, `border-disabled`, `bg-disabled-subtle`, `bg-accent-disabled`, `border-accent-disabled`, `border-error`, `bg-error-solid`, `text-primary`, `text-disabled`, `text-error`).

### Typography (font family: **Zoho Puvi**, Regular / 400)

| Size | Style | Spec |
|------|-------|------|
| S, M | `body/Default/Regular` | 14px / 20 line-height |
| L, Mobile | `body/Large/Regular` | 16px / 24 line-height |

### Spacing & stroke

| Token | Value | Usage |
|-------|-------|-------|
| `spacing/8` | 8px | control ↔ label gap (S/M/L) |
| `spacing/12` | 12px | control ↔ label gap (Mobile) |
| `border-width/border-width-1` | 1px | resting ring stroke |
| `border-width/border-width-2` | 2px | focus ring stroke |

---

## States and Interactions

| Element | Trigger | Behavior |
|---------|---------|----------|
| Control / label | Click / `Space` | Selects this radio; deselects the previously-selected radio in the group; emits `change`. |
| Group | `↑`/`←` , `↓`/`→` | Move selection to prev/next enabled radio (roving focus, wraps per APG). |
| Control | Hover | Unselected → `BG-Primary-hover` wash; Selected → fill shifts to `BG-Button-Primary-Hover`. `cursor: pointer`. |
| Control | Focus (`:focus-visible`) | 2px `Border-Accent-Focus` ring **outside** the control — Default→Focus causes **no layout shift** (use `outline`/`box-shadow`, not an in-flow border). |
| — | Disabled | `Text-Disabled` + disabled fill/ring; not focusable, not clickable; `aria-disabled`. |
| — | Error | Whole control + label recolor to error together (driven by the group/field validation). |

> A selected radio is **not** deselected by clicking it again (unlike a checkbox) — selection only moves between options.

---

## RTL (`RTL=True`)

- Row mirrors: **label → control** (control on the visual right).
- Implement with `dir="rtl"` + logical properties; keep DOM order `control → label` and let `dir` reverse it. Gap unchanged (8 / 12).

---

## Edge Cases

- **Long label**: single line, `word-break: break-word`; wrap (control stays top-aligned to the first line) or truncate per the group's layout — confirm with design.
- **No label**: control-only is allowed but must still carry an `aria-label`.
- **Disabled selected**: shows the muted-accent fill (`#abc2f1`), still visibly "on", just non-interactive.
- **Error**: set on the group/field, not per-radio cosmetic; all radios in the group take the error treatment.
- **International text**: never fix label width; longer DE/AR strings wrap/truncate, control never shrinks.

---

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Inner dot / fill | Select / deselect | scale + fade the dot; fill cross-fade | 120–150ms | ease-out |
| Control bg | Hover | color fade | 100ms | ease |
| Focus ring | Focus | ring opacity | 100ms | ease |

> Respect `prefers-reduced-motion: reduce` — snap fill/dot, no scale.

---

## Accessibility (WAI-ARIA Radio Group)

- Group = `role="radiogroup"` with an accessible name (`aria-labelledby` / `aria-label`); each option `role="radio"` with `aria-checked`.
- **Roving tabindex**: only the selected (or first) radio is `tabindex="0"`; the rest `-1`. Arrow keys move selection + focus; `Tab` enters/leaves the group as one stop.
- **Label association**: clicking the label selects the radio (wrap in `<label>` or `aria-labelledby`).
- **Focus visible**: 2px accent ring on `:focus-visible` — never suppress.
- **Error**: expose via the group (`aria-invalid` + a linked message); don't rely on color alone.
- **Disabled**: `aria-disabled="true"`, removed from tab order.
- **Touch**: Mobile size gives a 44px target (meets the 44×44 minimum).

---

## Suggested Web Component API

```html
<ds-radio-group name="plan" value="pro" size="m" aria-label="Plan">
  <ds-radio value="free">Free</ds-radio>
  <ds-radio value="pro">Pro</ds-radio>
  <ds-radio value="ent" disabled>Enterprise</ds-radio>
</ds-radio-group>
```

**`<ds-radio>`**

| Prop | Figma | Type | Default | Notes |
|------|-------|------|---------|-------|
| `size` | `Size` | `s \| m \| l \| mobile` | `s` | Control + label scale |
| `checked` | `Selected` | boolean | false | Selected state (managed by the group) |
| `state` | `State` | `default \| error` | `default` | `error` recolors control + label (usually set by group) |
| `disabled` | `State=Disabled` | boolean | false | |
| `value` | — | string | — | Submitted value when selected |
| `show-help-icon` | `Show Help Icon` | boolean | false | Trailing info icon |
| `rtl` | `RTL` | boolean | false | Prefer host `dir="rtl"` |
| (slot) | Label | — | — | Default slot = label text |

**`<ds-radio-group>`**: `name`, `value` (selected child value), `size`, `state`, `disabled`, `rtl`. Owns single-selection, roving focus, arrow-key nav. **Events**: `change` → `{ value }`.

> Hover/Focused are interaction states (not props). `Mobile` is a size variant (20px control, 12px gap, 44px min-height row, Large 16/24 label).
