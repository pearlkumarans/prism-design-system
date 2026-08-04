# Fullscreen Modal Component

**Design System:** UEMS Design System 3.0
**Custom element:** `<ds-fullscreen-modal>`
**Source:** `design-system-library/src/components/fullscreen-modal/`

---

## Overview

The Fullscreen Modal is a full-viewport sheet for complex, self-contained flows — wizards, onboarding, structured imports, rich editors. It covers the full width and almost the full height, leaving a 40 px overlay band at the top so the user remembers this is a dismissible layer, not a navigation jump. Reach for it when a task needs the whole screen but the user shouldn't lose their place in the host app.

---

## Anatomy

```
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ← 40px overlay band (host app peeks through)
  ┌──────────────────────────────── ×┐  ← Pinned header: leading icon + title + close
  │  ◯  Configure SAML single sign-on │
  │     Set up IdP-initiated SSO.     │  ← Description
  │ ──────────────────────────────── │  ← Header divider
  │                                   │
  │     [ scrollable body slot ]      │  ← Body scrolls; document scroll locked
  │                                   │
  │ ──────────────────────────────── │  ← Footer divider
  │ [footer-left]      [Back][Cancel][Save]│ ← Pinned footer
  └───────────────────────────────────┘
```

| Part | Description |
|------|-------------|
| **Overlay band** | 40 px strip at the top showing the dimmed host app — the "I'm a modal" signal. |
| **Leading icon** | 48 × 48 circular pill, tint follows `leading-tone`. Decorative. |
| **Title** | Sentence case, ≤ 60 chars. Required. |
| **Description** | Optional supporting line. |
| **Body** | Default slot. Scrolls independently; the document behind is scroll-locked. |
| **Footer-left** | Left-aligned utility area (TextLink, save status). |
| **Footer-right** | Tertiary (Back) · Secondary (Cancel) · Primary. |
| **Close** | Top-right icon. Hidden via `hide-close`. |

---

## Variants

### Leading tone

| Value | Background | Foreground | Default icon |
|-------|-----------|-----------|--------------|
| `info` (default) | `bg-info-subtlest` | `text-info` | `info-circle` |
| `warning` | `bg-warning-subtlest` | `text-warning` | `exclamation-circle` |
| `success` | `bg-success-subtlest` | `text-success` | `check-circle` |
| `brand` | `bg-accent-subtlest` | `text-accent-link` | `star` |

---

## States

The modal is either Open or Closed. While open:

| State | Behavior |
|-------|----------|
| **Default** | Resting. Focus moves to the first focusable control in the body on open. |
| **Loading** | Set `loading` while an async primary action runs (saving a wizard, applying a config). The primary button shows a spinner; Cancel, Back, close, Esc, and overlay dismissal all lock so a long save can't be abandoned mid-flight. Clear `loading` when the request settles. |

---

## Component Properties

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `title` | string | — | Required. ≤ 60 chars. |
| `description` | string | — | Optional supporting line. |
| `leading-tone` | `info` · `warning` · `success` · `brand` | `info` | Tints the circular icon block. |
| `leading-icon` | sprite name | per tone | Override the default glyph. |
| `primary-label` | string | `Confirm` | Required. |
| `secondary-label` | string | `Cancel` | Dismiss action. |
| `tertiary-label` | string | — | Optional. "Back" in wizards; does not auto-close. |
| `hide-close` | boolean | unset | Hides the top-right close icon. |
| `dismiss-on-overlay-click` | `true` · `false` | `true` | Overlay-band click closes. |
| `dismiss-on-esc` | `true` · `false` | `true` | Esc closes. |
| `show-divider-header` | `true` · `false` | `true` | Divider between header and body. |
| `show-divider-footer` | `true` · `false` | `true` | Divider between body and footer. |
| `loading` | boolean | unset | Spinner on primary; locks all dismiss paths during async save. |
| `open` | boolean | unset | Controls visibility. |

### Methods
- `open()` / `close()` — toggle the `open` attribute.
- `returnFocusTo : HTMLElement | null` — focus-restore target on close.

