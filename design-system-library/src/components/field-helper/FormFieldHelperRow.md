# Handoff Spec: Form Field Helper Row

> Source: Figma — UEMS Design System 3.0 · [Form Field Helper Row component set](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17905-5403)
> Target: Web component (framework-agnostic custom element `<ds-field-helper>` / React wrapper).
> Reuses DS primitives: status **Icon** (`info-circle`, `exclamation-circle`, `tick`). Pairs with Text Input / Textarea / Select / [Checkbox Group](checkbox-group.md) / [Radio](radio-button.md) as their helper / validation / character-count line.

---

## Overview

The **Form Field Helper Row** is the single line that sits **below a form field**. It carries two things on one baseline row:

- **Help / validation message** (leading): a status **icon** + **helper text** that communicate guidance or the field's validation result.
- **Character counter** (trailing): `current/max` count, right-aligned.

It is a **display/reflective** component — it has no interactions of its own. Its **State** is driven by the parent field's validation, and its text/counter are data. Row height is a fixed **16px**.

**Figma variant axes**

- **State**: `Default | Negative | Success | Disabled` — color + icon change together.
- **RTL**: `False | True` — mirrors order and alignment.

**Component properties**

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `Show Icon` | boolean | `true` | Toggles the leading status icon |
| `Helper Text` | text | `"Help text"` | The message string |
| `Show Counter` | boolean | `true` | Toggles the trailing character counter |
| `Counter` | text | `"0/232"` | `current/max` string |

> 8 variants total = State (4) × RTL (2). `Show Icon` / `Show Counter` / `Helper Text` / `Counter` are instance props, not variants.

---

## Anatomy

```
LTR:  [◌ Help text ......................]      0/232
       └ icon  └ helper text (grows) ──┘        └ counter (hugs, right)
       └──────────── help-group (grows) ───────┘ └─ gap 12 ─┘

RTL:  0/232      [...................... Help text ◌]
                  (counter first; help-group reversed: text · icon)
```

| # | Element | Notes |
|---|---------|-------|
| 1 | **root** | Horizontal row. Width fills the field; height hugs (16px). `help-group` grows, `counter` hugs. |
| 2 | **help-group** | Leading cluster, **grows to fill**. Holds the icon + helper text, gap 4. |
| 3 | **icon** | 12×12 status glyph in a 12×16 box (vertically centered). Hidden when `Show Icon = false`. Stroke color = state. |
| 4 | **Help Text** | The message. `Text/small/Regular` (12px). Grows within `help-group`; single line. |
| 5 | **counter** | Trailing cluster, **hugs content**, vertically centered. Hidden when `Show Counter = false`. |
| 6 | **Char Count** | `current/max`. `Text/Special-Sizes/small-11/Regular` (11px). |

---

## Layout

| Region | Layout | Gap | Padding | Sizing |
|--------|--------|-----|---------|--------|
| **root** | Horizontal, top-aligned (`MIN`) · justify `MIN` (LTR) / `MAX` (RTL) | **12px** | 0 | authored **FIXED width**; **stretch to 100% of the field** in use. Height hug → **16px** |
| **help-group** | Horizontal, top-aligned (`MIN`) | **4px** | 0 | width **FILL** (`grow: 1`); height hug |
| **icon** | box | — | 0 | **12 × 16** (glyph 12×12, vertically centered — y=2) |
| **Help Text** | text | — | 0 | single line, 16px tall. **Set `flex: 1`** so it truncates (see note ⚠︎) |
| **counter** | box, **center-aligned** (`CENTER`) | — | 0 | **hug** (`grow: 0`); ~14px tall |

### Sizing

| Element | Value |
|---------|-------|
| Row height | 16px |
| Icon glyph | 12 × 12px |
| Gap: help-group ↔ counter | 12px |
| Gap: icon ↔ helper text | 4px |

---

## Design Tokens Used

### Color (per State — icon stroke and text share the same hue)

