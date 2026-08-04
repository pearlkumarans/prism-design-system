# `<ds-radio-group>`

Mutually exclusive option set with shared label, optional info icon, helper text, and validation states.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `label` | string | — | Group title, rendered as a `<legend>`. |
| `helper` | string | — | Helper / error text below the options. |
| `size` | `s` \| `m` \| `l` \| `mobile` | `m` | Controls **14 / 16 / 20 / 20** px; label 12 / 14 / 16 / 16. (Note: Figma `15771:12260` specs 16/20/24/20 — kept at 14/16/20/20 per product preference.) |
| `state` | `default` \| `error` \| `disabled` | `default` | Validation / interaction state. |
| `label-position` | `none` \| `left` \| `top` | `left` | `left` lays options horizontally (16px gap); `top` stacks them (10px gap); `none` hides the group label — the text stays as the radiogroup's `aria-labelledby` name. |
| `variant` | `default` \| `card` | `default` | `card` renders each option as a selectable card — neutral grey when unselected, accent tint + accent border when selected. Tokens only. |
| `name` | string | auto | HTML `name` shared by all radios. |
| `rtl` | boolean | — | Right-to-left layout. |
| `show-info` | boolean | — | Show an info-circle next to the group label. |
| `value` | string | — | Selected option's value. Setting it updates the UI. |

## Properties

```js
group.options = [
  // `info` (string) renders a help icon after the label with a ds-tooltip.
  { value, label, selected?, disabled?, info? },
];
group.value;          // current selected value
group.value = 'csv';  // programmatic select
```

### Card variant

```html
<ds-radio-group variant="card" name="verdict" label-position="left"></ds-radio-group>
```
```js
group.options = [
  { value: 'tp', label: 'True Positive',  selected: true, info: 'Correctly flagged as a real threat.' },
  { value: 'fp', label: 'False Positive', info: 'Flagged but actually benign.' },
];
```
Selected card → `--uems-bg-accent-primary-subtle` fill + `--uems-border-accent`; unselected → `--uems-bg-secondary`; help icon → `--uems-text-accent-link`.

## Token bindings (per state × selected — synced to Figma 2026-06-15)

| State | Unselected | Selected |
|---|---|---|
| Default | ring `--uems-border-primary`, fill `--uems-bg-base` | disc `--uems-bg-button-primary` + white dot |
| Hover | ring `--uems-border-accent` | disc `--uems-bg-button-primary-hover` |
| Disabled | fill `--uems-bg-disabled-subtle`, ring `--uems-border-disabled`, label `--uems-text-disabled` | disc `--uems-bg-accent-disabled`, label `--uems-text-secondary` |
| Error | ring `--uems-border-error`, label `--uems-text-error` | disc `--uems-bg-error-solid` |
| Focus | + 2px `--uems-border-accent-focus` ring (outline) | same |

## Events

- `ds-radio-group-change` — `detail: { value }`

## Accessibility

- Wrapped in a `<fieldset role="radiogroup">` with the legend as the accessible name.
- Helper text is associated via `aria-describedby` on each input.
- `aria-invalid="true"` is applied in `error` state.
