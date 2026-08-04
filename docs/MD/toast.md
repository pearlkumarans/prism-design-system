# Handoff Spec: Toast Message

**Figma:** [UEMS — Design System 3.0 · node `15938:44865`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=15938-44865) · Component set, **32 variants**

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Typography — [`typography-tokens.md`](../typography-tokens.md) · Icon Button — [`icon-button.md`](./icon-button.md) (close affordance pattern)

---

## Overview

A transient notification with status icon, title, optional description, optional CTA link, optional close button, and an **auto-dismiss timeout bar** along the bottom edge. Two visual styles — Subtle (light surface) and Filled (solid status color) — across four statuses, with full RTL mirroring.

## Variants

| Axis | Values | Count |
|---|---|---:|
| `Style` | Subtle (default), Filled | 2 |
| `Status` | Info (default), Success, Warning, Error | 4 |
| `State` | Default, Hover | 2 |
| `RTL` | False (default), True | 2 |

**Total:** 2 × 4 × 2 × 2 = **32 variants**

### Component properties

| Property | Type | Default |
|---|---|---|
| `Title` / `RTL Title` | Text | "Toast title here" / Arabic |
| `Description` / `RTL Description` | Text | Supporting sentence / Arabic |
| `CTA Text` / `RTL CTA` | Text | "View Details" / Arabic |
| `Show Description` | Boolean | ON |
| `Show CTA` | Boolean | ON |
| `Show Close` | Boolean | ON |
| `Status Icon` | Instance swap | info-circle |
| `Close Icon` | Instance swap | cancel |

## Layout

```
┌─────────────────────────────────────────────┐ 400 × HUG (84 with desc+CTA), radius 8, clips
│ (i)  Toast title here              View  ✕  │ ← Content row: pad 12px vert / 16px horiz, gap 12
│      Supporting description…     Details    │   icon 20 · text col FILL (gap 4) · CTA · close 16
├─────────────────────────────────────────────┤
│▰▰▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱▱│ ← Timeout bar: 4px, full width
└─────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Container | 400px wide (reference), height HUG, radius 8 (`--uems-radius-s`), `overflow: hidden` |
| Shadow | `0 4px 16px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.06)` |
| Content row | padding 12px vertical / 16px horizontal, gap 12px |
| Status icon | 20×20, fixed |
| Text column | FILL width; Title→Description gap 4px |
| Title | 13/20 `Text/Special-Sizes/small-13/Medium` (`--uems-font-size-13`/`--uems-line-height-13`, weight 500) |
| Description | 12/16 `Text/small/Regular` |
| CTA | 12/16 `Text/small/Medium`, **underlined**, **bottom-aligned** in the row (Figma CTA column is `self-stretch` + `justify-end`) |
| Close icon | 16×16, fixed |
| Timeout bar | 4px tall, full width, bottom corners radius 8; fill drawn at 40% (snapshot of the countdown) |

## Design Tokens Used

Hex comments = Light theme. `{Status}` ∈ Info/Success/Warning/Error.

### Subtle style

| Element | Token |
|---|---|
| Background | Default `--uems-bg-secondary-subtle` /* #F9FAFB */ · Hover `--uems-bg-primary-hover` /* #F0F2F5 */ |
| Title / Description | `--uems-text-primary` / `--uems-text-secondary` |
| CTA | Info `--uems-text-accent-primary`; Success/Warning/Error `--uems-text-{status}` |
| Status icon | Info `--uems-icon-info` /* #1E52BB */; others `--uems-text-{status}` (see flag 4) |
| Close icon | `--uems-icon-subtle` |
| Timeout track / fill | `--uems-bg-quaternary` / `--uems-bg-{status}-solid` |

### Filled style
> **Verified detail (2026-06-12):** in Figma the Filled **Timeout Bar container renders at 25% layer opacity** (black track + white fill both tinted by the solid status colour), and the Filled **description sits at 80% opacity**. Code applies both.


| Element | Default | Hover |
|---|---|---|
| Background | `--uems-bg-{status}-solid` | `--uems-bg-{status}-solid-hover` |
| All text (title/desc/CTA) | `--uems-text-white` | same |
| Status icon | `--uems-text-white` | same |
| Close icon | `--uems-border-{status}-subtle` (light tint) | same |
| Timeout track / fill | `--uems-bg-base-black` / `--uems-bg-base-white` | same |

## Developer Handoff

### Suggested API

```
<uems-toast
  status="info | success | warning | error"   (default: info)
  style="subtle | filled"                     (default: subtle)
  title="..."                                  (required)
  description="..."                            (optional)
  cta-text="..." cta-href / on-cta             (optional)
  dismissible                                  (default: true → close button)
  duration="5000"                              (ms; 0 → no auto-dismiss, no bar)
