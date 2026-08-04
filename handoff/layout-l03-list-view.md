# L03 — List View (variant B: left filter panel)

**Demo:** `Layout/views/layout-list-view.html` · standalone + `Shell.html?view=list-view`
**Taxonomy:** `Layout/layouts.md` → L03 (variant B)
**Reuses:** the `ds-data-table` setup from `Layout/list-view.html` (Groups & Devices) and
the **`ds-filter-panel`** component (`handoff/filter-panel.md`) for the left filter column.

Browse, filter, search, and bulk-act on a collection of records (> ~10 items).

## Anatomy (variant B)

```
ds-content (main)
└── .lay (height:100%, flex column)
    ├── ds-page-header            "Groups & Devices" + breadcrumb + primary "Add Device"
    └── .lay__scroll (flex:1)
        ├── .lv-kpis              KPI summary row (ds-kpi-card ×4: Total/Managed/Pending/Errors)
        └── .lv-grid (240px | 1fr)   ← left column shows only when filtering (.is-filtering)
            ├── ds-filter-panel   facets: Platform / Status (checkbox + live counts) · active chips · Clear all
            └── .lv-content
                └── ds-data-table  toolbar (search + Filter icon → toggles the panel) · checkbox column · sortable · row actions · bottom pagination
```

## Slot → component

| Region | Component | Notes |
|---|---|---|
| Page header | `ds-page-header` | `structure="full"`: breadcrumb + primary `ds-button` (Add Device) + **summary items** (`.summary` → ds-description-list) + **sub-view tabs** (`.tabs` → ds-tab-bar-horizontal; `ds-page-header-tab` swaps Devices table ↔ empty-state for Groups/Blueprints) |
| KPI row | `ds-kpi-card` | summary tiles (state: default/success/warning/alert) |
| Filter panel | `ds-filter-panel` | left column; `groups` schema (Platform/Status `checkbox` facets + counts); owns active-filter chips + Clear all; emits `ds-filter-panel-change` → host filters `table.rows`. Hidden until the table's Filter icon toggles `.lv-grid.is-filtering`. See `handoff/filter-panel.md`. |
| Search + filter toggle | `ds-data-table` toolbar | built-in search (name/owner) + Filter icon; the icon fires `ds-data-table-filter` → host toggles the panel |
| Active filters | (in `ds-filter-panel`) | one removable chip per active value + Clear all — owned by the panel, not the content column |
| Data table | `ds-data-table` | `selection-mode="multi"`, `sticky-header`, `show-footer` (pagination), `rows-per-page="10"`; toolbar shown (provides search + the Filter toggle) |
| Bulk action bar | built into `ds-data-table` | appears on row selection |

All components already registered — variant B now uses the **`ds-filter-panel`**
component for the left column (previously a hand-built `ds-checkbox` sidebar + `ds-tag` row).

## Rules (taxonomy)

- Name column first (after checkbox) as `ds-text-link`; status as `ds-badge`; long cell
  text truncates with a `ds-tooltip`; actions last, right-aligned; ≤ 7–8 columns.
- Filters: `ds-filter-panel` (variant B) owns the facets, per-option counts, active-filter
  chips, and Clear all. The host feeds it a `groups` schema and applies `panel.value` to
  the table on `ds-filter-panel-change` (live mode). Chip ⇄ control sync is internal.
- Pagination bottom-right (built into the table); page resets to 1 on filter/search.
- Empty state uses `ds-empty-state` inside the table body (not the whole page).

## Instances (concrete screens built on L03)

- **Missing Patches** — `Layout/views/missing-patches.html` · `Shell.html?view=missing-patches`
  (Patch Manager tab). Patch list with Severity/Category/Platform filters, severity
  badges, affected-system counts, Missing/Installed/Declined header tabs.

## Notes

- The table's built-in toolbar stays visible: it provides search plus the Filter icon
  that toggles the `ds-filter-panel` (`.lv-grid.is-filtering`). The panel is hidden until
  toggled; on narrow widths the grid collapses to one column and the panel sits static.
- Active-filter chips live **inside** the panel now (not a separate row in the content
  column). Removing a chip re-syncs its control; Clear all resets everything.
- List views have **no** sticky form-footer (that's L06/L07); the page scrolls normally.
- Variant A (top filter bar with `ds-tab-filter`) is the other L03 layout — not built here.
