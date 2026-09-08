# Spec: Tree (`ds-tree`)

A hierarchy you can walk, expand and select. Built for OU / custom-group /
remote-office pickers, registry and file browsers, and report category trees.

## Overview

`ds-tree` implements the **WAI-ARIA Tree View pattern**, which is most of the
component: the roles and state, one tab stop, and a keyboard model that is
non-obvious enough to be worth getting right once here instead of per page.

Nothing in the library modelled hierarchy before it — `ds-data-table` has no
nested-row concept, `ds-accordion` is single-level disclosure with no nesting or
selection, and `ds-item-list` is deliberately flat (its own spec says grouping is
page chrome and its rows are non-focusable by design).

Unlike `ds-item-list`, this component was **not** derived from hand-rolled copies
in the product — there were none. A sweep for `role="tree"`, tree/node/branch/
folder class vocabulary and hierarchy-shaped data found only a workflow-builder
node. So the requirements come from the ARIA pattern plus the endpoint-management
cases above, and the first real call site should be treated as a chance to
validate them rather than as confirmation.

## API

| Attribute | Values | Default | Notes |
|---|---|---|---|
| `selection` | `none` · `single` · `multi` | `none` | `none` also makes a click on a branch expand it |
| `checkboxes` | boolean | off | Adds a checkbox column. Needs a `selection` other than `none` |
| `select-parents` | `cascade` · `independent` | `cascade` | Whether checking a node checks its subtree |
| `size` | `small` · `medium` | `medium` | Density: row padding, indent step, type, control sizes |
| `guides` | boolean | off | Vertical guide lines through each expanded branch |
| `label` | string | — | `aria-label` for the tree |
| `rtl` | boolean | off | Mirrors layout and swaps the arrow keys |

### Per-node properties

```js
tree.items = [{
  id,                 // what expanded/selected state is keyed on
  text,               // the label — written with textContent, never as markup
  icon,               // a ds-icon name; the DATA decides, there is no container flag
  badge,              // '42' | { text, state } → a real ds-badge
  meta,               // a trailing string ('12 reports')
  children: [...],    // nested nodes
  hasChildren: true,  // LAZY: a parent whose children are not loaded yet
  expanded,           // seeds the initial state
  selected,           // seeds the initial state
  disabled,
  match: 'query',     // <mark> the first case-insensitive hit
  action: { text, actionId, icon, variant },
}];
```

### Properties and methods

| Member | Purpose |
|---|---|
| `items` | The hierarchy. Assigning it re-seeds expanded/selected from the data |
| `expandedIds` / `selectedIds` | Read or drive the state from outside |
| `setChildren(id, children)` | Resolve a lazy branch and clear its loading row |
| `expandAll()` / `collapseAll()` | — |

### Events

| Event | Detail |
|---|---|
| `ds-tree-select` | `{ ids, id, selected, item }` |
| `ds-tree-expand` | `{ id, item, lazy }` — `lazy: true` means go fetch |
| `ds-tree-collapse` | `{ id, item }` |
| `ds-tree-activate` | `{ id, item }` — Enter, or a click on the label |
| `ds-tree-action` | `{ actionId, id, item }` |

## Keyboard

Per the ARIA pattern. Arrows mirror under `rtl`, matching `ds-dropdown-menu`.

| Key | Action |
|---|---|
| ↓ / ↑ | Next / previous **visible** node |
| → | Expand; if already expanded, step to the first child |
| ← | Collapse; if already collapsed or a leaf, step out to the parent |
| Home / End | First / last visible node |
| Enter | Activate — **not** expand |
| Space | Toggle selection |
| `*` | Expand every sibling at the focused level |
| printable | Type-ahead to the next matching visible label |

The keyboard handler derives the current node from the **event target**, not from
the remembered tab stop. Those agree when the user tabs in, but diverge the
moment focus arrives another way, and then every key acts on the wrong row.

## Decisions

**Nested DOM, flat-ready ARIA.** Branches render as real `role="group"`
containers rather than flat indented rows, because that matches the pattern with
no bookkeeping. `aria-level` / `aria-setsize` / `aria-posinset` are emitted anyway
even though nesting makes them redundant: they are exactly what a flat,
virtualized rendering needs, so that swap stays an internal change instead of an
API break. Reach for it if a call site ever points this at thousands of nodes.

**State lives inside, seeded from the data.** A click works without the consumer
round-tripping new data back in. `expandedIds` / `selectedIds` expose it for the
controlled case.

**Cascade goes DOWN only.** A partially-selected parent shows `indeterminate`
(`aria-checked="mixed"` via `ds-checkbox`) and is **not** reported in
`selectedIds` — a half-selected parent that claimed to be checked would
over-report the selection to whatever consumes it. Disabled nodes are skipped by
cascade.

**One number drives the geometry.** `--_tree-indent` and `--_tree-twisty` derive
the indent, the twisty box and the guide-line position, so a wider twisty widens
the indent and the guide cannot drift off the chevron. Same approach
`ds-item-list` uses for its timeline connector, for the same reason.

**A leaf keeps the twisty box.** Without it, leaf labels sit a twisty-width left
of their siblings' and the level stops reading as a level.

## Composition

Everything inside a row is an existing component: `ds-checkbox` (including its
`indeterminate` state), `ds-icon`, `ds-badge`, `ds-button`. The tree owns layout
and behaviour, not chrome.

## Design tokens

| Concern | Token |
|---|---|
| Indent step | `--spacing-20` (`--spacing-16` at `size="small"`) |
| Row padding | `--spacing-6` (`--spacing-4` small) |
| Hover / selected | `--uems-bg-secondary` / `--uems-bg-accent-primary` |
| Selected label | `--uems-text-accent-secondary` |
| Twisty glyph | `--uems-icon-tertiary`, `--uems-icon-secondary` on hover |
| Guide line | `--uems-border-tertiary` |
| Focus ring | `--uems-border-accent-focus` |
| Search hit | `--uems-bg-warning-secondary` |

Note `--spacing-10` **does not exist** (the scale steps 8 → 12). An undefined
`var()` invalidates the whole declaration, which is how both `.ds-item` and
`.hd-lib-row` silently lost their padding.

## Accessibility

- `role="tree"` / `treeitem` / `group`; `aria-multiselectable` only for `multi`
- `aria-expanded` on parent nodes **only** — on a leaf it announces something to
  open that cannot open. A `hasChildren` node counts as a parent
- One tab stop with a roving tabindex; a tree with no tab stop is unreachable
- Labels and meta are written with `textContent`; `<mark>` is built as a DOM node,
  never an HTML sink, because these strings are OU and device names off an API
- The row carries the accessible name; a row checkbox is labelled from it rather
  than repeating it

## Edge cases

- **Expanded but empty** — renders "No items" rather than a silently blank branch
- **Lazy in flight** — renders a `role="status"` loading row
- **No `id`** — state keys fall back to an index path (`@0.1`), so reordering the
  data reshuffles state. Supply ids for anything that persists
- **`cloneNode`** — `items` is a property, so it does not survive cloning. A page
  that clones a tree must re-seed it (the bug that emptied a cloned dashboard
  widget)

## Out of scope

Drag-reorder, inline rename, and `treegrid` (columns per node). Each is a
different anatomy and can arrive without breaking this API.
