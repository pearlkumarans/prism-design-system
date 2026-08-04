# Data Table

A Data Table displays tabular, row-based data with a **toolbar** (refresh, search, filter, overflow menu), **column headers**, selectable **rows**, and a **footer** with per-page controls and pagination. When one or more rows are selected, a floating **bulk-action bar** replaces the footer controls with contextual actions (Edit, Delete, Export, clear-selection).

**Figma source:** [UEMS Design System 3.0 — Data Table](https://www.figma.com/design/DahIgbIJrSkzyP3OoHaDaG/UEMS---Design-System-3.0?node-id=18196-229648)
**Component node:** `18196:229648` (Data Table component set)
**Last updated:** 2026-04-19

---

## Anatomy

**Default — no rows selected**
```
┌─ Data Table ────────────────────────────────────────────────────────────────┐
│                            ⟳   🔍 Search...      ⎘ Filter ▾     ⋮          │ ← Toolbar
├──┬─────────────┬───────────┬───────────┬──────────────┬──────────┬─────────┤
│☐ │ Column      │ Column    │ Column    │ Column       │ Column   │ Column  │ ← Header row
├──┼─────────────┼───────────┼───────────┼──────────────┼──────────┼─────────┤
│☐ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │
│☐ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │
│☐ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │
│  …                                                                         │
├──┴─────────────┴───────────┴───────────┴──────────────┴──────────┴─────────┤
│ Rows per page [20 ▾]      1–20 of #                    ‹ Previous  Next ›  │ ← Footer
└─────────────────────────────────────────────────────────────────────────────┘
```

**Selected — rows highlighted, bulk-action bar floats over footer**
```
┌─ Data Table ────────────────────────────────────────────────────────────────┐
│                            ⟳   🔍 Search...      ⎘ Filter ▾     ⋮          │
├──┬─────────────┬───────────┬───────────┬──────────────┬──────────┬─────────┤
│☐ │ Column      │ Column    │ Column    │ Column       │ Column   │ Column  │
├──┼─────────────┼───────────┼───────────┼──────────────┼──────────┼─────────┤
│☑ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │ ← Selected
│☑ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │   (BG-Selected)
│☑ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │
│☐ │ Cell text   │ Cell text │ + Success │ Add Computer │ Cell text│    🔗   │
├──┴─────────────┴───────────┴───────────┴──────────────┴──────────┴─────────┤
│ Rows per page [20 ▾]       ┌───────────────────────────────────┐  ‹ ›      │
│                            │ ✎ Edit  🗑 Delete  ↥ Export │ 3 Selected ✕ │   │ ← Floating bar
│                            └───────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
```

| Part | Description |
|---|---|
| **Toolbar** | Top action strip. Contains: `⟳` refresh, `🔍` search input, `⎘ Filter ▾` dropdown, `⋮` overflow menu. Toggleable via `Toolbar = true/false`. |
| **Header Row** | First table row. Leading checkbox (select-all) + column header labels. `BG-Secondary-alt`, Semibold 13 px. Supports sort / filter affordances on each column. |
| **Body Row** | Repeating data row. Leading checkbox + N cells. Default height 40 px, alternating hover + selected states. |
| **Row Selection Checkbox** | First column of every row. Indeterminate on header when some (but not all) rows are selected. |
| **Cell** | Text, link, badge, link-button, or icon-button content. Left-aligned by default; numeric / icon cells right-aligned. |
| **Footer** | Bottom control strip. Left: rows-per-page selector. Center: range/total (`1–20 of #`). Right: pagination (`‹ Previous` / `Next ›`). Toggleable via `Footer = true/false`. |
| **Bulk-action Bar** | Floating pill that appears above the footer when rows are selected. Dark background (`BG-Base-Dark`), contains contextual actions + "N Selected" counter + close button to clear selection. |

---

## Variants

### Property 1 (Selection State)

| Value | Description | Visual cue |
|---|---|---|
| `Default` | No rows selected. Footer shows pagination controls only. | Normal row background |
| `Selected` | One or more rows checked. Selected rows have `BG-Selected` highlight; floating bulk-action bar overlays the footer center area. | Blue-tinted row background + dark floating pill |

### Variant Matrix

Selection is the only variant axis. All other behaviour is controlled via component properties:

- **2 selection states** × 2 toolbar toggles × 2 footer toggles × N rows × N columns = configurable at runtime. The Figma set ships **2 variants**.

---

## Component Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `Toolbar` | `boolean` | `true` | Show / hide the top toolbar (refresh + search + filter + overflow). |
| `Footer` | `boolean` | `true` | Show / hide the bottom footer (rows-per-page + range + pagination). |
| `Column Count` | `text` | `"5"` | Number of data columns rendered (excludes the leading selection column). Used in Figma for design-time preview; in code, driven by the `columns` prop. |
| `Row Count` | `text` | `"5"` | Number of body rows rendered at design time. Runtime rows come from the `rows` prop. |

---

## Props / API

### Data Table

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Column[]` | — | Column definitions: `{ id, header, accessor, align?, sortable?, width?, render? }`. |
| `rows` | `Row[]` | — | Row data: array of objects keyed by each column's `accessor`. |
| `selectedRowIds` | `string[]` | `[]` | Controlled set of selected row ids. When non-empty, the component renders the Selected variant. |
| `onSelectionChange` | `(ids: string[]) => void` | — | Fires when the user toggles row / header checkboxes. |
| `selectionMode` | `'multi' \| 'single' \| 'none'` | `'multi'` | Multi (checkbox), single (radio / click), or off. |
| `showToolbar` | `boolean` | `true` | Show the top toolbar. |
| `toolbarLeft` | `ReactNode` | `null` | Optional slot on the toolbar's leading edge (e.g. title, segmented control). |
| `toolbarActions` | `ReactNode` | Default icons | Right-hand toolbar slot. Replaces the default refresh / search / filter cluster. |
| `onRefresh` | `() => void` | — | Fires when the refresh icon is activated. |
| `searchValue` / `onSearchChange` | `string` / `(v: string) => void` | — | Controlled search input. |
| `filters` | `Filter[]` | `[]` | Active filters shown in the Filter dropdown. |
| `onFiltersChange` | `(filters: Filter[]) => void` | — | Fires when filters are applied. |
| `overflowMenuItems` | `MenuItem[]` | `[]` | Items for the `⋮` overflow menu (export, column chooser, density, etc.). |
| `showFooter` | `boolean` | `true` | Show the bottom footer. |
| `rowsPerPage` | `number` | `20` | Current rows-per-page value. |
| `rowsPerPageOptions` | `number[]` | `[10, 20, 50, 100]` | Options shown in the rows-per-page select. |
| `onRowsPerPageChange` | `(n: number) => void` | — | Fires when rows-per-page is changed. |
| `totalRows` | `number \| '#'` | `'#'` | Total row count for the range display (`1–20 of 243`). Use `'#'` when the total is unknown. |
| `page` | `number` | `1` | 1-based current page. |
| `onPageChange` | `(page: number) => void` | — | Fires on Previous / Next. |
| `bulkActions` | `BulkAction[]` | Default | Actions shown in the floating bulk-action bar. Default: `Edit`, `Delete`, `Export`. |
| `onBulkAction` | `(actionId: string, selectedIds: string[]) => void` | — | Fires when a bulk action is activated. |
| `emptyState` | `ReactNode` | Default | Rendered when `rows.length === 0`. |
| `loading` | `boolean` | `false` | Renders a row-shimmer skeleton overlay. |
| `rowHeight` | `'compact' \| 'default' \| 'comfortable'` | `'default'` | Row density. Compact = 32 px, Default = 40 px, Comfortable = 48 px. |
| `stickyHeader` | `boolean` | `true` | Column header sticks to the top of the scroll container. |
| `rtl` | `boolean` | `false` | Mirrors the layout for right-to-left reading order. |

### `Column` shape

| Key | Type | Description |
|---|---|---|
| `id` | `string` | Unique column id. |
| `header` | `string \| ReactNode` | Header label or custom node. |
| `accessor` | `string` | Key in the row object used to read the cell value. |
| `align` | `'start' \| 'end' \| 'center'` | Cell text alignment. Defaults to `start`; numeric columns should use `end`. |
| `sortable` | `boolean` | Shows a sort affordance in the header. |
| `width` | `number \| string` | Fixed or flex width (e.g. `200`, `'1fr'`). |
| `render` | `(row) => ReactNode` | Custom cell renderer (for links, badges, actions). |

### `BulkAction` shape

| Key | Type | Description |
|---|---|---|
| `id` | `string` | Unique action id. |
| `label` | `string` | Visible label (`Edit`, `Delete`, `Export`). |
| `icon` | `ReactNode` | Leading icon. |
| `destructive` | `boolean` | Renders the action in an error color (applies to `Delete`). |

---

## Design Tokens

### Colour

| Token | Role |
|---|---|
| `Background/BG-Primary-alt` | Table body background |
| `Background/BG-Secondary-alt` | Header row background |
| `Background/BG-Hover` | Row hover background |
| `Background/BG-Selected` | Selected row background |
| `Background/BG-Base-Dark` | Floating bulk-action bar background |
| `Border/Border-Secondary` | Outer table border + horizontal row separators |
| `Border/Border-Tertiary` | Vertical column separators (when enabled) |
| `Text/Text-Primary` | Cell text (default) |
| `Text/Text-Tertiary` | Header label, footer range text, "Rows per page" label |
| `Text/Text-Link` | Link-style cell text (e.g. "Cell text" as link) |
| `Text/Text-Inverse` | Bulk-action bar text (on dark background) |
| `Text/Text-Error` | Destructive bulk action (Delete) |
| `Text/Text-Success` | Success badge in cells |
| `Shadow/Shadow-Medium` | Floating bulk-action bar drop shadow |

### Spacing

| Token | Value | Usage |
|---|---|---|
| `spacing/4` | 4 px | Badge internal spacing |
| `spacing/8` | 8 px | Toolbar icon-to-input gap; footer inner gap |
| `spacing/12` | 12 px | Cell horizontal padding |
| `spacing/16` | 16 px | Toolbar / footer horizontal padding |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| `border-radius/radius-8` | 8 px | Table outer frame |
| `border-radius/radius-6` | 6 px | Bulk-action bar pill |
| `border-radius/radius-4` | 4 px | Toolbar buttons, search input |

---

## Typography

| Element | Font | Size | Weight | Line Height | Token |
|---|---|---|---|---|---|
| Column header | Zoho Puvi | 13 px | Semibold (600) | 20 px | `body/Small/Medium` |
| Cell text | Zoho Puvi | 13 px | Regular (400) | 20 px | `body/Small/Default` |
| Cell link | Zoho Puvi | 13 px | Medium (500) | 20 px | `body/Small/Medium` |
| Badge text | Zoho Puvi | 12 px | Medium (500) | 16 px | `body/XSmall/Medium` |
| Toolbar search placeholder | Zoho Puvi | 13 px | Regular (400) | 20 px | `body/Small/Default` |
| Footer "Rows per page" | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/XSmall/Default` |
| Footer range / pagination | Zoho Puvi | 12 px | Regular (400) | 16 px | `body/XSmall/Default` |
| Bulk-action label | Zoho Puvi | 13 px | Medium (500) | 20 px | `body/Small/Medium` |

---

## Spacing & Sizing Reference

| Property | Value |
|---|---|
| Row height — Compact | 32 px |
| Row height — Default | **40 px** |
| Row height — Comfortable | 48 px |
| Header row height | 40 px |
| Toolbar height | 48 px |
| Footer height | 48 px |
| Bulk-action bar height | 40 px |
| Bulk-action bar corner radius | 6 px |
| Table outer radius | 8 px |
| Cell horizontal padding | 12 px |
| First cell (checkbox column) width | 40 px |
| Column divider | 1 px, `Border/Border-Tertiary` (optional) |
| Row divider | 1 px, `Border/Border-Secondary` |
| Header sticky offset | 0 (sticks to scroll container top) |
| Floating bar shadow | `Shadow/Shadow-Medium` |

---

## Usage

### When to use

- For **structured, record-based data** where users need to scan, filter, sort, select, and act on multiple rows (tickets, devices, users, assets, incidents).
- When **bulk actions** (delete many, export many) are a core workflow.
- When users frequently compare rows on multiple attributes and **column alignment is essential**.
- When per-row detail is deep enough that clicking a row should open a drawer or detail page.

### When not to use

- For **small static lists** with 3–7 simple items → use a plain list.
- For **hierarchical / tree data** → use a tree view or expandable rows.
- For **card-based content** with rich imagery → use a card grid.
- For **dashboards of single values** → use widgets / metric cards, not a table.

### Do / Don't

| Do | Don't |
|---|---|
| Keep column headers short and noun-based ("Status", "Owner", "Due date") | Write sentence-long headers |
| Align numeric columns to the end of the cell | Left-align numbers — they become hard to compare |
| Put the primary link (the row's name / identifier) in the **first** data column | Bury the primary link mid-row |
| Use the Selected variant's bulk-action bar for destructive actions (with confirmation) | Attach Delete to a per-row icon when the same action works in bulk |
| Show `'N Selected'` and a clear-selection `✕` in the bulk-action bar | Leave the bulk bar visible when no rows are selected |
| Use the overflow menu (`⋮`) for column chooser, density, export-all, and low-frequency actions | Cram every action into the main toolbar — it becomes noisy |
| Sticky the header row when the table scrolls | Let the header scroll away — users lose context |
| Pair an empty state with a clear next action ("Add your first device") | Render a blank table with no guidance when empty |
| Keep row height consistent within a single table | Mix row heights based on content length |

---

## Accessibility

| Concern | Requirement |
|---|---|
| **Element** | Use a proper `<table>` with `<thead>`, `<tbody>`, `<tr>`, `<th scope="col">`, `<td>`. Do not build with `<div>` grids unless the entire table is virtualized — in that case expose ARIA grid roles (`role="grid"`, `role="row"`, `role="columnheader"`, `role="gridcell"`). |
| **Selection semantics** | Each row checkbox has `aria-label="Select row N"` (or row identifier). Header checkbox uses `aria-label="Select all rows"` and `aria-checked="mixed"` when the selection is partial. |
| **Keyboard** | `Tab` enters the table; `Arrow` keys move between cells in grid mode; `Space` toggles row selection; `Shift+Arrow` extends selection; `⌘/Ctrl+A` selects all visible rows. `Enter` activates the primary link in the focused cell. |
| **Sort** | Sortable headers expose `aria-sort="ascending"`, `"descending"`, or `"none"`. |
| **Column headers** | Use `<th scope="col">` on each header cell; assistive tech announces the column name when a cell is read. |
| **Row headers** | If the first data column is the row's primary identifier, mark its cells with `<th scope="row">`. |
| **Bulk-action bar** | Render as `role="region" aria-label="Bulk actions"` so it is announced when it appears. Keyboard users reach it via `Tab` from the last selected row. |
| **Live updates** | On filter / sort / pagination, announce the new range to screen readers via `aria-live="polite"` on a visually hidden status node (e.g. "Showing 1 to 20 of 243"). |
| **Contrast** | Selected-row background + text must meet WCAG AA 4.5:1. Link cells must meet 4.5:1 and have a non-color affordance (underline on hover). |
| **Empty / loading** | Empty state is a `role="status"`; loading skeleton sets `aria-busy="true"` on the `<table>`. |
| **RTL** | Column order and toolbar mirror in RTL. Pagination arrows (`‹ Previous` / `Next ›`) swap visually but keep their logical meaning. |

---

## Code Examples

### Basic usage

```tsx
<DataTable
  columns={[
    { id: 'name', header: 'Name', accessor: 'name', render: r => <a href={r.url}>{r.name}</a> },
    { id: 'owner', header: 'Owner', accessor: 'owner' },
    { id: 'status', header: 'Status', accessor: 'status', render: r => <Badge variant="success">{r.status}</Badge> },
    { id: 'action', header: 'Action', accessor: 'action', render: r => <LinkButton>Add Computer</LinkButton> },
    { id: 'updated', header: 'Updated', accessor: 'updated' },
    { id: 'link', header: '', accessor: 'link', render: r => <IconButton icon={<ExternalLinkIcon />} aria-label="Open" /> },
  ]}
  rows={rows}
  totalRows={243}
  page={page}
  onPageChange={setPage}
  rowsPerPage={20}
  onRowsPerPageChange={setRowsPerPage}
/>
```

### With selection and bulk actions

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<DataTable
  columns={columns}
  rows={rows}
  selectedRowIds={selectedIds}
  onSelectionChange={setSelectedIds}
  bulkActions={[
    { id: 'edit', label: 'Edit', icon: <EditIcon /> },
    { id: 'delete', label: 'Delete', icon: <TrashIcon />, destructive: true },
    { id: 'export', label: 'Export', icon: <ExportIcon /> },
  ]}
  onBulkAction={(actionId, ids) => runBulkAction(actionId, ids)}
/>
```

### Toolbar hidden (embedded table)

```tsx
<DataTable
  columns={columns}
  rows={rows}
  showToolbar={false}
  showFooter
/>
```

### Footer hidden (short static list)

```tsx
<DataTable
  columns={columns}
  rows={rows.slice(0, 5)}
  showFooter={false}
/>
```

### Loading state

```tsx
<DataTable
  columns={columns}
  rows={[]}
  loading
/>
```

### Empty state

```tsx
<DataTable
  columns={columns}
  rows={[]}
  emptyState={
    <EmptyState
      title="No devices yet"
      description="Add your first device to start monitoring."
      action={<Button onClick={openAddDevice}>Add device</Button>}
    />
  }
/>
```

### Compact density + sticky header inside a scroll region

```tsx
<div style={{ height: 480, overflow: 'auto' }}>
  <DataTable
    columns={columns}
    rows={rows}
    rowHeight="compact"
    stickyHeader
  />
</div>
```

### RTL

```tsx
<DataTable
  rtl
  columns={columns}
  rows={rows}
  totalRows={243}
/>
```

---

## Related Components

| Component | When to use instead |
|---|---|
| [Checkbox Group](./checkbox-group.md) | Short list of independent options, not record data |
| [Accordion](./accordion.md) | Disclosing additional detail per row — use expandable rows instead, or an accordion for non-tabular content |
| [Badge](./badge.md) | Used inside status cells |
| [Dropdown Menu](./dropdown-menu.md) | Powers the overflow `⋮` menu, per-row action menus, and rows-per-page select |
| [Icon Button](./icon-button.md) | Per-row action icons and toolbar icons |
| [Tag](./tag.md) | Used inside cells for multi-valued categorical data |
