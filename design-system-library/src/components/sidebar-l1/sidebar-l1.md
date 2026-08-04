# `<ds-sidebar-l1>`

Vertical icon-based primary navigation. 72 px expanded, 44 px when collapsed. Renders nav items, with an optional collapse toggle pinned to the bottom.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `collapsed` | boolean | — | Switches to icon-only mode (44 px). Also a property on the element. |
| `show-collapse` | boolean | **off** | Renders the bottom Collapse/Expand toggle. Off by default — opt in to show it. |
| `rtl` | boolean | — | Mirrors layout (border swaps to the left). |

## Properties

```js
sidebar.items = [
  { id, label, icon, active?, disabled?, state? /* 'add' for the blue + circle */, href? },
  …
];
sidebar.bottomItems = [
  { id, label, icon, /* same shape as items */ },
];
```

The collapse toggle is **off by default**; add the `show-collapse` attribute to render it (appended after `bottomItems`).

## Events

- `ds-sidebar-l1-select` — `detail: { id, item }` when a non-disabled item is clicked.
- `ds-sidebar-l1-toggle` — `detail: { collapsed }` when the collapse toggle is clicked.

## Accessibility

- Renders `<nav aria-label="Main navigation">`.
- Active item gets `aria-current="page"`. Disabled items get `aria-disabled="true"` and `tabindex="-1"`.
- In collapsed mode each item also receives `title="<label>"` so the OS tooltip stands in for the hidden label.
