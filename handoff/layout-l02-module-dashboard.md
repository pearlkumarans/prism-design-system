# L02 — Module Dashboard

**Demo:** `Layout/views/layout-module-dashboard.html` · standalone + `Shell.html?view=module-dashboard`
**Taxonomy:** `Layout/layouts.md` → L02
**Figma:** UEMS – Design System 3.0 · node `22090:525264` — **visual reference only**; built from Prism components.

At-a-glance read of a module: counters, key metrics, charts, drill-down entry points.

## Anatomy

```
ds-content (main)
└── .lay (height:100%, flex column)
    └── .lay__scroll (flex:1)
        ├── ds-message-box       Notifications (Alerts / Information tabs, collapsible) —
        │                        replaces the page header; wraps ds-inline-alert rows
        │                        (slot="alerts" / slot="information")
        ├── .md-tabs             ds-tab-bar-horizontal (Summary / Security Dashboard / Zia's Analysis)
        └── .md-grid             6-column bento reproducing the Figma widget set:
              R1  [ds-kpi-card ×3 + Last Contact line] (span 3) | Computers by OS donut (3)
              R2  Vulnerability column (2) | Network Patch donut +"Healthy" badge (2) | Software Summary list (2)
              R3  Remote Control list (2) | Image by OS donut (2) | System Health bars (2)
              R4  Software Repository table (4) | Configurations list (2)
              R5  Deployment donut (2) | Device Type pie (2) | Images By Status bars (2)
              R6  Drivers By Class column (3) | Configuration Summary column (3)
```

## Slot → component

| Region | Component | Notes |
|---|---|---|
| Notifications | `ds-message-box` | **replaces the page header** — `tab`, `alerts-count`, `information-count`; collapsible; groups slotted `ds-inline-alert` rows by `slot="alerts"`/`"information"` |
| Alert rows | `ds-inline-alert` | `style-variant="subtle" accent-bar`, `action`, `action-position="inline"` |
| Secondary tabs | `ds-tab-bar-horizontal` | sibling dashboards |
| KPI row | `ds-kpi-card` | 3 tiles here (Figma); L02 allows ≤ 5; state success/default/warning/alert |
| Chart cards | `ds-widget` + `ds-chart` | chart `type=donut\|line\|column\|bar\|pie`; `.data={categories,series:[{name,values,colors?}]}`. `colors` = per-slice/bar semantic palette `blue\|green\|orange\|purple\|red\|yellow\|grey` (see chart change below) |
| List card | `ds-widget type="list"` | slotted `.wl-row` rows — icon tile + label + trailing value **or** `ds-text-link`-style label + status `ds-badge` (Remote Control, Configurations) |
| Table card | `ds-widget type="table"` + `ds-data-table` | `show-toolbar="false"`, comfortable rows |
| Device Type | `ds-chart type="pie"` | Figma shows a radar; `ds-chart` has no radar, so a pie carries the same breakdown |

All components exist — **no new abstractions**.

## Rules (taxonomy)

- KPIs first → charts → tables. Never invert. Max 5 KPIs (else push to a secondary dashboard tab).
- Build to the reference — this dashboard has no side rail (Quick Links / Activity feed). Add one
  only if a specific reference calls for it; don't invent regions the reference doesn't show.
- Loading: skeleton the whole grid until data resolves.

## Notes

- Registered under the **Threats & Patches** module (`tab: 'tp'`) rather than Home — the
  shell's Home tab auto-injects its own `home-dashboard.html`, which would conflict with an
  injected content view. Any non-home module tab shows an empty-state the router cleanly replaces.
- Chart data is illustrative; the donut center auto-sums its series (e.g. OS totals).
- KPI/list icons must be real sprite ids (used `server-01`, `circle-tick`, `exclamation-circle`).
- **ds-chart change (parity):** pie/donut slices now honour `series[0].colors` (named
  palette), exactly like column/bar already did — so the patch/deployment donuts read
  green/red instead of the default categorical hues. Absent → categorical palette (unchanged).
- **Widget width:** `ds-widget` defaults to `max-width:580px` (one Figma tile). Dashboard grid
  cells span 3–4 columns (wider), so the view lifts the cap for `.md-grid` children only.
- **ds-description-list fix:** its constructor now reclaims a pre-upgrade `items` property
  (the `_pendingItems` guard `ds-list` already had) — otherwise `.items` set before upgrade
  silently no-ops.
