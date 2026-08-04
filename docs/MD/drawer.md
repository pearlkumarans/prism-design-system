# Drawer Component

**Design System:** UEMS Design System 3.0
**Custom element:** `<ds-drawer>`
**Source:** `design-system-library/src/components/drawer/`
**Figma:** `Drawer / Container`

---

## Overview

The Drawer is a side sheet — a panel that slides in from the left or right edge over an optional scrim, with a header, a scrollable body, and a footer. Use it for detail views, forms, and focused tasks that benefit from extra width without leaving the page. It comes in four sizes (S 320 / M 480 / L 640 / Full) and supports a rich footer (leading text-link + right-aligned button group). Modal by default (scrim, focus trap, Esc, scroll-lock); set `modal="false"` for a non-blocking panel that lets the page reflow. Distinct from Modal (centred) and Right pane (persistent 32px utility rail).

---

## Anatomy

```
┌──────────────────────────────┐   ← Scrim / overlay (modal only)
│ scrim                ┌──────────┐│
│                      │ ‹ Title ×││  ← Header: back? · title · subtitle · close
│                      │──────────││  ← Header divider
│                      │ body     ││  ← Body slot (scrolls; header/footer pinned)
│                      │          ││
│                      │──────────││  ← Footer divider
│                      │ [Cancel][Save]│ ← Footer: text-link + button group
│                      └──────────┘│
└──────────────────────────────┘
```

| Part | Description |
|------|-------------|
| **Scrim / overlay** | Modal-only dim layer (`bg-overlay`). Click to dismiss when `dismiss-on-overlay` is on. Hidden when `modal="false"`. |
| **Panel** | The sheet. `bg-primary-alt`, `radius-l` on the inner edge only, elevation shadow toward the screen. Anchors to the `side` edge; full height. |
| **Header** | Optional back button (`show-back`) + title + subtitle + close (`show-close`). Bottom divider. Carries the `slider-header-bg` gradient wash (light theme). |
| **Body** | Default / `slot="body"`. Any content; scrolls within the panel when it overflows while the header and footer stay pinned. |
| **Footer** | Leading text-link (`slot="footer-start"`) + spacer + right-aligned button group (`slot="footer"`). Top divider. `footer-align="centered"` centres the group. |

---

## Sizing

| `size` | Width (left/right) | Use case |
|--------|--------------------|----------|
| `s` | 320 px | Filters, quick details |
| `m` (default) | 480 px | Forms, default content |
| `l` | 640 px | Rich content, tables |
| `full` | 100% | Mobile, immersive takeover (no inner radius) |

Panel height is 100% of the viewport. Below the chosen width the panel clamps to `100vw`.

---

## States

| State | Behavior |
|-------|----------|
| **Closed** | `display:none`; not in the a11y tree. |
| **Open** | Slides in from the anchored edge; scrim fades in (modal). Focus moves into the panel. |
| **Modal** | `Show Overlay`/`modal` on — scrim, focus trap, body scroll-lock, blocks the page. |
| **Non-modal** | `modal="false"` — no scrim, page reflows and stays interactive. |
| **Dismiss** | Esc · scrim click (modal) · close button — emits `ds-drawer-close`. |

---

## Component Properties

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `side` | `left` · `right` | `right` | Anchored edge; radius/shadow/slide mirror accordingly. |
| `size` | `s` · `m` · `l` · `full` | `m` | 320 / 480 / 640 / 100%. |
| `title` | string | — | Header title. |
| `subtitle` | string | — | Optional supporting line under the title. |
| `show-header` | boolean | `true` | Show the header region. |
| `show-footer` | boolean | `true` | Show the footer region. |
| `show-back` | boolean | unset (off) | Leading back button in the header. |
| `show-close` | boolean | `true` | Header close ✕. |
| `modal` | boolean | `true` | Scrim + focus trap + Esc + scroll-lock. `false` = non-modal panel. |
| `dismiss-on-overlay` | `true` · `false` | `true` | Scrim click closes (modal only). |
| `footer-align` | `default` · `centered` | `default` | Footer button-group alignment. |
| `rtl` | boolean | unset | Mirror anchor edge + layout direction. Sets `dir="rtl"`. |
| `open` | boolean | unset | Open / close state. |

