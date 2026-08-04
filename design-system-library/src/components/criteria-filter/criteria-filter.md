# Criteria Filter Component

`<ds-criteria-filter>` — an **advanced / criteria filter** (expression builder). It assembles a
list of `field → operator → value` conditions joined by one AND/OR combinator and emits a
structured, JSON-serializable **query tree**. Sibling of `<ds-filter-panel>` (faceted filtering);
this is the expression tier. Full architecture + roadmap: `handoff/criteria-filter.md`.

## Overview

Give it a `fields` schema (and optionally a controlled `query`); it renders one row per condition —
each row a field dropdown, an operator dropdown driven by the field's type, and a value editor
delegated to an existing Prism input. The host owns the query/data-fetch — the builder only reports
the query tree via events.

- **Phases 1–5 (this build)** — `text`/`number`/`select`/`multiselect`/`date`/`datetime`/`boolean`
  fields; the full operator catalog (contains, equals, between, is empty, has any of, …); add /
  remove / duplicate; per-group AND/OR combinator (shown at ≥2 children); operator-driven value editor
  (unary ops hide the editor, `between` shows two); inline validation; live **and** apply modes;
  empty state; **nested condition groups with per-group `NOT`**, depth connectors, and `max-depth` /
  `max-group` guards; **`inline` / `popover` / `drawer` presentation** (self-contained scrim, focus,
  Esc + light-dismiss); a **loading** skeleton; a **query preview** (natural-language summary +
  removable chips, `show-preview`); **field-to-field compare** (`allow-field-source`); and
  **saved presets** (host-owned — a picker to load + an inline "Save filter" bar, via the `presets`
  property). Audited for accessibility, RTL, and all five themes. Docs: [`docs/Criteria-filter.html`].
  Full roadmap + decisions: `handoff/criteria-filter.md`.

## Web Component API

### Attributes

| Attribute | Values | Default | Notes |
|-----------|--------|---------|-------|
| `mode` | `inline` \| `popover` \| `drawer` | `inline` | Presentation. Overlay modes are self-contained (scrim, focus, Esc + light-dismiss); open via `open()`/`toggle()`. |
| `open` | boolean | — | Overlay modes: visible (reflected by `open()`/`close()`). |
| `anchor` | CSS selector | — | Popover: element to anchor to (else the element passed to `open()`). |
| `loading` | boolean | — | Show skeleton rows (async fields/options). |
| `show-preview` | boolean | — | Show a read-only query summary (natural-language sentence + removable chips) below the builder. |
| `allow-field-source` | boolean | — | Let a comparison rule compare a field to **another field** of the same type (a Value/Field toggle per eligible rule). |
| `structure` | `combinator` \| `advanced` | `combinator` | Combining style: **`combinator`** is a "Match all / any of the following" filter; **`advanced`** is a flat list with a lead word on row 1, a per-row **And/Or** joiner select on later rows, and a **criteria pattern** line (e.g. `1 AND 2 OR 3`). Legacy values map to `combinator`: `grouped`/unset → combinator (grouping on); `flat` → combinator (grouping off). |
| `grouping` | `on` \| `off` | on for `combinator`, off for `advanced` | Allow nested groups ("Add group"). Explicit value wins; otherwise defaults per structure. In `advanced`, groups use per-row And/Or joiners (no combinator header) and a nested group joins its sibling with an And/Or on its first row; when any group exists the criteria pattern turns off. |
| `lead-word` | string | `When` | Advanced variant only — the word before the first condition (e.g. `When` / `Where`). |
| `apply-mode` | `live` \| `apply` | `live` | `live` emits on every edit; `apply` shows a footer and emits on Apply. |
| `combinator-default` | `and` \| `or` | `and` | Combinator of a new/empty group. |
| `show-not` | boolean | on | Allow negating a group (`NOT`). Set `"false"` to hide the toggle. |
| `max-depth` | number | — | Cap nesting depth (root = 0); hides "Add group" at the limit. Unset = unlimited. |
| `max-group` | number | — | Cap total rules; hides "Add condition"/"Add group" at the limit. Unset = unlimited. |
| `title` | string | `Filter criteria` | Header label (sentence case). |
| `add-rule-label` | string | `Add condition` | Label of the add-condition button + empty-state CTA. |
| `add-group-label` | string | `Add group` | Label of the add-group button. |
| `empty-text` | string | `No fields configured.` | Shown when `fields` is empty. |
| `rtl` | boolean | — | Right-to-left layout. |

