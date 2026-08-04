# KPI / Stat Card — Build Spec

**File:** UEMS — Design System 3.0
**Node:** `19414:1029`
**Figma:** https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=19414-1029
**Total variants:** 47

> Compact card that surfaces a single metric (count, percentage, or status) with optional date, gauge, description, and link affordances. This document carries enough detail to rebuild any of the 47 variants without re-opening Figma.

---

## 1. Properties

| Property | Values |
|---|---|
| Variant | Default, Wide, Multi, Single, Two |
| State   | Default, Success, Warning, Alert |
| Type    | Default, Date, Gauge, Description, Desc+Date, Desc+Gauge, Desc+Link, Date+Gauge |

### Valid combinations

| Variant | Supported Types | States |
|---|---|---|
| Default | Default, Date, Gauge, Description, Desc+Date, Desc+Gauge, Date+Gauge | Default, Success, Warning, Alert |
| Wide    | Default, Description, Desc+Link, Desc+Gauge | Default, Success, Warning, Alert |
| Multi   | Default | Default |
| Single  | Default | Default |
| Two     | Default | Default |

---

## 2. Sizes (Variants)

| Variant | Width | Height | Padding | Corner radius | Notes |
|---|---|---|---|---|---|
| Default (Default/Date/Gauge type) | 248 | 90 | 20 | 16 | Compact; metric + icon-badge |
| Default (Description/Desc+Date/Desc+Gauge) | 272 | 112 | 20 | 16 | Adds supporting text |
| Default (Date+Gauge) | 272 | 130 | 20 | 16 | Adds gauge column |
| Wide (Default/Description) | 510 | 92 | 20 | 16 | Full-row format |
| Wide (Desc+Link) | 510 | 96 | 20 | 16 | Adds inline link |
| Wide (Desc+Gauge) | 510 | 96 | 20 | 16 | Adds gauge on right |
| Multi  | 372 | 222 | 20 | 16 | 4-column severity grid |
| Single | 1160 | 190 | 32 | 16 | Header + 4 severity tiles, gap 32 |
| Two    | 576 | 264 | 32 | 16 | Header + 4 narrow severity tiles |

All cards: `background-color: #FFFFFF` (`Background/BG-Primary-alt`), `border: 1px solid #E1E4EB` (`Border/Border-Tertiary`). Group variants (Multi/Single/Two) additionally have `box-shadow: 0 4px 6px rgba(0,0,0,0.04)`.

---

## 3. Color tokens per State

The State property only affects **the metric color** and **the icon badge background** on Default and Wide variants. Container background, border, and supporting text colors stay constant.

| State   | Metric text          | Icon badge bg         | Icon color           |
|---------|----------------------|-----------------------|----------------------|
| Default | `#1E52BB` `Text/Text-Accent-Tertiary` | `#EAF0FC` `Background/BG-Accent-Primary` | `#1E52BB` `Border/Icon/Icon-Accent` |
| Success | `#0A7138` `Text/Text-Success`         | `#E7F3ED` `Background/BG-Success-Primary` | `#0A7138` `Border/Icon/Icon-Success` |
| Warning | `#956B11` `Text/Text-Alert`           | `#FEF8EB` `Background/BG-Alert-Primary`   | `#956B11` `Border/Icon/Icon-Alert` |
| Alert   | `#C1181B` `Text/Text-Error`           | `#FDEBEB` `Background/BG-Error-Primary`   | `#C1181B` `Border/Icon/Icon-Error` |

### Severity tile palette (Multi / Single / Two)

| Severity | Background | Border | Number text |
|---|---|---|---|
| Critical | `#FDEBEB` `BG-Error-Primary` | `#F8C4C4` `Border-Error-Subtle` | `#C1181B` `Text-Error` |
| High     | `#FEF8EB` `BG-Alert-Primary` | `#FDEBC2` `Border-Alert-Subtle` | `#956B11` `Text-Alert` |
| Medium   | `#EAF0FC` `BG-Accent-Primary`| `#C0D1F5` `Border-Accent-Subtle`| `#1E52BB` `Text-Accent-Tertiary` |
| Low      | `#F0F2F5` `BG-Secondary-alt` | `#C3C9D6` `Border-Secondary`    | `#2A303D` `Text-Secondary` |

### Shared / neutral colors

| Token | Value | Used for |
|---|---|---|
| `Background/BG-Primary-alt` | `#FFFFFF` | Card background |
| `Border/Border-Tertiary`    | `#E1E4EB` | Card border |
| `Border/Border-Secondary`   | `#C3C9D6` | Trend-badge border, Low-severity border |
| `Text/Text-Secondary`       | `#2A303D` | Label, headline (group cards) |
| `Text/Text-Tertiary`        | `#40485B` | Severity labels |
| `Text/Text-Quaternary`      | `#55607A` | Description text, date |
| `Text/Text-Accent-Link`     | `#006AFF` | Inline "Devices List" link |
| `Background/BG-Button-Primary` | `#006AFF` | "Across all locations" link |

