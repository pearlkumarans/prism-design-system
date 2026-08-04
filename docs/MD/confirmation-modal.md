# Confirmation Modal Component

**Design System:** UEMS Design System 3.0
**Custom element:** `<ds-confirmation-modal>`
**Source:** `design-system-library/src/components/confirmation-modal/`

---

## Overview

The Confirmation Modal is a compact, centred dialog that interrupts the flow to ask the user to confirm a discrete action they can't easily undo — deleting a folder, signing out everywhere, moving items to trash. It has a centred icon, a title, an optional description, an optional body slot, and a centred button group. Use it for one focused decision; never as a substitute for inline validation or a multi-step form.

---

## Anatomy

```
        ┌──────────────────────────── × ┐   ← Close (optional)
        │            ◯  Leading icon     │   ← 48×48 variant-tinted pill
        │      Delete 3 endpoints?       │   ← Title (verb-led question)
        │  This removes them from mgmt.  │   ← Description (optional)
        │  ─────────────────────────────│   ← Header divider (opt-in)
        │  [ body slot content ]         │   ← Body / body2 slots
        │  ─────────────────────────────│   ← Footer divider (opt-in)
        │   [Learn more] [Cancel] [Delete]│   ← Tertiary · Secondary · Primary
        └────────────────────────────────┘
```

| Part | Description |
|------|-------------|
| **Leading icon** | 48 × 48 circular pill, tint follows `variant`. Decorative (`aria-hidden`); severity is carried by the title + primary button colour, not the icon alone. |
| **Title** | Verb-led question. Sentence case, often ends with "?". ≤ 50 chars. Required. |
| **Description** | Optional supporting line below the title. |
| **Body / body2** | Optional slot content below the title row for extra context. |
| **Close** | Top-right 28 × 28 hit target. Hidden via `hide-close`. |
| **Footer** | Centred button group. Tertiary (auxiliary) · Secondary (Cancel, safe) · Primary (the action). |

---

## Variants

### Variant (semantic tone)

| Value | Leading icon bg | Leading icon fg | Primary button | Default icon |
|-------|-----------------|-----------------|----------------|--------------|
| `information` | `bg-info-subtlest` | `text-info` | `<ds-button variant="primary">` | `info-circle` |
| `warning` (default) | `bg-alert-subtlest` | `text-alert` | `<ds-button variant="warning">` | `exclamation-circle` |
| `destructive` | `bg-error-subtlest` | `text-error` | `<ds-button variant="destructive">` | `exclamation-triangle` |

> Destructive modals default to **not** dismissing on backdrop click — the user must make an explicit choice for irreversible actions.

---

## States

The dialog itself is either Open or Closed. The states below describe how the dialog presents while open.

| State | Behavior |
|-------|----------|
| **Default** | Resting. Secondary (safe) action is focused on open — never the primary destructive button. |
| **Loading** | Set `loading` while an async confirm runs. The primary button shows a spinner (`aria-busy`); Cancel, tertiary, close, Esc, and overlay dismissal are all locked so the action can't be abandoned or double-fired. Clear `loading` when the promise settles. |

Individual footer buttons carry their own Button states (hover, focus, disabled) per the Button spec.

---

## Component Properties

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `variant` | `information` · `warning` · `destructive` | `warning` | Drives icon glyph, icon tint, primary button colour. |
| `title` | string | — | Required. Verb-led question. ≤ 50 chars. |
| `description` | string | — | Optional supporting line. |
| `primary-label` | string | `Continue` | Required. Mirror the title's verb. |
| `secondary-label` | string | `Cancel` | Safe / dismiss label. |
| `tertiary-label` | string | — | Optional auxiliary action; does not auto-close. |
| `icon` | sprite name | per variant | Override the default glyph (e.g. `delete`, `lock`). |
| `hide-close` | boolean | unset | Hides the top-right close icon. |
| `dismiss-on-overlay-click` | `true` · `false` | `true` (info/warning) · `false` (destructive) | Backdrop click closes the modal. |
| `show-divider-header` | `true` · `false` | unset (off) | Divider between header and body. |
| `show-divider-footer` | `true` · `false` | unset (off) | Divider between body and footer. |
| `loading` | boolean | unset | Spinner on primary; locks all dismiss paths during async confirm. |
| `open` | boolean | unset | Open / close state. |

