# `<ds-container>`

Generic, option-rich surface / container. Light-DOM — the host carries `.ds-container` and children render untouched, so you can wrap any content. 100% token-driven (spacing / radius / colour / shadow tokens) → theme-safe, **no fixed size** (fills whatever the layout gives it).

Every knob is exposed **both** as an attribute (preset) **and** as a public CSS variable (fine-tune), so you never need to hand-write card CSS.

```html
<ds-container variant="outline" tone="warning" padding="lg" radius="xl"
         elevation="md" interactive selected stack gap="md" align="start">
  …content…
</ds-container>

<!-- one-off fine-tune: override any single value inline -->
<ds-container style="--ds-container-pad: 20px; --ds-container-bg: #fff">…</ds-container>
```

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `padding` | `none` `xs` `sm` `md` `lg` `xl` | `md` | → `--spacing-0/4/8/16/24/32` |
| `radius` | `none` `sm` `md` `lg` `xl` `2xl` `full` | `lg` | → `--radius-*` |
| `variant` | `outline` `filled` `subtle` `ghost` `elevated` | `outline` | base surface (bg + border) |
| `tone` | `accent` `success` `warning` `error` `info` `alert` | — | status tint (overrides variant bg/border) |
| `elevation` | `none` `xs` `sm` `md` `lg` `xl` | — | → `--shadow-*` |
| `interactive` | boolean | — | clickable hover lift + focus ring |
| `selected` | boolean | — | accent ring (selected/active state) |
| `stack` | boolean | — | flex **column** with a token gap |
| `row` | boolean | — | flex **row** with a token gap |
| `gap` | `none` `xs` `sm` `md` `lg` | `md` | gap for `stack` / `row` |
| `align` | `start` `center` `stretch` | — | cross-axis for `stack` / `row` |

## Public CSS variables (fine-tune without custom CSS)

`--ds-container-pad` · `--ds-container-radius` · `--ds-container-bg` · `--ds-container-border` · `--ds-container-border-width` · `--ds-container-shadow` · `--ds-container-gap`

Set any of these inline (or in a class) for values the presets don't cover, e.g. a 12px pad: `style="--ds-container-pad: var(--spacing-12)"`.

> ⚠️ If you override via a **class** in a stylesheet that loads *before* `card.css`, the preset (`[data-pad]` etc., specificity 0,2,0) can win — use an **inline style** or `!important` for those overrides. Inline styles always win.

## Notes

- The stylesheet self-injects (relative to the module), so the card is styled even on pages that don't pull the full CSS bundle.
- Children are never rewritten — safe to wrap existing markup. For a side-by-side body use `row`, or add your own inner layout class.
- For a **clickable** card add `role="button" tabindex="0"` + an Enter/Space keydown handler — `ds-container` is a div, not a native `<button>` (see the Ask Zia prompt cards).
