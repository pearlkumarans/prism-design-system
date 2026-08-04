# Radio

**Design System:** UEMS Design System 3.0

The Radio is a standalone single-choice control — the sibling of `<ds-checkbox>`. It renders a real `<input type="radio">` wrapped in a `<label>` so the control and label are both clickable, native form semantics and keyboard focus keep working, and same-`name` radios behave as one group natively. For a labelled set with a legend + helper row, use `<ds-radio-group>`.

The runtime implementation lives at:

- `radio.css` — BEM, token-driven (no hardcoded hex)
- `radio.js` — `<ds-radio>` host that builds a `<label>` + visually-hidden `<input type="radio">` + visual ring

The component auto-injects `radio.css`, so it is fully styled wherever it is used without the host page linking the stylesheet.

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `size` | `s` \| `m` \| `l` \| `mobile` (aliases: `small`→`s`, `medium`→`m`) | `m` | Control + label scale. `mobile` uses a 44px touch row. |
| `checked` | boolean | unset | Selected state; mirrored to the inner input. |
| `disabled` | boolean | unset | Disables interaction; mirrors to inner input. |
| `error` | boolean | unset | Error styling (red ring/label) + `aria-invalid`. |
| `label` | string | — | Label text. Falls back to default-slotted text content. |
| `value` | string | — | Submitted value; forwarded to the inner input. |
| `name` | string | — | Group name; same-`name` radios deselect natively. |
| `show-help-icon` | boolean | unset | Trailing ⓘ info-circle icon, sized to match the control. |
| `rtl` | boolean | unset | Mirrors layout (sets `dir="rtl"` on the wrapper). |

### Slots

- default — label content when `label` is not set (`<ds-radio>Text</ds-radio>`).

### Properties (JS)

- `checked` (get/set boolean), `value` (get/set string), `disabled` (get/set boolean)

### Methods

- `click()`, `focus(opts)` — proxy to the inner `<input>`

### Events

| Event | Detail | When |
|-------|--------|------|
| `change` | native | The native input fires `change`. |
| `ds-radio-change` | `{ checked, value }` | On selection; bubbles + composed. |

---

## Sizes

| Size | Control | Label font / line-height | Notes |
|------|---------|--------------------------|-------|
| `s` | 16px | 14 / 20 | |
| `m` | 20px | 14 / 20 | Default |
| `l` | 24px | 16 / 24 | |
| `mobile` | 20px | 16 / 24 | 12px gap, 44px min touch row |

---

## Token mapping

| Part | Token |
|------|-------|
| Ring background | `--uems-bg-primary-alt` / `--uems-bg-base` |
| Ring border | `--uems-border-primary` / `--uems-border-secondary` |
| Hover (unselected) border | `--uems-border-accent` |
| Selected disc | `--uems-bg-button-primary` |
| Selected disc hover | `--uems-bg-button-primary-hover` |
| Center dot | `--uems-text-white` |
| Focus ring | `--uems-border-accent-focus` |
| Error ring / disc | `--uems-border-error` / `--uems-bg-error-solid` |
| Error label | `--uems-text-error` |
| Disabled ring | `--uems-bg-disabled` / `--uems-border-disabled` |
| Disabled + selected disc | `--uems-bg-accent-disabled` |
| Help icon | `--uems-icon-tertiary` |

---

## Grouping

Give every radio in a set the same `name`. Native radio grouping deselects same-`name` siblings; the component mirrors that onto each sibling's `checked` attribute so component state stays in sync with what is rendered. Selection within a group works across the whole document (or shadow root) the radios share.

## Accessibility

- Built on a native `<input type="radio">` inside a `<label>` — full keyboard support (arrow keys move within a group, Space selects) and screen-reader semantics come for free.
- Focus ring (`--uems-border-accent-focus`) is shown on the visible circle when the hidden input is focused via keyboard.
- `error` sets `aria-invalid="true"`; `disabled` sets `aria-disabled` on the wrapper.

## Do / Don't

- ✅ Use radios for mutually-exclusive choices; use `<ds-checkbox>` for independent toggles.
- ✅ Give every option in a group the same `name`.
- ✅ Surface the trailing ⓘ help icon (`show-help-icon`) when an option needs explanation — don't skip it as "minor".
- ❌ Don't use a single radio for an on/off toggle — that's a checkbox or switch.
- ❌ Don't hand-roll an `<input type="radio">` when this component exists.
