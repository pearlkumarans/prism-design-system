# Handoff Spec: Toggle

**Figma:** [UEMS — Design System 3.0 · node `15898:21879`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=15898-21879) · Component set, **96 variants**

**Related:** Theme tokens → `uems-theme-tokens.md` · Primitives → `primitive-colors.md` · Siblings → `icon-button.md`, `tag.md`

---

## Overview

A binary on/off switch: a pill track with a circular thumb that travels between ends. Effects are immediate (no submit). Optional in-track label ("Enable" by default — customizable via the `Label` / `RTL Label` text properties), full RTL mirroring, and four real interaction states. Use a Checkbox instead when the value is part of a form submission.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Size` | Small (default), Medium, Large | 3 |
| `Toggled` | On (default), Off | 2 |
| `State` | Default, Hover, Disabled, Focus | 4 |
| `Show Text` | False (default), True | 2 |
| `RTL` | False, True | 2 |

**Total:** 3 × 2 × 4 × 2 × 2 = **96 variants**

### Component properties

| Property | Type | Default | Maps to |
|---|---|---|---|
| `Label` | Text | `"Enable"` | In-track label (LTR variants) |
| `RTL Label` | Text | `"يُمكِّن"` | In-track label (RTL variants) |

## Layout

```
Off:  ◯──────────        On:  ──────────◯      track: pill radius
Labeled (text INSIDE the track):
Off:  ◯ Enable           On:  Enable ◯
```

### Size metrics — unlabeled

| Size | Track | Thumb | Effective gap (vertical / edge) |
|---|---|---|---|
| Small | 28×16 | 12 | 2px / 2px |
| Medium | 44×20 | **16** | 2px / 2px |
| Large | 60×28 | 20 | 4px / 4px |

> **Medium thumb is 16px** (both On and Off — consistent). It exceeds the declared 4px padding on the 44×20 track (4+16+4=24 > 20), so Figma renders it **vertically centered (2px effective gap)**, sitting **2px from the active edge**. Implement with fixed dimensions + flex/centering (or `top:50%` + a 2px edge inset), not the declared padding.
>
> *Travel* (only needed for a `transform: translateX()` approach — a `justify-content` flip / logical-inset flip needs none): trackW − thumbW − bothGaps → Small 28−12−4=**12px**, Medium 44−16−4=**24px**, Large 60−20−8=**32px**.

### Size metrics — labeled (`Show Text=True`; track grows +4px taller, thumb grows on L)

| Size | Track height | Thumb | Padding (thumb-side / label-side) | Gap | Label (Zoho Puvi Medium) |
|---|---|---|---|---|---|
| Small | 20 | 12 | 4px / 8px | 4px | 12px / 16px line-height |
| Medium | 24 | 16 | 4px / 8px | 4px | 14px / 20px |
| Large | 32 | 24 | 4px / 8px | 4px | 16px / 24px |

Width hugs the label. Label sits opposite the thumb (On: label left + thumb right in LTR). The +4px labeled height is **intentional**.

## Design Tokens Used

Hex comments = Light theme.

### Track

| Toggled | Default | Hover | Disabled | Focus (inner) |
|---|---|---|---|---|
| On | `--uems-bg-button-primary` /* #006AFF */ | `--uems-bg-button-primary-hover` /* #1E52BB */ | `--uems-bg-accent-disabled` /* #ABC2F1 */ | same as Default |
| Off | `--uems-bg-quaternary` /* #D2D7E0 */ | `--uems-bg-accent-primary-hover` /* #D5E0F8 */ | `--uems-bg-disabled` /* #E1E4EB */ | same as Default |

### Thumb

| State | Fill | Shadow |
|---|---|---|
| Default / Focus | `--uems-bg-base-white` | none |
| **Hover only** | `--uems-bg-base-white` | `0 1px 4px rgba(0,0,0,0.15)` — the shadow is a hover affordance, not a resting style |
| Disabled | `--uems-bg-secondary-subtle` /* #F9FAFB */ | none |

### In-track label

| Toggled | Default/Hover/Focus | Disabled |
|---|---|---|
| On | `--uems-text-white` | `--uems-text-white` — **intentional** (the dimmed accent track carries the disabled signal) |
| Off | `--uems-text-secondary` /* #2A303D */ | `--uems-text-disabled` /* #8893AD */ |

### Focus (all variants)

In Figma the focus variant wraps the track in a frame with a 2px `Border-Accent-Focus` inside-stroke and 2px padding. The inside-stroke occupies that padding, so the **net visual is a 2px ring hugging the track edge with no gap** — i.e. `outline-offset: 0`, not a 2px offset. Track colors are unchanged.

```css
outline: 2px solid var(--uems-border-accent-focus);
outline-offset: 0;
```

> **Focus token:** the ring binds `Border-Accent-Focus` — the dedicated, canonical focus token (identical to `Border-Accent` in Light/Dark/Green, but the correct hyperlink `#006AFF` in Night theme rather than cobalt `#1E52BB`). Rebound system-wide across all focus-capable components, so every focus ring in the system uses one token.

