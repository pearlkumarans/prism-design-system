---
name: Modal / Fullscreen
description: Full-viewport modal sheet for complex flows, wizards, and mobile-first experiences — header, scrolling body slot, and split footer with action group plus optional left slot.
type: component
status: stable
category: Feedback
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "18461:1038460"
variants:
  total: 1
---

# Modal / Fullscreen

A modal that fills nearly the entire viewport — useful for multi-step wizards, immersive editors, and mobile-first patterns where a centered modal would feel cramped. The dialog covers the full width and most of the height, with a 40px overlay band visible at the top to signal "I'm a modal, not a new page."

| Meta | Value |
|------|-------|
| Dialog dimensions | `100vw × calc(100vh − 40px)` |
| Top corner radius | `12px` |
| Bottom corner radius | `0` (flush with viewport edge) |
| Header layout | Horizontal (icon + title block on left, close on right) |

---

## Web Component API

```html
<ds-fullscreen-modal
  title="Configure SAML SSO"
  description="Set up SSO so users can sign in with their company directory."
  leading-tone="info|warning|success|brand"
  leading-icon="shield-tick"
  primary-label="Save and apply"
  secondary-label="Cancel"
  tertiary-label="Back"
  hide-close
  dismiss-on-overlay-click="false"
  dismiss-on-esc="false"
  open>
  <p>Body content goes here…</p>
  <span slot="footer-left"><a href="#">Read the docs</a></span>
</ds-fullscreen-modal>
```

### Slots

- **default** — primary scrollable body content (the entire scrollable region)
- **`footer-left`** — left-aligned utility content (TextLink to docs, "Don't show again" checkbox, save status)

### Boolean attribute defaults

| Attribute | Default |
|-----------|---------|
| `open` | `false` |
| `hide-close` | `false` |
| `dismiss-on-overlay-click` | `true` |
| `dismiss-on-esc` | `true` |
| `show-divider-header` | `true` |
| `show-divider-footer` | `true` |

### Properties

| Property | Type | Notes |
|----------|------|-------|
| `returnFocusTo` | `HTMLElement \| null` | Element to restore focus to on close. Defaults to whatever was focused when `open` was set. |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-fullscreen-open` | — | Modal opened. |
| `ds-fullscreen-primary` | — | Primary button activated. Auto-closes unless `e.preventDefault()`. |
| `ds-fullscreen-secondary` | — | Secondary (Cancel) activated. Auto-closes unless `e.preventDefault()`. |
| `ds-fullscreen-tertiary` | — | Tertiary (Back) auxiliary action. Does **not** auto-close. |
| `ds-fullscreen-close` | — | Modal dismissed (Esc / overlay / close icon). |

### Async confirm pattern

```js
modal.addEventListener('ds-fullscreen-primary', async (e) => {
  e.preventDefault(); // keep the modal open while the request runs
  await api.save(payload);
  modal.close();
});
```

---

## Anatomy

```
╭───────────────────── 40px overlay band ─────────────────────╮
│                                                              │
├ Dialog ────────────────────────────────────────────────────  │  ← top corners 12px
│  ┌────┐                                                  ✕   │  Header (88px)
│  │ ⓘ │   Modal title                                          │
│  └────┘   A short description of what this modal is for.      │
│  ─────────────────────────────────────────────────────────   │  header divider
│                                                              │
│  Body slot — scrollable                                      │  Body
│  Use for complex flows, wizards, or mobile-first sheets.     │
│                                                              │
│  ─────────────────────────────────────────────────────────   │  footer divider
│  Read the docs                       Back  Cancel  Confirm   │  Footer (split)
└──────────────────────────────────────────────────────────────┘  ← bottom flush
                Overlay (Dim, 70% black)
```

---

## Container Style — Dev Handoff

| Property | Value |
|----------|-------|
| Width | `100vw` |
| Height | `calc(100vh − 40px)` |
| Top inset (overlay band) | `40px` |
| Top radius | `12px` |
| Bottom radius | `0` |
| Drop shadow | `0 16px 32px rgba(13, 18, 31, 0.18)` |
| Header padding | `20px 24px` |
| Body padding | `20px 24px` (independent scroll) |
| Footer padding | `16px 24px` (split layout) |
| Title | Zoho Puvi Semibold 20/28 |
| Description | Zoho Puvi Regular 14/20, `--text-tertiary` |
| Footer button size | Medium (44px tall) |

### Mobile responsive (≤ 600px)

- Drop the 40px top inset (full edge-to-edge sheet)
- Keep the 12px top corners
- Body still scrolls independently of header + footer

---

## Accessibility

| Concern | Implementation |
|---------|---------------|
| **Role** | `role="dialog"` with `aria-modal="true"`, `aria-labelledby` (title), `aria-describedby` (description + body). |
| **Focus** | On open, focus moves to the first focusable control inside the body slot — falls back to the dialog itself if the body has no focusables. Focus is trapped inside while open. On close, focus returns to the trigger (or `returnFocusTo`). |
| **Keyboard** | `Esc` dismisses (suppress with `dismiss-on-esc="false"`). `Tab` / `Shift+Tab` cycle within the dialog. `Enter` activates the focused button (does not auto-trigger primary). |
| **Body scroll** | The body region is the sole scroll container. Document scroll is locked while the modal is open. |
| **Header divider scroll cue** | A soft shadow appears under the header divider when the body has been scrolled, so the user knows there's content above. |
| **Touch target** | Close icon 32×32. Footer buttons Medium (44px tall) per spec. |
| **Motion** | `prefers-reduced-motion: reduce` disables overlay fade and dialog slide-up. |
| **RTL** | Header reverses (icon + title on the right, close on the left). Footer mirrors so primary stays on the visual leading edge. |

---

## Usage Guidelines

### Do
- Lead the title with what the modal is for: "Configure SAML SSO", "Import contacts".
- Keep the description short — one line summarizing what the user can do here.
- Place dismissive actions (Cancel, Back) on the left of the action group; primary on the right.
- Use the `footer-left` slot for utility (link to docs, "Don't show again", save status).
- Make the body the sole scroll container — header and footer must always be visible.
- Disable backdrop dismiss when there are unsaved changes; warn before closing.

### Don't
- Don't use generic titles like "Settings".
- Don't let the entire dialog scroll — the footer must stay pinned.
- Don't use Fullscreen for binary confirmations — reach for `<ds-confirmation-modal>` instead.
- Don't put primary or secondary actions in the `footer-left` slot — that area is for utility only.
- Don't allow accidental dismissal of in-flight wizard state.
- Don't use the Danger leading tone — Fullscreen modals shouldn't be primary destructive surfaces.

---

## Related Components

| Component | Use it for |
|-----------|-----------|
| **Modal / Confirmation** | Compact, decisional modal with centered icon and short body. |
| **Modal / Standard** *(future)* | Centered modal with a form, scrolling body, custom layout. |
| **Drawer / Side Sheet** *(future)* | Persistent contextual panel that lets the user keep interacting with the canvas. |
| **Inline Alert** | Persistent in-page warning that doesn't require a decision. |