| State | Icon glyph | Icon stroke token | Text token (Help Text + Counter) | Value |
|-------|-----------|-------------------|----------------------------------|-------|
| **Default** | `info-circle` | `Border/Icon/Icon-Tertiary` | `Text/Text-Quaternary` | `#55607a` |
| **Negative** | `exclamation-circle` | `Border/Icon/Icon-Error` | `Text/Text-Error` | `#c1181b` |
| **Success** | `tick` | `Border/Icon/Icon-Success` | `Text/Text-Success` | `#0a7138` |
| **Disabled** | `info-circle` | `Border/Icon/Icon-Disabled` | `Text/Text-Disabled` | `#8893ad` |

> Hex = Light theme. All bound to `UEMS Theme Tokens` variables — resolve per theme; never hardcode.

### Typography (font family: **Zoho Puvi**)

| Element | Text style | Spec |
|---------|-----------|------|
| **Help Text** | `Text/small/Regular` | 12px / Regular |
| **Char Count** | `Text/Special-Sizes/small-11/Regular` | 11px / Regular |

### Spacing & radius

| Token | Value | Usage |
|-------|-------|-------|
| `spacing/12` | 12px | help-group ↔ counter gap |
| `spacing/4` | 4px | icon ↔ helper text gap |
| (none) | — | No padding, no border, no radius on the row |

---

## States and Interactions

The row is **driven by the parent field** — it does not own hover/active/focus. "State" mirrors validation.

| State | When | Icon | Text & counter color |
|-------|------|------|----------------------|
| **Default** | Resting guidance / neutral hint | `info-circle` | `#55607a` (quaternary) |
| **Negative** | Validation failed / over limit | `exclamation-circle` | `#c1181b` (error) |
| **Success** | Validation passed | `tick` | `#0a7138` (success) |
| **Disabled** | Field disabled | `info-circle` (muted) | `#8893ad` (disabled) |

### Behavior

| Element | Trigger | Behavior |
|---------|---------|----------|
| Counter | User types in the field | `current` updates live (e.g. `12/232`). |
| State | Field validity changes | Whole row swaps icon + color (Default ⇄ Negative ⇄ Success). |
| Counter | `current` exceeds `max` | Field becomes **Negative**; counter + message take the error color. |
| Icon | `Show Icon = false` | Helper text starts at the leading edge; counter unaffected. |
| Counter | `Show Counter = false` | Helper text spans the full width. |

> Both message and counter recolor **together** with State — they're never mismatched.

---

## Responsive Behavior

Single-line row that fills the field's width; it does not have its own breakpoints.

| Context | Changes |
|---------|---------|
| Field full width | `help-group` grows, `counter` pinned to the trailing edge, 12px between. |
| Narrow field | Helper text truncates with ellipsis (single line); counter never wraps or shrinks. |
| No counter | Helper text takes the full width. |
| Message wraps? | No — the row is fixed 16px; the message is single-line. For multi-line guidance, stack a separate description block above the field, not here. |

---

## RTL (`RTL=True`)

- Row order flips: **counter (leading)** then **help-group**; root justifies to the end.
- Inside `help-group`, order becomes **Help Text → icon** (icon on the visual right).
- Implement with `dir="rtl"` + logical properties (`flex-direction`, `margin-inline`); keep DOM order `icon → text` and let `dir` reverse it.

---

## Edge Cases

