# Handoff Spec: Message Box

> Source: Figma — UEMS Design System 3.0 · [Message Box component set `18844:338665`](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18844-338665) (page **❖ Message Box**)
> Target: Web component (framework-agnostic custom element `<ds-message-box>`).
> Composes existing DS components — see [Accordion](Accordion.md) · [Message Banner](MessageBanner.md) · [Scrollbar](Scrollbar.md) · Tab Bar Horizontal · Badge · Divider.

---

## Overview

The **Message Box** is an in-app **notification panel** — a collapsible card that groups system messages under two tabs (**Alerts** and **Information**) and lists them as stacked **Message Banner** rows in a scrollable region. It is built on the **Accordion** disclosure pattern: a header (title + tab switcher + expand/collapse chevron) over a body that holds the message list and a custom overlay scrollbar.

It is a **composition component** — nearly all visual detail lives in the sub-components it embeds; this spec covers how they assemble, the variant model, and the panel/header chrome.

**Figma variant axes** (8 variants)

| Axis | Values | Drives |
|---|---|---|
| `Tab` | `Alerts` \| `Information` | Which tab is active + which message list shows (Alerts = Warning-styled rows; Information = Info-styled rows). Default **Alerts**. **Only indicated when Expanded** (see below). |
| `State` | `Expanded` \| `Collapsed` | Body shown vs header-only. Default **Expanded**. |
| `RTL` | `False` \| `True` | Mirrors the whole panel (logical layout + Arabic strings). Default **False**. |

> **8 variants** = `Tab(2) × State(2) × RTL(2)`. There is no Disabled variant.
> **Collapsed shows no active tab** — when `State=Collapsed`, both tabs render in their **default/rest** state (none highlighted). The active tab is shown only when **Expanded**; on re-expand it returns to the `Tab` value. (So the two Collapsed variants are visually identical apart from RTL.)

---

## Anatomy

```
Message Box  (row: panel + scrollbar gutter)
├── Accordion  (the panel — column, border Border-Tertiary)
│   ├── Header  (row, padding 8 y, gap 16, align center)
│   │   ├── title group (hug): [Chevron ⌄ · Title "Notifications" · Badge (optional)]
│   │   └── trailing (hug):     [Tab Bar — "Alerts (12)" | "Information (3)"]   ← the tab switcher
│   └── Body  (SLOT, shown when Expanded)
│       └── Body Scroll (column, gap 8)
│           └── Message Banner × N   (+ hidden Dividers between)   ← the message list
└── scroll (gutter, right / left in RTL)
    └── ds-scrollbar / vertical      ← custom overlay scrollbar
```

| # | Element | Notes |
|---|---------|-------|
| 1 | **Panel (Accordion)** | The card. 1px `Border-Tertiary`; transparent fill (sits on page surface). Owns expand/collapse. |
| 2 | **Header** | Title row. `Chevron` (24px) toggles State; `Title` "Notifications" (14/Semibold); optional `Badge` count (default **off**). |
| 3 | **Tab switcher** | A **Tab Bar Horizontal** (Fill, Count=2) in the header trailing — `Alerts` + `Information`, each with a count badge. The active tab = the `Tab` variant. |
| 4 | **Body** | Accordion `Body` SLOT, present only when **Expanded**. Holds the scrollable message list. |
| 5 | **Message list** | A `Body Scroll` column of **Message Banner** rows (gap 8), with `Divider` instances between (hidden by default). |
| 6 | **Scrollbar** | A `ds-scrollbar/vertical` in a right-hand gutter (**left** in RTL). Overlay, thumb-only. |

---

## Layout & Measurements

Panel width is authored at **720px** (the message column); the scrollbar gutter adds ~**12–14px** on the trailing edge (→ Expanded variants are ~732 wide). In code the panel is **fluid** — `width: 100%` of its container.