></uems-toast>
```

### HTML structure

```html
<div class="toast toast--subtle toast--info" role="status">
  <div class="toast__content">
    <svg class="toast__icon" aria-hidden="true"><!-- info-circle --></svg>
    <div class="toast__text">
      <div class="toast__title">Toast title here</div>
      <div class="toast__desc">Supporting description for the toast notification.</div>
    </div>
    <a class="toast__cta" href="…">View Details</a>
    <button class="toast__close" aria-label="Dismiss notification">
      <svg aria-hidden="true"><!-- cancel --></svg>
    </button>
  </div>
  <div class="toast__bar" aria-hidden="true"><div class="toast__bar-fill"></div></div>
</div>
```

### CSS

```css
.toast {
  width: 400px; max-width: calc(100vw - 32px);
  border-radius: var(--uems-radius-s, 8px);
  overflow: hidden;                /* clips the timeout bar into the corners */
  box-shadow: 0 4px 16px rgba(0,0,0,.12), 0 1px 4px rgba(0,0,0,.06);
  font-family: var(--uems-font-family);
}
.toast__content { display: flex; gap: var(--uems-spacing-12); padding: var(--uems-spacing-12) var(--uems-spacing-16); align-items: flex-start; }
.toast__icon { width: 20px; height: 20px; flex: none; stroke: var(--toast-icon); }
.toast__text { flex: 1; display: flex; flex-direction: column; gap: var(--uems-spacing-4); }
.toast__title { font-size: var(--uems-font-size-13); line-height: var(--uems-line-height-13); font-weight: var(--uems-font-weight-medium); color: var(--toast-title); }
.toast__desc  { font-size: var(--uems-font-size-12); line-height: var(--uems-line-height-12); color: var(--toast-desc); }
.toast__cta   { align-self: flex-end; font-size: var(--uems-font-size-12); line-height: var(--uems-line-height-12);
                font-weight: var(--uems-font-weight-medium); text-decoration: underline; color: var(--toast-cta); }
.toast__close { align-self: flex-start; background: none; border: 0; padding: 0; cursor: pointer; }
.toast__close svg { width: 16px; height: 16px; stroke: var(--toast-close); display: block; }

.toast__bar { height: 4px; background: var(--toast-track); }
.toast__bar-fill { height: 100%; background: var(--toast-fill); width: var(--toast-progress, 40%); }

/* ---- Subtle ---- */
.toast--subtle { background: var(--uems-bg-secondary-subtle);
  --toast-title: var(--uems-text-primary); --toast-desc: var(--uems-text-secondary);
  --toast-close: var(--uems-icon-subtle); --toast-track: var(--uems-bg-quaternary); }
.toast--subtle:hover { background: var(--uems-bg-primary-hover); }
.toast--subtle.toast--info    { --toast-icon: var(--uems-icon-info); --toast-cta: var(--uems-text-accent-primary); --toast-fill: var(--uems-bg-info-solid); }
.toast--subtle.toast--success { --toast-icon: var(--uems-text-success); --toast-cta: var(--uems-text-success); --toast-fill: var(--uems-bg-success-solid); }
.toast--subtle.toast--warning { --toast-icon: var(--uems-text-warning); --toast-cta: var(--uems-text-warning); --toast-fill: var(--uems-bg-warning-solid); }
.toast--subtle.toast--error   { --toast-icon: var(--uems-text-error); --toast-cta: var(--uems-text-error); --toast-fill: var(--uems-bg-error-solid); }

/* ---- Filled ---- */
.toast--filled { --toast-title: var(--uems-text-white); --toast-desc: var(--uems-text-white);
  --toast-cta: var(--uems-text-white); --toast-icon: var(--uems-text-white);
  --toast-track: var(--uems-bg-base-black); --toast-fill: var(--uems-bg-base-white); }
.toast--filled.toast--info    { background: var(--uems-bg-info-solid);    --toast-close: var(--uems-border-accent-subtle); }
.toast--filled.toast--info:hover    { background: var(--uems-bg-info-solid-hover); }
.toast--filled.toast--success { background: var(--uems-bg-success-solid); --toast-close: var(--uems-border-success-subtle); }
.toast--filled.toast--success:hover { background: var(--uems-bg-success-solid-hover); }
.toast--filled.toast--warning { background: var(--uems-bg-warning-solid); --toast-close: var(--uems-border-warning-subtle); }
.toast--filled.toast--warning:hover { background: var(--uems-bg-warning-solid-hover); }
.toast--filled.toast--error   { background: var(--uems-bg-error-solid);   --toast-close: var(--uems-border-error-subtle); }
.toast--filled.toast--error:hover   { background: var(--uems-bg-error-solid-hover); }