---

## 4. Typography

| Token | Family | Weight | Size | Line height | Used for |
|---|---|---|---|---|---|
| `display/Large/Bold` | Zoho Puvi | 700 | 32 | 44 | Group-card headline (Single/Two) |
| `display/Small/Bold` | Zoho Puvi | 700 | 24 | 32 | Metric in Date+Gauge, severity numbers, Wide Desc+Link metric, Multi headline |
| Inline 26 px headline | Zoho Puvi SemiBold | 600 | 26 | normal | Metric on basic Default variants (Default/Date/Gauge/Description/etc.) |
| `body/Default/SemiBold` | Zoho Puvi SemiBold | 600 | 14 | 20 | Card label ("Devices") |
| `body/Default/Bold`     | Zoho Puvi Bold | 700 | 14 | 20 | Gauge inner value ("86%") |
| `body/Default/Medium`   | Zoho Puvi Medium | 500 | 14 | 20 | Severity tile labels, group-card sub-label |
| `body/Small/SemiBold`   | Zoho Puvi SemiBold | 600 | 12 | 16 | Trend-badge text |
| `body/Small/Medium`     | Zoho Puvi Medium | 500 | 12 | 16 | Trend delta, link text |
| `body/Small/Default`    | Zoho Puvi Regular | 400 | 12 | 16 | Description / "Last 7 days" / "Across all severity levels" |
| `body/Xsmall/Default`   | Zoho Puvi Medium | 500 | 10 | 14 | Gauge sub-label ("SLA") |

---

## 5. Anatomy by Type

Each Type controls which elements appear inside the Default and Wide variants. Container, padding, and color tokens stay the same — only the inner layout changes.

### Type = Default
- Layout: row, gap 0 (label on left, icon-badge on right)
- Elements: metric (26px), label, icon-badge (36×36, radius 8, 20px icon inside)

### Type = Date
- Same as Default + a "Last 7 days"-style timestamp under the label.

### Type = Gauge
- Same as Default but replaces icon-badge with a circular gauge on the right (size 80, half-circle/donut style).

### Type = Description
- Adds a secondary text line ("Compared to last week" / contextual description) under the label.
- Card height grows from 90 → 112.

### Type = Desc+Date
- Description + relative date stacked under the label.
- Height 112.

### Type = Desc+Gauge
- Description on the left, gauge on the right.
- Height 112.

### Type = Date+Gauge
- Label → date → metric+delta-badge → description, all stacked on the left; gauge column on the right (84px column, 80px ellipse, inner number `display/Small/Bold` 24/32 + sub-label `body/Xsmall/Default`).
- Height 130.
- The delta-badge: height 22, padding 6 horizontal, radius 6, bg `BG-Success-Primary` for positive trend, contains a 16×16 up-trend icon + number in `body/Small/Medium` `Text-Success`.

### Type = Desc+Link (Wide only)
- Icon-badge (36×36) on the left, label + description + inline link ("Devices List" + 12×12 external-link icon) in the middle, metric on the right (`display/Small/Bold` 24/32).
- Height 96.

---

## 6. Group variants (Multi / Single / Two)

These compose a header (headline + sub-label + trend-badge) with a row of severity tiles.

### Multi (372×222, padding 20, gap 20)
- **Header (`card-header`, gap 8):**
  - `main-stats` column (gap 4): headline `1,558` in `display/Small/Bold` (24/32) `Text-Secondary`, sub-label `Total Vulnerabilities` in `body/Default/SemiBold`, description `Across all severity levels in Devices` in `body/Small/Default` `Text-Quaternary`.
  - `trend-badge`: height 32, padding 8, radius 8, border `0.5px solid #C3C9D6`, opacity 0.8, contains `12% vs last week` in `body/Small/SemiBold` + 16×16 chevron-down.
- **Severity grid (`flex justify-between`):** 4 columns, each a centered stack (gap 12) of a colored box (radius 12, padding 12, severity bg+border) holding the count in `display/Small/Bold`, then the severity label in `body/Default/Medium` `Text-Quaternary`.

### Single (1160×190, padding 32, gap 32)
- **Header column (`card-header → main-stats`, gap 8):**
  - Headline `1,558` in `display/Large/Bold` (32/44) `Text-Secondary`.
  - Sub-label `Total Vulnerabilities` in `body/Default/Medium`.
  - Description `Across all severity levels` in `body/Small/Default` `Text-Quaternary`.
  - Trend-badge (same spec as Multi).
- **Severity grid (`flex-1`, gap 24):** 4 equal-flex tiles. Each tile is a full-width box (radius 12, padding 20, severity bg+border) containing:
  - Count in `display/Small/Bold` (severity color)
  - Label (Critical/High/Medium/Low) in `body/Default/Medium` `Text-Tertiary`
  - Inline link `Across all locations` in `body/Small/Medium` `#006AFF` + 12×12 external-link icon