### Methods
- `open()` / `close()` — toggle the `open` attribute.
- `returnFocusTo : HTMLElement | null` — focus-restore target on close.

### Slots
| Slot | Purpose |
|------|---------|
| `body` (default) | Primary content below the title row. |
| `body2` | Optional secondary content. Use sparingly — one short line or inline link. |

### Events
| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-confirmation-open` | — | Modal opened. |
| `ds-confirmation-primary` | — | Primary activated. Auto-closes unless `preventDefault()`. |
| `ds-confirmation-secondary` | — | Secondary (Cancel) activated. Auto-closes unless `preventDefault()`. |
| `ds-confirmation-tertiary` | — | Tertiary activated. Does **not** auto-close. |
| `ds-confirmation-close` | `{ reason }` | Dismissed via Esc / backdrop / close icon. |

### Async confirm pattern
```js
modal.addEventListener('ds-confirmation-primary', async (e) => {
  e.preventDefault();        // keep the modal open
  modal.setAttribute('loading', '');
  try {
    await api.delete(asset.id);
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
| Width | 480 px (fixed) |
| Padding | 20px 24px 16px |
| Corner radius | `radius-lg` · 12 px |
| Drop shadow | `0 16px 32px rgba(13,18,31,0.18)` |
| Overlay scrim | `rgba(10,11,15,0.7)` |
| Title font | Zoho Puvi Semibold 18 / 24 |
| Description / Body | Zoho Puvi Regular 14 / 20, `text-tertiary` |
| Leading icon block | 48 × 48 pill, variant-tinted |
| Close icon | 28 × 28 hit target, 16 px glyph |

---

## Usage

### Do
- Lead the title with a verb naming the action: "Delete folder?", "Sign out everywhere?".
- Use `destructive` only for actions that can never be undone.
- Match the primary button to the title's verb (title "Delete folder?" → button "Delete folder").
- Keep the body to one or two short sentences.
- Place Cancel on the left, the primary on the right.
- Quantify the consequence ("14 records", "3 active sessions").
- Use `loading` for async confirms so the user can't double-fire a Delete.

### Don't
- Use generic titles like "Are you sure?" — they give the user nothing to read.
- Use "OK" / "Yes" / "No" as button labels — they erase the meaning of the choice.
- Pack the body with bulleted lists, FAQs, or marketing copy.
- Reverse the button order or put the destructive action in the secondary slot.
- Use Confirmation for forms or multi-step flows — use a Fullscreen Modal instead.
- Let destructive modals dismiss on backdrop click.

---

## Accessibility

| Concern | Implementation |
|---------|----------------|
| **Role** | `role="alertdialog"` with `aria-modal="true"` on the dialog. |
| **Title** | `aria-labelledby` points to the title element. |
| **Body** | `aria-describedby` points to the body region. |
| **Leading icon** | `aria-hidden="true"` — severity comes from the title + primary colour, not the icon. |
| **Close button** | `aria-label="Close"`. |
| **Focus on open** | Secondary (safe) action receives focus — never the primary destructive button. |
| **Focus trap** | Tab / Shift+Tab cycle within the dialog. |
| **Esc** | Closes the modal (suppressed while `loading`). |
| **Focus restore** | Returns focus to the trigger (or `returnFocusTo`) on close. |

---

## Related Components

| Component | When to use instead |
|-----------|---------------------|
| **Fullscreen Modal** | Multi-step flows, wizards, or content that needs the full viewport. |
| **Inline Alert Message** | Non-blocking status that lives in the page flow. |
| **Toast** | Transient confirmation after an action completes. |
