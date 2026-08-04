# Charts Component

**Design System:** UEMS Design System 3.0
**Custom element:** `<ds-chart>`
**Source:** `design-system-library/src/components/chart/`
**Figma:** `❖ Chart` → `Chart Families` (node 21540-796217)

---

## Overview

The Chart is a data-visualization primitive covering **9 types** across 4 families — **column / bar** (single · grouped · stacked), **line**, **pie / donut / funnel**, and **gauge**. It renders gridlines, axes, series, and an optional legend as a **self-contained SVG** (no external charting library), themed entirely from the chart tokens so it re-themes across light / dark / night / green.

It is **bare by design** — no header, surface, or padding — because it lives inside a host **widget** that owns the chrome. `ds-chart` owns only an optional **loading** skeleton; **empty** and **error** states belong to the host widget (rendered with the system Empty state component, consistently across all widget content).

---

## Anatomy

```
        ┌─────────────────────────────────┐
   100 ┤  · · · · · · · · · · · · · · · ·  │   ← Gridlines + Y axis (value ticks)
    75 ┤  ▓        ▓                        │   ← Series (bars / line / slices)
    50 ┤  ▓  ▓     ▓  ▓     ▓  ▓            │   ← Plot area
    25 ┤  ▓  ▓  ▓  ▓  ▓  ▓  ▓  ▓  ▓         │
     0 └──Q1──────Q2──────Q3──────Q4───────┘   ← X axis (category labels)
        ● Revenue   ● Profit   ● Forecast       ← Legend (toggle series)
```

| Part | Description |
|------|-------------|
| **Plot area** | Fills the host width; transparent. Scales responsively. |
| **Axes (X / Y)** | Value axis = ticks at gridlines (`Spaced`); category axis = labels centered under groups/points (`Centered`). Axis line + baseline drawn on the plot edges. |
| **Gridlines** | 5 horizontal (or vertical) lines aligned to the value ticks. |
| **Series** | Bars / columns / line+points / pie-donut slices / funnel segments, colored from the categorical palette. |
| **Legend** | Optional. Real `<button>`s — click to toggle a series; line charts use a line swatch, others a dot. |
| **Data labels** | Optional value callouts on each data element. |
| **Tooltip** | On hover — category + per-series swatch / name / value (reuses the popover surface tokens). |

---

## Types

| `type` | `mode` | Use case |
|--------|--------|----------|
| `column` | single · grouped · stacked | Compare values across categories (vertical) |
| `bar` | single · grouped · stacked | Comparison with long labels / many categories (horizontal) |
| `line` | — (multi-series) | Trends over time |
| `pie` | — | Part-to-whole (few slices) |
| `donut` | — | Part-to-whole with a **center total** in the hole |
| `funnel` | — | Stage-to-stage drop-off |
| `gauge` | — | A single value (0–100) against a range |

---

## States

| State | Behavior |
|-------|----------|
| **Default** | Renders from `data`. |
| **Hover** | Tooltip at the cursor; (optionally) dims other series. |
| **Legend toggle** | Click a legend item to hide/show its series; `aria-pressed` reflects state. |
| **Loading** | `loading` → chart-shaped skeleton (`bg-disabled` bars). The only state `ds-chart` owns. |
| **Empty / Error** | **Owned by the host widget** (system `Empty state`), NOT `ds-chart`. |

---

## Component Properties

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `type` | `column` · `bar` · `line` · `pie` · `donut` · `funnel` · `gauge` | `column` | Chart family. |
| `mode` | `single` · `grouped` · `stacked` | `single` | Column/bar only. |
| `show-legend` | boolean | `true` | Set `show-legend="false"` to hide. |
| `show-gridlines` | boolean | `true` | Set `show-gridlines="false"` to hide. |
| `show-data-labels` | boolean | `false` | Value callouts on data elements. |
| `legend-position` | `top` · `bottom` · `left` · `right` | `bottom` | Legend placement. |
| `loading` | boolean | unset | Render the loading skeleton. |
| `rtl` | boolean | unset | Mirror axis side, legend alignment, label direction. |

