# Date Picker

Trigger input(s) plus a rich popover combining preset shortcuts, calendar, time pickers, and a Done action. Reuses `<ds-calendar>` and `<ds-button>`. Three popover modes:

- **Time-only presets** (`Today`, `Yesterday`, `Last 7 days`, `Last 30 days`, `This week`, `Last month`) — relative date is implied by the preset; only time inputs are shown.
- **Specific date** — single calendar + start/end time inputs.
- **Custom range** — dual calendar + start/end time inputs.

**Figma source:** UEMS Design System 3.0 · Node `17195:1122073`

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `value` | ISO date or `start/end` | — | `2026-04-15` (single) or `2026-04-09/2026-04-22` (range) |
| `start-time`, `end-time` | `"HH:MM AM/PM"` | — | Time picker values |
| `active-preset` | preset id | `specific` | Which preset is active in the popover |
| `label` | string | `"Select Date"` | Field label |
| `label-position` | `none` \| `top` \| `left` | `left` | Label inline in a 280px column (left), stacked above (top), or hidden with the text kept as `aria-label` (none). A left label auto-stacks below 640px. |
| `full-width` | boolean | unset | Stretches the input(s) to fill the container, overriding the fixed trigger width (single 240 / range 320). |
| `required` | boolean | unset | Adds red `*` to label |
| `disabled` | boolean | unset | Disables inputs |
| `placeholder` | string | `"DD/MM/YYYY"` | Input placeholder |
| `format` | string | `"DD/MM/YYYY"` | Display format |
| `min`, `max` | ISO date | — | Bounds for the calendar |
| `show-presets` | boolean | `true` | Render preset column |
| `validation-state` | `none` \| `success` \| `error` | `none` | Drives input border + helper-text color |
| `helper-text` | string | — | Below the input |
| `rtl` | boolean | unset | Mirrors layout |
| `open` | boolean | unset | Controlled open state |

## Built-in presets

| id | Label | Kind | Pane shows |
|---|---|---|---|
| `today` | Today | time-only | Just time pickers |
| `yesterday` | Yesterday | time-only | Just time pickers |
| `last7` | Last 7 days | time-only | Just time pickers |
| `last30` | Last 30 days | time-only | Just time pickers |
| `thisWeek` | This week | time-only | Just time pickers |
| `lastMonth` | Last month | time-only | Just time pickers |
| `specific` | Specific date | single | Single calendar + time pickers |
| `range` | Custom range | range | Dual calendar + time pickers |

## Events

| Event | detail | When |
|---|---|---|
| `ds-date-picker-change` | `{ preset, value?, start?, end?, startTime, endTime }` | User clicks Done |
| `ds-date-picker-open`  | — | Popover opens |
| `ds-date-picker-close` | — | Popover closes (Escape, outside click, Done) |

## Composition

- Inner calendar = real `<ds-calendar>`. The picker passes `type="single|range"`, `min`, `max`, `rtl`, `value`.
- Done button = `<ds-button variant="primary" size="small">Done</ds-button>`.
- Time inputs = native `<select>` for hour / minute / AM-PM (4 minute steps: 00 / 15 / 30 / 45).
- Calendar marks Sun / Sat day cells with `[data-weekend="true"]`, picked up by `calendar.css` to render in `--text-error` (red).

## Behavior

- Selecting a relative preset (Today, Last 7 days, …) clears `value` and shows only the time inputs.
- Selecting Specific date / Custom range swaps the right pane to a calendar of the matching mode.
- Footer summary line reads `27 June, 2026 (12:00 AM - 12:00 PM)` for single, `9 July, 2026 - 13 July, 2026 (12:00 AM - 12:00 PM)` for range, and the preset label for time-only modes.
- Outside-click + Escape close the popover without firing change.
