# Calendar

A date picker panel component used for selecting a single date or a date range. Composed of a header, weekday row, date grid, and optional footer actions. Renders as an elevated floating panel with a dark background and drop shadow.

**Figma source:** [UEMS — Design System 3.0](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17189-1121070) · Node `17189:1121070`

---

## Variants

The component set contains **2 variants** across one axis:

| Axis | Values | Count |
|------|--------|------:|
| `Type` | `Single`, `Range` | 2 |

**Component property:**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `Show Footer` | Boolean | `OFF` | Toggles the Footer Actions row at the bottom of the panel |

---

## Types

### Single

A single calendar panel for selecting one date. Displays one month at a time. The panel has a dark background with light-gray day numbers. The selected date is highlighted with a filled cyan-blue circle.

```
┌─────────────────────────────────────────┐
│  <          March 2026           >      │  ← Calendar Header
├─────────────────────────────────────────┤
│  Sun  Mon  Tue  Wed  Thu  Fri  Sat      │  ← Weekday Row
├─────────────────────────────────────────┤
│   1    2    3    4    5    6    7       │
│   8    9   10   11   12   13   14       │  ← Calendar Grid
│  ●15   16   17   18   19   20   21      │  ← Selected date (filled circle)
│  22   23   24   25   26   27   28       │
│  29   30   31                           │
└─────────────────────────────────────────┘
```

- Panel: 276px wide × 300px tall
- Inner grid area: 252px wide
- Elevation: dark background panel with border + drop shadow

### Range

Two calendar panels displayed side by side within one shared container. Used for selecting a start and end date. The selected range is rendered as a pill/capsule band — start and end dates are filled cyan-blue circles; in-between dates have a dark navy band background (darker than the panel fill).

```
┌──────────────────────────────┬──────────────────────────────┐
│  <      March 2026      >    │  <      April 2026      >    │
│  Sun Mon Tue Wed Thu Fri Sat │  Sun Mon Tue Wed Thu Fri Sat │
│   1   2   3   4   5   6   7  │           1   2   3   4     │
│   8  ●9  10  11  12●  13  14  │   5   6   7   8   9  10  11 │
│                               │  ←── range band ───→        │
│  15  16  17  18  19  20  21  │  12  13  14  15  16  17  18 │
│  22  23  24  25  26  27  28  │  19  20  21  22  23  24  25 │
│  29  30  31                  │  26  27  28  29  30          │
└──────────────────────────────┴──────────────────────────────┘
```

- Panel: 544px wide × 300px tall (two 252px grids + shared padding)
- Start date: filled cyan-blue circle, right half of cell has dark navy range-band fill
- In-between dates: full cell has dark navy range-band fill (`BG-Accent-Dark` / `#0F1B30` or similar)
- End date: filled cyan-blue circle, left half of cell has dark navy range-band fill
- The range band bridges across the gap between the two calendar panels when the range spans both months

---

## Anatomy

```
┌────────────────────────────────────────────┐  ┐
│  Calendar Header                           │  │
│  ─────────────────────────────────────     │  │
│  Weekday Row                               │  │ Calendar
│  ─────────────────────────────────────     │  │ Panel
│  Calendar Grid                             │  │ (elevation)
│  ─────────────────────────────────────     │  │
│  Footer Actions  (Show Footer = ON)        │  │
└────────────────────────────────────────────┘  ┘
```

### Sub-components

| Sub-component | Node ID | Description |
|---------------|---------|-------------|
| **Calendar Header** | `17189:1120682` | Navigation chevrons and Month Year label. 252px wide × 28px tall |
| **Weekday Row** | `17189:1120690` | 7-column row of abbreviated weekday labels (Sun–Sat). 252px × 36px |
| **Calendar Grid** | `17189:1120705` | 6-row × 7-column date grid. 252px × 196px. Contains individual Day Cell instances |
| **Footer Actions** | `17189:1120796` | Optional action row (e.g. Cancel / Apply buttons). 276px × 52px. Hidden by default |

---

## Calendar Header

```
  <            March 2026            >
  ▲                  ▲               ▲
  Prev month     Month/Year       Next month
  (chevron-left)   bold text      (chevron-right)
```

| Element | Detail |
|---------|--------|
| Previous chevron | Icon button — navigates to the prior month |
| Month/Year label | Bold, centered; updates on navigation |
| Next chevron | Icon button — navigates to the next month |
| Height | 28px |
| Width | 252px (fills inner panel width) |

Navigation arrows use the accent blue (`#006AFF` / `Border/Icon/Icon-Accent`).