### Slots
| Slot | Purpose |
|------|---------|
| `default` | Primary scrollable body content. |
| `footer-left` | Left-aligned utility content (TextLink, save status, etc.). |

### Events
| Event | Fires when |
|-------|-----------|
| `ds-fullscreen-open` | Modal opened. |
| `ds-fullscreen-primary` | Primary activated. Auto-closes unless `preventDefault()`. |
| `ds-fullscreen-secondary` | Secondary (Cancel) activated. Auto-closes unless `preventDefault()`. |
| `ds-fullscreen-tertiary` | Tertiary ("Back") activated. Does **not** auto-close — consumer drives wizard nav. |
| `ds-fullscreen-close` | Dismissed via Esc / overlay / close icon. |

### Async save pattern
```js
modal.addEventListener('ds-fullscreen-primary', async (e) => {
  e.preventDefault();        // keep the modal open
  modal.setAttribute('loading', '');
  try {
    await api.saveConfig(form);
    modal.close();
  } finally {
    modal.removeAttribute('loading');
  }
});
```

---

## Design Tokens

### Container
| Property | Value |
|----------|-------|
| Width | 100vw |
| Height | calc(100vh − 40px) |
| Top inset (overlay band) | 40 px |
| Top corner radius | 12 px |
| Bottom corner radius | 0 (flush with viewport edge) |
| Drop shadow | `0 16px 32px rgba(13,18,31,0.18)` |
| Overlay scrim | `rgba(10,11,15,0.7)` |
| Header padding | 20px 24px |
| Body padding | 20px 24px |
| Footer padding | 16px 24px |

### Typography
| Slot | Spec |
|------|------|
| Title | Zoho Puvi Semibold 20 / 28 |
| Description | Zoho Puvi Regular 14 / 20, `text-tertiary` |
| Footer button label | Zoho Puvi Medium 14 / 20 |

---

## Usage

### When to use
- Multi-step flows that need their own focused canvas: onboarding, wizards, structured imports.
- Rich editing that won't fit a centred modal — entity detail panels, JSON editors, image cropping.
- Mobile-first / responsive layouts — the same component fills a phone screen naturally.
- Patterns that would otherwise need a new page but should preserve the user's place in the host app.

### When not to use
| Situation | Use instead |
|-----------|-------------|
| Binary confirmation (Delete / Cancel) | Confirmation Modal |
| Short form (3–5 fields) | Standard centred Modal |
| Persistent contextual panel beside the canvas | Drawer / Side Sheet |
| Content that should live at its own URL | A real page |
| Onboarding overlays pointing at UI | Coachmark / Tour |

---

## RTL Support

Set `dir="rtl"` on the modal or any ancestor. The component reads ambient direction via `:dir(rtl)` selectors and flips automatically:

| Element | LTR | RTL |
|---------|-----|-----|
| Close button | right | left |
| Leading icon | left of title | right of title |
| Primary action | right footer | left footer |
| Cancel / Back | left of primary | right of primary |

---

## Accessibility

| Concern | Implementation |
|---------|----------------|
| **Role** | `role="dialog"` + `aria-modal="true"`. |
| **Title** | `aria-labelledby` points to the title element. |
| **Body** | `aria-describedby` points to the body region. |
| **Decorative icons** | `aria-hidden="true"`. |
| **Esc** | Dismisses (suppress only when there are unsaved changes or while `loading`). |
| **Focus trap** | Tab / Shift+Tab cycle inside the dialog only. |
| **Focus on open** | Moves to the first focusable control in the body. |
| **Focus restore** | Returns to the originating trigger on close. |
| **Scroll** | Body scrolls independently; document scroll is locked while open. |

---

## Related Components

| Component | When to use instead |
|-----------|---------------------|
| **Confirmation Modal** | A single discrete confirm/cancel decision. |
| **Page Header** | Content that warrants its own URL and route. |
| **Right Pane / Drawer** | A persistent panel that coexists with the main canvas. |
