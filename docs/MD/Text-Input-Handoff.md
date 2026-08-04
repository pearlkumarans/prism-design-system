# Handoff Spec: Text Input (`ds-text-input`)

**Source:** [Figma — Text Input component set](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16042-44400) (node `16042:44400`)
**Target:** Prism web component `<ds-text-input>`
**Font:** `Zoho Puvi` (Regular / Medium / Semibold)

---

## Overview

A single-line text input field with optional label, required marker, label help icon, prefix/suffix (text + icon, including dropdown affordance), clear button, and a helper row (helper icon + supporting text + character counter). Supports 3 sizes, 8 states, label-top / label-left layouts, and full RTL mirroring.

The component set has **96 variants** = `Size (3) × State (8) × RTL (2) × Label Position (2)`.

---

## Anatomy

```
Field (vertical, gap 4 — Top layout)            ┌ Label Row (horizontal, gap 4, align center)
                                                │   Label · Required(*) · Label Help Icon(?)
                                                ├ Input Container (horizontal, gap 8*, align center)
                                                │   Prefix  · Placeholder/Value · Clear · Suffix
                                                │   └ Prefix = [Prefix Icon · Prefix Text]   (own frame, gap 4)
                                                │   └ Suffix = [Suffix Text · Suffix Icon]   (own frame, gap 4)
                                                └ Helper Row (horizontal, gap 4)
                                                    Helper Icon · Helper Text · Counter
```

- **Clear button sits *before* the Suffix** (order: Prefix · Placeholder · Clear · Suffix).
- **Prefix & Suffix are each their own auto-layout frame** with an internal **4px** gap.
- **Label Position = Left:** root is horizontal (gap 12); Label Row is the leading column (fixed width 240 at Medium), the input + helper sit in a `Body` column.
- *Input Container gap is **4px** at Small, **8px** at Medium/Large.

---

## Layout & Sizing

| Size | Field width (ref) | Input height | Radius | Padding (T R B L) | Container gap | Text size / line |
|------|------|------|------|------|------|------|
| Small | 160 | **36** | `radius-6` | 8 / 12 / 8 / 12 | 4 | 14 / 20 |
| Medium | 320 | **40** | `radius-8` | 10 / 12 / 10 / 12 | 8 | 14 / 20 |
| Large | 400 | **44** | `radius-8` | 12 / 12 / 12 / 12 | 8 | 16 / 24 |

> Field width is a reference; the input should **fill its container** (`width: 100%`). The placeholder/value text node grows to fill (the prefix/suffix/clear hug).

---

## Design Tokens

### Colors — per state (Input Container)

| State | Background | Border | Border width | Notes |
|-------|-----------|--------|------|------|
| Default | `BG-Primary-alt` | `Border-Primary` | 1px | |
| Hover | `BG-Primary-alt` | `Border-Accent` | 1px | |
| Focus | `BG-Primary-alt` | `Border-Button` | **2px** | focus ring color |
| Filled | `BG-Primary-alt` | `Border-Primary` | 1px | value present |
| Error | `BG-Primary-alt` | `Border-Error` | 1px | |
| Success | `BG-Primary-alt` | `Border-Success` | 1px | |
| Disabled | `BG-Secondary` | `Border-Primary` | 1px | not interactive |
| Read Only | `BG-Secondary-alt` | `Border-Disabled` | 1px | selectable, not editable |

### Colors — text & icons

| Element | Token |
|---------|-------|
| Label | `Text-Tertiary` |
| Required `*` | `Text-Error` |
| Placeholder | `Text-Placeholder` |
| Value (filled) | `Text-Primary` |
| Prefix text | `Text-Primary` |
| Suffix text | `Text-Secondary` |
| Helper text | `Text-Tertiary` |
| Counter | `Text-Tertiary` |
| Disabled value | `Text-Placeholder` |
| Disabled helper | `Text-Disabled` |
| Dropdown chip hover bg | `BG-Secondary-hover` |

### Typography

| Element | Font | Size / Line |
|---------|------|------|
| Label | Zoho Puvi **Semibold** | 13 / 20 |
| Required `*` | Zoho Puvi Medium | 14 |
| Placeholder / Value | Zoho Puvi Regular | 14 / 20 (Large 16 / 24) |
| Prefix text | Zoho Puvi Regular | 12 / 16 |
| Suffix text | Zoho Puvi Regular | 12 / 16 |
| Helper text | Zoho Puvi Regular | 11 / 14 |
| Counter | Zoho Puvi Regular | 11 / 14 |

### Icon sizes

| Icon | Size |
|------|------|
| Prefix / Suffix / Clear / Label Help | 16×16 |
| Helper icon | 14×14 |

---

## Component Properties → Web Component Attributes

| Figma property | Type | `<ds-text-input>` attribute | Default |
|---|---|---|---|
| Size | variant | `size="small\|medium\|large"` | medium |
| State | variant | `state="default\|hover\|focus\|filled\|error\|success\|disabled\|read-only"` | default |
| Label Position | variant | `label-position="top\|left"` | top |
| RTL | variant | `rtl` (boolean) / `dir="rtl"` | false |
| Show Label | bool | `show-label` | true |
| Label | text | `label` | "Label" |
| Required | bool | `required` | — |
| **Show Label Help Icon** | bool | `show-label-help-icon` *(new)* | **false** |
| Show Prefix Icon | bool | `prefix-icon` (presence) | — |
| Prefix Icon | swap | `prefix-icon="<name>"` | — |
| Show Prefix Text | bool | `prefix-text` (presence) | — |
| Prefix Text | text | `prefix-text` | — |
| Placeholder | text | `placeholder` | — |
| Value | text | `value` | — |
| Show Suffix Text | bool | `suffix-text` (presence) | — |
| Suffix Text | text | `suffix-text` | — |
| Show Suffix Icon | bool | `suffix-icon` (presence) | — |
| Suffix Icon | swap | `suffix-icon="<name>"` | — |
| Show Suffix Icon Right | bool | `suffix-icon-right` (presence) | false |
| Show Clear Button | bool | `show-clear` | true |
| Show Helper Row | bool | `show-helper-row` | true |
| Helper Icon / Show Helper Icon | swap/bool | `helper-icon` | — |
| Helper Text | text | `helper` | "Supporting text" |
| Show Counter / Counter | bool/text | `show-counter`, `counter` | — |

