# Modal

**Design System:** UEMS Design System 3.0

A general-purpose, **left-aligned** dialog centered on a scrim. Layout: header (optional leading icon + title + description + optional trailing action + close) · body (scrolls) · footer (leading text-link + right-aligned button group). The dialog can be dragged by its header. Light-DOM — content you place is distributed into regions by `slot`. Distinct from `ds-confirmation-modal` (centered, compact).

The runtime implementation lives at:

- `modal.css` — BEM, token-driven (no hardcoded hex)
- `modal.js` — `<ds-modal>` host that builds the dialog/overlay chrome and slots your content

```html
<ds-modal title="Edit profile" description="Update your account details." size="md" open>
  <p>Body content (scrolls)…</p>
  <ds-button slot="footer-start" variant="tertiary">Reset</ds-button>
  <ds-button slot="footer" variant="secondary">Cancel</ds-button>
  <ds-button slot="footer" variant="primary">Save</ds-button>
</ds-modal>
```

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `size` | `sm` \| `md` \| `lg` | `md` | Dialog width: 480 / 640 / 880 |
| `title` | string | `Modal title` | Header title text |
| `description` | string | — | Short description under the title |
| `show-header` | boolean (default true) | `true` | Set `="false"` to hide the header |
| `show-footer` | boolean (default true) | `true` | Set `="false"` to hide the footer |
| `dismiss-on-overlay` | boolean | unset | Opt in so a scrim click closes (e.g. info modals) |
| `rtl` | boolean | unset | Mirrors layout (sets `dir="rtl"`) |
| `open` | boolean | unset | Presence opens the modal |

> Note: `show-header` and `show-footer` default to **true** — disable them with the explicit string value `="false"`. `dismiss-on-overlay` defaults to **off** — add it to opt in.

### Slots

- `slot="icon"` — leading icon circle (auto-shows when present)
- `slot="header-action"` — trailing header action, before the close button (auto-shows when present)
- default / `slot="body"` — body content region (scrolls)
- `slot="footer-start"` — leading footer text link
- `slot="footer"` — right-aligned footer buttons

### Methods

- `open()` — sets the `open` attribute
- `close()` — removes the `open` attribute

### Properties

- `returnFocusTo : HTMLElement | null` — focus-restore target on close (defaults to the element focused before opening)

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-modal-open` | — | Modal opens |
| `ds-modal-close` | `{ reason: 'esc' \| 'overlay' \| 'close' }` | Modal closes |

All events bubble.

---

## Sizes

| Size | Width |
|------|-------|
| `sm` | 480px |
| `md` | 640px (default) |
| `lg` | 880px |

The dialog is pinned 80px from the top, centered horizontally; tall content scrolls within `max-height: calc(100vh - 96px)`.

---

## Behavior

- **Modal always:** renders a scrim, traps Tab focus inside the dialog, and Esc closes. On open, focus moves to the first focusable child (or the dialog); on close, focus returns to `returnFocusTo` / the previously focused element.
- **Overlay dismissal:** a scrim click closes the modal only when `dismiss-on-overlay` is set. Default is off so accidental clicks don't discard work.
- **Draggable:** the dialog can be moved by dragging its header (clamped 8px inside the viewport). Drags that start on a control or on the title/description text are ignored. Position re-centers on each open.

## Accessibility

- The dialog is `role="dialog"` with `aria-modal="true"`, `aria-labelledby` the title, and `aria-describedby` the description (or body when no description).
- Esc closes; Tab is trapped within the dialog.
- Always give a meaningful `title` so the dialog is announced.

## Do / Don't

- ✅ Keep the primary action in the footer, right-aligned; pair with a Cancel.
- ✅ Use a leading icon + Destructive footer button for irreversible confirmations.
- ❌ Don't enable `dismiss-on-overlay` for modals containing unsaved input.
- ❌ Don't hide both header and footer such that the user has no obvious way to close.