---

## Weekday Row

```
Sun   Mon   Tue   Wed   Thu   Fri   Sat
```

- 7 columns, equally spaced across 252px
- Abbreviated 3-letter day names
- Text: `Text/Text-Secondary` (~`#2A303D`), medium weight
- Height: 36px

---

## Calendar Grid — Day Cell States

Each day in the grid is a Day Cell instance. The following states are supported:

| State | Visual |
|-------|--------|
| **Default** | Day number in light muted gray (`Text-Placeholder` / `~#8893AD`), no background |
| **Hover** | Slightly lighter dark circle background on the day number |
| **Today** | Day number with a ring/underline indicator (distinguishes current date without selection) |
| **Selected (Single)** | Filled cyan-blue circle (`~#38BFFF`), white day number |
| **Range Start** | Filled cyan-blue circle, right half of cell has dark navy band fill |
| **In Range** | Full cell width has dark navy band fill (darker than panel BG), white day number |
| **Range End** | Filled cyan-blue circle, left half of cell has dark navy band fill |
| **Disabled** | Day number in `Text-Disabled` / further muted, not interactive |
| **Other month** | Days outside the current month shown in deeply muted gray or hidden |

---

## Footer Actions

When `Show Footer=ON`, an action row appears at the bottom of the panel. Typically contains:

- **Cancel** — dismisses the calendar without committing the selection
- **Apply** — confirms the selected date or range

The footer uses the standard `Footer Actions` sub-component (node `17189:1120796`) and respects the same elevation container as the rest of the panel.

---

## Design Tokens

### Panel Container

| Element | Token | Resolves |
|---------|-------|----------|
| Background | `Background/BG-Overlay-Dark` | `~#1C2133` (dark navy) |
| Border | `Border/Border-Subtle-Dark` | `~#2A2E3F` |
| Border radius | `Radius/radius-8` | `8px` |
| Drop shadow | — | `0 4px 16px rgba(0, 0, 0, 0.32)` |
| Panel width (Single) | — | `276px` |
| Panel width (Range) | — | `544px` |
| Panel height | — | `300px` |

### Calendar Header

| Element | Token | Resolves |
|---------|-------|----------|
| Month/Year text | `Text/Text-White` | `#FFFFFF` |
| Month/Year font weight | — | Bold (700) |
| Navigation icon | `Border/Icon/Icon-Inverse` | `#FFFFFF` (or light gray) |

### Weekday Row

| Element | Token | Resolves |
|---------|-------|----------|
| Day label text | `Text/Text-Placeholder` | `~#8893AD` (muted on dark BG) |
| Font weight | — | Medium (500) |

### Day Cell

| State | Element | Token | Resolves |
|-------|---------|-------|----------|
| Default | Text | `Text/Text-Placeholder` | `~#8893AD` (light muted gray) |
| Hover | Cell background | `Background/BG-Secondary-Dark` | `~#2A2E3F` |
| Selected | Circle fill | `Background/BG-Accent-Cyan` | `~#38BFFF` (cyan-blue) |
| Selected | Text | `Text/Text-White` | `#FFFFFF` |
| Range Start / End | Circle fill | `Background/BG-Accent-Cyan` | `~#38BFFF` |
| Range Start / End | Text | `Text/Text-White` | `#FFFFFF` |
| In Range | Band fill | `Background/BG-Accent-Dark` | `~#0F1B30` (dark navy, darker than panel) |
| In Range | Text | `Text/Text-White` | `#FFFFFF` |
| Disabled | Text | `Text/Text-Disabled` | `~#4A5368` (deeply muted) |
| Other month | Text | `Text/Text-Placeholder` | `~#4A5368` (hidden or deeply muted) |

---

## Sizes & Dimensions

| Measurement | Single | Range |
|-------------|--------|-------|
| Overall width | `276px` | `544px` |
| Overall height | `300px` | `300px` |
| Inner grid width | `252px` (per panel) | `252px` × 2 |
| Header height | `28px` | `28px` |
| Weekday row height | `36px` | `36px` |
| Grid height | `196px` | `196px` |
| Footer height (when shown) | `52px` | `52px` |
| Panel padding | `12px` | `12px` |
| Day cell approx. size | `36px × 32px` | `36px × 32px` |

---

## Usage Guidelines

### When to use

- When the user must select a specific calendar date (e.g. scheduled task, report date, event date).
- When the user must select a date range (e.g. booking period, filter window, subscription term) — use `Type=Range`.
- Inside date input fields — the calendar appears as a popover triggered by clicking or focusing a date input.
- For reporting filters or query date ranges where two-month visibility helps compare periods.

