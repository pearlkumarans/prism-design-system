# Handoff Spec: Tooltip

**Figma:** [UEMS — Design System 3.0 · node `18063:833552`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18063-833552) · Component set, **54 variants**

**Related:** Theme tokens → `uems-theme-tokens.md` · Typography → `typography-tokens.md`

---

## Overview

A non-interactive informational popover shown on hover/focus, with an optional leading icon and a directional arrow in nine placements. Three themes (dark default, light, red/error) and full RTL. Content-only: anything interactive belongs in a Popover, not here.

## Variants

| Axis | Values | Count |
|---|---|---:|
| `Position` | right (default), left, up center, up left, up right, down center, down left, down right, without arrow | 9 |
| `Theme` | dark (default), light, red | 3 |
| `RTL` | false (default), true | 2 |

**Total:** 9 × 3 × 2 = **54 variants**

### Component properties

| Property | Type | Default |
|---|---|---|
| `Show Icon` | Boolean | ON |
| `Icon` | Instance swap | info-circle |
| `Tooltip Label` | Text | "This is a helpful tooltip…" |
| `Tooltip Label RTL` | Text | Arabic string (independent of LTR) |

## Layout

```
┌────────────────────────────────────┐
│ (i)  Tooltip text wraps inside     │  body hugs; text caps at 240px → wraps
│      the text's 240px cap…         │  padding 8px vert / 12px horiz, gap 4
└──────────────┬─────────────────────┘  arrow: 12×6 (top/bottom) · 6×12 (sides)
```

| Element | Spec |
|---|---|
| Body | **HUG width** (`min-width 72px`, no max on the body itself); height hugs; radius 6 (`--uems-radius-default`); no border. The width cap lives on the **text node** (`max-width: 240px`) — so body max = 24 padding + 20 icon + 4 gap + 240 text = **288px when the icon is shown, 264px when `Show Icon=OFF`**. Build the cap on the text, not the body |
| Shadow | dark/red: none · **light: `0 2px 8px rgba(13,17,29,.12)`** (component-level effect style `Shadow-Medium`) |
| Padding | 8px vertical / 12px horizontal |
| Icon | 20×20, leading, gap 4 to text |
| Text | **13/20 `Text/Special-Sizes/small-13/Regular`** (`--uems-font-size-13` / `--uems-line-height-13`), wraps |
| Arrow | 12×6 triangle on top/bottom edges, 6×12 on left/right; 6px protrusion; fill = body background. Corner positions (`up/down left/right`) inset the triangle **12px from the body corner** (drawn via a 24×6 positioning wrapper — not a larger arrow) |

> Verified arithmetically across the set (declared = effective everywhere).

### Arrow placement (verified per position)

| Position | Arrow edge | Alignment |
|---|---|---|
| `right` | right edge | vertical center |
| `left` | left edge | vertical center |
| `up center` | top edge | horizontal center |
| `up left` | top edge (fixed in Figma 2026-06-12, flag 1) | triangle inset 12px from left corner |
| `up right` | top edge | triangle inset 12px from right corner |
| `down center` | bottom edge | horizontal center |
| `down left` | bottom edge | triangle inset 12px from left corner |
| `down right` | bottom edge | triangle inset 12px from right corner |
| `without arrow` | none | — |

Position names describe the arrow's edge + alignment (the tooltip renders on the opposite side of the trigger: an `up *` tooltip sits **below** the trigger pointing up at it).

## Design Tokens Used

Hex comments = Light theme mode. Arrow always matches the body fill. One exact signature per theme across all 18 variants each — zero drift in colors.

| Theme | Body bg | Text | Icon | Border / Shadow |
|---|---|---|---|---|
| **dark** | `--uems-bg-secondary-solid` /* #313746 */ | `--uems-text-white` | `--uems-icon-white` | none / none |
| **light** | `--uems-bg-base-white` /* #FFFFFF */ | `--uems-text-primary` | `--uems-icon-black` | none / **`0 2px 8px rgba(13,17,29,.12)`** |
| **red** | `--uems-bg-error-primary` /* #FDEBEB */ | `--uems-text-error` /* #C1181B */ | `--uems-icon-error` | none / none |

