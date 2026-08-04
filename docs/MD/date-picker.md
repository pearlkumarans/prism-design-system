# Date Picker

A Date Picker lets users select a single date or a date range via a text input trigger and a calendar popover. The input accepts direct keyboard entry (`DD/MM/YYYY`) and exposes a calendar glyph that opens the popover. The popover contains a month header with navigation, a weekday row, and a day grid. Optional **preset** shortcuts and a **footer** with Apply / Cancel / Clear buttons can be enabled.

**Figma source:** [UEMS Design System 3.0 — Date Picker](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=17195-1122073)
**Component node:** `17195:1122073` (Date Picker component set)
**Last updated:** 2026-04-19

---

## Anatomy

**Single — Closed**
```
Label *
┌────────────────────────────┐
│ 📅  DD/MM/YYYY             │  ← Date Input (trigger)
└────────────────────────────┘
```

**Single — Open**
```
Label *
┌────────────────────────────┐
│ 📅  DD/MM/YYYY             │  ← Focused input (2 px accent border)
└────────────────────────────┘
┌────────────────────────────┐
│  ‹     March 2026       ›  │  ← Calendar Header
│                            │
│  Sun Mon Tue Wed Thu Fri Sat │ ← Weekday Row
│    1   2   3   4   5   6  7 │
│    8   9  10  11  12  13 14 │
│   ⬤   16  17  18  19  20 21 │  ← Selected day (pill/circle, BG-Accent)
│   22  23  24  25  26  27 28 │
│   29  30  31   ·   ·   · · │  ← Outside-month days (Text-Disabled)
└────────────────────────────┘
```

**Range — Closed**
```
Label *
┌────────────────────────────┐  ┌────────────────────────────┐
│ 📅  DD/MM/YYYY             │  │ 📅  DD/MM/YYYY             │
└────────────────────────────┘  └────────────────────────────┘
```

**Range — Open (dual calendar)**
```
Label *
┌────────────────────────────┐  ┌────────────────────────────┐
│ 📅  DD/MM/YYYY (start)     │  │ 📅  DD/MM/YYYY (end)       │
└────────────────────────────┘  └────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│  ‹  March 2026                April 2026                ›   │
│                                                             │
│  Sun Mon Tue Wed Thu Fri Sat │ Sun Mon Tue Wed Thu Fri Sat  │
│    1   2   3   4   5   6  7 │  29  30  31   1   2   3   4  │
│    8  ⬤  ░░  ░░  ░░  13 14 │   5   6   7   8   9  10  11 │  ← Range highlight
│          START → between → END (pill shape)                 │
└─────────────────────────────────────────────────────────────┘
```

