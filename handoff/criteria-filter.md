# Handoff Spec: Criteria Filter (Advanced Filter)

> Component: `<ds-criteria-filter>` — `design-system-library/src/components/criteria-filter/`
> Sibling of: `<ds-filter-panel>` (faceted filtering). This is the **expression/condition
> builder** tier — `field → operator → value` rows joined by AND/OR, with optional nested groups.
> Status: **Complete — Phases 1–6 shipped** (flat core · nested grouping · inline/popover/drawer presentation · query preview + field-to-field compare · saved presets · docs page + a11y/RTL/theme audit). Plus an **`structure="advanced"`** variant (lead word · per-row And/Or joiner · criteria-pattern line). Net-new component — a separate sibling, not a filter-panel mode.
> Reference integration: `projects/custom-groups/layout-create-group.html` (dynamic Custom Group form; `Shell.html?view=custom-groups-create-group`).
> Locked decisions: name `ds-criteria-filter` · structure **grouped** (full nested AND/OR + NOT
> modelled from day one, **shipped flat-first** then nesting in Phase 2) · schema-driven `fields` +
> value-editor factory reused from `ds-filter-panel` · default `apply-mode="live"`.

## Overview

A reusable builder that assembles a **structured, nested filter expression** for a data surface
(table, list, custom group, report, saved search) and emits a JSON-serializable **query tree**.
It owns the rule rows, the AND/OR combinators, nesting, add/remove/duplicate, validation, the
optional query preview, and (later) saved presets — and delegates each **value editor** to an
existing Prism input.

It is **not** responsible for querying/fetching data. The host owns that; the builder only reports
the query tree via events (identical contract to `ds-filter-panel`).

**Why a separate component (not a `ds-filter-panel` mode):** `ds-filter-panel` is *faceted* — its
value is a flat `Record<groupId, values>` map where every facet is a fixed, pre-declared axis. A
criteria filter is *compositional* — its value is a **recursive tree** of `{field, operator, value}`
rules under AND/OR/NOT groups, where the same field can appear many times with different operators.
The data model, interaction, and output differ fundamentally, so it ships as a sibling. It **reuses**
filter-panel's conventions: schema-driven fields, the value-editor factory, `ds-tag` chips, live/apply
modes, and the event shape. Saved presets are shared infrastructure both components will use.

### Filtering spectrum (where this sits)

| Component | Job | Value shape |
|---|---|---|
| `ds-tab-filter` | Quick single-select segments (All / Open / Closed) | one value |
| `ds-filter-panel` | Faceted filtering — pick values from fixed facets | flat `{groupId: values}` map |
| **`ds-criteria-filter`** | **Advanced filter — build a `field op value` expression with AND/OR + nesting** | **tree** (`RuleGroup`) |

### Global standard

Models the established query-builder pattern (React Query Builder, Salesforce report filter logic,
Jira/JQL, ServiceNow condition builder, Airtable/Notion filters) and, in-product, ManageEngine's own
**Custom Group** criteria builder.

## Use cases

| # | Use case | Phase |
|---|----------|-------|
| 1 | Flat list of conditions joined by one AND/OR (the 80% "advanced search") | 1 |
| 2 | Field-type-driven operators + value editor (text/number/date/select/…) | 1 |
| 3 | Add / remove / duplicate a condition | 1 |
| 4 | Unary operators (`is empty`, `is not empty`) — no value editor | 1 |
| 5 | Two-value operators (`between`, `not between`) — dual value editor | 1 |
| 6 | Inline validation (empty value, bad regex, min > max) → disables Apply | 1 |
| 7 | Nested condition groups (group within group) | 2 |
| 8 | Per-group combinator (AND/OR) + `NOT` negation | 2 |
| 9 | Depth/count guards (`max-depth`, `max-group`) | 2 |
| 10 | Popover mode from a "Filter" button (pairs with `ds-data-table` filter event) | 3 |
| 11 | Drawer mode for large queries | 3 |
| 12 | Empty state (no conditions yet) + loading (async fields/options) | 3 |
| 13 | Query preview — natural-language summary + applied chips | 4 |
| 14 | Compare a field to another field (`valueSource: 'field'`) | 4 |
| 15 | Live vs. explicit Apply (staged) | 4 |
| 16 | Saved filter presets / named views (persist the tree) | 5 (shared with filter-panel) |

## Architecture