Boolean attributes follow the design-system convention: present = on; set `"false"` to turn off a
default-on flag.

### Properties (DOM-only)

| Property | Type | Notes |
|----------|------|-------|
| `fields` | `FieldDef[]` | Field schema (see below). |
| `operators` | `OperatorDef[]` | Optional — override/extend the built-in operator catalog. |
| `query` | `RuleGroup` | Controlled current expression (a tree). Reclaimed if assigned before upgrade. |
| `presets` | `{ id, label, query }[]` \| `null` | Host-owned saved filters. Setting it (even `[]`) turns on the preset UI; the component emits `preset-save`/`preset-select` and the host persists. `null` = off. |

```ts
type FieldDef = {
  name: string;                 // machine id; the key emitted in each rule
  label: string;                // shown in the field dropdown
  type: 'text'|'number'|'date'|'datetime'|'boolean'|'select'|'multiselect';
  options?: { label: string; value: string; disabled?: boolean }[];  // select / multiselect
  operators?: string[];         // restrict + order the operator dropdown for this field
  defaultOperator?: string;
  defaultValue?: unknown;
  placeholder?: string;
  disabled?: boolean;
};

type RuleGroup = {
  id?: string;
  combinator: 'and' | 'or';
  not?: boolean;                       // negate the whole group
  rules: Array<Rule | RuleGroup>;      // recursion → nesting
  pattern?: string;                    // advanced variant: custom criteria pattern, e.g. "1 AND (2 OR 3)"
};
type Rule = {
  id?: string; field: string; operator: string; value?: unknown;
  valueSource?: 'value' | 'field';    // 'field' → `value` holds another field's name (allow-field-source)
  joiner?: 'and' | 'or';              // advanced variant → how this row joins to the previous one
};
```

A child is a nested `RuleGroup` when it has a `rules` array; otherwise it is a leaf `Rule`. Emptying
a nested group (removing its last child) removes that group; the root group is never removed.

**Emitted value per field type:** `text`/`select` → `string`; `number` → `number` (or `[min,max]`
for *between*); `multiselect` → `string[]`; `date`/`datetime` → the picker's value string; unary
operators (`is empty`, `is true`, …) omit `value`.

### Built-in operators (by field type)

| Type | Operators |
|------|-----------|
| `text` | contains, does not contain, starts with, ends with, matches regex, equals, does not equal, is empty, is not empty |
| `number` | equals, does not equal, less than, ≤, greater than, ≥, between, not between, is empty, is not empty |
| `date` / `datetime` | is, is not, before, after, between, is empty, is not empty |
| `boolean` | is true, is false |
| `select` | is, is not, equals, does not equal, is empty, is not empty |
| `multiselect` | has any of, has all of, has none of, is empty |

Each operator has an **arity**: `0` = unary (no value editor) · `1` = single value · `2` = range
(two editors). Pass a custom `operators` array to replace the catalog entirely.

### Methods

