# Handoff Spec: Widget

**Figma:** [UEMS — Design System 3.0 · node `20766:5044`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=20766-5044) · Component set, **24 variants** (Type × State × RTL)

**Related:** Same surface contract as `card.md` / `kpi-card.md` · Composes `icon-button`, `button`, `badge`, `text-link`, `empty-state`, `chart`, `data-table`

---

## Overview

The dashboard **tile / panel container**: a self-contained surface (owns its background, border, radius) wrapping a fixed chrome — a **Header** (drag handle, title, optional info icon, trend badge, filter, action) and an optional **Footer** (summary + "view all" link) — around a **swappable body**.

The `type` attribute selects what the body holds:

- `chart` · `list` · `table` — the body hosts **slotted content** (default slot).
- `error` · `empty` · `no-data` — the widget renders a **built-in placeholder** (delegates to `ds-empty-state`) and hides the footer.

A widget **contains** a `ds-chart`, a `ds-data-table`, or list rows — it is never itself a chart. This is the opposite of the bare `ds-chart`: use `ds-widget` when you need the titled frame + header controls + footer; use `ds-chart`/`ds-card`/`ds-kpi-card` when you don't (see *When not to use*).

Dashboard-edit affordances — the header drag handle plus the accent selection ring and four corner resize handles — appear **only when `edit-mode` is set**, and then only on hover, or persistently while `selected`. In view mode the widget shows no drag/resize chrome. `selected` is visual only; the frame itself has no click or keyboard semantics.

## Variants

Per the Figma set and the CSS spec comment: **Type × State × RTL = 24 variants.**

| Axis | Values | Count |
|------|--------|------:|
| `Type` | chart (default), list, table, error, empty, no-data | 6 |
| `State` | Default, Selected (edit-mode) | 2 |
| `RTL` | False, True | 2 |

**Total:** 6 × 2 × 2 = **24 variants**

### Component properties

Every attribute below is declared in `observedAttributes` in `widget.js`.

| Attribute | Type / Values | Default | Maps to |
|---|---|---|---|
| `type` | `chart` \| `list` \| `table` \| `error` \| `empty` \| `no-data` | `chart` | Body mode. State types render a built-in placeholder + force the footer off. |
| `title` | text | — | Header title. Cached into `_titleText` then the attribute is stripped (avoids the native `title` tooltip collision); also becomes the `aria-label`. |
| `show-drag` | boolean (`"false"` opts out) | `true` | Drag handle (`ds-icon-button` `move-vertical`) in the title area. |
| `show-info` | boolean | `false` | Info icon after the title. |
| `info-icon` | icon name | `info-circle` | Glyph for the info icon. |
| `trend` | text | — | Trend-badge label (e.g. `"12%"`). Empty → no badge. |
| `trend-status` | `success` \| `warning` \| `critical` \| `info` | `info` | Recolors the trend badge (mapped to a `ds-badge` state). |
| `trend-icon` | icon name | `up-trend` | Trend badge icon (e.g. `down-trend`). |
| `filter-label` | text | — | Filter pill label (`ds-button` outline). Empty (and no slotted filter) → no filter. |
| `show-action` | boolean (`"false"` opts out) | `true` | Trailing action icon button. |
| `action-icon` | icon name | `settings` | Action button glyph. |
| `show-footer` | boolean (`"false"` opts out) | `true` | Footer visibility. Always off for state types. |
| `footer-summary` | text | — | Footer left text. |
| `footer-label` | text | `View all` | Footer link label. |
| `footer-href` | url | `#` | Footer link href (also emitted in the `ds-widget-view-all` detail). |
| `state-title` | text | per type preset | Overrides the placeholder title (error/empty/no-data). |
| `state-description` | text | per type preset | Overrides the placeholder description. |
| `retry-label` | text | per type preset | Overrides the placeholder primary-action label. Empty → no action button. |
| `state-illustration` | illustration name | per type preset | Overrides the placeholder illustration. |
| `edit-mode` | boolean | `false` | Enables the dashboard-edit affordances (drag handle + ring + resize handles); they reveal on hover or stay while `selected`. |
| `selected` | boolean | `false` | Persistently shows the ring + handles (meaningful with `edit-mode`); exposed as `aria-selected="true"`. Visual only. |
| `state` | `selected` | — | Alternate way to set the selected state (`state="selected"` ≡ `selected`). |
| `dir` | `rtl` | ltr | Mirrors layout; text-align flips. |
| `rtl` | boolean | `false` | Alternate way to enable RTL (sets `dir="rtl"`). |

