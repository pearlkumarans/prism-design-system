# Drawer

**Design System:** UEMS Design System 3.0

A side sheet that slides in from the anchored screen edge over an optional scrim. Layout: header (optional back + title + subtitle + close) · body (scrolls) · footer (leading text-link + right-aligned button group). Light-DOM — content you place is distributed into regions by `slot`; the host upgrades it in place.

The runtime implementation lives at:

- `drawer.css` — BEM, token-driven (no hardcoded hex)
- `drawer.js` — `<ds-drawer>` host that builds the panel/overlay chrome and slots your content

```html
<ds-drawer title="Filters" subtitle="Narrow the results" side="right" size="m" open>
  <p>Body content (scrolls)…</p>
  <ds-button slot="footer-start" variant="tertiary">Reset</ds-button>
  <ds-button slot="footer" variant="secondary">Cancel</ds-button>
  <ds-button slot="footer" variant="primary">Apply</ds-button>
</ds-drawer>
```

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `side` | `left` \| `right` | `right` | Edge the panel is anchored to / slides in from |
| `size` | `s` \| `m` \| `l` \| `full` | `m` | Panel width: 320 / 480 / 640 / 100% |
| `title` | string | `Drawer title` | Header title text |
| `subtitle` | string | — | Supporting text under the title |
| `show-header` | boolean (default true) | `true` | Set `="false"` to hide the header |
| `show-footer` | boolean (default true) | `true` | Set `="false"` to hide the footer |
| `show-back` | boolean | unset | Show the leading back button |
| `show-close` | boolean (default true) | `true` | Set `="false"` to hide the close button |
| `modal` | boolean (default true) | `true` | Set `="false"` for no scrim / focus trap / scroll lock |
| `dismiss-on-overlay` | boolean (default true) | `true` | Set `="false"` so a scrim click won't close (modal only) |
| `footer-align` | `default` \| `centered` | `default` | Footer action alignment |
| `rtl` | boolean | unset | Mirrors layout (sets `dir="rtl"`) |
| `open` | boolean | unset | Presence opens the drawer |

> Note: `show-header`, `show-footer`, `show-close`, `modal`, and `dismiss-on-overlay` default to **true** — disable them with the explicit string value `="false"`, not by omission.

### Slots

- default / `slot="body"` — body content region (scrolls)
- `slot="footer-start"` — leading footer text link
- `slot="footer"` — right-aligned footer buttons
- `slot="header"` — custom header content that replaces the title/subtitle block (back + close affordances are kept)

### Methods

- `open()` — sets the `open` attribute
- `close()` — removes the `open` attribute

### Properties

- `returnFocusTo : HTMLElement | null` — focus-restore target on close (defaults to the element focused before opening)

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-drawer-open` | — | Drawer opens |
| `ds-drawer-close` | `{ reason: 'esc' \| 'overlay' \| 'close' }` | Drawer closes |
| `ds-drawer-back` | — | The leading back button is clicked |

All events bubble.

---

## Sizes

| Size | Width |
|------|-------|
| `s` | 320px |
| `m` | 480px (default) |
| `l` | 640px |
| `full` | 100% |

---

## Behavior

- **Modal (default):** renders a scrim, traps Tab focus inside the panel, locks body scroll, and Esc closes. On open, focus moves to the first focusable child (or the panel); on close, focus returns to `returnFocusTo` / the previously focused element.
- **Non-modal (`modal="false"`):** no scrim, focus trap, or scroll lock — the page behind stays interactive.
- **Overlay dismissal:** in modal mode a scrim click closes the drawer unless `dismiss-on-overlay="false"`.

## Accessibility

- The panel is `role="dialog"` with `aria-modal` reflecting the `modal` attribute, `aria-labelledby` the title, and `aria-describedby` the body.
- Esc closes a modal drawer; Tab is trapped within the panel.
- Always give a meaningful `title` so the dialog is announced.

## Do / Don't

- ✅ Use for secondary flows (filters, details, settings) that keep the user in context.
- ✅ Provide a clear primary action in the footer.
- ❌ Don't stack multiple modal drawers — close one before opening another.
- ❌ Don't disable `show-close` without giving the user another obvious way out.
