# Date Picker

Trigger input(s) plus a rich popover combining preset shortcuts, calendar, time pickers, and a Done action. Reuses `<ds-calendar>` and `<ds-button>`. Three popover modes:

- **Time-only presets** (`Today`, `Yesterday`, `Last 7 days`, `Last 30 days`, `This week`, `Last month`) — relative date is implied by the preset; only time inputs are shown.
- **Specific date** — single calendar + start/end time inputs.
- **Custom range** — dual calendar + start/end time inputs.

**Figma source:** UEMS Design System 3.0 · Node `17195:1122073`

## Anatomy

The trigger field is composed of three regions (delegated to `<ds-text-input>`, so it stays in lock-step with the text field's styling and sizes):

1. **Input container** — wrapper with border, radius, and focus ring. Holds the icon and input; reacts to hover, focus, error, and disabled states. Width is driven by `size` (single 210 / 240 / 268, range 288 / 320 / 352) and stretches with `full-width`.
2. **Calendar icon** — leading affordance signalling the field opens a picker. Clicking it (or the field) toggles the popover.
3. **Input** — read-only text input displaying the selected date in `DD/MM/YYYY` format; falls back to the placeholder when empty.

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `value` | ISO date, `start/end`, or `YYYY-MM-DDThh:mm` | — | `2026-04-15` (single), `2026-04-09/2026-04-22` (range), or `2026-04-15T14:30` (datetime, when `enable-time`) |
| `enable-time` | boolean | unset | **Datetime mode** (single type): embeds an inline `ds-time-picker` below the calendar. Value gains a `T HH:mm` suffix; the field shows `DD/MM/YYYY HH:MM AM/PM`. The popover stays open after a date pick so the time can be set. |
| `hour-cycle` | `12` \| `24` | `12` | Time display format for datetime mode. |
| `time-step` | minutes (int) | `30` | Minute interval for the embedded time picker. |
| `time-label` | string | `"Time"` | Label shown beside the embedded time picker. |
| `start-time`, `end-time` | `"HH:MM AM/PM"` | — | Time picker values |
| `active-preset` | preset id | `specific` | Which preset is active in the popover |
| `label` | string | `"Select Date"` | Field label |
| `label-position` | `none` \| `top` \| `left` | `left` | Label inline in a 280px column (left), stacked above (top), or hidden with the text kept as `aria-label` (none). A left label auto-stacks below 640px. |
| `size` | `small` \| `medium` \| `large` | `medium` | Field size — mirrors `ds-text-input` (36 / 40 / 44px height; large bumps font to 16px). Trigger width scales too: single 210 / 240 / 268, range 288 / 320 / 352. `full-width` overrides the width at any size. |
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
| `ds-date-picker-change` | single: `{ type, value }` · range: `{ type, value, start, end }` · datetime: `{ type, value, date, time }` | Selection committed |
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
