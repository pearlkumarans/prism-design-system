# Dropdown Menu Component

**Design System:** UEMS Design System 3.0
**Figma Node:** `18386:13895` (Component Set)
**Page:** Dropdown Menu
**File:** UEMS - Design System 3.0
**Total Variants:** 10

---

## Overview

The Dropdown Menu is a floating surface that displays a list of options, actions, or selectable items in response to a trigger (button, input select, icon, kebab, avatar, etc.). It is the menu primitive used by Input Select, header user menus, table row actions, filter chips, and many other patterns across UEMS.

The component supports five distinct **Types** — `Default`, `Select`, `Multi-select`, `Action`, and `Select-tick` — each tailored to a different interaction pattern (simple action list, single-select with radio, multi-select with checkboxes, contextual actions with destructive item, and single-select with a tick mark).

Inner rows are instances of the `_Action Dropdown item` sub-component; the menu container only owns the surface, the optional title row, and the optional footer row.

---

## Variant Axes

| Property | Values | Description |
|----------|--------|-------------|
| **Type** | `Default`, `Select`, `Multi-select`, `Action`, `Select-tick` | Controls item composition and selection semantics. |
| **RTL** | `False`, `True` | Mirrors layout for right-to-left languages and swaps inner items to their RTL labels. |

5 (Type) × 2 (RTL) = **10 variants**

### Type behavior

| Type | Items | Use For |
|------|-------|---------|
| **Default** | 4 plain rows. No selection control, no leading icon, no chevron. | Simple action lists like *Profile / Settings / Help / About*. |
| **Select** | Radio rows. One item is `Selected` (filled radio). Mutually exclusive. | Sort orders, filter pickers, single-choice settings. |
| **Multi-select** | Checkbox rows. Independent toggles. Pairs with footer `Apply / Cancel` and optional `Select all / Clear all`. | Filter sets, tag selectors, batch selection. |
| **Action** | Rows with leading icons and trailing chevrons. Last row is a destructive (red) action separated by a divider. | Contextual menus like *Edit / Duplicate / Share / Delete*. |
| **Select-tick** | Plain rows with a trailing tick (✓) marking the selected item. | Single-selection menus where a radio is too heavy (filter chips, "View as" menus). |

---

## Web Component API

```html
<ds-dropdown-menu
  type="default|select|multi-select|action|select-tick"
  show-title title="Menu"
  show-footer
  show-select-all show-clear-all show-apply show-cancel
  select-all-text="Select all" clear-all-text="Clear all"
  apply-label="Apply" cancel-label="Cancel"
  rtl
  open></ds-dropdown-menu>
```

### Methods

| Method | Notes |
|--------|-------|
| `open()` / `close()` / `toggle()` | Control visibility (mirrors the `open` attribute). |
| `positionFrom(trigger, opts?)` | Fixed-position the panel next to `trigger` (an element or DOMRect-like), clamping on screen. `opts`: `{ gap=6, margin=8, align: 'right'\|'left'\|'before', vAlign: 'below'\|'top' }`. **align** (horizontal): `right` (default) / `left` align the panel's right/left edge with the trigger; **`before`** opens the panel entirely to the left of the trigger — use it for right-edge action ⋯ columns so other rows' icons aren't covered. **vAlign** (vertical): `below` (default) drops the panel below the trigger, **flipping above** when there's no room; **`top`** lines the panel's top edge up with the trigger's top (for side-opening action menus), clamping up near the viewport bottom so it never clips. |
| `openFrom(trigger, opts?)` | `open()` then `positionFrom()` — the standard way to anchor a row/action menu to its trigger. |

### Properties (DOM-only)

| Property | Type | Notes |
|----------|------|-------|
| `items` | `Array<Item>` | Item objects: `{ label, value, selected?, disabled?, icon?, danger?, linkStyle?, sub?, badge?, shortcut?, description?, actions? }`. Use `{ type: 'heading', label }` and `{ type: 'divider' }` to inject section structure. |

`selected` marks a row active (accent wash + accent label) in any type — use it to show which item is currently in effect. `linkStyle: true` renders the row as a **text link** (accent label + icon, underline on hover) while keeping normal menuitem behaviour — for a create/add entry that should read as an action, not a plain row.

`actions` gives a row **trailing hover-actions** — `[{ id, icon, label, danger? }]`. They stay hidden until the row is hovered or focused, then fade in as small icon-buttons at the row's end. Clicking one emits `ds-dropdown-action` (`{ actionId, value, item }`) and closes the menu — it does **not** trigger the row's own select. Use for per-row share/edit/delete on saved items.

