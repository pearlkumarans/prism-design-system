# Popover

**Design System:** UEMS Design System 3.0

The Popover is a non-modal overlay anchored to a trigger. It has no arrow. The surface is composed of an optional Header, a Body, and an optional Footer — all token-driven. Width hugs content (240px min-width, no max), with `--ds-popover-width` available for a fixed wrapping width.

The runtime implementation lives at:

- `popover.css` — BEM, token-driven (no hardcoded hex)
- `popover.js` — `<ds-popover>` host that builds a `role="dialog"` surface, positions it (flip + viewport clamp), traps Tab focus softly, and dismisses on Esc / outside click

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `open` | boolean | unset | Visibility. Toggling drives open/close lifecycle. |
| `anchor` | element id | — | Id of the trigger element the popover anchors to and toggles from. |
| `placement` | `top` \| `bottom` \| `left` \| `right` (+ `-start` \| `-center` \| `-end`) | `bottom-start` | Position relative to the anchor; flips if it doesn't fit. |
| `title` | string | — | Header title. Setting it auto-shows the header. |
| `has-header` | boolean | unset | Force-show the header even without a title. |
| `hide-close` | boolean | unset | Hide the ✕ close button when a header is shown. |
| `has-footer` | boolean | unset | Force-show the footer even when no footer content is slotted. |
| `rtl` | boolean | unset | Mirrors layout (sets `dir="rtl"`). |

### Slots (light DOM)

- default — Body content region.
- `slot="footer"` — Footer action region; the children are unwrapped into the footer.

### Methods

- `open()`, `close()`, `toggle()`

### Events

| Event | Detail | When |
|-------|--------|------|
| `ds-popover-open` | — | After the popover opens. |
| `ds-popover-close` | `{ reason }` — `'esc'` \| `'outside'` \| `'close'` \| `'api'` | After the popover closes. |

---

## Anchoring & positioning

When `anchor` points to an element id, the popover:

- Wires the trigger so clicking it toggles the popover, and sets `aria-haspopup="dialog"` / `aria-controls` / `aria-expanded` on it.
- Positions itself `position: fixed` next to the anchor with an 8px gap, flips the primary side if it doesn't fit and the opposite side fits better, and clamps into the viewport (8px margin).
- Re-positions on `resize` and `scroll` while open.

Without an `anchor`, the consumer positions the surface; the component does not auto-place it.

---

## Token mapping

| Part | Token |
|------|-------|
| Surface background | `--uems-bg-primary-alt` |
| Surface border | `--uems-border-secondary` |
| Surface radius | `--radius-lg` (12px) |
| Surface shadow | `--shadow-md` |
| Title color | `--uems-text-primary` |
| Body color | `--uems-text-secondary` |
| Close hover bg | `--uems-bg-secondary-hover` |
| Close focus ring | `--uems-border-accent-focus` |
| Stacking | `--z-popover` (1500) |

---

## Accessibility

- The surface is `role="dialog"` and is always named: `aria-labelledby` points to the title when a header is shown, otherwise it falls back to an `aria-label` ("Popover" or a supplied `aria-label`).
- Non-modal: Tab cycles softly within the surface (no hard trap of the rest of the page).
- Esc dismisses (`reason: 'esc'`); clicking outside dismisses (`reason: 'outside'`).
- On open, focus moves to the first focusable element (or the surface); on close, focus returns to the trigger / previously-focused element.
- Animation respects `prefers-reduced-motion`.

## Do / Don't

- ✅ Use for non-modal, anchored content (quick actions, confirmations, contextual help).
- ✅ Put primary/secondary buttons in `slot="footer"` for confirmations.
- ❌ Don't use a popover for blocking, must-acknowledge flows — use a modal/dialog.
- ❌ Don't set a `max-width`; let width hug content or set `--ds-popover-width` for wrapping.
