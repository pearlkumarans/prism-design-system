# Handoff Spec: Card

**Figma:** [UEMS — Design System 3.0 · node `21949:806025`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=21949-806025) · Component set, **36 variants** (Type × Size × State)

**Related:** Siblings → `kpi-card.md`, `icon-button.md`, `text-link.md` · reuses `ds-icon`, `ds-icon-button`, `ds-text-link`

---

## Overview

A generic content surface — the "everything container" of the system. Swap `type` for the surface
treatment (elevated, outlined, filled, plain), drop anything into the default slot for the body
(text, a stat, a mini chart, a list, or a full `<ds-chart>`), and `<ds-card>` becomes a KPI card, a
settings panel, a list card, or a chart card from the same component.

It is a **self-contained surface** — it owns its own background, border/shadow, and radius, the same
contract as `ds-kpi-card`. The card frame itself is **static**: no click or keyboard behavior lives on
the card. Only the header action (`ds-icon-button`) and footer link (`ds-text-link`) are interactive.
`selected` is a visual accent ring only, driven by a parent list marking a card chosen — not a click
state.

Use `ds-kpi-card` instead when you need a dedicated metric tile (value + trend + gauge). To make a whole
card clickable, wrap it in a real `<a>`/`<button>` rather than making the card itself interactive.

## Variants

| Axis | Values | Count |
|------|--------|------:|
| `Type` | Elevated (default), Outlined, Filled, Plain | 4 |
| `Size` | Small, Medium (default), Large | 3 |
| `State` | Default, Hover, Disabled | 3 |

**Total:** 4 × 3 × 3 = **36 variants**

### Component properties

All attributes below are in `observedAttributes` on `DsCard`. Boolean-`show-*` props default **on**
(set `="false"` to hide); `show-media` / `selected` / `disabled` default **off**.

| Attribute | Values | Default | Maps to |
|---|---|---|---|
| `type` | `elevated` \| `outlined` \| `filled` \| `plain` | `elevated` | Surface treatment only (bg / border / shadow) |
| `size` | `small` \| `medium` \| `large` | `medium` | Scales padding + inter-section spacing (not radius) |
| `title` | text | — | Header title. Captured then stripped from the DOM to avoid the native tooltip attribute; also becomes `aria-label` |
| `subtitle` | text | — | Supporting subtitle under the title |
| `show-subtitle` | boolean | `true` | Set `="false"` to hide the subtitle |
| `show-leading-icon` | boolean | `true` | Toggles the 36×36 icon-badge before the header text |
| `leading-icon` | icon name | `info-circle` | Glyph inside the badge (ignored if `slot="leading-icon"` provided) |
| `show-header-action` | boolean | `true` | Toggles the header icon-button |
| `icon` | icon name | `more-vertical` | Header-action glyph (ignored if `slot="header-action"` provided) |
| `show-body` | boolean | `true` | Toggles the Body / Content region |
| `show-footer` | boolean | `true` | Collapses the whole footer |
| `footer-label` | text | `Action` | Footer action link text |
| `footer-href` | url | `#` | Footer action link href |
| `show-media` | boolean | `false` | Reveals the full-bleed media region at the top |
| `selected` | boolean | `false` | Static accent ring — visual only, no click/keyboard semantics |
| `disabled` | boolean | `false` | `opacity: 0.5` + disabled surface; sets `aria-disabled` |
| `dir` / `rtl` | `rtl` / boolean | ltr | Mirrors layout; text-align flips |

### Slots

| Slot | Notes |
|---|---|
| *(default)* | Body content — anything: text, `ds-chart`, a list, a table |
| `leading-icon` | Overrides the default badge glyph (any icon/element) |
| `header-action` | Overrides the default `ds-icon-button` entirely |
| `media` | Real media (e.g. `<img>`) — replaces the placeholder when `show-media` is set |

## Anatomy

```
┌────────────────────────────────────┐
│ [media]  (optional, full-bleed top) │
├────────────────────────────────────┤
│ ▢  Title                        ⋮   │  ← leading icon-badge · header text · header action
│    Subtitle                         │
│                                     │
│  Body / Content slot (height:auto)  │  ← default slot: text, chart, list, table…
│                                     │
│                             Action  │  ← footer link (trailing edge)
└────────────────────────────────────┘
```

1. **Leading icon + header text** — 36×36 icon-badge (`--uems-bg-info-primary`, `info-circle`, on by
   default) + title (14–16px semibold, `--uems-text-primary`, truncates to one line) + optional 12px
   subtitle.
