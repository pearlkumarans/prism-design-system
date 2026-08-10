# Input Select Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `16926:796521` (Component Set)
**Page:** Input Select
**Total Variants:** 120

---

## Overview

The Input Select is a form control component that lets users choose one or many values from a predefined list of options. It combines the visual structure of a Text Input (label, field, helper row) with a closed-state trigger that opens a menu of options. Input Select supports single-select (default value display) and multi-select (tag chips with overflow badge) patterns, plus an open/active state for the dropdown surface itself.

---

## Web Component API

```html
<ds-input-select
  size="small|medium|large"
  state="default|hover|focus|filled|error|success|disabled|read-only|active|active-multi"
  label="Region"
  placeholder="Select"
  label-position="none|top|left"
  full-width
  required
  show-label
  show-helper-row
  show-prefix-icon prefix-icon="search"
  show-clear
  multi
  show-badge badge-text="+3"
  rtl
  helper="Supporting text"
  show-helper-icon
  show-counter counter="0/100">
</ds-input-select>
```

### Boolean attribute conventions

- `full-width` — defaults to `false`. Set to stretch the field to fill its container, overriding the per-size width cap (S 160 / M 320 / L 400).
- `required` — defaults to `true`. Set `required="false"` to hide the asterisk.
- `show-label` — defaults to `true` when a `label` is set. Set `show-label="false"` to hide.
- `show-helper-row` — defaults to `true`. Set `show-helper-row="false"` to suppress the row entirely.
- `show-prefix-icon` — defaults to `false`. Set to render the prefix icon slot (uses `prefix-icon` for the glyph).
- `show-clear` — defaults to `false`. Set to render the clear (×) button when a value is present.
- `show-badge` — defaults to `false`. Set to render the `+N` overflow badge.
- `multi` — defaults to `false`. Set to enable multi-select / tag mode.
- `rtl` — defaults to `false`. Set to mirror layout for RTL languages.
- `show-helper-icon` — defaults to `false`. Set to show the neutral `info-circle` on the Default state (Error/Success always show their status icon).
- `show-counter` — defaults to `false`. Set to render the character `counter` at the end of the helper row.
- `counter` — counter text (e.g. `0/100`). Shown only when `show-counter` is set.

### Properties (DOM-only)

