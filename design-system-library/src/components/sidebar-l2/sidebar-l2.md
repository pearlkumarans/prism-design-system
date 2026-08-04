# `<ds-sidebar-l2>`

Contextual secondary navigation panel — sits to the right of `<ds-sidebar-l1>`. Renders a back button + title, a search bar, and collapsible groups containing nav items, count badges, and sub-menu chevrons.

## Attributes

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `title` | string | — | Header title (e.g. "Settings Home"). |
| `show-back` | boolean | — | Render the leading back arrow. |
| `show-search` | `false` to hide | shown | |
| `search-placeholder` | string | `Search...` | |
| `rtl` | boolean | — | Right-to-left layout. |

## Properties

```js
sidebar.groups = [
  {
    id, label, expanded?,    // expanded defaults to true
    items: [
      { id, label, count?, sub?, active?, href? },
    ],
  },
];
```

- `count` — renders a pill badge. Numbers ≥ 1 000 render as `1.2K`, ≥ 1 000 000 as `1.2M`.
- `sub` — renders a trailing right-chevron (sub-menu indicator).
- `active` — renders the selected highlight + sets `aria-current="page"`.

## Events

| Event | Detail | When |
|---|---|---|
| `ds-sidebar-l2-select` | `{ groupId, item }` | Item clicked. Active state is updated locally. |
| `ds-sidebar-l2-toggle` | `{ groupId, expanded }` | Group header clicked. |
| `ds-sidebar-l2-back` | — | Back button clicked. |
| `ds-sidebar-l2-search` | `{ query }` | On every keystroke in the search input. |

## Behavior

- The search input filters items live; groups with no matches collapse out of view.
- `Escape` while the search has a value clears it.

## Accessibility

- Renders `<nav aria-label="<title>">`.
- Group headers are `<button aria-expanded="true|false">`.
- Active item has `aria-current="page"`.
- Count badges receive `aria-label="N <label>"` for full context.