**Optional — Presets + Footer**
```
┌─── Presets ────┬──────────────── Calendar ────────────────┐
│ • Today        │   ‹     March 2026       ›              │
│ • Yesterday    │                                          │
│ • Last 7 days  │   Sun Mon Tue ...                        │
│ • Last 30 days │   …                                      │
│ • This month   │                                          │
│ • Last month   │                                          │
│ • Custom       │                                          │
├────────────────┴──────────────────────────────────────────┤
│                            [ Clear ]  [ Cancel ]  [Apply] │ ← Footer
└───────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Label** | Field label. Semibold 13 px, optional red `*` for required. |
| **Date Input** | Read-and-write text field. Leading calendar glyph, `DD/MM/YYYY` placeholder, value in the same mask. Focus border = 2 px `Border-Accent`. For Range, two inputs render side-by-side (start + end). |
| **Calendar Popover** | Surface that appears below the input (8 px offset). `BG-Primary-alt`, 8 px radius, 1 px border, `Shadow-Medium`. |
| **Header** | Month + year label (Semibold 14 px) with `‹` / `›` chevrons to move by month. Clicking the month-year label opens month/year picker. |
| **Weekday Row** | Sun–Sat abbreviations (12 px, `Text-Tertiary`). |
| **Day Grid** | 7-column grid of day numbers. Current month = `Text-Primary`, outside-month = `Text-Disabled`, weekends inherit `Text-Primary`. |
| **Selected Day** | Single: filled circle, `BG-Accent` + `Text-Inverse`. Range: start/end = filled pills, days between = `BG-Accent-Subtle` rectangle. |
| **Preset Selector** | Optional left column in the popover with quick-select items (Today, Last 7 days, etc.). Toggleable via `Show Presets`. |
| **Footer** | Optional action row with `Clear`, `Cancel`, `Apply` buttons. Toggleable via `Show Footer`. |

---

## Variants

### Type

| Value | Description |
|---|---|
| `Single` | One input, one calendar. Selecting a day immediately commits the value (or requires Apply if `Show Footer = true`). |
| `Range` | Two inputs (start, end) + dual calendar (current month + next month). First click sets the start, second click sets the end. Days between the two endpoints render with a range highlight. |

### State

| Value | Description |
|---|---|
| `Closed` | Only the input(s) render. Calendar popover is hidden. |
| `Open` | Input is focused; calendar popover is mounted and anchored to the input. |

### Variant Matrix

- **2 Type** × **2 State** = **4 variants**
- Multiplied by runtime toggles: `Show Presets` × `Show Footer` × validation state.

---

## Component Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `Label` | `text` | `"Select Date"` | Field label text shown above the input(s). |
| `Show Presets` | `boolean` | `false` | Render the preset quick-select column inside the popover. |
| `Show Footer` | `boolean` | `false` | Render the `Clear` / `Cancel` / `Apply` action row at the bottom of the popover. |

---

## Props / API

### Date Picker

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'single' \| 'range'` | `'single'` | Selection model. `range` renders two inputs and a dual calendar. |
| `value` | `Date \| null \| [Date \| null, Date \| null]` | `null` | Controlled value. Single → `Date`; Range → `[start, end]`. |
| `onChange` | `(value) => void` | — | Fires when the selection changes. For Range, fires once both endpoints are set (or immediately per-endpoint if `Show Footer = false`). |
| `label` | `string` | `"Select Date"` | Field label. |
| `required` | `boolean` | `false` | Appends a red `*` to the label. |
| `isDisabled` | `boolean` | `false` | Disables the inputs and prevents the popover from opening. |
| `validationState` | `'none' \| 'success' \| 'error'` | `'none'` | Drives border colour and helper-row icon/text. |
| `helperText` | `string` | — | Helper or validation message below the input. |
| `placeholder` | `string` | `"DD/MM/YYYY"` | Input placeholder. For Range, use `placeholderStart` / `placeholderEnd`. |
| `format` | `string` | `"DD/MM/YYYY"` | Display format for the input value. Locale-aware. |
| `minDate` | `Date` | — | Earliest selectable date. Days before are disabled in the grid. |
| `maxDate` | `Date` | — | Latest selectable date. |
| `disabledDates` | `(date: Date) => boolean` | — | Predicate to disable specific days (e.g. weekends, holidays). |
| `showPresets` | `boolean` | `false` | Show the preset-shortcut column in the popover. |
| `presets` | `Preset[]` | Defaults | Override the default preset list (Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, Custom). |
| `showFooter` | `boolean` | `false` | Show the Apply / Cancel / Clear footer. When `true`, the picker becomes "staged" — user selections are uncommitted until Apply. |
| `applyLabel` / `cancelLabel` / `clearLabel` | `string` | `"Apply"` / `"Cancel"` / `"Clear"` | Footer button labels. |
| `weekStartsOn` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6` | `0` (Sun) | First day of the week in the grid. |
| `locale` | `string` | `"en"` | BCP 47 locale tag for month / weekday labels. |
| `numberOfMonths` | `1 \| 2` | `type === 'range' ? 2 : 1` | Override the number of calendar panels shown. |
| `isOpen` / `onOpenChange` | `boolean` / `(open: boolean) => void` | `false` | Controlled open state. |
| `rtl` | `boolean` | `false` | Mirrors the layout for right-to-left reading order. |

### `Preset` shape

| Key | Type | Description |
|---|---|---|
| `id` | `string` | Unique preset id. |
| `label` | `string` | Visible label (e.g. "Last 7 days"). |
| `getRange` | `() => Date \| [Date, Date]` | Function returning the preset's value at activation time. |

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Primary-alt` | Input background; popover background |
| `Background/BG-Accent` | Selected day fill (Single); range endpoints (Range) |
| `Background/BG-Accent-Subtle` | Days between range endpoints |
| `Background/BG-Hover` | Day cell hover |
| `Background/BG-Disabled` | Disabled input background |
| `Border/Border-Secondary` | Input default border; popover border |
| `Border/Border-Accent` | Focused input border (2 px) |
| `Border/Border-Error` | Error input border |
| `Text/Text-Primary` | Input value, current-month day numbers, header title |
| `Text/Text-Placeholder` | Input placeholder (`DD/MM/YYYY`) |
| `Text/Text-Tertiary` | Weekday-row abbreviations, helper text |
| `Text/Text-Disabled` | Outside-month days; disabled days (min/max/disabledDates) |
| `Text/Text-Inverse` | Day number on a selected cell (on `BG-Accent`) |
| `Text/Text-Link` | Header chevrons + month-year label (clickable) |
| `Text/Text-Error` | Required `*`; error helper text |
| `Shadow/Shadow-Medium` | Popover drop shadow |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/4` | 4 px | Weekday-row vertical gap; footer button inner gap |
| `spacing/8` | 8 px | Input ↔ popover gap; input horizontal padding; day-cell gap |
| `spacing/12` | 12 px | Popover internal padding |
| `spacing/16` | 16 px | Header padding; footer padding |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-6` | 6 px | Input box |
| `border-radius/radius-8` | 8 px | Popover outer corners |
| `border-radius/radius-full` | 999 px | Selected-day pill / circle |

