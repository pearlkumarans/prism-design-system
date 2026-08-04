# ds-stepper

Step progress indicator for a sequence of steps — **horizontal** or **vertical**.
The connector is rendered as part of each step (a leading segment for horizontal,
a trailing segment for vertical) and **fills as progress advances**. Built entirely
from design tokens and `ds-icon`; no hardcoded visual values.

## Usage

```html
<ds-stepper id="wiz" active="1"></ds-stepper>
<script type="module">
  document.getElementById('wiz').steps = [
    { id: 'account', label: 'Account', description: 'Sign in' },
    { id: 'details', label: 'Details', description: 'Your info' },
    { id: 'plan',    label: 'Plan' },
    { id: 'review',  label: 'Review' },
  ];
  document.getElementById('wiz').addEventListener('ds-stepper-select', (e) => {
    console.log(e.detail.index, e.detail.id);
  });
</script>
```

## Data

Set via the `.steps` (or `.items`) JS property:

```js
el.steps = [{ id, label, description?, status?, icon?, number?, optional?, disabled? }];
```

| Field | Meaning |
|---|---|
| `id` | Unique key (emitted in the select event) |
| `label` | Step title |
| `description` | Secondary line |
| `status` | Force a state: `upcoming` / `active` / `completed` / `error` / `warning` / `disabled`. If omitted it's derived from `active`. |
| `icon` | Sprite name for the step's label-based node icon, shown in numberless mode (`hide-numbers`). Completed steps always show a check regardless. |
| `number` | Override the auto index number |
| `optional` | Shows an "Optional" tag |
| `disabled` | Non-interactive step |

Status precedence: explicit `status` → `disabled` flag → derived from `active`
(`index < active` = completed, `=== active` = active, else upcoming).

## Attributes

| Attribute | Type | Default | Use case |
|---|---|---|---|
| `orientation` | `horizontal` \| `vertical` | `horizontal` | Layout axis |
| `size` | `sm` \| `md` \| `lg` | `md` | Node + type scale (20 / 24 / 32px node) |
| `active` | number | `0` | Current step index |
| `mode` | `linear` \| `nonlinear` | `linear` | Linear locks steps after `active` |
| `clickable` | boolean | off | Make steps interactive (buttons) |
| `label-placement` | `below` \| `inline` | `below` | Horizontal only — labels under vs beside the node |
| `connector` | `solid` \| `dashed` \| `none` | `solid` | Connector style |
| `hide-numbers` | boolean | off | Numberless mode — each step shows its own `icon` (label-based) instead of the number; completed still shows a check |
| `hide-labels` | boolean | off | Compact — hides the whole label block |
| `hide-descriptions` | boolean | off | Titles only |
| `rtl` | boolean | auto | Mirror (also auto-detected from `[dir="rtl"]`) |

CSS custom props: `--ds-stepper-node-size`, `--ds-stepper-gap`, `--ds-stepper-connector-thickness`.

## Events

- `ds-stepper-select` → `detail { id, index, step }` — fires on click of an
  interactive step (bubbles + composed). The active state updates first.

## Methods

- `next()` / `prev()` — advance/retreat one step.
- `goTo(index)` — jump to a step (clamped to range).
- `setStatus(id, status)` — flag a step, e.g. `setStatus('payment', 'error')` after validation.

## Interactions & progression

- Connectors up to and including the active step fill with the accent/success
  colour (the "progress trail"); upcoming segments stay neutral.
- Node glyph: **completed** always shows a check; in default mode every other
  step shows its **number**; in numberless mode (`hide-numbers`) every other step
  shows its own **label-based `icon`** from the step data. error/warning/disabled
  recolour the node and label via tokens.
- Clickable / non-linear steps are real `<button>`s; in `linear` mode steps after
  `active` are non-interactive (`aria-disabled`).

## Accessibility

- Root is `role="list"` with `aria-label="Progress"`; each step a list item; the
  current step carries `aria-current="step"`.
- A visually-hidden `role="status"` live region announces "Step N of M: <label>".
- Error steps get `aria-invalid`.
- Interactive steps are keyboard-operable (`Enter` / `Space`); connectors are `aria-hidden`.
- Colour pairs meet WCAG AA; node transitions respect `prefers-reduced-motion`.

## States (examples)

Horizontal (below / inline) · Vertical · Error + Warning/Optional · Clickable
non-linear · Sizes sm/md/lg · Dashed · Dots (hide-numbers) · Titles-only
(hide-descriptions) · Vertical wizard rail with a disabled step. See
`stepper.examples.html`.

## Responsive & RTL

- **Responsive collapse** — below a 600px viewport, a **horizontal** stepper collapses
  to a compact "Step N of M: &lt;label&gt;" summary with a progress bar (vertical
  steppers are unaffected). The step list is hidden; the compact summary is
  `aria-hidden` since the live region already announces progress.
- **RTL** — set `rtl` (or place under `[dir="rtl"]`). The layout mirrors via the
  writing direction and logical properties: horizontal step order reverses,
  connectors and the compact progress bar flip, and vertical steppers put the node
  on the right with labels on the left.

## Notes

- A **wizard** is a composition, not a separate component: `ds-stepper` (indicator)
  + step panels + a `ds-button` footer (Back / Next / Finish — right-aligned),
  driven via `next()`/`prev()`/`setStatus()` and the `ds-stepper-select` event.
- Reuses `ds-icon` (`tick` for completed); no new icons introduced.
