---
name: KPI Cards (Metric / KPI Card)
description: Dashboard metric tile that pairs a single numeric value with semantic state coloring and optional accessories — description line, date, gauge, link, or grouped multi-metric layouts.
type: component
status: stable
category: Data
figma:
  file: UEMS — Design System 3.0
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

> Dashboard metric tile. Each card presents one headline number (or a small cluster of them) framed by a label, optional description, semantic state coloring, and optional accessories — date stamp, gauge bar, action link. Use it as the building block of analytics dashboards, KPI strips above tables, and "at-a-glance" page summaries.

| Meta | Value |
|---|---|
| Component name | `KPI Cards` |
| Type | `COMPONENT_SET` |
| Variants | 47 (asymmetric — see [Variant Matrix](#variant-matrix)) |
| Default | `Variant=Default, State=Default, Type=Default` |
| Figma node | `19414:1029` |

---

## At a glance

A KPI Card answers the question *"what's the one number I care about right now?"* It is not a chart, not a table, not a status pill — though it may contain a small gauge for quick context. The hierarchy is always:

1. **Label** — what is being measured
2. **Value** — the headline number
3. **State color** — how to feel about the number (neutral / good / caution / bad)
4. **Optional accessories** — description, timestamp, gauge bar, or a "View more" link

The component set spans three dimensions:

- **Variant** controls the *outer shape* — a single card, a wide card, two side-by-side metrics, three grouped, or a many-up grid.
- **State** controls the *semantic color* — neutral / Success / Warning / Alert.
- **Type** toggles the *accessories* inside the card — description line, date, gauge bar, link, and combinations.

Not every cell in the matrix exists: simpler outer Variants (`Multi`, `Single`, `Two`) come only in the base `State=Default, Type=Default` form. Use `Default` and `Wide` when you need state coloring or accessories.

---

## Variants

### Variant — outer shape

| Value | When to use | Composition |
|---|---|---|
| **Default** | Single metric in a dashboard grid (typical 4-up row). | One label + one value + optional accessories. |
| **Wide** | Same anatomy as Default, but spans wider — useful when the label or description is long, or the card carries a `Desc+Link` accessory. | Same parts as Default, scaled horizontally. |
| **Multi** | Many small metrics grouped under one card surface — e.g., a strip of 6 sub-metrics inside an "Asset health" container. | Single card frame containing N inline metrics. |
| **Two** | Exactly two metrics in one card — common for paired ratios (Open / Closed, Allocated / Free). | Card frame split 50/50 by a divider. |
| **Single** | A standalone, compact single-metric tile — smallest footprint, no decoration. | Label + value only. |

### State — semantic tone

| Value | Meaning | Accent color |
|---|---|---|
| **Default** | Neutral — no judgement about the number. | `--color-text-default` for value, no background tint |
| **Success** | The number is good news (KPI on track, capacity healthy). | `--color-success-bold` value, `--color-success-subtlest` accent strip |
| **Warning** | The number warrants attention but is not yet a problem. | `--color-warning-bold` value, `--color-warning-subtlest` accent strip |
| **Alert** | The number is bad — the user should act. | `--color-danger-bold` value, `--color-danger-subtlest` accent strip |

State only colors the value and any accent strip / gauge fill — it never tints the entire card surface (the card stays on the parent surface).

### Type — accessory composition

| Value | Adds | Notes |
|---|---|---|
| **Default** | nothing | Label + value only. |
| **Description** | one supporting sentence under the value | E.g., "vs. last week". |
| **Date** | date / timestamp row | E.g., "Updated 5 min ago" or an ISO date. |
| **Gauge** | thin progress bar tied to the value | Bar color follows State. |
| **Desc+Date** | Description **and** Date | Use when both context lines add value. |
| **Desc+Gauge** | Description **and** Gauge | Most common rich variant. |
| **Date+Gauge** | Date **and** Gauge | Use when the number is time-sensitive (refresh stamp + progress). |
| **Desc+Link** | Description **and** a "View more" link | **Wide variant only** — Default variant doesn't expose this. |

### Variant Matrix

The 47 published variants don't form a full 5×4×8 cube — only these cells exist:

| Outer Variant | States available | Types available | Count |
|---|---|---|---|
| **Default** | Default, Alert, Success, Warning | Default, Description, Date, Date+Gauge, Desc+Date, Desc+Gauge, Gauge (7 — no `Desc+Link`) | 28 |
| **Wide** | Default, Alert, Success, Warning | Default, Description, Desc+Link, Desc+Gauge (4) | 16 |
| **Multi** | Default | Default | 1 |
| **Single** | Default | Default | 1 |
| **Two** | Default | Default | 1 |

If you need a Multi / Single / Two card with state coloring or a gauge, compose it from `Default` cards inside a wrapping container — don't try to combine axes that don't exist as a variant.

---

## Anatomy

```
Default variant, Type=Desc+Gauge, State=Success
┌──────────────────────────────────────────────────────────────────┐
│  Active sensors                                                   │  ← Label  (--text-body-sm, subtle)
│                                                                    │
│  1,248                                                             │  ← Value  (--text-display, success-bold)
│                                                                    │
│  Up 12% vs. last week                                              │  ← Description (--text-body-sm, subtle)
│                                                                    │
│  ████████████████████████████████░░░░░░░░░░░░                     │  ← Gauge (state-bold fill, neutral track)
└──────────────────────────────────────────────────────────────────┘
```

```
Wide variant, Type=Desc+Link
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  Open work orders                                                                   View all → │
│                                                                                                │
│  42                                                                                            │
│                                                                                                │
│  18 marked urgent · 12 awaiting parts                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

```
Two variant
┌────────────────────────────┬────────────────────────────┐
│  Allocated                 │  Free                       │
│  68%                       │  32%                        │
└────────────────────────────┴────────────────────────────┘
                         divider
```

```
Multi variant
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  Online  │  Offline │  Idle    │  Error   │  Pending │  Total   │
│  812     │  18      │  214     │  4       │  60      │  1,108   │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Slot inventory (Default / Wide)

| Slot | Required | Owned by Type |
|---|---|---|
| Label | ✓ always | all |
| Value | ✓ always | all |
| Description | optional | `Description`, `Desc+Date`, `Desc+Gauge`, `Desc+Link` |
| Date | optional | `Date`, `Date+Gauge`, `Desc+Date` |
| Gauge | optional | `Gauge`, `Date+Gauge`, `Desc+Gauge` |
| Link | optional | `Desc+Link` (Wide only) |

---

## Component properties

| Axis | Type | Default | Values |
|---|---|---|---|
| `Variant` | VARIANT | `Default` | Default, Multi, Single, Two, Wide |
| `State` | VARIANT | `Default` | Default, Alert, Success, Warning |
| `Type` | VARIANT | `Default` | Default, Description, Date, Date+Gauge, Desc+Date, Desc+Gauge, Desc+Link, Gauge |

Per-card text content (Label, Value, Description, Date, Link) is exposed by overriding the inner text and instance slots on the selected variant — the wrapper itself does not surface those as top-level properties.

---

## Design tokens

### Card surface

| Token | Value | Notes |
|---|---|---|
| `--kpi-bg` | `--color-surface-default` (`#FFFFFF`) | Card background |
| `--kpi-border` | `1px solid --color-border-subtle` | Subtle 1px border (no shadow by default) |
| `--kpi-radius` | `8px` | Card radius |
| `--kpi-padding` | `16px` (Default) / `20px` (Wide) | Inner padding |
| `--kpi-gap` | `8px` | Gap between Label, Value, Description, etc. |
| `--kpi-divider` | `1px solid --color-border-subtle` | Internal divider for `Two` and `Multi` variants |

### Typography

| Slot | Token | Spec |
|---|---|---|
| Label | `--text-body-sm` | Zoho Puvi Medium, 14 / 20 — `--color-text-subtle` |
| Value (Default) | `--text-display-sm` | Zoho Puvi Semibold, 28 / 32 — `--color-text-default` |
| Value (Wide) | `--text-display-md` | Zoho Puvi Semibold, 32 / 40 — `--color-text-default` |
| Description | `--text-body-sm` | Zoho Puvi Regular, 14 / 20 — `--color-text-subtle` |
| Date | `--text-meta-xs` | Zoho Puvi Regular, 12 / 16 — `--color-text-subtlest` |
| Link | `--text-button-sm` | Zoho Puvi Medium, 14 / 20 — `--color-link` |

### State tokens (apply to value + accent + gauge fill)

| State | Value color | Accent / gauge fill | Optional accent strip |
|---|---|---|---|
| Default | `--color-text-default` (`#292A2E`) | `--color-text-subtle` (track only) | none |
| Success | `--color-success-bold` (`#1F845A`) | `--color-success-bold` | `--color-success-subtlest` |
| Warning | `--color-warning-bold` (`#B45309`) | `--color-warning-bold` | `--color-warning-subtlest` |
| Alert | `--color-danger-bold` (`#C9372C`) | `--color-danger-bold` | `--color-danger-subtlest` |

> State coloring is reserved for the value and any gauge fill. The card background never adopts a state tint — the card stays on the surface so dashboards don't become noisy.

### Gauge

| Property | Value |
|---|---|
| Height | `4px` |
| Radius | `2px` (pill ends) |
| Track | `--color-neutral-subtler` (`#F0F2F5`) |
| Fill | State-bold color |
| Animation | 200ms ease-out on `width` change |

---

## States & interaction

A KPI Card is **read-only by default** — it does not have hover, focus, or pressed states unless it carries a link or is itself clickable.

| State | When it applies | Behavior |
|---|---|---|
| **Default** | Static card. | No interaction. |
| **Hover (clickable card)** | The whole card is wrapped in a link / button. | Background fades to `--color-neutral-subtler`, border deepens to `--color-border-default`. |
| **Focus-visible (clickable card)** | Card is focused via keyboard. | 2px outer ring `--color-focus-ring`, 2px offset. |
| **Loading** | Data not yet resolved. | Replace Value with a 32px wide skeleton; preserve card height to avoid layout shift. |
| **Empty / error** | No data or fetch failed. | Show `—` as Value with a Description like "Couldn't load". Don't apply Alert state coloring for genuine errors — use the Description copy. |

### Link / "View more" interaction (Wide, Type=Desc+Link)

- The Link sits in the top-right corner of the card by convention.
- It is a `TextLink` (Primary, Small) with optional trailing icon (e.g., chevron-right).
- Activating the link navigates without dismissing the dashboard context.

---

## Usage

### When to use

- **Dashboard summary rows** — 3 to 6 KPIs above a content section (e.g., "Open / In progress / Resolved" above a tickets table).
- **At-a-glance status** — small set of headline metrics that should be readable in under a second.
- **Asset / entity overview pages** — health, capacity, and timing metrics for a single object.
- **Reporting strips** above tables or charts that contextualize the data below.

### When **not** to use

| Situation | Use instead |
|---|---|
| Trends over time | Line / Bar chart |
| Hierarchical breakdown (parent → children) | Tree or grouped table |
| Status of one record (not aggregated) | Status Badge or Tag |
| Long-form narrative or commentary on a metric | Insight card with prose |
| KPIs that need direct editing | Editable inline field |

### Best practices

| ✓ Do | ✗ Don't |
|---|---|
| Use one Value per card — the headline number. | Pack multiple numbers into a single Default card (use `Two` or `Multi` instead). |
| Keep Labels short — 1–3 words, sentence case. Match across cards in the same row. | Mix label tone ("Active sensors" / "How many devices are running?"). |
| Reserve `State=Alert` for genuinely actionable bad news. | Use Alert because the number is "low" — context matters more than direction. |
| Quantify the comparison in the Description ("Up 12% vs. last week"). | Use vague descriptions like "Trending well." |
| Match Variant to the slot: pick `Default` for grid cells, `Wide` for full-width rows, `Two` for paired ratios. | Stretch a `Default` card to full width — its typography is sized for the smaller footprint. |
| Use Gauge to give a denominator ("75/100"). Keep the Value the foreground number; the gauge is supporting. | Use Gauge as decoration when there is no implied total. |
| Align cards in a row to a shared grid (4-up, 3-up, 2-up). | Mix variants in a single row — visual rhythm breaks. |
| Update the Date stamp atomically with the Value so they always agree. | Show a fresh Value with a stale Date. |

### Choosing the right Variant

| Question | Variant |
|---|---|
| Single headline metric in a grid? | `Default` |
| Same as Default but the label or description is long? | `Wide` |
| Two ratios that read together (Open / Closed)? | `Two` |
| Three or more sub-metrics in one container? | `Multi` |
| Smallest possible footprint (label + number only)? | `Single` |

### Choosing the right Type

Pick the **smallest** Type that still answers the user's question:

| Need | Type |
|---|---|
| Just the number | `Default` |
| Number + context line | `Description` |
| Number + freshness | `Date` |
| Number + progress against a total | `Gauge` |
| Context + progress | `Desc+Gauge` |
| Context + freshness | `Desc+Date` |
| Freshness + progress | `Date+Gauge` |
| Context + click-through (Wide only) | `Desc+Link` |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Semantic structure** | Each card should render with a heading for the Label (`<h3>` or `<h4>` depending on page hierarchy) and the Value as plain text. Don't expose the gauge as a chart — it's decorative. |
| **State conveyance** | State coloring is the visual cue, but it must not be the only one. Pair Alert / Warning / Success cards with text that names the condition ("Below target", "On track") so screen reader users get the same signal. |
| **Color contrast** | Value text — Default `#292A2E`, Success `#1F845A`, Warning `#B45309`, Alert `#C9372C` — meets AA against white. Label and Description meet AA at `--color-text-subtle`. Verify any custom State colors at the Bold step. |
| **Gauge** | Mark the gauge `aria-hidden="true"`. Its meaning lives in the surrounding text (Label + Value, plus an implied or explicit denominator). Never use the gauge as the only source of the percentage. |
| **Clickable cards** | When wrapping the entire card in a link / button, expose an `aria-label` that combines Label + Value: e.g., `aria-label="Open work orders, 42"`. Don't nest interactive elements inside an interactive card. |
| **Keyboard** | Static cards are non-interactive. Clickable cards are part of the natural tab order. The `Desc+Link` variant exposes the link as a standard `<a>`, focusable separately. |
| **Reduced motion** | Gauge fill animations collapse to instant `width` swaps under `prefers-reduced-motion`. |
| **RTL** | The Link in `Desc+Link` moves from top-right to top-left. Value remains leading-edge anchored. |

---

## Composition

| Region | Role |
|---|---|
| Card surface | `8px` radius, 1px subtle border, no shadow |
| Header row | Label (always) + optional Link (Wide / `Desc+Link` only) |
| Value | Display typography, colored by State |
| Description row | One short sentence (only in `Description`, `Desc+*` Types) |
| Date row | Short ISO date or relative timestamp |
| Gauge | 4px progress bar, state-colored fill |
| Internal divider | `Two` and `Multi` only — 1px subtle, vertical |

---

## API (engineering)

```ts
type KpiState   = 'default' | 'success' | 'warning' | 'alert';
type KpiVariant = 'default' | 'wide' | 'multi' | 'two' | 'single';

interface KpiCardProps {
  /** Outer shape. */
  variant?: KpiVariant;                  // default: 'default'
  /** Semantic tone for the value and gauge. */
  state?: KpiState;                      // default: 'default'
  /** Required short label. 1–3 words, sentence case. */
  label: string;
  /** Headline value — number, ratio string, or pre-formatted node. */
  value: React.ReactNode;
  /** Optional context sentence (1 short line). */
  description?: string;
  /** Optional date / timestamp (ISO string, relative string, or formatted node). */
  date?: React.ReactNode;
  /** Optional gauge — number 0..1 (ratio) OR { value, max }. */
  gauge?: number | { value: number; max: number };
  /** Optional Wide-only link in the top-right corner. */
  link?: { label: string; href: string; onClick?: () => void };
  /** Make the entire card clickable. Mutually exclusive with `link`. */
  onClick?: () => void;
  /** Loading state — renders skeleton in place of value. */
  loading?: boolean;
  /** Accessible name override when the card is clickable. */
  'aria-label'?: string;
}

interface KpiGroupProps {
  /** 'two' = exactly two children. 'multi' = N children, displayed side-by-side. */
  variant: 'two' | 'multi';
  children: React.ReactNode;             // typically <KpiCard variant="single" />
}
```

### Implementation notes

- **State is presentational only.** The same business value can flip between Success and Alert depending on threshold. Drive State from a config / threshold map at render time; don't bake it into the data layer.
- **Type doesn't need to be a prop.** In code, just pass `description`, `date`, `gauge`, or `link`. The component derives the underlying Figma Type internally — this keeps the API ergonomic.
- **Group cards via a wrapper, not by extending `KpiCardProps`.** `Two` and `Multi` are layout containers. Render `<KpiGroup variant="two">{a}{b}</KpiGroup>` rather than passing an array to a single card.
- **`Desc+Link` is Wide-only by design.** Don't expose a link prop on a non-Wide card — if you need a link inside a tight footprint, switch to Wide.
- **Skeleton during loading should preserve card height** so the dashboard grid doesn't shift when data resolves.
- **Refresh atomicity** — when polling, update `value` and `date` in the same render to avoid flashing a fresh number with a stale stamp.

---

## Related components

| Component | Use it for |
|---|---|
| `Stat List` | Compact, label-aligned rows of metrics inside a content section (denser than KPI Cards). |
| `Chart Card` | A KPI Card with an inline sparkline or chart — when the trend matters as much as the value. |
| `Badge` | A small status pill, not a metric. |
| `Status Tag` | Row-level status of a single record, not aggregated. |
| `Banner` | When a metric crossing a threshold should interrupt the page, not just color a card. |

---

## Changelog

| Date | Change |
|---|---|
| 2026-05-26 | Initial documentation generated from Figma node `19414:1029` (47-variant set). |