---

## Typography

| Element | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Label | Zoho Puvi | 13 px | Semibold (600) | 20 px |
| Input value / placeholder | Zoho Puvi | 14 px | Regular (400) | 20 px |
| Popover header (month-year) | Zoho Puvi | 14 px | Semibold (600) | 20 px |
| Weekday row | Zoho Puvi | 12 px | Medium (500) | 16 px |
| Day number | Zoho Puvi | 13 px | Regular (400) | 20 px |
| Day number (selected) | Zoho Puvi | 13 px | Medium (500) | 20 px |
| Preset item | Zoho Puvi | 13 px | Regular (400) | 20 px |
| Footer button | Zoho Puvi | 13 px | Medium (500) | 20 px |

---

## Spacing & Sizing Reference

| Property | Value |
|---|---|
| Input width | **240 px** (single); **2 × 240 px + 8 px gap** (range) |
| Input height | 32 px |
| Input corner radius | 6 px |
| Popover width (single month) | **280 px** |
| Popover width (dual month) | **568 px** (2 × 280 px + 8 px internal gap) |
| Popover corner radius | 8 px |
| Day cell size | 32 × 32 px |
| Selected-day pill / circle | 28 × 28 px centred inside the cell |
| Preset column width | 160 px |
| Footer height | 48 px |
| Popover offset from input | 8 px (below) |
| Default border stroke | 1 px |
| Focus border stroke | **2 px** |

---

## Usage

### When to use

- When users must select a **specific calendar date** (date of birth, due date, appointment).
- When users must select a **span of dates** (report range, booking, date filter) → use `type="range"`.
- When **presets** (Today, Last 7 days, This month) cover the majority of cases → enable `showPresets`.
- When the selection must be confirmed before being applied (filters, batch operations) → enable `showFooter`.

### When not to use

- For **single-day recurring selection** (day-of-week) → use [Checkbox Group](./checkbox-group.md) or [Radio Group](./radio-group.md).
- For **date + time** input → use a DateTime Picker (combines this with a time input).
- For **free-form text dates in prose** → use a plain [Text Input](./text-input.md).
- For **scheduling multiple discrete dates** → use a multi-date calendar pattern (not covered by this component).

### Do / Don't

