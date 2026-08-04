# Handoff Spec: List

**Figma:** [UEMS — Design System 3.0 · node `18416:860839`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18416-860839) · Component set, **42 variants**, built from `_List Item` (`18416:860495`, **126 variants**)

**Related:** Theme tokens → `uems-theme-tokens.md` · Typography → `typography-tokens.md`

---

## Overview

A styled list block — the design-system equivalent of `<ul>`/`<ol>` with seven marker styles, three sizes, three nesting levels, and full RTL mirroring. Purely presentational: no states, no interaction. The per-item component (`_List Item`) carries the entire visual spec.

## Variants

### List (assembly) — 42 variants

| Axis | Values | Count |
|---|---|---:|
| `Order` | Unordered (default), Ordered | 2 |
| `Style` | Unordered → Disc (default), Circle, Square, Custom Icon · Ordered → Number, Letter, Custom Number | 4 + 3 |
| `Size` | Small (default), Medium, Large | 3 |
| `RTL` | False (default), True | 2 |

(4 + 3) × 3 × 2 = **42** — Style values are partitioned by Order.

### Component properties

| Property | Type | Default |
|---|---|---|
| `Show item 1–5` | Boolean | ON |
| `Show item 6–10` | Boolean | OFF |

The 10 slots toggle via `Show item N`; visible defaults demonstrate nesting levels 1, 1, 2, 3, 1. Each `_List Item` instance can be re-leveled via its own `Level` (1–3).

## Layout

```
•   List item text          ← row: marker + text, gap 8 (S/M) / 12 (L)
•   List item text          ← container: vertical, gap 8 (all sizes), items FILL width
    •   List item text      ← Level 2: indent +24
        •   List item text  ← Level 3: indent +48
```

| | Small | Medium | Large |
|---|---|---|---|
| Text | 12/16 `Text/small/Regular` | 14/20 `Text/Default/Regular` | 16/24 `Text/large/Regular` |
| Marker → text gap | 8px | 8px | **12px** |
| Row gap (container) | 8px | 8px | 8px |
| Shape markers (Disc/Circle/Square) | 4×4 | 6×6 | 8×8 |
| Custom Icon (arrow-narrow-right) | 8px | 12px | 16px |
| Custom Number badge | 16×16, text 10/14 Medium | 20×20, text 12/16 Medium | 24×24, text 14/20 Medium |
| Indent per level | +24px | +24px | +24px |

Markers center-align to the first text line (badge height = line-height, so Custom Number rows align naturally).

## Design Tokens Used

Hex comments = Light theme. Identical for every Size and Level.

| Style | Marker | Token(s) |
|---|---|---|
| All styles | Item text | `--uems-text-primary` /* #15181E */ |
| `Disc` | Filled circle | `--uems-bg-quaternary-solid` /* #5F6C89 */ |
| `Square` | Filled square (no radius) | `--uems-bg-quaternary-solid` |
| `Circle` | Outlined circle | stroke `--uems-icon-tertiary` /* #55607A */ — Small: 1px **center-aligned** on the 4px shape (≈5px outer Ø); Medium/Large: 1.5px inside (flag 2, intentional) |
| `Custom Icon` | arrow-narrow-right | stroke `--uems-icon-tertiary` |
| `Number` | "1." text, same size/lh as item text | `--uems-text-quaternary` /* #55607A */ |
| `Letter` | "a." text, same size/lh as item text | `--uems-text-quaternary` |
| `Custom Number` | Pill badge (radius `--uems-radius-pill`) | bg `--uems-bg-secondary` /* #F0F2F5 */, text `--uems-text-quaternary`, weight 500 |

## Developer Handoff (ds-list — this codebase)

```html
<ds-list style-variant="disc|circle|square|icon|number|letter|badge" size="small|medium|large" rtl>
  <ds-list-item>List item text</ds-list-item>
  <ds-list-item level="2">Nested item</ds-list-item>          <!-- level 1–3, +24px each -->
  <ds-list-item icon="arrow-narrow-right">Icon item</ds-list-item>  <!-- style-variant=icon -->
</ds-list>
```

- `disc/circle/square/icon` → `<ul>`; `number/letter/badge` → `<ol>` (auto, by style).
- **Legacy `ordered`** boolean still works (→ `number`). `items` array property also supported:
  `list.items = ['a', {text:'b', level:2}, {text:'c', icon:'check'}]`.
- Nesting may also use the `level` prop (flat-markup fallback). Counters increment across visible items; real nested `<ol>` markup would restart per level.

### CSS (token names as they exist in this codebase)

