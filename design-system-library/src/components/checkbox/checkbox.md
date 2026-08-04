# Checkbox

Standalone checkbox. Wraps a native `<input type="checkbox">` so all form semantics, focus, and keyboard behavior remain native; the visible box is a styled sibling.

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `label` | string | — | Visible label text |
| `value` | string | — | Submitted form value when checked |
| `name` | string | — | Form name |
| `checked` | boolean | unset | Initial / current checked state |
| `indeterminate` | boolean | unset | Mixed state (only meaningful when not checked) |
| `disabled` | boolean | unset | Non-interactive |
| `error` | boolean | unset | Error styling (red border / red fill on checked) |
| `size` | `small` \| `medium` | `medium` | 16×16 vs 20×20 box |
| `rtl` | boolean | unset | Mirrors layout |

## Events

- `change` — native; `e.target.checked` is the new state
- `ds-checkbox-change` — custom; `detail = { checked, value }`

## Tokens

| Element | Token |
|---|---|
| Box bg (default) | `--bg-primary-alt` |
| Box border (default) | `--border-primary` |
| Checked bg | `--bg-button-primary` |
| Checked checkmark | `--text-white` |
| Error border | `--border-error` |
| Error checked bg | `--bg-error-solid` |
| Disabled bg | `--bg-disabled-subtle` |
| Disabled border | `--border-disabled` |
| Disabled label | `--text-disabled` |
| Focus ring | `--border-accent-focus` |
