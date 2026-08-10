---
name: generate-layout
description: Generate a new page/view for the Prism Endpoint-Central shell (Layout/Shell.html) and wire it into the router. Use whenever the user asks to "add a page", "create a layout/view", "new form/list/detail/dashboard page", "make a screen", or wants a new module landing page in the shell. Produces a dual-mode view file grouped by project under projects/<project>/ and registers it in the shared Shell.html so it opens both standalone and injected. For product/domain guidance on what a page should contain or where an Endpoint Central feature lives, use ec-ux first.
---

# Generate a layout page for the Prism shell

This repo is an app **shell** (`Layout/Shell.html`) plus a set of **dual-mode layout
templates** (`Layout/views/layout-*.html`). The shell lazy-injects a view into
`<ds-content>` and drives it through a tiny contract. Your job: produce a new view
file that follows that contract exactly, then register it in the shared router.

Generated pages are grouped by **project/task** under the repo-root `projects/` folder
(`projects/<project>/layout-<slug>.html`) and all run inside the one shared `Layout/Shell.html`.
See `projects/README.md`.

**Read `Layout/layouts.md` first** for the catalogue of existing patterns, and skim the
closest existing view (see archetypes below) — copy its structure rather than inventing.
`projects/demo/` is a worked reference (form → list → detail flow) built to this contract —
copy from it when generating project pages.

## Step 1 — Pick the archetype

Reuse the closest template; don't start from scratch.

| Archetype | File | Use for |
|-----------|------|---------|
| Sectioned form | `layout-sectioned-form.html` | A single scrolling form split into titled sections |
| Tabbed form | `layout-tabbed-form.html` | A form with category tabs (horizontal ≤5 / vertical >5) |
| List view | `layout-list-view.html` | Filterable data-table list (KPIs + filter sidebar + table) |
| List + detail | `layout-list-detail.html` | A record detail/inspector page |
| Module dashboard | `layout-module-dashboard.html` | A module landing page (KPI tiles + charts + widgets) |

> **Full-page list tables:** give the `<ds-data-table>` **`fit-viewport sticky-header`** so
> the table caps to the screen — its body scrolls internally and the pagination footer stays
> visible — instead of the page growing an empty outer scroll. (Do NOT add `fit-viewport` to
> tables **embedded** inside a widget/card/form preview — those should grow with their
> container.)

> **Row action ⋯ menus — open space-aware.** Anchor a `ds-dropdown-menu` to its trigger with
> **`menu.openFrom(triggerEl, { align: 'before', vAlign: 'top' })`** (not manual
> `style.top = rect.bottom`). `align: 'before'` opens it just **left of the ⋯ column** so other
> rows' action icons stay visible; `vAlign: 'top'` lines the panel's top edge up with the icon
> and clamps up near the viewport bottom so it never clips. (Omit `vAlign` for a normal
> drop-below menu that flips above when short on room; `align: 'left'`/default align edges.)

> **Cell renderers — single line only.** Table cells never wrap to a second line or stack a
> secondary description below the primary text. If a cell has supporting info (domain, OS,
> subtitle), put it **inline** after the primary (`Name · detail`, secondary dimmed, truncating
> with an ellipsis) or in a **tooltip** — never a `flex-direction: column` two-line stack. The
> component enforces `white-space: nowrap` on cells; don't fight it with wrapping markup.

> **Page header — always give it a leading icon.** Set **`icon="<name>"`** on `<ds-page-header>`
> so the title gets its grey-tile leading icon (opt out only with `show-icon="false"`). Pick an
> icon that matches the page's subject (e.g. `shield` for BitLocker, `shield-exclamation` for
> vulnerabilities, `calendar` for a schedule, `list` for a list view). Don't leave it iconless —
> the icon is part of the standard header anatomy.

> **Select fields — pick by cardinality (hard rule).**
> - **Single-select → `ds-input-select`** (no `multi`). One value from a list.
> - **Multi-select → `ds-token-field`.** Any field where the user chooses/enters more than one
>   value uses the token field, with the selected values shown as removable tokens.
>
> Do not use `ds-input-select multi` for new fields — multi-value selection is the token field's
> job. (This is a component-choice convention only; don't alter either component's behaviour.)