> **Shadow color is navy, not pure black.** The Figma `Shadow-Medium` effect is `DROP_SHADOW color #0D111D @ 12% alpha, offset (0,2), radius 8` → `rgba(13, 17, 29, 0.12)`. Use the navy value for exactness (an earlier revision of this spec said `rgba(0,0,0,.12)`).

## RTL

`RTL=true`: Arabic content (`Tooltip Label RTL`), text right-aligned, icon moves to the reading-direction lead (visually right). In code: `dir="rtl"` on the tooltip flips the flex row and text alignment automatically — one markup, no mirrored CSS.

**Arrow behavior in RTL — fully directional (normalized in Figma 2026-06-12, verified on all 27 RTL variants):**
- `left` / `right` positions flip: in RTL, `right` renders its arrow on the **left** edge and `left` on the **right** edge.
- `up left/right` and `down left/right` corners flip their inset: `up left` insets 12px from the **right** corner in RTL (from the left in LTR), `up right` from the left, etc.

Every directional position mirrors consistently — so in code, just use logical properties and let `dir="rtl"` do the work: `inset-inline-start: 12px` for corner insets, logical placements (`inline-start`/`inline-end`) for the side arrows. No `[dir]`-specific overrides needed.

## Developer Handoff

### Suggested API

```
<uems-tooltip
  content="..."                          (required — plain text)
  position="top | bottom | left | right | top-start | top-end | bottom-start | bottom-end"  (default: top)
  theme="dark | light | red"             (default: dark)
  icon / no-icon                         (default: icon shown, swappable)
  arrow                                  (default: true; false = "without arrow")
  for="<trigger-id>" or wraps trigger slot
></uems-tooltip>
```

### HTML structure

```html
<button aria-describedby="tip-1">…trigger…</button>

<div id="tip-1" role="tooltip" class="tooltip tooltip--dark tooltip--top" aria-hidden="true">
  <svg class="tooltip__icon" aria-hidden="true"><!-- info-circle --></svg>
  <span class="tooltip__text">This is a helpful tooltip that provides additional context.</span>
  <span class="tooltip__arrow" aria-hidden="true"></span>
</div>
```

### CSS

```css
.tooltip {
  position: absolute; z-index: 1000;
  display: flex; gap: var(--uems-spacing-4); align-items: flex-start;
  width: max-content; min-width: 72px; box-sizing: border-box;  /* body hugs; no max on the body */
  padding: var(--uems-spacing-8) var(--uems-spacing-12);
  border-radius: var(--uems-radius-default, 6px);
  background: var(--tip-bg); color: var(--tip-text);
  font-size: var(--uems-font-size-13);          /* 13px */
  line-height: var(--uems-line-height-13);       /* 20px */
  pointer-events: none; opacity: 0; transition: opacity 150ms ease;
}
.tooltip.is-visible { opacity: 1; pointer-events: auto; } /* hoverable per WCAG 1.4.13 */
.tooltip__icon { width: 20px; height: 20px; flex: none; color: var(--tip-icon); }
.tooltip__text { max-width: min(240px, calc(100vw - 32px)); }  /* the real cap — body derives from this (288 w/ icon, 264 w/o); clamps on small viewports */

/* themes */
.tooltip--dark  { --tip-bg: var(--uems-bg-secondary-solid); --tip-text: var(--uems-text-white);   --tip-icon: var(--uems-icon-white); }
.tooltip--light { --tip-bg: var(--uems-bg-base-white);      --tip-text: var(--uems-text-primary); --tip-icon: var(--uems-icon-black);
                  box-shadow: 0 2px 8px rgba(13, 17, 29, .12); }
.tooltip--red   { --tip-bg: var(--uems-bg-error-primary);   --tip-text: var(--uems-text-error);   --tip-icon: var(--uems-icon-error); }

/* arrow — 12×6 triangle, fill = body bg */
.tooltip__arrow { position: absolute; width: 12px; height: 6px; background: var(--tip-bg);
  clip-path: polygon(50% 100%, 0 0, 100% 0); }
.tooltip--top    .tooltip__arrow { top: 100%; left: 50%; translate: -50% 0; }
.tooltip--bottom .tooltip__arrow { bottom: 100%; left: 50%; translate: -50% 0; rotate: 180deg; }
.tooltip--top-start  .tooltip__arrow { top: 100%; inset-inline-start: 12px; translate: none; }   /* logical inset — mirrors in RTL */
.tooltip--top-end    .tooltip__arrow { top: 100%; inset-inline-end: 12px; translate: none; }
/* …bottom-start/bottom-end mirror; left/right use a 6×12 arrow rotated ±90° at vertical center */
```