`addRule(groupId?)` · `addGroup(groupId?)` · `removeRule(id)` · `clear()` (drops every
condition and starts fresh with one empty row — not the empty state) · `cancel()` (discards
unsaved edits: reverts to the last applied / initial query, and closes in overlay modes) ·
`apply()` · `validate() → boolean` · `getQuery() → RuleGroup` · `setQuery(tree)` · `open(trigger?)` ·
`close()` · `toggle(trigger?)` (overlay modes — pass the trigger so focus returns to it on close) ·
`loadPreset(id)` · `savePreset(label)` · `getPattern()` (advanced variant — the current pattern
string) · `setPattern(str)` (advanced variant — apply a custom criteria pattern like
`"1 AND (2 OR 3)"`, or `""` to revert to the derived one). In the UI the pattern line has an
**Edit** action (validated: numbers 1…N, AND/OR/NOT, balanced parens) and **Reset**; a custom
pattern is emitted as `query.pattern` and switches the row leads to condition numbers. When a
custom pattern is set, structural edits keep it in sync: **add** appends the new condition
(joined by its joiner), **remove** drops that condition's reference and renumbers the rest
(tidying any dangling operators / now-redundant parentheses), and **duplicate** shifts the
higher numbers up and references the copy beside its original. `addRule`/`addGroup` target the
given group id (root when omitted). Setting `fields`/`operators`/`query`/`presets` re-renders.

### Events

| Event | Detail | Fires when |
|-------|--------|-----------|
| `ds-criteria-filter-change` | `{ query, valid }` | live mode: any edit (debounced for typing). |
| `ds-criteria-filter-apply` | `{ query }` | apply mode: Apply clicked. |
| `ds-criteria-filter-clear` | `{ }` | Clear-all (header): conditions reset to one fresh empty row. |
| `ds-criteria-filter-cancel` | `{ }` | Apply-mode footer **Cancel** / overlay dismiss: unsaved edits reverted to the last applied query. |
| `ds-criteria-filter-invalid` | `{ errors }` | An edit leaves the expression invalid (`errors = [{ruleId, message}]`). |
| `ds-criteria-filter-open` / `-close` | `{ }` | Overlay modes: the popover/drawer opened or closed. |
| `ds-criteria-filter-preset-save` | `{ label, query }` | User named + saved the current tree. Host persists it into `presets`. |
| `ds-criteria-filter-preset-select` | `{ id, query }` | A saved preset was loaded (its `query` is now applied). |

> In **live** mode, binding to `change` alone is sufficient — check `detail.valid` before running the
> query. A rule with an empty value is invalid but still present in `query`.

## Usage

```html
<ds-criteria-filter id="cf" title="Filter criteria"></ds-criteria-filter>
<script type="module">
  cf.fields = [
    { name:'hostname', label:'Host name', type:'text' },
    { name:'os', label:'Operating system', type:'select',
      options:[ {label:'Windows',value:'win'}, {label:'macOS',value:'mac'} ] },
    { name:'riskScore', label:'Risk score', type:'number' },
    { name:'lastSeen', label:'Last seen', type:'date' },
  ];
  cf.query = { combinator:'and', rules:[ { field:'os', operator:'is', value:'win' } ] };
  cf.addEventListener('ds-criteria-filter-change', e => {
    if (e.detail.valid) table.rows = runQuery(e.detail.query);
  });
</script>
```

## Composition

Built from `ds-input-select` (field + operator + single-select value), `ds-token-field`
(multiselect value), `ds-text-input` (text/number value), `ds-date-picker` (date/range value,
`show-presets`), `ds-tab-filter` (per-group AND/OR combinator), `ds-toggle` (group `NOT`),
`ds-icon-button` (duplicate / remove / remove-group), `ds-button` (add condition / add group /
apply / clear), `ds-field-helper` (inline validation), `ds-empty-state` (no conditions) — all
design-tokens, no hardcoded values. Sub-component stylesheets are auto-injected.

## Reference integration

`projects/custom-groups/layout-create-group.html` — a dynamic Custom Group form where the builder
defines membership; a live "matching devices" preview evaluates the emitted query tree against a
device set (open `Layout/Shell.html?view=custom-groups-create-group`).

## Accessibility

- Each rule's field/operator/value carry `aria-label`s referencing the condition number; the
  combinator is a labeled `ds-tab-filter` (radiogroup semantics).
- Add / duplicate / remove are real buttons with explicit labels; focus moves to the new row on add
  and to a neighboring row on remove.
- Validation errors render through `ds-field-helper` (`role="alert"`), so screen readers announce
  them; the invalid row gets an error border (not colour alone — the helper text states the problem).
- All DOM queries are scoped to the component root; works across all themes and RTL.
