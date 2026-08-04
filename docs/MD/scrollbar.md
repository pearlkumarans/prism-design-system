# Handoff Spec: Scrollbar

> Source: Figma — UEMS Design System 3.0 · [ds-scrollbar/vertical](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=21449-586344) · [ds-scrollbar/horizontal](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=21449-586382)
> Target: Web component (framework-agnostic custom element `<ds-scrollbar>`).
> Related: a chrome/overlay element — pairs with any scrollable container (lists, [data-table](data-table.md), [Modal](Modal.md) bodies, side rails).

---

## Overview

A **custom overlay scrollbar** — a supplemental, runtime-driven scroll indicator that floats over scrollable content rather than occupying layout width. The **track** is the full-length transparent rail; the **thumb** is the only visible, draggable element.

Two Figma component sets, one per axis:
- **`ds-scrollbar/vertical`** — width is fixed (the gutter), height fills the scroll container.
- **`ds-scrollbar/horizontal`** — transposed: height is fixed, width fills.

**Style is overlay-only** — no arrow step buttons, no grip texture. Anatomy is just **Track + Thumb**.

> Thumb **length** is computed at runtime from the viewport-to-content ratio; Figma only documents a representative proportion (~40%) and the **minimum clamp**. Thumb **position** maps to scroll offset. Because both are data-driven, this is a JS-driven component (or native scrollbar styling) — not a static CSS element.

**Figma variant axes** (both sets)

- **Size**: `Thin | Regular` — cross-axis thickness of the thumb.
- **State**: `Rest | Hover | Active` — Rest is subtle; Hover darkens; Active darkens **and grows**.

**Component property**

- **Focused** (`boolean`, default `false`) — toggles a 2px accent focus ring on the thumb.

> **No Disabled variant** — when there is no overflow, the scrollbar is simply not rendered.

---

## Anatomy

```
 Vertical              Horizontal
┌──┐  ← Track          ┌──────────────────┐  ← Track (transparent rail)
│▐ │    (transparent)  │      ▟▟▟▟▟        │
│▐ │  ← Thumb          └──────────────────┘
│▐ │    (pill handle)     ▲ Thumb (pill, runtime length on long axis)
│  │
└──┘
```

| # | Element | Notes |
|---|---------|-------|
| 1 | **Track** | Full-length rail spanning the scroll axis. **Transparent** (no fill, no border) in overlay. |
| 2 | **Thumb** | Pill handle. **Fills the track's cross-axis** (`layoutAlign: STRETCH`); length is runtime-driven on the long axis. |
| 3 | **Focus Ring** | 2px **`OUTSIDE`** stroke on the thumb (`Border-Accent`), coincident with the thumb bounds so it extends 2px beyond on every side. Hidden until `Focused = true`. **Fixed** corner radius **6** (Thin) / **9** (Regular) — a rounded-rect ring, **not** the thumb's pill (9999) radius. |

---

## Layout

| Region | Vertical | Horizontal |
|--------|----------|------------|
| **Track (component)** | width = FIXED (gutter); height = FILL container | height = FIXED (gutter); width = FILL container |
| **Thumb** | width FILL (stretch to gutter); height = runtime length | height FILL (stretch to gutter); width = runtime length |
| Padding / gap | 0 (overlay) | 0 (overlay) |

- The thumb stretches to the full cross-axis via `STRETCH` alignment, so thumb thickness === gutter thickness for a given size/state.
- Use **logical properties** (`inline-size` / `block-size`) so a single rule serves both orientations.

### Sizing

| Element | Value |
|---------|-------|
| Track length | 100% of the scroll container's scroll axis |
| Thumb length (long axis) | runtime = `(viewport / content) × trackLength`, **min 24px** |
| Figma mock length | ~40% of track (representative only) |

---

## Design Tokens Used

### Color

| Token | Value (Light) | Usage |
|-------|---------------|-------|
| `Background/BG-Quaternary` | `#d2d7e0` (Grey Modern 150) | Thumb — **Rest** |
| `Background/BG-Quaternary-Solid` | `#5f6c89` (Grey Modern 550) | Thumb — **Hover** & **Active** |
| `Border/Border-Accent` | `#006aff` (Hyperlink) | **Focus** ring |
| Track | transparent | Overlay track has no fill |

> **Theme-aware** — all colors are variables in `UEMS Theme Tokens` and resolve per active theme (Light / Dark / Night / Green light / Green dark). Hex above is the **Light** resolution; bind to the named token, never the hex.

### Dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `radius/radius-pill` | 9999 (pill) | Thumb corner radius — fully rounded at any thickness |

> Cross-axis thickness is bound to primitive size variables (`4px` / `6px` / `8px`); there is **no scrollbar-specific dimension token** — the component is the source of truth (see §States).

---

## States and Interactions

