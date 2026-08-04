# Data Table

Tabular component with toolbar, header, selectable rows, footer, and a floating bulk-action bar that appears when rows are selected.

**Figma source:** UEMS Design System 3.0 · Node `18196:229648`

## API — attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `show-toolbar` | boolean | `true` | Show / hide the top toolbar |
| `show-footer` | boolean | `true` | Show / hide the bottom footer |
| `sticky-header` | boolean | `true` | Pin the header row to the top of the scroll container |
| `loading` | boolean | unset | Render shimmer rows + `aria-busy` |
| `selection-mode` | `multi` \| `single` \| `none` | `multi` | Row selection model |
| `row-height` | `compact` \| `default` \| `comfortable` | `default` | 32 / 40 / 48 px |
| `rows-per-page` | number | `20` | Current rows-per-page |
| `rows-per-page-options` | comma list | `10,20,50,100` | Select options |
| `total-rows` | number \| `#` | `#` | Total for the range display |
| `page` | number | `1` | 1-based current page |
| `search-value` | string | — | Toolbar search box value |
| `advanced-filter` | boolean | unset | Filter control becomes a **split button** (main = simple filter → `ds-data-table-filter`; caret = advanced → `ds-data-table-advanced-filter`, or the presets menu when `filterPresets` is set). Omit for a plain outline filter button (simple only). |
| `filter-applied` | boolean | unset | Reflective: shows a red attention dot on the filter button (mirror your committed filter state, e.g. `toggleAttribute('filter-applied', activeCount > 0)`). |
| `filter-open` | boolean | unset | Reflective: holds the filter button in its hover/active state while your filter panel is open. |
| `selected-row-ids` | comma list | — | Controlled selection (also via JS prop) |
| `empty-text` | string | `"No rows to display."` | Text when `rows.length === 0` |
| `fit-viewport` | boolean | unset | Cap the table's height so the **footer stays visible** and the body scrolls; short data still **hugs**. Sizes against its nearest scroll container (e.g. a page `.lay__scroll`) so that container fits **exactly — no empty outer scroll** — else against the viewport. Recomputes on scroll / resize / data change. Best paired with `sticky-header`. |
| `fit-gap` | number | `24` | Bottom gap (px) below the table — used only when there's **no** scroll container (the table drives the page scroll); inside a scroller the container's own padding provides the gap. |
| `rtl` | boolean | unset | Mirror layout |

## API — JS properties

```js
el.columns = [
  { id, header, accessor, align?, sortable?, width?, render?(row) }
];
el.rows = [{ id, /* ...accessor keys */ }];
el.bulkActions = [{ id, label, icon?, destructive? }];   // default: edit, delete, export
el.selectedIds = ['r1', 'r2'];
el.filterPresets = [{ id, label, query?, shared?, owner?, canEdit? }];   // advanced-filter caret menu (host owns storage)
el.filterSummary = 'Windows only';            // chip label for the applied filter ('' hides the chip)
el.filterPresetActive = 'af-2';               // id of the applied saved filter → highlights that caret row (null = none)
```