**State-type presets** (in `STATE_PRESET`, all overridable via the `state-*` / `retry-label` attributes):

| `type` | Illustration | Title | Description | Action |
|---|---|---|---|---|
| `error` | `state-error` | Couldn't load data | Something went wrong while loading. | Retry |
| `empty` | `state-empty` | No results | No items match your filters. | Reset filter |
| `no-data` | `empty-bar-chart` | No data yet | Data will appear here once available. | *(none)* |

### Slots

| Slot | Purpose |
|---|---|
| *default* | Body content for `chart` / `list` / `table` — a `ds-chart`, a `ds-data-table`, or (for `list`) a collection (item rows / `ds-list`) or property view (`ds-description-list`). A bare `type="chart"` with no slotted child auto-renders a default `<ds-chart type="column" mode="single">`. |
| `header-action` | Overrides the default action icon button. |
| `filter` | Overrides the default filter pill (e.g. a real dropdown / date-picker). |

### Events

| Event | Detail | Fires when |
|---|---|---|
| `ds-widget-action` | — | The header action button is activated. |
| `ds-widget-view-all` | `{ href }` | The footer link is activated. |
| `ds-widget-retry` | — | The state-body primary action (error/empty/no-data) is activated. |

## Layout

```
┌─────────────────────────────────────────────┐  ← surface: radius 16, 1px border
│ ⠿ Title  ⓘ            [▲12%] [Last 7 days ▾] ⚙ │  ← Header  (min-h 48, pad 8/16, divider below)
├─────────────────────────────────────────────┤
│                                               │
│               BODY (swappable)                │  ← Body    (pad 12/0 — 0 horizontal)
│         chart · list · table · state          │
│                                               │
├─────────────────────────────────────────────┤
│ +41 more Drivers                 View all  ›  │  ← Footer  (min-h 44, pad 12/16, divider above)
└─────────────────────────────────────────────┘
   ◱ ← accent ring + 4 corner handles sit 4px OUTSIDE the surface (edit-mode + hover/selected)
```

The chrome lives inside a clipped `.ds-widget__surface` (so its rounded corners stay clean). The selection ring and resize handles are **separate layers on the host** (`ds-widget`), which stays `overflow: visible` so they can sit 4px outside the surface.

### Section metrics

| Part | Min height | Padding | Divider |
|---|---|---|---|
| Header | 48px | `8px 16px` | 1px bottom, `--uems-border-quaternary` |
| Body (content) | — (flex `1 1 auto`) | `12px 0` | — |
| Body (state) | 240px | `8px 16px`, centered | — |
| Footer | 44px | `12px 16px` | 1px top, `--uems-border-quaternary` |

Host reference width is `100%` up to `max-width: 580px` (the Figma reference cell width).

> **Body owns 0 horizontal padding by design** (`padding: 12px 0`). Content components supply their own horizontal inset — a chart/list/table is effectively full-bleed to the surface edges. `chart` and `table` bodies drop even the vertical padding (`padding: 0`); `table` adds `overflow-x: auto` so a wide grid h-scrolls **inside** the widget instead of widening it, and the data-table's own outer frame border/radius is zeroed (the widget owns the surface).

## Design Tokens Used

Only tokens actually referenced in `widget.css`. Hex comments = the fallback literal in the source (Light theme).

### Surface

| Role | Token |
|---|---|
| Background | `--uems-bg-primary` |
| Border (1px) | `--uems-border-tertiary` /* #E1E4EB */ |
| Radius | `--uems-radius-l` /* 16px */ |
| Default text color | `--uems-text-secondary` |
| Font family (host) | `--font-family-sans` |