- **Long helper text**: truncate single-line with ellipsis; keep the counter fully visible (counter has priority on the trailing edge).
- **No icon (`Show Icon = false`)**: text aligns to the leading edge; row height stays 16px.
- **No counter / no text**: hide the respective cluster; if both empty, render nothing (don't reserve the 16px row).
- **Counter at/over max**: drive the field to Negative; recolor row to error. Digits stay numeric (no abbreviation in this component).
- **International text**: Arabic/German messages are longer — never fix the text width; truncate. Counter digits are LTR even in RTL layout.
- **Dynamic message swap**: switching Default→Negative must not shift layout (height is constant); announce politely (see Accessibility).

---

## Animation / Motion

Minimal — this is a status line.

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Icon + text color | State change | Color cross-fade | 120ms | ease |
| Row | Show/hide (icon / counter / whole row) | Opacity (optional) | 100ms | ease |

> Respect `prefers-reduced-motion: reduce` — swap colors/visibility instantly.

---

## Accessibility

- **Associate with the field**: link the helper text to the input via **`aria-describedby`** (the field references the helper row's id).
- **Error state (Negative)**: set **`aria-invalid="true"`** on the field; expose the message in an **`aria-live="assertive"`** (or `role="alert"`) region so it's announced when validation fails.
- **Counter**: wrap in **`aria-live="polite"`** but **debounce** announcements (announce on pause / at thresholds like 90% / over-limit), not on every keystroke. Prefer an accessible label like "12 of 232 characters".
- **Icon is decorative**: `aria-hidden="true"` — meaning is carried by **color + icon shape + text together** (not color alone), satisfying 1.4.1 Use of Color.
- **Contrast**: Default `#55607a`, Error `#c1181b`, Success `#0a7138` on white all meet AA for 12/11px text. Disabled `#8893ad` is exempt (disabled) but kept legible.
- **Disabled**: reflect with the parent field's disabled state; the helper text remains readable (not removed).

---

## Suggested Web Component API

```html
<ds-field-helper
  state="default"
  helper-text="Help text"
  show-icon
  counter="0/232"
  show-counter>
</ds-field-helper>
```

**`<ds-field-helper>`**

| Prop | Figma | Type | Default | Notes |
|------|-------|------|---------|-------|
| `state` | `State` | `default \| negative \| success \| disabled` | `default` | Drives icon + color |
| `helper-text` | `Helper Text` | string | `"Help text"` | The message |
| `show-icon` | `Show Icon` | boolean | `true` | Leading status icon |
| `counter` | `Counter` | string | — | `current/max` (e.g. `12/232`) |
| `show-counter` | `Show Counter` | boolean | `true` | Trailing counter |
| `rtl` | `RTL` | boolean | false | Prefer host `dir="rtl"` |

- **Icon is automatic from `state`**: `default` / `disabled` → `info-circle`, `negative` → `exclamation-circle`, `success` → `tick`. Don't expose a separate icon prop.
- The element must own an `id` (or expose one) so the field can `aria-describedby` it.

**Events**: none (display component). The host field owns input/validation and sets `state` + `counter`.

---

## Notes for Implementation

- **Reflective, not interactive** — no hover/active/focus on this row; all state comes from the field.
- **⚠︎ Source inconsistency to ignore** — in Figma, `Help Text` `layoutGrow` is `1` for Default/Disabled but `0` for Negative/Success. This is an authoring slip; **always implement the text as `flex: 1`** (truncate, keep counter pinned) regardless of state. The Figma component should be normalized to match.
- **Width** — the component is authored at a fixed width; integrators must stretch it to the field's full width (`width: 100%`), not rely on the authored size.
- **Icon + text are one semantic unit** per state — bind both the icon stroke and the text fill to the same state token so they never drift.
- **Two type sizes** — helper text is 12px (`Text/small/Regular`); counter is 11px (`Text/Special-Sizes/small-11/Regular`). Don't unify them.
- **Layout** — `display:flex; gap:12px; align-items:flex-start;` on root; `help-group{ flex:1; min-width:0; display:flex; gap:4px; }`; `counter{ flex:0 0 auto; align-self:center; }`.
- **Truncation** — `help-text{ flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }` so it ellipsizes instead of pushing the counter off-row.
- **Constant height (16px)** — never let state changes or message swaps shift the field below.
- **Theme** — fills bind to `Text-Quaternary/Error/Success/Disabled`; icon to the matching `Icon-*` tokens; dark/night/green resolve automatically.

---

## Open Questions for Design

1. **Counter overflow color** — when `current > max`, does only the counter turn red, or the whole row (icon + message) go Negative? (Spec assumes whole row → Negative.)
2. **Counter in RTL** — confirm digit / `/` orientation (assumed LTR numerals within the RTL row).
3. **Success + counter** — is there a state where the message is Success but the counter stays neutral, or do they always share color? (As-built: always share.)
4. **Long message policy** — truncate (current assumption) vs. allow a taller multi-line description block elsewhere.