> **Form fields — consistent helper-row rhythm.** A field that shows a counter/helper (e.g.
> `show-counter counter="0/100"`) is taller than one without, so a stack of fields gets uneven
> gaps (the counter'd field looks roomy, the rest cramped). Reserve the helper-row slot on every
> field so they share one rhythm — the sectioned/tabbed-form archetypes already include this, so
> copy them; if hand-building a field stack, add to the scoped CSS:
> `#<slug>-pop .lay__field { padding-bottom: 20px }` and
> `#<slug>-pop .lay__field:has(ds-field-helper) { padding-bottom: 0 }`. (Full rule:
> `Layout/layouts.md` → "Form section".) This is a form-layout convention — don't bake it into the
> `ds-text-input`/`ds-text-area` components (it would add space in non-form contexts).

> **Badges with an icon — use the built-in `icon` attribute.** For a badge that needs a leading
> icon (risk/severity, status), write **`<ds-badge icon="exclamation-circle" state="critical">Critical</ds-badge>`**
> — the icon renders *inside* the pill and inherits the state colour. Never place a sibling
> `<ds-icon>` next to a `<ds-badge>`; that leaves a gap plus the badge's own padding, so the two
> read as detached. (A row-leading icon that is *not* part of the badge — e.g. a device glyph
> before a name, with a separate status badge elsewhere in the row — is fine.)

> **Cell renderers — status & badge sizing:** when a column's `render` returns a
> `<ds-status-indicator>` or `<ds-badge>`, use **`size="medium"`** — the default for
> data-table column cells; it reads at the right density for table rows. Keep it
> consistent across every badge/status column in the same table.

> **Toasts — never hand-roll a container.** For transient confirmations/errors, call the
> global API — **`globalThis.dsToast.success({ title, description, style: 'subtle' })`** (also
> `.error` / `.warning` / `.info`). It auto-mounts a shared `ds-toaster` and inherits the
> design-system default position (**top-center**). Do NOT create a `position:fixed` div and
> `appendChild` raw `<ds-toast>` elements — that bypasses the global default and pins toasts
> wherever the div sits. `dsToast` is exposed by `toast.js` (imported by the shell), so it
> works from a view's non-module inline script even when injected into the shell.

## Step 2 — Choose the identifiers (get these consistent — common footgun)

Generated pages are grouped by **project/task** under the repo-root `projects/` folder and
run inside the **shared** shell (`Layout/Shell.html`). Ask the user for the **project name**
if it isn't obvious, then pick a **slug** (short kebab-case).

**The slug must describe what the page IS (its purpose), not the archetype it was built
from.** It appears in the URL (`?view=<project>-<slug>`), so it should read meaningfully:
`create-deployment`, `deployments`, `deployment-detail`, `agent-settings` — NOT
`sectioned-form`, `list-view`, `list-detail` (those are template names). The archetype is an
implementation detail; note it in the file's top comment, not the slug.

- **Project**: `<project>` (kebab-case, e.g. `acme` or a task name)
- **File**: `projects/<project>/layout-<slug>.html`
- **Router slug** (key in `CONTENT_VIEWS`): `<project>-<slug>` — **project-prefixed**, because
  slugs are global across the shared shell.
- **`window.ShellDrawers` key**: MUST equal the router slug `<project>-<slug>` — the shell calls
  `window.ShellDrawers[slug].show()`. It is **not** the file name. Registering under the
  file name (or an unprefixed slug) is the #1 reason a new view injects but never shows.
- **Root element id**: `<slug>-pop` (any unique id works; keep it consistent).

(Bare shell views — the built-in `layout-*` templates and drawers — still live in
`Layout/views/` with an unprefixed slug. Everything below is for project pages.)

## Step 3 — Create the dual-mode file

Write the scaffold below (or adapt an existing archetype) to
`projects/<project>/layout-<slug>.html`. A dual-mode file works two ways from one source:

- **Injected** by the shell → `injectDrawer` extracts ONLY `<template id="drawer-fragment">`
  (the `<head>` is discarded, so folder depth doesn't matter in injected mode).
- **Opened directly** in a browser → the standalone harness at the bottom mounts + shows it
  (the `<head>` paths below are set for the `projects/<project>/` depth — two levels below
  the repo root, hence `../../`).

```html
<!DOCTYPE html>
<!-- <TITLE> · DUAL-MODE file (projects/<project>/).
     Open directly -> standalone harness (bottom) mounts it.
     Fetched by Shell.html -> injectDrawer('../projects/<project>/layout-<slug>','content'). -->
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="../../" />                                <!-- projects/<project>/ -> repo root -->
  <link rel="stylesheet" href="design-system-library/src/styles/index.css" />
  <link rel="stylesheet" href="Layout/layout-base.css" />   <!-- shared .lay-root/.lay/.lay__scroll scaffold (standalone mode; Shell.html loads it for injected mode) -->
  <script type="module">import './design-system-library/src/components/index.js';</script>
  <script>
    window.UEMS_ICON_SPRITE = 'design-system-library/src/icons/icons.svg';
    window.UEMS_ILLUSTRATION_SPRITE = 'design-system-library/src/icons/illustrations.svg';
    window.UEMS_LOGO_BASE = 'design-system-library/src/icons/logos';
    (function () { var t = 'light'; try { t = localStorage.getItem('uems-theme') || 'light'; } catch (_) {} document.documentElement.setAttribute('data-theme', t); })();
  </script>
  <style>
    html, body { height: 100%; margin: 0; font-family: var(--font-family-sans); background: var(--uems-bg-primary); }
    .sa-host { display: flex; flex-direction: column; height: 100vh; }
  </style>
</head>
<body>

<template id="drawer-fragment">
<style>
/* The root + .lay + .lay__scroll scaffold comes from Layout/layout-base.css (shared),
   applied via class="lay-root" on the root below — do NOT redefine it here.
   Scope every VIEW-SPECIFIC selector to the root id so it can't leak to sibling views. */
</style>

<div id="<slug>-pop" class="lay-root" hidden>
  <div class="lay">
    <ds-page-header id="<slug>-ph" structure="default"
      title="<Page title>" description="<Short description>"
      show-description show-breadcrumbs
      collapse-on-scroll scroll-target=".lay__scroll"></ds-page-header>
    <div class="lay__scroll">
      <!-- Body: compose with ds-* components + design tokens only. -->
    </div>
  </div>
</div>

<script>
(function () {
  const root = document.getElementById('<slug>-pop');
  if (!root || root.__init) return; root.__init = true;
  /* Scope EVERY query to root — never document.querySelector. Multiple views
     share the DOM and class names (e.g. .lay__scroll), so a global query grabs
     the wrong (often hidden) view's element. */
  const $ = (id) => root.querySelector('#' + id);

  /* …feed components, wire events here… */

  function show() { root.hidden = false; }
  function hide() { root.hidden = true; }
  window.ShellDrawers = window.ShellDrawers || {};
  window.ShellDrawers['<project>-<slug>'] = { show, hide };   // key MUST equal the router slug
})();
</script>
</template>

<script>
/* == STANDALONE HARNESS — runs ONLY when opened directly. == */
(function () {
  const host = document.createElement('div'); host.className = 'sa-host'; document.body.appendChild(host);
  window.ShellDrawers = window.ShellDrawers || {};
  const frag = document.getElementById('drawer-fragment').content.cloneNode(true);
  frag.querySelectorAll('style').forEach((s) => document.head.appendChild(s));
  const scripts = [...frag.querySelectorAll('script')]; scripts.forEach((s) => s.remove());
  host.appendChild(frag);
  scripts.forEach((o) => { const s = document.createElement('script'); if (o.type) s.type = o.type; s.textContent = o.textContent; document.body.appendChild(s); });
  const open = () => window.ShellDrawers['<project>-<slug>'] && window.ShellDrawers['<project>-<slug>'].show();
  requestAnimationFrame(() => requestAnimationFrame(open));
})();
</script>
</body>
</html>
```

## Step 4 — Register in the shared router (`Layout/Shell.html`)

Add one line to `CONTENT_VIEWS` (search for `const CONTENT_VIEWS`). For a project page the
`file` is a path **relative to `Shell.html`** (in `Layout/`), so `../projects/...` reaches
the repo-root folder — the router's `injectDrawer` treats any `file` with a `/` as a path:

```js
'<project>-<slug>': { file: '../projects/<project>/layout-<slug>', tab: '<module-tab-id>' },
```

`tab` sets the module context (header tab + L1/L2 nav) when the view opens. Valid tab ids
are in the `TABS.en` array (e.g. `home`, `configs`, `tp`, `sd`, `inv`, `osd`, `reports`…).

If the view is a **module's landing page** (opens automatically when its tab is selected),
also add it to `TAB_DEFAULT_VIEW`:

```js
const TAB_DEFAULT_VIEW = { home: 'module-dashboard', '<module-tab-id>': '<project>-<slug>' };
```

To let another view navigate into this one, call `window.openContentView('<project>-<slug>')`
(e.g. a form's Save → `window.openContentView('acme-device-list')`).

## Step 4b — Wire the nav so the page is reachable (do this BY DEFAULT)

Registering the view (Step 4) makes it *routable*, not *reachable* — a user still can't get to
it by clicking. Unless the page is only ever opened programmatically from another view, complete
**both** of these so the left nav (L1/L2) and breadcrumb actually navigate. The shell already has
the generic plumbing (a `ds-sidebar-l2-select` handler that calls `openView(item.view)`, and
`syncL2Active(slug)` that highlights the matching item on open) — so per page you only add the
data + the breadcrumb interceptor.

**1) Left nav — add a `view:` on the matching L2 item** in `design-system-library/src/data/ec-menus.js`. Find the
module's entry in `EC_TAB_L2_MENUS` (keyed by tab id) and give the item that represents this page
a `view` equal to the router slug. Mark `active: true` on the item that is the tab's landing view.
Don't rename or delete existing product menu items to fit a page — add `view` to the closest one,
or add a new item; leave real-product items intact even if their page isn't built yet (placeholder,
no `view`).

```js
{ id: 'managed-computers', label: 'Managed Computers', view: '<project>-<slug>', active: true },
```

**2) Breadcrumb — real hrefs + a scoped click interceptor.** Set each parent crumb's `href` to the
target's standalone file (so direct-open still works), and intercept clicks on the page-header to
route through the shell. Derive the slug from the filename so one handler covers every crumb:

