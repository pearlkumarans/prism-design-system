# Handoff Spec: Breadcrumb

**Figma:** [UEMS — Design System 3.0 · node `16018:37918`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=16018-37918) · Component set, **12 variants**, built from `_Breadcrumb Item` (`17960:740160`, **32 variants**)

**Related:** Theme tokens — [`uems-theme-tokens.md`](../uems-theme-tokens.md) · Typography — [`typography-tokens.md`](../typography-tokens.md) · Suggested overflow menu — Dropdown Menu

---

## Overview

A navigation trail showing the user's location in the hierarchy. Every crumb except the last is a link; the last is the current page (plain text, medium weight). Middle items collapse into a `…` overflow trigger when the trail is long. Two sizes (Small/Medium), full RTL support with mirrored order and separators.

## Variants

### Breadcrumb (assembly) — 12 variants

| Axis | Values | Count |
|---|---|---:|
| `Count` | 2 (default), 3, 4, 5 | 4 |
| `Overflow` | False (default), True — only drawn for Count 4–5 | 1–2 |
| `RTL` | False (default), True | 2 |

### _Breadcrumb Item (the real spec carrier) — 32 variants

| Axis | Values |
|---|---|
| `Type` | Default (link), Current (page), Collapsed (`…` trigger) |
| `State` | Default, Hover, Focus, Disabled — **partial per type, see below** |
| `Size` | Small (default), Medium |
| `RTL` | False, True |

