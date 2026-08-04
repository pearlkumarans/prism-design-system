# `<ds-text-input>`

Single-line text input with label, prefix/suffix, helper, counter.

| Attribute | Values | Default |
|---|---|---|
| `size` | `small` \| `medium` \| `large` | `medium` |
| `state` | `default` \| `error` \| `success` \| `readonly` \| `disabled` | `default` |
| `label-position` | `none` \| `top` \| `left` | `left` |
| `full-width` | boolean | — |
| `label`, `placeholder`, `value` | string | — |
| `type` | HTML input type | `text` |
| `required` | boolean | — |
| `helper`, `counter` | string | — |
| `show-counter`, `show-helper-row` | boolean | derived |
| `prefix-text`, `suffix-text` | string | — |
| `prefix-icon`, `suffix-icon` | sprite name | — |
| `show-clear` | boolean | — |
| `rtl` | boolean | — |

Each `size` caps the field width (S 160 / M 320 / L 400). Add `full-width` to override the cap and stretch the field to fill its container. Labels sit to the left by default; `label-position="top"` stacks the label above (and a left label auto-stacks below 640px), and `label-position="none"` hides the label — the text is preserved as the input's `aria-label` for screen readers.

Property: `el.value`. Event: `ds-input` — `detail: { value }`.
