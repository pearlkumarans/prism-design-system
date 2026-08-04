# Content

**Design System:** UEMS Design System 3.0

The Content area is the main scrollable body region of an app-shell page. It sits inside the shell `.body` next to the L1/L2 sidebars, takes the remaining horizontal space, and scrolls vertically. The runtime implementation lives at:

- `content.css` — token-driven, light-DOM (the host element carries the `.ds-content` class)
- `content.js` — `<ds-content>` host that renders its slotted children directly (no shadow root) so apps can style page content freely

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `framed` | boolean | unset | Gives the content a rounded top-left + bottom-left corner and a soft left drop shadow. Use when L2 is hidden (L1-only layout) so the content still feels framed. |

### Slots

- default — the page body (any content). Light DOM, so children render as-is and can be styled by the app.

### Auto-frame

When the previous element sibling (typically `ds-sidebar-l2`) gains the class `is-hidden`, the component automatically toggles its framed state via a `MutationObserver`. An explicit `framed` attribute always wins over the auto behavior.

---

## Token mapping

| Property | Token |
|----------|-------|
| Background | `--uems-bg-base` |
| Framed radius | `16px` (top-left + bottom-left) |
| Framed shadow | `-8px 0 24px rgba(15, 19, 31, 0.08)` (matches the `ds-sidebar-l2` edge shadow) |

The framed transition (radius + shadow) uses a 200ms `cubic-bezier(0.16, 1, 0.3, 1)` ease and is disabled under `prefers-reduced-motion: reduce`.

---

## Layout

- `display: flex; flex: 1; min-width: 0;` on the host — fills the remaining width next to the sidebars.
- The inner `.ds-content` is a vertical flex column with `overflow-y: auto`, so long pages scroll within the content region rather than the window.

## Do / Don't

- ✅ Place exactly one `ds-content` per app-shell page body, after the sidebars.
- ✅ Let `framed` follow the layout — prefer auto-frame (sibling `is-hidden`) over hand-setting it on every page.
- ❌ Don't add your own scroll container inside — `ds-content` already owns vertical scrolling.
- ❌ Don't give it a fixed height; it's a flex child meant to fill the shell.
