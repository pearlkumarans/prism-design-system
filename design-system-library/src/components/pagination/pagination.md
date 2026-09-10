# ds-pagination

Page navigation for lists, tables, grids and galleries — **numbered**, **simple**,
or **compact**. Composed from existing Prism parts (reuse-first): `ds-icon-button`
for the first/prev/next/last arrows and `ds-input-select` for the rows-per-page
picker. The only bespoke anatomy is the numbered page **pill** — a token-styled
`<button>` carrying `aria-current="page"`. Design tokens only; RTL + light/dark
inherited.

## Usage

```html
<!-- Uncontrolled: the component owns `page` and re-renders itself. -->
<ds-pagination total-items="240" page-size="20" show-range show-page-size></ds-pagination>

<script type="module">
  const pgn = document.querySelector('ds-pagination');
  pgn.addEventListener('ds-pagination-change', (e) => {
    // e.detail = { page, pageSize, source }
    loadRows(e.detail.page, e.detail.pageSize);
  });
  pgn.addEventListener('ds-pagination-page-size-change', (e) => {
    // e.detail = { pageSize, page:1 } — page count changed, so it resets to 1
    loadRows(1, e.detail.pageSize);
  });
</script>
```

**Controlled** — keep `page` in your own state and write it back each render; the
component clamps `page` to `[1, totalPages]` and only emits on a real change, so
echoing the value back is safe (no event loop).

## Modes

| Mode | Renders | Use case |
|---|---|---|
| `numbered` (default) | `« ‹ 1 … 5 6 7 … 10 › »` | Known total; jump anywhere. Ellipsis truncation. |
| `simple` | `‹ Previous  ⋯  Next ›` | Known total, minimal chrome. Prev/Next disable at the ends. |
| `compact` | `‹  Page 6 of 10  ›` | Mobile / narrow surfaces; a live-announced status between two arrows. |
| `dots` | `‹ ●●▬○○  3 of 8 ›` | Small sets — carousels, galleries, onboarding. The `ds-tour` dot indicator, made navigable: one clickable dot per page, current elongated, preceding pages filled. `show-range` adds an "n of N" count. |

In `dots` mode each dot is a real button with a generous transparent hit area
(the visible dot stays 6px, matching `ds-tour`). A page change repaints the state
on the live dot elements, so the active pill **glides** to the new dot (width
transition) instead of snapping. Best kept to small page counts — it renders one
dot per page. Cursor (keyset) mode is a planned fast-follow.

## Attributes

| Attribute | Type | Default | Use case |
|---|---|---|---|
| `mode` | `numbered` \| `simple` \| `compact` \| `dots` | `numbered` | Layout |
| `total-items` | number | `0` | Item count; with `page-size` → total pages |
| `page-size` | number | `20` | Items per page |
| `page` | number | `1` | Current page (1-based, reflected, clamped) |
| `sibling-count` | number | `1` | Pages either side of current (numbered) |
| `boundary-count` | number | `1` | Pages pinned at each end (numbered) |
| `show-first-last` | boolean | off | Add « / » jump-to-first/last arrows (numbered) |
| `show-page-size` | boolean | off | Show the rows-per-page `ds-input-select` |
| `page-size-options` | csv | `10,20,50,100` | Options for the size picker |
| `show-range` | boolean | off | Show "1–20 of 240" summary (leading) |
| `show-jump` | boolean | off | Show a "Go to page" number field |
| `size` | `small` \| `medium` | `medium` | Control scale |
| `disabled` | boolean | off | Non-interactive (dimmed) |
| `loading` | boolean | off | Dims the range while a page loads |
| `rtl` | boolean | auto | Mirror; chevrons flip so prev/next stay correct |
| `prev-label` `next-label` `first-label` `last-label` `of-label` `per-page-label` `jump-label` | string | — | i18n overrides |

## Properties

- `page` · `pageSize` · `totalItems` — read/write (mirror the attributes).
- `totalPages` — getter, `ceil(totalItems / pageSize)` (min 1).

## Methods

- `goTo(n)` — navigate to page `n` (clamped; no-op + no event if unchanged).
- `next()` / `prev()` / `first()` / `last()`.

## Events

- `ds-pagination-change` → `detail { page, pageSize, source }` — `source` is one of
  `page` \| `next` \| `prev` \| `first` \| `last` \| `jump`. Bubbles + composed.
- `ds-pagination-page-size-change` → `detail { pageSize, page:1 }` — the size picker
  changed; page resets to 1 because the page count changed.

## Truncation (numbered)

`boundaryCount` pages are pinned at each end and `siblingCount` pages sit either
side of the current page. Runs of more than one hidden page collapse to an
ellipsis, but a gap of **exactly one** renders that single page (no "…" standing in
for one number). This matches the MUI / Ant global standard.

## Accessibility

- Root is a `<nav aria-label="Pagination">`; page pills are a `role="list"`.
- The current pill carries `aria-current="page"`; others get `aria-label="Go to page N"`.
- Arrows are `ds-icon-button`s with required `label`s and disable at the ends.
- The compact status and the range summary are `aria-live="polite"`.
- Full keyboard operation (each control is a real button/input); focus-visible ring
  via tokens; transitions respect `prefers-reduced-motion`.

## Composition & notes

- **In `ds-data-table`** the pager is baked in; use `ds-pagination` for lists,
  grids, galleries, and card decks that have no built-in pager (a data-table
  refactor onto this component is a planned follow-up).
- Reuses `ds-icon-button` + `ds-input-select`; adds two sprite icons
  (`chevrons-left`, `chevrons-right`) for first/last.
