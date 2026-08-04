# `<ds-text-area>`

Multi-line text input. Same API as `<ds-text-input>` minus the affixes; adds `max-lines`.

| Attribute | Values | Default |
|---|---|---|
| `state` | `default` \| `error` \| `success` \| `readonly` \| `disabled` | `default` |
| `label-position` | `none` \| `top` \| `left` | `left` |
| `full-width` | boolean | — |
| `label`, `placeholder`, `value`, `helper`, `counter` | string | — |
| `required`, `show-counter`, `show-helper-row` | boolean | — / derived |
| `max-lines` | 2 / 3 / 4 / 5 | `3` |
| `rtl` | boolean | — |

The field width is capped per size (M 320 / L 400). Add `full-width` to override the cap and stretch the field to fill its container. Labels sit to the left by default; `label-position="top"` stacks the label above (a left label auto-stacks below 640px), and `label-position="none"` hides the label — the text is preserved as the textarea's `aria-label`.

Property: `el.value`. Event: `ds-input` — `detail: { value }`.
