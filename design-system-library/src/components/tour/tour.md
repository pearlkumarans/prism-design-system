# ds-tour

Guided **page tour** orchestrator — a step-by-step walkthrough for onboarding,
feature adoption, and in-context help. The host `<ds-tour>` is an invisible
**controller**: it renders nothing itself, walks a `steps[]` array, and composes
existing Prism surfaces for each step.

> **Reuse-first.** A tour step's chrome — focus trap, `Esc`, focus-restore,
> positioning, arrow — is inherited from `ds-popover` / `ds-modal`. `ds-tour` adds
> only what nothing else does: sequencing, progress, persistence, screen-reader
> announcements, and keyboard steering.

| Step kind | `step.target` | Surface used | Backdrop |
|---|---|---|---|
| **Anchored** | `'#id'` / element | `ds-popover` (anchor, placement, arrow) | `ds-overlay` (mask) |
| **Centered** | `null` (or missing) | `ds-modal` (welcome / summary) | modal's own scrim |

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `mask` | `dim` \| `light` \| `blur` \| `dim-blur` \| `none` | `dim` | Backdrop type for anchored steps → passed to `ds-overlay`. `none` = no scrim. |
| `persist-key` | string | — | Namespace for the "seen" flag. Set → the tour persists to `localStorage` (`uems-tour-seen:<key>`) and fires lifecycle events for backend sync. |
| `auto-start` | boolean | absent | Run once on connect **if** `persist-key` is unset or not yet seen. Deferred two frames so late-mounted targets exist. |
| `linear` | boolean | absent | Reserved — lock skipping ahead (Phase 4). |
| `rtl` | boolean | absent | Mirror the card, progress, and control labels. |

## Property — `steps`

Data-driven (settable before or after upgrade), matching `ds-stepper` /
`ds-data-table`.

```js
tour.steps = [
  { target: null, title: 'Welcome', body: 'A 4-step tour.', primaryLabel: 'Start tour' },
  { target: '#create', placement: 'bottom-start', title: 'Create', body: 'Start here.' },
  { target: '#reports', placement: 'top-start', title: 'Track it', body: 'Scrolls into view first.' },
];
```

| Step field | Type | Notes |
|---|---|---|
| `target` | `'#id'` \| `Element` \| `null` | `null` (or an unresolvable selector) → centered modal step. |
| `title` | string | Card heading. |
| `body` | string | Card body text (plain text — no HTML injection in Phase 1). |
| `placement` | `ds-popover` placement | Anchored steps only. Default `bottom-start`. |
| `primaryLabel` | string | Override the primary button label (`Next` / `Done`) for this step. |
| `showSkip` | boolean | Default `true`. The last step never shows Skip. |
| `spotlightPadding` | number | Gap (px) between the target and the spotlight cutout / ring. Default `8`. |

## Methods

`start(fromIndex = 0)` · `next()` · `prev()` · `goTo(i)` · `end({ completed })`

## Events (bubbling)

| Event | Detail | Fires when |
|---|---|---|
| `ds-tour-start` | — | `start()` |
| `ds-tour-step` | `{ index, total, step }` | each step shown |
| `ds-tour-complete` | — | advancing past the last step |
| `ds-tour-skip` | — | user dismisses (Skip / `Esc` / overlay / ✕) |
| `ds-tour-end` | `{ completed }` | always, after complete or skip |

Wire `ds-tour-step` / `-complete` / `-skip` to analytics, and `-complete`/`-skip`
to a backend "seen" write if `localStorage` alone isn't enough.

## Behaviour

- **Advance vs. dismiss.** A surface dismissed by the user fires its close event
  with a `detail.reason` (`esc` / `overlay` / `close`); `ds-tour`'s own teardown
  fires none. So *reason-present = user wants out = skip* — advancing never
  mis-fires a skip.
- **Spotlight (P2).** Anchored steps call `ds-overlay.spotlight(target)` — the
  scrim dims everything except the target's rect (blur preserved, ring drawn,
  target click-through), following it on scroll/resize.
- **Scroll into view.** Anchored targets are scrolled to centre before the card
  paints. A live backdrop locks body scroll, so the tour briefly lifts the lock
  around an instant scroll (below-fold targets would otherwise be unreachable on
  an anchored→anchored transition).
- **Persistence.** Both complete and skip mark the tour seen, so `auto-start`
  never re-nags; the distinct events let consumers act more finely.
- **Missing target.** A selector that resolves to nothing degrades to a centered
  step rather than failing.

## Accessibility

- **Inherited** from the surface: `role="dialog"`, focus trap, `Esc`, and
  focus-restore-to-trigger (`ds-popover` / `ds-modal`).
- **Added** by `ds-tour`: an `aria-live="polite"` region announcing
  “Step *n* of *N*: *title*”, and keyboard steering — `→` next / `←` back
  (mirrored under `rtl`; suppressed while a form field is focused). `Esc` skips.
- Respects `prefers-reduced-motion` (no dot animation, no smooth scroll).

## Design tokens

Card & scrim come from `ds-popover` / `ds-modal` / `ds-overlay` tokens. `ds-tour`
adds only: progress dots use `--uems-bg-button-primary` (done/current) and
`--uems-bg-quaternary-solid` (upcoming); spacing via `--spacing-*`; type via
`--font-size-*`; motion via `--duration-fast` / `--ease-standard`. No hardcoded
values.

## Roadmap

Phase 1: core engine — anchored + centered steps, progress, persistence,
inherited a11y. Phase 2 (done): **spotlight cutout** — `ds-overlay.spotlight()`
dims all but the target, with a focus ring, blur-preserving, click-through.
**Later:** `ds-beacon` passive hotspot (P3), branching `advanceOn`, mobile
bottom-sheet, analytics polish (P4).
