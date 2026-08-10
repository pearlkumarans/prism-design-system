# Time Picker

Set a time of day — type it directly (`9:30 pm`, `930`, `14:00`) or pick from a stepped list. Canonical `value` is locale-independent **24-hour `HH:mm`** (e.g. `"14:30"`); the display is formatted per `hour-cycle` (12 → `2:30 PM`, 24 → `14:30`). Composes with `<ds-date-picker>` into a datetime picker.

Two Phase-1 panel variants (one primitive, like `<ds-button-group>`):

- **`variant="list"`** *(default)* — a `<ds-text-input>` trigger + an anchored popover **listbox** of times at a `step` interval. The field is **editable** and parses typed entry forgivingly. Best for scheduling / forms.
- **`variant="inline"`** — a self-contained segmented `HH : MM (AM/PM)` field with per-key spin editing (type digits, auto-advance) and a stepper column. No popover. Compact, keyboard-first.

## Anatomy

**List variant** — three field regions (delegated to `<ds-text-input>`):

1. **Input container** — wrapper with border, radius, and focus ring; holds the icon and input; reacts to hover / focus / error / disabled. Width scales with `size` (160 / 180 / 200).
2. **Clock icon** — leading affordance; clicking the field opens the list.
3. **Input** — editable text field; shows the selected time formatted per `hour-cycle`, falls back to the placeholder.

**Inline variant** — `[ HH ] : [ MM ] [ AM/PM ]` segments (each `role="spinbutton"`) + a chevron stepper column (two `ds-icon-button`s, `chevron-up` / `chevron-down`) that acts on the focused segment. In `type="range"` it shows two segment groups separated by a dash (`HH:MM – HH:MM`); arrow keys and typing flow across both.

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `variant` | `list` \| `inline` | `list` | list = trigger + popover listbox; inline = segmented field with steppers |
| `type` | `single` \| `range` | `single` | `range` picks a start–end window. **List:** a two-step flow in one field — pick Start, then End (times after start). **Inline:** two segment groups `HH:MM – HH:MM` (end must be after start). Value is `"HH:mm/HH:mm"`. |
| `value` | `"HH:mm"` (24h), or `"HH:mm/HH:mm"` for range | — | e.g. `"09:30"`, `"14:00"`, or `"09:00/17:00"`. Locale-independent canonical value. |
| `hour-cycle` | `12` \| `24` | `12` | Display format. Value is always stored 24-hour. |
| `step` | minutes (int) | `30` | Interval between list options (list variant). Common: 5, 10, 15, 30, 60. |
| `min`, `max` | `"HH:mm"` | — | Inclusive bounds. Options and typed entry outside the range are rejected. |
| `size` | `small` \| `medium` \| `large` | `medium` | Field size — mirrors `ds-text-input` (36 / 40 / 44px; large bumps font to 16px). List width 160 / 180 / 200. |
| `label` | string | `"Select time"` | Field label |
| `label-position` | `none` \| `top` \| `left` | `left` | Hidden (kept as `aria-label`) / stacked above / inline 220px column. Left auto-stacks when narrow. |
| `placeholder` | string | derived | `HH:MM AM/PM` (12h) or `HH:MM` (24h) |
| `show-now` | boolean | off | Pins a `Now · <time>` row at the top of the list |
| `clearable` | boolean | off | Shows a clear (×) control when the field has a value — resets it to empty and emits `ds-time-picker-change` with an empty value. |
| `required` | boolean | off | Adds red `*` to the label |
| `disabled` | boolean | off | Disables the field |
| `helper-text` | string | — | Helper row below the field |
| `validation-state` | `none` \| `success` \| `error` | `none` | Drives border + helper colour |
| `rtl` | boolean | off | Mirrors layout + arrow-key direction |
| `open` | boolean | off | Controlled open state (list variant) |

## Properties

| Property | Type | Notes |
|---|---|---|
| `value` | `string` | `"HH:mm"` (24h), or `"HH:mm/HH:mm"` for range. Getter/setter. |
| `disabledTimes` | `Array<"HH:mm">` \| `(mins:number) => boolean` | Individual times (or a predicate on minutes-since-midnight) to disable. |
| `presets` | `Array<{ label, value }>` | Named quick-picks pinned at the top of the list. `value` is `"HH:mm"` (single) or `"HH:mm/HH:mm"` (range). |

## Events

| Event | detail | When |
|---|---|---|
| `ds-time-picker-change` | single: `{ value, hours, minutes }` · range: `{ value, start, end }` | Selection committed (pick, valid typed entry, inline edit) |
| `ds-time-picker-input` | `{ raw }` | Live typing in the list field |
| `ds-time-picker-open` | — | Popover opens |
| `ds-time-picker-close` | — | Popover closes (Escape, outside click, select) |

## Accessibility

- **List** — the field is an editable **combobox** (`role="combobox"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`); options are `role="option"` + `aria-selected`. Keyboard: ↓ opens · ↑ ↓ move the active option · Enter selects · Esc closes · Home / End · Tab closes. Typing filters the list.
- **Inline** — each segment is `role="spinbutton"` (`aria-valuemin/max/now/text`). ↑ ↓ increment/decrement with wrap · ← → move between segments · type digits (auto-advance + clamp) · AM/PM toggles with `A` / `P` or ↑ ↓.
- State is conveyed by border + text + icon, never colour alone. Visible focus ring (`--uems-border-accent-focus`). Motion gated on `prefers-reduced-motion`.

## Typed entry (list)

The list field is forgiving — all of these parse: `9`, `9:30`, `930`, `0930`, `1430`, `2:30 pm`, `2p`, `12:00am`. Invalid or out-of-bounds entry reverts to the last valid value on blur.

## Tokens

Border `--uems-border-tertiary`; option hover / active `--uems-bg-primary-hover`; selected `--uems-text-accent` / `--uems-bg-button-primary`; focus ring `--uems-border-accent-focus`; disabled `--uems-bg-disabled` / `--uems-text-disabled`; radius `--uems-radius-default`. No hardcoded values — re-themes across all modes.

## Do / Don't

- **Do** set `step` to the scheduling granularity (15 for meetings, 5 for fine control).
- **Do** use `hour-cycle="24"` for infrastructure, logs, and cron-style contexts.
- **Do** give `min`/`max` for constrained windows (business hours, maintenance windows).
- **Don't** use it for a **duration** (that's a number field), or hand-roll AM/PM — this component owns the state, keyboard, and ARIA.