They are **keyboard-operable** by roving focus (Tab still exits the menu, per the ARIA menu pattern): from a focused row press **→** to enter the actions, **←/→** to move between them (← from the first returns to the row), **Enter/Space** to activate, and **↑/↓/Home/End/Esc** to hand control back to row navigation. Buttons carry an `aria-label` from `label`.

A **heading** item may carry a trailing text-link action — `{ type: 'heading', label, action: { id, label } }` — rendered on the heading's right (e.g. a "Clear all" link beside a "Saved filters" title). Clicking it emits `ds-dropdown-action` (`{ actionId, value: null, item: null }`) and closes the menu.

Set **`data-no-truncate`** on the host (`<ds-dropdown-menu data-no-truncate>`) so row labels show in full — the menu hugs content with a wider cap instead of ellipsizing. Scoped to that attribute, so other menus keep truncating long labels.

### Boolean attribute defaults

| Attribute | Default |
|-----------|---------|
| `show-title` | `false` |
| `show-footer` | Auto-on for `multi-select`; `false` otherwise |
| `show-select-all` | `true` (Multi-select only) |
| `show-clear-all` | `false` (Multi-select only) |
| `show-apply` | `true` (Multi-select only) |
| `show-cancel` | `true` (Multi-select only) |
| `rtl` | `false` |
| `open` | `false` |

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-dropdown-select` | `{ value, item }` | Default / Action / Select / Select-tick row activated. |
| `ds-dropdown-action` | `{ actionId, value, item }` | A row's trailing hover-action (from `item.actions`) was clicked. Menu closes; the row's own select does not fire. |
| `ds-dropdown-toggle` | `{ value, selected, values, item }` | Multi-select row toggled (live, menu stays open). |
| `ds-dropdown-apply` | `{ values }` | Multi-select footer Apply pressed. Closes the menu. |
| `ds-dropdown-cancel` | — | Multi-select footer Cancel pressed. Closes the menu. |
| `ds-dropdown-select-all` | — | Footer Select-all link pressed. |
| `ds-dropdown-clear` | — | Footer Clear-all link pressed. |
| `ds-dropdown-close` | — | Menu closed (Escape or programmatic). |

### Legacy type aliases

`single` → `default` · `multi` → `multi-select` · `sections` → `default` (sections still work via `{ type: 'heading' | 'divider' }` items).

---

## Anatomy

### Default (no title, no footer)

```
┌──────────────────────────────────┐
│  Profile                         │
│  Settings                        │
│  Help                            │
│  About                           │
└──────────────────────────────────┘
```

### Select / Select-tick (single-selection)

```
┌──────────────────────────────────┐
│  ●  Newest first      ← Selected │
│  ○  Oldest first                 │
│  ○  Name (A → Z)                 │
│  ○  Name (Z → A)                 │
└──────────────────────────────────┘
```

```
┌──────────────────────────────────┐
│     Newest first         ✓       │  ← Select-tick variant
│     Oldest first                 │
│     Name (A → Z)                 │
└──────────────────────────────────┘
```

### Multi-select (checkbox rows + footer actions)

```
┌──────────────────────────────────┐
│  ☑  Active users                 │
│  ☐  Inactive users               │
│  ☑  Suspended                    │
│  ────────────────────────────    │
│  Select all  Clear all   Cancel  │
│                          Apply   │
└──────────────────────────────────┘
```

### Action (icons + destructive item)

```
┌──────────────────────────────────┐
│  ✎   Edit                        │
│  ⊞   Duplicate                   │
│  ↗   Share                       │
│  ────────────────────────────    │
│  🗑  Delete                      │  ← Danger action
└──────────────────────────────────┘
```

### With Title and Footer

```
┌──────────────────────────────────┐
│  Menu                            │  ← Title row (Show Title)
│  ────────────────────────────    │
│  Profile                         │
│  Settings                        │
│  Help                            │
│  ────────────────────────────    │
│  Sign out                        │  ← Footer (Show Footer)
└──────────────────────────────────┘
```

---

## Container Style — Dev Handoff

| Property | Value | Token |
|----------|-------|-------|
| Width | `240px` (fixed) | — |
| Min height | hug (sized to children) | — |
| Padding (top / bottom) | `4px / 4px` | `Spacing-1` |
| Padding (left / right) | `0 / 0` | — |
| Corner radius | `8px` | `radius-8` |
| Background fill | `#FFFFFF` | `BG-Surface-elevated` |
| Border | `1px solid #E1E4EB` | `Border-Surface-default` |
| Drop shadow | `0 4px 12px rgba(0, 0, 0, 0.12)` | `Shadow-Dropdown` |
| Layout | `column` (vertical auto-layout) | — |
| Item gap | `0` (rows are flush; visual separation is via row hover state) | — |