| Do | Don't |
|---|---|
| Use `type="range"` when start and end dates are both required | Use two independent Single pickers for a date range — they cannot enforce end ≥ start |
| Surface common spans as presets (Today, Last 7 / 30 days) | Hide presets behind the "Custom" option when ≥ 60 % of users pick one of them |
| Enable `showFooter` when the picker drives an expensive operation (report, query) | Enable Footer for inline form fields where immediate commit is expected |
| Respect `minDate` / `maxDate` — disable invalid days, do not just error on apply | Let users pick an invalid date and only reject it on form submit |
| Mirror the weekday row and grid order in RTL | Flip only the input without mirroring the calendar grid |
| Keep input format consistent with the locale (`DD/MM/YYYY` for most of APAC/EU, `MM/DD/YYYY` for en-US) | Hard-code one format globally |
| Announce the selected date on selection | Rely on visual highlight alone — non-sighted users will not know the selection changed |
| Close the popover after Apply (or after a single-click selection when no Footer) | Leave the popover open after commit — the user has already moved on |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Element** | The input is a native `<input type="text">` with a pattern mask, or `<input type="date">` as a progressive-enhancement baseline. The popover is a `role="dialog" aria-modal="false"` anchored to the input. |
| **Label association** | Connect `<label for="id">` to the input. For Range, use a `<fieldset>` + `<legend>` with two labelled inputs inside (`Start date`, `End date`). |
| **Calendar grid semantics** | Use `role="grid"` on the day grid, `role="row"` on each week, `role="gridcell"` on each day, `role="columnheader"` on weekday abbreviations. Mark the current day with `aria-current="date"`. |
| **Keyboard — input** | Direct typing in `DD/MM/YYYY` format; `Down Arrow` or `Space` opens the popover; `Esc` closes. |
| **Keyboard — grid** | `Arrow Left/Right` moves ±1 day; `Arrow Up/Down` ±1 week; `PageUp/PageDown` ±1 month; `Shift+PageUp/PageDown` ±1 year; `Home/End` jump to the start/end of the week; `Enter` / `Space` selects the focused day. |
| **Focus management** | Opening the popover moves focus to the currently selected day (or today if none). Closing returns focus to the input. Footer actions follow in tab order after the grid. |
| **Selected state** | Set `aria-selected="true"` on selected day cells. For Range, also set `aria-selected="true"` on days between the endpoints and announce them as part of the range. |
| **Live announcement** | On month navigation, announce the new month/year via `aria-live="polite"` on a hidden status node. |
| **Range completion** | When the user has picked a start date but not an end date, the input's `aria-describedby` should say "End date required". |
| **Validation** | Set `aria-invalid="true"` in Error state; link the helper message via `aria-describedby`. |
| **Contrast** | Selected-day text on `BG-Accent` must meet WCAG AA 4.5:1. Outside-month days use `Text-Disabled` — verify against grid background. |
| **RTL** | Mirror the weekday-row order, chevron direction, and Range input order (end on the left, start on the right). |
| **Time zones** | Always store UTC internally; format on display. The component must not shift the selected date due to the local time-zone offset. |

---

## Code Examples

### Basic — Single date

```tsx
const [date, setDate] = useState<Date | null>(null);

<DatePicker
  label="Due date"
  value={date}
  onChange={setDate}
  required
/>
```

### Range

```tsx
const [range, setRange] = useState<[Date | null, Date | null]>([null, null]);

<DatePicker
  type="range"
  label="Report period"
  value={range}
  onChange={setRange}
  required
/>
```

### With presets + footer (staged commit)

```tsx
<DatePicker
  type="range"
  label="Report period"
  value={range}
  onChange={setRange}
  showPresets
  showFooter
/>
```

### Min / Max bounded

```tsx
<DatePicker
  label="Appointment date"
  value={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={addDays(new Date(), 90)}
/>
```

### Weekends disabled

```tsx
<DatePicker
  label="Working day"
  value={date}
  onChange={setDate}
  disabledDates={d => [0, 6].includes(d.getDay())}
/>
```

### Custom presets

```tsx
<DatePicker
  type="range"
  showPresets
  showFooter
  presets={[
    { id: 'today', label: 'Today', getRange: () => [startOfDay(), endOfDay()] },
    { id: 'yesterday', label: 'Yesterday', getRange: () => [startOfYesterday(), endOfYesterday()] },
    { id: 'thisQuarter', label: 'This quarter', getRange: () => [startOfQuarter(), endOfQuarter()] },
  ]}
/>
```

### Error state

```tsx
<DatePicker
  label="Due date"
  value={date}
  onChange={setDate}
  validationState="error"
  helperText="Due date must be in the future."
  required
/>
```

### Localised (German, Monday-first)

```tsx
<DatePicker
  label="Geburtsdatum"
  locale="de-DE"
  weekStartsOn={1}
  format="DD.MM.YYYY"
/>
```

### RTL (Arabic)

```tsx
<DatePicker
  label="التاريخ"
  rtl
  locale="ar"
  weekStartsOn={6}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Calendar](./calendar.md) | Always-visible calendar for scheduling views — no input trigger |
| [Text Input](./text-input.md) | Free-form date-as-text (for literature, prose) |
| [Dropdown Menu](./dropdown-menu.md) | Selecting from a finite list of discrete dates (e.g. scheduled meeting slots) |
| [Checkbox Group](./checkbox-group.md) | Selecting days-of-week for recurrence patterns |
