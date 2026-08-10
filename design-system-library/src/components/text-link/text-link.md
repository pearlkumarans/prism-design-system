# `<ds-text-link>`

Inline / standalone text link.

| Attribute | Values | Default |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `subtle` \| `danger` | `primary` |
| `size` | `small` \| `medium` \| `large` | `small` |
| `underline` | `always` \| `hover` \| `none` | `always` |
| `href` | URL | — |
| `target` | e.g. `_blank` | — |
| `leading-icon`, `trailing-icon` | sprite name | — |
| `label` | string | — |
| `disabled` | boolean | — |
| `rtl` | boolean | — |

Slotted text becomes the link label. To change the label **after mount** (e.g. i18n /
language switch), set the reactive **`label`** attribute — `el.setAttribute('label', '…')`
— which takes precedence over the slotted text. Prefer this over `el.textContent = '…'`,
which would wipe the internal `<a>` (anchor, `href`, and icons). Mirrors `<ds-button>`'s
`label`.

`target` is honoured on the anchor; `target="_blank"` is auto-hardened with
`rel="noopener noreferrer"`.