## Developer Handoff

### Suggested API (canonical)

```
<uems-toggle
  size="small | medium | large"   (default: small)
  checked                          (boolean)
  disabled                         (boolean)
  label="..."                      (optional in-track text — Show Text mode)
></uems-toggle>
<!-- events: change -->
```

### HTML structure

```html
<button class="toggle toggle--small" role="switch" aria-checked="true" type="button">
  <span class="toggle__label">Enable</span>   <!-- only in labeled mode -->
  <span class="toggle__thumb" aria-hidden="true"></span>
</button>
```

### CSS

```css
.toggle {
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  border: none;
  border-radius: var(--uems-radius-pill);
  background: var(--tg-track);
  cursor: pointer;
  transition: background-color 150ms ease;
}

.toggle__thumb {
  border-radius: var(--uems-radius-pill);
  background: var(--uems-bg-base-white);
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.toggle:hover:enabled .toggle__thumb {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);   /* shadow appears on hover only */
}

/* sizes — unlabeled */
.toggle--small  { width: 28px; height: 16px; }  .toggle--small  .toggle__thumb { width: 12px; height: 12px; }  /* 2px edge gap */
.toggle--medium { width: 44px; height: 20px; }  .toggle--medium .toggle__thumb { width: 16px; height: 16px; }  /* 16px thumb, centered, 2px gap */
.toggle--large  { width: 60px; height: 28px; }  .toggle--large  .toggle__thumb { width: 20px; height: 20px; }  /* 4px edge gap */

/* labeled — width hugs, track taller, bigger thumb on Large */
.toggle--labeled.toggle--small  { height: 20px; font-size: var(--uems-font-size-12); line-height: 16px; }
.toggle--labeled.toggle--medium { height: 24px; font-size: var(--uems-font-size-14); line-height: 20px; }
.toggle--labeled.toggle--large  { height: 32px; font-size: var(--uems-font-size-16); line-height: 24px; }
.toggle--labeled.toggle--large  .toggle__thumb { width: 24px; height: 24px; }
.toggle__label { font-family: 'Zoho Puvi', sans-serif; font-weight: 500; white-space: nowrap; }

/* states */
.toggle[aria-checked="true"]  { --tg-track: var(--uems-bg-button-primary); color: var(--uems-text-white); }
.toggle[aria-checked="false"] { --tg-track: var(--uems-bg-quaternary);     color: var(--uems-text-secondary); }
.toggle[aria-checked="true"]:hover:enabled  { --tg-track: var(--uems-bg-button-primary-hover); }
.toggle[aria-checked="false"]:hover:enabled { --tg-track: var(--uems-bg-accent-primary-hover); }
.toggle:focus-visible { outline: 2px solid var(--uems-border-accent-focus); outline-offset: 0; }
.toggle:disabled { cursor: not-allowed; }   /* full opacity — token swap only */
.toggle[aria-checked="true"]:disabled  { --tg-track: var(--uems-bg-accent-disabled); }
.toggle[aria-checked="false"]:disabled { --tg-track: var(--uems-bg-disabled); color: var(--uems-text-disabled); }
.toggle:disabled .toggle__thumb { background: var(--uems-bg-secondary-subtle); box-shadow: none; }
```

> Implement the thumb position with flex alignment, `transform`, or **logical insets** (`inset-inline-start/end`) — not physical `left`/`right` — so `dir="rtl"` mirrors for free, matching Figma's RTL variants (On = thumb leading in RTL).

## States and Interactions

