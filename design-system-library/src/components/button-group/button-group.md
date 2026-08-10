# `<ds-button-group>`

A group of value-bearing buttons — a **segmented picker** (single), a **multi-select
toggle grid** (months / weekdays), or an **action toolbar** (none). One primitive, three
selection modes, each wired to the correct WAI-ARIA pattern. Light-DOM, token-driven.

Use it for a compact set (≈2–12) of short options meant to be seen at once. For long
lists or long labels use `ds-input-select`; for a vertical form list with descriptions use
`ds-radio-group` / `ds-checkbox-group`; for view/panel navigation use `ds-tab-bar-*`.

```html
<ds-button-group selection-mode="multi" variant="attached" layout="grid" columns="6" label="Repeat"></ds-button-group>
<script>
  el.items = MONTHS.map((m) => ({ value: m, label: m }));
  el.values = ['Jan', 'Feb', 'Apr'];
  el.addEventListener('ds-button-group-change', (e) => save(e.detail.values));
</script>
```

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `selection-mode` | `single` \| `multi` \| `none` | `single` | Semantics: radiogroup / toggle group / action group |
| `layout` | `row` \| `grid` \| `column` | `row` | `grid` pairs with `columns` |
| `columns` | integer | — | Grid track count (6 = months, 7 = weekdays) |
| `variant` | `separated` \| `attached` | `separated` | Gapped chips vs. a connected, no-gap control (works for rows **and** grids) |
| `size` | `small` \| `medium` \| `large` | `medium` | |
| `value` | string / comma list | — | Reflected selection (single = one value; multi = comma list) |
| `equal` | boolean | off | Items share equal width (row) |
| `full-width` | boolean | off | Group stretches to its container; implies `equal` (row segments split evenly) |
| `disabled` | boolean | off | Disables the whole group |
| `label` | string | — | Accessible name for the group (shown as a visible header caption when `show-select-all` is on) |
| `show-select-all` | boolean | off | **Multi only.** Renders a header row above the group with a Select all / Deselect all toggle. Buttons move into an inner `__track`; the header shows the `label` and the toggle. |
| `select-all-label` / `deselect-all-label` | string | `Select all` / `Deselect all` | Override the toggle text (i18n). |
| `rtl` | boolean | off | Mirrors layout + arrow-key direction |

## Properties

| Property | Type | Notes |
|---|---|---|
| `items` | `Array<{ value, label?, icon?, disabled?, selected?, ariaLabel? }>` | Buffered if set before upgrade. `ariaLabel` is required for icon-only items. |
| `value` | `string` | Single selection (or comma list for multi). |
| `values` | `string[]` | Array view of the selection (getter + setter). |

### Methods

| Method | Notes |
|---|---|
| `selectAll()` | Multi only — selects every enabled item and emits `ds-button-group-change`. |
| `deselectAll()` | Multi only — clears the selection and emits change. |
| `toggleAll()` | Selects all if any enabled item is unselected, else deselects all. Backs the `show-select-all` toggle. |

## Events

| Event | Detail | Fires when |
|---|---|---|
| `ds-button-group-change` | `{ value }` (single) / `{ values }` (multi) | Selection changes (order follows `items`). |
| `ds-button-group-item-click` | `{ value }` | A button is activated in `none` (action) mode. |

## Accessibility

| Mode | Container role | Item | Keyboard |
|---|---|---|---|
| `single` | `radiogroup` + `aria-label` | `role="radio"` · `aria-checked` | ← → / ↑ ↓ move **and** select · Home/End |
| `multi` | `group` + `aria-label` | `<button>` · `aria-pressed` | Arrows move · **Space/Enter** toggles · Home/End |
| `none` | `group` | `<button>` | Arrows move · Enter activates |

- **Roving tabindex** — the group is one Tab stop; arrows move focus inside. Focus stays in
  sync with mouse / programmatic focus via `focusin`.
- **Grid layout** maps ↑ ↓ to the row above/below (by `columns`), ← → within the row; RTL flips ← →.
- **Disabled** items are skipped by keyboard nav and excluded from `value` / `values`.
- **State** is conveyed by fill **and** text colour, never colour alone; visible focus ring
  (`--uems-border-accent-focus`). Transitions gated on `prefers-reduced-motion`.

## Variants & sizing

- **separated** *(default)* — bordered chips with a gap.
- **attached** — no gap; items collapse into a connected control with hairline 1px seams and
  rounded outer corners. Works for a single **row** and a multi-row **grid** alike. Hover is a
  background shift (an inset ring would clip on the rounded corners); focus keeps an inset ring.
- **sizes** `small` / `medium` *(default)* / `large` via spacing + font tokens.
- **layouts** `row` · `grid` (`columns`) · `column`.
- **width** — the group **hugs its content** by default (a grid is sized to its cells, never
  stretched). Set `full-width` to stretch to the container; on a row that also splits items into
  **equal** segments. `equal` on its own equalises the items without stretching.

## Tokens

Border `--uems-border-tertiary`; selected fill `--uems-bg-button-primary` on `--uems-icon-white`;
hover `--uems-bg-primary-hover` / `--uems-border-accent`; radius `--uems-radius-default`; focus
`--uems-border-accent-focus`; disabled `--uems-bg-disabled` / `--uems-text-disabled`. No hardcoded
values — re-themes across all modes.

## Do / Don't

- **Do** give icon-only items an `ariaLabel`.
- **Do** use `single` for mutually-exclusive picks (ordinal, view switch) and `multi` for
  independent toggles (months, weekdays).
- **Don't** use it for view navigation (that's `ds-tab-bar-*`) or for a long option list
  (that's `ds-input-select`).
- **Don't** hand-roll `aria-pressed` button grids — this component owns the state, keyboard,
  and ARIA once.
