# Overlay

A scrim/backdrop placed behind modals, dialogs, drawers, and popovers to obscure background content and trap focus. Always rendered as a full-viewport fixed layer (`position: fixed; inset: 0`).

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18413-617583) · Node `18413:617583`

---

## Variants

The component set contains **5 variants** on a single axis:

| Axis | Values | Count |
|------|--------|------:|
| `Type` | `Dim` (default), `Light`, `Transparent`, `Blur`, `Dim Blur` | 5 |

**Total:** **5 variants**

---

## Types

| Type | Visual | Purpose |
|------|--------|---------|
| `Dim` | Dark scrim — `BG-Overlay` at 70% opacity | Default modal/dialog/drawer scrim |
| `Light` | Mid-tone slate scrim — `BG-Quaternary-Solid` at 70% opacity | Scrim for dark-themed surfaces where a dark scrim loses contrast |
| `Transparent` | Fully invisible (layer opacity 0) | Click-trap behind popovers, menus, and non-modal overlays — captures outside clicks without dimming content |
| `Blur` | `#5F6C89` at 70% fill alpha + `backdrop blur 8px` | Premium/iOS-style frosted modal backdrop |
| `Dim Blur` | `#15181E` at 70% fill alpha + `backdrop blur 8px` | Dark frosted backdrop — strongest background suppression |

---

## Anatomy

```
┌────────────────────────────────────────────┐
│ Overlay (single layer, no children)        │ ← fills the viewport
│                                            │   position: fixed; inset: 0
│            sits behind the modal /         │   z-index below the dialog,
│            drawer / popover surface        │   above all page content
│                                            │
└────────────────────────────────────────────┘
```

The overlay is a single rectangle with no child elements. In Figma each variant is drawn at 1440×900; in code it must always stretch to the full viewport.

---

## Design Tokens

| Type | Element | Token | Resolves (Light theme) | Layer opacity | Backdrop blur |
|------|---------|-------|------------------------|---------------|---------------|
| `Dim` | Fill | `Background/BG-Overlay` | `#0A0B0F` | 70% | — |
| `Light` | Fill | `Background/BG-Quaternary-Solid` | `#5F6C89` | 70% | — |
| `Transparent` | Fill | `Background/BG-Base` | `#0A0B0F` at 0% layer opacity | 0% | — |
| `Blur` | Fill | — (hardcoded) | `#5F6C89` at 70% fill alpha | 100% | `8px` |
| `Dim Blur` | Fill | — (hardcoded) | `#15181E` at 70% fill alpha | 100% | `8px` |

The `Dim`, `Light`, and `Transparent` fills are bound to the **UEMS Theme Tokens** collection and resolve per theme mode — use the CSS custom property, not the raw hex, so the scrim adapts with the active theme. The two blur variants use fixed (theme-independent) fills:

| Token | Light | Dark | Night | Green light | Green dark |
|-------|-------|------|-------|-------------|------------|
| `Background/BG-Overlay` | `#0A0B0F` | `#15181E` | `#313746` | `#0A0B0F` | `#15181E` |
| `Background/BG-Quaternary-Solid` | `#5F6C89` | `#55607A` | `#4A546B` | `#5F6C89` | `#55607A` |

---

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Type` | Variant | `Dim` | Selects the scrim treatment: `Dim`, `Light`, `Transparent`, `Blur`, `Dim Blur` |

No boolean, text, or instance-swap properties — the overlay carries no content.

---

## Developer Handoff

### HTML structure

```html
<!-- Rendered as a sibling immediately before the surface it backs -->
<div class="overlay overlay--dim" aria-hidden="true"></div>

<div role="dialog" aria-modal="true" class="modal">
  <!-- modal content -->
</div>
```

### CSS

```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay, 1000); /* below the dialog surface, above page content */
}

/* Dim (default) — token: Background/BG-Overlay */
.overlay--dim {
  background: var(--bg-overlay, #0A0B0F);
  opacity: 0.7;
}

/* Light — token: Background/BG-Quaternary-Solid */
.overlay--light {
  background: var(--bg-quaternary-solid, #5F6C89);
  opacity: 0.7;
}

/* Transparent — invisible click-trap */
.overlay--transparent {
  background: transparent;
}

/* Blur — frosted light scrim (fixed fill, not theme-bound) */
.overlay--blur {
  background: rgba(95, 108, 137, 0.7); /* #5F6C89 @ 70% */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Dim Blur — frosted dark scrim (fixed fill, not theme-bound) */
.overlay--dim-blur {
  background: rgba(21, 24, 30, 0.7); /* #15181E @ 70% */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

> For `Blur` / `Dim Blur`, apply the 70% alpha on the **background color** (rgba), not on `opacity` — element-level opacity would also fade the `backdrop-filter` effect. Provide a non-blurred fallback (`@supports not (backdrop-filter: blur(8px))` → use the equivalent `Dim`/`Light` style).

### Behaviour

| Interaction | Expected handling |
|-------------|-------------------|
| Click/tap on overlay | Dismiss the overlaid surface (modal, drawer, popover) — unless the dialog is blocking/required |
| `Escape` | Dismiss the overlaid surface (handled by the surface, not the overlay) |
| Scroll | Lock body scroll while the overlay is visible (`overflow: hidden` on `<body>` or scroll-lock utility) |
| Focus | The overlay itself is never focusable; focus is trapped inside the overlaid surface |
| Stacking | One overlay per layered surface; nested surfaces (modal → popover) each manage their own overlay/z-index |

---

## Usage Guidelines

### Choosing a type

| Scenario | Type |
|----------|------|
| Standard modal, dialog, or drawer | `Dim` |
| Dark-themed surface where a dark scrim has insufficient contrast | `Light` |
| Popover, dropdown menu, or non-modal layer that needs outside-click dismissal without dimming | `Transparent` |
| Elevated/premium modal experience with frosted background | `Blur` |
| Frosted background with maximum content suppression | `Dim Blur` |

Always use the theme tokens (`--bg-overlay`, `--bg-quaternary-solid`) rather than raw hex — the scrim must adapt across Dark/Night/Green theme modes. Render exactly one overlay per modal layer; stacked dim overlays compound opacity and over-darken the page.

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| **Semantics** | The overlay is decorative: `aria-hidden="true"`, no role, not focusable |
| **Modality** | Pair with `aria-modal="true"` on the dialog and inert/`aria-hidden` background content |
| **Focus trap** | Focus must remain within the overlaid surface while the overlay is visible |
| **Dismissal** | Overlay click dismissal must have keyboard parity (`Escape`) |
| **Reduced transparency/motion** | Honour `prefers-reduced-transparency` by swapping `Blur`/`Dim Blur` to the solid `Dim` style |
| **Contrast** | The scrim must not be relied on for text contrast — content on top of the overlay belongs to the dialog surface, not the overlay |

---

*Generated from UEMS Design System 3.0 · Figma node `18413:617583`*
