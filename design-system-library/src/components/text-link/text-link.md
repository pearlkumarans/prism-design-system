# `<ds-text-link>`

Inline / standalone text link.

| Attribute | Values | Default |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `subtle` \| `danger` \| `surface` | `primary` |
| `size` | `small` \| `medium` \| `large` | `small` |
| `underline` | `always` \| `hover` \| `none` | `always` |
| `href` | URL | — |
| `target` | e.g. `_blank` | — |
| `leading-icon`, `trailing-icon` | sprite name | — |
| `label` | string | — |
| `disabled` | boolean | — |
| `rtl` | boolean | — |

`surface` uses `color: inherit` — the link takes its container's text colour instead of a
fixed link colour, for links placed **on a coloured or solid surface** (e.g. a toast CTA:
white on the solid fill, or a status colour on a light status surface). Only legible on a
coloured ground; on a plain white page it reads as ordinary body text.

Because `surface` sits on a coloured/solid ground, it **does not use the `underline="none"`
hover background pill** (`--uems-bg-accent-primary-alt`) — that light accent tint clashes
with the backdrop. On `surface`, the hover affordance is the **underline alone** (revealed on
hover, colour inherited), with no background in any state.

Slotted text becomes the link label. To change the label **after mount** (e.g. i18n /
language switch), set the reactive **`label`** attribute — `el.setAttribute('label', '…')`
— which takes precedence over the slotted text. Prefer this over `el.textContent = '…'`,
which would wipe the internal `<a>` (anchor, `href`, and icons). Mirrors `<ds-button>`'s
`label`.

`target` is honoured on the anchor; `target="_blank"` is auto-hardened with
`rel="noopener noreferrer"`.