> Naming translation: Figma's `up *` = arrow on top = tooltip **below** trigger = `bottom*` in Floating-UI terms; this spec's API uses trigger-relative names (`top` = tooltip above trigger = Figma `down center`). The table above is the unambiguous reference.

### Positioning

Use Floating UI (or equivalent) with `offset(6 + 4)` (arrow + gap), `flip()`, and `shift()` — the nine static variants are anchoring presets, not a constraint against auto-flipping at viewport edges. `without arrow` = `arrow: false` for constrained/clipped contexts.

## States and Interactions

| Trigger event | Behavior |
|---|---|
| Hover in | Show after ~200ms delay |
| Hover out | Hide after ~150ms delay (tooltip itself hoverable in between) |
| Focus (`:focus-visible`) | Show immediately |
| Blur | Hide |
| `Escape` | Hide immediately, focus stays on trigger |
| Trigger disappears/scrolls away | Hide |

No hover/active/disabled states on the tooltip itself — it's a single-state surface.

## Responsive Behavior

Figma defines the tooltip at **one fixed size** (no size/breakpoint axis) — so "responsive" here means *adapt gracefully*, not *change by breakpoint*.

| Constraint | Behavior |
|---|---|
| Default | Body hugs content; text caps at 240px (→ body ≤288 with icon, ≤264 without); height grows as text wraps |
| Short content | Body shrinks to fit, down to a 72px min-width floor |
| **Small viewports** | Clamp the 240px text cap: `max-width: min(240px, calc(100vw - 32px))` on `.tooltip__text` so the tooltip never overflows on phones |
| **Viewport edges / scroll** | Floating UI `flip()` + `shift({padding: 8})` + `size()` so the tooltip repositions and, if still clipped, caps to available space; the arrow tracks via `arrow()` |
| **Text zoom / rem** | Type tokens resolve to **px** (`--uems-font-size-13` = 13px), so the tooltip does **not** grow with the browser font-size setting. For WCAG 1.4.4 (200% resize), override `.tooltip__text` in `rem` or publish rem type tokens |
| Touch devices | Tooltips don't fire on tap — pair critical content with visible text or a long-press/tap-to-toggle popover fallback |

## Edge Cases

- **No icon** — `Show Icon=OFF`: text starts at the 12px padding edge
- **Very long content** — wraps freely; cap at ~4 lines and move longer content to a Popover
- **Icon swap** — any 20×20 stroke icon; color follows the theme's icon token
- **`without arrow`** — body only; consumer owns the visual anchoring

## Animation / Motion

Not specified in Figma — suggested: fade in 150ms ease-out (after the show delay), fade out 100ms ease-in. `prefers-reduced-motion`: instant. Never slide/scale — tooltips should appear anchored, not arrive.

## Accessibility

| Concern | Guidance |
|---|---|
| Role | `role="tooltip"`; trigger gets `aria-describedby` pointing at it |
| Hidden state | `aria-hidden` toggles with visibility; content stays in the DOM for the describedby link |
| Keyboard | Must show on `:focus-visible`, not hover only; `Escape` dismisses (WCAG 1.4.13) |
| Hover persistence | The tooltip itself must be hoverable — don't hide while the pointer moves onto it (WCAG 1.4.13) |
| Icon | `aria-hidden="true"` — decorative |
| No interactive content | Links/buttons inside mean it's a Popover, not a tooltip |
| Contrast | dark: white on #313746 ≈ 10:1 ✓ · red: #C1181B on #FDEBEB ≈ 5.6:1 ✓ · light: #15181E on white ✓ (white surface relies on its drop shadow for separation) |

