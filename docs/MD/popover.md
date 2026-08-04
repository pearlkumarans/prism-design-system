# Popover Component

**Design System:** UEMS Design System 3.0
**Custom element:** `<ds-popover>`
**Source:** `design-system-library/src/components/popover/`
**Figma:** `Popover / Container` (node 21532-788062)

---

## Overview

The Popover is a non-modal overlay anchored to a trigger — an optional header (title + close), a body for rich content, and an optional footer for actions, with an optional arrow pointing at the trigger. Use it for contextual detail, lightweight forms, or supporting actions that should appear beside an element without leaving the page. Width hugs its content (240px floor); it anchors at one of twelve placements, flips on collision, clamps to the viewport, and dismisses on outside-click, Esc, or the close button. Distinct from Tooltip (hover, text only) and Dropdown (menu list).

---

## Anatomy

```
              ▲                         ← Arrow / beak (optional, points at trigger)
        ┌──────────────────────── × ┐   ← Close (optional)
        │  Popover title              │   ← Title
        │  ───────────────────────────│   ← Header divider (default on)
        │  Body content — any rich    │   ← Body slot (scrollable if tall)
        │  content the popover holds. │
        │  ───────────────────────────│   ← Footer divider
        │            [Cancel] [Confirm]│   ← Footer slot (optional)
        └──────────────────────────────┘
```

| Part | Description |
|------|-------------|
| **Arrow / beak** | 14×8 (top/bottom) · 8×14 (left/right) triangle sharing the surface fill + 1px border. Sits on the edge facing the trigger and points at the trigger's centre. Optional (`arrow`, default off). Decorative (`aria-hidden`). |
| **Surface** | The container. `bg-primary-alt`, 1px `border-secondary`, `radius-8`, elevation shadow. Hugs content, 240px min-width, no max. |
| **Header** | Title + close ✕, with a bottom divider (`border-primary`). Auto-shows when `title`/`rtl-title` set. |
| **Title** | Short label. `Text/Default/SemiBold`, `text-primary`. Single line, truncates with ellipsis. |
| **Close** | 16px ✕ glyph, `icon-subtle`. Hidden via `hide-close`. |
| **Body** | Default slot. Any content. `14/20`, `text-secondary`. |
| **Footer** | Optional action group with a top divider. Consumer composes `<ds-button>`s in `slot="footer"`. |

---

## Placement

`placement` = one of four sides × three alignments (12), e.g. `bottom-start`. A bare side (`bottom`) is treated as `-center`.

| Side | Popover sits | Arrow edge → points |
|------|--------------|---------------------|
| `top-*` | above the trigger | bottom edge → down |
| `bottom-*` | below the trigger | top edge → up |
| `left-*` | left of the trigger | right edge → right |
| `right-*` | right of the trigger | left edge → left |

Alignment (`-start` / `-center` / `-end`) sets where the popover aligns along the trigger; the arrow then points back at the trigger's centre. If the chosen side lacks room, the popover **flips** to the opposite side and the arrow follows. Final position is **clamped** to an 8px viewport margin.

---

## States

| State | Behavior |
|-------|----------|
| **Closed** | `display:none`; not in the a11y tree. |
| **Open** | Positioned against the anchor (`requestAnimationFrame` measure → reposition), animates in. Focus moves into the surface. |
| **Reposition** | On window resize/scroll while open. |
| **Dismiss** | Outside-click · Esc · close ✕ · `close()` — each emits `ds-popover-close` with a `reason`. |

---

## Component Properties

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `anchor` | element id | — | The trigger the popover anchors to (and toggles on click). Omit for inline/manual positioning. |
| `placement` | `top\|bottom\|left\|right` + `-start\|-center\|-end` | `bottom-start` | Anchor side + alignment. Flips on collision. |
| `title` | string | — | Header title (LTR). Auto-shows the header. |
| `rtl-title` | string | — | Title shown when `rtl` is set (Arabic). Mirrors ds-button's `Label`/`RTL Label`. |
| `has-header` | boolean | unset | Force-show the header (auto-on when a title is set). |
| `hide-close` | boolean | unset | Hide the close ✕ when a header is shown. |
| `hide-divider` | boolean | unset | Hide the header bottom divider. |
| `has-footer` | boolean | unset | Force-show the footer (auto-on when footer slot has content). |
| `footer-align` | `default` · `centered` | `default` | Footer button-group alignment. |
| `arrow` | boolean | unset (off) | Show the beak pointing at the anchor. |
| `rtl` | boolean | unset | Mirror layout (✕ left, text right, footer to start) + use `rtl-title`. Sets `dir="rtl"`. |
| `open` | boolean | unset | Open / close state. |

