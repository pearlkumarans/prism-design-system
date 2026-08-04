# `<ds-scrollbar>`

Custom **overlay scrollbar** — wraps scrollable content, hides the native bar, and
overlays a synced pill thumb. Thumb-only (transparent track), theme-aware, with
cursor-presence auto-hide. Spec: `design-system/handoff/Scrollbar.md`
(Figma `ds-scrollbar/vertical` `21449:586344`, `ds-scrollbar/horizontal` `21449:586382`).

```html
<ds-scrollbar orientation="vertical" size="regular" style="height:240px">
  …long content…
</ds-scrollbar>
```

| Attribute | Values | Default |
|---|---|---|
| `orientation` | `vertical` \| `horizontal` | `vertical` |
| `size` | `thin` \| `regular` | `regular` |
| `autohide` | `"false"` to keep always visible | on (cursor-presence) |
| `disabled` | boolean — render no thumb | — |
| `rtl` | boolean — vertical bar moves to the left edge | — |

The host element owns the scroll viewport, so give it a bounded size
(`height` for vertical, `width` for horizontal). Content goes inside as children.

## Behaviour

- **Overlay, thumb-only** — the track is transparent; no arrows or groove.
- **Auto-hide = cursor presence** — the thumb is shown while the pointer is over
  the region and hidden on leave. It stays visible while **dragging** the thumb
  or while the region has **keyboard focus**; on **touch** it reveals on scroll
  and fades ~800ms after scrolling stops. `autohide="false"` = always visible.
- **States** — Rest `--ds-sb-thumb` (BG-Quaternary `#d2d7e0`); Hover **and** drag
  `--ds-sb-thumb-strong` (BG-Quaternary-Solid `#5f6c89`). Thumb **thickens** while
  dragging: Thin 4→6, Regular 6→8.
- **Thumb length** = `(viewport / content) × trackLength`, floored at **24px**;
  position maps 1:1 to scroll offset. Recomputed on scroll / resize / DOM mutation.
- **Focus ring** — 2px `--ds-sb-focus` (Border-Accent `#006aff`) on keyboard focus.
- **No overflow** → no thumb (and the viewport leaves the tab order).

## Styling hooks

| Hook | Purpose |
|---|---|
| `::part(viewport)` | the scroll container |
| `::part(thumb)` | the overlay thumb |
| `--ds-sb-thumb` / `--ds-sb-thumb-strong` | thumb fill (rest / strong) |
| `--ds-sb-focus` | focus-ring colour |
| `--ds-sb-radius` | thumb radius (pill `9999px`) |

## Accessibility

- The **viewport is focusable** (`tabindex=0`) only when there's overflow, so it's
  keyboard-scrollable (`↑↓←→`, `PageUp/Down`, `Home/End`); the thumb shows the focus
  ring. The scrollbar is a **supplemental** affordance — keyboard/wheel on the
  container is the accessible path, so the thin thumb hit area is intentional.
- The thumb is decorative (`aria-hidden`). Provide an `aria-label` on the host if the
  region needs a name.