2. **Header action** — shared `<ds-icon-button type="tertiary-grey" size="xl">`, default `more-vertical`.
3. **Body / Content slot** — default slot, always `height: auto` (never fixed — a fixed body height
   clipped the footer; do not reintroduce it).
4. **Footer action** — a single `<ds-text-link>` on the trailing edge, `footer-label` / `footer-href`.

## Layout

- Root: `position: relative; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden`.
- Header + footer are **plain horizontal flex rows** (`space-between` / `flex-end`). `dir="rtl"` mirrors
  them natively — never add `flex-direction: row-reverse` (double-reverses back to LTR).
- Media: `width: 100%; aspect-ratio: 320/140`, top corners match the card radius, bottom square.
- Body top-padding is `0` at every size — the header's bottom padding supplies the header↔body gap.

### Size metrics (padding)

| Size | Header / body sides | Header T-B | Body bottom | Footer |
|---|---|---|---|---|
| Small | 12px | 12px | 12px | 8px T-B |
| Medium (default) | 16px | 16px | 16px | 12px / 16px |
| Large | 20px | 20px | 20px | 16px / 20px |

Radius stays **16px** at every size. Title is 14px/20 on Small, 16px/24 on Medium & Large.

## Design Tokens Used

All tokens below are referenced directly in `card.css`.

### Surface (by type)

| Type | Background | Differentiator |
|---|---|---|
| Elevated | `--uems-bg-primary` | `box-shadow: 0 1px 4px rgba(13,17,29,0.12)` (Shadow-Small — no exact `--uems-shadow-*` token) |
| Outlined | `--uems-bg-primary` | `1px solid --uems-border-tertiary` |
| Filled | `--uems-bg-accent-primary-subtle` | tint only |
| Plain | `--uems-bg-primary` | flat (no border/shadow) — NOT transparent |

### Hover (opt-in — only fires inside a hoverable wrapper; guarded against disabled)

| Type | Background | Extra |
|---|---|---|
| Elevated | `--uems-bg-primary-hover` | `box-shadow: 0 2px 8px rgba(13,17,29,0.12)` (Shadow-Medium) |
| Outlined / Plain | `--uems-bg-primary-hover` | — |
| Filled | `--uems-bg-accent-primary-action` | — |

### Disabled

| Property | Token |
|---|---|
| Surface | `--uems-bg-disabled-subtle` (+ `opacity: 0.5`) |
| Outlined border | `--uems-border-secondary` |

### Parts

| Part | Token(s) |
|---|---|
| Root radius | `--uems-radius-l` (fallback `16px`) |
| Root font | `--font-family-sans` |
| Body / default text | `--uems-text-secondary` |
| Selected ring | `2px solid --uems-border-accent` |
| Leading icon-badge | bg `--uems-bg-info-primary`, glyph `--uems-icon-info` |
| Title | `--uems-text-primary`, weight `--font-weight-semibold` (fallback 600) |
| Media placeholder | `--uems-bg-disabled` |

> Shadows (Small / Medium) are hardcoded `rgba()` values — there is **no** `--uems-shadow-*` token in the
> system yet. Everything else resolves through design-system variables.

## Developer Handoff

### Suggested API

```html
<ds-card
  type="elevated | outlined | filled | plain"   <!-- default elevated -->
  size="small | medium | large"                  <!-- default medium -->
  title="Card title" subtitle="Supporting subtitle"
  show-leading-icon leading-icon="info-circle"   <!-- badge, on by default -->
  show-subtitle show-header-action icon="more-vertical"
  show-body show-footer footer-label="Action" footer-href="#"
  show-media selected disabled dir="rtl">
  <ds-icon slot="leading-icon" name="folder"></ds-icon>       <!-- optional override -->
  <ds-icon-button slot="header-action" ...></ds-icon-button>  <!-- optional override -->
  <img slot="media" src="…" alt="">                           <!-- when show-media -->
  <!-- default slot = body content: text, ds-chart, a list, a table, anything -->
</ds-card>
<!-- events: ds-card-action { href }, ds-card-header-action -->
```

### HTML structure (light-DOM, generated by `_render()`)

```html
<ds-card class="ds-card ds-card--elevated ds-card--medium" role="group" aria-label="Card title">
  <div class="ds-card__media" data-slot="media">…</div>          <!-- only when show-media -->
  <div class="ds-card__header">
    <span class="ds-card__leading" data-slot="leading-icon" aria-hidden="true">
      <ds-icon name="info-circle" size="20"></ds-icon>
    </span>
    <div class="ds-card__header-text">
      <h3 class="ds-card__title">Card title</h3>
      <p class="ds-card__subtitle">Supporting subtitle</p>
    </div>
    <span class="ds-card__header-action" data-slot="header-action">
      <ds-icon-button type="tertiary-grey" size="xl" icon="more-vertical" label="More" no-tooltip></ds-icon-button>
    </span>
  </div>
  <div class="ds-card__body" data-slot="content">…</div>         <!-- only when show-body -->
  <div class="ds-card__footer">
    <ds-text-link variant="primary" size="medium" href="#">Action</ds-text-link>
  </div>
  <div class="ds-card__selected-ring" aria-hidden="true"></div>
</ds-card>
```