> `filterPresets` (data-only) drives the **advanced-filter** caret. With any presets the caret
> opens a built-in menu — a "Saved filters" heading, the presets, then **＋ Create advanced filter**;
> selecting a preset emits `ds-data-table-preset-select`, the entry emits
> `ds-data-table-advanced-filter`. Empty/unset → the caret emits `ds-data-table-advanced-filter`
> directly. The host owns storage and applies the chosen preset's query. The menu is set
> `data-no-truncate` so saved-filter names show in full.
>
> Saved-filter rows carry **no leading icon** and reveal hover-actions (on hover/focus); each emits
> `ds-data-table-preset-action` with `{ action, preset }` for the host to handle. Actions are
> **ownership-gated**: my presets (no `shared`) → **share / edit / delete**; presets with
> `shared: true` render in a separate **"Shared with me"** section showing `owner` as provenance
> ("Shared by …") and offer **duplicate / remove**, plus **edit** only when `canEdit: true`.
>
> Past ~10 presets (with both a mine and a shared group) the two sections collapse into a single
> list with an **All / Mine / Shared** scope selector at the top.
>
> The **Create advanced filter** entry reads as a text link (accent). Set `filterPresetActive` to the
> applied preset's id so its caret row shows the active/selected background.
>
> While a filter is applied, the "Saved filters" heading gets a **Clear filter** text-link (and the
> toolbar shows a medium removable chip labelled from `filterSummary`) — both emit
> `ds-data-table-filter-clear`.
>
> **Clearing an applied filter.** When `filter-applied` is set, two affordances appear so the user
> can drop the filter without reopening the builder:
> 1. **Caret menu → "Clear filter"** — added below **Advanced filter…** (the menu now opens even
>    with no presets, purely to offer this). Selecting it emits `ds-data-table-filter-clear`.
> 2. **A removable chip** in the toolbar (right of the filter button) — shown when both
>    `filter-applied` and `filterSummary` are set. Its × also emits `ds-data-table-filter-clear`.
>
> Set `filterSummary` to a short label (a preset's name, or a count like `"3 conditions"`) when you
> apply a filter. On `ds-data-table-filter-clear` the host restores its unfiltered rows, clears
> `filter-applied` + `filterSummary`, and resets its builder.

## Events

| Event | detail |
|---|---|
| `ds-data-table-selection` | `{ ids: string[] }` |
| `ds-data-table-page` | `{ page: number }` |
| `ds-data-table-rows-per-page` | `{ rowsPerPage: number }` |
| `ds-data-table-search` | `{ value: string }` |
| `ds-data-table-sort` | `{ columnId, direction: 'asc'\|'desc'\|null }` |
| `ds-data-table-refresh` | — |
| `ds-data-table-filter` | — (simple filter: outline button click / split-button main) |
| `ds-data-table-advanced-filter` | — (split-button caret, or the caret menu's "Advanced filter…" entry when `filterPresets` is set) |
| `ds-data-table-preset-select` | `{ preset }` (a saved filter chosen from the caret menu) |
| `ds-data-table-preset-action` | `{ action: 'share'\|'edit'\|'delete'\|'duplicate'\|'remove', preset }` (a saved-filter row's hover action in the caret menu; host handles it — `duplicate`/`remove` come from shared rows) |
| `ds-data-table-filter-clear` | — (caret menu's "Clear filter" item, or the toolbar filter chip's ×; host restores unfiltered rows) |
| `ds-data-table-column-settings` | — (fired from the overflow menu's "Column settings" item; host renders the column-toggle UI) |
| `ds-data-table-bulk-action` | `{ id, ids: string[] }` |

> The toolbar overflow (⋯ "More options") opens a built-in `ds-dropdown-menu` with **Column
> settings** and **Export**. "Export" opens the format menu (CSV / JSON / Excel) over the current
> rows and downloads directly (same machinery as the bulk export); "Column settings" emits
> `ds-data-table-column-settings` for the host to handle.

## Composition

The table reuses other DS primitives:
- Row checkboxes → `<ds-checkbox>` (header has indeterminate when partial selection)
- Toolbar refresh / overflow actions → `<ds-icon-button>` (`shape="square" type="tertiary-grey"
  size="large"`); each carries a `label`, which drives both its `aria-label` and a built-in
  hover/focus tooltip (`<ds-tooltip>`, `up-center`). No separate tooltip markup needed.
- Pagination chevrons → `<ds-icon>`
- Cell renderers can return any HTML — typically `<ds-badge>`, `<ds-counter>`, anchors, etc.
  - **Convention:** render `<ds-status-indicator>` and `<ds-badge>` cells with **`size="medium"`** —
    the default badge/status size for data-table columns (right density at row height). Apply it
    consistently across a table's columns.

## Token mapping

| Element | Token |
|---|---|
| Body bg | `--bg-primary-alt` |
| Header bg | `--bg-secondary-alt` |
| Row hover | `--bg-secondary-hover` |
| Selected row | `--bg-accent-primary-subtle` |
| Borders | `--border-secondary` (rows), `--border-tertiary` (columns) |
| Header text | `--text-tertiary` |
| Cell text | `--text-primary` |
| Link cells | `--text-accent-link` |
| Bulk-bar bg | `--bg-overlay-dark` |
| Bulk-bar text | `--text-white` |
| Destructive bulk action | `cardinal-300` |

## Accessibility

- Real `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`, `<td>`.
- Header checkbox uses `aria-label="Select all rows"`; row checkbox uses `aria-label="Select row {id}"`.
- Sortable headers expose `aria-sort="ascending|descending|none"`.
- Loading state sets `aria-busy="true"` on the host.
- Empty state cell uses `role="status"`.
- Bulk-action bar is a `role="region"` with `aria-label="Bulk actions"`.

## Out of scope (this version)

- Filter dropdown contents — the toolbar's filter button just emits `ds-data-table-filter`; consumer renders the popover.
- Column-settings UI — the overflow menu's "Column settings" item emits `ds-data-table-column-settings`; the consumer renders the column-toggle panel. (Export is built in.)
- Column resize / drag-reorder.
- Virtualization for very large datasets.
- Expandable / detail rows.
