# Handoff Spec: Filter Panel

> Component: `<ds-filter-panel>` — `design-system-library/src/components/filter-panel/`
> Reference integration: `Layout/views/layout-list-view.html` (L03)
> Status: **Phases 1–4 shipped** (docked/drawer/popover · checkbox/radio/select/search/range/toggle/date/tags/custom · live + apply · chips · clear-all · responsive · loading/empty states · search-within-filters · "+N more"). Remaining: saved **presets** and the **`segmented`** field type (⏳ below).
> Locked decisions: name `ds-filter-panel` · default `apply-mode="live"` · **schema-driven `groups` + `custom` slot** · presets deferred to Phase 4.

## Overview

A reusable panel that collects **filter criteria** for a data surface (table, list,
cards, map) and emits a structured, JSON-serializable filter value. It owns layout,
grouping, the active-filter summary, apply/clear behavior, and (later) responsive
presentation — and delegates each field to an existing Prism input.

It is **not** responsible for querying/fetching data. The host owns that; the panel
only reports state via events.

**Architecture** — schema-driven with a slot escape hatch:
- Fast path: set `groups` (a schema array); the panel renders every field.
- Escape hatch (⏳ Phase 4): a `custom` field type / default slot for bespoke controls.

**Use cases**
| # | Use case | Phase |
|---|----------|-------|
| 1 | Docked sidebar beside a table (the L03 pattern) | 1 |
| 2 | Off-canvas drawer (mobile / tight space) | 3 |
| 3 | Popover/flyout from a "Filter" button | 3 |
| 4 | Faceted search (categorical facets + counts) | 1 |
| 5 | Range & date filtering | 2 |
| 6 | Keyword/text filter | 2 |
| 7 | Saved filter presets | ⏳ (deferred) |
| 8 | Live vs. explicit Apply | 1 (both modes) |
| 9 | Active-filter chips + Clear all | 1 |
| 10 | Async facet loading + empty state | 4 |
| 11 | Search-within-filters | 4 |
| 12 | Long option lists ("+N more") | 4 |

## Anatomy / Layout

```
ds-filter-panel                       (flex column; bordered card; tokens only)
├─ header            title · optional result-count
├─ summary           removable ds-tag chips + "Clear all"   (hidden when empty)
├─ body (scroll)
│   └─ group[]       collapsible section per group
│        ├─ head     label · chevron  (button when collapsible)
│        └─ body     one field control (see field types)
└─ footer            [Clear] [Apply (n)]   — only when apply-mode="apply"
```

**Presentations** (`mode`):
- **docked** (default) — in-flow, sticky, ~240–280px.
- **drawer** — fixed end-docked sheet + scrim; slides in; `open`/`close`/`toggle`; Esc +
  backdrop-click dismiss; focus moves in on open and returns to the trigger on close.
- **popover** — fixed card anchored to the trigger (or `anchor` selector), auto-flips to
  stay on-screen; light-dismiss (outside pointer-down + Esc).
- **Responsive auto-collapse** — set `collapse-at="<px>"`: a docked panel presents as a
  drawer once its container is narrower than that (via `ResizeObserver`); the host opens it
  with `toggle()`.

Overlay presentations are self-contained (own scrim/positioning/focus handling) so the
panel keeps its chrome; a close (✕) button appears in the header in overlay modes.

## Field types (schema `type` → Prism component)

| `type` | Renders with | Value | Phase |
|--------|--------------|-------|-------|
| `checkbox` (multi) | `ds-checkbox` primitives (+ per-option count) | `string[]` | 1 |
| `radio` (single) | `ds-radio-group` (`label-position="top"` → vertical) | `string` | 1 |
| `select` | `ds-input-select` (single or `multi`) | `string`/`string[]` | 1 |
| `search` | `ds-search-field` (debounced 200ms) | `string` | 2 |
| `range` | `ds-slider` (dual-thumb; full span = no filter) | `[min,max]` | 2 |
| `date` / `daterange` | `ds-date-picker` (`type="range"`) | string / comma range | 2 |
| `toggle` | `ds-toggle` (`true` only; `false` clears) | `boolean` | 2 |
| `tags` | `ds-token-field` (free-form + `options` suggestions) | `string[]` | 4 |
| `custom` | author `render({value,setValue,group})` + optional `sync`/`chipLabel` | author-defined | 4 |
| `segmented` | `ds-tab-filter` | `string` | ⏳ (deferred — always-valued, poor "active filter" fit) |

