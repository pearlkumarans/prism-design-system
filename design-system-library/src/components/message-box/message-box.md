# `<ds-message-box>`

In-app **notification panel** — a collapsible card that groups messages under two
tabs (**Alerts** / **Information**) and lists them as `ds-inline-alert` rows in a
custom-scrollbar region. Title is fixed (**"Notifications"**). Spec:
`design-system/handoff/MessageBox.md` (Figma `18844:338665`).

```html
<ds-message-box tab="alerts" alerts-count="12" information-count="3">
  <ds-inline-alert slot="alerts" type="warning" style-variant="subtle" accent-bar
    description="…" action="View affected devices" action-position="inline"></ds-inline-alert>
  <ds-inline-alert slot="information" type="info" style-variant="subtle" accent-bar
    description="…" action="Action" action-position="inline"></ds-inline-alert>
</ds-message-box>
```

| Attribute | Values | Default |
|---|---|---|
| `tab` | `alerts` \| `information` | `alerts` — active tab / which group shows |
| `expanded` | `"false"` to collapse | expanded |
| `show-badge` | boolean — count badge beside the title | off |
| `alerts-count` / `information-count` | number | row count of each group |
| `rtl` | boolean | — |

Title is **fixed** ("Notifications") — not a prop.

## Composition

- **Rows** are slotted `ds-inline-alert` elements tagged `slot="alerts"` or
  `slot="information"`; only the active tab's group renders. (Alerts → `type="warning"`,
  Information → `type="info"`, both `style-variant="subtle"` with `accent-bar`.)
- **Tabs** use `ds-tab-bar-horizontal` (Alerts | Information with live count badges).
- **Scroll** region wraps the list in `ds-scrollbar` (overlay, cursor-presence auto-hide);
  bound the height via `--ds-mb-max-height` (default 320px) so it scrolls past that.
- Panel chrome (border, header, disclosure) is purpose-built here rather than nesting the
  generic shadow-DOM `ds-accordion`.

## Behaviour

- **Collapse/expand** — the header (chevron + title) is a `<button>` with `aria-expanded` /
  `aria-controls`; collapsed renders header-only.
- **Collapsed = no active tab** — both tabs show rest/default; the active tab is indicated
  only when expanded (selecting a tab while collapsed expands the panel).
- **Empty** — there is no empty state; **hide the whole component** when there are no messages.
- **RTL** — `rtl` mirrors the header, passes through to the tab bar / scrollbar / rows;
  vertical scrollbar moves to the left, accent bars to the right.

## Events

| Event | Detail | When |
|---|---|---|
| `toggle` | `{ expanded }` | header expand/collapse |
| `tab-change` | `{ tab }` | tab switched |

Plus the rows' own `ds-inline-alert-dismiss`.

## Styling hooks

| Hook | Purpose |
|---|---|
| `--ds-mb-max-height` | scroll region max height (default 320px) |
| `::part(header)` | the header row |
| panel border / surface | `--uems-border-tertiary` / `--uems-bg-base` |

Composed accessibility: disclosure (`aria-expanded`/`aria-controls`) + tablist (the tab
bar) + a focusable scroll region. See the handoff spec for full guidance.
