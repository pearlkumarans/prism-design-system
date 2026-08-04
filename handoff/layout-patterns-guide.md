# Layout Patterns — Placement & Maintenance Guide

The contract every Prism layout pattern (L01–L22 in `Layout/layouts.md`) follows.
Patterns are **page templates** that live inside the real app shell; concrete
product screens are built as instances of them.

## 1. File placement

| Artifact | Path | Purpose |
|---|---|---|
| Pattern page | `Layout/views/layout-<slug>.html` | Dual-mode page (standalone + Shell-injectable) |
| Spec | `handoff/layout-l<NN>-<slug>.md` | Handoff: anatomy, slot→component map, tokens, rules |
| Catalog | entry in `Layout/layouts.md` | `Demo:` + `Spec:` links under the L-entry |

Modeled on the existing dual-mode content page `Layout/views/home-dashboard.html`.

## 2. Dual-mode page structure

Each `Layout/views/layout-<slug>.html`:

- Head: `<base href="../">`, `design-system-library/src/styles/index.css`, component imports
  (`import '../design-system-library/src/components/index.js'`), theme-persistence script, sprite globals.
- **`<template id="drawer-fragment">`** — the **content region only**:
  ```
  <div class="lay">                  height:100%, flex column
    <ds-page-header>                 flush to content top/side edges
    <div class="lay__scroll">…</div> flex:1, overflow:auto; 20px inline inset
    <ds-form-footer>…                form patterns only; sticky, flex:none
  </div>
  ```
  plus a scoped `<style>` and the view `<script>` (data, interactions, autofocus).
  **No header/sidebar chrome inside the template** — the Shell supplies it.
- Standalone harness (outside the template): clones `#drawer-fragment` into minimal
  chrome and auto-shows, so the file also opens directly in a browser. The host must
  be **`height: 100vh`** (not `min-height`) so the flex column is height-bound —
  `.lay__scroll` scrolls internally and **`ds-form-footer` stays sticky at the bottom**
  (matches the Shell, where `ds-content` is already height-constrained).
- Registers `window.ShellDrawers.<slug> = { show, hide }`.
- **Sticky footer (all form patterns):** the footer is `flex: none` at the end of the
  height-bound `.lay` column — never inside `.lay__scroll` — so it pins while the
  fields scroll above it.

## 3. Shell router

`Layout/Shell.html` carries a `CONTENT_VIEWS` map:
```js
CONTENT_VIEWS = { '<slug>': { file: 'layout-<slug>', tab: '<module-tab-id>', l2: '<optional-key>' } }
```
On boot (after the ~6s splash) it reads `?view=<slug>`; if known →
`injectDrawer('layout-<slug>','content')`, activates the header tab and applies the
L2 menu (omit `tab` for pages that set their own L2, e.g. settings).
**Usage:** `Shell.html?view=<slug>`.

## 4. Conventions (non-negotiable)

- **Existing `ds-*` components only.** Never invent a CSS class / component / token —
  check `design-system-library/src/components/` first and ask before any new abstraction.
- Action buttons right-aligned, primary rightmost; **Cancel is always `variant="outline"`**.
- Section titles via `ds-section-header` — never ALL-CAPS text.
- Form rows: label column 280px · 40px gap · control (572px cap via `:not([size])`;
  explicit `size` keeps component caps). Stack label above control below ~900px.
- Status → `ds-status-indicator`; links → `ds-text-link` — never raw text/anchors.
- Data tables (`ds-data-table`) use **`row-height="comfortable"`** across all views (it is
  the component default — don't override it with `default`/`compact`).
- Menus near the viewport bottom open upward. First input field focused on load.
- RTL-safe: logical properties only (`inset-inline-*`, `padding-inline-*`).

## 5. Build order per pattern

1. **Spec** — read the L-entry in `layouts.md`; extract measurements/tokens from the
   Figma reference (targeted `page.loadAsync()`; never `loadAllPagesAsync`/component
   search on the big file — they wedge the bridge). Write `handoff/layout-l<NN>-<slug>.md`.
2. **Page** — clone chrome conventions from `views/home-dashboard.html`; build the
   content region with existing `ds-*` components + `--uems-*` tokens.
3. **Register** — add the `CONTENT_VIEWS` line in `Shell.html`; add `Demo:`/`Spec:`
   links to the `layouts.md` entry.
4. **Verify** (localhost, no-cache `serve.py`): standalone
   `/Layout/views/layout-<slug>.html` AND in-shell `/Layout/Shell.html?view=<slug>`
   (wait ≥7s for splash). DOM-measure (header flush, 20px insets), exercise
   interactions, zero console errors, screenshot as proof.

## 6. Known component gaps

Advanced patterns need components Prism doesn't ship yet (`layouts.md` §6): L17 Map,
L18 Topology, L19 Report Builder, L20 Canvas. Each pauses for a decision —
build the component vs. documented placeholder — before that pattern proceeds.
