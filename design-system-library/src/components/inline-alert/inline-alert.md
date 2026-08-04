# `<ds-inline-alert>`

Semantic banner that lives inline in the page flow.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `type` | `info` \| `success` \| `warning` \| `error` \| `neutral` | `info` | Drives icon, title colour, background tint. |
| `style-variant` | `subtle` \| `intense` | `subtle` | Tinted vs solid fill. |
| `title` | string | — | Heading text. |
| `description` | string | — | Body text. |
| `action` | string | — | Action label. Renders an inline button-link. |
| `action-position` | `inline` \| `bottom` | `inline` | `inline` flows the action at the end of the description text; `bottom` puts it on its own line below. |
| `show-dismiss` | boolean | — | Shows the close button. |
| `show-icon` | boolean (`false` to hide) | shown | Status icon. |
| `rtl` | boolean | — | Right-to-left layout. |

## Events

- `ds-inline-alert-action` — fired when the action link is activated.
- `ds-inline-alert-dismiss` — fired before the alert removes itself.

## Accessibility

- Renders `role="alert"` for `error`/`warning`, `role="status"` for the rest.
- `aria-live="assertive"` on `error`/`warning`, `polite` otherwise.
- Status icon is decorative (`aria-hidden`).
- Dismiss button has `aria-label="Dismiss alert"`.