### Methods
- `open()` · `close()` · `toggle()`

### Slots
| Slot | Purpose |
|------|---------|
| (default) | Body content. |
| `footer` | Footer actions (children are unwrapped into the footer). |

### Events
| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-popover-open` | — | Popover opened. |
| `ds-popover-close` | `{ reason }` | Dismissed — `reason` is `esc` · `outside` · `close` · `api`. |

### Width
Hugs content with a 240px floor and **no max**. Force wrapping with `--ds-popover-width` (e.g. `280px`) or an inline width.

---

## Design Tokens

### Container
| Property | Value |
|----------|-------|
| Surface fill | `--uems-bg-primary-alt` · #ffffff |
| Border | 1px `--uems-border-secondary` · #c3c9d6 |
| Corner radius | `--radius-md` · 8 px |
| Drop shadow | `--shadow-md` |
| Min width | 240 px (no max; `--ds-popover-width` override) |
| Anchor gap / viewport clamp | 8 px / 8 px |

### Sections
| Region | Padding | Divider |
|--------|---------|---------|
| Header | `12px 16px` (logical; mirrors under RTL) | bottom 1px `--uems-border-primary` |
| Body | `16px` | — |
| Footer | `12px 16px` | top 1px `--uems-border-primary` |

### Typography & icon
| Element | Style |
|---------|-------|
| Title | `Text/Default/SemiBold` 14, `--uems-text-primary` |
| Body | 14 / 20 regular, `--uems-text-secondary` |
| Close glyph | 16 px, `--uems-icon-subtle` |

### Motion
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Surface (open) | fade + 4px slide-up | 130 ms | `--ease-standard` (ease-out) |
| `prefers-reduced-motion` | none | — | — |

---

## Usage

### Do
- Anchor the popover to the control that opened it, and point the arrow at that control.
- Keep content focused — a short detail, a few fields, or 1–3 actions.
- Dismiss on outside-click and Esc; return focus to the trigger on close.
- Use `placement` + alignment that keeps the popover near its trigger and on-screen.
- Use `rtl` + `rtl-title` for Arabic; let the layout mirror.

### Don't
- Put long forms or multi-step flows in a popover — use a Drawer or Modal.
- Nest popovers or open one from inside another.
- Use a popover for hover hints — that's a Tooltip.
- Hardcode the width — let it hug, or set `--ds-popover-width` to wrap.
- Trap focus — the popover is non-modal; the page stays interactive.

---

## Accessibility

| Concern | Implementation |
|---------|----------------|
| **Role** | `role="dialog"` on the surface. |
| **Name** | `aria-labelledby` → title when present, else `aria-label` ("Popover" fallback). |
| **Trigger** | `aria-haspopup="dialog"`, `aria-controls` → popover id, `aria-expanded` reflects open state. |
| **Close button** | `aria-label="Close"`. |
| **Focus on open** | Moves to the first focusable in the surface (or the surface itself). |
| **Focus restore** | Returns to the trigger (or previously-focused element) on close. |
| **Non-modal** | Focus is NOT trapped; Tab softly cycles within the surface. |
| **Esc / outside-click** | Dismiss. |
| **Arrow** | Decorative — `aria-hidden="true"`. |
| **RTL** | `dir="rtl"`; layout mirrors and the Arabic `rtl-title` is used. |

---

## Related Components

| Component | When to use instead |
|-----------|---------------------|
| **Tooltip** | Brief, hover-triggered text hints with no actions. |
| **Dropdown** | A menu of selectable options/commands. |
| **Modal** | A focused, blocking task that should interrupt the page. |
| **Drawer** | A larger side panel for forms, detail views, or filters. |
