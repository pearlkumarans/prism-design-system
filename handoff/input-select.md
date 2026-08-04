# Handoff Spec: Input Select (Single-Select / Autocomplete)

**Figma:** [Input Select component set](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16926-796521) · node `16926:796521`
**Web component:** `ds-input-select` (pairs with `ds-dropdown-menu` for the option list)

---

## Overview

A single-value selection field. The closed field looks like a text input with a trailing chevron; activating it opens a `ds-dropdown-menu` popover of options anchored to and matching the field width. Supports type-ahead/autocomplete filtering. For **multi**-select use the Token Field instead — this component is deliberately single-value.

The component set has **108 variants**: `Size {Small, Medium, Large} × State {Default, Hover, Focus, Filled, Error, Success, Disabled, Read Only, Active} × RTL {False, True} × Label Position {Top, Left}`.

---

## Layout & Sizing

| Size | Field height | Corner radius | Padding (T/R/B/L) | Inner gap | Default width |
|------|-------------|---------------|-------------------|-----------|---------------|
| Small | 36px | `radius-6` (6) | 8 / 12 / 8 / 12 | 8 | 160 |
| Medium | 40px | `radius-md` (8) | 10 / 12 / 10 / 12 | 8 | 320 |
| Large | 44px | `radius-md` (8) | 12 / 12 / 12 / 12 | 8 | 400 |

- **Border:** 1px all states except **Focus / Active = 2px**.
- **Icons:** chevron, clear, prefix/suffix icons all **16px**. Label help icon **16px**. Helper hint icon **12px**.
- **Width is consumer-driven** — the field fills its container (`Input Container` uses FILL). The default widths above are just the canvas examples.
- **Label Position = Left:** label sits inline-start of the field (label column hugs); otherwise label stacks on top.

