# Handoff Spec: Form Footer

**Figma:** [UEMS — Design System 3.0 · node `20025:601543`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=20025-601543)

**Related:** Composed from → `button.md` · Theme tokens → `uems-theme-tokens.md` · Siblings → `card.md`, `widget.md`

---

## Overview

The sticky action bar pinned to the bottom of a form or page: a left status/content area and a right-aligned button group. It spans the container width, sits on a solid surface with an **upward** elevation shadow (no border), and stays pinned while the form body scrolls beneath.

The footer only owns the sticky bar + layout — the action buttons are the shared `<ds-button>` component (reuse, never re-implement). Buttons order left→right with the **Primary trailing** (e.g. Reset · Cancel · Save). The whole left area is a single on/off toggle (`show-left`); when off, the button group stays right-aligned. RTL mirrors natively via `dir="rtl"`.

Use it as the primary action surface for a form, settings page, wizard step, or fullscreen editor. For dialog/modal actions that live in the modal's own footer, use the modal footer instead of a page-level sticky bar.

## Anatomy

```
┌──────────────────────────────────────────────────────────────┐
│ Last saved 2 min ago                    [Cancel] [Save]        │  ← 72px min-height bar
└──────────────────────────────────────────────────────────────┘
  └── left area (fills row) ──┘         └── button group (trailing) ─┘
  ▲ upward elevation shadow, no border; position: sticky; bottom: 0
```

| # | Part | Notes |
|---|------|-------|
| 1 | Left area | Status text (e.g. "Last saved 2 min ago") or any slotted content. Fills the row (`flex: 1 1 auto`), pushing the buttons to the trailing edge. Toggle with `show-left`. |
| 2 | Button group | Right-aligned `ds-button`s (gap 12px), Primary trailing, never shrinks. Pass what you need via `slot="action"`. |

## Component properties

`observedAttributes`: `show-left`, `left-text`, `live`, `label`, `dir`, `rtl`.

| Attribute | Type | Default | Maps to |
|---|---|---|---|
| `show-left` | boolean (string `"false"` collapses) | `true` (on) | On/off toggle for the whole left area (maps 1:1 to Figma `Show Left Slot`). `show-left="false"` adds `.ds-form-footer--no-left` and drops the left area; buttons stay right-aligned. |
| `left-text` | text | `""` | Convenience status text rendered in the left area **when no `slot="left"` content is provided**. Wrapped in `.ds-form-footer__status`. |
| `live` | boolean | `false` | Sets `aria-live="polite"` on the left area — for status that updates (e.g. autosave time). |
| `label` | text | `"Form actions"` | Accessible name for the footer region; applied as `aria-label` unless one is already set. |
| `dir` | `"rtl"` | ltr | Mirrors layout; `.ds-form-footer__status` gets `text-align: right`. Setting `rtl` also forces `dir="rtl"`. |
| `rtl` | boolean | `false` | Boolean shorthand for RTL; when present the component sets `dir="rtl"` on the host. |

### Slots

| Slot | Notes |
|---|---|
| `slot="left"` | The left area — status text, metadata, or any custom content. Captured once on first render and moved (not cloned) into `.ds-form-footer__left`. Omit to use `left-text`, or hide the whole area via `show-left="false"`. |
| `slot="action"` (or default/unmarked children) | The action buttons — pass the `ds-button`s you need, in order (Primary trailing). Any child **not** marked `slot="left"` is treated as an action and moved into `.ds-form-footer__actions`. |

> Slotting model: on `connectedCallback` the component captures consumer children once (`_slotsCaptured`), splitting them into left vs. actions, then re-renders its own wrappers and moves the captured nodes back in — the same pattern as `ds-card` / `ds-widget`. The footer emits **no events of its own**; wire submit/cancel handlers on the slotted buttons' own `click`.

## Layout

The host **is** the bar: `display: flex; align-items: center; justify-content: space-between`. The left area fills the row so the button group is pushed to the trailing edge (Figma: Left Slot `layoutGrow 1` + primary-axis MAX). Height is a **minimum** — the bar grows if content wraps. When `show-left="false"`, `.ds-form-footer--no-left` switches to `justify-content: flex-end`.

### Metrics

| Property | Value |
|---|---|
| Min height | `72px` |
| Padding | `16px` top/bottom · `24px` left/right |
| Left ↔ group gap | `16px` |
| Button-group gap | `12px` |
| Buttons | `ds-button` (Medium) |
| Left status text | `12px` / `16px` line-height, weight `400`, `--uems-text-secondary` |

### Sticky behavior

`position: sticky; bottom: 0; z-index: 10` — the bar pins to the bottom of its scroll container while the body scrolls beneath. Reserve bottom padding on the form body so the footer never overlaps the last field / a focused input.

## Design Tokens Used

Only tokens actually referenced in `form-footer.css` are listed. The elevation shadow, spacing, and status-text metrics are literal values in Figma (not tokenized).

