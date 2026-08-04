---
name: KPI Cards (Metric / KPI Card)
description: Dashboard metric tile that pairs a single numeric value with semantic state coloring and optional accessories — description line, date, gauge, link, or grouped multi-metric layouts.
type: component
status: stable
category: Data
figma:
  file: UEMS – Design System 3.0
  fileKey: DahIgbIJrSkzyP3OoHaDaG
  nodeId: "19414:1029"
  url: https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=19414-1029
variants:
  axes:
    - { name: Variant, values: [Default, Wide, Multi, Two, Single] }
    - { name: State,   values: [Default, Alert, Success, Warning] }
    - { name: Type,    values: [Default, Description, Date, "Date+Gauge", "Desc+Date", "Desc+Gauge", "Desc+Link", Gauge] }
  total: 47
---

# KPI Cards

Dashboard metric tile. Each card presents one headline number (or a small cluster of them) framed by a label, optional description, semantic state coloring, and optional accessories — date stamp, gauge bar, action link.

## Web Component API

```html
<ds-kpi-card
  variant="default | wide | single"
  state="default | success | warning | alert"
  label="Active sensors"
  value="1,248"
  description="Up 12% vs. last week"
  date="Updated 5 min ago"
  gauge="0.75"                  <!-- or "75/100" -->
  link-label="View all"         <!-- wide variant only -->
  link-href="#"
  loading
  clickable
  rtl></ds-kpi-card>

<!-- Grouped layouts (paired ratios or N-up strips): -->
<ds-kpi-group variant="two | multi">
  <ds-kpi-card variant="single" label="Allocated" value="68%"></ds-kpi-card>
  <ds-kpi-card variant="single" label="Free"      value="32%"></ds-kpi-card>
</ds-kpi-group>
```

### Variants

| Value | Use |
|---|---|
| `default` | Single metric in a dashboard grid (4-up row). |
| `wide` | Same anatomy as default, scaled up; only variant that supports the `link-label` accessory. |
| `single` | Smallest footprint — label + value only. Designed to be placed inside `<ds-kpi-group>`. |

### Group variants

| Value | Use |
|---|---|
| `two` | Exactly two paired metrics in one surface (e.g. Allocated / Free). |
| `multi` | N inline metrics (e.g. Online / Offline / Idle / Error / Pending / Total). |

### States

`default` `success` `warning` `alert` — color the value text and gauge fill only. The card surface stays neutral.

### Accessories

- `description` — one short context sentence under the value.
- `date` — small timestamp / "Updated …" line.
- `gauge` — 4px progress bar (state-colored fill).
- `link-label` + `link-href` — top-right link, **wide variant only**.

### Events

| Event | Fires when |
|---|---|
| `ds-kpi-card-select` | Whole card (when `clickable`) or the wide-variant link is activated. `detail: { source, label, value, href? }` |

## Accessibility

- Label renders as `<h3>` for screen reader hierarchy.
- The gauge is `aria-hidden="true"` — its meaning lives in the surrounding text.
- When `clickable`, the card gets `role="button"`, `tabindex="0"`, and an auto-generated `aria-label` of `"{label}, {value}"`. Enter / Space activate.
- State coloring is paired with text wording — never the only signal of meaning.

## Choosing the right variant

| Question | Variant |
|---|---|
| Single headline metric in a dashboard grid? | `default` |
| Same, but the label or description is long, OR you need a top-right link? | `wide` |
| Two paired ratios (Open / Closed, Allocated / Free)? | `<ds-kpi-group variant="two">` + `<ds-kpi-card variant="single">` |
| Three or more sub-metrics in one container? | `<ds-kpi-group variant="multi">` + `<ds-kpi-card variant="single">` |

## Do / Don't

- **Do** keep labels short (1–3 words, sentence case) and matched across cards in the same row.
- **Do** quantify the comparison in the description ("Up 12% vs. last week"), not vague phrases.
- **Do** match the variant to the layout slot — a 4-up dashboard grid is `default`, a full-row card is `wide`.
- **Don't** apply `state="alert"` because a number is "low" — context matters more than direction.
- **Don't** show a fresh value with a stale date stamp; update both atomically.
- **Don't** use the gauge as decoration when there is no implied total.