### When NOT to use

- For selecting a time-of-day — combine with a Time Picker; do not use the Calendar alone.
- For relative date presets ("Last 7 days", "This month") — use a dropdown filter or a Date Range Preset component; reserve the Calendar for absolute date selection.
- When only a year or month needs to be selected — use a simpler Month/Year picker.
- Inline/always-visible calendar for displaying events — use a full Calendar View (data grid) component instead.

### Single vs Range

| Scenario | Use |
|----------|-----|
| Picking one specific date (e.g. due date, birthdate) | `Single` |
| Picking a start and end boundary (e.g. leave dates, report window) | `Range` |
| User may clear or leave date unset | `Single` with an optional clear action in the footer |
| Comparing data across a custom time window | `Range` |

### Footer Actions

| Scenario | `Show Footer` |
|----------|--------------|
| Calendar embedded in a form — the form's own submit button confirms the date | `OFF` (default) |
| Calendar appears as a standalone popover — user must explicitly confirm before closing | `ON` |
| Range picker where tentative selection should be previewed before applying | `ON` |

### Do / Don't

| Do | Don't |
|----|-------|
| Close the calendar popover immediately on day click for `Single` selection | Require a separate "Apply" step for single date selection unless the UI context demands it |
| Show the `Footer Actions` for `Range` selection so the user can confirm or cancel | Auto-close a range picker on end-date click without giving the user a chance to review |
| Disable past dates when only future dates are valid (e.g. booking, scheduling) | Show disabled dates without a clear visual or accessible reason |
| Keep the calendar panel above or below the trigger field, with arrow/popover positioning | Clip the calendar behind other elements or off-screen edges |
| Pre-populate the calendar with the current date or last-used date | Open the calendar on an arbitrary month with no selection context |

---

## Keyboard Behaviour

| Key | Action |
|-----|--------|
| `Tab` | Move focus between navigation arrows, day cells, and footer buttons |
| `←` / `→` | Move focus one day left / right within the grid |
| `↑` / `↓` | Move focus one week up / down |
| `Page Up` | Navigate to the previous month |
| `Page Down` | Navigate to the next month |
| `Home` | Move focus to the first day of the current week |
| `End` | Move focus to the last day of the current week |
| `Enter` / `Space` | Select the focused date (or set range start/end) |
| `Escape` | Close the calendar popover without committing the selection |

---

## Developer Handoff

### HTML structure (Single)

```html
<div
  class="calendar calendar--single"
  role="dialog"
  aria-modal="true"
  aria-label="Date picker"
>
  <!-- Calendar Header -->
  <div class="calendar__header">
    <button class="calendar__nav" aria-label="Go to previous month">
      <svg><!-- chevron-left --></svg>
    </button>
    <span class="calendar__month-year" aria-live="polite">March 2026</span>
    <button class="calendar__nav" aria-label="Go to next month">
      <svg><!-- chevron-right --></svg>
    </button>
  </div>

  <!-- Weekday Row -->
  <div class="calendar__weekdays" role="row">
    <span role="columnheader" aria-label="Sunday">Sun</span>
    <span role="columnheader" aria-label="Monday">Mon</span>
    <span role="columnheader" aria-label="Tuesday">Tue</span>
    <span role="columnheader" aria-label="Wednesday">Wed</span>
    <span role="columnheader" aria-label="Thursday">Thu</span>
    <span role="columnheader" aria-label="Friday">Fri</span>
    <span role="columnheader" aria-label="Saturday">Sat</span>
  </div>

  <!-- Calendar Grid -->
  <div
    class="calendar__grid"
    role="grid"
    aria-label="March 2026"
  >
    <!-- Row for each week -->
    <div role="row">
      <button
        role="gridcell"
        class="calendar__day"
        aria-label="1 March 2026"
        tabindex="-1"
      >1</button>
      <!-- ... -->
      <button
        role="gridcell"
        class="calendar__day calendar__day--selected"
        aria-label="15 March 2026"
        aria-selected="true"
        tabindex="0"
      >15</button>
    </div>
    <!-- ... more rows -->
  </div>

  <!-- Footer Actions (when Show Footer = ON) -->
  <div class="calendar__footer">
    <button class="btn btn--secondary">Cancel</button>
    <button class="btn btn--primary">Apply</button>
  </div>
</div>
```

### HTML structure (Range)