State availability in Figma: **Default** has all four states; **Current** has Default + Disabled only (it isn't interactive); **Collapsed** has Default + Hover only — *no Focus variant exists, but it's a button in code and needs one; reuse the Default-type focus ring* (flag 6).

### Component properties

| Property | Scope | Type | Default |
|---|---|---|---|
| `Item 1–4 Label` | Breadcrumb | Text | "Level 1"–"Level 4" |
| `Current Page Label` | Breadcrumb | Text | "Current" |
| `Show Home Icon` | Breadcrumb | Boolean | OFF |
| `Label` / `Show Label` | Item | Text / Boolean | "Label" / ON |
| `Show Icon` / `Leading Icon` | Item | Boolean / Swap | OFF / home |
| `Show Separator` / `Separator` | Item | Boolean / Swap | ON / chevron-right |

## Layout

```
[Item 1] ‹4px› [Item 2] ‹4px› … [Current]      container: HUG, gap 4px, no padding
└ item = [label-box] ‹4px› [chevron]            item: gap 4px between content and separator
         └ label-box: pad 4px horizontal, radius 4, gap 4 (icon↔text)
```

| | Small | Medium |
|---|---|---|
| Row height | **20px** | **28px** |
| Label-box padding (effective) | 4px horiz / **2px vert** ⚠ | 4px horiz / 4px vert |
| Label-box radius | 4px (`--uems-radius-xs`) | 4px |
| Text | 12/16 `Text/small/Regular` (`--uems-type-body-small-default-*`) | 13/20 `Text/Special-Sizes/small-13/Regular` (`--uems-font-size-13` / `--uems-line-height-13`) |
| Current-page text | 12/16 Medium (`Text/small/Medium`) | 13/20 Medium (`small-13/Medium`) |
| Separator (chevron-right) | 12×12 | 14×14 |
| Leading icon (home, optional) | 14×14 | 16×16 |
| Collapsed `…` (more-horizontal) | 12×12 | 20×20 ⚠ (flag 4) |

> ⚠ Small declares 4px vertical padding in Figma but renders a 20px row (16px line + **2px effective** per side) — validated arithmetically; build to the effective values. Medium is exact (4+20+4=28).

## Design Tokens Used

Hex comments = Light theme. Chevrons and icons are stroke-drawn.

### Type × State matrix

| Type | State | Label-box bg | Text | Icons/Separator |
|---|---|---|---|---|
| **Default** (link) | Default | transparent | `--uems-text-quaternary` /* #55607A */ | sep `--uems-icon-tertiary` |
| | Hover | `--uems-bg-accent-primary-action` (Small) ⚠ `--uems-bg-secondary` (Medium) — flag 1 | `--uems-text-accent-link` /* #006AFF */ | leading icon `--uems-icon-accent-button` |
| | Focus | transparent + **2px `--uems-border-accent` ring, radius 4** | Default colors | Default colors |
| | Disabled | transparent | `--uems-text-disabled` (+ 50% layer opacity in Figma ⚠ flag 2) | sep `--uems-icon-disabled` |
| **Current** | Default | transparent | `--uems-text-secondary` /* #2A303D */, weight 500 | no separator |
| | Disabled | transparent | `--uems-text-disabled` (+ 50% opacity ⚠) | — |
| **Collapsed** (`…`) | Default | transparent | — | `--uems-icon-tertiary` |
| | Hover | `--uems-bg-secondary` /* #F0F2F5 */ | — | `--uems-icon-accent-button` |
| | Focus *(missing in Figma)* | spec: 2px `--uems-border-accent` ring, radius 4 | — | Default colors |

## RTL

`RTL=True` reverses item order (Current first visually-left … Level 1 right) and the separator renders pointing left, placed before the label-box in flow. In code: use `dir="rtl"` on the nav with CSS logical properties — flex order flips automatically; mirror the chevron with `[dir="rtl"] .crumb__sep { transform: scaleX(-1); }`. Don't maintain separate RTL markup.

## Overflow

Figma draws `Overflow=True` for Count 4–5: `[first] › […] › [previous items] › [current]`. Rule for code:

- Collapse when items > **4** (or when the trail can't fit its container) — keep the **first item**, the `…` trigger, the **last 2 ancestors**, and the **current page**
- The `…` is a real `<button>`; clicking opens a **Dropdown Menu** of the hidden crumbs (in order, root → deepest)
- ⚠ The Figma sample labels inside overflow variants read descending (Level 4 › Level 3 › Level 2) — sample-content quirk (flag 5); real order is always ancestor → descendant

## Developer Handoff

### Suggested API

```
<uems-breadcrumb size="small | medium" (default: small)>
  <uems-breadcrumb-item href="/">Home</uems-breadcrumb-item>   ← optional icon slot
  <uems-breadcrumb-item href="/a">Level 1</uems-breadcrumb-item>
  <uems-breadcrumb-item current>Current</uems-breadcrumb-item>  ← renders text, aria-current
</uems-breadcrumb>
auto-collapse: max-visible-items="4" (collapse to first + … + last two)
```

### HTML structure

```html
<nav aria-label="Breadcrumb">
  <ol class="crumbs crumbs--small">
    <li><a class="crumb" href="/">Level 1</a><svg class="crumb__sep" aria-hidden="true"><!-- chevron-right --></svg></li>
    <li><button class="crumb crumb--more" aria-label="Show hidden breadcrumbs" aria-expanded="false">
      <svg aria-hidden="true"><!-- more-horizontal --></svg></button>
      <svg class="crumb__sep" aria-hidden="true"></svg></li>
    <li><a class="crumb" href="/a/b">Level 3</a><svg class="crumb__sep" aria-hidden="true"></svg></li>
    <li><span class="crumb crumb--current" aria-current="page">Current</span></li>
  </ol>
</nav>
```

### CSS

```css
.crumbs { display: flex; align-items: center; gap: var(--uems-spacing-4); list-style: none; margin: 0; padding: 0; }
.crumbs li { display: flex; align-items: center; gap: var(--uems-spacing-4); }

.crumb {
  display: inline-flex; align-items: center; gap: var(--uems-spacing-4);
  border-radius: var(--uems-radius-xs, 4px);
  text-decoration: none; cursor: pointer;
  font-family: var(--uems-type-body-small-default-family);
  color: var(--uems-text-quaternary);
}
/* sizes — effective vertical padding (see Layout note) */
.crumbs--small  .crumb { padding: 2px 4px; font-size: var(--uems-font-size-12); line-height: var(--uems-line-height-12); }
.crumbs--medium .crumb { padding: 4px;     font-size: var(--uems-font-size-13); line-height: var(--uems-line-height-13); }

.crumbs--small  .crumb__sep { width: 12px; height: 12px; }
.crumbs--medium .crumb__sep { width: 14px; height: 14px; }
.crumb__sep { stroke: var(--uems-icon-tertiary); flex: none; }
[dir="rtl"] .crumb__sep { transform: scaleX(-1); }

a.crumb:hover, .crumb--more:hover {
  background: var(--uems-bg-secondary);            /* flag 1: standardized for both sizes */
  color: var(--uems-text-accent-link);
}
.crumb:focus-visible { outline: 2px solid var(--uems-border-accent); outline-offset: -2px; }

.crumb--current {
  color: var(--uems-text-secondary);
  font-weight: var(--uems-font-weight-medium);
  cursor: default;
}
.crumbs[aria-disabled="true"] .crumb { color: var(--uems-text-disabled); pointer-events: none; }
.crumbs[aria-disabled="true"] .crumb__sep { stroke: var(--uems-icon-disabled); }  /* token swap only — no opacity (flag 2) */
```

## States and Interactions

| Element | State | Behavior |
|---|---|---|
| Link crumb | Hover | Tinted background + accent link text |
| Link crumb | Active/click | Navigate; no pressed style in Figma |
| Link crumb | Focus | 2px accent ring inside the 4px radius box |
| `…` trigger | Click | Opens dropdown of hidden crumbs; `aria-expanded` toggles |
| Current page | — | Not interactive; no hover/focus |
| Whole trail | Disabled | Token swap to disabled colors (see flag 2), `pointer-events: none` |

## Responsive Behavior

| Constraint | Behavior |
|---|---|
| Wide | All crumbs visible, no truncation drawn in Figma |
| Narrow | 1) collapse middle items into `…` (> 4 items or overflow); 2) then truncate individual labels with `text-overflow: ellipsis` + `title`/tooltip (suggested `max-width: 160px` — not specified in Figma) |
| Mobile pattern (suggested) | Show only `‹ Parent` back-style crumb below ~480px — confirm with design |

