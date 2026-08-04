# ds-dual-list

Dual list selection ("shuttle" / transfer / pick-list). Two panels — **Available**
and **Selected** — with per-item checkboxes and a transfer-control column that moves
checked items between them. Built entirely from existing Prism primitives
(`ds-checkbox`, `ds-search-field`, `ds-text-link`, `ds-icon-button`, `ds-tooltip`,
`ds-field-helper`, `ds-icon`) and design tokens — no hardcoded visual values.
Panel counts are shown inline in the title, e.g. **Available (12)**.

Figma: *UEMS - Design System 3.0* → "Dual List Selection" (`22074:515837`).

## Usage

```html
<ds-dual-list id="assign" searchable move-all></ds-dual-list>
<script type="module">
  document.getElementById('assign').items = {
    available: [{ id: 'ben', label: 'Ben Ortiz' }, { id: 'chloe', label: 'Chloe Kim' }],
    selected:  [{ id: 'ava', label: 'Ava Chen' }],
  };
  document.getElementById('assign').addEventListener('ds-dual-list-change', (e) => {
    console.log(e.detail.selected); // ['ava', …]
  });
</script>
```

## Data

Set via the `.items` JS property (or an `items` JSON attribute):

```js
el.items = {
  available: [{ id, label, group?, locked?, disabled? }],
  selected:  [{ id, label, group?, locked?, disabled? }],
};
```

| Field | Meaning |
|---|---|
| `id` | Unique key (required) |
| `label` | Row text (defaults to `id`) |
| `group` | Section name when `grouped` is set |
| `locked` | Lives in Selected; can't be moved back or deselected (excluded from move-all / deselect-all) |
| `disabled` | Non-interactive row |

`.items` (getter) returns `{ available: [ids], selected: [ids] }`.

## Attributes

| Attribute | Type | Default | Use case |
|---|---|---|---|
| `available-label` / `selected-label` | string | "Available" / "Selected" | Panel titles |
| `search-placeholder` | string | "Search…" | Search field placeholder |
| `searchable` | boolean | off | Search box in both panels (client-side filter) |
| `move-all` | boolean | off | Adds the `»` / `«` move-all buttons |
| `reorderable` | boolean | off | ▲▼ reorder controls for the Selected panel |
| `grouped` | boolean | off | Renders `group` section headers |
| `loading` | boolean | off | Skeleton source rows; search + controls disabled |
| `readonly` | boolean | off | View-only — no controls, search, or select-all |
| `error` | boolean | off | Panels take the error border |
| `error-message` | string | — | Shown via `ds-field-helper`, linked with `aria-describedby` |

CSS var `--ds-dl-height` sets the panel height (default `360px`).

## Events

- `ds-dual-list-change` → `detail { available: [ids], selected: [ids] }` — fires after any transfer or reorder.

## Interactions

- Check rows → `>` / `<` move the checked items; `»` / `«` move all currently **filter-visible** items.
- **Select all** / **Deselect all** toggle all non-locked, filter-visible rows in that panel.
- Search filters that panel's rows by label (case-insensitive); no matches → inline message. Move-all respects the active filter.
- Reorder ▲▼ moves the checked Selected item(s) within the list.
- **Drag and drop** — drag a row onto the other panel to transfer it, or (in the **Selected** list only) reposition it (drops insert before the row under the cursor; the target panel shows an outset ring + an insertion line at the drop point). The **Available** list order is fixed — it can't be reordered, and items moved back into it append. Locked / disabled rows aren't draggable, and drag is disabled in `readonly` / `loading`. This is an enhancement layered on top of the checkbox + transfer-button path, which remains the accessible/keyboard route.

## States (Figma use cases)

1 Basic · 2 Searchable · 3 Ordered · 4 Move-all · 5 Grouped · 6 Empty target ·
7 Constrained/locked · 8 Loading · 9 Read-only · 10 Error. See `dual-list.examples.html`.

## Accessibility

- Each panel is `role="group"` labelled by its header title (count included).
- Lists are `role="listbox" aria-multiselectable`; rows are `role="option"` whose `aria-selected` mirrors the checkbox.
- Transfer controls are real `<button>`s with `aria-label`s; disabled when there's nothing to move.
- A polite live region announces each move ("Moved 3 items to Selected. Selected now has 5.").
- Error: panels get `aria-invalid`; `error-message` is linked via `aria-describedby`.
- Focus order: Available (select-all → search → list) → transfer controls → Selected (select-all → search → list).

## Notes

- Transfer controls use the standard **`ds-icon-button`** (`type="outline"`, `size="xl"`). The sprite has no double-chevron symbol, so move-all uses the distinct **arrow-narrow** glyph (`→` / `←`) and single moves use the **chevron** (`›` / `‹`); reorder uses `▲` / `▼`.