```html
<div
  class="calendar calendar--range"
  role="dialog"
  aria-modal="true"
  aria-label="Date range picker"
>
  <!-- Left panel (start month) -->
  <div class="calendar__panel">
    <!-- Calendar Header, Weekday Row, Grid for March 2026 -->
  </div>

  <!-- Right panel (end month) -->
  <div class="calendar__panel">
    <!-- Calendar Header, Weekday Row, Grid for April 2026 -->
  </div>

  <!-- Footer (optional) -->
  <div class="calendar__footer">
    <button class="btn btn--secondary">Cancel</button>
    <button class="btn btn--primary">Apply</button>
  </div>
</div>
```

### Day cell state classes

```css
/* Panel background — dark theme */
.calendar {
  background: #1C2133;
  border: 1px solid #2A2E3F;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.32);
  color: #8893AD; /* default day text */
}

/* Weekday labels */
.calendar__weekday {
  color: #8893AD;
}

/* Default day */
.calendar__day {
  color: #8893AD;
}

/* Today */
.calendar__day--today { text-decoration: underline; }

/* Selected (Single) — cyan-blue circle */
.calendar__day--selected {
  background: #38BFFF;
  color: #ffffff;
  border-radius: 50%;
}

/* Range start — cyan-blue circle, dark navy right half */
.calendar__day--range-start {
  position: relative;
  background: #38BFFF;
  color: #ffffff;
  border-radius: 50% 0 0 50%;
}
.calendar__day--range-start::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 50%;
  background: #0F1B30; /* dark navy band */
}

/* In range — dark navy band, white text */
.calendar__day--in-range {
  background: #0F1B30;
  color: #ffffff;
  border-radius: 0;
}

/* Range end — cyan-blue circle, dark navy left half */
.calendar__day--range-end {
  position: relative;
  background: #38BFFF;
  color: #ffffff;
  border-radius: 0 50% 50% 0;
}
.calendar__day--range-end::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 50%;
  background: #0F1B30; /* dark navy band */
}

/* Disabled */
.calendar__day--disabled {
  color: #4A5368;
  pointer-events: none;
}
```

---

## Accessibility

| Concern | Guidance |
|---------|----------|
| **Role** | Wrap the calendar in `role="dialog"` with `aria-modal="true"` and `aria-label` when it appears as a popover |
| **Grid semantics** | Use `role="grid"` on the date area, `role="row"` on each week row, `role="gridcell"` on each day cell |
| **Weekday headers** | Mark with `role="columnheader"` and full-name `aria-label` (e.g. `aria-label="Sunday"`) — abbreviations alone are ambiguous |
| **Selected date** | Use `aria-selected="true"` on the active day cell |
| **Range selection** | For range start: `aria-selected="true"` + `aria-label="March 9, start of range"`. For end: similar. For in-between: `aria-label="March 10, in selected range"` |
| **Navigation** | Month/year display should have `aria-live="polite"` to announce month changes when arrows are clicked |
| **Focus management** | On open, focus the selected date (or today if no selection). On close (Escape / Apply), return focus to the trigger input |
| **Disabled dates** | Use `aria-disabled="true"` and `tabindex="-1"` — do not remove from DOM so screen readers can encounter them |
| **Keyboard** | Full keyboard navigation as documented in the Keyboard Behaviour section above |
| **Contrast — selected** | White on `~#38BFFF` (cyan-blue) — verify WCAG AA ratio; cyan hues at this lightness may fall below 4.5:1 against pure white; supplement with circle shape as a non-colour indicator |
| **Contrast — in-range** | White on `~#0F1B30` (dark navy) — meets WCAG AA |
| **Contrast — default day** | Light gray (`~#8893AD`) on dark panel (`~#1C2133`) — verify WCAG AA for small text |
| **Escape** | Must close the calendar popover and return focus to the trigger field |

---

## Related Components

- **Date Input** — the text input field that triggers the Calendar popover; use together
- **Dropdown Menu** — use for relative date presets ("Last 7 days", "This quarter") instead of the Calendar
- **Time Picker** — combine with Calendar when both date and time are required
- **Tooltip** — use to explain why certain dates are disabled (e.g. "Booking closes 24h before")
- **Footer Actions** — sub-component (`17189:1120796`); also used in modals and filter panels

---

## All Variants Reference

| Variant | Node ID |
|---------|---------|
| Type=Single | `17189:1120681` |
| Type=Range | `17189:1120818` |

**Component set:** `17189:1121070`

---

*Generated from UEMS Design System 3.0 · Figma node `17189:1121070`*