```css
.ds-list__inner { list-style:none; margin:0; padding:0; display:flex; flex-direction:column;
  gap: var(--uems-spacing-8); }
.ds-list { color: var(--uems-text-primary); font-family: var(--font-family-sans); }
.ds-list__item { display:flex; align-items:flex-start; gap: var(--_li-gap); min-width:0; }

/* sizes — NOTE: this codebase has no --uems-line-height-12/14/16, so line-heights
   are literal 16/20/24px; weight token is --font-weight-medium (no uems- prefix). */
.ds-list--small  { font-size: var(--uems-font-size-12); line-height:16px; --_li-marker:4px; --_li-icon:8px;  --_li-badge:16px; --_li-gap:var(--uems-spacing-8); }
.ds-list--medium { font-size: var(--uems-font-size-14); line-height:20px; --_li-marker:6px; --_li-icon:12px; --_li-badge:20px; --_li-gap:var(--uems-spacing-8); }
.ds-list--large  { font-size: var(--uems-font-size-16); line-height:24px; --_li-marker:8px; --_li-icon:16px; --_li-badge:24px; --_li-gap:var(--uems-spacing-12); }

.ds-list__item[data-level="2"] { padding-inline-start: var(--uems-spacing-24); }
.ds-list__item[data-level="3"] { padding-inline-start: var(--uems-spacing-48); }

/* marker centered to first line */
.ds-list--disc .ds-list__item::before,
.ds-list--square .ds-list__item::before,
.ds-list--circle .ds-list__item::before {
  content:""; flex:none; width:var(--_li-marker); height:var(--_li-marker);
  margin-top: calc((1lh - var(--_li-marker)) / 2); }
.ds-list--disc   .ds-list__item::before { background:var(--uems-bg-quaternary-solid); border-radius:50%; }
.ds-list--square .ds-list__item::before { background:var(--uems-bg-quaternary-solid); }
.ds-list--circle .ds-list__item::before { border:1.5px solid var(--uems-icon-tertiary); border-radius:50%; box-sizing:border-box; }
.ds-list--small.ds-list--circle .ds-list__item::before { width:5px; height:5px; border-width:1px; }
```

## States and Interactions

None — the list is static content. If items become interactive (links, checkboxes), compose with the Link / Checkbox components.

## Responsive Behavior

| Constraint | Behavior |
|---|---|
| Any width | Items FILL the container (360px in Figma is a reference); text wraps under itself, marker stays at line 1 |
| Deep nesting | Figma draws levels 1–3 (+24px each); code may allow deeper at the same step |

## Edge Cases

- **Wrapping text** — multi-line items hang naturally (marker centered to the first line via `1lh` calc); no special handling.
- **Level jumps** (1 → 3) — render the requested indent; don't normalize.
- **Custom icon per item** — `style-variant=icon` allows a per-item `icon` override.
- **Counter > 99 (badge)** — badge uses `min-width` (not fixed width) so 3-digit counters grow horizontally.
- **RTL** — free: `dir="rtl"` + logical `padding-inline-start` indents + flex row reproduce the mirror (marker trails, text right-aligned).

## Accessibility

| Concern | Guidance |
|---|---|
| Semantics | Real `<ul>`/`<ol>` + `<li>` — never divs |
| Markers | Drawn via CSS `::before` / `aria-hidden` SVG, not read as content |
| Nesting | Prefer real nested lists over the `level` prop where hierarchy must be announced |
| Ordered semantics | `number/letter/badge` must be `<ol>` (order has meaning) |
| Contrast | Item text #15181E on white passes AAA; markers decorative; #5F6C89 ≥ 3:1 anyway |

## Verification

All 42 List + 126 `_List Item` variants programmatically scanned: marker geometry/fills/strokes per Style × Size × Level, text tokens per size, marker→text + row gaps, per-level indents (0/24/48 uniform), badge radii/colors, icon instances, slot visibility. One signature per Style × Size, identical across levels — zero drift. RTL axis verified (marker trailing, right-aligned Arabic, `padding-right` indents). Re-verified against live Figma 2026-06-13 (Large Disc gap 12 + 8×8 bullet; Small Custom Number 16×16 badge, text 10/14 Medium #55607A, bg #F0F2F5).

## Flags for design — settled 2026-06-12

1. ~~Set description stale / props missing~~ — Fixed: ten `Show item N` booleans exist (1–5 ON, 6–10 OFF), wired across all 21 variants.
2. ~~Circle stroke weight steps oddly~~ — **Confirmed intentional** (Figma description itself states it): 1px center-aligned at Small (≈5px outer Ø), 1.5px inside at Medium/Large.
3. ~~No RTL axis~~ — Fixed: RTL axis added to both sets (mirrored, right-aligned Arabic, `padding-right` indents).

## Implementation deviations (ds-list, this codebase)

- **Style attribute is `style-variant`** (or `list-style`), not `style` — `style` is a reserved global HTML attribute. Values: `disc|circle|square|icon|number|letter|badge`. Legacy `ordered` boolean → `number`.
- **Line-heights are literal** 16/20/24px (this codebase only defines `--uems-line-height-13`, not 12/14/16); badge weight uses `--font-weight-medium` (no `uems-` prefix); font family `--font-family-sans`.
- **Custom Icon uses `ds-icon`** (`size="100%"` inside a sized wrapper); color binds via the wrapper's `--uems-icon-tertiary`.
- **Badge uses `min-width`** (not fixed width) so >99 counters grow.

---

*Generated from UEMS Design System 3.0 · Figma nodes `18416:860839` + `18416:860495` · re-verified 2026-06-13 · 42 + 126 variants.*