Thumb thickness **grows on Active**; fill darkens on Hover and stays dark through Active. Values are the cross-axis thickness (width for vertical, height for horizontal).

| Size | State | Thumb thickness | Fill | Radius |
|------|-------|-----------------|------|--------|
| **Thin** | Rest | 4px | `BG-Quaternary` `#d2d7e0` | pill (`radius-pill`) |
| **Thin** | Hover | 4px | `BG-Quaternary-Solid` `#5f6c89` | pill (`radius-pill`) |
| **Thin** | Active | **6px** ↑ | `BG-Quaternary-Solid` `#5f6c89` | pill (`radius-pill`) |
| **Regular** | Rest | 6px | `BG-Quaternary` `#d2d7e0` | pill (`radius-pill`) |
| **Regular** | Hover | 6px | `BG-Quaternary-Solid` `#5f6c89` | pill (`radius-pill`) |
| **Regular** | Active | **8px** ↑ | `BG-Quaternary-Solid` `#5f6c89` | pill (`radius-pill`) |

> As-built differentiation: **Rest → Hover = color** (light→dark); **Hover → Active = thickness** (grow). Hover and Active share the same fill — if a distinct *pressed color* is wanted, point Active at a darker token.

### Interaction behavior

| Element | Trigger | Behavior |
|---------|---------|----------|
| Thumb | Pointer enter (over track region) | Fill → `BG-Quaternary-Solid` |
| Thumb | Pointer down / drag | Thickness grows (4→6 Thin / 6→8 Regular); scrolls content 1:1 with thumb position |
| Track | Click on empty track | Page toward the click point (smooth) |
| Scrollbar | Keyboard focus on container | Focus ring (`Focused`) on thumb |
| Scrollbar | **Pointer enters** the scroll region | **Show** — fade in |
| Scrollbar | **Pointer leaves** the scroll region | **Hide** — fade out |