### Header / Footer

| Role | Token |
|---|---|
| Header + footer divider (1px) | `--uems-border-quaternary` /* #f0f2f5 */ |
| Title color | `--uems-text-primary` |
| Title weight | `--font-weight-semibold` /* 600 */ |
| Info icon color | `--uems-icon-secondary` |
| Footer summary color | `--uems-text-quaternary` (fallback → `--uems-text-tertiary`) |

### Selection ring + resize handles (edit-mode)

| Role | Token |
|---|---|
| Ring border (1.5px) | `--uems-border-accent` /* #006AFF */ |
| Handle fill | `--uems-bg-base-white` /* #fff */ |
| Handle border (1.5px) | `--uems-border-accent` |

> The trend badge, filter pill, action button, view-all link, and state illustration/copy each inherit their own tokens from the composed component (`ds-badge`, `ds-button`, `ds-icon-button`, `ds-text-link`, `ds-empty-state`) — `widget.css` does not re-declare them.

## Developer Handoff

### Suggested API

```html
<ds-widget
  type="chart|list|table|error|empty|no-data"   <!-- default: chart -->
  title="Drivers By Class"
  show-drag show-info info-icon="info-circle"
  trend="12%" trend-status="critical" trend-icon="up-trend"
  filter-label="Last 7 days"
  show-action action-icon="settings"
  show-footer footer-summary="+41 more Drivers"
  footer-label="View all" footer-href="#"
  edit-mode selected dir="rtl">

  <!-- default slot = body content for chart/list/table -->
  <ds-chart type="column" mode="single"></ds-chart>

  <!-- optional overrides -->
  <ds-icon-button slot="header-action" ...></ds-icon-button>
  <ds-button slot="filter" ...></ds-button>
</ds-widget>

<!-- events: ds-widget-action · ds-widget-view-all {href} · ds-widget-retry -->
```

State-type example (built-in placeholder, footer auto-hidden):

```html
<ds-widget type="no-data" title="Threat Feed" filter-label="Last 24h"
  state-title="No data to chart"
  state-description="Once devices report in, the chart appears here."
  state-illustration="empty-bar"></ds-widget>
```

### HTML structure (light DOM, generated by `_render`)

```html
<ds-widget class="ds-widget ds-widget--chart" role="group" aria-label="Drivers By Class">
  <div class="ds-widget__surface">
    <div class="ds-widget__header">
      <div class="ds-widget__title-area">
        <ds-icon-button class="ds-widget__drag" icon="move-vertical" ...></ds-icon-button>
        <h3 class="ds-widget__title">Drivers By Class</h3>
        <ds-icon class="ds-widget__info" name="info-circle" size="18"></ds-icon>
      </div>
      <div class="ds-widget__trailing">
        <ds-badge class="…" state="critical" icon="up-trend" label="12%"></ds-badge>
        <span class="ds-widget__filter" data-slot="filter"><!-- ds-button outline --></span>
        <span class="ds-widget__action" data-slot="header-action"><!-- ds-icon-button --></span>
      </div>
    </div>

    <div class="ds-widget__body" data-slot="content"><!-- slotted chart/list/table --></div>
    <!-- OR, for state types: -->
    <!-- <div class="ds-widget__body ds-widget__body--state"><ds-empty-state …></ds-empty-state></div> -->

    <div class="ds-widget__footer">
      <span class="ds-widget__summary">+41 more Drivers</span>
      <ds-text-link class="ds-widget__view-all" trailing-icon="chevron-right" data-view-all>View all</ds-text-link>
    </div>
  </div>

  <!-- selection ring + resize handles: layers on the host, OUTSIDE the clipped surface -->
  <div class="ds-widget__selected-ring" aria-hidden="true"></div>
  <div class="ds-widget__handles" aria-hidden="true">
    <span class="ds-widget__handle ds-widget__handle--tl"></span>
    <span class="ds-widget__handle ds-widget__handle--tr"></span>
    <span class="ds-widget__handle ds-widget__handle--bl"></span>
    <span class="ds-widget__handle ds-widget__handle--br"></span>
  </div>
</ds-widget>
```