## Verification

All **54 variants** were programmatically scanned: theme tokens (bg/text/icon/arrow fill — one signature per theme, zero color drift), body geometry validated arithmetically (text cap 240 → body ≤288, padding 8/12, gap 4, radius 6), typography on every variant (13/20 `small-13/Regular`), arrow geometry via absolute bounds + rotation per position, and RTL mirroring (right-aligned Arabic, icon trailing in DOM = leading in reading direction) on all 27 RTL variants.

Re-verified against live Figma 2026-06-13: side arrow `6×12`, corner arrow drawn via a `24×6` wrapper with a `12×6` triangle (confirmed on `up left` — now on the top edge, flag 1 fix holds), padding `12/8`, radius `radius-6`, gap `4`, text node `max-width 240`, all three theme token signatures, and the `Shadow-Medium` color `#0D111D @ 12%`.

## Flags for design — all settled 2026-06-12/13

1. ~~**`up left` arrow on the wrong edge (6 variants)**~~ — **Fixed in Figma:** rebuilt from `up right`, top edge, triangle inset 12px from the left corner. Verified.
2. ~~**Arrow size inconsistency**~~ — **Not a defect:** the "24×6 arrows" are positioning wrappers; the actual triangle is 12×6 everywhere, inset 12px from the corner on `up/down left/right`.
3. ~~**Light theme missing shadow**~~ — **Withdrawn:** the shadow exists as a component-level effect style (`Shadow-Medium` = `#0D111D @ 12%`, 0 2 8). Spec and CSS carry it now — as navy, not pure black.
4. **Component description partially stale** — the Figma description was updated with width/padding/arrow semantics, **but its typography line still reads "text 14/20 Regular"**. The actual bound type style is `small-13/Regular` = **13/20**. Trust the spec body (13/20); the description's 14/20 is wrong.
5. **Old skill file [`Components/tooltip.md`](../Components/tooltip.md)** — left as-is per design's decision. Treat THIS handoff as authoritative; the old file documents an earlier revision (240px body, 12px text, different tokens).
6. ~~**One variant had radius 4 instead of 6**~~ — **Fixed in Figma:** all 54 now verify at radius 6.
7. ~~**RTL arrow treatment inconsistent**~~ — **Fixed in Figma:** the four corner positions now mirror their inset in RTL across all 3 themes. The whole set is fully directional in RTL; the spec uses logical properties accordingly.

## Implementation deviations (ds-tooltip, this codebase)

The visual/token spec is implemented exactly; only the attribute surface and a few mechanics differ:

- **Wrapper element, not `for=`/`content=`.** `<ds-tooltip text="…" position="up-center" theme="dark"><button>…</button></ds-tooltip>` — the tooltip wraps its trigger and wires `aria-describedby` to the first child automatically.
- **Attributes:** `text`, `position`, `theme`, `show-icon` (default on; `show-icon="false"` hides), `icon` (default `info-circle`), `rtl`.
- **Position values are hyphenated, Figma-relative:** `up-center | up-left | up-right | down-center | down-left | down-right | left | right | without-arrow` (default `up-center`). These match the Figma variant names directly rather than the trigger-relative `top/bottom` API names.
- **Arrow drawn with the CSS border-triangle trick** (`border: 6px solid transparent` → 12×6 / 6×12), not `clip-path`; corner insets and side arrows use **logical properties** (`inset-inline-start/end`, `border-inline-*`) so RTL mirrors with `dir="rtl"`.
- **Light shadow is a real `box-shadow`** (`0 2px 8px rgba(13,17,29,.12)`), and the **icon color binds per theme** (`--_tt-icon` → icon-white/black/error) so the light theme's icon is pure black while its text is text-primary, exactly per the token table.
- **Static-position presets** (no Floating UI dependency): the nine positions anchor against the host; `flip()`/`shift()`/`size()` viewport-edge handling is not wired — acceptable for in-flow docs usage, revisit if tooltips clip near viewport edges.

---

*Generated from UEMS Design System 3.0 · Figma node `18063:833552` · re-verified 2026-06-13 · all 54 variants (tokens, geometry, arrows via absolute bounds, RTL).*
