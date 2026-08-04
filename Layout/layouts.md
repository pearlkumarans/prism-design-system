# Endpoint Central — Page Layout Spec (Prism-aligned)

> Generation guide for Claude Code. Defines page-level layouts that compose **Prism** components and patterns. Use this together with `Prism/specs/` (component specs), `Prism/tokens/tokens.css` (CSS variables), and `Prism/foundations/patterns.md` (Prism's six pattern categories).

This file is the **page layer** — it tells you which Prism components to drop into which slots to assemble a complete page. Prism's own pattern docs describe sub-page behaviors (form rules, table anatomy, confirmation severity, etc.). The two layers are complementary.

---

## How to use this file

When generating a new page:

1. **Classify the intent** (overview, browse, view-one, create, edit, configure, walk-through, pick, author, audit). Map intent → layout ID using the **Layout Picker** table below.
2. **Open the layout entry** and copy the **Skeleton** block.
3. **Fill each slot** with the named Prism component. Required slots MUST be present. Optional slots include only when the listed rule applies.
4. **Apply Prism rules** from `foundations/patterns.md` for any embedded sub-pattern (table behavior, form behavior, confirmation severity, loading state, search/filter).
5. **Use `--prism-*` tokens** from `tokens.css`. Never hardcode color, spacing, radius, type, or elevation.
6. **If a slot is marked as a composition pattern**, follow the recipe in §8 *Composition patterns* — assemble it from existing Prism atoms + tokens. **If a slot is marked GAP**, pause and request the component be added to Prism first (these are items that need genuinely new visual or interaction work — KPI tile, Chart card, Catalog card, Info card, Stepper, Dual-list panel, Map canvas, Diagram canvas, Config panel, Preview pane, Canvas, Node palette).

If the intent doesn't cleanly fit a layout, **stop and ask** the user. Do not invent a new layout type — that's how drift happens.

---

## 1. Layout picker (intent → layout)

| User intent | Layout |
|---|---|
| "Show me what's going on at a glance" / module landing | **L02 Module Dashboard** |
| "Browse / filter / search / bulk-act on records" | **L03 List View** |
| "View one record in depth (multi-faceted)" | **L04 List–Detail** |
| "View one record's static properties" | **L05 Read-only Summary** |
| "Create or edit a record" (single screen, multi-section) | **L06 Sectioned Form** |
| "Configure settings grouped by category" | **L07 Tabbed Form** |
| "Walk the user through a sequenced task" | **L08 Wizard / Stepper** |
| "Quick task or confirmation on top of current page" | **L09 Modal / Dialog** |
| "Two parallel sets of fields" / "form with live preview" | **L10 Two-Column / Matrix Form** |
| "Pick a subset from a known catalog" (text-heavy) | **L11 Dual-List Picker** |
| "Pick from a visual catalog" (icon/logo) | **L12 Card Grid Chooser** |
| "First-time view / no data yet" | **L13 Empty State** |
| "Promote an add-on / integration that isn't enabled" | **L14 Marketing / Setup** |
| "Show me what happened (chronological)" | **L15 Log / Audit** |
| "Run a scored checklist (compliance / hardening)" | **L16 Checklist / Audit** |
| "Geographic data" | **L17 Map View** |
| "Explain how a feature works visually" | **L18 Architecture Diagram** |
| "Build a custom report" | **L19 Report Builder** |
| "Build an automation workflow" | **L20 Canvas Builder** |
| "Author rich content (emails, announcements)" | **L21 Rich-Text Editor** |
| "Static directory of links" | **L22 Link Hub** |

---

## 2. Mapping to Prism's six pattern categories

Prism organizes patterns into six categories. Each page layout below uses Prism patterns from one or more of these — you should follow the rules from the corresponding Prism pattern file when implementing the slot.

| Prism category | Applies to (page layouts) | Prism rule source |
|---|---|---|
| **Layout patterns** | L01, L04, L07 (vertical variant), L10, L19, L20 | `foundations/patterns.md → Layout patterns` |
| **Navigation patterns** | L01, breadcrumbs in all page headers, L07 (tabs), L04 (record tabs) | Header navigation · Sidebar Nav L1 · Sidebar Nav L2 · Breadcrumbs · Tab Bar specs |
| **Data entry patterns** | L06, L07, L08, L10, L11 | `foundations/patterns.md → Form patterns` |
| **Data display patterns** | L02, L03, L04, L05, L12, L15, L22 | `foundations/patterns.md → Table patterns` |
| **Feedback patterns** | L13 (empty state), banners across all layouts, loading per Prism duration tiers | `foundations/patterns.md → Empty states, Loading patterns` |
| **Action patterns** | L09 (modals), wizard finish in L08, destructive actions across L03/L04/L05 | `foundations/patterns.md → Confirmation patterns` |

---

## 3. Global rules

**App shell (L01) wraps every page** unless the page is auth/marketing or an intentional full-screen takeover (declare explicitly).

**Breadcrumbs (hard rule — top-level pages have none).** A breadcrumb exists to climb a hierarchy, so it only belongs on pages that *have* a parent to climb to. **Do NOT show breadcrumbs on dashboards (L02) or on any first-level navigation page** — a page reached directly by clicking a primary/module nav tab (its landing view, at the top of that module's hierarchy). On those pages the module context is already the nav tab; a breadcrumb would be a redundant single crumb. **Do show breadcrumbs on drill-down pages** — detail / list–detail (L04), read-only summary (L05), record editors, wizards, and any sub-page reached *from* a landing page — where they trace the path back up. In `ds-page-header`, that means top-level pages omit `show-breadcrumbs` (and don't set `.breadcrumbs`); drill-down pages set both. (Reference `TAB_DEFAULT_VIEW` in `Layout/Shell.html`: a view that is a tab's default = first-level = no breadcrumb.)

**Casing (hard rule — sentence case, never ALL CAPS).** Write every UI title, heading, section/group label, button, tab, KPI label, and menu item in **sentence case** ("Event type", "Date range", "Managed systems"). **Never ALL CAPS**, and never fake it with `text-transform: uppercase` in component or page CSS — a label that must be uppercased in code is a violation, not a style. Title Case is only for proper nouns and product/module names (Endpoint Central, BitLocker, Threats & Patches). Author labels in their final sentence case; don't rely on CSS to transform them.

**Token convention.** All visual properties come from `--prism-*` CSS variables defined in `tokens.css`. Never hardcode hex, px, font weights, radii, or shadows. If you need a value that doesn't have a token, stop and request a new token.

**Shared scaffold (`Layout/layout-base.css`).** The full-height view frame — the root flex column (`.lay-root`), the inner column (`.lay`), and the internal scroll area (`.lay__scroll`, which is `position:relative` so control internals can't escape to `ds-content`) — lives once in `Layout/layout-base.css`. It's loaded by `Shell.html` (for injected views) and by each standalone view's `<head>`. A view puts `class="lay-root"` on its root and does **not** redefine those scaffold classes; it only adds its own root-id-scoped rules. Bug-fixes to the frame (scroll, footer pinning) land in that one file.

**Banner ordering inside `PageRegion`** (top to bottom): system-level Inline message (global health) → page-level Inline message → Snackbar (transient, floats). Never stack more than two persistent banners.

**Footer action vocabulary.** Use these verbs only, primary action on the right:

| Action type | Verbs (left → right) | Use for |
|---|---|---|
| Settings save | `Cancel` · `Save` | Mail server, rebranding, simple settings |
| Policy publish | `Cancel` · `Save as Draft` · `Save & Publish` | Profiles, DLP rules, security policies |
| Deployment | `Cancel` · `Save As` · `Deploy` | Patch/software deployment |
| Wizard step | `Cancel` · `Previous` · `Next` | All wizard non-final steps |
| Wizard final step | `Cancel` · `Previous` · `Finish` *(or domain verb: `Deploy`, `Publish`)* | Last step only |
| Modal | `Cancel` · `<Primary verb>` (`Add` / `Save` / `Confirm` / `Delete`) | All dialogs |

Do NOT use: `Save Settings`, `Save Changes`, `Deploy Immediately`, `Save & Continue`, `Check`, `Add` (as a save synonym), `OK`. Stick to the table.

**Confirmation severity (Prism action pattern).** For any destructive or impactful action: choose severity per Prism's confirmation pattern (`Low` → undo toast only; `Medium` → standard Confirmation Modal; `High` → type-to-confirm; `Critical` → type + re-authenticate). The Snackbar component is the undo channel for `Low`.

**Loading state per duration tier (Prism feedback pattern):**

| Duration | Pattern |
|---|---|
| < 300ms | No indicator |
| 300ms – 2s | Skeleton matching layout shape |
| 2s – 10s | Progress bar with label |
| 10s – 60s | Progress bar with steps + cancel |
| > 60s | Background task + Snackbar on completion |

**Search & filter (Prism data entry pattern):**
- Search input always above the list/table.
- `Cmd+K` / `/` focuses search.
- 300ms debounce.
- Filter chips below search.
- Active filters render as removable Tags.
- "Clear all" link visible whenever any filter is applied.

**Filter placement (hard rule — all filters live in one filter surface):**
- **Every filter control belongs inside the one filter surface** for the page — the **Tab filter** chip row, the left **Filter sidebar**, or the **Filter panel** (`ds-filter-panel`). Never scatter individual filter controls (date-range picker, category **Dropdown**, status toggles, custom-group pickers) loose in the content area beside the table. A date range **is a filter** → it goes in the filter surface, as a `daterange` group, not floating above the table.
- **Search is the one exception:** the search **Text field** sits above the table and is *not* a filter — it stays out of the filter surface. Everything that narrows the row set by a facet is a filter and goes in.
- **If filters are primary to the task, default the filter surface to open** (sidebar/panel visible on load) rather than moving controls outside it to make them reachable. A collapsible panel still toggles closed; it just starts open.
- **Height:** a filter sidebar/panel that sits beside a `fit-viewport` **Data table** must fit the screen the same way — set `fit-viewport` on `ds-filter-panel` so it caps to the available height and scrolls its groups internally, instead of `height:auto` (which grows with the filter list and runs past the fold). The panel and table then share a height.
- **One date filter, not two.** Offer date filtering as a **single** date group — a `daterange` group with `showPresets` (and `showFooter`) — so the relative quick-picks (last 7 / 30 / 90 days, all time) **and** a custom range live in one control. Never split it into a separate "time period" radio list *and* a separate "custom date range" picker: two competing date sections let the user set conflicting values, double the surface, and produce two chips for one intent.
- **Controls fit the panel.** Every field inside the panel sizes to the column width — a `daterange` field must not keep the date-picker's wide fixed range width and overflow a ~260px sidebar; it shrinks to `width:100%`. Active-filter chips truncate with an ellipsis (keeping the × visible) rather than overflowing the panel. (The `ds-filter-panel` component enforces both.)
- Rationale: one predictable home for facets keeps the toolbar clean, makes "Clear all" and active-Tag behavior coherent, and prevents the "why is this filter over here?" drift.

**Panel slide-in animation (hard rule — animate the space, never `display:none` + a token transform).** Any panel that pushes the layout when it opens — a side drawer, filter sidebar, inspector, Ask-Zia-style pane — must **animate the width it occupies** so the neighbouring content reflows *in lockstep* with the panel. Do **not** toggle it with `display:none ⇄ flex/block` and then animate only a small `transform: translateX(Npx)` on top: `display`/`flex-basis` from `none` can't transition, so the panel's column appears in a single frame and shoves the content over in a hard snap while the panel merely glides a few pixels — the two motions are unrelated and read as jank. Two correct patterns:
- **Grid-column reveal (preferred for a dedicated 2-col surface).** Put the panel + content in a grid and transition `grid-template-columns` (and `column-gap`) between a collapsed track (`0px`) and the open width (e.g. `240px`/`400px`). This is what the L03 filter sidebar uses — copy it. The content column resizes smoothly because the *track* animates.
- **Flex-item width reveal (for a panel that is a flex sibling of the content).** Keep the panel in flow; collapse it with `width:0; min-width:0; overflow:hidden; opacity:0; visibility:hidden; pointer-events:none` (NOT `display:none`), and transition `width` + logical `margin-inline-start` + `opacity` to the open state (`width:400px`, `visibility:visible`, …). Pin the panel's own inner sections to the full open width (`> * { width:400px; flex-shrink:0 }`) so they don't re-wrap while the width animates — `overflow:hidden` clips them for a clean reveal.

Use **logical** properties (`margin-inline-start`) so it mirrors in RTL with no separate keyframes, gate everything behind `@media (prefers-reduced-motion: reduce) { transition:none }`, and, for a lazily-injected panel, prefer pre-injecting on idle so the first open only toggles a class/attribute (no fetch+parse stutter mid-animation). Reference implementation: `Layout/views/ask-zia.html` (`#askzia-pop`).

**Localization (hard rule — RTL flips direction; text must translate too).** Switching the shell to Arabic sets `dir="rtl"` (layout mirrors for free via logical CSS) **and** fires `shell:langchange`. Direction alone is not localization: a page whose strings are hardcoded English shows a mirrored layout with English text. **Every user-facing string a page renders must resolve through the shell's central catalog**, not be written inline:
- **Register once, resolve via `t()`.** On the view's init call `window.ShellCtx.addMessages({ en: {…}, ar: {…} })`, then build every label/title/heading/button/column-header/chart-category/badge/toast via `window.ShellCtx.t(key)`. Fall back to the local `en` map when opened standalone (no shell).
- **Re-render on language change.** Put all string-setting in one `applyStrings()` and call it on init **and** from `ShellCtx.onLangChange(applyStrings)` (or the `shell:langchange` event). For charts, refit after re-localizing; for tables, re-set `columns`/`bulkActions`/filter `groups` (their render fns resolve `t()` at render time).
- **Keep data values canonical; translate only display.** Filter facet values, status/enum keys, and row data stay in **one canonical language (English)** so filtering/matching logic is stable; map each to a translated **label** for display (`value: 'Encrypted'`, `label: t('…')`). Never translate the value you filter on.
- **Don't fork the mechanism.** Use `ShellCtx.t()` — do not hand-roll a per-page language toggle or a second dictionary. Proper nouns / product names (Windows 11, TPM, BitLocker) stay untranslated. Machine-translated Arabic must be flagged for native review.

Reference impls: `projects/bitlocker/layout-*.html`. Catalog + API: `ShellCtx.t` / `addMessages` / `onLangChange` in `Layout/Shell.html`.

**Empty state inside any layout:** always the Prism **Empty state** component (illustration 200–292px · sentence-case headline ≤8 words · optional 1–2 line description · single primary CTA describing the action · optional secondary link). Never inline ad-hoc empty placeholders.

**Quick Links:** when a page benefits from a curated list of supporting links (docs, related actions, KB articles), put them inside a **Right pane** on the right rail of the page. Do not create a separate page footer for Quick Links — `Right pane` is the canonical home for that content.

---

## 4. Page layouts

### L01 — App Shell

**Tier:** 1 (chrome — wraps every page)

**Purpose.** Constant chrome around every authenticated screen.

**Use when:** every authenticated screen.
**Don't use when:** login / signup / standalone marketing pages, intentional full-screen takeover (declare explicitly).

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `TopBar` | Single | **Header navigation** | Required |
| 2 | `LeftNav` | Single | **Sidebar Nav L1** (collapsed icon rail by default; expands on hover/pin) | Required |
| 3 | `LeftSubNav` | Single | **Sidebar Nav L2** (within a module that has sub-sections) | Optional |
| 4 | `PageRegion` | Single | Layout body (L02–L22) | Required |
| 5 | `SystemBanner` | Single | **Inline message** (variant: `warning` / `error`, full width, top of `PageRegion`) | Optional — only if a global health issue is active |
| 6 | `Toast` | Single | **Snackbar** (floats over content) | Optional — driven by actions, not a literal slot |

**Skeleton.**

```
AppShell
├── Header navigation      [Required, sticky top]
├── Sidebar Nav L1      [Required, sticky left]
│   └── Sidebar Nav L2?           [Optional, when module has sub-sections]
└── PageRegion      [Required, scrollable]
    ├── Inline message?  (system)           [Optional, top]
    └── <Layout body — L02–L22>
    ── Snackbar (overlay)           [Optional, anchored bottom or top-right]
```

**Rules.**
- Use **Sidebar Nav L2** only when a module has its own sub-sections (e.g., MDM profile categories, Settings sub-tree). Do not introduce a third nav variant.
- Header navigation and Sidebar Nav are sticky; only `PageRegion` scrolls.

---

### L02 — Module Dashboard

**Demo:** `Layout/views/layout-module-dashboard.html` (standalone) · `Layout/Shell.html?view=module-dashboard` (in-shell)
**Spec:** `handoff/layout-l02-module-dashboard.md` · Figma ref (visual only): node 22090:525264

**Tier:** 1
**Purpose.** At-a-glance read of a module: counters, key metrics, recent activity, drill-down entry points.

**Use when:** module landing with measurable health (counts, charts, recent activity).
**Don't use when:** configuration-only module → **L07** or **L13**. Single-record context → **L05** or **L04**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (title · primary action via Button or Split button) — **no breadcrumb** (dashboard = top-level; see §3 Breadcrumbs) | Required |
| 2 | `PageBanner` | Single | **Inline message** | Optional |
| 3 | `SecondaryTabs` | Single | **Tab Bar Horizontal** | Optional — only when the dashboard has sibling dashboards |
| 4 | `KpiRow` | Single | `KPI tile` row — **GAP** *(see §8)* | Required |
| 5 | `ChartGrid` | Single | `Chart card` grid — **GAP** *(see §8)* | Required |
| 6 | `RightRail` | Single | **Right pane** containing either an `Activity feed` *(composition pattern — see §8)* or a **Quick Links** group (Links + Divider) | Required — every dashboard ships with a right pane (Quick Links by default, Activity feed when a stream is relevant) |
| 7 | `BottomTables` | Repeating (≤2) | **Data table** | Optional |

**Skeleton.**

```
PageRegion
├── Page header      [Required]
├── Inline message?           [Optional]
├── Tab Bar Horizontal?           [Optional]
├── KPI row             (GAP)      [Required, 3–5 tiles]
├── 2-col layout
│   ├── Chart grid     (GAP, 2–3 cols)      [Required]
│   └── Right pane (Quick Links | Activity feed)      [Required, right]
└── Data table ×0–2           [Optional]
```

**Rules.**
- KPIs first → charts second → tables last. Never invert.
- Max 5 KPIs; if more, push to a secondary dashboard via `Tab Bar Horizontal`.
- `Right pane` defaults to a Quick Links group; swap to Activity feed only when the dashboard surfaces a steady, time-ordered stream.
- Loading: skeleton the entire grid until data resolves (Prism 300ms–2s tier).

---

### L03 — List View

**Demo:** `Layout/views/layout-list-view.html` (standalone) · `Layout/Shell.html?view=list-view` (in-shell) — variant B (left filter sidebar)
**Spec:** `handoff/layout-l03-list-view.md`

**Tier:** 1
**Purpose.** Browse, filter, search, and bulk-act on a collection of records.

**Use when:** primary job is to scan + act on records; > ~10 items.
**Don't use when:** < 10 items with visual identity → **L12**. Single record → **L04** / **L05**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (title · primary action via **Button** or **Split button**) — breadcrumb only when this list is a drill-down sub-page; **omit it when the list is a first-level nav landing** (see §3 Breadcrumbs) | Required |
| 2 | `KpiRow` | Single | `KPI tile` row — **GAP** | Optional — only if the list has measurable summary state |
| 3 | `Search` | Single | **Text field** (search variant, `/` and `Cmd+K` shortcut, 300ms debounce) | Required |
| 4 | `FilterBar` | Single | **Tab filter** (chip-style filters) OR a left **Filter sidebar** composing **Menu** + **Checkbox** rows + **Counter** counts (used when filters are categorical) | Required |
| 5 | `ActiveFilters` | Single | **Tag** row (each active filter is a removable Tag, plus a "Clear all" Link) | Required (when any filter is applied) |
| 6 | `BulkActionBar` | Single | **Bulk action bar** — composition of **Counter** + **Button** group + overflow **Menu** / **Dropdown menu** + Divider; appears above table when ≥1 row selected | Required |
| 7 | `DataTable` | Single | **Data table** (sticky header · checkbox column first · sortable headers · row hover actions · skeleton loading · pagination at bottom-right) | Required |
| 8 | `Pagination` | Single | Built into Data table | Required |
| 9 | `RightRail` | Single | **Right pane** with a Quick Links group (Links + Divider) | Optional — include on list landing pages; omit on sub-pages |

**Skeleton — variant A (top filter bar, default).**

```
PageRegion
├── Page header      [Required, primary CTA]
├── KPI row?           [Optional]
├── Text field (search)      [Required]
├── Tab filter      [Required]
├── Tag row (active filters)      [Required when filters applied]
├── Bulk action bar                       [Conditional on selection]
├── 2-col layout
│   ├── Data table      [Required]
│   └── Right pane (Quick Links)?           [Optional, landing pages]
```

**Skeleton — variant B (left filter sidebar, for category-driven lists).**

```
PageRegion
├── Page header
├── 3-col layout
│   ├── Filter sidebar (Menu + Checkboxes)      [Required, left]
│   ├── Content
│   │   ├── Text field (search)
│   │   ├── Tag row (active filters)
│   │   ├── Bulk action bar
│   │   └── Data table
│   └── Right pane (Quick Links)?           [Optional]
```

**Rules.**
- Follow Prism table pattern: name column first (after checkbox), status as **Status indicator** or **Badge**, dates as relative time with absolute on **Tooltip**, actions last and right-aligned, visible columns ≤ 7–8.
- Loading: skeleton rows matching the column layout (no spinner overlay).
- Empty state inside the table uses the Prism **Empty state** component, replacing the body, not the whole page.

---

### L04 — List–Detail (record drilldown)

**Demo:** `Layout/views/layout-list-detail.html` (standalone) · `Layout/Shell.html?view=list-detail` (in-shell)
**Spec:** `handoff/layout-l04-list-detail.md` · Figma ref (visual only): node 22046:71053 · builds on L03 (`layout-list-view`)

**Tier:** 1
**Purpose.** Drill into one record and show all its facets.

**Use when:** record has multiple facets to inspect (devices · apps · certs · threats · audit logs). User arrives from **L03**.
**Don't use when:** record has only a few static fields → **L05**. Editing is the primary task → **L06**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `RecordHeader` | Single | **Page header** (record name · status via **Status indicator** · **Avatar** when relevant · primary action + overflow Dropdown) | Required |
| 2 | `KpiRow` | Single | `KPI tile` row — **GAP** | Optional — only when the record has quantifiable state |
| 3 | `FacetTabs` | Single | **Tab Bar Horizontal** (`Summary` · sub-area 1 · sub-area 2 · `Audit Logs`) | Required |
| 4 | `FacetContent` | Single | Per-tab body. Each tab uses **L05** (summary) or **L03** (sub-list). | Required |

**Skeleton.**

```
PageRegion
├── Page header (record context)      [Required]
├── KPI row?           [Optional, record-scoped]
├── Tab Bar Horizontal      [Required, "Summary" first, "Audit Logs" last]
└── Facet content
    └── <L05 or L03 body>
```

**Rules.**
- First tab always `Summary`; last tab always `Audit Logs` when any audit data exists.
- KPIs are about the record, not the module.

---

### L05 — Read-only Summary

**Tier:** 1
**Purpose.** Display a record's properties without inline editing.

**Use when:** edit happens on a separate page / modal, or data is system-sourced.
**Don't use when:** most fields are commonly edited → use **L06**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (breadcrumb · title · `Modify` and `Delete` Buttons) | Required |
| 2 | `PageBanner` | Single | **Inline message** | Optional |
| 3 | `SummaryGroups` | Repeating | `Key-value group` *(composition pattern — see §8)* — headings + label/value rows + **Divider** + **Status indicator** / **Badges** for state fields | Required |
| 4 | `RightRail` | Single | **Right pane** — hosts an `Info card` (GAP: QR · illustration · related Link) and/or a Quick Links group | Optional |

**Skeleton.**

```
PageRegion
├── Page header (Modify, Delete actions)      [Required]
├── Inline message?           [Optional]
└── 2-col layout (when Right pane present, else 1-col)
    ├── Key-value group ×n      [Required]
    └── Right pane (Info card | Quick Links)?           [Optional, right]
```

**Rules.**
- Group fields by domain meaning (General, Identity, Hardware, Policy …).
- Use **Status indicator** for state fields, never raw text.
- Use **Accordion** when read-only groups exceed 6.

---

### L06 — Sectioned Form (single column)

**Demo:** `Layout/views/layout-sectioned-form.html` (standalone) · `Layout/Shell.html?view=sectioned-form` (in-shell)
**Spec:** `handoff/layout-l06-sectioned-form.md`

**Tier:** 1
**Purpose.** Create or edit a record with multiple grouped sections on one page.

**Use when:** > 3 sections of fields; order is not strict.
**Don't use when:** sequence matters → **L08**. Two parallel field sets → **L10**. Short form (< 8 fields) → still use this but skip section headers per Prism single-page form rule.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (breadcrumb · inline editable name **Text field**) | Required |
| 2 | `PageBanner` | Single | **Inline message** | Optional |
| 3 | `FormSections` | Repeating | `Form section` *(composition pattern — see §8)* — section heading + **Divider** + slotted form atoms (**Text field** · **Text area** · **Dropdown** · **Checkbox** · **Radio button** · **Switch** · **Slider** · **Date picker** · **Script editor**) + inline **Inline message** for validation | Required |
| 4 | `HelperPanel` | Single | **Right pane** (Best Practices / Tips) | Optional — only when guidance materially improves success |
| 5 | `FormFooter` | Single | `Form footer` *(composition pattern — see §8)* — sticky bar of **Button** group per footer-action vocabulary | Required |

**Skeleton.**

```
PageRegion
├── Page header (inline name field)      [Required]
├── Inline message?           [Optional]
├── 2-col layout (if Right pane present)
│   ├── Form section ×n      [Required, vertical stack]
│   └── Right pane           [Optional, sticky right]
└── Form footer      [Required, sticky bottom]
```

**Rules.**
- One `Form section` per logical group. Use **Accordion** when sections > 6.
- Inline name field at top, not a separate "Name" section.
- Validate on blur (Prism form rule) — inline **Inline message** under the field.
- Required indicator on optional fields, not on required ones (Prism form rule).
- Auto-save draft state where the workflow is long-running.

---

### L07 — Tabbed Form / Settings

**Demo:** `Layout/views/layout-tabbed-form.html` (standalone) · `Layout/Shell.html?view=tabbed-form` (in-shell)
**Spec:** `handoff/layout-l07-tabbed-form.md` · built on L06 (`layout-sectioned-form`)

**Tier:** 1
**Purpose.** Group related settings into top-level categories.

**Use when:** settings fall into clearly distinct categories; one form would exceed ~6 sections.
**Don't use when:** sequential → **L08**. Categories > 5 → use the **vertical sub-nav variant** below.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `CategoryTabs` | Single (default variant) | **Tab Bar Horizontal** | Required (≤ 5 categories) |
| 2v | `CategoryNav` | Single (vertical variant) | **Tab Bar Vertical** | Required (> 5 categories) |
| 3 | `FormSections` | Repeating | `Form section` *(composition pattern — see §8)* | Required |
| 4 | `FormFooter` | Single | `Form footer` *(pattern — see §8)* | Required |

**Skeleton — default (horizontal tabs).**

```
PageRegion
├── Page header
├── Tab Bar Horizontal      [Required]
├── Form section ×n      [Required, swap with tab]
└── Form footer      [Required, sticky]
```

**Skeleton — vertical variant (> 5 categories, e.g., MDM Profile Setup).**

```
PageRegion
├── Page header
├── 2-col layout
│   ├── Tab Bar Vertical      [Required, fixed-width left]
│   └── Form section ×n      [Required, scroll right]
└── Form footer      [Required, sticky, full width]
```

**Rules.**
- ≤ 5 categories → horizontal. > 5 → vertical sub-nav. Never mix.
- Saving applies across all categories on submit, unless a Publish split is explicit.

---

### L08 — Wizard / Stepper

**Tier:** 1
**Purpose.** Guide the user through a sequenced multi-step task.

**Use when:** ≥ 2 dependent steps.
**Don't use when:** all fields are independent → **L06**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (breadcrumb · inline editable name) | Required |
| 2 | `Stepper` | Single | `Stepper` (horizontal for 2–3 steps; vertical for ≥4 steps) — **GAP** *(see §8; pair with Progress bar for "Step n of N")* | Required |
| 3 | `StepContent` | Single | Step body — typically **`Form section` ×n** *(pattern)*. May host **L11** (dual-list) or **L12** (card grid) inside a step. | Required |
| 4 | `HelperPanel` | Single | **Right pane** | Optional |
| 5 | `WizardFooter` | Single | `Wizard footer` *(composition pattern — see §8)* (Buttons per footer-action vocab; `Save as Draft` secondary for ≥4 steps) | Required |

**Skeleton.**

```
PageRegion
├── Page header (inline name)      [Required]
├── Stepper  (GAP)      [Required, horizontal OR vertical]
├── Step content      [Required, swaps with step]
│   └── Form section ×n | L11 | L12
├── Right pane?           [Optional]
└── Wizard footer      [Required, sticky]
```

**Rules.**
- 2–3 steps → horizontal Stepper. ≥ 4 steps → vertical Stepper on the left.
- Do NOT use inline "Step 1 / Step 2" headings — use the Stepper component.
- Allow `Previous`; never block back-nav (Prism form rule).
- Disable `Next` until required fields validate (Prism form rule).
- Final step verb is the domain verb (`Deploy`, `Publish`, `Finish`), not `Save`.
- Auto-save draft state at every step boundary.

---

### L09 — Modal / Dialog

**Tier:** 1
**Purpose.** Focused short task on top of the current page.

**Use when:** task completes in < 30 s; user shouldn't lose context.
**Don't use when:** ≥ 4 fields → full page (**L06**). Multi-step → **L08**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `ModalHeader` | Single | Modal header (title + close) | Required |
| 2 | `ModalBody` | Single | Body — form fields, key-value view, embedded picker | Required |
| 3 | `ModalFooter` | Single | Footer Buttons (`Cancel` left · primary right) | Required |

**Component selection — pick by purpose first, then by size.**

| Purpose | Prism component | Width | Use for |
|---|---|---|---|
| Confirm a destructive or impactful action | **Confirmation Modal** | 480–640 px | Severity Medium → standard confirm; High → type-to-confirm; Critical → type + re-auth |
| Short form / detail viewer / quick task | **Modal** *(default)* | 480 (sm) · 640 (md) · 880 (lg) | 2–4 field forms · key-value detail viewer · simple picker |
| Wide content surface | **Fullscreen Modal** | 1100 px / full-bleed | Catalog picker with sidebar filters · **Rich text editor** · dual-list picker |

**Skeleton.**

```
Modal (default) | Confirmation Modal | Fullscreen Modal
├── Header (title + close)      [Required]
├── Body      [Required]
│   └── <form fields | Key-value group | Dual-list | Card grid | Rich text editor>
└── Footer Buttons      [Required: Cancel left, primary right]
```

**Rules.**
- Severity per Prism confirmation pattern: Low (no modal — **Snackbar** undo); Medium (**Confirmation Modal**); High (type-to-confirm inside **Confirmation Modal**); Critical (type + re-auth inside **Confirmation Modal**).
- Use **Modal** (default) for non-destructive tasks — picking, viewing, editing short forms. Use **Confirmation Modal** only when the user is committing to a consequence.
- Backdrop click dismisses only when there are no unsaved changes.
- Never nest modals.
- Lock body scroll while open.

---

### L10 — Two-Column / Matrix Form

**Tier:** 2
**Purpose.** Edit paired field sets (corporate vs employee-owned, hardware vs software) or form-with-preview.

**Use when:** data has a natural parallel structure, or a live preview is meaningful.
**Don't use when:** default — single-column **L06**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `LeftColumn` | Single | `Form section` stack *(pattern — see §8)* | Required |
| 3 | `RightColumn` | Single | `Form section` stack *(pattern)* OR `Live preview` pane — **GAP** | Required |
| 4 | `FormFooter` | Single | `Form footer` *(pattern — see §8)* | Required |

**Skeleton.**

```
PageRegion
├── Page header
├── 2-col layout (equal, or 60/40 with preview)
│   ├── Form section stack (left)   (GAP)
│   └── Form section stack (right) | Live preview  (GAP)
└── Form footer      [Required, sticky, full width]
```

**Rules.**
- Both columns must be parallel in concept. If not, use **L06**.
- Live preview variant: left 60 % form, right 40 % preview; preview sticky on scroll.

---

### L11 — Dual-List Picker

**Tier:** 2
**Purpose.** Move items between Available and Selected.

**Use when:** picking an arbitrary subset of text-heavy items, visibility of selection matters.
**Don't use when:** one value → **Dropdown**. Items have visual identity → **L12**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (page-level use) | Required (page) |
| 2 | `PickerContext` | Single | Header strip (`Dropdown` for target, `Tag` chips for scope) | Optional |
| 3 | `AvailableList` | Single | `Dual-list panel` — **GAP** (composition of **Text field** search + **Tab filter** + virtualized scroll list of **Checkbox** rows) | Required |
| 4 | `TransferControls` | Single | `Transfer controls` — **GAP** (Buttons: Add / Remove / Add All / Remove All) | Required |
| 5 | `SelectedList` | Single | `Dual-list panel` with **Counter** badge for selected count | Required |
| 6 | `InfoCallout` | Single | **Inline message** (info variant) | Optional |
| 7 | `FormFooter` | Single | `Form footer` *(pattern — see §8)* | Required |

**Skeleton.**

```
PageRegion (or modal body)
├── Page header
├── Picker context?
├── 3-col layout
│   ├── Available  (GAP)
│   ├── Transfer controls  (GAP)
│   └── Selected   (GAP, with Counter badge)
├── Inline message?
└── Form footer
```

**Rules.**
- Per-list search always present.
- Selected list shows count badge via **Counter**.
- Page-level when this is the primary task; modal only when it's a side flow.

---

### L12 — Card Grid Chooser / Catalog

**Tier:** 2
**Purpose.** Browse a discrete set of options visually.

**Use when:** items have visual identity (icon, logo, screenshot).
**Don't use when:** uniform records → **L03**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (page-level) or **Modal** / **Fullscreen Modal** header (when used as a picker) | Required |
| 2 | `CatalogControls` | Single | Composition: **Text field** (search) · **Dropdown** filters · **Tab Bar Horizontal** for platform · **Tab filter** for facets | Required |
| 3 | `CardGrid` | Single | `Catalog card grid` — **GAP** (per Prism, **Cards** are in-progress) | Required |
| 4 | `AddTile` | Single | `Add tile` — **GAP** (last cell, dashed border) | Optional |
| 5 | `Pagination` | Single | Pagination | Optional — only when items > 24 |
| 6 | `FormFooter` | Single | `Form footer` *(composition pattern — see §8)* | Optional — when used as a picker |

**Skeleton.**

```
PageRegion (or Modal | Fullscreen Modal body)
├── Page header
├── Catalog controls (Text field + Dropdown + Tabs)
├── Card grid  (GAP)
│   └── Catalog card * + Add tile?
├── Pagination?
└── Form footer?
```

**Rules.**
- 3 columns default desktop; 4–5 only when cards are compact icon-only.
- Selected state on cards must be visible (border + check Icon).
- Use **Status indicator** inside cards for state badges.

---

### L13 — Empty State

**Tier:** 2
**Purpose.** Welcome the user to an unconfigured feature or to a list with no data; explain value and provide a CTA.

**Use when:** unconfigured module · first-time view · list with no data.
**Don't use when:** list has data → **L03**. Promoting paid/integration add-on → **L14**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required (page-level use) |
| 2 | `EmptyState` | Single | **Empty state** (Prism component: Illustration 200–292 px · headline · description · primary action **Button** · optional secondary **Link**) | Required |
| 3 | `BenefitList` | Single | `Benefit list` *(composition pattern — see §8)* (3–5 bulleted items) | Optional |

**Skeleton.**

```
PageRegion (or container inside another layout)
├── Page header?
└── Empty state      [Required]
    ├── Illustration (Prism library)
    ├── Headline (sentence case, ≤8 words)
    ├── Description (1–2 lines)
    ├── Benefit list?
    └── Primary Button + secondary Link
```

**Rules.**
- One canonical Prism illustration set; no module-specific empty-state styles.
- CTA describes the action (e.g., `Add device`), not the state (`No devices`).
- Use inside a Data table body when a filtered list is empty.

---

### L14 — Marketing / Setup Page (add-on)

**Tier:** 2
**Purpose.** Promote and walk through the activation of an integration or paid add-on.

**Use when:** user has not yet enabled an integration; page is both pitch and onboarding.
**Don't use when:** already configured → switch to **L05** or **L07**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `BrandedHero` | Single | `Branded hero` *(composition pattern — see §8)* (Logo + headline + Button) | Required |
| 2 | `BenefitList` | Single | `Benefit list` *(composition pattern — see §8)* | Required |
| 3 | `SetupSteps` | Single | `Setup step list` *(composition pattern — see §8)* (numbered cards with Icon + title + per-step Button) | Required |
| 4 | `SideHelper` | Single | `Info card` — **GAP** (docs Links, contact, video) | Optional |

**Skeleton.**

```
PageRegion
├── Branded hero      [Required, full width]
├── Benefit list      [Required]
└── 2-col layout
    ├── Setup step list      [Required]
    └── Info card  (GAP)?           [Optional, right]
```

**Rules.**
- Once activated, migrate the page to **L05** or **L07**.

---

### L15 — Log / Audit View

**Tier:** 2
**Purpose.** Chronological activity records with filters.

**Use when:** investigating what happened, when, by whom.
**Don't use when:** user needs to act on rows → **L03**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `FilterBar` | Single | Composition: **Date picker** (range) · **Dropdown** (module/user/device) · **Button** (`Apply`) | Required |
| 3 | `SummaryStrip` | Single | `Key-value strip` *(composition pattern — see §8)* (status · last update · totals) | Optional |
| 4 | `ActivityTable` | Single | **Data table** (timestamp · actor · action · target · result, sorted DESC by timestamp) | Required |
| 5 | `Pagination` | Single | Pagination | Required |

**Skeleton.**

```
PageRegion
├── Page header
├── Filter bar (Date picker + Dropdown + Apply Button)
├── Key-value strip?
├── Data table      [Required, timestamp DESC]
└── Pagination
```

**Rules.**
- Default sort: timestamp DESC.
- Filters require explicit `Apply` (debounce can be expensive).

---

### L16 — Checklist / Audit Page

**Tier:** 2
**Purpose.** Scored compliance / hardening / posture checklist where each row is independently actionable.

**Use when:** security hardening · compliance · posture review.
**Don't use when:** bulk action → **L03**.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `ScoreBanner` | Single | `Score banner` *(composition pattern — see §8)* (Progress bar + score number + summary text) | Required |
| 3 | `ChecklistGroups` | Repeating | `Checklist group` *(composition pattern — see §8)* (heading + rows of label · **Status indicator** · `Modify` **Button**) | Required |
| 4 | `AdvancedSection` | Single | **Accordion** (single-expand) wrapping advanced rows | Optional |

**Skeleton.**

```
PageRegion
├── Page header
├── Score banner  (GAP, uses Progress bar)
├── Checklist group ×n  (GAP, uses Status indicator)
└── Accordion?
```

**Rules.**
- Status canon: **Status indicator** values `Pass` · `Fail` · `Warning` · `Not applicable`.
- Each row has one action: `Modify` Button → opens **Confirmation Modal** or routes to **L06**.

---

### L17 — Map View

**Tier:** 3
**Purpose.** Geographic visualization (e.g., device location).

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `MapFilterBar` | Single | **Tab filter** + **Dropdown** + **Date picker** | Required |
| 2 | `MapCanvas` | Single | `Map canvas` — **GAP** (third-party map; full-bleed) | Required |
| 3 | `MapDetailDrawer` | Single | **Right pane** (drawer, on marker click) | Optional |

```
PageRegion
├── Map filter bar
└── Map canvas  (GAP)
    └── Right pane?
```

---

### L18 — Architecture / Topology Diagram

**Tier:** 3
**Purpose.** Visually explain how a feature works.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `DiagramCanvas` | Single | `Diagram canvas` — **GAP** (boxes + arrows OR zone-grouped cards using **Cards** when available) | Required |
| 3 | `LegendOrCaption` | Single | `Legend` *(composition pattern — see §8)* (composition of **Tag** + caption text) | Required |
| 4 | `RelatedTable` | Single | **Data table** | Optional |

```
PageRegion
├── Page header
├── Diagram canvas  (GAP)
├── Legend  (GAP, uses Tag)
└── Data table?
```

---

### L19 — Report Builder

**Tier:** 3
**Purpose.** Compose a custom report with live preview.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** (inline name **Text field**) | Required |
| 2 | `ConfigPanel` | Single | `Config panel` — **GAP** (internal **Tab Bar Vertical**: Sub-Module · Type · Columns · Filter) | Required |
| 3 | `PreviewPane` | Single | `Preview pane` — **GAP** (renders a sample Data table) | Required |
| 4 | `BuilderFooter` | Single | Composition of Buttons (`Cancel` · `Save Draft` · `Save` · `Preview`) | Required |

```
PageRegion
├── Page header
├── 2-col layout
│   ├── Config panel  (GAP)
│   └── Preview pane  (GAP)
└── Builder footer (Buttons)
```

---

### L20 — Canvas Builder (workflow / automation)

**Tier:** 3
**Purpose.** Visual node-and-edge builder.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `BuilderHeader` | Single | **Page header** (inline name · `Save` / `Save as Draft` Buttons) | Required |
| 2 | `Canvas` | Single | `Canvas` — **GAP** (dotted bg, drop zones) | Required |
| 3 | `NodePalette` | Single | `Node palette` — **GAP** (right column, draggable nodes) | Required |
| 4 | `NodeInspector` | Single | **Right pane** (slide-in when node selected; replaces palette) | Optional |

```
PageRegion
├── Page header (Save / Save as Draft Buttons)
└── 2-col layout
    ├── Canvas  (GAP)
    └── Node palette  (GAP)
        └── Right pane?  (replaces palette on selection)
```

---

### L21 — Rich-Text / Content Editor Page

**Tier:** 3
**Purpose.** Author rich content (announcements, notifications).

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `TitleField` | Single | **Text field** | Required |
| 3 | `Editor` | Single | **Rich text editor** | Required |
| 4 | `IconPicker` | Single | `Icon picker` *(composition pattern — see §8)* (uses **Icon** library) | Optional |
| 5 | `VariablePanel` | Single | `Variable token panel` *(composition pattern — see §8)* (right rail of **Tag** chips representing variables) | Optional |
| 6 | `FormFooter` | Single | `Form footer` *(composition pattern — see §8)* (`Cancel` · `Save Draft` · `Publish`) | Required |

```
PageRegion
├── Page header
├── Text field (title)
├── 2-col layout (if Variable panel present)
│   ├── Rich text editor + Icon picker?
│   └── Variable token panel?
└── Form footer
```

---

### L22 — Link Hub

**Tier:** 3
**Purpose.** Curated directory of links.

| Order | Slot | Cardinality | Prism component | Required? |
|---|---|---|---|---|
| 1 | `PageHeader` | Single | **Page header** | Required |
| 2 | `LinkSections` | Repeating | `Link section` *(composition pattern — see §8)* (composition of section heading + **Divider** + a list of **Link** items) | Required |

```
PageRegion
├── Page header
└── 3-col layout
    └── Link section ×n  (GAP, uses Link + Divider)
```

---

## 5. Component mapping summary (my slot → Prism component)

Slots that map directly to a single Prism component:

| Slot | Prism component |
|---|---|
| `TopBar` | Header navigation |
| `LeftNav` | Sidebar Nav L1 |
| `LeftSubNav` | Sidebar Nav L2 |
| `PageHeader` | Page header |
| `PageBanner` · `SystemBanner` | Inline message |
| `Toast` | Snackbar |
| `Search` | Text field (search variant) |
| `Tabs (horizontal)` | Tab Bar Horizontal |
| `Tabs (vertical / sub-nav)` | Tab Bar Vertical |
| `FilterBar` (chip) | Tab filter |
| `DataTable` · `Pagination` | Data table |
| `HelperPanel` · `Drawer` · `Quick Links` | Right pane |
| `Modal (default — short form, picker, viewer)` | Modal |
| `Modal (confirmation, type-to-confirm)` | Confirmation Modal |
| `Modal (xl, full-bleed)` | Fullscreen Modal |
| `EmptyState` | Empty state |
| `RichTextEditor` | Rich text editor |
| `ScriptEditor` | Script editor |
| `StatusPill` | Status indicator |
| `Badge / count` | Badges · Counter |
| `Date / range input` | Date picker · Calendar |
| `Form input (text)` | Text field |
| `Form input (multi-line)` | Text area |
| `Form input (single choice)` | Dropdown · Radio button |
| `Form input (boolean)` | Switch · Checkbox |
| `Form input (range)` | Slider |
| `Form input (one-time code)` | OTP input |
| `Group expand/collapse` | Accordion |
| `Identity image` | Avatar |
| `Inline tip` | Tooltip |
| `Progress` | Progress bar |
| `Action menu` | Menu · Dropdown menu · Split button |
| `Overflow / contextual menu` | Menu · Dropdown menu |
| `Bulk action overflow` | Menu (paired with Counter + Buttons in the Bulk action bar) |
| `Removable label` | Tag |
| `Hyperlink` | Link |
| `Iconography` | Icon |

---

## 6. Gaps — components my layouts need that Prism doesn't yet have

Prism's `Components.html` listed six **In-progress** categories: **Cards · Widgets · KPIs · Dialogs · Popovers · Menus**. Of these, **Dialogs** (Modal default + Confirmation Modal) and **Menus** (Menu · Dropdown menu) have since shipped, so they no longer appear as gaps. The remaining gaps map to **Cards · Widgets · KPIs · Popovers**, plus new primitives.

| Gap component | Used in layouts | Maps to Prism in-progress | Notes |
|---|---|---|---|
| `KPI tile` (and `KPI tile row`) | L02, L03 (optional), L04 (optional) | **KPIs** | Add to Prism KPIs spec. Anatomy: label · value · trend (`Status indicator` + percent) · optional sparkline. |
| `Chart card` (and `Chart grid`) | L02 | **Widgets** | Donut / bar / gauge / heatmap variants. Add a `chart-card.md` spec. |
| `Catalog card` (and `Add tile`) | L12, L18 | **Cards** | Visual choice card with icon · title · description · primary Button. |
| `Info card` · `Side info card` | L05, L14 | **Cards** | QR / illustration / related Link card. Hosted inside **Right pane**. |
| `Stepper` (horizontal + vertical) | L08 | New | Step indicator with state (done / active / pending) + optional Progress bar. |
| `Dual-list panel` · `Transfer controls` | L11 | New | Side-by-side list selector. Worth a dedicated spec. |
| `Map canvas` | L17 | New (third-party wrapper) | Wraps a vendor map; standardize controls + drawer use of **Right pane**. |
| `Diagram canvas` · `Legend` | L18 | New | Boxes-and-arrows or zone-grouped Cards. Legend composes Tag + caption. |
| `Config panel` · `Preview pane` | L19 | New | Two-pane builder primitives. |
| `Canvas` · `Node palette` | L20 | New | Workflow/automation builder primitives. |

**Resolved (no longer gaps):**

- `Bulk action bar` — composes existing **Menu** / **Dropdown menu** + **Button** + **Counter**; documented inline in L03.
- `Filter sidebar` — composes **Menu** + **Checkbox** + **Counter**; documented inline in L03 variant B.
- `Quick links footer` — folded into **Right pane** (Quick Links group), used by L02, L03, L05 right-rail slots.
- `Modal default` / `Confirmation Modal` — both Prism components; selection rules documented in L09.
- `Action menu` — uses **Menu** / **Dropdown menu** / **Split button**.

**Naming convention for new components.** Use Prism's existing convention: kebab-case file name (`kpi-tile.md`), Title Case display name (`KPI tile`). Place atoms under `specs/atoms/`, molecules under `specs/molecules/`, organisms under `specs/organisms/`, layout primitives under `specs/patterns/`.

---

## 7. Prism components I don't use at the page-layout level

These are component-level atoms that live inside `Form section`, table cells, or other slots, but are not page-layout slots themselves. They're still required — just slotted, not headlined.

`Button · Checkbox · Date picker · Dropdown · Icon · Link · OTP input · Progress bar · Radio button · Slider · Split button · Status indicator · Switch · Tag · Text area · Text field · Tooltip · Avatar · Badges · Counter · Divider · Accordion · Calendar · Script editor · Menu · Dropdown menu`

And the AI-assistant surface: `Zia Experience` — slot it into pages as a **Right pane** variant or a floating launcher, on a case-by-case basis. Not a default page slot.

---

## 8. Composition patterns

Many page slots are assembled from existing Prism atoms rather than a dedicated wrapper component. These are **composition patterns** — encode the rules here, compose them from Prism atoms and tokens at generation time. **They do not need new components built in Prism.**

For true component gaps that still need new Prism components, see §6 *Gaps*. Placeholder recipes for those gaps are at the bottom of this section so generation work can proceed before the real components land.

### 8.1 Composition patterns (build from existing Prism atoms)

**`Form section`** — grouped block of form atoms:
- Section heading (h3 type token) + optional description (body type · `--prism-text-muted`)
- **Divider**
- Stack of form atoms (**Text field** · **Text area** · **Dropdown** · **Checkbox** · **Radio button** · **Switch** · **Slider** · **Date picker** · **Calendar** · **OTP input** · **Script editor**)
- Inline validation: **Inline message** anchored under each invalid field
- Required indicator on optional fields (per Prism form pattern), not on required ones
- **Consistent field rhythm:** every field reserves the same helper-row slot (the field
  body's 4px gap + the 16px helper row) whether or not it shows a counter/helper — so a field
  with a "0/100" counter and one without line up on the same vertical spacing. In the field
  stack, add `.lay__field { padding-bottom: 20px }` and cancel it where a helper already renders
  with `.lay__field:has(ds-field-helper) { padding-bottom: 0 }`. Don't let only the counter'd
  field carry extra space — that reads as uneven gaps.

**`Form footer`** — sticky action bar at the bottom of a form page:
- Background `--prism-surface`, top border `1px solid --prism-border`
- **Button** group aligned right; primary Button on far right
- Verbs come from §3 Footer Action Vocabulary

**`Wizard footer`** — variant of Form footer for **L08** wizards:
- `Cancel` **Button** left
- `Previous` + `Next` (or `Finish` / domain verb) **Button** group right
- For wizards with ≥4 steps, add `Save as Draft` as a secondary Button next to `Previous`

**`Bulk action bar`** — appears above a Data table when ≥1 row selected:
- **Counter** ("3 selected") on the left
- **Button** group for the most common actions
- **Menu** / **Dropdown menu** at the end for overflow actions
- `Clear selection` **Link** on the right
- Background `--prism-surface-hover`, separated from the Data table by a **Divider**

**`Filter sidebar`** — left-rail filter for category-driven lists (L03 variant B):
- **Menu** as the container with grouped sections
- Each row: **Checkbox** + label + **Counter** badge for hit count
- `Clear all` **Link** at the top when any filter is active

**`Quick Links group`** — content inside **Right pane**:
- Section heading + **Divider** + stack of **Link** items
- Multiple categories: repeat heading + **Divider** + Link list

**`Activity feed`** — content inside **Right pane** for time-ordered streams:
- Stack of rows; each row = **Avatar** + actor/action text + relative timestamp + optional **Status indicator**
- Group rows under day headings (`Today`, `Yesterday`, dates) separated by **Divider**

**`Key-value group`** — read-only label/value display:
- Section heading (optional)
- Grid of `<label>` / `<value>` pairs (2-column on desktop)
- Labels: caption type token + `--prism-text-muted`
- Values: body type token + `--prism-text`
- State fields use **Status indicator** or **Badges** as the value, never raw text
- Separate groups with **Divider**

**`Key-value strip`** — horizontal variant for compact summaries (L15):
- Single row of `<label>` / `<value>` pairs separated by vertical **Divider**

**`Score banner`** (L16) — composition with **Progress bar**:
- Left: score number (h1) + label
- Right: **Progress bar** + summary text
- Use semantic color tokens (`--prism-success`, `--prism-warning`, `--prism-error`) for the bar fill

**`Checklist group` / `Checklist row`** (L16):
- Group heading + stack of rows
- Each row: label · **Status indicator** (`Pass` · `Fail` · `Warning` · `Not applicable`) · `Modify` **Button**
- Rows separated by **Divider**

**`Benefit list`** (L13, L14) — bulleted value list:
- Stack of rows; each row = leading **Icon** + heading + supporting text
- 3–5 items maximum

**`Branded hero`** (L14):
- Full-width band; integration **Logo** on the left
- Headline (h1) + supporting sentence on the right
- Primary **Button** + optional secondary **Link**

**`Setup step list`** (L14):
- Numbered cards; each card = step number circle + **Icon** + step title + short description + per-step **Button**
- Stack vertically; **Divider** between cards optional

**`Legend`** (L18):
- Inline cluster of **Tag** chips with semantic colors + caption text describing each tag
- Place adjacent to the `Diagram canvas`

**`Variable token panel`** (L21):
- Content of a **Right pane**
- Group heading + **Divider** + scrollable list of **Tag** chips representing available variables
- Each Tag click inserts the token into the **Rich text editor**

**`Icon picker`** (L21):
- Modal popover (use **Modal** size `sm`) containing **Text field** search + scrollable grid of **Icon** components
- Selecting an Icon dismisses the modal

**`Link section`** (L22):
- Section heading + **Divider** + stack of **Link** items
- 3-column page layout: one `Link section` per column

### 8.2 Placeholder recipes for true gaps (replace once Prism ships the component)

**`KPI tile`** *(gap — needs Prism KPIs spec)*:
- Card-shaped container using `--prism-surface` + `--prism-radius`
- Label: caption type + `--prism-text-muted`
- Value: h2 type + `--prism-text`
- Trend: **Status indicator** + signed percentage
- Defer sparkline until Widgets ship

**`Chart card`** *(gap — needs Prism Widgets spec)*:
- Card with title + optional filter Dropdown
- Chart body (donut · bar · gauge · heatmap) inside a fixed-height container
- Empty state: render Prism **Empty state** inside the chart container

**`Catalog card` / `Add tile`** *(gap — needs Prism Cards spec)*:
- Card with **Icon** (top), title, description, primary **Button**
- Selectable variant adds 2px border in `--prism-violet` + check **Icon** overlay
- `Add tile` is the same card with a dashed border and a `+` Icon, no title/description

**`Info card`** *(gap — needs Prism Cards spec)*:
- Card hosted inside **Right pane**
- QR / illustration / heading / supporting Links

**`Stepper`** *(gap — needs Prism Stepper spec)*:
- Horizontal (2–3 steps): numbered circles connected by 1px line; active uses `--prism-violet`, done uses `--prism-success`, pending uses `--prism-text-muted`
- Vertical (≥4 steps): 240px left rail; rows of number circle + step label + sub-label
- Optional **Progress bar** underneath horizontal variant ("Step n of N")

**`Dual-list panel` + `Transfer controls`** *(gap — needs Prism Dual-list spec)*:
- Two side-by-side cards (Available / Selected) with title + **Counter** badge
- Each card: sticky **Text field** search at top, optional **Tab filter** for facets, virtualized list of **Checkbox** rows
- Center column: **Button** group for Add / Remove / Add All / Remove All

**`Map canvas`** *(gap — third-party map wrapper)*:
- Full-bleed map with floating filter bar (composition: **Date picker** + **Dropdown** + **Tab filter**)
- Marker click opens **Right pane** drawer
- "View in Google Maps" **Link** top-right

**`Diagram canvas`** *(gap — needs Prism Diagram spec)*:
- Visual canvas hosting boxes (using **Cards** when available) + connector arrows; or zone-grouped Cards
- Paired with `Legend` pattern

**`Config panel` + `Preview pane`** *(gap — L19 Report Builder spec)*:
- Two-column workspace; left ~35% config (internal **Tab Bar Vertical** for Sub-Module · Type · Columns · Filter), right ~65% preview rendering a sample **Data table**
- Sticky `BuilderFooter` (composition of **Buttons**) at the bottom

**`Canvas` + `Node palette`** *(gap — L20 workflow builder spec)*:
- Dotted-background canvas with a `StartNode` + drop zones
- Right column: `Node palette` of draggable node-type Cards
- Node selection swaps the palette for a **Right pane** node inspector

---

## 9. Generation prompt template (for Claude Code)

```
Generate a page for: <user task>

1. Layout ID: <Lxx from layouts.md>
2. For each slot in the layout's slot table:
   - <Slot>: <Prism component | gap recipe ref> (props: …)
3. Footer actions: <pick from §3 Footer action vocabulary>
4. Tokens: pull from /design-system/tokens.css (--prism-* only)
5. Patterns to apply (from /design-system/foundations/patterns.md):
   - <e.g. Table pattern, Form pattern, Confirmation severity>
6. Constraints: WCAG 2.1 AA, dark mode parity, mobile breakpoint per Prism grid.

Rules:
- Use only components in /design-system/specs/.
- For slots marked as composition patterns, assemble from the §8.1 recipe.
- For slots marked GAP, use the §8.2 placeholder recipe AND add a TODO comment referencing the missing Prism component.
- Do not hardcode color, spacing, radius, type, or elevation.
- Do not invent slots not listed in the layout entry.
- For Confirmation severity Medium / High / Critical, use Confirmation Modal with the documented severity treatment. Use Modal (default) for non-destructive short tasks.
```

---

## 10. Versioning

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-05-18 | Initial taxonomy from 198-screen audit across 15 modules. |
| 1.1 | 2026-05-18 | Reconciled to Prism design system. All slot components now reference Prism component names. Gap recipes (§8) documented for components not yet in Prism. Mapped layouts to Prism's six pattern categories (§2). |
| 1.2 | 2026-05-18 | Folded in latest Prism updates: **Menu** / **Dropdown menu** shipped (Bulk action bar and Filter sidebar are no longer gaps). **Modal** (default) and **Confirmation Modal** both exist (L09 distinguishes purpose). Quick Links is now hosted inside **Right pane** — the standalone Quick links footer is removed from L02, L03, L05. |
| 1.3 | 2026-05-18 | Reclassified composition-style gaps as **composition patterns** (§8): Form section, Form footer, Wizard footer, Score banner, Key-value group, Benefit list, Branded hero, Setup step list, Checklist group, Legend, Variable token panel, Icon picker, Link section, Activity feed. They compose from existing Prism atoms — no new components needed. True remaining component gaps are now only items that need genuinely new visual/interaction work (KPI tile, Chart card, Catalog card/Add tile/Info card, Stepper, Dual-list panel, Map canvas, Diagram canvas, Config panel/Preview pane, Canvas/Node palette). |