## Data model

```ts
type FilterGroup = {
  id: string;                 // unique; the key in `value`
  label: string;              // group heading (panel supplies it; wrapped inputs' own labels are hidden)
  type: 'checkbox'|'radio'|'select'|'search'|'range'|'date'|'daterange'|'toggle'|'tags'|'custom' | /* ⏳ */ 'segmented';
  options?: { label: string; value: string; count?: number; disabled?: boolean }[];
  multi?: boolean;            // select: allow multiple
  placeholder?: string;       // select / search / date / tags
  min?: number; max?: number; step?: number;   // range
  toggleLabel?: string;       // toggle: the switch's own label
  maxVisible?: number;        // checkbox: options shown before "+N more" (default 8)
  render?: (ctx: { value, setValue, group }) => HTMLElement;  // custom: build the control
  sync?: (value, hostEl) => void;                             // custom: reflect value back (chip remove/clear)
  chipLabel?: (value) => string;                              // custom: active-filter chip text
  collapsed?: boolean;        // reserved: initial collapsed state
};

type FilterValue = Record<string /*group id*/,
  string | string[] | boolean | [number, number] | { from: string; to: string }>;
```

Value shape is stable and JSON-serializable → trivially persisted as a preset or mapped
to a query.

## Web Component API

### Attributes
| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `mode` | `docked` \| `drawer` \| `popover` | `docked` | Presentation. |
| `open` | boolean | — | Overlay modes: visible. Reflected by `open()`/`close()`. |
| `collapse-at` | px number | — | Docked auto-presents as a drawer below this container width. |
| `anchor` | CSS selector | — | Popover: element to anchor to (else the element passed to `open()`). |
| `apply-mode` | `live` \| `apply` | `live` | `live` emits on every change; `apply` shows a footer, emits on Apply. |
| `loading` | boolean | — | Show skeleton rows (async facets). |
| `show-search` | boolean | — | Search-within-filters box (filters option rows/groups by label). |
| `empty-text` | string | "No filters available." | Message shown when `groups` is empty. |
| `collapsible` | boolean | on | Group headers collapse. Set `"false"` to disable. |
| `show-count` | boolean | on | Append `(count)` to option labels. Set `"false"` to hide. |
| `title` | string | `Filters` | Header label. |
| `result-count` | string | — | Optional text in the header (e.g. `"24 results"`). |
| `rtl` | boolean | — | RTL layout (logical properties throughout). |

Boolean attributes use the DS convention: present = on; set `"false"` to disable a
default-on flag.

### Properties (DOM-only)
| Property | Type | Notes |
|----------|------|-------|
| `groups` | `FilterGroup[]` | Schema. Reclaimed if assigned before element upgrade. |
| `value` | `FilterValue` | Controlled current selection (keyed by group id). |

### Methods
`clear()` · `apply()` · `open(trigger?)` · `close()` · `toggle(trigger?)` (overlay modes;
pass the trigger element so focus returns to it on close). Setting `groups`/`value` re-renders.

### Events (`ds-filter-panel-*`)
| Event | Detail | Fires when |
|-------|--------|-----------|
| `change` | `{ value, changed }` | live: any field changes (`changed` = group id or `null`). Also fires on chip-remove and clear. |
| `apply` | `{ value }` | apply mode: Apply clicked. |
| `clear` | `{ }` | Clear-all. |
| `remove` | `{ id, key, filters }` | A single active chip removed. |
| `open` / `close` | `{ }` | Overlay modes: the drawer/popover opened or closed. |

> In **live** mode, binding to `change` alone is sufficient — chip removal and clear-all
> both re-emit `change`.

## States and Interactions

- **Empty selection** — summary hidden; all rows pass.
- **Selecting** — checkbox toggle / radio pick / select change → commits to `value`,
  adds a chip, emits.
- **Chip removal** — removes that value **and syncs the underlying control** (uncheck /
  clear radio / drop from multi-select).
- **Clear all** — empties `value`, clears controls, hides summary.
- **Collapse** — header toggles the group body; `aria-expanded` reflects state; chevron
  rotates.
- **Apply mode** — controls stage changes without emitting `change`; the footer's Apply
  button enables when dirty and shows the active-group count; Apply commits + emits.
- ⏳ **Loading / async facets** — skeleton rows; **Error** — inline; **Disabled** option/group.

## Design Tokens Used