| Variant | Figma size | Notes |
|---|---|---|
| Alerts · Expanded · LTR | 732 × 336 | header + 3 visible rows + scrollbar |
| Alerts · Collapsed · LTR | 720 × 64 | header only |
| Information · Expanded · LTR | 720 × 237 | header + 3 visible rows |
| Information · Collapsed · LTR | 720 × 56 | header only |

> RTL variants match their LTR counterparts in structure; heights differ only by content. Heights are **content-driven** — don't hard-code them.

| Region | Layout | Padding | Gap |
|---|---|---|---|
| **Header** | row, `align-items: center` | `8` top/btm · (x from Accordion) | **16** (title group ↔ trailing) |
| **title group** | row, hug | 0 | 4 (chevron ↔ title ↔ badge) |
| **Body** | column (SLOT) | `4` top · `12` btm | 8 |
| **Body Scroll** | column | 0 | **8** (between rows) |
| **Message Banner** (row) | row | `12` y · `16` x | **12** (icon/accent ↔ text ↔ action) · radius **8** |
| Accordion panel padding | — | `4` t · `12` r · `0` b · `20` l | — |

---

## Design Tokens Used

Hex = Light theme; all are `UEMS Theme Tokens` variables — bind to the token, never the hex.

| Element | Token | Notes |
|---|---|---|
| Panel border | `Border/Border-Tertiary` (#E1E4EB) | 1px card border |
| Panel surface | (transparent) | sits on the page/container background |
| Header **Title** | `Text/Text-Primary` (#15181E) · **14 / Semibold** · Zoho Puvi | "Notifications" |
| Message row surface | `Background/BG-Alert-Primary` (Alerts) / Info equivalent (Information) | per the row's `Type` — see Message Banner |
| Message **Title** | `Text/Text-Alert` (Alerts) · **14 / Semibold** | row heading |
| Message **Description** | `Text/Text-Primary` · **13 / Regular** | row body |
| Message row radius | `radius/radius-8` (8px) | — |
| Tab switcher | Tab Bar Horizontal tokens | active/rest per its spec |
| Scrollbar | `BG-Quaternary` / `BG-Quaternary-Solid` / `Border-Accent` | see [Scrollbar](Scrollbar.md) |
| Divider (between rows) | `Border-Tertiary` 1px | hidden by default |

> The **row type tracks the tab**: **Alerts** → Warning/Alert-styled Message Banners (amber accent); **Information** → Info-styled banners (blue). Both reuse the same Message Banner component, only its `Type` differs.

---

## Components (composed)

| Sub-component | Role | Reference |
|---|---|---|
| **Accordion** | The panel shell — header + collapsible body, disclosure behaviour, RTL | [Accordion.md](Accordion.md) |
| **Tab Bar Horizontal** | Header tab switcher (`Fill`, `Count=2`): Alerts \| Information, with count badges + active state | Tab Bar spec |
| **Message Banner** | Each message row — icon/accent, title, description, optional action + dismiss | [MessageBanner.md](MessageBanner.md) |
| **ds-scrollbar / vertical** | Custom overlay scrollbar for the list | [Scrollbar.md](Scrollbar.md) |
| **Badge** | Optional count beside the title; counts inside the tab labels | badge spec |
| **Divider** | 1px rule between rows (hidden by default) | divider spec |

---

## States and Interactions

| Element | Trigger | Behavior |
|---|---|---|
| **Chevron / Header** | Click | Toggles `State` Expanded ⇄ Collapsed; chevron rotates (▲/▼). Collapsed = header only, and the **tab switcher goes inactive** (no tab highlighted). Re-expand restores the active tab. |
| **Tab (Alerts / Information)** | Click | Switches the active tab → swaps the visible message list. Active tab highlighted (Fill). |
| **Message row** | Hover | Per Message Banner (subtle row hover). |
| **Row action** ("Action" / "View affected devices") | Click / hover / focus | Text Link affordance — fires the row's action; inherits Text Link states. |
| **Dismiss** (optional per row) | Click | Removes the row from the list (Message Banner `Show Dismiss`). |
| **List** | Scroll / wheel / drag | Scrolls within the body; the `ds-scrollbar` thumb syncs and auto-hides (cursor presence). |
| **Whole panel** | `RTL` | Mirrors: title + chevron lead from the right, tab switcher & scrollbar move to the left, text right-aligns, Arabic strings. |

> **Tab counts** ("Alerts 12 / Information 3") reflect the number of messages in each tab; update live as messages arrive/dismiss.

---

## Responsive Behavior

| Breakpoint | Changes |
|---|---|
| Desktop | Full panel; header tabs + chevron on one row; body list scrolls with the overlay scrollbar. |
| Tablet / narrow | Panel fills width; long row text wraps; tab labels keep their counts. |
| Mobile (<768px) | Panel full-width; if the header crowds, the tab switcher may wrap below the title or condense; prefer Collapsed-by-default in dense mobile shells. Touch scroll reveals the scrollbar on scroll (see Scrollbar). |

> The panel is fluid (`width: 100%`); 720px is only the Figma frame.

---

## Edge Cases

- **Empty**: there is **no empty state** — when the Message Box has no messages, **hide the whole component** (don't render an empty panel).
- **Long list**: body scrolls; the overlay scrollbar appears on hover/scroll. Header + tabs stay fixed above the scroll region.
- **Long row text**: Message Banner wraps its description; the row grows (height hugs). Don't truncate the message body.
- **Collapsed**: only the header renders; the body (and scrollbar) are not present.
- **Many tabs counts** (e.g. 99+): clamp the count badge (e.g. `99+`).
- **International / RTL**: Arabic strings are longer; never fix row width. RTL mirrors the panel (see RTL).
- **One message**: list renders a single row; no divider needed; scrollbar hidden (no overflow).

---

## Animation / Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Body | Expand / collapse | height + opacity reveal; chevron rotate | ~200ms | ease |
| Tab content | Tab switch | cross-fade / instant swap of the list | ~120ms | ease |
| Scrollbar | Pointer enter / leave | fade in / out (cursor presence) | 80 / 200ms | ease |
| Row | Dismiss | fade + collapse height | ~150ms | ease |

> Respect `prefers-reduced-motion: reduce` — expand/collapse and dismiss instantly; no scrollbar fade.

---

## Accessibility

The Message Box layers three ARIA patterns — **disclosure** (expand/collapse), **tabs** (Alerts/Information), and a scrollable **list**.

- **Disclosure**: the header control is a `<button>` with `aria-expanded` reflecting State and `aria-controls` → the body id. Chevron is decorative (`aria-hidden`).
- **Tabs**: render the switcher as `role="tablist"` with `role="tab"` (`aria-selected`) per tab and the body list as the matching `role="tabpanel"` (`aria-labelledby` the active tab). Tabs are reachable by `Tab`, switched with `←/→` (and `Home`/`End`).
- **List / scroll region**: the scroll container is focusable (`tabindex=0`) and keyboard-scrollable (`↑↓`, `PageUp/Down`, `Home`/`End`); give it an accessible name (`aria-label`, e.g. "Alerts"). The custom scrollbar is supplemental (see Scrollbar a11y) — keyboard/wheel is the accessible path.
- **Messages**: each Message Banner conveys its type by icon + text (not color alone). New messages should be announced via an `aria-live="polite"` region; errors/critical via `assertive`/`role="alert"`.
- **Focus order**: chevron/header button → tabs (Alerts → Information) → into the body list (row links, dismiss) → out. Logical and not trapped.
- **Contrast**: Title `Text-Primary` and message text pass AA; accent bars/colors are non-text indicators paired with icon + text.
- **RTL**: mirror via `dir="rtl"` + logical properties; counts/digits stay LTR within the RTL layout.

---

## Suggested Web Component API

```html
<ds-message-box
  title="Notifications"
  tab="alerts"            <!-- alerts | information -->
  expanded                <!-- collapse toggle -->
  rtl>
  <!-- messages provided as slotted ds-message-banner rows, grouped per tab -->
  <ds-message-banner slot="alerts" type="warning" …></ds-message-banner>
  <ds-message-banner slot="information" type="info" …></ds-message-banner>
</ds-message-box>
```

**`<ds-message-box>`**

| Prop | Figma | Type | Default | Notes |
|------|-------|------|---------|-------|
| `title` | Accordion Title | — | `"Notifications"` | Panel heading — **fixed**, not configurable |
| `tab` | `Tab` | `alerts \| information` | `alerts` | Active tab; selects which slotted list shows |
| `expanded` | `State` | boolean | `true` | Expanded vs Collapsed (disclosure) |
| `show-badge` | Accordion `Show Badge` | boolean | `false` | Count badge beside the title |
| `alerts-count` / `information-count` | tab badges | number | — | Counts shown in the tab labels |
| `rtl` | `RTL` | boolean | `false` | Prefer host `dir="rtl"` |

- **Slots**: `alerts` and `information` (or a single `default` slot filtered by tab) accept `ds-message-banner` rows; the scroll region + overlay scrollbar are owned by the component.
- **Events**: `toggle` (expand/collapse), `tab-change` (`{tab}`), `dismiss` (`{message}`), and the rows' own action events.
- **Composition**: internally render the [Accordion](Accordion.md) shell + Tab Bar + a `ds-scrollbar`-wrapped list of [Message Banner](MessageBanner.md) rows — reuse those components rather than reimplementing.

---

## RTL (`RTL=True`)

- Header mirrors: **Title + Chevron lead from the right**; the **Tab switcher moves to the left**; text right-aligns; strings localize to Arabic (`Title RTL`, tab `Label RTL`, banner `Title RTL`/`Description RTL`).
- The **vertical scrollbar moves to the left** edge.
- Message rows mirror: **accent bar on the right**, text right-aligned, row actions on the left.
- Implement with `dir="rtl"` + logical properties; don't author separate RTL CSS per element.

> ⚠ **Note for the build (from the 2026-06-23 RTL rebuild):** these RTL variants are composed from the same sub-components with their own `RTL=True` set. Two gotchas surfaced in Figma that inform the code model: (1) the header **Tab Bar** must be allowed to *hug* its content or it clips; (2) each sub-instance (Accordion, Message Banner, Tab Bar) carries its own RTL flag + Arabic text props. In code, a single `dir="rtl"` on the host should cascade — don't rely on per-variant duplication.

---

## Notes for Implementation

- **Compose, don't rebuild** — the Message Box is Accordion + Tab Bar + Scrollbar + Message Banner list. Wire those DS components; this component owns only the assembly, the tab/list switching, and the scroll region.
- **Tabs drive the list** — `tab` selects which message group renders; counts come from the data.
- **Scroll region** — wrap the list in `ds-scrollbar` (overlay, cursor-presence auto-hide); keep the header/tabs fixed above it.
- **Row type follows the tab** — Alerts → Warning banners, Information → Info banners (same component, different `type`).
- **Theme** — all colors bind to theme variables; light/dark/night/green resolve automatically.
- **Fluid width** — `width: 100%`; 720px is only the Figma artboard.

---

## Resolved (2026-06-23)

1. ✅ **Title is fixed** — always "Notifications"; not a configurable prop.
2. ✅ **Empty state — not applicable** — when there are no messages, **hide the whole Message Box** rather than render an empty panel/empty-state.
3. ✅ **Collapsed = no active tab** — in the Collapsed state the tab switcher shows both tabs in their default/rest state (none highlighted). The active tab is indicated only when Expanded and returns to the `Tab` value on re-expand. (Figma: all Collapsed variants have both `_Tab Item`s at `State=Default`.)

## Open Questions for Design

1. **Tab content source** — are Alerts/Information two separate slotted lists, or one list filtered by type? (API assumes two slots.)

---

*Generated from UEMS Design System 3.0 · Figma `18844:338665` · structure + tokens verified live via the Desktop Bridge (2026-06-23, immediately after the RTL-variant rebuild). Row/Accordion/scrollbar internals are documented in their own specs.*