| Event | Behavior |
|---|---|
| Click / tap anywhere on track | Toggles immediately; emits `change` |
| `Space` / `Enter` | Toggles (native button) |
| Hover | Track color shift per matrix; thumb gains its drop shadow (hover affordance); Off hover previews the accent tint |
| Focus | Accent ring (offset 0); track unchanged |
| Disabled | Track + thumb token swap, shadow removed, no interaction; full opacity (system convention) |
| RTL | `dir="rtl"` mirrors thumb side and label order automatically |

## Edge Cases

- **Long label:** track hugs — cap with `max-width` + ellipsis at the consumer if space is constrained; labels should be 1–2 words ("Enable", "On").
- **Label changes On↔Off:** the in-track label is a STATIC string — it does not change between states; only its side within the track flips.
- **Touch target:** Small is 16px tall — extend the hit area to ≥24px (padding overlay) when standalone.
- **No indeterminate state** — a switch is binary; use Checkbox for tri-state.

## Animation / Motion

Not specified in Figma. 150ms ease on thumb travel and track color; respect `prefers-reduced-motion` (snap, no slide).

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | `<button role="switch" aria-checked>`; never a div |
| Name | External `<label>` or `aria-labelledby`; the in-track text is *state* text, keep `aria-hidden` if it duplicates the accessible name |
| Keyboard | `Space`/`Enter` toggle; one tab stop |
| Announcement | State change announced via `aria-checked`; no live region needed |
| Contrast | On #006AFF vs white thumb passes non-text 3:1; Off `BG-Quaternary` #D2D7E0 vs white thumb — visible, verify on tinted surfaces |
| Disabled | Native `disabled` + the token-swap visuals |

## Verification

All **96 variants** re-checked after the latest Figma edit (Medium thumb → 16px for **both** On and Off): track/thumb/label tokens per Toggled × State (incl. `BG-Quaternary` Off in Default **and** Focus), unlabeled thumb sizes (Small 12, **Medium 16**, Large 20 — consistent On/Off), shadow on Hover only (24/24) and flat elsewhere (72/72), disabled thumb (`BG-Secondary_subtle`, flattened — 24/24), labeled metrics (heights 20/24/32, fonts 12/16 · 14/20 · 16/24, pad 4/8, gap 4, thumbs 12/16/24), focus rings (`Border-Accent-Focus`, offset 0, 24/24), RTL mirroring, `Label`/`RTL Label` bindings (48/48). **96/96 conform — zero deviations.** Figma component description re-synced.

## Design decisions on record

- **Medium thumb is 16px in both states** — consistent (the earlier 12-vs-16 asymmetry was resolved by bumping Off to 16). Exceeds the 44×20 track padding → centered with a 2px effective gap; render via fixed size + centering.
- **On/Disabled label stays `Text-White`** — intentional; the dimmed `BG-Accent-Disabled` track carries the disabled signal.
- **Thumb drop shadow is a hover-only affordance** — resting, focused, and disabled thumbs are flat.
- **Small grows from 16px to 20px when labeled** — intentional; the in-track label needs the taller line box.

## Flags for design

1. **`Small/Off/Disabled` has a leftover `Border-Disabled` stroke layer set to `visible:false`** (one variant only) — renders nothing, zero impact. Safe to delete in Figma for cleanliness.

## Implementation deviations (ds-toggle, this codebase)

These are intentional differences from the *suggested* API above — the visual/token spec is implemented exactly; only the attribute surface differs, to avoid breaking existing consumers (e.g. Switch.html, showcase matrix):

- **In-track label is `show-text` + `text`, not `label`.** `<ds-toggle show-text text="Enable">` turns on labeled mode; bare `show-text` defaults the text to `"Enable"` (static, does not flip). The `label` attribute is reserved for the **accessible name** (`aria-label`) — callers use it as the field caption (`<ds-toggle label="Push notifications">`), which must NOT render inside the track.
- **Default size is `medium`** (baked onto the base class), matching the Figma default visual and existing usages. Pass `size="small"`/`size="large"` to override.
- **Thumb travel uses absolute positioning with logical insets** (`inset-inline-start/end`) for a smooth slide that still mirrors under `dir="rtl"` — an allowed alternative to the flex-justify flip (spec only forbids physical `left`/`right`).
- **Change event is `ds-toggle-change`** (`detail: { checked }`), namespaced per this library's convention.

---

*Generated from UEMS Design System 3.0 · Figma node `15898:21879` · 2026-06-13 · all 96 variants + property wiring verified, zero deviations.*