### Field content order (LTR)
`Prefix → Placeholder/Value → Clear Button → Chevron → Suffix`
**RTL** mirrors to: `Suffix → Chevron → Clear Button → Placeholder/Value → Prefix`
(Figma auto-layout doesn't honor `dir`; child order is manually reversed per RTL variant. In web, real `dir="rtl"` flips it.)

---

## Design Tokens

### Surface & border (per state)
| State | Border token | Border px | Fill token |
|-------|-------------|-----------|------------|
| Default | `Border-Primary` (#b4bbcc) | 1 | `BG-Primary-alt` (#fff) |
| Hover | `Border-Accent` (#006aff) | 1 | `BG-Primary-alt` |
| Focus | `Border-Button` (#2c66dd) | **2** | `BG-Primary-alt` |
| Filled | `Border-Primary` | 1 | `BG-Primary-alt` |
| Error | `Border-Error` (#e42527) | 1 | `BG-Primary-alt` |
| Success | `Border-Success` (#0c8844) | 1 | `BG-Primary-alt` |
| Disabled | `Border-Primary` | 1 | `BG-Secondary` (#f0f2f5), whole field at **0.5 opacity** |
| Read Only | `Border-Disabled` (#e1e4eb) | 1 | `BG-Secondary-alt` (#f0f2f5) |
| Active (open) | `Border-Button` (#2c66dd) | **2** | `BG-Primary-alt` |

### Typography & text color
| Element | Font | Size / line | Weight | Token |
|---------|------|-------------|--------|-------|
| Label | Zoho Puvi | 13 | Semibold | `Text-Tertiary` (#40485b) |
| Required `*` | — | 13 | — | `Text-Error` (#c1181b) |
| Placeholder | Zoho Puvi | 14 / 20 | Regular | `Text-Placeholder` (#5f6c89) |
| Value (filled) | Zoho Puvi | 14 / 20 | Regular | `Text-Primary` (#15181e) |
| Prefix / Suffix text | Zoho Puvi | 14 / 20 | Regular | `Text-Primary` (#15181e) |
| Supporting / helper text | Zoho Puvi | 12 | Regular | `Text-Quaternary` (#55607a) |
| Counter (e.g. `0/100`) | Zoho Puvi | 11 | Regular | `Text-Quaternary` |

> Error / Success states color the **helper text** with `Text-Error` / `Text-Success` respectively (matches the border).

---

## Component Properties (Figma)

| Property | Type | Default | Notes |
|----------|------|---------|-------|
| `Show Label` | Boolean | true | |
| `Label` | Text | "Label" | |
| `Required` | Boolean | true | Shows red asterisk |
| `Show Label Help Icon` | Boolean | **false** | help-circle (16) beside label |
| `Show Prefix` | Boolean | **false** | Master toggle — shows/hides the whole prefix frame (incl. its gap) |
| `Show Prefix Text` / `Prefix Text` | Boolean / Text | true / "Text" | Shown once `Show Prefix` is on |
| `Show Prefix Icon` / `Prefix Icon` | Boolean / Swap | false / help-circle | |
| `Placeholder` | Text | "Select" | |
| `Value` / `Show Value` | Text / Boolean | "Selected Item" / true | |
| `Show Clear Button` | Boolean | **false** | × (cancel icon) revealed when a value exists |
| `Chevron` | Swap | chevron-down | |
| `Show Suffix` | Boolean | **false** | Master toggle for suffix frame |
| `Show Suffix Text` / `Suffix Text` | Boolean / Text | true / "Text" | |
| `Show Suffix Icon` / `Suffix Icon` | Boolean / Swap | false / chevron-down | |
| `Show Badge` / `Badge Text` | Boolean / Text | false / "+3" | Overflow/count pill |
| `Show Helper Row` | Boolean | true | Supporting text + optional counter |
| `Size` / `State` / `RTL` / `Label Position` | Variant | Small / Default / False / Top | |

**Prefix/Suffix toggle model:** `Show Prefix` (whole group, default off) → then `Show Prefix Text` / `Show Prefix Icon` choose what's inside. Same for suffix. When the master is off the frame is removed from layout entirely (no leftover gap). Prefix internal order is text-first (`Prefix Text, Prefix Icon`) in LTR, mirrored in RTL; suffix sits at the trailing edge after the chevron.

---

## States & Interactions

| Element | State | Behavior |
|---------|-------|----------|
| Field | Hover | Border → `Border-Accent` |
| Field | Focus (keyboard) | 2px `Border-Button` ring |
| Field | Active | Dropdown open; 2px `Border-Button`; chevron points up |
| Field | Disabled | `BG-Secondary` fill, no pointer events, not focusable |
| Field | Read Only | `BG-Secondary-alt` fill, focusable but no menu / no edits |
| Field | Error | `Border-Error`; helper text in `Text-Error`; `aria-invalid` |
| Clear button | value present | Shows ×; click clears value, returns to placeholder, keeps focus |
| Chevron | open/close | Rotates 180°; click toggles menu |
| Option row | Hover | Accent wash background |
| Option row | Selected | Accent wash + `Text-Accent-Primary` label (tick optional) |

### Dropdown menu (`ds-dropdown-menu`)
- **Width = field/input-container width** (anchored, matched per size).
- Surface `BG-Primary-alt`, 1px `Border-Tertiary` (#e1e4eb), radius **8**, drop shadow (y 2, blur 8), padding 4px vertical.
- **Option row:** height 36, padding 8/12, radius 8, gap 8, label `Text-Primary` 14px.
- List scrolls after ~`max-height: 320px`.

---

## Responsive Behavior

| Breakpoint | Changes |
|------------|---------|
| Desktop (>1024px) | Field width set by container; menu matches field width |
| Tablet/Mobile | Field goes full-width of its container; `Label Position` typically switches Left→Top; menu still matches field width, scrolls vertically |

The component itself is width-agnostic — responsiveness is driven by the parent layout, not internal breakpoints.

---

## Content & Edge Cases

- **Empty list:** show a centered "No options" / "No results" row (`Text-Tertiary`, 13px) — do not render an empty popover.
- **Long option / value text:** single line, `ellipsis` truncation; full text via tooltip/`title`. Field value truncates before the clear/chevron cluster.
- **Autocomplete:** typing filters the list live; if nothing matches → empty state above. Clearing the query restores the full list.
- **Loading:** while options load, show a loading row (spinner + "Loading…") inside the open menu; keep the field interactive.
- **Long label strings / i18n:** label wraps (Top) or the label column widens (Left). RTL fully mirrored.
- **Required + empty on submit:** Error state, helper text describes the requirement.

---

## Motion

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Dropdown menu | Open | fade in + translateY(-6→0) + scale(0.98→1), origin top | opacity 220ms / transform 260ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Dropdown menu | Close | reverse (fade/translate up) | 220ms | same |
| Chevron | Toggle | rotate 180° | ~150ms | ease |

---

## Accessibility

- **Role:** combobox pattern — trigger is `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` pointing to the listbox; the menu is `role="listbox"`, rows `role="option"` with `aria-selected`.
- **Label:** associate `<label>` with the control (`for`/`id` or wrapping). Help icon has an accessible name (e.g. tooltip text via `aria-describedby`).
- **Required:** `aria-required="true"`; the `*` is decorative (`aria-hidden`).
- **Error:** `aria-invalid="true"` and `aria-describedby` linking the helper/error text.
- **Keyboard:**
  - `Enter` / `Space` / `ArrowDown` opens the menu and moves to first/active option.
  - `ArrowUp` / `ArrowDown` move active option; `Home`/`End` jump to ends.
  - Type-ahead matches options by prefix (autocomplete filters the list).
  - `Enter` selects the active option and closes; `Esc` closes without changing; `Tab` closes and moves on.
- **Focus order:** field → (clear button when present) → menu options when open. Focus returns to the field on close. Disabled is removed from tab order; Read Only stays focusable but opens nothing.
- **Screen reader:** announce expanded/collapsed, active option as it changes, and selected value. Announce the result count after filtering.

---

## Implementation Notes

- Reuse `ds-dropdown-menu` for the option list (don't hand-roll) — it already provides option rows, selection state, keyboard handling, RTL, and the open/close motion above.
- Match the menu width to the trigger at runtime (the Figma variants reflect this — every menu equals its field width).
- Prefix/Suffix and the clear button are off by default; expose them as props/slots.