- Consumer-provided slot children are **captured once** on first `connectedCallback`, then *moved*
  (not cloned) into the generated wrappers on each render — re-render is idempotent.
- The header action and footer link are the shared `ds-icon-button` / `ds-text-link` components — never
  hand-rolled markup.

### CSS (essentials)

```css
.ds-card {
  position: relative;
  display: flex; flex-direction: column;
  border-radius: var(--uems-radius-l, 16px);
  overflow: hidden;
  color: var(--uems-text-secondary);
  transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}
.ds-card--elevated { background: var(--uems-bg-primary); box-shadow: 0 1px 4px rgba(13,17,29,0.12); }
.ds-card--outlined { background: var(--uems-bg-primary); border: 1px solid var(--uems-border-tertiary); }
.ds-card--filled   { background: var(--uems-bg-accent-primary-subtle); }
.ds-card--plain    { background: var(--uems-bg-primary); }

.ds-card--disabled { opacity: 0.5; background: var(--uems-bg-disabled-subtle); }
.ds-card__selected-ring { display: none; position: absolute; inset: 0;
  border: 2px solid var(--uems-border-accent); border-radius: inherit; pointer-events: none; }
.ds-card--selected .ds-card__selected-ring { display: block; }

.ds-card__body { flex: 1 1 auto; min-width: 0; }   /* height:auto is load-bearing — never fix it */

@media (prefers-reduced-motion: reduce) { .ds-card { transition: none; } }
```

## States and Interactions

| State | Behavior |
|---|---|
| Default | Resting surface per `type` |
| Hover | Whole-surface color shift (opt-in — only fires inside a hoverable wrapper such as an `<a>`; guarded against disabled). Elevated also gains Shadow-Medium; Filled shifts to the accent action tint |
| Selected | Accent ring overlay (`--uems-border-accent`), visual only — no click/keyboard semantics |
| Disabled | `opacity: 0.5` + `--uems-bg-disabled-subtle`; outlined border → `--uems-border-secondary`; sets `aria-disabled` |
| RTL | `dir="rtl"` mirrors header/footer rows natively; title/subtitle/body `text-align` flips right |

**Events:** `ds-card-action` (`detail: { href }`) when the footer link is activated;
`ds-card-header-action` when the header icon-button is activated. Both bubble.

## Accessibility

| Concern | Guidance |
|---|---|
| Root semantics | Static container — `role="group"`, `aria-label` derived from `title` when set; never an implicit interactive role |
| Interactive parts | Header action + footer link are real `<button>`/`<a>` (via `ds-icon-button` / `ds-text-link`) with their own focus rings — never styled `<div>`s |
| Keyboard | `Tab` reaches the header action, then footer link, then any focusable body content in DOM order; `Enter`/`Space` activate the focused control. The card frame itself is never a tab stop |
| Selected | Also expose `aria-selected="true"` on the host in a selectable-list context (`role="listbox"`/`option`) — the ring color alone isn't enough for screen readers |
| Contrast | `Text-Primary` / `Text-Secondary` meet AA on every type's background, including Filled's tint |
| Disabled | 0.5 opacity applies to the whole card + `aria-disabled`; verify the selected ring still reads when both are set |

## Edge Cases

- **Body height** — always `auto`; it hugs slotted content. A fixed body height clips the footer (a real
  bug found while building the Figma set) — never reintroduce one.
- **Long title** — truncates to one line with an ellipsis; subtitle wraps.
- **`title` attribute** — collides with the native tooltip attribute, so it is cached and stripped from
  the host on render (no unwanted hover tooltip over the whole card).
- **Hover** — has no effect on a bare card; it only shows inside a hoverable wrapper.

## Verification

Cross-checked against `card.js` (`observedAttributes`, `_render()` output) and `card.css`. All 18
attributes documented map to real observed attributes; all tokens listed are referenced in `card.css`
(no `--uems-shadow-*` token exists — shadows are noted as hardcoded `rgba()`). 36-variant set
(4 type × 3 size × 3 state) per the Figma source.

---

*Generated from UEMS Design System 3.0 · Figma node `21949:806025` · sources: `card.js`, `card.css`, `docs/Card.html`.*