> **Auto-hide = cursor presence.** The scrollbar is shown while the pointer is **over the scroll host** (`pointerenter`) and hidden when it **leaves** (`pointerleave`) — *not* on an idle timer. Exceptions that keep it visible regardless of pointer position: (a) while the user is **actively dragging the thumb** (don't vanish mid-drag if the pointer slips off), and (b) while the container has **keyboard focus**. On **coarse/touch** pointers there's no hover, so reveal briefly on scroll and fade after scrolling stops.

> **Focus** uses `:focus-visible` on the scrollable region → reflect to `:state(focused)`; the 2px ring is `OUTSIDE`, so the host must not clip overflow.

---

## Responsive Behavior

| Context | Changes |
|---------|---------|
| Mouse / fine pointer | Overlay thumb with hover darken + grow-on-active enabled. `Thin` acceptable. |
| Touch / coarse pointer | Native scroll + auto-hidden overlay; prefer `Regular`. Thumb hit area = its visible size (standard custom-scrollbar behavior) — touch users scroll by gesture, not by grabbing the thumb. |
| Both axes overflow | Two `ds-scrollbar` instances (one per axis); they don't overlap at the corner. |
| Container resize / content change | Recompute thumb length & position (ResizeObserver / MutationObserver + scroll). |

---

## RTL

- **Vertical** bar moves to the **left** edge in RTL (right in LTR).
- **Horizontal** logic mirrors (thumb position origin flips).
- Implement with `dir`-aware logic + logical properties (`inset-inline-start`); no separate RTL variants are needed (the thumb is visually symmetric).

---

## Edge Cases

- **No overflow**: hide the scrollbar entirely (no Disabled state exists).
- **Very long content**: enforce a small thumb-length floor (~24px) in code so it never collapses to a dot. (Not a Figma token — runtime concern.)
- **Near-full content**: thumb caps near track length; hide once ratio ≥ 1.
- **Dynamic content**: re-measure on resize, scroll, and DOM mutation.
- **Fast/slow scroll**: position update is 1:1 with scroll offset; no easing on drag.
- **Nested scroll areas**: each gets its own instance; don't let parent and child bars fight for the same gesture.

---

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---------|---------|-----------|----------|--------|
| Thumb fill | Hover in/out | Color fade | 120ms | ease |
| Thumb thickness | Active (press/drag) | Grow / shrink | 120ms | ease |
| Track click | Click empty track | Smooth scroll to point | ~200ms | ease-out |
| Scrollbar | Pointer enters region (show) | Opacity 0→1 fade in | 80ms | ease-out |
| Scrollbar | Pointer leaves region (hide) | Opacity 1→0 fade out | 200ms | ease-in |

> Respect `prefers-reduced-motion: reduce` — drop the auto-hide fade and smooth track-click; show/hide instantly and jump scroll.

---

## Accessibility

- **Thin hit area is intentional**: this is a custom overlay scrollbar (like the bars in VS Code, GitHub, macOS overlay, most web apps) — the thumb's interactive area **equals its visible size** (4–8px). We deliberately do **not** add an enlarged hit target. This is acceptable because the scrollbar is a supplemental affordance, not the primary scroll mechanism.
- **Keyboard is the accessible path**: the scroll **container** is focusable (`Tab`) and fully operable with `↑ ↓ ← →`, `PageUp`/`PageDown`, `Home`/`End`, plus wheel/trackpad. The scrollbar is supplemental — **never the only way to scroll**, which is what satisfies operability without an enlarged thumb target.
- **Focus visible**: render the 2px accent ring on `:focus-visible`; ensure host `overflow` doesn't clip it.
- **ARIA**: a decorative overlay thumb that only mirrors native scroll can be `aria-hidden="true"`. If the thumb itself becomes a control, use `role="scrollbar"` with `aria-controls`, `aria-orientation`, `aria-valuenow/valuemin/valuemax`.
- **Contrast**: thumb-vs-content should reach **≥ 3:1** in the strong (Hover/Active) state for the graphical-object guideline (1.4.11). Rest is intentionally subtle — acceptable for non-essential chrome.
- **No focus trap**: the thumb must not capture or hold keyboard focus.

---

## Suggested Web Component API

A single element for both orientations; wrap or attach it to any scrollable region.

```html
<div class="scroll-host">
  <div class="content">…</div>
  <ds-scrollbar orientation="vertical" size="regular" autohide></ds-scrollbar>
</div>
```

**`<ds-scrollbar>`**

| Prop | Figma | Type | Default | Notes |
|------|-------|------|---------|-------|
| `orientation` | (set: vertical / horizontal) | `vertical \| horizontal` | `vertical` | Maps to the two Figma sets |
| `size` | `Size` | `thin \| regular` | `regular` | Cross-axis thickness |
| `autohide` | — | boolean | `true` | Show while the pointer is over the scroll region; fade out when it leaves. Stays visible while dragging the thumb or when the container is focused. `false` = always visible. |
| `disabled` | — | boolean | `false` | No overflow → hidden / inert |

State (`hover`, `active`, `focused`) is **interaction-driven**, not authored — reflect via `CustomStateSet`:

| Hook | Selector | Purpose |
|------|----------|---------|
| Thumb part | `::part(thumb)` | Host app restyle of the thumb |
| Track part | `::part(track)` | Restyle / debug the rail |
| States | `:state(active)`, `:state(focused)` | Interaction state styling |
| CSS vars | `--ds-sb-thumb`, `--ds-sb-thumb-strong`, `--ds-sb-size`, `--ds-sb-radius` | Token plumbing |

**Events**: `scroll` (proxied), optional `dragstart` / `dragend`.

---

## Implementation

### Path A — Native scrollbar styling (preferred when grow-on-active isn't required)

Lowest cost, accessible by default; covers WebKit/Blink + Firefox. Cannot do the grow-on-active width change.

```css
:root{
  --ds-sb-thumb: var(--bg-quaternary, #d2d7e0);          /* Rest */
  --ds-sb-thumb-strong: var(--bg-quaternary-solid, #5f6c89); /* Hover/Active */
  --ds-sb-size: 6px;    /* regular thumb (rest); thin = 4px */
  --ds-sb-radius: var(--radius-pill, 9999px);
}
.scroll-area::-webkit-scrollbar{ width:var(--ds-sb-size); height:var(--ds-sb-size); }
.scroll-area::-webkit-scrollbar-track{ background:transparent; }
.scroll-area::-webkit-scrollbar-thumb{
  background:var(--ds-sb-thumb); border-radius:var(--ds-sb-radius);
  min-height:24px;                                  /* runtime floor; thumb hit area = its visible size */
}
.scroll-area::-webkit-scrollbar-thumb:hover,
.scroll-area::-webkit-scrollbar-thumb:active{ background:var(--ds-sb-thumb-strong); }
/* Firefox */
.scroll-area{ scrollbar-width:thin; scrollbar-color:var(--ds-sb-thumb) transparent; }
```

### Path B — Custom `<ds-scrollbar>` overlay (full fidelity)

Required for grow-on-active, auto-hide timing, and a consistent cross-browser look. Native scrollbar is hidden; the component renders track + thumb and syncs to scroll.

```js
// thumb length + position — recompute on scroll/resize/mutation
const ratio = host.clientHeight / host.scrollHeight;
const len   = Math.max(24, ratio * trackLength);        // Thumb-Min-Length clamp
const pos   = (host.scrollTop / host.scrollHeight) * trackLength;
thumb.style.blockSize = len + 'px';
thumb.style.transform = `translateY(${pos}px)`;

// auto-hide = cursor presence over the scroll host (not an idle timer)
let dragging = false;
const show = () => host.toggleAttribute('data-sb-visible', true);
const hide = () => { if (!dragging && !host.matches(':focus-within')) host.toggleAttribute('data-sb-visible', false); };
host.addEventListener('pointerenter', show);
host.addEventListener('pointerleave', hide);
thumb.addEventListener('pointerdown', () => { dragging = true; show(); });
addEventListener('pointerup',   () => { dragging = false; hide(); });   // keep visible through the whole drag
// touch: no hover — reveal on scroll, fade shortly after it stops
host.addEventListener('scroll', () => { show(); clearTimeout(host._t); host._t = setTimeout(hide, 800); }, { passive: true });
```

```css
[part=thumb]{
  background:var(--ds-sb-thumb); border-radius:var(--radius-pill, 9999px);
  inline-size:6px;                          /* regular rest; thin = 4px */
  transition:background 120ms ease, inline-size 120ms ease;
}
:host(:hover) [part=thumb]{ background:var(--ds-sb-thumb-strong); }
:host(:state(active)) [part=thumb]{ inline-size:8px; }   /* grow on drag; thin → 6px */
:host(:state(focused)) [part=thumb]{ outline:2px solid var(--border-accent,#006aff); outline-offset:2px; }

/* auto-hide: hidden by default, shown while the pointer is over the host */
[part=track]{ opacity:0; transition:opacity 200ms ease-in; }            /* fade out (leave) */
[data-sb-visible] [part=track]{ opacity:1; transition:opacity 80ms ease-out; }  /* fade in (enter) */
@media (prefers-reduced-motion: reduce){ [part=track]{ transition:none; } }
```

---

## Notes for Implementation

- **Overlay only** — track is transparent; never render a filled groove or arrow buttons.
- **Logical properties** — author one rule with `inline-size`/`block-size` and `translateX/Y` chosen by `orientation`; avoid duplicating CSS per axis.
- **Pill radius** — bind to `radius/radius-pill` (9999) so the thumb stays fully rounded at any thickness; do not hardcode a px radius.
- **No enlarged hit target** — by design, the thumb's interactive area equals its visible size (standard custom-scrollbar behavior); keyboard/wheel on the container is the accessible path.
- **Runtime length floor** — clamp thumb length to ~24px min in code so it never collapses (not a token).
- **Theme** — fills bind to `BG-Quaternary` / `BG-Quaternary-Solid` and the focus ring to `Border-Accent`, so dark/night/green themes resolve automatically.

---

## Open Questions for Design

1. **Hover vs Active color** — they currently share `BG-Quaternary-Solid`; Active is distinguished only by thickness. Should Active also darken to a distinct token?
2. ~~**Auto-hide timing**~~ — **Resolved (2026-06-23): auto-hide is cursor-presence driven** — show on pointer-enter over the scroll region, hide on pointer-leave (no idle timer). Stays visible while dragging the thumb or while the container is focused; on touch, reveal on scroll and fade when it stops. Fade in 80ms / out 200ms.
3. **Track click** — page-jump toward click, or jump-to-position? (Spec assumes page-jump.)

> **Resolved:** No enlarged hit target — custom overlay scrollbar, thumb hit area = visible size (matches mainstream web custom scrollbars). Radius = `radius/radius-pill`. Token layer reconciled to Figma (no scrollbar-specific dimension/color tokens; component binds to `BG-Quaternary*` + primitive sizes).

---

## Verification vs live Figma (2026-06-23)

Re-audited both component sets (`ds-scrollbar/vertical` `21449:586344`, `ds-scrollbar/horizontal` `21449:586382`) against this spec for the custom web-component build — **matches, with one correction**:

- ✅ **Axes & props**: `Size` (Thin/Regular) × `State` (Rest/Hover/Active) + `Focused` (boolean, default false). No Disabled variant.
- ✅ **Thumb thickness** (cross-axis): Thin **4 → 6** on Active; Regular **6 → 8** on Active. (Vertical = width, Horizontal = height; long axis 280 / thumb 112 are sample proportions only.)
- ✅ **Thumb fills**: Rest `Background/BG-Quaternary` #d2d7e0 → Hover **and** Active `Background/BG-Quaternary-Solid` #5f6c89 (Hover/Active share fill; Active differs by thickness). Thumb radius **9999** (pill). Track has no fill (transparent overlay).
- ✅ **Focus ring**: child of the thumb, **`strokeAlign: OUTSIDE`**, 2px `Border/Border-Accent` #006aff, hidden by default.
- 🛠 **Correction**: focus-ring corner radius is a **fixed 6 (Thin) / 9 (Regular)** rounded-rect — not "thumb radius + 2" as previously written. Anatomy row updated. (For pixel-faithful focus, draw the ring with an explicit `border-radius: 6px/9px` pseudo-element rather than relying on `outline`, which follows the thumb's pill shape.)

All tokens are theme variables — bind to the named token, never the Light hex.