Schema-driven, mirroring `ds-filter-panel`:
- Set `fields` (the schema array) + optional `operators` (override the default catalog); the builder
  renders every rule row from that schema.
- Set `query` (a `RuleGroup` tree) for a controlled value; omit to start from an empty root group.
- The **value-editor factory** maps each field's `type` (+ the chosen operator) to an existing Prism
  input — the same factory idea as `ds-filter-panel._renderField`, reused here.

## Anatomy / Layout

```
ds-criteria-filter                         (flex column; bordered card; tokens only)
├─ header      title · [preset ▼] · Clear
├─ body (scroll)
│   └─ group (root)                        ← tinted left-border + connector line per depth
│        ├─ group-bar   [AND│OR] (ds-tab-filter) · NOT · + Condition · + Group · 🗑 (non-root)
│        └─ rules
│             ├─ rule row   [field ▼] [operator ▼] [ value editor ] · ⧉ duplicate · ✕ remove
│             └─ nested group … (recursion)
├─ preview     natural-language summary + removable ds-tag chips   (show-preview)
└─ footer      [Clear] [Apply (n)]         (apply-mode="apply")
```

- Nesting depth is shown with a tinted **left border + connector** per level (not indentation alone),
  and the group's combinator label reads down the connector (query-builder convention).
- The root group has no delete control; nested groups do.
- A **rule row** lays out as `field ▼ | operator ▼ | value` (controls size to their column, `width:100%`),
  with the row actions (duplicate, remove) on the **right** (per the button-alignment rule).

## Field types → operators → value editor

The field `type` drives (a) the default operator set and (b) which Prism input renders the value.
Operator labels are **sentence case** ("Is empty", "Starts with") per the casing hard rule.

| `type` | Default operators | Value editor (Prism component) |
|--------|-------------------|--------------------------------|
| `text` | contains, not contains, equals, not equals, starts with, ends with, matches regex, is empty, is not empty | `ds-text-input` |
| `number` | =, ≠, <, ≤, >, ≥, between, not between, is empty, is not empty | `ds-text-input[type=number]` (×2 for *between*) |
| `date` / `datetime` | is, is not, before, after, between, is empty, is not empty (+ relative presets) | `ds-date-picker` (`show-presets`; `type="range"` for *between*) |
| `time` | is, is not, before, after, between | `ds-date-picker` time mode |
| `boolean` | is true, is false | — (operator carries the value) |
| `select` | is, is not, is empty, is not empty | `ds-input-select` (single) |
| `multiselect` | has any of, has all of, has none of, is empty | **`ds-token-field`** (new-field multi-select convention) |
| combinator | — | **`ds-tab-filter`** (built-in segmented single-select) |

- **Unary operators** (`is empty`, `is not empty`, `is true`, `is false`) render **no** value editor.
- **Binary-range operators** (`between`, `not between`) render **two** value editors (or a `range`
  date picker).
- `valueSource: 'field'` swaps the literal editor for a `ds-input-select` of the other fields
  (compare field-to-field) — Phase 4.

## Data model

```ts
type Combinator = 'and' | 'or';

type RuleGroup = {
  id: string;
  combinator: Combinator;           // how this group's children join
  not?: boolean;                    // negate the whole group (NOT)
  rules: Array<Rule | RuleGroup>;   // recursion → nesting
};

type Rule = {
  id: string;
  field: string;                    // → FieldDef.name
  operator: string;                 // → OperatorDef.name
  value: unknown;                   // shape depends on field type + operator (see below)
  valueSource?: 'value' | 'field';  // literal (default) or another field's value
};

type FieldDef = {
  name: string;                     // machine id; the key emitted in the query
  label: string;                    // shown in the field dropdown (sentence case)
  type: 'text'|'number'|'date'|'datetime'|'time'|'boolean'|'select'|'multiselect';
  group?: string;                   // optgroup heading in the field dropdown
  operators?: string[];             // override the default operator set for this field
  options?: { label: string; value: string; disabled?: boolean }[];  // select / multiselect
  placeholder?: string;
  defaultOperator?: string;
  defaultValue?: unknown;
  validator?: (rule: Rule) => string | null;   // custom validation → inline error text
};

type OperatorDef = {
  name: string;                     // machine id stored on Rule.operator
  label: string;                    // sentence case
  arity: 0 | 1 | 2;                 // value editors: unary(0) · single(1) · range(2)
  types: FieldDef['type'][];        // which field types offer this operator
};
```

