---
name: Modal / Confirmation
description: Compact confirmation modal with centered icon, title, and message — used for short, critical user decisions.
type: component
status: stable
category: Feedback
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "18470:1137061"
variants:
  - Information
  - Warning
  - Destructive
---

# Modal / Confirmation

Compact confirmation modal with a centered icon, title, and short message. Use it to interrupt the flow and ask the user to confirm a discrete action — never as a substitute for inline validation or a full-screen page.

## Web Component API

```html
<ds-confirmation-modal
  variant="information|warning|destructive"
  title="Delete this asset?"
  description="This change can't be undone."
  primary-label="Delete asset"
  secondary-label="Cancel"
  tertiary-label="Learn more"
  icon="delete"
  hide-close
  dismiss-on-overlay-click="false"
  open>
  <p>The asset and its 14 associated logs will be permanently removed.</p>
</ds-confirmation-modal>
```

### Slots

- **default / `body`** — primary content area below the title row.
- **`body2`** — secondary content area below `body` (optional).

### Boolean attribute defaults

| Attribute | Default |
|-----------|---------|
| `open` | `false` |
| `hide-close` | `false` |
| `dismiss-on-overlay-click` | `true` for Information/Warning, `false` for Destructive |
| `show-divider-header` | `true` |
| `show-divider-footer` | `true` |

### Properties

| Property | Type | Notes |
|----------|------|-------|
| `returnFocusTo` | `HTMLElement \| null` | Element to restore focus to on close. Defaults to whatever was focused when `open` was set. |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-confirmation-open` | — | Modal opened. |
| `ds-confirmation-primary` | — | Primary button activated. Auto-closes unless `preventDefault()`. |
| `ds-confirmation-secondary` | — | Secondary (Cancel) activated. Auto-closes unless `preventDefault()`. |
| `ds-confirmation-tertiary` | — | Tertiary auxiliary action. Does **not** auto-close. |
| `ds-confirmation-close` | `{ reason }` | Modal dismissed (Esc / overlay / close icon). |

### Async confirm pattern

To keep the modal open while a primary handler runs:

```js
modal.addEventListener('ds-confirmation-primary', async (e) => {
  e.preventDefault(); // prevent auto-close
  await api.delete(asset.id);
  modal.close();
});
```

---

## Variants

| Variant | When to use | Accent | Primary CTA |
|---------|------------|--------|-------------|
| **Information** | Neutral confirmation, "are you sure you want to proceed" | Blue | `<ds-button variant="primary">` |
| **Warning** *(default)* | Reversible-but-risky action, caution required | Amber | `<ds-button variant="warning">` |
| **Destructive** | Irreversible action: delete, revoke, purge | Red | `<ds-button variant="destructive">` |

Default icons:

- `information` → `info-circle`
- `warning` → `exclamation-circle`
- `destructive` → `exclamation-triangle`

Override with `icon="<name>"`.

---

## Anatomy

```
┌──────────────────────────────────────┐
│                            ✕         │  Close icon (top-right)
│                                      │
│             ╭───────╮                │
│             │   !   │                │  Leading icon (48×48 pill)
│             ╰───────╯                │
│                                      │
│           Modal title                │  18/24 semibold
│   A short description of intent.     │  14/20 subtle
│  ───────────────────────────────     │  Header divider
│                                      │
│   Are you sure you want to do this?  │  Body (slot)
│                                      │
│  ───────────────────────────────     │  Footer divider
│                                      │
│        [ Cancel ]  [ Continue ]      │  Centered button group
└──────────────────────────────────────┘
            (overlay 70% black)
```

---

## Container Style — Dev Handoff

| Property | Value |
|----------|-------|
| Width | `480px` (fixed) |
| Padding | `20px 24px 16px` |
| Corner radius | `12px` |
| Drop shadow | `0 16px 32px rgba(13, 18, 31, 0.18)` |
| Overlay color | `rgba(10, 11, 15, 0.7)` |
| Title | Zoho Puvi Semibold 18/24 |
| Description / Body | Zoho Puvi Regular 14/20, `--text-tertiary` |
| Leading icon | 48×48 pill, tinted by variant |
| Close icon | 28×28, tertiary grey, hover `--bg-secondary-hover` |

---

## Accessibility

| Concern | Implementation |
|---------|---------------|
| **Role** | `role="alertdialog"` with `aria-modal="true"`, `aria-labelledby` (title), `aria-describedby` (body). |
| **Focus** | On open, focus moves to the secondary (safe) button — never the destructive primary. Focus is trapped inside the dialog while open. On close, focus returns to the originating trigger (or `returnFocusTo`). |
| **Keyboard** | `Esc` dismisses. `Tab` / `Shift+Tab` cycle within the dialog. `Enter` activates the focused button (does not auto-trigger primary). |
| **Color contrast** | Title, body, and primary-button label all meet WCAG 2.1 AA (4.5:1) on the white surface. |
| **Touch target** | Close icon 28×28 visually, padded to ≥ 44×44 effective hit area. |
| **Motion** | `prefers-reduced-motion: reduce` disables overlay fade and dialog scale-in. |
| **RTL** | Footer button order mirrors so the primary action stays on the visual leading edge in RTL locales. |

---

## Usage Guidelines

### Do
- Lead the title with a verb that names the action: "Delete folder?", "Sign out everywhere?".
- Use **Destructive** only for actions that cannot be undone, ever.
- Match the primary button label to the title's verb: title "Delete folder?" → button "Delete folder".
- Keep the body to one or two short sentences.
- Place the safe action (Cancel) on the **left**, primary on the **right**.
- Disable backdrop-click-to-dismiss for Destructive variants (this is the default).

### Don't
- Don't use generic titles like "Are you sure?" — they give the user nothing to read.
- Don't use "OK" / "Yes" / "No" as button labels — they erase the meaning of the choice.
- Don't pack the body with bulleted lists, FAQ-style explanations, or marketing language.
- Don't reverse the button order, or put the destructive action in the secondary slot.
- Don't use Confirmation for forms or multi-step flows — reach for `Modal / Standard` instead.

---

## Related Components

| Component | Use it for |
|-----------|-----------|
| **Modal / Standard** *(future)* | Full-purpose modal with form fields, scrolling content, custom layout. |
| **Inline Alert** | Persistent in-page warning that doesn't require a decision. |
| **Toast** | Transient feedback after the user has already acted. |
| **Empty State** | Confirming a row-level action without leaving context (use within a row's expanded state). |
