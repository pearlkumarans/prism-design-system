# `<ds-slider>`

Single-value slider built on `<input type="range">`.

| Attribute | Values | Default |
|---|---|---|
| `size` | `small` \| `medium` \| `large` | `small` |
| `value`, `min`, `max`, `step` | numbers | `50`, `0`, `100`, `1` |
| `label` | string | `Label` |
| `helper` | string | — |
| `show-min-max` | boolean | — |
| `min-label`, `max-label` | string | `min`/`max` |
| `show-value`, `show-label` | `false` to hide | shown |
| `state` | `error` | — |
| `disabled` | boolean | — |

Events: `ds-slider-input` (every tick), `ds-slider-change` (drag end).