**Emitted value per field type** — `text`/`select` → `string`; `number` → `number` (or `[min,max]`
for *between*); `multiselect` → `string[]`; `date`/`datetime` → ISO string (or `{from,to}` for
*between*); `boolean` → carried by the operator (no `value`); unary operators → `value` omitted.

The `query` tree is stable and JSON-serializable → trivially **persisted as a preset** or mapped to a
query string / SQL `WHERE` / API filter object by the host (a mapping recipe ships in the `.md`).

## Web Component API

### Attributes

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `mode` | `inline` \| `popover` \| `drawer` | `inline` | Presentation (overlay modes self-contained, mirroring filter-panel). |
| `structure` | `flat` \| `grouped` \| `advanced` | `grouped` | `flat` = single rule list + one combinator (no nesting); `grouped` = nested groups + NOT; `advanced` = flat list with a lead word (`lead-word`), per-row And/Or joiner, and a bottom "criteria pattern" (e.g. `1 AND 2 OR 3`). |
| `lead-word` | string | `When` | Advanced variant only — the word before the first condition (When / Where). |
| `apply-mode` | `live` \| `apply` | `live` | `live` emits on every change; `apply` shows a footer, emits on Apply. |
| `combinator-default` | `and` \| `or` | `and` | Combinator of a newly created group. |
| `show-not` | boolean | on | Allow negating a group (`NOT`). Set `"false"` to hide. |
| `show-preview` | boolean | — | Show the natural-language summary + applied chips. |
| `allow-field-source` | boolean | — | Allow comparing a field to another field. |
| `max-depth` | number | — | Cap nesting depth (hides "Add group" at the limit). |
| `max-group` | number | — | Cap total rules (hides "Add condition" at the limit). |
| `loading` | boolean | — | Skeleton rows (async fields/options). |
| `disabled` / `readonly` | boolean | — | Non-interactive / view-only. |
| `open` | boolean | — | Overlay modes: visible (reflected by `open()`/`close()`). |
| `anchor` | CSS selector | — | Popover: element to anchor to (else the `open()` trigger). |
| `title` | string | `Filter criteria` | Header label (sentence case). |
| `add-rule-label` | string | `Add condition` | — |
| `add-group-label` | string | `Add group` | — |
| `rtl` | boolean | — | RTL layout (logical properties throughout). |

Boolean attributes use the DS convention: present = on; set `"false"` to disable a default-on flag.

### Properties (DOM-only)

| Property | Type | Notes |
|----------|------|-------|
| `fields` | `FieldDef[]` | Field schema. Reclaimed if assigned before element upgrade. |
| `operators` | `OperatorDef[]` | Optional — override/extend the built-in operator catalog. |
| `query` | `RuleGroup` | Controlled value (the tree). Omit for an empty root group. |
| `presets` | `{ id, label, query }[]` | Saved named queries (Phase 5). |

### Methods

`addRule(groupId?)` · `addGroup(groupId?)` · `removeRule(id)` · `clear()` · `apply()` ·
`validate() → boolean` · `getQuery() → RuleGroup` · `setQuery(tree)` ·
`open(trigger?)` · `close()` · `toggle(trigger?)` (overlay modes — pass the trigger so focus returns
to it on close). Setting `fields`/`query`/`operators` re-renders.

### Events (`ds-criteria-filter-*`)

| Event | Detail | Fires when |
|-------|--------|-----------|
| `change` | `{ query, valid }` | live: any edit (add/remove/field/operator/value/combinator). |
| `apply` | `{ query }` | apply mode: Apply clicked. |
| `clear` | `{ }` | Clear-all. |
| `invalid` | `{ errors }` | Validation fails (also reflected inline). |
| `preset-save` | `{ query }` | User saves the current tree as a preset. |
| `preset-select` | `{ id, query }` | A saved preset is chosen. |
| `open` / `close` | `{ }` | Overlay modes opened/closed. |

> In **live** mode, binding to `change` alone is sufficient — every edit re-emits it with the current
> `valid` flag.

## States and Interactions

- **Empty** — root group with no rules; body shows a centered empty state + a primary "Add condition".
- **Add condition** — appends a rule seeded with the first field, its `defaultOperator`, and
  `defaultValue`; focus moves to the new field dropdown.
- **Change field** — resets the operator to the field's default and clears the value if the editor type
  changes; keeps it if compatible.