Consumer children are captured **once** before the first render (default-slot content, `[slot="header-action"]`, `[slot="filter"]`) and then **moved** (not cloned) into their generated wrappers.

### CSS (essentials)

```css
ds-widget {
  display: block;
  position: relative;        /* ring/handles anchor here; stays overflow:visible */
  width: 100%;
  max-width: 580px;
  font-family: var(--font-family-sans);
}

.ds-widget__surface {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: var(--uems-radius-l, 16px);
  background: var(--uems-bg-primary);
  border: 1px solid var(--uems-border-tertiary);   /* #E1E4EB */
  color: var(--uems-text-secondary);
  overflow: hidden;          /* clip so rounded corners stay clean */
}

.ds-widget__header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 8px 16px; min-height: 48px; box-sizing: border-box;
  border-bottom: 1px solid var(--uems-border-quaternary, #f0f2f5);
}
.ds-widget__title {
  margin: 0; font-size: 14px; line-height: 20px;
  font-weight: var(--font-weight-semibold, 600); color: var(--uems-text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;   /* truncates */
}

.ds-widget__body { flex: 1 1 auto; min-width: 0; padding: 12px 0; }   /* 0 horizontal — by design */
.ds-widget--chart .ds-widget__body { padding: 0; }
.ds-widget--table .ds-widget__body { padding: 0; overflow-x: auto; }  /* grid scrolls inside */
.ds-widget--list  .ds-widget__body { min-height: 0; overflow-y: auto; overflow-x: hidden; }
.ds-widget__body--state {
  display: flex; align-items: center; justify-content: center;
  min-height: 240px; padding: 8px 16px;
}

.ds-widget__footer {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px; min-height: 44px; box-sizing: border-box;
  border-top: 1px solid var(--uems-border-quaternary, #f0f2f5);
}

/* Edit-mode affordances — hidden by default, reveal on hover or while selected */
.ds-widget__drag { display: none; cursor: grab; flex-shrink: 0; }
.ds-widget--edit .ds-widget__drag { display: inline-flex; visibility: hidden; }
.ds-widget--edit:hover .ds-widget__drag,
.ds-widget--edit.ds-widget--selected .ds-widget__drag { visibility: visible; }

.ds-widget__selected-ring, .ds-widget__handles { display: none; }
.ds-widget--edit:hover .ds-widget__selected-ring,
.ds-widget--edit:hover .ds-widget__handles,
.ds-widget--edit.ds-widget--selected .ds-widget__selected-ring,
.ds-widget--edit.ds-widget--selected .ds-widget__handles { display: block; }
.ds-widget__selected-ring {
  position: absolute; inset: 0;
  border: 1.5px solid var(--uems-border-accent);   /* #006AFF */
  border-radius: var(--uems-radius-l, 16px); pointer-events: none;
}
.ds-widget__handle {
  position: absolute; width: 8px; height: 8px; border-radius: 2px;
  background: var(--uems-bg-base-white, #fff);
  border: 1.5px solid var(--uems-border-accent); box-sizing: border-box;
}
.ds-widget__handle--tl { top: -4px; left: -4px; cursor: nwse-resize; }   /* etc. per corner */
```

> **RTL is text-align only.** The header and footer are plain horizontal flex rows — `dir="rtl"` mirrors them natively. Do **not** add `flex-direction: row-reverse` (it would double-reverse — the same bug fixed in `ds-card` / `ds-kpi-card`); only the title/summary get `text-align: right`.

## States and Interactions

