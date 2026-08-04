# Field Helper

**Design System:** UEMS Design System 3.0
**Spec:** `FormFieldHelperRow.md`

The Field Helper is the shared "Form Field Helper Row" that renders under a form field: a leading status icon + helper/validation text on the leading side, and an optional character counter (`12/232`) pinned to the trailing side. It is consumed by OTP Input, Text Input, Textarea, Select, Slider, Date picker, and more. The runtime implementation lives at:

- `field-helper.css` — BEM, token-driven (no hardcoded hex)
- `field-helper.js` — `<ds-field-helper>` light-DOM host that renders the icon/text/counter row and drives its own ARIA live region

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `text` | string | — | Helper / validation text (falls back to default-slot text) |
| `state` | `default` \| `error` \| `negative` \| `success` \| `disabled` | `default` | Status; drives icon + colour. `negative` is a spec alias of `error` |
| `icon` | sprite name | per-state default | Overrides the leading status icon |
| `show-icon` | boolean (`false` to hide) | shown | Hide the leading icon while keeping the text |
| `counter` | string e.g. `12/232` | — | Trailing character counter, pinned to the trailing edge |
| `rtl` | boolean | unset | Mirrors the inline axis (counter → leading, text/icon → trailing) |

### Slots

- default — helper text (alternative to the `text` attribute)

### Per-state icon defaults

| State | Icon |
|-------|------|
| `default` | `info-circle` |
| `error` / `negative` | `exclamation-circle` |
| `success` | `tick` |
| `disabled` | `info-circle` |

### Accessibility

The component manages its own ARIA live region so consumers can point `aria-describedby` at this element's id:

- `error` → `role="alert"`, `aria-live="assertive"` (speaks immediately)
- all other states → `aria-live="polite"`

The leading icon is decorative (`aria-hidden="true"`).

---

## Token mapping

| State | Text / icon / counter colour |
|-------|------------------------------|
| `default` | `--uems-text-quaternary` |
| `error` / `negative` | `--uems-text-error` |
| `success` | `--uems-text-success` |
| `disabled` | `--uems-text-disabled` |

Icon ↔ text gap: `--spacing-4`. Help-group ↔ counter gap: `--spacing-12`.

---

## Layout

| Element | Size | Notes |
|---------|------|-------|
| Row | min-height 16px | Fixed 16px row; constant across states. Stretches to 100% of the field |
| Icon | 12×12 glyph in a 12×16 box | Centred; only shown alongside text |
| Help text | `--font-size-12` / 16px line | Single line, truncates with ellipsis |
| Counter | `--font-size-11` / 14px line | Tabular nums; hugs the trailing edge, centre-aligned |

When both `text` and `counter` are empty the component renders nothing — it does not reserve the 16px row.

---

## Motion

Colour cross-fades on state change (`transition: color 120ms ease`); respects `prefers-reduced-motion` by swapping colours instantly.

## Do / Don't

- ✅ Use one helper row per field; point the field's `aria-describedby` at it.
- ✅ Use `error`/`negative` for validation failures so it announces assertively.
- ✅ Use `counter` for length-limited inputs (textarea, OTP, etc.).
- ❌ Don't rely on colour alone — keep the text descriptive.
- ❌ Don't hand-roll a helper row with raw `<span>`s when a field needs one — use this component.
