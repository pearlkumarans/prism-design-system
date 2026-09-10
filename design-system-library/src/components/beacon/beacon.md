# ds-beacon

A passive **coach-mark hotspot** — an always-visible pulsing dot pinned to a
target that reveals a tip on hover or click. Self-paced feature discovery, the
counterpart to the guided `ds-tour`.

> **Reuse-first.** The dot is a `<ds-status-indicator pulse show-label="false">`
> and the tip is a `<ds-popover>`. `ds-beacon` only pins the dot to the anchor
> corner, wires the open/close trigger, and handles dismiss + persistence.

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `anchor` | id ref | — | Element the beacon attaches to (required). |
| `placement` | `top-start` \| `top-end` \| `bottom-start` \| `bottom-end` \| `center-start` \| `center-end` | `top-end` | Which **corner** of the anchor the dot sits on. |
| `tip-placement` | `ds-popover` placement | `bottom` | Where the tip opens. |
| `status` | `info` \| `success` \| `warning` \| `critical` \| `alert` \| `neutral` | `info` | Dot colour → `ds-status-indicator`. |
| `title` | string | — | Tip heading (also the dot's accessible name). |
| `body` | string | — | Tip text. |
| `trigger` | `hover` \| `click` | `hover` | How the tip opens. `hover` still opens on click/keyboard for touch + a11y. |
| `dismissible` | boolean | absent | Show a **Got it** action that permanently hides the beacon. |
| `persist-key` | string | — | Dismiss-once namespace (`localStorage: uems-beacon-seen:<key>`). A seen beacon never renders. |
| `rtl` | boolean | absent | Mirror the tip + labels. |

## Methods

`show()` · `hide()` · `dismiss()` — `dismiss()` is permanent (writes `persist-key`
and fires `ds-beacon-dismiss`).

## Events (bubbling)

| Event | Fires when |
|---|---|
| `ds-beacon-open` | tip opens |
| `ds-beacon-close` | tip closes |
| `ds-beacon-dismiss` | the beacon is permanently dismissed |

## Behaviour

- **Pinned + following.** The dot is `position: fixed` at the chosen anchor corner
  and re-pins on scroll/resize (`raf-throttle`), so it tracks a moving target.
- **Hover grace.** In `hover` mode a short delay (≈160 ms) lets the cursor travel
  from the dot to the tip without it closing; the tip stays open while hovered.
- **Layering.** The dot sits at `--z-beacon` (1200) — above page content, **below**
  overlays (1300), so a `ds-tour` scrim or a modal covers it; the tip popover
  (1500) sits above.
- **Persistence.** With `persist-key`, dismissing writes the seen flag and the
  beacon won't render on the next load.

## Accessibility

The trigger is a real `<button>` with `aria-haspopup="dialog"`,
`aria-expanded`, and an `aria-label` from `title`/`body`. `Enter`/`Space` toggle
the tip; the tip (`ds-popover`) carries the focus trap, `Esc`, and focus-restore.
The pulse honours `prefers-reduced-motion` (inherited from `ds-status-indicator`).

## Design tokens

Dot colour + pulse from `ds-status-indicator`; tip chrome from `ds-popover`.
`ds-beacon` adds only layout tokens (`--spacing-*`, focus ring
`--uems-border-accent-focus`, `--z-beacon`). No hardcoded values.

## When to use

- **`ds-beacon`** — passive, ambient, one spot: “there's something new here”,
  discovered when the user is ready.
- **`ds-tour`** — active, sequential, guided: walk the user through a flow.