### Methods
- `open()` · `close()`
- `returnFocusTo : HTMLElement | null` — focus-restore target on close.

### Slots
| Slot | Purpose |
|------|---------|
| (default) / `body` | Scrollable body content. |
| `footer-start` | Leading footer text-link. |
| `footer` | Right-aligned footer action buttons. |

### Events
| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-drawer-open` | — | Drawer opened. |
| `ds-drawer-close` | `{ reason }` | Dismissed — `esc` · `overlay` · `close`. |
| `ds-drawer-back` | — | Back button activated. |

---

## Design Tokens

### Container
| Property | Value |
|----------|-------|
| Panel fill | `--uems-bg-primary-alt` · #ffffff |
| Scrim | `rgba(10,11,15,0.5)` (modal) |
| Corner radius | `--radius-lg` · 12 px — inner edge only (`full` = 0) |
| Shadow (right) | `-4px 0 20px rgba(13,17,29,0.12)` (mirrored for left) |
| Border | none (separation via shadow) |
| Header wash | `--gradient-slider-header-bg` (light theme) |

### Sections
| Region | Padding | Divider |
|--------|---------|---------|
| Header | `20px 24px` | bottom 1px `--uems-border-tertiary` |
| Body | `24px` | — |
| Footer | `16px 24px` | top 1px `--uems-border-tertiary` |

### Typography & icons
| Element | Style |
|---------|-------|
| Title | `Text/large/SemiBold` 16 / 24, `--uems-text-primary` |
| Subtitle | `Text/Default/Regular` 14 / 20, `--uems-text-secondary` |
| Back / Close | `--uems-icon-subtle` |

### Motion
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Panel (enter) | slide from edge (`translateX`) | ~250 ms | ease-out |
| Panel (exit) | slide back | ~200 ms | ease-in |
| Scrim | opacity 0→1 | ~150 ms | ease |
| `prefers-reduced-motion` | none (instant) | — | — |

---

## Usage

### Do
- Use a right anchor for contextual details, forms, and actions tied to the current view.
- Use a modal Drawer when the task should be completed or dismissed before continuing.
- Keep the header and footer pinned; let only the body scroll.
- Return focus to the trigger when the Drawer closes.

### Don't
- Stack Drawers or open a Drawer from inside another — use one at a time.
- Put primary navigation in a modal Drawer on desktop — use the Right pane / persistent patterns.
- Hardcode the panel width or scrim colour — drive width from `size` and the scrim from `bg-overlay`.
- Use a Drawer for a single focused confirmation — use a Confirmation Modal.

---

## Accessibility

| Concern | Implementation |
|---------|----------------|
| **Role** | `role="dialog"`; `aria-modal="true"` (modal) / `"false"` (non-modal). |
| **Name** | `aria-labelledby` → title. |
| **Focus on open** | Moves into the panel (first focusable or the panel). |
| **Focus trap** | Tab / Shift+Tab cycle within the panel while modal. |
| **Focus restore** | Returns to the trigger (or `returnFocusTo`) on close. |
| **Esc** | Closes the drawer. |
| **Scroll-lock** | Body scroll locked while a modal drawer is open. |
| **Back / Close** | `aria-label="Back"` / `aria-label="Close"`. |
| **RTL** | `dir="rtl"`; anchor edge + layout mirror. |

---

## Related Components

| Component | When to use instead |
|-----------|---------------------|
| **Modal** | A centred, focused task that should interrupt the page. |
| **Right pane** | A persistent 32px utility rail (always visible, not transient). |
| **Popover** | A small contextual overlay anchored to a trigger. |
| **Fullscreen Modal** | Multi-step flows that need the full viewport. |