| Property | Type | Notes |
|----------|------|-------|
| `options` | `Array<{ label, value, disabled?, icon? }>` | Option list for the dropdown surface. An item may instead be a structural row — `{ type: 'heading', label }` renders a non-selectable section title, `{ type: 'divider' }` a separator — to group options (e.g. "Standard", "EUS", "E4S"). |
| `value` | `string` | Current single-select value. Reflected to the `value` attribute. |
| `values` | `string[]` | Current multi-select values. |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-input-select-change` | `{ value }` (single) or `{ values }` (multi) | Selection changed. |
| `ds-input-select-open`  | — | Dropdown opens. |
| `ds-input-select-close` | — | Dropdown closes. |
| `ds-input-select-clear` | — | Clear button activated. |

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Size** | `Small`, `Medium`, `Large` | Field height, padding, font size. |
| **State** | `Default`, `Hover`, `Focus`, `Filled`, `Error`, `Success`, `Disabled`, `Read Only`, `Active`, `Active Multi-select` | Interaction, validation, and open-menu states. |
| **RTL** | `False`, `True` | Mirrors layout for RTL languages. |
| **Label Position** | `Left` (default), `Top`, `None` | Left renders the label in a 280px column beside the field (auto-stacks below 640px); Top stacks it above the trigger; None hides it, keeping the text as the trigger's `aria-label`. |
| **Full Width** | `False` (default), `True` | Stretch the field to fill its container, overriding the per-size width cap. |

---

## Per-size Dimensions

| Property | Small | Medium | Large |
|----------|-------|--------|-------|
| Field height | `36px` | `40px` | `44px` |
| Min width | `120px` | `320px` | `400px` |
| Corner radius | `6px` | `8px` | `8px` |
| Field background | `Bg-Primary-Alt` | `Bg-Primary-Alt` | `Bg-Primary-Alt` |
| Stroke (default) | `1px` | `1px` | `1px` |
| Value/placeholder font size | `14px` | `14px` | `16px` |
| Active multi-select height | `HUG` | `HUG` | `HUG` |

---

## Per-state Border + Background (Medium)

| State | Border | Background | Notes |
|-------|--------|-----------|-------|
| Default | `1px Border-Primary` (#B4BBCC) | `Bg-Primary-Alt` | Resting. |
| Hover | `1px Border-Accent` | `Bg-Primary-Alt` | Mouse over. |
| Focus | `2px Border-Focus` | `Surface-Default` | Keyboard focus; padding compensated. |
| Filled | `1px Border-Default` | `Surface-Default` | Auto-applied when a value is present. |
| Error | `1px Border-Error` | `Surface-Default` | Helper switches to error color. |
| Success | `1px Border-Success` | `Surface-Default` | Helper switches to success color. |
| Disabled | `1px Border-Default` | `Surface-Disabled` | Component opacity 0.5. |
| Read Only | `1px Border-Subtle` | `Surface-ReadOnly` | Cursor `default`; cannot open. |
| Active | `2px Border-Focus` | `Surface-Default` | Single-select dropdown open. |
| Active Multi-select | `2px Border-Focus` | `Surface-Default` | Multi-select dropdown open; trigger HUGs to fit chips. |

---

## Tag Overflow

When the number of selected items exceeds what the field can display:

- Show the first N tags inline (typically 2–3 depending on size and width)
- Append the overflow badge (`+N`) via `show-badge` + `badge-text="+N"`
- The badge is decorative; the full list remains accessible by opening the dropdown

---

## Accessibility

| Aspect | Implementation |
|--------|---------------|
| **Role** | Trigger uses `role="combobox"` with `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls` pointing at the dropdown surface. |
| **Label** | Bound via `for`/`id` on the inner `<label>`/`<button>` pair. |
| **Required** | `aria-required="true"` when the asterisk is shown. |
| **Validation** | Error state sets `aria-invalid="true"`; helper is referenced via `aria-describedby`. |
| **Keyboard** | `Tab` focuses trigger. `Space` / `Enter` / `↓` open the menu. `Esc` closes and returns focus to the trigger. |
| **Disabled** | The trigger is `disabled`; component drops opacity to 0.5 and disables pointer events. |
| **Read Only** | Trigger remains focusable but does not open the menu. |
| **Multi-select** | Tag chips expose a per-chip remove button (`Remove {label}`) via the underlying `<ds-tag>`. |
| **RTL** | Layout, chips, and label/helper alignments mirror via `rtl` attribute (sets `dir="rtl"`). |

---

## Usage Guidelines

### Do
- Use **Left** label position by default (settings-style key-value layouts); reach for **Top** on responsive/mobile and narrow side panels.
- Always provide a `label`. Hidden labels still need a programmatic association.
- Use the `placeholder` to describe the choice (e.g., "Select country") — not as a substitute for the label.
- Use the `+N` overflow badge when more chips are selected than fit.
- Use `show-clear` for fields users frequently reset (filters, search-style selects).
- For long option lists, include search/filter inside the dropdown surface (handled by the dropdown menu component).

### Don't
- Don't use Input Select for binary choices — use a Toggle, Checkbox, or Radio.
- Don't use the placeholder as the only label.
- Don't show Error and Success simultaneously.
- Don't use `read-only` when the field should be `disabled` — `disabled` implies the action is unavailable, `read-only` implies the value is fixed in this view.
- Don't pack more than ~3 visible tags into Small size — use the overflow badge instead.
- Don't hide the chevron — it is the affordance signaling the field opens a menu.

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Text Input** | Free-text single-line entry. Use Text Input when users type a value rather than choose from a list. |
| **Dropdown Menu** | The list surface that renders inside the Active / Active Multi-select states. |
| **Tag** | The chip primitive used inside the multi-select trigger. |
| **Radio Group** | Use for short, mutually-exclusive option lists (≤ ~5 options) where all options should be visible. |
| **Checkbox Group** | Use for short, multi-select option lists where all options should be visible. |
| **Date Picker** | Specialized select-style trigger for date values. |