- **Change operator** — swaps the value editor per operator arity (0 → hide, 1 → single, 2 → range).
- **Remove / duplicate** — remove drops the rule and returns focus to the previous row's remove button;
  duplicate clones the rule below it.
- **Combinator** — the group's `ds-tab-filter` toggles AND/OR; `NOT` toggles group negation.
- **Add group** (grouped) — appends a nested `RuleGroup` with the default combinator; hidden at
  `max-depth`.
- **Validation** — empty required value / invalid regex / `between` with min > max mark the row (error
  ring + helper text via `ds-field-helper`), set `valid:false`, and disable Apply.
- **Apply mode** — edits stage without emitting `change`; the footer Apply enables when dirty and shows
  the rule count; Apply commits + emits.
- **Loading / disabled / readonly** — skeleton rows / non-interactive / view-only rendering.

## Design Tokens Used

Prefer the **`--uems-*`** semantic tokens (bind to these, never primitives or hex):
surfaces/borders `--uems-bg-primary`, `--uems-bg-secondary`, `--uems-bg-accent-primary-subtle`,
`--uems-border-primary/secondary/accent`, per-depth tints from `--uems-bg-accent-primary-subtle`;
text `--uems-text-primary/secondary/tertiary`, `--uems-text-accent-link`, `--uems-text-error`;
icon `--uems-icon-secondary/accent/error`; spacing `--uems-spacing-*`; radius `--uems-radius-*`;
typography composites `--uems-type-body-*`; focus `outline: var(--uems-focus-ring); outline-offset: 2px`;
motion `--duration-fast` / `--easing-standard`. **No hardcoded hex/px** where a token exists. Works
across all five themes (`data-theme`) + `data-font` / `data-type-scale`, and RTL.

Panel/overlay slide-in animates the **occupied width** (transition `grid-template-columns` 0 ↔ open),
never `display` toggling — per the panel-animation hard rule.

## Components (composed)

`ds-input-select` (field + operator dropdowns, single-select values) · `ds-token-field` (multiselect
values) · `ds-text-input` (text/number values) · `ds-date-picker` (date/time/range values,
`show-presets`) · `ds-tab-filter` (AND/OR combinator) · `ds-toggle` (NOT) · `ds-button` /
`ds-icon-button` (add / duplicate / remove / apply / clear) · `ds-tag` (applied-criteria chips) ·
`ds-field-helper` (inline validation text) · `ds-empty-state` (no conditions) · `ds-divider`.
Sub-component JS is imported and their light-DOM stylesheets auto-injected (`_injectCss` helper).

## Accessibility Notes

- Root is a labeled region; each group is `role="group"` with `aria-label` reading its combinator
  ("Condition group, matches all"). Nesting is exposed structurally, not by indentation alone.
- Each rule row's field/operator/value have accessible labels (column-header or `aria-label` pattern).
- Add / duplicate / remove are real `<button>`s with explicit labels ("Add condition", "Remove
  condition 2"). Focus moves to the new row on add and to a sane neighbor on remove.
- The combinator is a labeled segmented control (radio semantics via `ds-tab-filter`); `NOT` is a
  labeled toggle.
- A polite live region announces rule count + validity changes.
- Keyboard: full tab order; Enter on "Add condition" adds; each editor inherits the underlying Prism
  input's keyboard + ARIA. Overlay modes set `role="dialog"`/`aria-modal`, trap focus, Esc-dismiss,
  return focus to the trigger.
- All DOM queries scoped to the component root (never `document`); `:focus-visible` ring via
  `--uems-focus-ring`.

## Edge Cases

- **Configured before upgrade** — `fields`/`operators`/`query` set before the element defines are
  reclaimed in the constructor.
- **Unknown field/operator in `query`** — row shows the raw id and flags invalid rather than throwing.
- **Empty root** — renders the empty state, not a stray combinator bar.
- **Single rule** — the combinator control is hidden (nothing to join) until a second rule/group exists.
- **`max-depth` / `max-group`** — the corresponding "Add" control hides at the limit (and the cap is
  announced, never a silent truncation).
- **Deleting the last rule in a nested group** — the empty group is removed (root is never removed).
- **Shared class names across shell views** — styles scoped to `.ds-criteria-filter`; queries scoped
  to root (the shell injects multiple views into one DOM).
- **Bounded height** — host is a flex/height context; a `max-height` cascades and the body scrolls
  internally.

## Composition with the data table

Pairs with `ds-data-table`: the table's toolbar filter icon fires `ds-data-table-filter` (today it
only emits — the popover contents are intentionally host-supplied). The natural wiring is
`mode="popover"` opened on that event; the builder's `change`/`apply` feeds `table.rows`. For a page,
put the builder inside the **one filter surface** for that view (never loose beside the table) and
default it open when filters are primary — per the filter-placement hard rule.