### Item Row

| Property | Value | Token |
|----------|-------|-------|
| Row height | `32px` | — |
| Padding (left / right) | `12px / 12px` | `Spacing-3` |
| Padding (top / bottom) | `8px / 8px` | `Spacing-2` |
| Inner gap | `8px` | `Spacing-2` |
| Selection control size | `16×16px` | — |
| Leading / trailing icon size | `16×16px` | — |
| Label font | Zoho Puvi 14px / 20px Regular | `Body-Medium` |
| Label color (Default) | `#15181E` | `Color-Text-Primary` |
| Label color (Danger) | `#E42527` | `Color-Text-Critical` |
| Label color (Disabled) | `#5F6C89 @ 50%` | `Color-Text-Disabled` |

### Row States

| State | Background | Label color | Cursor |
|-------|------------|-------------|--------|
| Default | transparent | `Color-Text-Primary` | `pointer` |
| Hover | `#F0F2F5` | `Color-Text-Primary` | `pointer` |
| Focus | transparent + 2px `Border-Focus` inset ring | `Color-Text-Primary` | `pointer` |
| Active / Pressed | `#E1E4EB` | `Color-Text-Primary` | `pointer` |
| Selected (Select / Multi-select / Select-tick) | transparent (control conveys selection) | `Color-Text-Primary` | `pointer` |
| Disabled | transparent | `Color-Text-Disabled` (50% alpha) | `not-allowed` |
| Danger (Action's last row) | transparent (Default), `#FCE9E9` on hover | `Color-Text-Critical` | `pointer` |

### Dividers

| Property | Value | Token |
|----------|-------|-------|
| Height | `1px` | — |
| Color | `#E1E4EB` | `Border-Surface-default` |
| Margin | `4px 0` | — |

### Footer Row

| Property | Value | Token |
|----------|-------|-------|
| Height | `40px` | — |
| Padding (left / right) | `12px / 12px` | `Spacing-3` |
| Inner gap | `8px` between buttons; `space-between` for split footers | `Spacing-2` |
| Footer link color | `#0C66E4` | `Color-Text-Link` |
| Apply button | Primary button, Small size | `Button/Primary/Small` |
| Cancel button | Secondary button, Small size | `Button/Secondary/Small` |

---

## Design Tokens Used

| Token | Usage | Resolved value |
|-------|-------|----------------|
| `BG-Surface-elevated` | Container background | `#FFFFFF` |
| `BG-Surface-hover` | Row hover background | `#F0F2F5` |
| `BG-Surface-pressed` | Row pressed/active background | `#E1E4EB` |
| `BG-Critical-subtle` | Danger row hover background | `#FCE9E9` |
| `Border-Surface-default` | Container stroke + dividers | `#E1E4EB` |
| `Border-Focus` | Focus ring on row | `#2C66DD` |
| `Shadow-Dropdown` | Container drop shadow | `0 4px 12px rgba(0,0,0,0.12)` |
| `Color-Text-Primary` | Item label (default) | `#15181E` |
| `Color-Text-Subtle` | Title row text | `#5F6C89` |
| `Color-Text-Critical` | Danger item label | `#E42527` |
| `Color-Text-Link` | Footer link text | `#0C66E4` |
| `Color-Text-Disabled` | Disabled item label | `#5F6C89 @ 50%` |
| `radius-8` | Container corner radius | `8px` |
| `Spacing-1` (4px) | Container vertical padding | `4px` |
| `Spacing-2` (8px) | Row vertical padding, inner gaps | `8px` |
| `Spacing-3` (12px) | Row horizontal padding | `12px` |

---

## Accessibility

| Aspect | Implementation |
|--------|---------------|
| **ARIA Role (Default / Action)** | Container: `role="menu"`. Each row: `role="menuitem"`. Trigger uses `aria-haspopup="menu"` + `aria-expanded`. |
| **ARIA Role (Select / Select-tick)** | Container: `role="listbox"`. Rows: `role="option"` with `aria-selected="true|false"`. Trigger uses `aria-haspopup="listbox"`. |
| **ARIA Role (Multi-select)** | Container: `role="dialog"` (footer has primary action buttons). Rows: `role="checkbox"` with `aria-checked`. |
| **Keyboard** | `↑` / `↓` move focus between items (wraps). `Home` / `End` jump to first / last. `Enter` / `Space` activate the focused row. `Esc` closes the menu and returns focus to the trigger. `Tab` moves into the footer for Multi-select. |
| **Focus indicator** | 2px `Border-Focus` (`#2C66DD`) inset ring on the focused row, only with `:focus-visible`. |
| **Selection** | Select / Select-tick: only one row has `aria-selected="true"` at a time. Multi-select: each row independently sets `aria-checked`. |
| **Danger row** | Uses `Color-Text-Critical` plus an icon — color is not the sole indicator. Confirm destructive actions in a follow-up dialog when consequences are severe. |
| **Disabled items** | `aria-disabled="true"` plus the `disabled` attribute on the underlying button. Disabled rows remain in focus order so screen readers can announce them, but cannot be activated. |
| **Color contrast** | Label colors meet WCAG 2.1 AA (4.5:1) on the elevated white surface. Focus ring meets 3:1 against both default and hover backgrounds. |
| **RTL** | Full RTL via the `RTL = True` variant or `dir="rtl"` on the container. `↑` / `↓` keys remain unchanged. |

---

## Usage Guidelines

### Do
- Match the `Type` to the interaction: `Default` for stateless actions, `Select` for single-choice with radios, `Multi-select` for batch selection, `Action` for contextual menus with icons and a destructive option, `Select-tick` for lightweight single-selection.
- Keep menu items short — 1–3 words ideally; ellipsis on overflow.
- Group related items, use a divider between dissimilar groups, and reserve dividers for genuine separation (max 1–2 dividers per menu).
- Use `Show Title` when the menu's purpose isn't obvious from the trigger label.
- Use `Show Footer` for batch actions (`Apply` / `Cancel` / `Sign out`) and stateless link controls (`Clear all`).
- Place the most-used items first; place destructive actions last and visually separated.
- Drive open/close, focus management, and keyboard shortcuts from the trigger; the menu component is presentational.
- For RTL languages, set `RTL = True` — text and item layout flip together.

### Don't
- Don't mix selection patterns inside one menu (e.g., radios and checkboxes together) — split into separate menus or use a sub-menu pattern.
- Don't put more than ~10 items in a Dropdown Menu — use a Combobox / search-enabled list for longer collections.
- Don't use the `Action` Type's last (Danger) row for non-destructive actions; reserve red for actions that delete or remove data irreversibly.
- Don't place a Dropdown Menu inline in a layout — it must float above content with shadow and stacking context.
- Don't render multiple menus open simultaneously from sibling triggers.
- Don't replace the menu container with custom popovers when this component already covers the pattern.

---

## Related Components

| Component | Relationship |
|-----------|-------------|
| **Input Select** | Uses Dropdown Menu (with `Type = Select` or `Multi-select`) as the open-state surface. |
| **Button / Icon Button** | Common triggers for `Action` and `Default` menus. |
| **Tag / Tag Group** | Used inside Multi-select pickers; selected tags surface back into the trigger of the parent control. |
| **Tooltip** | Use Tooltip for purely informational hover content; use Dropdown Menu when there is a list of selectable choices. |
| **Right Pane** | For long, complex selections (forms, configuration), prefer a Right Pane or Modal over a Dropdown Menu. |
| **Date Picker / Calendar** | Specialized date-selection surface. Don't replicate calendar logic inside a Dropdown Menu. |

---

## Figma Usage

```
Component Set: Dropdown Menu
Node ID: 18386:13895
File: UEMS - Design System 3.0

Example variant string:
Type=Action, RTL=False
```

### Variant Reference

| Type | RTL | Node ID |
|------|-----|---------|
| Default | False | `18386:13843` |
| Default | True | `18386:13848` |
| Select | False | `18386:13853` |
| Select | True | `18386:13858` |
| Multi-select | False | `18386:13863` |
| Multi-select | True | `18386:13868` |
| Action | False | `18386:13873` |
| Action | True | `18386:13879` |
| Select-tick | False | `18386:13885` |
| Select-tick | True | `18386:13890` |
