# `<ds-page-header>`

Top-of-page header — breadcrumbs, title, actions, optional summary metadata row, and optional tab navigation.

| Attribute | Values | Default |
|---|---|---|
| `structure` | `default` \| `with-summary` \| `with-tabs` \| `full` | `default` |
| `title` | string | `Page Title` |
| `show-breadcrumbs`, `show-chevron`, `show-star` | `false` to hide | shown |
| `show-back` | boolean | — |

Properties:

```js
header.breadcrumbs = [{ label, href }, ...];
header.summary     = [{ label, value }, ...];
header.tabs        = [{ label, icon, count, active }, ...];
header.titleMenu   = [{ label, value, icon }, ...];  // items for the title chevron dropdown
```

Slots: `actions` (button row — right-aligned on desktop, left-aligned with the
title when it wraps on narrow), `badge` (status badge after the title),
`description` (rich subtitle — use instead of the plain-text `description` attribute
when you need inline content such as a trailing `<ds-text-link>` "Learn more" at the
end of the sentence; slotted content wins over the attribute, and collapses on scroll
like the plain description).

Title chevron (`show-chevron`): rendered as a `ds-icon-button`. With `titleMenu`
items set, clicking the chevron opens a `ds-dropdown-menu` of those items; without
items it just fires `ds-page-header-title-menu` so the consumer can open its own
menu. Choosing an item **updates the title** to that item's label by default
(record-switcher pattern) — call `preventDefault()` on
`ds-page-header-title-select` to keep the current title (e.g. for an actions menu).

Advanced filter (`show-filter`): opt-in `ds-icon-button` (filter icon) beside the
title that stays hidden until the title row is **hovered or focused**, then fades
in. Clicking it fires `ds-page-header-filter` for the page to open its filter UI.

Events: `ds-page-header-back`; `ds-page-header-tab` — `detail: { tab }`;
`ds-page-header-title-menu` (chevron opened); `ds-page-header-title-select` —
`detail: { item, value }` (a title-menu item chosen); `ds-page-header-filter`
(advanced-filter button clicked).

## Responsive

The header responds to its **own width** (container queries on the inner header,
plus a `ResizeObserver`/`window` resize fallback), so it adapts inside a narrow
panel — not only a narrow viewport.

| Container width | Behavior |
|---|---|
| ≤ 560px | Actions wrap to their own row, **left-aligned** with the title/summary (button order unchanged — primary still rightmost of the group). |
| ≤ 480px, **2+ actions** | Secondary actions fold into a `⋮` overflow menu; the **primary (last-slotted) action stays visible**. Menu items proxy-click the original buttons, so consumer handlers still fire. |
| ≤ 400px | Content inset tightens (`20 → 12px`) and the leading icon shrinks (`40 → 32px`, glyph `24 → 20`). |

Notes:

- **Author the primary action last.** The overflow keeps the last slotted action
  visible and folds the earlier (secondary) ones into the `⋮`.
- The title truncates with an ellipsis; the summary metadata row wraps.
- The leading icon **top-aligns** with the title when a summary/description is
  present, and **centers** on the title for a title-only header.
- `title` is read then stripped from the host element (it is the reserved global
  HTML attribute) so hovering the header shows **no native tooltip**.
