# Calendar

A date picker panel for selecting a single date or a date range. Renders as an elevated dark panel with a token-driven cyan-blue selection accent. The visual treatment follows the spec while everything resolves through theme tokens, so themes still cascade.

**Figma source:** UEMS Design System 3.0 · Node `17189:1121070`

---

## Implementation

- `calendar.css` — BEM, token-driven (no hardcoded hex)
- `calendar.js` — `<ds-calendar>` custom element with full keyboard support

---

## API

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `type` | `single` \| `range` | `single` | Single date or two-month range picker |
| `value` | ISO date or `start/end` | — | `2026-04-15` (single) or `2026-04-09/2026-04-22` (range) |
| `show-footer` | boolean | unset | Adds Cancel / Apply buttons below the grid |
| `min` | ISO date | — | Earliest selectable date |
| `max` | ISO date | — | Latest selectable date |
| `rtl` | boolean | unset | Mirrors range-band direction |

### Events

| Event | Detail | When |
|-------|--------|------|
| `ds-calendar-change` | `{ value }` (single) or `{ start, end }` (range) | A day cell is clicked or selected via keyboard |
| `ds-calendar-cancel` | — | Footer cancel button or Escape key |
| `ds-calendar-apply` | `{ value }` or `{ start, end }` | Footer apply button |

### Keyboard

| Key | Action |
|-----|--------|
| ←/→ | Move focus by 1 day |
| ↑/↓ | Move focus by 1 week |
| Page Up/Page Down | Previous / next month |
| Home / End | First / last day of focused week |
| Enter / Space | Select focused date |
| Escape | Dispatch `ds-calendar-cancel` |

---

## Selection model

### Single
Click any day to select it. The previous selection clears. `value` reflects the chosen ISO date.

### Range
- Click 1 → starts a new range (`start` set, `end` cleared).
- Click 2 → completes the range; if earlier than `start`, the dates swap.
- Click 3 → starts a new range from that day.

Range mid-band is rendered with `--bg-secondary-solid` (subtle highlight) and the start/end day cells use `--bg-button-primary` for the filled accent circle.

---

## Visual tokens

| Element | Token |
|---------|-------|
| Panel background | `--bg-overlay-dark` (fallback `--bg-primary-solid`) |
| Panel shadow | `--shadow-lg` |
| Panel border | `--border-tertiary` |
| Day text (default) | `--text-placeholder` |
| Selected / range edges | `--bg-button-primary` + `--text-white` |
| In-range band | `--bg-secondary-solid` |
| Today ring | `--border-accent` |
| Disabled day | `--text-disabled` |

---

## Accessibility

- `role="dialog"` with `aria-label="Date picker"` (or "Date range picker").
- Date grid uses `role="grid"`, `role="row"`, `role="gridcell"`.
- The focused cell carries `tabindex="0"`; all others are `tabindex="-1"` so a single Tab moves into the grid.
- Selected days set `aria-selected="true"`; disabled days set `aria-disabled="true"`.
- Month label uses `aria-live="polite"` so screen readers hear month changes when navigation arrows are pressed.

---

## Out of scope

- Year picker (year grid view) — for now the only year navigation is via month chevrons.
- Time component — combine externally with a separate Time Picker component.
- Relative-date presets ("Last 7 days") — should live in a sibling Dropdown.
