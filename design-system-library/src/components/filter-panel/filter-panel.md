# Filter Panel Component

`<ds-filter-panel>` — a schema-driven filter side panel for a data surface
(table, list, cards). It owns layout, collapsible groups, active-filter chips,
clear-all, and an optional Apply footer, and delegates each field to an existing
Prism input.

## Overview

Give it a `groups` schema and (optionally) a controlled `value`; it renders the
fields and emits a structured, JSON-serializable filter value. The host owns the
query/data-fetch — the panel only reports state.

- **Phases 1–4 (this build)**: `docked`/`drawer`/`popover` presentations (+ responsive
  auto-collapse); `checkbox`/`radio`/`select`/`search`/`range`/`toggle`/`date`/`daterange`/
  `tags`/`custom` fields; live **and** apply modes; active chips + clear-all; collapsible
  groups; per-option + result counts; **loading skeleton + empty state**;
  **search-within-filters**; **"+N more"** for long lists (`maxVisible`).
- **Remaining**: saved presets and the `segmented` field type. See `handoff/filter-panel.md`.

## Web Component API

### Attributes

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `mode` | `docked` \| `drawer` \| `popover` | `docked` | Presentation. |
| `open` | boolean | — | Overlay modes: visible (reflected by `open()`/`close()`). |
| `collapse-at` | px number | — | Docked auto-presents as a drawer below this container width. |
| `anchor` | CSS selector | — | Popover: element to anchor to (else the `open()` trigger). |
| `apply-mode` | `live` \| `apply` | `live` | `live` emits on every change; `apply` shows a footer and emits only on Apply. |
| `loading` | boolean | — | Show skeleton rows (async facets). |
| `show-search` | boolean | — | Search-within-filters box (filters option rows/groups). |
| `empty-text` | string | "No filters available." | Message shown when `groups` is empty. |
| `collapsible` | boolean | on | Groups collapse on header click. Set `"false"` to disable. |
| `show-count` | boolean | on | Append per-option `(count)` when provided. Set `"false"` to hide. |
| `title` | string | `Filters` | Header label. |
| `result-count` | string | — | Optional text shown in the header (e.g. `"24 results"`). |
| `rtl` | boolean | — | Right-to-left layout. |

Boolean attributes follow the design-system convention: present = on; set to
`"false"` to turn off a default-on flag.

### Properties (DOM-only)

| Property | Type | Notes |
|----------|------|-------|
| `groups` | `FilterGroup[]` | Filter schema (see below). |
| `value` | `Record<id, string \| string[]>` | Controlled current selection, keyed by group `id`. |

```ts
type FilterGroup = {
  id: string;
  label: string;
  type: 'checkbox'|'radio'|'select'|'search'|'range'|'toggle'|'date'|'daterange'|'tags'|'custom';
  options?: { label: string; value: string; count?: number; disabled?: boolean }[]; // checkbox/radio/select/tags
  multi?: boolean;         // select: allow multiple
  placeholder?: string;    // select / search / date / tags
  min?: number; max?: number; step?: number;   // range
  toggleLabel?: string;    // toggle: the switch's own label (defaults to `label`)
  maxVisible?: number;     // checkbox: options shown before the "+N more" toggle (default 8)
  render?: (ctx: { value, setValue, group }) => HTMLElement;  // custom: build the control
  sync?: (value, hostEl) => void;                             // custom: reflect value on chip-remove/clear
  chipLabel?: (value) => string;                              // custom: active-filter chip text
  collapsed?: boolean;     // initial collapsed state (reserved)
};
```

Emitted value per type: `checkbox`/multi-`select`/`tags` → `string[]`; `radio`/single-`select`
→ `string`; `search` → `string`; `range` → `[min,max]` (the full span emits nothing);
`toggle` → `true` (off clears the key); `date`/`daterange` → the picker's value string.

### Methods

`clear()` · `apply()` · `open(trigger?)` · `close()` · `toggle(trigger?)` (overlay modes —
pass the trigger element so focus returns to it on close). Setting `value`/`groups` re-renders.

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-filter-panel-change` | `{ value, changed }` | live mode: any field changes (`changed` = group id or `null`). |
| `ds-filter-panel-apply` | `{ value }` | apply mode: Apply clicked. |
| `ds-filter-panel-clear` | `{ }` | Clear-all (chip bar or footer). |
| `ds-filter-panel-remove` | `{ id, key, filters }` | A single active-filter chip is removed. |
| `ds-filter-panel-open` / `-close` | `{ }` | Overlay (drawer/popover) opened or closed. |

Overlay modes: `drawer` (fixed end sheet + scrim, Esc/backdrop dismiss) and `popover`
(anchored card, Esc/outside-click dismiss). `collapse-at="<px>"` makes a docked panel
auto-present as a drawer when its container is narrower than that — the host opens it via
`toggle()`.

## Usage

```html
<ds-filter-panel id="fp" title="Filters" result-count="24 results"></ds-filter-panel>
<script type="module">
  fp.groups = [
    { id:'platform', label:'Platform', type:'checkbox', options:[
      { label:'Windows', value:'win', count:28 }, { label:'macOS', value:'mac', count:12 } ] },
    { id:'status', label:'Status', type:'radio', options:[
      { label:'Managed', value:'managed' }, { label:'Pending', value:'pending' } ] },
    { id:'owner', label:'Owner', type:'select', multi:true, options:[ /* … */ ] },
  ];
  fp.value = { platform:['win'] };
  fp.addEventListener('ds-filter-panel-change', e => table.rows = query(e.detail.value));
</script>
```

## Composition

- Built from `ds-checkbox`, `ds-radio-group`, `ds-input-select`, `ds-tag`,
  `ds-button`, `ds-icon` — all design-tokens, no hardcoded values.
- Pairs with `ds-data-table`: the table's toolbar filter icon
  (`ds-data-table-filter`) toggles the panel; the panel's `change`/`apply` feeds
  `table.rows`. (Reference: `Layout/views/layout-list-view.html`.)

## Accessibility

- Root is a labeled complementary region; each group is a labeled section with a
  collapsible header exposing `aria-expanded`.
- Active-filter chips are removable controls (`ds-tag` close) with the option
  label; removing one syncs the underlying control.
- Fields inherit the keyboard + ARIA behavior of the underlying Prism inputs.
- All DOM queries are scoped to the component root; works across all themes and RTL.