### Two (576×264, padding 32, gap 20)
- Header: same composition as Single (headline `display/Large/Bold` 32/44, sub-label `body/Default/Medium`, description `body/Small/Default`, trend-badge).
- Severity grid: 4 fixed-width tiles (each 110px), gap 24. Tile body is more condensed than Single — no separate count + label group: just count in `display/Small/Bold` (severity color), then label + 12×12 link icon in a row.

---

## 7. Layout primitives shared across variants

- **Icon badge:** 36×36, radius 8, background = State `Background/BG-*-Primary`, contains 20×20 icon stroked in matching `Border/Icon/Icon-*` color.
- **Gauge:** 80×80 SVG, half-arc, fill = State accent. Center text: inner value `body/Default/Bold` 14/20 `Text-Secondary`, sub-label `body/Xsmall/Default` 10/14 `#5A6473`.
- **Trend badge (delta):** height 22, padding-x 6, radius 6, gap 2; positive uses `BG-Success-Primary` + `Text-Success`; negative would mirror to error tokens.
- **Trend badge (vs-last-week):** height 32, padding 8, radius 8, border `0.5px solid #C3C9D6`, opacity 0.8, 16×16 chevron-down.
- **External-link icon (`link-square`):** 12×12 stroked icon in the same color as the link text.

---

## 8. Spacing & sizing tokens

| Token | Value | Used for |
|---|---|---|
| `border-radius/radius-16` | 16 | Card outer radius |
| `radius-12` | 12 | Severity tile radius |
| `radius-8`  | 8  | Icon-badge, trend-badge radius |
| `radius-6`  | 6  | Delta-badge radius |
| `spacing/4` | 4  | Headline → label gap |
| `spacing/8` | 8  | Trend-badge internal gap, card-header gap |
| `spacing/12`| 12 | Multi severity-tile inner padding & gap |
| `spacing/20`| 20 | Card padding (Default/Wide/Multi), severity-tile padding (Single/Two) |
| `spacing/24`| 24 | Severity-grid gap (Single/Two) |
| `spacing/32`| 32 | Card padding (Single/Two), Single severity-grid gap |

---

## 9. Reference code (representative variants)

> Generated from Figma Dev Mode. Adapt classes to the target styling system.

<details>
<summary>Default × Default × Default (248 × 90)</summary>

```tsx
<div className="bg-white border border-[#E1E4EB] rounded-2xl w-[248px] h-[90px] flex items-start p-5">
  <div className="flex-1 flex flex-col gap-1">
    <p className="font-['Zoho_Puvi'] font-semibold text-[26px] text-[#1E52BB]">30</p>
    <p className="font-['Zoho_Puvi'] font-semibold text-sm leading-5 text-[#2A303D]">Devices</p>
  </div>
  <div className="size-9 rounded-lg bg-[#EAF0FC] flex items-center justify-center">
    {/* 20×20 clock icon, stroke #1E52BB */}
  </div>
</div>
```
</details>

<details>
<summary>Default × Default × Date+Gauge (272 × 130)</summary>

Layout: label → date → (metric + delta-badge row) → description on the left; 80px gauge column on the right.
</details>

<details>
<summary>Wide × Default × Desc+Link (510 × 96)</summary>

Layout: icon-badge → (label + description + inline link) → metric.
</details>

<details>
<summary>Single (1160 × 190)</summary>

Layout: header column (headline 32/44 + sub-label + trend-badge) + 4 equal-flex severity tiles (radius 12, padding 20).
</details>

---

## 10. Usage

- ✅ Use Default-size cards to surface one metric on a dashboard.
- ✅ Use Wide when a card spans a full row and benefits from inline description + CTA.
- ✅ Use Multi/Single/Two when one headline metric needs a breakdown by severity.
- ❌ Don't pair more than one gauge in a single card; split into separate cards instead.
- ❌ Don't rely on State color alone for meaning — pair with the icon or label.

## 11. Accessibility

- Metric color contrast on white surface:
  - Default `#1E52BB` ✓ (8.4:1 AA)
  - Success `#0A7138` ✓ (5.8:1 AA)
  - Warning `#956B11` ✓ (4.7:1 AA)
  - Alert   `#C1181B` ✓ (5.8:1 AA)
- Description and date text use `#55607A` on white (5.6:1 AA).
- Inline links use `#006AFF` (4.5:1 AA) — pair with the link-square icon.
- State must be conveyed by at least one of: color + icon + label.

## 12. Rename history

Applied 2026-05-26 via `mcp__figma__use_figma` plugin script — see [README.md](../README.md) for the wider design-system rename log.

| Old | New |
|---|---|
| `Varient` | `Variant` (typo fix) |
| `state` | `State` |
| `wide` | `Wide` |
| `Single Group` | `Single` |
| `Multi-Group` | `Multi` |
| `Two-Group` | `Two` |
| `success` | `Success` |
| `with guage` | `Gauge` |
| `description with date` | `Desc+Date` |
| `Description With guage` | `Desc+Gauge` |
| `Description with link` | `Desc+Link` |
| `date & guage` | `Date+Gauge` |