```js
const crumbNav = (e) => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  const m = (a.getAttribute('href') || '').match(/layout-([a-z-]+)\.html/);
  if (m && window.openContentView) { e.preventDefault(); window.openContentView('<project>-' + m[1]); }
};
ph.addEventListener('click', crumbNav);
ph.breadcrumbs = [
  { label: '<Module>', href: 'projects/<project>/layout-<landing-slug>.html' },
  { label: '<This page>' },   // current crumb: no href
];
```

> ⚠️ In `syncL2Active`-style code and anywhere you touch `EC_TAB_L2_MENUS`, **clone before you
> mutate** — the menu object is shared across every tab switch; mutating it in place corrupts the
> active state on later navigations.

> Module-cache gotcha when verifying: browsers hard-cache ES modules, so after editing
> `ec-menus.js` a plain reload keeps the old menu — load from a different port (or hard-reload with
> cache disabled) to pick up the change.

### Point products (`?product=`)

The shell hosts **Endpoint Central** by default, but the same shell reskins as a **point
product** (Patch Manager Plus, Mobile Device Manager Plus, …) via `?product=<id>`. A product
profile lives in the `PRODUCTS` registry in `Shell.html` — it picks the header `variant` (which
swaps the logo + product name), filters the nav to the product's module subset, and sets a
landing view. Current ids: `ec` (default), `pmp`, `vmp`, `mdm`, `bsp`, `acp`, `dcp`.