## Edge Cases

- **Single item** — render just the current page, no separator; consider hiding the nav entirely
- **Two items + Show Home Icon** — home icon precedes the first label (14/16px per size); icon-only first crumb still needs an accessible name
- **Long labels / i18n** — labels grow the crumb (HUG); clamp per Responsive row above
- **Missing href on a non-current item** — render as `<span>` styled as Current; never a dead `<a>`

## Animation / Motion

Not specified in Figma. Suggested: 100–150ms ease-out on background-color/color for hover; none on focus ring. Respect `prefers-reduced-motion`.

## Accessibility

| Concern | Guidance |
|---|---|
| Landmark | `<nav aria-label="Breadcrumb">` wrapping an `<ol>` — order is meaningful |
| Current page | `aria-current="page"` on the last item; not a link |
| Separators | Pure decoration: `aria-hidden="true"` SVGs (never text "›" in the accessible tree) |
| Overflow trigger | `<button>` with `aria-label`, `aria-expanded`, `aria-haspopup="menu"`; keyboard-reachable |
| Focus order | Document order = visual order (flex handles RTL); ring per spec |
| Contrast | `text-quaternary` #55607A on white = 5.6:1 AA ✓; hover link #006AFF = 4.6:1 AA ✓ |
| RTL | `dir="rtl"` + logical properties; chevron mirrored via CSS |

## Verification

Both component sets were programmatically scanned (Desktop Bridge): all 12 Breadcrumb assembly variants (structure, 4px gaps, zero padding, child composition incl. overflow rows) and all 32 `_Breadcrumb Item` variants (per-state fills/strokes/text tokens, text styles + bound font-size variables, icon instances + sizes, radii, opacity). Geometry was validated arithmetically per size — which is how the Small effective-2px vertical padding (flag 3) was caught. Token matrix above reflects the live file exactly.

## Flags for design

1. **Hover background differs by size (Default type)** — Small uses `BG-Accent-Primary_action`, Medium uses `BG-Secondary` (Collapsed hover uses `BG-Secondary` at both sizes). Almost certainly drift; code standardizes on `BG-Secondary`. Pick one in Figma.
2. **Disabled double-dimming** — disabled variants both swap to `Text-Disabled`/`Icon-Disabled` tokens *and* set 50% layer opacity. Every other audited component (e.g. Icon Button) uses token-swap at 100%. Code uses tokens only.
3. **Small vertical padding declared 4px, effective 2px** — the 20px row can't fit 4+16+4; Medium is exact. Either fix the Figma padding to 2 or accept the spec's effective values.
4. **Collapsed `…` icon jumps to 20px at Medium** — vs 12px at Small and 14–16px for all other Medium icons. Looks oversized; confirm intent.
5. **Overflow sample labels descend** (Level 4 › Level 3 › Level 2) — sample-content quirk in the overflow variants; real trails are ancestor → descendant.
6. **Collapsed has no Focus/Disabled variants** — it's a button in code; spec reuses the Default-type 2px focus ring. Add the variant in Figma for parity.

---

*Generated from UEMS Design System 3.0 · Figma nodes `16018:37918` + `17960:740160` · 2026-06-11 · 12 + 32 variants programmatically verified*