| Trigger | Behavior |
|---|---|
| View mode (no `edit-mode`) | No drag handle, no ring, no resize handles — a plain titled frame. |
| `edit-mode`, hover | Drag handle becomes visible; accent ring + 4 resize handles appear. |
| `edit-mode` + `selected` (or `state="selected"`) | Ring + handles + drag handle stay shown persistently; host gets `aria-selected="true"`. |
| Header action click | Emits `ds-widget-action` (bubbles). |
| Footer link click | Emits `ds-widget-view-all` with `{ href }` (bubbles). |
| State-body primary action (error/empty/no-data) | Emits `ds-widget-retry` (bubbles); the `ds-empty-state` button is restyled to outline / xsmall to match the Figma `_Widget State Body`. |
| `type=error/empty/no-data` | Body renders `ds-empty-state` with the per-type preset (overridable); footer forced off. |
| `dir="rtl"` / `rtl` | Layout mirrors natively; title/summary right-aligned; focus order follows DOM. |
| `prefers-reduced-motion: reduce` | Surface transition removed. |

## Edge Cases

- **Long title / summary** — both truncate with ellipsis (`white-space: nowrap`); the title area has `min-width: 0` and `flex: 1 1 auto` so trailing controls never shrink.
- **Bare `type="chart"`** — auto-renders a default `<ds-chart type="column" mode="single">` when no child is slotted.
- **`type="table"`** — the widget forces the inner `ds-data-table`'s `show-toolbar` and `show-footer` to `false` (the widget's own header/footer replace them) and zeroes the table's outer frame border/radius.
- **Height-constrained `list`** — the list body gets `min-height: 0` + `overflow-y: auto` so it shrinks and scrolls rather than painting over a pinned footer.
- **State types ignore `show-footer`** — the footer is always hidden for error/empty/no-data.

## Accessibility

| Concern | Guidance |
|---|---|
| Frame semantics | Host is `role="group"` (defaulted if unset), never a button; `aria-label` derives from `title`. |
| Selection | `selected` sets `aria-selected="true"` on the host — the ring color alone isn't sufficient for screen readers. |
| Interactive parts | Header action, filter, and footer link are real `ds-icon-button` / `ds-button` / `ds-text-link` (native `<button>`/`<a>`) with their own focus rings; the frame itself is never a tab stop. |
| State placeholders | Illustration is `aria-hidden`; the placeholder title/description are readable text and the primary action is a real focusable button. |
| Trend badge | Conveys status with an arrow glyph + `%` label, not color alone. |
| Keyboard | Tab order follows DOM (drag → info → filter → action → body → footer link), matching visual order in both LTR and RTL. |
| Contrast | `Text-Primary` / `Text-Secondary` / `Text-Quaternary` meet AA on the widget surface. |

## Verification

All **24 variants** (Type × State × RTL) reconciled against `widget.js` + `widget.css`:

- **`observedAttributes` ↔ properties table:** all 24 attributes documented (`type`, `title`, `show-drag`, `show-info`, `info-icon`, `trend`, `trend-status`, `trend-icon`, `filter-label`, `show-action`, `action-icon`, `show-footer`, `footer-summary`, `footer-label`, `footer-href`, `state-title`, `state-description`, `retry-label`, `state-illustration`, `edit-mode`, `selected`, `state`, `dir`, `rtl`) — zero invented.
- **Body types:** 3 content (chart/list/table, slotted) + 3 state (error/empty/no-data, built-in `ds-empty-state`, footer off) verified; state presets match `STATE_PRESET`.
- **Tokens:** every token listed appears in `widget.css` (surface `--uems-bg-primary` / `--uems-border-tertiary` / `--uems-radius-l`; dividers `--uems-border-quaternary`; title `--uems-text-primary` + `--font-weight-semibold`; ring/handles `--uems-border-accent` + `--uems-bg-base-white`) — composed-component tokens deliberately excluded.
- **Body padding:** confirmed `12px 0` (0 horizontal) on content, `0` on chart/table, centered 240px on state.
- **Events:** `ds-widget-action`, `ds-widget-view-all {href}`, `ds-widget-retry` verified against `_render`.
- **RTL:** text-align-only mirroring confirmed (no `row-reverse`).

---

*Generated from UEMS Design System 3.0 · Figma node `20766:5044` · sourced from `design-system-library/src/components/widget/widget.js` + `widget.css` and `docs/Widget.html`.*