### Data (JS property)
```js
chart.data = {
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: 'Revenue',  values: [42, 58, 50, 71] },
    { name: 'Profit',   values: [22, 30, 28, 45] },
  ],
};
// pie / donut / funnel → use the first series' values (each value = a slice)
// gauge → chart.data = { value: 68, label: 'Capacity' }
```
Ships with **default sample data**, so `<ds-chart type="column">` renders standalone. Also exposed as `chart.setData(data)`.

### Methods
- `setData(data)` — set/replace the chart data (alias of the `data` property).

### Events
- (none) — legend toggles are internal; consumers read/set `data` and attributes.

---

## Design Tokens

### Categorical series (default order)
| # | Token |
|---|-------|
| 1 | `Chart/BG-Chart-Blue-Primary` |
| 2 | `Chart/BG-Chart-Green-Primary` |
| 3 | `Chart/BG-Chart-Orange-Primary` |
| 4 | `Chart/BG-Chart-Charoite-Primary` |
| 5 | `Chart/BG-Chart-Red-Primary` |
| 6 | `Chart/BG-Chart-Yellow-Primary` |
| 7 | `Chart/BG-Chart-Grey-Primary` |

- **Sequential** = a single hue's `Primary→Senary` shades (e.g. `Chart/BG-Chart-Blue-*`).
- **Diverging** = Red shades ↔ neutral (Grey) ↔ Blue shades.
- **Semantic** = positive (Green) · negative (Red) · neutral (Grey) · target (Blue) · forecast (Orange).

### Structure
| Role | Token |
|------|-------|
| Axis line / baseline | `Border/Border-Secondary` |
| Gridline | `Border/Border-Tertiary` |
| Axis & tick labels | `Text/Text-Tertiary` |
| Data labels | `Text/Text-Secondary` |
| Surface (tooltip) | `Background/BG-Primary-alt` |
| Loading skeleton | `Background/BG-Disabled` |
| Font | `Inter` — 11px axis, 13px legend |

---

## Usage

### Do
- Use **column/bar** for comparison, **line** for trends, **pie/donut** for part-to-whole, **gauge** for a single value.
- Keep series to **≤ 7** (the categorical palette repeats after 7).
- Assign series in the default categorical order for max contrast & accessibility.
- Use horizontal **bar** when category labels are long or numerous.
- Let the chart fill the widget; the widget owns the title, surface, and empty/error states.

### Don't
- Use more than ~7 categorical colors — switch to sequential or aggregate.
- Truncate the value axis (start at 0 for bars/columns).
- Put a title/surface on the chart — that belongs to the host widget.
- Rely on color alone — pair with labels/legend for meaning.
- Handle empty/error inside the chart — the widget renders the system `Empty state`.

---

## Accessibility

| Concern | Implementation |
|---------|----------------|
| **Role / name** | Container `role="img"` with an `aria-label` summarizing the data ("column chart, 3 series, categories Q1–Q4"). |
| **Data fallback** | A visually-hidden `<table>` mirrors the data for screen readers. |
| **Legend** | Real `<button>`s — keyboard operable; `aria-pressed` reflects series visibility. |
| **Tooltip** | Hover-only info is also in the data table (not hover-dependent). |
| **Color** | Never the sole signal — pair with labels; AA contrast for axis/labels. |
| **Loading** | `aria-busy="true"` on the skeleton. |
| **Motion** | Entrance animations disabled under `prefers-reduced-motion`. |
| **RTL** | `rtl` mirrors axis side, legend alignment, and label direction. |

---

## Related Components

| Component | When to use instead |
|-----------|---------------------|
| **KPI card** | A single headline metric (with delta) rather than a plotted series. |
| **Data table** | Precise values, sorting, or many columns — when reading exact numbers matters. |
| **Empty state** | The widget's empty/error treatment when a chart has no data to show. |