| Role | Token / value |
|---|---|
| Bar background | `--uems-bg-primary` |
| Status text color | `--uems-text-secondary` |
| Font family | `--font-family-sans` |
| Elevation (upward shadow, **not** a border) | `0 -2px 8px rgba(0, 0, 0, 0.08)` (literal) |
| Bar padding / min-height / gaps | `16px 24px` · `72px` · `16px` (left↔group) · `12px` (button group) (literal) |
| Status text metrics | `12px` / `16px` / weight `400` (literal) |

## Developer Handoff

### Suggested API

```html
<ds-form-footer show-left dir="rtl" label="Form actions">
  <span slot="left">Last saved 2 min ago</span>        <!-- or left-text="…" -->
  <ds-button slot="action" variant="tertiary">Reset</ds-button>
  <ds-button slot="action" variant="outline">Cancel</ds-button>
  <ds-button slot="action" variant="primary">Save</ds-button>
</ds-form-footer>
<!-- no events of its own — handlers go on the ds-buttons -->
```

- `show-left` (default on) is the single toggle for the whole left area; `show-left="false"` collapses it and the button group stays right-aligned.
- Buttons: pass whatever you need via `slot="action"` (or default children); order left→right with Primary trailing. RTL mirrors natively via `dir`.

### HTML structure (rendered)

```html
<ds-form-footer class="ds-form-footer" role="group" aria-label="Form actions">
  <div class="ds-form-footer__left" data-slot="left">
    <!-- slotted "left" nodes, or -->
    <span class="ds-form-footer__status">Last saved 2 min ago</span>
  </div>
  <div class="ds-form-footer__actions" data-slot="action">
    <!-- slotted "action" buttons, Primary trailing -->
  </div>
</ds-form-footer>
```

### CSS

```css
ds-form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
  min-height: 72px;
  padding: 16px 24px;
  background: var(--uems-bg-primary);
  /* Upward elevation shadow — NOT a border. */
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  font-family: var(--font-family-sans);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* Left area fills the row → pushes the button group to the trailing edge. */
.ds-form-footer__left {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ds-form-footer__status {
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  color: var(--uems-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Button group — right-aligned, never shrinks. Buttons are ds-button. */
.ds-form-footer__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

/* No left area → keep the group on the trailing edge. */
.ds-form-footer--no-left { justify-content: flex-end; }

/* RTL — plain flex row mirrors natively; only text-align needs help.
   Do NOT add flex-direction: row-reverse (that double-reverses). */
.ds-form-footer[dir="rtl"] .ds-form-footer__status { text-align: right; }
```

## States and Interactions

| Event | Behavior |
|---|---|
| Left area toggle (`show-left`) | `show-left="false"` collapses the whole left area; button group stays right-aligned (`justify-content: flex-end`). |
| Content wraps / long status | Bar grows past the 72px minimum; status text ellipsizes (`overflow: hidden` + `text-overflow: ellipsis`). |
| Scroll | Bar stays pinned (`sticky; bottom: 0`); form body scrolls beneath. |
| Button click | Slotted `ds-button`s fire their own `click`; the footer adds no events. |
| Live status | `live` sets `aria-live="polite"` so updates (autosave time) announce without stealing focus. |
| RTL | `dir="rtl"` (or `rtl`) mirrors the row for free — status to the visual right, buttons to the left; status text right-aligns. |

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Host is `role="group"` with an `aria-label` (default "Form actions") — a labeled action region, not a landmark. Inside a `<form>`, keep it within the form. |
| Buttons | Real `ds-button` (native `<button>`) with their own focus rings and disabled/loading states. |
| Keyboard | `Tab`: left status (if focusable) → button group left→right; DOM order matches visual order in LTR and RTL. `Enter`/`Space` activates the focused button; Primary is the default submit. |
| Live status | Set `live` so autosave/updates announce via `aria-live="polite"` without stealing focus. |
| Sticky overlap | Reserve bottom padding on the form body so the sticky bar never overlaps a focused field. |
| Destructive actions | Use `variant="destructive"`, kept left-most and clearly labeled — separated from the Primary confirm to avoid mis-clicks; consider a confirmation step. |
| Contrast | `--uems-text-secondary` status text on the bar surface passes AA. |

## Verification

- Attribute surface matches `form-footer.js` `observedAttributes` exactly: `show-left`, `left-text`, `live`, `label`, `dir`, `rtl`.
- Slots match source: `slot="left"` → `.ds-form-footer__left`; `slot="action"` / unmarked default children → `.ds-form-footer__actions` (captured once, moved not cloned).
- Tokens match `form-footer.css`: `--uems-bg-primary` (background), `--uems-text-secondary` (status text), `--font-family-sans` (font). Elevation, spacing, and status metrics are literal values (not tokenized).
- Layout confirmed: `space-between` flex bar, `min-height: 72px`, padding `16px 24px`, left↔group gap `16px`, button-group gap `12px`, `position: sticky; bottom: 0; z-index: 10`, upward shadow `0 -2px 8px rgba(0,0,0,0.08)` (no border), `--no-left` → `flex-end`, RTL native mirror + `text-align: right` on status.

---

*Generated from UEMS Design System 3.0 · Figma node `20025:601543` · sourced from `form-footer.js`, `form-footer.css`, and `docs/Form-footer.html`.*