/* RTL — logical flow handles order; nothing to mirror except text alignment */
[dir="rtl"] .toast__text { text-align: right; }
```

### Timeout bar behavior

The Figma 40% fill is a **snapshot of the countdown**. In code:

```js
toast.style.setProperty('--toast-progress', '100%');
// animate 100% → 0% over `duration` with linear easing (CSS transition or rAF)
// pause on hover / focus-within; resume on leave
```

The fill is anchored to the reading-direction start (left in LTR, right in RTL — flex `dir` handles it).

## States and Interactions

| Element | State/Event | Behavior |
|---|---|---|
| Toast (Filled) | Hover | Background deepens to `*-solid-hover`; **auto-dismiss timer pauses** |
| Toast (Subtle) | Hover | Background tints to `--uems-bg-primary-hover`; **auto-dismiss timer pauses** |
| CTA | Click | Navigate/act; toast persists (don't dismiss on CTA unless the action resolves it) |
| Close | Click | Dismiss immediately |
| Timer | Elapsed | Auto-dismiss with exit animation |
| `Escape` | Keydown (focus within) | Dismiss |

## Responsive Behavior

| Constraint | Behavior |
|---|---|
| Desktop | Fixed 400px, stacked in a viewport-corner region (top-right LTR / top-left RTL suggested) |
| Mobile (<480px) | `max-width: calc(100vw - 32px)`, full-width minus margins |
| Stacking | Newest on top, max ~3 visible; collapse the rest (suggested — not drawn in Figma) |

## Edge Cases

- **Title only** — `Show Description`/`Show CTA`/`Show Close` all OFF: single 20px row, container hugs to ~44px
- **Long title/description** — wraps (no truncation drawn); cap description at ~3 lines with ellipsis for sanity (suggested)
- **duration=0 / persistent** — hide the timeout bar entirely; require explicit dismissal
- **Multiple toasts** — each manages its own timer; pausing one (hover) shouldn't pause siblings
- **CTA without href** — render `<button>`, same styling

## Animation / Motion

Not specified in Figma — suggested, confirm with design:

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Toast | Enter | slide-in from edge + fade | 250ms | ease-out |
| Toast | Exit (dismiss/timeout) | fade + slight slide | 200ms | ease-in |
| Timeout bar | While visible | width 100% → 0% | = `duration` | linear |
| Filled bg | Hover | background-color | 100ms | ease-out |

`prefers-reduced-motion`: fade only, no slide; keep the bar (it's information, not decoration).

## Accessibility

| Concern | Guidance |
|---|---|
| Role | `role="status"` (polite) for info/success; `role="alert"` (assertive) for error/warning |
| Focus | Toasts must NOT steal focus; close/CTA reachable via Tab when the user navigates to them |
| Close | `<button aria-label="Dismiss notification">`, icon `aria-hidden` |
| Timer | Pause countdown on hover **and** `focus-within` (WCAG 2.2.1 Timing Adjustable); timeout bar is `aria-hidden` |
| Escape | Dismisses the focused/most recent toast |
| Contrast | Filled: white on `*-solid` passes AA for all four statuses; Subtle: status text colors on #F9FAFB pass AA |
| Don't auto-dismiss errors | Errors with actions should persist until dismissed |

## Verification

All **32 variants** were programmatically scanned (Desktop Bridge): container fills/radius/shadows, full text token + typography signatures per Style × Status × State (deduped with RTL cross-check), both icon instances (component, size, stroke token) on every variant, timeout-bar structure (track/fill tokens, 4px height, bottom-corner radii, 40% fill snapshot), and inner geometry (12/16 padding, 12px gap, 4px text gap — validated against the node tree). Findings cluster into the flags below.

## Flags for design

Flags 1–3 and 5 were **fixed in Figma on 2026-06-12**; flag 4 was resolved for Info the same day, with an optional remainder.

1. ~~**Component description is stale**~~ — **Fixed:** description now reads "Subtle (light neutral BG — BG-Secondary_subtle)", drops the never-drawn left border, documents the Hover semantics and the 4px timeout bar.
2. ~~**Shadow drift on the default variant**~~ — **Fixed:** `Subtle/Info/Default/LTR` now carries the dual `0 4px 16px @12% + 0 1px 4px @6%`; all 32 variants verified on one shadow signature.
3. ~~**Close-icon color drift**~~ — **Fixed:** rebound to `Icon-Subtle`; all Subtle close icons verified on one token.
4. **Status-icon token family (Info resolved)** — design rebound the Subtle Info status icon to the dedicated `Icon-Info` token (was `Icon-Accent-Button`; visibly shifted `#006AFF` → `#1E52BB`). Success/Warning/Error still bind `Text-*` tokens. Their values match the `Icon-*` equivalents in the Light themes but **differ one ramp step in Dark/Night** (e.g. `Text-Success` Fern-300 vs `Icon-Success` Fern-400 in Dark) — rebinding is still the semantically right cleanup, but verify dark-theme appearance when doing it.
5. ~~**Subtle Hover variants were visually identical to Default**~~ — **Fixed by design:** Subtle Hover now tints the container to `BG-Primary-hover` (#F0F2F5) on all four statuses; verified uniform, all other properties unchanged.

---

*Generated from UEMS Design System 3.0 · Figma node `15938:44865` · 2026-06-12 · all 32 variants programmatically verified (tokens, geometry, icons, timeout bar)*
