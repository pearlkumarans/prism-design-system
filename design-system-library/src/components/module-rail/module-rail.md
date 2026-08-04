# ds-module-rail

Vertical **product / module rail** for LEFT-navigation layouts. When a product
switches from top-tab navigation to left navigation, the top module tabs relocate
into this rail on the start edge (icon + label per module). Pairs with
`<ds-header-nav center="search">`, which swaps the header tab band for a centred
search field.

One component captures every state:

| State | Behaviour |
|-------|-----------|
| Default | Icon + 2-line label, stacked, transparent surface (blends into the body canvas). |
| `icons-only` | Narrow rail (48px), labels hidden. **Hovering the rail smoothly expands a menu overlay** that reveals every module's icon + text label. The overlay shares the rail's icon column, row rhythm and canvas background (`--uems-background`) and anchors to the rail's top edge, so it reads as the rail expanding in place — no jerk, and the brand above the rail stays visible. Runs top-edge → bottom-edge; extra items scroll inside. |
| Active | The icon sits in a **solid accent chip** (theme-aware: blue / green) with a white glyph; label turns accent. |
| Overflow | Items that don't fit fold into a bottom **"more" (3-dot)** button → flyout listing the hidden modules. The button always keeps ≥80px clear space below it. |
| RTL | Mirrors automatically from an ancestor `[dir="rtl"]` (or the `rtl` attribute) — rail moves to the right, hover menu / flyout flip. |

## Usage

```html
<ds-module-rail id="rail"></ds-module-rail>
```

```js
const rail = document.getElementById('rail');
rail.items = [
  { id: 'home', label: 'Home',       icon: 'home',   active: true },
  { id: 'inv',  label: 'Inventory',  icon: 'layers' },
  { id: 'reports', label: 'Reports', icon: 'bar-vertical-chart' },
];
rail.addEventListener('ds-module-rail-select', (e) => {
  // e.detail = { id, item }  → drive the page's L1/L2 navigation
  loadModule(e.detail.id);
});
```

## API

### Properties
- **`items`** — `Array<{ id, label, icon, active? }>`. `icon` is a sprite name (e.g. `home`, `shield`). The active item gets the solid chip.

### Attributes
- **`icons-only`** — narrow rail, labels hidden; hovering expands a label menu overlay (no per-icon tooltip in this mode).
- **`rtl`** — force RTL (also auto-detected from an ancestor `[dir="rtl"]`).
- **`more-label`** — accessible label for the overflow button (default `More` / `المزيد`).

### Methods
- **`setActive(id)`** — set the active module without firing the select event (use for programmatic navigation / deep links).

### Events
- **`ds-module-rail-select`** — `detail: { id, item }`. Fires on item or flyout click; the rail updates its own active state first.

## Notes
- Light-DOM; styles in `module-rail.css` (auto-injected). The rail is **transparent** by design so it blends into the page canvas — place it at body level, outside any rounded content frame.
- Overflow is recomputed on resize via a `ResizeObserver`, so the "more" button appears/disappears as the viewport height changes.
- The active chip uses `--uems-bg-button-primary`, so it tracks the active product theme (blue, green, …).
- **Hover-expand menu** (`icons-only`): portaled to `document.body`, so it never shifts layout or gets clipped by an `overflow:hidden` ancestor. It matches the rail's icon size, `var(--spacing-4)` row gap and `--uems-background` surface, opens on the rail's own y-axis (never nudges up over the brand), fills from the rail's top edge to its bottom edge, and animates `width` + `opacity` (respecting `prefers-reduced-motion`). The checkbox/keyboard path is unaffected — clicking a row fires the same `ds-module-rail-select` event.
