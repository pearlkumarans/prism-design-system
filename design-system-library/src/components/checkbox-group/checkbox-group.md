# Checkbox Group

Wraps individual `<ds-checkbox>` items under a shared label, optional help text, optional counter. Supports two layouts (Left / Top) and three states (Default / Error / Disabled).

**Figma source:** UEMS Design System 3.0 · Node `17918:385584`

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `label` | string | — | Group label |
| `label-position` | `none` \| `left` \| `top` | `left` | Layout axis. `none` hides the group label — the text stays as the items group's `aria-label`. |
| `size` | `small` \| `medium` | `medium` | Cascades onto child checkboxes |
| `state` | `default` \| `error` \| `disabled` | `default` | Whole-group state |
| `help-text` | string | — | Below the items; turns red on error |
| `show-help-icon` | boolean | `true` (default) | Info icon next to the label |
| `show-counter` | boolean | unset | Renders the counter slot |
| `counter` | string | — | Counter text (e.g. `"2/5"`) |
| `value` | string | — | Comma-separated list of checked values |
| `name` | string | — | HTML name shared by child inputs |
| `rtl` | boolean | unset | Right-to-left |

### Events

- `ds-checkbox-group-change` → `detail = { values: string[] }`

### JS getter / setter

- `el.values` → `string[]` of currently-checked values
- `el.values = ['a','b']` → applies the controlled selection

## Token mapping

| Element | Token |
|---|---|
| Group label | `--text-tertiary` |
| Help text | `--text-quaternary` |
| Help text (error) | `--text-error` |
| Item gap (left layout) | `--spacing-16` |
| Item gap (top layout) | `--spacing-12` |
| Header → body gap (left) | `--spacing-12` |
| Header width (left) | 240 px |

## Behavior

- **Children-as-source-of-truth** — captured once on mount; subsequent attribute changes cascade onto them (size, state, rtl, name, checked-from-`value`).
- **Disabled state** uses `pointer-events: none` + `opacity` on the group, plus `disabled` attr on each child input. Form submission is blocked natively.
- **Error state** sets `aria-invalid="true"` on each child input (via the child's own `error` attr).
