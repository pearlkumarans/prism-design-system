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
| **Anchored** | `'#id'` / element | `ds-popover` (anchor, placement, arrow) | `ds-overlay` (mask) — spotlight cutout on the target |
| **Corner** | `null` + `corner` | `ds-popover` (no anchor, pinned to a screen corner, no arrow) | **None** — non-blocking, the page stays interactive |
| **Centered** | `null` (or missing) | `ds-modal` (welcome / summary — `md` / 640px) | modal's own scrim |

## Attributes

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `mask` | `dim` \| `light` \| `blur` \| `dim-blur` \| `none` | `dim` | Backdrop type for anchored steps → passed to `ds-overlay`. `none` = no scrim. |
| `persist-key` | string | — | Namespace for the "seen" flag. Set → the tour persists to `localStorage` (`uems-tour-seen:<key>`) and fires lifecycle events for backend sync. |
| `auto-start` | boolean | absent | Run once **if** `persist-key` is unset or not yet seen. Fires as soon as both the attribute and `steps` are in place, so `<ds-tour auto-start>` + a later `tour.steps = […]` (e.g. from a deferred module) works regardless of order. Deferred two frames so late-mounted targets exist. |
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
| `target` | `'#id'` \| `Element` \| `null` | `null` (or an unresolvable selector) → centered modal step, unless `corner` is set. |
| `corner` | `bottom-right` \| `bottom-left` \| `top-right` \| `top-left` | Target-less only. Pins the card to a screen corner (no arrow) instead of centering it — the **feature-announcement** spotlight. **No backdrop** — non-blocking, so it can sit over a live screen (e.g. right after login). Default corner `bottom-right`. |
| `title` | string | Card heading. |
| `body` | string | Card body text (plain text — no HTML injection in Phase 1). |
| `image` | URL string | Optional image shown at the top of the card (welcome art, a feature screenshot). |
| `imageAlt` | string | Alt text for `image`. |
| `placement` | `ds-popover` placement | Anchored steps only. Default `bottom-start`. |
| `size` | `small` \| `medium` \| `large` | Card width — **260 / 320 / 400** px. Default `medium` (anchored / centered); a `corner` announcement defaults `large`. |
| `arrow` | boolean | Show the beak pointing at the target. Default `true`; set `false` to drop it. Anchored steps. |
| `primaryLabel` | string | Override the primary button label (`Next` / `Done`) for this step. |
| `learnMoreHref` | URL string | Adds an inline **"Learn more"** link trailing the body copy (`learnMoreLabel` overrides the text, `learnMoreTarget` sets the anchor target). |
| `secondaryLabel` | string | **Feature spotlight only** — a soft-decline text link below the full-width primary (e.g. "I'll do it later"). Dismisses the announcement as a **remind-me-later**: it fires `ds-tour-skip` but does **not** persist the `persist-key` seen flag, so it surfaces again next time (unlike the ✕ / `Esc`, which do mark it seen). |
| `spotlightPadding` | number | Gap (px) between the target and the spotlight cutout / ring. Default `8`. |
| `advanceOn` | event name | **Interactive step** — advance when this DOM event fires on the target (e.g. `'click'`). The spotlight cutout makes the target click-through; `Next` still works as an escape hatch. |
| `hint` | string | Instruction shown on an `advanceOn` step (default: the `hint` label). |

## Property — `labels` (i18n override)

Override any control string; unset keys fall back to the built-in `en` / `ar`
(under `rtl`) defaults.

```js
tour.labels = { skip: 'Dismiss', close: 'Close', back: 'Back', next: 'Continue', done: 'Finish', of: '/', hint: 'Try it' };
```

## Methods

`start(fromIndex = 0)` · `next()` · `prev()` · `goTo(i)` · `end({ completed })`

## Events (bubbling)

| Event | Detail | Fires when |
|---|---|---|
| `ds-tour-start` | — | `start()` |
| `ds-tour-step` | `{ index, total, step }` | each step shown |
| `ds-tour-complete` | — | advancing past the last step |
| `ds-tour-skip` | `{ remindLater }` | user dismisses (Skip / `Esc` / overlay / ✕, or a `secondaryLabel` "remind me later" — `remindLater: true`, which doesn't persist "seen") |
| `ds-tour-end` | `{ completed }` | always, after complete or skip |

Wire `ds-tour-step` / `-complete` / `-skip` to analytics, and `-complete`/`-skip`
to a backend "seen" write if `localStorage` alone isn't enough.

## Behaviour

- **Feature spotlight (single step).** A tour with exactly one step is a single
  card with nothing to page through — so it drops the progress + Back and shows a
  single **full-width primary button** (label from `primaryLabel`, default "Done";
  e.g. "Got it"). The close ✕ still dismisses. Works for an anchored card, a
  centered one, or a corner announcement.
- **Corner announcement.** A target-less step with `corner` set pins the card to a
  screen corner (default `bottom-right`) with **no backdrop** — the page stays fully
  interactive behind it, so it can sit over a live screen (e.g. right after login)
  without blocking work. It doesn't light-dismiss on an outside click either — it
  persists until the action, the ✕, or `Esc`. The close ✕ reads **"Close"** here
  (not "Skip tour"), since there's no multi-step tour to skip. It reads best as a
  single-step feature spotlight (image on top, no arrow, full-width action). It
  defaults to the **large** (400px) card and carries more presence than an anchored
  tip — a larger elevation (`--shadow-xl`), rounder corners (`--uems-radius-l`), and
  a slightly larger title (`--font-size-16`). A step's own `size` still overrides.
  It **slides in** from the nearest screen edge (bottom corners rise, top corners
  drop) over ~560ms with decelerate easing — a slow, deliberate entrance;
  suppressed under `prefers-reduced-motion`. On phones it docks as
  a bottom sheet like anchored steps.
- **Card footer & skip.** The footer is one row: pagination (dots + *n of N*) on
  the lead, Back / Next trailing (no trailing icon). Buttons are `small` on the
  centered welcome dialog and the tighter `xsmall` on the anchored slides. There is
  no separate Skip link — the close ✕ is the skip affordance, with
  `aria-label="Skip tour"` and a **hover-only** "Skip tour" `ds-tooltip` (icon off):
  on open, focus is moved to Next so the tooltip doesn't fire from the ✕'s
  auto-focus; it appears on hover (and keyboard focus of the ✕).
- **Pagination excludes centered steps.** A centered step (`target: null`, e.g. the
  welcome / summary bookends) shows no pagination and is not counted — the count
  reflects the anchored steps only (so a welcome + 3 anchored steps read "1 of 3"
  … "3 of 3").
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
- **Interactive steps (P4).** `advanceOn` makes a step wait for the user's real
  action on the target instead of a `Next` click — the basis for do-it-yourself
  tours.
- **Mobile (P4).** Below 640px, anchored steps dock as a bottom sheet (arrow
  dropped); the spotlight still highlights the target above.
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
inherited a11y. Phase 2: **spotlight cutout** — `ds-overlay.spotlight()`. Phase 3:
**`ds-beacon`** passive coach-mark. Phase 4 (done): **interactive `advanceOn`
steps, mobile bottom-sheet, i18n `labels`** (analytics hooks already ship as the
`ds-tour-*` events).