When the user asks to design **for a specific product** (e.g. "make an MDM enrolled-devices
page"):
1. Register the view in `CONTENT_VIEWS` as usual, with a `tab` that belongs to that product's
   `tabs` subset (check the product's row in `PRODUCTS`).
2. The page's URL is **`Shell.html?product=<id>&view=<project>-<slug>`** — always report it with
   the `product` param so it opens in that product's branded shell.
3. If the target product isn't in `PRODUCTS` yet, add one row:
   `xyz: { variant: '<header-variant>', name: '<Product Name>', tabs: ['home', …], defaultView: '<slug>' }`
   (`variant` must be one of ds-header-nav's product variants — a matching logo lives in
   `design-system-library/src/icons/logos/<variant>.svg`).

Omit `?product=` for plain Endpoint Central pages — nothing changes for the EC case.

## Step 5 — Hard rules (enforce these)

- **Our components + tokens only — including from a screenshot.** Build only from `ds-*` /
  Prism components and `--uems-*` / design-system tokens. No hardcoded hex, px, fonts, radii, or
  shadows where a token exists, and no hand-rolled bespoke markup/CSS to mimic a design. When the
  input is a screenshot / Figma / image, reproduce its *intent* with existing components + tokens,
  not by pixel-matching.
- **Reuse before you build; new components need confirmation.** Before adding anything, find the
  closest existing component (scan `design-system-library/src/components/` and the root `*.html` demos) and adapt it
  via props/slots + tokens. Only if nothing fits *at all* may you propose a new component — and you
  MUST get explicit user confirmation first (say what you checked, why it doesn't fit, what you'd
  build). Once approved, build it to a standard global component anatomy using design-system tokens
  only, matching the existing `ds-*` conventions.
- **Content inside a widget/card must be a component that owns its padding — never a hand-rolled
  list.** `ds-widget__body` (and card bodies) have **zero horizontal padding by design**: the body
  expects a DS component to supply its own inset — `ds-description-list`, `ds-data-table`,
  `ds-chart`. Do **not** drop a bespoke `<div class="my-rows">…</div>` into a widget and hand-tune
  `padding`/`border`/icon-chips to fake the layout. That only looks right until the viewport or a
  sibling token shifts — then icons/badges touch the border, or the hand-rolled rows misalign with
  the real component beside them (this is the #1 source of "icon/badge touches the border" and
  "rows don't line up" bugs). Two obligations: **(a)** set the widget's **`type`** to match its
  content (`type="list"` for a definition/label list, `type="table"` for a table, `type="chart"`
  for a chart — the default is `chart`, which is edge-to-edge); **(b)** render the content with a
  component (an icon + label + status-badge row list → `ds-description-list` with a `status`/badge
  cell, or a borderless `ds-data-table`). If genuinely no component fits, that's a
  **propose-a-component** moment (needs confirmation) — not a `<div>` with custom CSS.
- **Every icon name must exist in the sprite — validate before writing.** `ds-icon` and any
  `icon=`/`prefix-icon=`/`suffix-icon=` prop render an **empty, silent box** for a name that isn't
  in `design-system-library/src/icons/icons.svg` — no console error, no fallback glyph. Before writing the file,
  grep the sprite and confirm each icon name has a matching `id="icon-<name>"`
  (`grep -o 'id="icon-[^"]*"' design-system-library/src/icons/icons.svg`). Never guess plausible-sounding names
  (`tpm`, `cpu_chip`, `encryption`) — a name that "should" exist often doesn't. Re-confirm in the
  browser (Step 6) that no icon rendered at 0×0.
- **Scope every DOM query to `root`.** Never `document.querySelector` inside a view — sibling
  views share the DOM. This applies to `scroll-target` too (already handled by the
  page-header component, which resolves scoped-first).
- **Scope every CSS selector to the root id — this is the #1 cross-page bug.** Injected views
  share **one `document.head`**; every view's `<style>` stays there permanently, so an unscoped
  class rule (`.grid`, `.cell-muted`, `.kpis`) from one page **overrides the same class on every
  other page**, and the last-injected view wins. Two symptoms: a list page's table suddenly renders
  in a 6-column grid (a detail page's `.grid` leaked in), or spacing/colors change after visiting a
  sibling view. Prevent it: write **every** selector as `#<slug>-pop .thing { … }` (media queries
  too) — never a bare `.thing {}`. A shared prefix across your own project pages (`.bl-grid` in
  three BitLocker pages) does NOT isolate them; only the root-id prefix does. Verify by navigating
  A → B → back to A and confirming A's layout is unchanged. **Exception:** the shared scaffold
  (`.lay-root`, `.lay`, `.lay__scroll`) lives once in `Layout/layout-base.css` and is intentionally
  global — don't redefine those classes per view; only *extend* them scoped (e.g.
  `#<slug>-pop .lay__scroll { gap: 16px }`).
- **All filters live in one filter surface — never loose beside the table.** Every facet
  control (date-range picker, category dropdown, status toggle, custom-group picker) goes inside
  the page's single filter surface — the **Tab filter** chips, the left **Filter sidebar**, or
  `ds-filter-panel` (a date range = a `daterange` group). Do NOT float individual filter controls
  in the content area above/beside the table. The search **Text field** is the only exception (it
  sits above the table and isn't a filter). If filters are primary to the task, **default the
  filter panel/sidebar to open** rather than scattering controls to make them reachable. (Full
  rule: `Layout/layouts.md` → "Filter placement".)
- **Sentence case, never ALL CAPS.** Every title, heading, section/group label, button, tab,
  and KPI label is sentence case ("Event type", not "EVENT TYPE" or "Event Type"). Never use
  `text-transform: uppercase` in a view's CSS, and author labels in their final casing rather than
  transforming them. Title Case only for proper nouns / product-module names. (Full rule:
  `Layout/layouts.md` → "Casing".)
- **Form fields — built-in label, left + medium defaults, uniform 20px spacing.** Give every field
  its label via the component's own `label` attribute; never hand-roll a caption beside a field set
  to `label-position="none"`. Do **not** set `label-position` or `size` at all — the native defaults
  (`left`, `medium`) are what you want, and every Prism form field (incl. `ds-button-group` via
  `label-position="left"`) shares a 280px left-label column (stacks < 520px) so labels align across a
  mixed form. Use `required` for the `*`. Dates/times use `ds-date-picker` / `ds-time-picker` — never
  a text field with a date/time placeholder. **Spacing:** lay fields in a flex column with a single
  uniform `gap: 20px` — never reserve an empty helper-row slot (no `padding-bottom`/`:has` trick);
  empty `ds-field-helper`s self-collapse, so a field with a note keeps it inside its box and still
  gets the same 20px gap to the next field. Applies to every form page and modal form. (Full rule:
  `Layout/layouts.md` → "Form fields" / "Field spacing".)
- **No breadcrumb on dashboards or first-level nav pages.** A page that is a module dashboard,
  or the landing view opened directly by a primary nav tab (its `TAB_DEFAULT_VIEW` in `Shell.html`),
  is top-level — omit `show-breadcrumbs` on its `ds-page-header` and don't set `.breadcrumbs`. Add
  breadcrumbs only on drill-down pages (detail, summary, editors, wizards, sub-pages) that have a
  parent to climb back to. (Full rule: `Layout/layouts.md` → "Breadcrumbs".)
- **Slide-in panels animate the space they occupy — never `display:none` + a token transform.**
  Any panel that pushes the layout when it opens (side drawer, filter sidebar, inspector, chat pane)
  must animate its **occupied width** so the content reflows *in lockstep* — otherwise the column
  appears in one frame (a hard content snap) while the panel glides a few pixels, which reads as
  jank. Two correct patterns: **(a) grid-column reveal** — transition the parent's
  `grid-template-columns` between `0px` and the open width (`260ms`), exactly like the L03 list-view
  filter sidebar (copy it); or **(b) flex-item width reveal** — collapse with
  `width:0; overflow:hidden; opacity:0; visibility:hidden; pointer-events:none` (NOT `display:none`)
  and transition `width` + logical `margin-inline-start` + `opacity` to the open state, pinning the
  panel's inner sections to the open width (`> * { width:<W>; flex-shrink:0 }`) so they don't re-wrap
  mid-animation. Use logical properties (RTL-safe) and gate on
  `@media (prefers-reduced-motion: reduce) { transition:none }`. (Full rule: `Layout/layouts.md` →
  "Panel slide-in animation"; reference impl: `Layout/views/ask-zia.html`.)
- **Localize every user-facing string through `ShellCtx.t()` — don't hardcode English.**
  The shell flips to Arabic by setting `dir="rtl"` (layout mirrors via logical CSS) **and** firing
  `shell:langchange`. Direction alone isn't localization — a page with inline English strings shows
  a mirrored layout with English text. So: register the page's dictionary once with
  `window.ShellCtx.addMessages({ en, ar })`, resolve every label/title/button/column-header/
  chart-category/badge/toast via `window.ShellCtx.t(key)`, put all string-setting in one
  `applyStrings()`, and re-run it on `ShellCtx.onLangChange(applyStrings)`. Keep **data/filter
  values canonical English** (translate only the display label — never the value you filter on),
  fall back to the local `en` map when standalone, leave proper nouns/product names untranslated,
  and flag machine-translated Arabic for native review. Scaffold:
  ```js
  const MSGS = { en: { 'x.title': 'Title', /* … */ }, ar: { 'x.title': '…' /* review */ } };
  if (window.ShellCtx && window.ShellCtx.addMessages) window.ShellCtx.addMessages(MSGS);
  const t = (k) => (window.ShellCtx && window.ShellCtx.t) ? window.ShellCtx.t(k) : (MSGS.en[k] ?? k);
  function applyStrings() {
    ph.setAttribute('title', t('x.title'));                 // header/labels via setAttribute (observed → re-renders)
    table.columns = [{ id:'s', header:t('x.col.status'), render:(r)=>badge(t(STATUS_KEY[r.status])) }]; // value r.status stays English
    setChart('c', { categories:[t('x.cat.a')], series:[{ name:t('x.s.n'), values:[…] }] });
  }
  applyStrings();
  if (window.ShellCtx && window.ShellCtx.onLangChange) window.ShellCtx.onLangChange(() => { applyStrings(); /* charts: refit */ });
  ```
  (Full rule: `Layout/layouts.md` → "Localization"; reference impls: `projects/bitlocker/layout-*.html`.)
- **Toggle = setting-name label + the switch; never a verb phrase or sentence as inline text.**
  A `ds-toggle` is a binary control whose state is shown by the switch (thumb position + colour),
  not by words. Name the *setting* with a **separate field label** beside it — a concise noun
  phrase that stays the same on/off ("Drive encryption", "Recovery-key rotation") — and if the
  behaviour needs explaining, put it in a **helper line under the field**, not on the switch. Do
  **not** turn on `show-text` with a verb phrase / instruction / sentence ("Encrypt on deploy",
  "Back up to Active Directory"): it reads like a button, and this toggle's in-track text is
  *static* (doesn't flip with state), so it misleads when off. `show-text` is only for a short,
  static word like the default "Enable". Give the bare switch an `label="<setting name>"` for its
  accessible name. (Full rule: `design-system-library/src/components/toggle/toggle.md` → "Label guidance".)
- **The scroll area (`.lay__scroll`) must be `position: relative` — or a pinned footer scrolls.**
  Form controls render visually-hidden internals with `position: absolute` (ds-radio's/
  ds-toggle's native input, popovers). If your `overflow:auto` scroll area is NOT a positioning
  context, those absolute internals resolve their containing block to **`ds-content`** (the shell
  scroller, which is `position:relative`), escape the scroll area's clipping, and inflate
  `ds-content`'s `scrollHeight`. Then `ds-content` itself scrolls — dragging a "pinned"
  `ds-form-footer` up with it (the footer only stays put because `.lay__scroll` scrolls
  internally while `.lay`/`ds-content` don't). It's height-triggered, so short forms hide it and
  tall ones expose it. Fix: **`.lay__scroll { position: relative }`** — this already ships in
  `Layout/layout-base.css`, so a page built on `.lay-root` + `.lay__scroll` gets it for free. Only
  re-add it if you introduce a *different* `overflow:auto` scroll area that holds form controls.
  Verify by scrolling and confirming `ds-content.scrollHeight === ds-content.clientHeight` (no
  phantom scroll).
- **Register `ShellDrawers` under the router slug**, not the file name.
- **One root, `hidden` by default.** The shell toggles it via `show()`/`hide()`.
- Talk to the shell only through `window.ShellCtx` (lang, theme, dir, nav mode, `content`)
  and expose the view via `window.ShellDrawers[slug]`.

## Step 6 — Verify

1. Serve the repo root (e.g. `python3 -m http.server 8790`) — `fetch()` needs http, not `file://`.
2. Standalone: open `http://localhost:8790/projects/<project>/layout-<slug>.html`.
3. Injected: open `http://localhost:8790/Layout/Shell.html?view=<project>-<slug>` and confirm the
   page renders inside the shell, the correct tab is active, and (if applicable) collapse-on-scroll works.
4. If it injects but stays blank, check the `ShellDrawers` key matches the router slug `<project>-<slug>` (Step 2).
5. **Icons resolved — no silent empties.** In the injected view, confirm every icon actually
   drew. A name missing from the sprite renders a 0×0 `<svg>` (the empty-box bug). Run in the
   console — an empty array is a pass; any name listed is missing from `icons.svg` and must be
   corrected. The `offsetParent` filter is required: it skips icons in hidden tabs/facets (a
   `hidden`/`display:none` element measures 0×0 and would otherwise false-positive). To cover
   icons in a collapsed tab/panel, open it and re-run:
   ```js
   [...document.querySelectorAll('#<slug>-pop ds-icon')]
     .filter(i => i.offsetParent !== null)                         // skip hidden tabs/facets
     .filter(i => { const r = i.querySelector('svg')?.getBoundingClientRect(); return !r || r.width === 0; })
     .map(i => i.getAttribute('name'))
   ```
6. **Spacing/alignment — content never touches a card/widget border, and sibling blocks share one
   inset.** Don't eyeball a screenshot — measure. **Measure the leaf content** (the visible text /
   icon), *not* the wrapper: a DS component fills the widget body and pads *internally*, so its
   element edge reads ~flush with the card (≈1px) even when the content is correctly inset —
   measuring wrappers gives false "touching" readings. For each visible card, take the leading
   content column's start edge (left in LTR, right in RTL) and confirm it's inset from the card
   edge by the content-padding token (≈16px) and that every card shares the same inset. A leading
   edge flush to the border, or one card out of line with the others, is the hand-tuned-padding
   smell from a bespoke element (Step 5) — fix by switching to a component + the right widget
   `type`, not by nudging a pixel value. Check in **both** LTR and RTL, and re-check after resizing
   narrower (the touch/misalign often only appears at some widths):
   ```js
   const rtl = document.documentElement.dir === 'rtl';
   const startEdge = el => { const r = el.getBoundingClientRect(); return Math.round(rtl ? r.right : r.left); };
   [...document.querySelectorAll('#<slug>-pop .ds-widget__surface')]
     .filter(card => card.offsetParent !== null)                   // visible cards only
     .map(card => {
       const leaves = [...card.querySelectorAll('.ds-widget__body *')].filter(el =>
         el.offsetParent !== null && !el.children.length && (el.textContent.trim() || el.tagName === 'DS-ICON'));
       const starts = [...new Set(leaves.map(startEdge))].sort((a, b) => rtl ? b - a : a - b);
       return { cardEdge: startEdge(card), leadingContentStart: starts[0], insetFromEdge: Math.abs(startEdge(card) - starts[0]) };
     });
   // PASS: every card's insetFromEdge ≈ the padding token (≈16px) and equal across cards.
   // FAIL: insetFromEdge ≈ 0 (touches border) or differs card-to-card (misaligned bespoke block).
   ```
