# Handoff Spec: Description List

> Source: Figma — UEMS Design System 3.0 › **Description List** (`node 20097:607638`)
> Child: **_Description List Item** (`node 20097:607409`)
> Pattern reference: [PatternFly — Description List](https://www.patternfly.org/components/description-list/)

## Overview

A **Description List** presents structured **term → value** pairs (label/value metadata) on detail pages, spec sheets, side panels, and modals. It maps directly to the native HTML `<dl>` / `<dt>` / `<dd>` elements.

Two independent choices drive its layout:
- **Columns** (`1` / `2` / `3`) — how the items are distributed horizontally.
- **Orientation** (`Stacked` / `Horizontal`) — how each *item* lays out its term and value.

Plus **RTL** (`False` / `True`) for right-to-left mirroring. That's **12 container variants** (3 × 2 × 2), composed from a **4-variant item** (Orientation × RTL).

**When to use which:**
| Situation | Columns | Orientation |
|---|---|---|
| Narrow panel / modal | 1 | Stacked |
| Medium detail page | 2 | Stacked or Horizontal |
| Wide spec sheet, uniform metadata | 3 | Horizontal |

---

## Layout

The container is an auto-layout frame; **height always hugs content**, width is set by columns.

### Container (`Orientation = Stacked`)
| Columns | Design width | Layout | Column gap | Column width | Item gap (vertical) | Padding |
|---|---|---|---|---|---|---|
| 1 | 400px | vertical | — | 368px (fills) | 16px | 16px |
| 2 | 800px | horizontal | **32px** | 368px each | 16px | 16px |
| 3 | 1100px | horizontal | **32px** | 335px each | 16px | 16px |

### Container (`Orientation = Horizontal`)
| Columns | Design width | Layout | Column gap | Column width | Item gap (vertical) | Padding |
|---|---|---|---|---|---|---|
| 1 | 560px | vertical | — | 528px (fills) | 16px | 16px |
| 2 | 1180px | horizontal | **40px** | 554px each | 16px | 16px |
| 3 | — | horizontal | **40px** | equal | 16px | 16px |

> **Column gap differs by orientation: 32px (Stacked) vs 40px (Horizontal).**

### Item internals
**Stacked item** — vertical stack, `term` above `value`:
- Gap term → value: **4px**
- Width fills the column; height hugs (≈40px for single-line term + value)

**Horizontal item** — `term row` beside `value row`, both vertically centered:
- **Term row: fixed 140px wide** · internal gap term → help-icon: **4px**
- Gap term-row → value-row: **24px**
- **Value row: fills remaining width** · internal gap value → edit-button: **8px** (`spacing/8`)

> **Implementation note:** Figma pins column/container widths (`counterAxisSizingMode: FIXED`) for layout demonstration. In code, implement columns as **equal fluid tracks** — CSS Grid `grid-template-columns: repeat(N, minmax(0, 1fr)); gap: <column-gap>` — not fixed pixel widths. Keep the **140px fixed term column** only in Horizontal orientation.

---

## Design Tokens Used

| Token | Value | Usage |
|---|---|---|
| `Text/small/SemiBold` | Zoho Puvi Semibold · 12px / 16px lh | **Term** (label) text |
| `Text/Default/Regular` | Zoho Puvi Regular · 14px / 20px lh | **Description** (value) text |
| `Text/Text-Secondary` | `#2A303D` | Term text color |
| `Text/Text-Primary` | `#15181E` | Description text color |
| `spacing/8` | 8px | Horizontal item: value → edit-button gap (bound) |

**Spacing — bind to these existing tokens.** The design currently uses raw px for these; bind them on build. All tokens below are confirmed present in the file (exact matches — no rounding needed):
| Value | Where | Token |
|---|---|---|
| 4px | Stacked term→value · term→help-icon gap | `spacing/4` |
| 8px | Horizontal value → edit-button gap | `spacing/8` *(already bound)* |
| 16px | Container padding · vertical item gap | `spacing/16` |
| 24px | Horizontal term-row → value-row gap | `spacing/24` |
| 32px | Stacked column gap | `spacing/32` |
| 40px | Horizontal column gap | `spacing/40` |
| 140px | Horizontal term-column width | fixed layout width — no spacing token |

---

## Components

| Component | Variant axes | Key props | Notes |
|---|---|---|---|
| **Description List** (container) | Columns `1/2/3` · Orientation `Stacked/Horizontal` · RTL `F/T` | — | Composes N × Description List Item; distributes into columns |
| **Description List Item** | Orientation `Stacked/Horizontal` · RTL `F/T` | `Term`, `Term RTL`, `Description`, `Description RTL`, `Show Icon` (bool, **default false**), `Show Edit` (bool, **default true**) | One term/value pair |
| **Term Help Icon** | instance swap | default = help icon (`10481:87977`) | Shown only when `Show Icon = true` |
| **Edit Action** | instance swap | default = Icon Button · Square · Tertiary · Small (`16456:29011`) | Full Icon Button (states + a11y), not a bare icon |

**Content defaults:** Term `"Term"` / `"المصطلح"` (RTL) · Description `"Description value goes here"` / `"الوصف هنا"` (RTL).

---

## States and Interactions

| Element | State / trigger | Behavior |
|---|---|---|
| Term / value text | — | Static, non-interactive |
| **Help icon** (`Show Icon = true`) | hover / focus | Standard interactive-icon affordance (cursor, focus ring) |
| **Help icon** | click / Enter / Space | Opens a **popover** with help text; `aria-expanded` toggles; Esc / outside-click closes |
| **Edit button** (`Show Edit = true`) | hover | Icon Button tertiary hover background |
| **Edit button** | focus-visible | Focus ring (Icon Button focus state) |
| **Edit button** | active / disabled | Icon Button `State` prop drives pressed / disabled appearance |
| **Edit button** | click | Fires the row's edit handler (wired in code) |

> The edit affordance is a **full Icon Button** (≈20×20 hit target) — it carries its own Hover / Focus / Active / Disabled states via its `State` property. Don't reimplement as a bare `<svg>`.

---

## Responsive Behavior

The component itself is fixed-width in Figma; the app should make it fluid.

**Confirmed:** as available width narrows, **collapse to a single column** and switch to **Stacked** orientation (the fixed 140px term column + value can't stay side-by-side on narrow screens).

| Breakpoint | Behavior |
|---|---|
| Desktop (>1024px) | Columns as specified (up to 3); Horizontal orientation OK |
| Tablet (768–1024px) | Step down toward fewer columns (3 → 2) as needed |
| Mobile (<768px) | **Collapse to 1 column · force Stacked orientation** |

Implementation: a single `<dl>` whose column count is driven by CSS (e.g. grid `repeat(N, minmax(0,1fr))`) so it can drop to one track at the breakpoint without restructuring the markup.

---

## Edge Cases

- **Empty value** → render an em-dash `—` (never leave `<dd>` blank).
- **Long value** → wraps to multiple lines; item height grows, the 4px (stacked) / row alignment holds; other items unaffected.
- **Long term, Horizontal orientation** → term column is fixed 140px. **Wrap up to 2 lines, then truncate with an ellipsis** (CSS `-webkit-line-clamp: 2`), and expose the full term via `title` (tooltip). When the term wraps to 2 lines, align the term row to the **top** of the item (not center).
- **Uneven item count across columns** → distribute in reading order; trailing column may hold fewer items. Keep column top-alignment.
- **International / long strings** → German/Arabic terms run longer; Stacked orientation is safer for unpredictable term lengths.
- **RTL** → set RTL variant: column **reading order reverses**, item content mirrors, help icon/edit button swap sides; use `Term RTL` / `Description RTL` for localized text.
- **No editable rows** → set `Show Edit = false`; the value row loses the trailing button and reclaims its width.

---

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Help popover | icon click | fade + small scale/translate in | ~150–200ms | standard ease-out |
| Edit button bg | hover / focus | background-color fade | fast (~120ms) | standard |

No layout/entrance animation on the list itself.

---

## Accessibility Notes

- **Semantics:** render as `<dl>` with each item as `<dt>` (term) + `<dd>` (value). Multi-column is a visual arrangement only — keep a single logical `<dl>` and lay columns out with CSS (don't split into separate lists that break the term/value association).
- **Reading / focus order:** DOM order = logical order (term, its help button, then value, then edit button), item by item. RTL reverses the *visual* order via CSS/`dir="rtl"`; **DOM order stays logical**.
- **Help icon:** it's a `<button>` with an `aria-label` (e.g. "About {term}"), `aria-expanded`, and `aria-controls` pointing at the popover; popover is dismissible with Esc and returns focus to the trigger.
- **Edit button:** `<button>` with a descriptive `aria-label` (e.g. "Edit {term}") — icon alone is not an accessible name.
- **Contrast:** Term `#2A303D` and Value `#15181E` on the base surface both exceed WCAG AA for normal text.
- **Keyboard:** help icon and edit button are tabbable; Enter/Space activate; there are no roving-tabindex requirements (each control is independently focusable).

---

## Resolved decisions

1. **Horizontal long-term** → wrap up to **2 lines, then ellipsis** (`-webkit-line-clamp: 2`), full text in a `title` tooltip; term row top-aligned when it wraps.
2. **Responsive collapse** → **collapse to a single column** and force **Stacked** orientation on narrow widths.
3. **Spacing tokens** → **bind the raw px to the existing `spacing/*` tokens** (`spacing/4, 8, 16, 24, 32, 40` — all exact matches confirmed in the file).