Surfaces/borders `--uems-bg-base`, `--uems-bg-secondary`, `--uems-bg-secondary-hover`,
`--uems-border-tertiary`, `--uems-border-accent`; text `--uems-text-primary/secondary/tertiary`,
`--uems-text-accent-link`; radii `--radius-md/sm/full`; spacing `--spacing-*`; type
`--font-size-*`, `--font-weight-*`, `--font-family-sans`; motion `--duration-fast`,
`--ease-standard`. **No hardcoded hex/px** where a token exists. Works across all five
themes and RTL.

## Components (composed)

`ds-checkbox` · `ds-radio-group` · `ds-input-select` · `ds-tag` · `ds-button` · `ds-icon`.
Sub-component JS is imported and their light-DOM stylesheets auto-injected. The panel
hides each wrapped input's own label/header row (it supplies the group label itself).

## Accessibility Notes

- Root is a labeled complementary region; each group is a labeled section; collapsible
  headers are real `<button>`s exposing `aria-expanded`.
- Active-filter chips are removable controls labeled by the option; removal returns focus
  sanely and re-syncs the control.
- Fields inherit the keyboard + ARIA behavior of the underlying Prism inputs (arrow keys
  within radio/checkbox groups, listbox semantics for select).
- Drawer/popover set `role="dialog"`/`aria-modal`, move focus into the panel on open and
  return it to the trigger on close, and dismiss on `Esc` (+ backdrop for drawer, outside
  pointer-down for popover). ⏳ Full focus-trap cycling and a result-count live region
  are Phase 5 polish.
- All DOM queries are scoped to the component root (never `document`).

## Edge Cases

- **Configured before upgrade** — `groups`/`value` set before the element defines are
  reclaimed in the constructor (host scripts often run before the module loads).
- **Unknown option value in `value`** — chip shows the raw value; control ignores it.
- **Empty `groups`** — renders a centered `empty-text` message.
- **`loading`** — renders shimmer skeleton rows instead of groups.
- **Long option lists** — checkbox groups cap at `maxVisible` (default 8) behind a
  "Show all / Show less" toggle; search-within overrides the cap to reveal matches.
- **Shared class names across views** — styles scoped to `.ds-filter-panel`; queries
  scoped to root (the shell injects multiple views into one DOM).
- **Bounded height** — the host is a flex/height context, so a `max-height`/`height` on
  the `<ds-filter-panel>` element cascades to the card and the **body scrolls internally**
  (it won't overflow past its box). Give the element a bounded height wherever the group
  list can exceed the available space.

## Composition with the data table

Pairs with `ds-data-table`: the table's toolbar filter icon fires `ds-data-table-filter`
→ host toggles the panel; the panel's `change`/`apply` feeds `table.rows`. Reference
implementation: `Layout/views/layout-list-view.html` (checkbox facets with live counts,
chips owned by the panel).

## Phased roadmap

1. **✅ Core docked panel** — checkbox/radio/select; live mode; chips + clear-all;
   collapsible; counts; apply-footer scaffold. L03 refactored onto it.
2. **✅ Ranges & dates** — `search`, `range`, `date`/`daterange`, `toggle`; apply-mode
   footer (staged Clear/Apply with pending count); `_ready` gate so sub-component init
   events don't pollute the value.
3. **✅ Presentations** — `drawer` + `popover` modes (self-contained scrim/positioning/
   focus + light-dismiss); `collapse-at` responsive auto-collapse; `open`/`close`/`toggle`
   + `open`/`close` events; header ✕ in overlay modes. `_ready` gate hardened with a
   `setTimeout` fallback so an offscreen tab never leaves the panel inert.
4. **✅ Advanced (mostly)** — loading skeleton + empty state; search-within-filters;
   `tags` + `custom` fields; long-list "+N more" (`maxVisible`). ⏳ Remaining: saved
   **presets** and the **`segmented`** field type.
5. **⏳ Docs & audit** — docs-site page (`Filter-panel.html` + sidebar), keyboard/SR pass
   (full focus-trap cycling), RTL + all-theme check.

## Resolved decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Element name | `ds-filter-panel` |
| 2 | Default apply mode | `live` |
| 3 | Architecture | schema-driven `groups` + `custom` slot escape hatch |
| 4 | Presets | deferred to Phase 4 |
| 5 | Chip ownership | the panel owns active-filter chips (not the host content area) |
| 6 | Radio orientation | vertical (`label-position="top"`) inside the panel |
