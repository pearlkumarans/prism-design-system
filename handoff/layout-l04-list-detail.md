# L04 — List–Detail (record drilldown)

**Demo:** `Layout/views/layout-list-detail.html` · standalone + `Shell.html?view=list-detail`
**Taxonomy:** `Layout/layouts.md` → L04
**Figma:** UEMS – Design System 3.0 · node `22046:71053` ("Content Area") — **visual reference only**; built from Prism components.
**Builds on:** L03 (`layout-list-view`) chrome — the user drills into a device row to land here.

Drill into one record (a device) and show all its facets. The reference is the
**Summary facet** of a device: an identity header + facet tabs + a read-only
bento of cards (an L05 summary embedded as the first facet).

## Anatomy

```
ds-content (main)
└── .lay (height:100%, flex column)
    ├── ds-page-header (structure="full")            RecordHeader
    │     title = device name · breadcrumbs · summary row
    │     (Status/IP/Owner) · facet tabs · Actions button
    └── .lay__scroll
        └── .ld-grid  (6-col bento — the Summary facet / L05 body)
              R1  Security & Compliance (3)   | Disk Usage donut (3)
              R2  Software Summary column (3) | System Information (3)
              R3  DEX Score gauge (2) | Recent Activity (2) | Sensitive Data donut (2)
              R4  Operating System (3)        | Agent Summary (3)
              R5  Additional Device Info (3)  | Custom Computer Details (3)
              R6  Custom Fields empty-state (2)
```

## Slot → component

| Region | Component | Notes |
|---|---|---|
| RecordHeader | `ds-page-header` `structure="full"` | `title` = record name; `breadcrumbs`; `summary` = Status (status:'success')/IP/Owner; `tabs` = Summary…Restrictions; `Actions` `ds-button variant="outline" suffix-icon="chevron-down"` in `slot="actions"` |
| FacetTabs | `ds-page-header` `tabs` (→ ds-tab-bar-horizontal) | Summary first; non-Summary facets swap the grid for a demo `ds-empty-state` |
| Card frame | `ds-widget` | title + optional `trend` badge (Total/Warranty/Latest), `slot="filter"` (toggle/dropdown), `slot="header-action"` (`ds-text-link` for View Details/Check Updates/Modify) |
| Charts | `ds-chart` | Disk = `donut` `fit="contain"` legend-right; Software = `column` `fit="fill"` `colors`; DEX = `gauge` (`{value,label}`); Sensitive = `donut` |
| Key/value facets | `ds-description-list` `columns="3"` | System Info, OS, Agent, Additional, Custom Details; values render `type:'status'` / `type:'link'` for statuses & links |
| Security checks / activity | icon + label rows (`.ld-check` / `.ld-arow`) | status color per row; health tile + `Fix Now` `ds-button` |
| Custom Fields | `ds-widget type="empty"` | built-in `ds-empty-state`; `retry-label="Add Field"` |

All components exist — **no new abstractions**.

## Rules (taxonomy)

- First tab always `Summary`; `Audit` last when audit data exists.
- KPIs (optional) are about the record, not the module — omitted here (the reference has none).
- Each facet body is an **L05** (summary) or **L03** (sub-list); Summary here is the L05.

## Decisions / notes

- Reference shows only the detail "Content Area"; the master list is L03. The L03
  device link can point here (`Shell.html?view=list-detail`).
- Donut centers auto-sum their series, so Sensitive Data reads 100 (100% of data)
  rather than the Figma's separate "12" item count — illustrative only.
- DEX gauge shows `60%` (component renders `value%`); the Figma "60/100" is the
  same score, labelled `out of 100` beneath.
- Charts use the responsive-viewBox `ds-chart` (fills any card height, readable text).
- Registered under **Inventory** (`tab: 'inv'`), matching where L03 lives.