## Registration (3 edits — per `design-system-library/README.md`)

1. Create `src/components/criteria-filter/` with four files: `criteria-filter.{js,css,md,examples.html}`
   (`DsCriteriaFilter extends HTMLElement`; BEM classes `ds-criteria-filter__*`; token-driven CSS).
2. Add to `src/components/index.js`: `import './criteria-filter/criteria-filter.js';` and
   `export { DsCriteriaFilter } from './criteria-filter/criteria-filter.js';`.
3. Add to `src/styles/index.css`: `@import "../components/criteria-filter/criteria-filter.css";`.

## Phased roadmap

1. **✅ Flat core** — `fields`/`operators` schema, value-editor factory (text/number/select/multiselect/
   date), add/remove/duplicate, one AND/OR combinator, unary + range operators, inline validation,
   live **and** apply modes, empty state, `change`/`apply`/`clear`/`invalid` events. Verified across
   light/dark themes. *(Covers the majority of "advanced filter" needs.)*
2. **✅ Grouping** — nested `RuleGroup`s, per-group combinator + `NOT`, add-group, depth connectors,
   `max-depth`/`max-group`, single-child combinator hiding, empty-group auto-removal. Verified across
   light/dark themes.
3. **✅ Presentation** — `inline`/`popover`/`drawer` modes (self-contained scrim/positioning/focus +
   Esc + light-dismiss); `open`/`close`/`toggle` + `open`/`close` events; loading skeleton. Overlay
   behaviour verified via DOM + hit-testing (fixed overlays don't capture in the preview screenshot).
   ⏳ Remaining: a documented `ds-data-table` filter-event recipe (the table's filter icon opens a
   `mode="popover"` builder) — the plumbing exists; add a reference wiring in Phase 4/6.
4. **✅ Power features** — query preview (`show-preview`: natural-language summary + removable
   `ds-tag` chips), field-to-field compare (`allow-field-source` → `valueSource:'field'`), apply-mode
   footer (already shipped), duplicate at any depth. Also fixed two nesting bugs surfaced here
   (nested-rule live validity + nested duplicate). ⏳ Deferred: drag-reorder (fragile across nested
   groups — revisit as polish).
5. **✅ Presets** — save/load named query trees. Controlled: `presets` property enables the UI (a
   header picker to load + an inline "Save filter" name bar); the component emits
   `preset-save {label, query}` / `preset-select {id, query}` and the host persists. `loadPreset(id)`
   / `savePreset(label)` for programmatic use. (The feature `ds-filter-panel` deferred — same contract.)
6. **✅ Docs & audit** — docs-site page `docs/Criteria-filter.html` (+ sidebar entry propagated to all
   61 component pages); `.examples.html` covers every field type + nesting + overlays + loading +
   presets. Audited: **a11y** (nested-group `role="group"` + label, per-control `aria-label`s,
   combinator radiogroup, `ds-field-helper role="alert"`, keyboard via real `<button>`/`ds-*`
   controls); **RTL** (logical properties mirror the connector + row actions); **all five themes**
   (light/dark/night/green-light/green-dark — semantic `--uems-*` accents shift correctly, no
   hardcoded colours).

## Open decisions (for confirmation before/at build)

| # | Decision | Proposed |
|---|----------|----------|
| 1 | Element name | `ds-criteria-filter` ✅ (confirmed) |
| 2 | Structure | `grouped` model, flat-first delivery ✅ (confirmed) |
| 3 | Combinator control | reuse `ds-tab-filter` (segmented) rather than a bespoke AND/OR pill |
| 4 | Multiselect editor | `ds-token-field` (new-field multi-select convention) |
| 5 | Presets storage | component emits/consumes the tree only; host owns persistence (as filter-panel) |
| 6 | Free-text "filter logic" expression (e.g. `1 AND (2 OR 3)`) | out of scope for now; revisit post-Phase 5 |