---

## States & Interactions

| Element | State | Behavior |
|---------|-------|----------|
| Input | Hover | Border → `Border-Accent` (1px) |
| Input | Focus | Border → `Border-Button` (**2px**); on keyboard focus show the focus ring |
| Input | Typing | State → Filled; value uses `Text-Primary` |
| Input | Error | Border → `Border-Error`; pair with helper text describing the error |
| Input | Success | Border → `Border-Success` |
| Input | Disabled | bg `BG-Secondary`, text `Text-Placeholder`; no pointer events, skip focus |
| Input | Read Only | bg `BG-Secondary-alt`, border `Border-Disabled`; focusable + selectable, not editable |
| Clear (✕) | Visible when | `value` is non-empty **and** `show-clear`; positioned **before** the suffix |
| Clear (✕) | Click | Clears value, refocuses input, emits `ds-input` with empty value |
| Prefix/Suffix **dropdown** | Hover | Chip gets `BG-Secondary-hover` bg, radius 4, padding 2/4 — **only the chip that is a dropdown** (has chevron) |
| Prefix/Suffix dropdown | Click | Opens associated menu (unit selector, etc.) — wire to `ds-dropdown-menu` |
| Label Help (?) | Hover/focus | Shows tooltip/popover with help text (toggle via `show-label-help-icon`) |

---

## RTL Behavior

When `rtl` / `dir="rtl"`:
- Input Container order mirrors to **Suffix · Clear · Placeholder · Prefix** (logical reading order preserved).
- Prefix/Suffix frame internals reverse (text/icon order flips).
- Label Row mirrors to **Label Help Icon · Required · Label** (help icon on the leading/right side).
- Placeholder/value text aligns right.
- Dropdown-chip hover and clear-before-suffix behavior carry through the mirror.

---

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop / Tablet | Input fills its container; `label-position="left"` keeps label column fixed (~240px at Medium) |
| Mobile (< 768px) | Recommend forcing `label-position="top"` so the field gets full width; left-label column wastes horizontal space |

---

## Edge Cases

- **Long value:** value text node fills available width; the input does **not** wrap (single line). Truncate visible text with ellipsis; full value remains in the field. Prefix/suffix/clear stay pinned and hug.
- **Long label (Left layout):** label column is fixed width — allow label to wrap to 2 lines; input stays aligned to the top.
- **Counter:** format `used/max` (e.g. `0/100`). When over limit, pair with Error state.
- **Prefix + Suffix both present + Clear:** order is Prefix · value · Clear · Suffix; ensure they don't crowd the value on Small size.
- **International text:** prefix/suffix text are 12px — verify longer translated strings don't overflow the chip; allow the chip to hug.
- **No label:** `show-label` false removes the Label Row entirely (no reserved space).
- **Disabled / Read Only:** suppress clear button and dropdown hover affordances.

---

## Accessibility

- Render a real `<input>`; associate the label with `for`/`id` (or wrap). If `show-label` is false, provide `aria-label`.
- **Required:** set `aria-required="true"`; the `*` is decorative (`aria-hidden`).
- **Error:** `aria-invalid="true"`; link helper text via `aria-describedby`; announce error politely (`role="alert"` / `aria-live="polite"` on the helper).
- **Helper / counter:** reference both via `aria-describedby`.
- **Label help icon:** focusable button (`aria-label="Help"`), opens tooltip on focus/hover; tooltip content reachable by keyboard.
- **Clear button:** real `<button>` with `aria-label="Clear"`; reachable by keyboard; returns focus to the input after clearing.
- **Prefix/suffix dropdown:** use a `<button>` with `aria-haspopup="listbox"`/`aria-expanded`; the chevron is decorative.
- **Focus order:** label help → input → clear → suffix dropdown (mirrored in RTL).
- **Read Only:** `readonly` attribute (stays focusable); **Disabled:** `disabled` (removed from tab order).
- Focus ring must be visible (2px `Border-Button`) and meet non-text contrast.

---

## Motion

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Border color | hover / focus / state change | color transition | 120–160ms | standard ease |
| Dropdown chip bg | hover | background fade | 120ms | standard ease |
| Clear button | value present/absent | optional fade-in | 120ms | standard ease |

*(No motion specified in the Figma component — values above are the Prism interaction defaults; confirm against `--duration-standard`.)*

---

## Implementation Notes

- A `<ds-text-input>` already exists in the Prism web component library (`design-system-library/src/components/text-input/`). This handoff maps the updated Figma anatomy onto it — the **new** pieces to add are: `show-label-help-icon`, the **prefix/suffix wrapper frames (4px gap)**, **clear-before-suffix** ordering, and the **dropdown-chip hover** treatment.
- Use design-token CSS variables, not raw hex/px (e.g. `var(--border-accent)`, `var(--radius-8)`).
